import Payment from '../models/payment.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';

// Lấy danh sách tất cả payments với filters
export const getPayments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            paymentMethod = '',
            dateFrom = '',
            dateTo = '',
            sortBy = 'newest'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        let filter = {};

        // Search by transaction ID or order ID
        if (search) {
            filter.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Filter by payment method
        if (paymentMethod && paymentMethod !== 'all') {
            filter.paymentMethod = paymentMethod;
        }

        // Filter by date range
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
        }

        // Build sort
        let sort = {};
        switch (sortBy) {
            case 'amount_asc':
                sort.amount = 1;
                break;
            case 'amount_desc':
                sort.amount = -1;
                break;
            case 'oldest':
                sort.createdAt = 1;
                break;
            case 'newest':
            default:
                sort.createdAt = -1;
                break;
        }

        // Execute query
        const payments = await Payment
            .find(filter)
            .populate('userId', 'name email')
            .populate('orderId', 'orderNumber')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const totalPayments = await Payment.countDocuments(filter);
        const totalPages = Math.ceil(totalPayments / limitNum);

        // Get statistics
        const stats = await Payment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    totalRefunded: { $sum: '$refundAmount' },
                    completedAmount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'completed'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    pendingAmount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'pending'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    failedAmount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'failed'] },
                                '$amount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            payments,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalPayments,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            },
            stats: stats[0] || {
                totalAmount: 0,
                totalRefunded: 0,
                completedAmount: 0,
                pendingAmount: 0,
                failedAmount: 0
            }
        });
    } catch (error) {
        console.error('Error getting payments:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách thanh toán',
            error: error.message
        });
    }
};

// Lấy chi tiết một payment
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const payment = await Payment
            .findById(id)
            .populate('userId', 'name email')
            .populate({
                path: 'orderId',
                populate: {
                    path: 'items.productId',
                    select: 'productName price image'
                }
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch thanh toán'
            });
        }

        res.json({
            success: true,
            payment
        });
    } catch (error) {
        console.error('Error getting payment by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin thanh toán',
            error: error.message
        });
    }
};

// Process refund
export const processRefund = async (req, res) => {
    try {
        const { id } = req.params;
        const { refundAmount, reason } = req.body;

        if (!refundAmount || refundAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền hoàn trả không hợp lệ'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập lý do hoàn tiền'
            });
        }

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch thanh toán'
            });
        }

        // Process refund
        await payment.processRefund(refundAmount, reason);

        // Update order status if fully refunded
        if (payment.status === 'refunded') {
            await Order.findByIdAndUpdate(payment.orderId, {
                status: 'refunded',
                paymentStatus: 'refunded'
            });
        }

        res.json({
            success: true,
            message: 'Hoàn tiền thành công',
            payment
        });
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể xử lý hoàn tiền'
        });
    }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let dateFilter = {};
        const now = new Date();

        switch (period) {
            case '7d':
                dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Overall stats
        const overallStats = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateFilter }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['completed', 'partially_refunded']] },
                                { $subtract: ['$amount', '$refundAmount'] },
                                0
                            ]
                        }
                    },
                    totalTransactions: { $sum: 1 },
                    successfulTransactions: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['completed', 'partially_refunded']] },
                                1,
                                0
                            ]
                        }
                    },
                    failedTransactions: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
                        }
                    },
                    pendingTransactions: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
                        }
                    },
                    totalRefunded: { $sum: '$refundAmount' },
                    avgTransactionValue: {
                        $avg: {
                            $cond: [
                                { $in: ['$status', ['completed', 'partially_refunded']] },
                                '$amount',
                                null
                            ]
                        }
                    }
                }
            }
        ]);

        // Payment method breakdown
        const paymentMethodStats = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateFilter },
                    status: { $in: ['completed', 'partially_refunded'] }
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    amount: { $sum: { $subtract: ['$amount', '$refundAmount'] } }
                }
            },
            { $sort: { amount: -1 } }
        ]);

        // Daily revenue
        const dailyRevenue = await Payment.getDailyRevenue(
            period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
        );

        // Top customers by payment
        const topCustomers = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateFilter },
                    status: { $in: ['completed', 'partially_refunded'] }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    totalSpent: { $sum: { $subtract: ['$amount', '$refundAmount'] } },
                    transactionCount: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userId: '$_id',
                    name: '$user.name',
                    email: '$user.email',
                    totalSpent: 1,
                    transactionCount: 1
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                overview: overallStats[0] || {
                    totalRevenue: 0,
                    totalTransactions: 0,
                    successfulTransactions: 0,
                    failedTransactions: 0,
                    pendingTransactions: 0,
                    totalRefunded: 0,
                    avgTransactionValue: 0
                },
                paymentMethodBreakdown: paymentMethodStats,
                dailyRevenue,
                topCustomers,
                period
            }
        });
    } catch (error) {
        console.error('Error getting payment stats:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thống kê thanh toán',
            error: error.message
        });
    }
};

// Update payment status (for manual processing)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, failureReason } = req.body;

        const validStatuses = ['pending', 'processing', 'completed', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch thanh toán'
            });
        }

        // Update payment
        payment.status = status;
        if (status === 'failed' && failureReason) {
            payment.failureReason = failureReason;
        }
        if (status === 'completed') {
            payment.processedAt = new Date();
        }

        await payment.save();

        // Update order payment status
        await Order.findByIdAndUpdate(payment.orderId, {
            paymentStatus: status === 'completed' ? 'paid' : status
        });

        res.json({
            success: true,
            message: 'Cập nhật trạng thái thanh toán thành công',
            payment
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật trạng thái thanh toán',
            error: error.message
        });
    }
};

// Export payment data
export const exportPayments = async (req, res) => {
    try {
        const { dateFrom, dateTo, format = 'json' } = req.query;

        let filter = {};
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
        }

        const payments = await Payment
            .find(filter)
            .populate('userId', 'name email')
            .populate('orderId', 'orderNumber')
            .sort({ createdAt: -1 });

        if (format === 'csv') {
            // Convert to CSV format
            const csv = payments.map(p => ({
                'Mã giao dịch': p.transactionId,
                'Mã đơn hàng': p.orderId?.orderNumber || '',
                'Khách hàng': p.userId?.name || '',
                'Email': p.userId?.email || '',
                'Số tiền': p.amount,
                'Tiền hoàn trả': p.refundAmount,
                'Phương thức': p.paymentMethod,
                'Trạng thái': p.status,
                'Ngày tạo': new Date(p.createdAt).toLocaleString('vi-VN')
            }));

            res.json({
                success: true,
                data: csv,
                format: 'csv'
            });
        } else {
            res.json({
                success: true,
                payments,
                format: 'json'
            });
        }
    } catch (error) {
        console.error('Error exporting payments:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xuất dữ liệu thanh toán',
            error: error.message
        });
    }
};