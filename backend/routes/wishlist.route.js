/**
 * Đây là file định nghĩa các route (đường dẫn API) cho wishlist (danh sách yêu thích).
 * File này sử dụng Express Router để tổ chức các endpoint liên quan đến wishlist.
 */

import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    checkWishlistStatus,
    toggleWishlist
} from '../controllers/wishlist.controller.js';

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(verifyToken);

// Định nghĩa các route cho wishlist:

// 1. Lấy danh sách wishlist của user hiện tại
//    - GET /api/wishlist
//    - Trả về tất cả sản phẩm trong wishlist của user
router.get('/', getWishlist);

// 2. Thêm sản phẩm vào wishlist
//    - POST /api/wishlist
//    - Body: { productId: "..." }
//    - Thêm sản phẩm vào wishlist nếu chưa có
router.post('/', addToWishlist);

// 3. Xóa sản phẩm khỏi wishlist
//    - DELETE /api/wishlist/:productId
//    - Xóa sản phẩm cụ thể khỏi wishlist
router.delete('/:productId', removeFromWishlist);

// 4. Xóa tất cả sản phẩm khỏi wishlist
//    - DELETE /api/wishlist
//    - Xóa toàn bộ wishlist của user
router.delete('/', clearWishlist);

// 5. Kiểm tra trạng thái wishlist của một sản phẩm
//    - GET /api/wishlist/check/:productId
//    - Kiểm tra sản phẩm có trong wishlist không
router.get('/check/:productId', checkWishlistStatus);

// 6. Toggle wishlist (thêm nếu chưa có, xóa nếu đã có)
//    - POST /api/wishlist/toggle
//    - Body: { productId: "..." }
//    - Tự động thêm/xóa dựa trên trạng thái hiện tại
router.post('/toggle', toggleWishlist);

export default router;