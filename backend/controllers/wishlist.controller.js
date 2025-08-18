import Wishlist from '../models/wishlist.model.js';
import Product from '../models/product.model.js';

// Lấy danh sách wishlist của user
export const getWishlist = async (req, res) => {
    try {
        const userId = req.userId; // Từ middleware verifyToken

        const wishlistItems = await Wishlist.find({ userId })
            .populate('productId')
            .sort({ addedAt: -1 }); // Sắp xếp theo thời gian thêm mới nhất

        // Lọc ra những sản phẩm còn tồn tại (không bị xóa)
        const validWishlistItems = wishlistItems.filter(item => item.productId);

        // Format dữ liệu trả về
        const formattedItems = validWishlistItems.map(item => ({
            _id: item._id,
            product: item.productId,
            addedAt: item.addedAt,
            addedToWishlistAt: item.addedAt // Alias cho frontend
        }));

        res.json({
            success: true,
            wishlistItems: formattedItems,
            totalItems: formattedItems.length
        });
    } catch (error) {
        console.error('Error getting wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách yêu thích',
            error: error.message
        });
    }
};

// Thêm sản phẩm vào wishlist
export const addToWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin productId'
            });
        }

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Kiểm tra đã có trong wishlist chưa
        const existingItem = await Wishlist.findOne({ userId, productId });
        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm đã có trong danh sách yêu thích'
            });
        }

        // Thêm vào wishlist
        const wishlistItem = new Wishlist({
            userId,
            productId,
            addedAt: new Date()
        });

        await wishlistItem.save();

        // Populate product info để trả về
        await wishlistItem.populate('productId');

        res.status(201).json({
            success: true,
            message: 'Đã thêm vào danh sách yêu thích',
            wishlistItem: {
                _id: wishlistItem._id,
                product: wishlistItem.productId,
                addedAt: wishlistItem.addedAt,
                addedToWishlistAt: wishlistItem.addedAt
            }
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm đã có trong danh sách yêu thích'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Không thể thêm vào danh sách yêu thích',
            error: error.message
        });
    }
};

// Xóa sản phẩm khỏi wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin productId'
            });
        }

        const deletedItem = await Wishlist.findOneAndDelete({
            userId,
            productId
        });

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không có trong danh sách yêu thích'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa khỏi danh sách yêu thích'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa khỏi danh sách yêu thích',
            error: error.message
        });
    }
};

// Xóa tất cả sản phẩm khỏi wishlist
export const clearWishlist = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await Wishlist.deleteMany({ userId });

        res.json({
            success: true,
            message: `Đã xóa ${result.deletedCount} sản phẩm khỏi danh sách yêu thích`
        });
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa danh sách yêu thích',
            error: error.message
        });
    }
};

// Kiểm tra sản phẩm có trong wishlist không
export const checkWishlistStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        const existingItem = await Wishlist.findOne({ userId, productId });

        res.json({
            success: true,
            isInWishlist: !!existingItem,
            wishlistItemId: existingItem?._id || null
        });
    } catch (error) {
        console.error('Error checking wishlist status:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể kiểm tra trạng thái wishlist',
            error: error.message
        });
    }
};

// Toggle wishlist (thêm nếu chưa có, xóa nếu đã có)
export const toggleWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin productId'
            });
        }

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Kiểm tra đã có trong wishlist chưa
        const existingItem = await Wishlist.findOne({ userId, productId });

        if (existingItem) {
            // Nếu đã có thì xóa
            await Wishlist.findByIdAndDelete(existingItem._id);
            res.json({
                success: true,
                action: 'removed',
                message: 'Đã xóa khỏi danh sách yêu thích',
                isInWishlist: false
            });
        } else {
            // Nếu chưa có thì thêm
            const wishlistItem = new Wishlist({
                userId,
                productId,
                addedAt: new Date()
            });

            await wishlistItem.save();
            await wishlistItem.populate('productId');

            res.json({
                success: true,
                action: 'added',
                message: 'Đã thêm vào danh sách yêu thích',
                isInWishlist: true,
                wishlistItem: {
                    _id: wishlistItem._id,
                    product: wishlistItem.productId,
                    addedAt: wishlistItem.addedAt,
                    addedToWishlistAt: wishlistItem.addedAt
                }
            });
        }
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể thực hiện thao tác',
            error: error.message
        });
    }
};