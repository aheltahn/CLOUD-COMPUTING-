import Tenant from '../models/tenant.model.js';

// Get all tenants (Super Admin only)
export const getTenants = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { domain: { $regex: search, $options: 'i' } }
            ];
        }

        const tenants = await Tenant.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalTenants = await Tenant.countDocuments(filter);
        const totalPages = Math.ceil(totalTenants / limitNum);

        res.json({
            tenants,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalTenants,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update tenant status (Super Admin only)
export const updateTenantStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, lockReason } = req.body;

        const updateData = { isActive };
        if (isActive) {
            updateData.lockReason = ''; // Clear reason when unlocking
        } else {
            updateData.lockReason = lockReason || 'Không có lý do cụ thể';
        }

        const tenant = await Tenant.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json({ message: `Store ${isActive ? 'unlocked' : 'locked'} successfully`, tenant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
