import Discount from '../models/discount.model.js';

// 1. Lấy danh sách mã khuyến mãi
export const getDiscounts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            isActive = '',
            discountType = ''
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let filter = { tenantId: req.tenantId };

        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (isActive === 'true') {
            filter.isActive = true;
        } else if (isActive === 'false') {
            filter.isActive = false;
        }

        if (discountType) {
            filter.discountType = discountType;
        }

        const discounts = await Discount.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalDiscounts = await Discount.countDocuments(filter);
        const totalPages = Math.ceil(totalDiscounts / limitNum);

        res.json({
            discounts,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalDiscounts,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi tải danh sách mã khuyến mãi' });
    }
};

// 2. Tạo mã khuyến mãi mới
export const createDiscount = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minOrderValue = 0,
            maxDiscountAmount = null,
            startDate,
            endDate = null,
            usageLimit = null,
            isActive = true
        } = req.body;

        if (!code || !discountType || discountValue === undefined) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
        }

        const normalizedCode = code.trim().toUpperCase();

        // Kiểm tra xem mã đã tồn tại trong cửa hàng (tenant) chưa
        const existingDiscount = await Discount.findOne({
            tenantId: req.tenantId,
            code: normalizedCode
        });

        if (existingDiscount) {
            return res.status(400).json({ message: 'Mã khuyến mãi này đã tồn tại trong hệ thống cửa hàng.' });
        }

        const newDiscount = new Discount({
            tenantId: req.tenantId,
            code: normalizedCode,
            description,
            discountType,
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue),
            maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            usageLimit: usageLimit ? Number(usageLimit) : null,
            isActive
        });

        await newDiscount.save();
        res.status(201).json(newDiscount);
    } catch (error) {
        console.error('Error creating discount:', error);
        res.status(500).json({ message: error.message || 'Lỗi hệ thống khi tạo mã khuyến mãi' });
    }
};

// 3. Cập nhật mã khuyến mãi
export const updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code,
            description,
            discountType,
            discountValue,
            minOrderValue,
            maxDiscountAmount,
            startDate,
            endDate,
            usageLimit,
            isActive
        } = req.body;

        const discount = await Discount.findOne({ _id: id, tenantId: req.tenantId });
        if (!discount) {
            return res.status(404).json({ message: 'Không tìm thấy mã khuyến mãi.' });
        }

        if (code) {
            const normalizedCode = code.trim().toUpperCase();
            if (normalizedCode !== discount.code) {
                // Kiểm tra xem mã mới có trùng với mã nào khác trong cùng cửa hàng không
                const duplicateDiscount = await Discount.findOne({
                    tenantId: req.tenantId,
                    code: normalizedCode,
                    _id: { $ne: id }
                });
                if (duplicateDiscount) {
                    return res.status(400).json({ message: 'Mã khuyến mãi mới này đã bị trùng lặp.' });
                }
                discount.code = normalizedCode;
            }
        }

        if (description !== undefined) discount.description = description;
        if (discountType !== undefined) discount.discountType = discountType;
        if (discountValue !== undefined) discount.discountValue = Number(discountValue);
        if (minOrderValue !== undefined) discount.minOrderValue = Number(minOrderValue);
        if (maxDiscountAmount !== undefined) discount.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
        if (startDate !== undefined) discount.startDate = new Date(startDate);
        if (endDate !== undefined) discount.endDate = endDate ? new Date(endDate) : null;
        if (usageLimit !== undefined) discount.usageLimit = usageLimit ? Number(usageLimit) : null;
        if (isActive !== undefined) discount.isActive = isActive;

        await discount.save();
        res.json(discount);
    } catch (error) {
        console.error('Error updating discount:', error);
        res.status(500).json({ message: error.message || 'Lỗi hệ thống khi cập nhật mã khuyến mãi' });
    }
};

// 4. Xóa mã khuyến mãi
export const deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await Discount.findOneAndDelete({ _id: id, tenantId: req.tenantId });
        
        if (!discount) {
            return res.status(404).json({ message: 'Không tìm thấy mã khuyến mãi.' });
        }

        res.json({ message: 'Đã xóa mã khuyến mãi thành công.', discount });
    } catch (error) {
        console.error('Error deleting discount:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi xóa mã khuyến mãi' });
    }
};

// 5. Kiểm tra mã khuyến mãi khi thanh toán POS
export const checkDiscount = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code) {
            return res.status(400).json({ isValid: false, message: 'Vui lòng cung cấp mã khuyến mãi.' });
        }

        if (orderAmount === undefined || orderAmount <= 0) {
            return res.status(400).json({ isValid: false, message: 'Giá trị đơn hàng không hợp lệ.' });
        }

        const normalizedCode = code.trim().toUpperCase();

        const discount = await Discount.findOne({
            tenantId: req.tenantId,
            code: normalizedCode
        });

        if (!discount) {
            return res.status(404).json({ isValid: false, message: 'Mã khuyến mãi không tồn tại.' });
        }

        if (!discount.isActive) {
            return res.status(400).json({ isValid: false, message: 'Mã khuyến mãi đã ngưng hoạt động.' });
        }

        // Kiểm tra thời gian
        const now = new Date();
        if (new Date(discount.startDate) > now) {
            return res.status(400).json({ isValid: false, message: 'Mã khuyến mãi chưa đến thời gian sử dụng.' });
        }

        if (discount.endDate && new Date(discount.endDate) < now) {
            return res.status(400).json({ isValid: false, message: 'Mã khuyến mãi đã hết hạn sử dụng.' });
        }

        // Kiểm tra số lần sử dụng
        if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
            return res.status(400).json({ isValid: false, message: 'Mã khuyến mãi đã hết lượt sử dụng.' });
        }

        // Kiểm tra hóa đơn tối thiểu
        if (orderAmount < discount.minOrderValue) {
            return res.status(400).json({ 
                isValid: false, 
                message: `Đơn hàng tối thiểu phải đạt ${discount.minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này.` 
            });
        }

        // Tính toán mức giảm giá
        let discountAmount = 0;
        if (discount.discountType === 'percentage') {
            discountAmount = (orderAmount * discount.discountValue) / 100;
            if (discount.maxDiscountAmount !== null && discountAmount > discount.maxDiscountAmount) {
                discountAmount = discount.maxDiscountAmount;
            }
        } else if (discount.discountType === 'fixed') {
            discountAmount = discount.discountValue;
        }

        // Không cho phép giảm quá tổng tiền
        if (discountAmount > orderAmount) {
            discountAmount = orderAmount;
        }

        res.json({
            isValid: true,
            discountAmount,
            discount: {
                _id: discount._id,
                code: discount.code,
                discountType: discount.discountType,
                discountValue: discount.discountValue,
                minOrderValue: discount.minOrderValue,
                description: discount.description
            }
        });
    } catch (error) {
        console.error('Error checking discount:', error);
        res.status(500).json({ isValid: false, message: 'Lỗi hệ thống khi xác thực mã khuyến mãi' });
    }
};
