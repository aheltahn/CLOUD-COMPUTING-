import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { reduceInventory, increaseInventory } from './inventory.controller.js';
import Payment from '../models/payment.model.js';

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

// Helper function để xử lý đường dẫn hình ảnh
const processImagePath = (imagePath) => {
    if (!imagePath) return '/placeholder-product.jpg';

    // Chuyển đổi backslash thành forward slash
    let processedPath = imagePath.replace(/\\/g, '/');

    // Đảm bảo có '/' ở đầu nếu chưa có
    if (!processedPath.startsWith('/') && !processedPath.startsWith('http')) {
        processedPath = '/' + processedPath;
    }

    return processedPath;
};

// Tạo đơn hàng mới
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            shippingFee = 0,
            discountAmount = 0,
            notes = "",
        } = req.body;

        // Validate required fields
        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Giỏ hàng trống",
            });
        }

        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin giao hàng",
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn phương thức thanh toán",
            });
        }

        // Prepare order items and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy sản phẩm ${item.productId}`,
                });
            }

            // Check if product has variants
            if (product.variants && product.variants.length > 0) {
                // Product with variants - need color and size
                if (!item.color || !item.size) {
                    return res.status(400).json({
                        success: false,
                        message: `Vui lòng chọn màu sắc và kích thước cho sản phẩm ${product.productName}`,
                    });
                }

                // Find the specific variant
                const variantIndex = product.variants.findIndex(
                    (v) => v.color === item.color && v.size === item.size
                );

                if (variantIndex === -1) {
                    return res.status(400).json({
                        success: false,
                        message: `Không tìm thấy phiên bản ${item.color} - ${item.size} của sản phẩm ${product.productName}`,
                    });
                }

                const variant = product.variants[variantIndex];

                // Check inventory
                if (variant.inventory < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm ${product.productName} (${item.color} - ${item.size}) chỉ còn ${variant.inventory} sản phẩm`,
                    });
                }

                // Update inventory
                product.variants[variantIndex].inventory -= item.quantity;
                await product.save();

                // Add to order items with variant info
                orderItems.push({
                    productId: product._id,
                    productName: product.productName,
                    price: product.price,
                    quantity: item.quantity,
                    variant: {
                        color: item.color,
                        size: item.size
                    },
                    image: product.image || item.image,
                });
            } else {
                // Product without variants - use main inventory
                if (product.inventory < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Sản phẩm ${product.productName} chỉ còn ${product.inventory} sản phẩm`,
                    });
                }

                // Update inventory
                product.inventory -= item.quantity;
                await product.save();

                // Add to order items without variant info
                orderItems.push({
                    productId: product._id,
                    productName: product.productName,
                    price: product.price,
                    quantity: item.quantity,
                    image: product.image || item.image,
                });
            }

            totalAmount += product.price * item.quantity;
        }

        // Calculate final amount
        const finalAmount = totalAmount + shippingFee - discountAmount;

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Create order với cấu trúc phù hợp với schema
        const order = new Order({
            orderNumber,
            customerId: req.user._id, // Changed from userId to customerId
            customerInfo: {
                name: req.user.name || shippingAddress.fullName,
                email: req.user.email
            },
            items: orderItems,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'processing',
            totalAmount,
            shippingFee,
            discountAmount,
            finalAmount,
            notes,
            status: "pending",
            statusHistory: [{
                status: "pending",
                timestamp: new Date(),
                note: "Order created",
                updatedBy: req.user._id
            }]
        });

        await order.save();

        // Create payment record
        const payment = new Payment({
            orderId: order._id,
            userId: req.user._id,
            amount: finalAmount,
            currency: 'VND',
            paymentMethod: paymentMethod || 'cod',
            transactionId: Payment.generateTransactionId(),
            status: paymentMethod === 'cod' ? 'pending' : 'processing',
            description: `Thanh toán cho đơn hàng ${orderNumber}`,
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            }
        });

        await payment.save();

        // Simulate payment processing for non-COD
        if (paymentMethod !== 'cod') {
            setTimeout(async () => {
                try {
                    const isSuccess = Math.random() > 0.1; // 90% success rate

                    if (isSuccess) {
                        payment.status = 'completed';
                        payment.processedAt = new Date();
                        order.paymentStatus = 'paid';
                    } else {
                        payment.status = 'failed';
                        payment.failureReason = 'Insufficient funds';
                        order.paymentStatus = 'failed';
                    }

                    await payment.save();
                    await order.save();
                } catch (error) {
                    console.error('Error processing payment:', error);
                }
            }, 3000);
        }

        res.status(201).json({
            success: true,
            message: "Đặt hàng thành công",
            order,
            paymentId: payment._id
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Không thể tạo đơn hàng",
            error: error.message,
        });
    }
};

