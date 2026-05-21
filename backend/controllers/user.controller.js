import User from '../models/user.model.js';
import Order from '../models/order.model.js';

// Lấy danh sách toàn bộ người dùng (Super Admin)
export const getGlobalUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = 'all',
            status = 'all',
            sortBy = 'newest'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        let filter = {};

        // Search by name or email
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Role filter
        if (role !== 'all') {
            if (role === 'user') {
                filter.$or = [{ role: 'user' }, { role: { $exists: false } }];
            } else {
                filter.role = role;
            }
        }

        // Status filter
        if (status === 'active') {
            filter.isActive = { $ne: false };
        } else if (status === 'inactive') {
            filter.isActive = false;
        }

        // Sorting logic
        let sortOption = { createdAt: -1 }; // default: newest
        if (sortBy === 'oldest') sortOption = { createdAt: 1 };
        else if (sortBy === 'name_asc') sortOption = { name: 1 };
        else if (sortBy === 'name_desc') sortOption = { name: -1 };
        else if (sortBy === 'email_asc') sortOption = { email: 1 };
        else if (sortBy === 'email_desc') sortOption = { email: -1 };

        const totalUsers = await User.countDocuments(filter);
        const activeUsers = await User.countDocuments({ ...filter, isActive: { $ne: false } });
        
        // Fetch users
        const users = await User.find(filter)
            .select('-password')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(totalUsers / limitNum);

        res.json({
            success: true,
            users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalPages
            },
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers
            }
        });
    } catch (error) {
        console.error('Error getting global users:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách người dùng',
            error: error.message
        });
    }
};

// Vô hiệu hóa người dùng (Super Admin)
export const deleteGlobalUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { lockReason } = req.body;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        if (user.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Không thể khóa tài khoản Super Admin khác' });
        }

        await User.findByIdAndUpdate(id, { 
            isActive: false,
            lockReason: lockReason || 'Vi phạm điều khoản dịch vụ'
        });

        res.json({ success: true, message: `Đã vô hiệu hóa tài khoản ${user.name || user.email}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Khôi phục người dùng (Super Admin)
export const restoreGlobalUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        await User.findByIdAndUpdate(id, { 
            isActive: true,
            lockReason: '' 
        });

        res.json({ success: true, message: `Đã kích hoạt lại tài khoản ${user.name || user.email}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
