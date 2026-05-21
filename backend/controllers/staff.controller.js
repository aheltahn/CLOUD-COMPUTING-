import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

// Lấy danh sách nhân viên
export const getStaffs = async (req, res) => {
    try {
        const staffs = await User.find({
            tenantId: req.tenantId,
            role: 'tenant_staff'
        }).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            staffs
        });
    } catch (error) {
        console.error('Error getting staffs:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách nhân viên'
        });
    }
};

// Tạo nhân viên mới
export const createStaff = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email này đã được sử dụng'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'tenant_staff',
            tenantId: req.tenantId,
            isVerified: true // Tự động xác thực cho nhân viên
        });

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản nhân viên thành công',
            staff: {
                _id: newStaff._id,
                name: newStaff.name,
                email: newStaff.email,
                role: newStaff.role,
                isVerified: newStaff.isVerified,
                createdAt: newStaff.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tạo tài khoản nhân viên'
        });
    }
};

// Khóa tài khoản nhân viên
export const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        
        const staff = await User.findOne({ _id: id, tenantId: req.tenantId, role: 'tenant_staff' });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
        }

        await User.findByIdAndUpdate(id, { isVerified: false });

        res.json({ success: true, message: 'Đã vô hiệu hóa tài khoản nhân viên' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Mở khóa tài khoản nhân viên
export const restoreStaff = async (req, res) => {
    try {
        const { id } = req.params;
        
        const staff = await User.findOne({ _id: id, tenantId: req.tenantId, role: 'tenant_staff' });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
        }

        await User.findByIdAndUpdate(id, { isVerified: true });

        res.json({ success: true, message: 'Đã mở khóa tài khoản nhân viên' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