// Lấy danh sách đơn hàng (Admin)
export const getOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = '',
            paymentStatus = '',
            search = '',
            sortBy = 'newest',
            startDate = '',
            endDate = ''
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (paymentStatus && paymentStatus !== 'all') {
            filter.paymentStatus = paymentStatus;
        }

        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customerInfo.name': { $regex: search, $options: 'i' } },
                { 'customerInfo.email': { $regex: search, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        let sort = {};
        switch (sortBy) {
            case 'oldest':
                sort.createdAt = 1;
                break;
            case 'amount_asc':
                sort.finalAmount = 1;
                break;
            case 'amount_desc':
                sort.finalAmount = -1;
                break;
            case 'newest':
            default:
                sort.createdAt = -1;
                break;
        }

        const orders = await Order
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('customerId', 'name email')
            .populate('items.productId', 'productName image');

        // Xử lý hình ảnh cho orders
        const processedOrders = orders.map(order => ({
            ...order.toObject(),
            items: order.items.map(item => ({
                ...item,
                image: processImagePath(item.productId?.image || item.image)
            }))
        }));

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limitNum);

        res.json({
            orders: processedOrders,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalOrders,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (req, res) => {
    try {
        const order = await Order
            .findById(req.params.id)
            .populate('customerId', 'name email')
            .populate('items.productId', 'productName image inventory status')
            .populate('statusHistory.updatedBy', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Xử lý hình ảnh cho order detail
        const processedOrder = {
            ...order.toObject(),
            items: order.items.map(item => ({
                ...item,
                image: processImagePath(item.productId?.image || item.image)
            }))
        };

        res.json(processedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái đơn hàng (Admin only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Trạng thái không hợp lệ",
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng",
            });
        }

        // Update order status
        order.status = status;

        // Update payment status based on order status
        if (status === 'delivered') {
            order.paymentStatus = 'paid';

            // Update payment record
            const payment = await Payment.findOne({ orderId: order._id });
            if (payment && payment.paymentMethod === 'cod') {
                payment.status = 'completed';
                payment.processedAt = new Date();
                await payment.save();
            }
        } else if (status === 'cancelled') {
            // Update payment record
            const payment = await Payment.findOne({ orderId: order._id });
            if (payment && payment.status === 'pending') {
                payment.status = 'failed';
                payment.failureReason = 'Order cancelled';
                await payment.save();
            }
        }

        // Handle inventory for cancelled orders
        if (status === "cancelled" && order.status !== "cancelled") {
            // Return items to inventory
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    // Find the variant
                    const variantIndex = product.variants.findIndex(
                        v => v.color === item.color && v.size === item.size
                    );

                    if (variantIndex !== -1) {
                        product.variants[variantIndex].inventory += item.quantity;
                        await product.save();
                    }
                }
            }
        }

        await order.save();

        res.json({
            success: true,
            message: "Cập nhật trạng thái đơn hàng thành công",
            order,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            success: false,
            message: "Không thể cập nhật trạng thái đơn hàng",
            error: error.message,
        });
    }
};

// Cập nhật trạng thái thanh toán (Admin only)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, note = '' } = req.body;
        const orderId = req.params.id;

        if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.paymentStatus = paymentStatus;
        order.statusHistory.push({
            status: `payment_${paymentStatus}`,
            timestamp: new Date(),
            note: note || `Payment status changed to ${paymentStatus}`,
            updatedBy: req.userId
        });

        await order.save();

        res.json({
            message: 'Payment status updated successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy đơn hàng của customer (User only) - Phiên bản đã cập nhật hoàn toàn
export const getCustomerOrders = async (req, res) => {
    try {
        const customerId = req.userId;
        const { page = 1, limit = 10, status = '' } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let filter = { customerId };
        if (status && status !== 'all') {
            filter.status = status;
        }

        const orders = await Order
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate({
                path: 'items.productId',
                select: 'productName image',
                match: { _id: { $exists: true } }
            })
            .lean();

        // Xử lý các mục không có productId hợp lệ và chuẩn hóa đường dẫn hình ảnh
        const sanitizedOrders = orders.map(order => ({
            ...order,
            items: order.items.map(item => {
                // Xử lý hình ảnh từ nhiều nguồn với thứ tự ưu tiên
                let finalImage = '/placeholder-product.jpg';

                // Ưu tiên hình ảnh từ populate (productId) - nếu sản phẩm vẫn tồn tại
                if (item.productId?.image) {
                    finalImage = processImagePath(item.productId.image);
                }
                // Sau đó từ item.image (được lưu khi tạo order)
                else if (item.image) {
                    finalImage = processImagePath(item.image);
                }

                // Tên sản phẩm với thứ tự ưu tiên tương tự
                const productName = item.productId?.productName ||
                    item.productName ||
                    'Sản phẩm không xác định';

                return {
                    ...item,
                    // Cập nhật image path đã xử lý
                    image: finalImage,
                    // Thông tin sản phẩm để tương thích với frontend
                    product: {
                        productName: productName,
                        image: finalImage
                    },
                    // Đảm bảo có productName ở level item
                    productName: productName
                };
            })
        }));

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limitNum);

        // Log để debug
        console.log(`Returning ${sanitizedOrders.length} orders for customer ${customerId}`);
        if (sanitizedOrders.length > 0) {
            console.log('Sample order item image paths:',
                sanitizedOrders[0].items.map(item => ({
                    productName: item.productName,
                    image: item.image,
                    hasProductId: !!item.productId
                }))
            );
        }

        res.json({
            orders: sanitizedOrders,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalOrders,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// Hủy đơn hàng (Customer only, chỉ khi pending)
export const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const customerId = req.userId;
        const { reason = '' } = req.body;

        const order = await Order.findOne({ _id: orderId, customerId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Can only cancel pending orders' });
        }

        // Hoàn trả inventory
        for (const item of order.items) {
            await increaseInventory(item.productId, item.quantity);
        }

        order.status = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: reason || 'Cancelled by customer'
        });

        await order.save();

        res.json({
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get order statistics (Admin only)
export const getOrderStats = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const stats = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$finalAmount' } } }
        ]);

        const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });
        const totalRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);

        res.json({
            period: `${period} days`,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            statusBreakdown: stats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

