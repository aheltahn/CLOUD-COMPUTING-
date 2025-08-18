import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    getCustomerOrders,
    cancelOrder,
    getOrderStats
} from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Customer routes (requires authentication)
router.post('/', verifyToken, createOrder); // Tạo đơn hàng mới
router.get('/my-orders', verifyToken, getCustomerOrders); // Lấy đơn hàng của customer
router.post('/:id/cancel', verifyToken, cancelOrder); // Hủy đơn hàng (customer only)

// Shared routes (customer can view their own orders, admin can view all)
router.get('/:id', verifyToken, getOrderById); // Lấy chi tiết đơn hàng

// Admin routes (requires admin role)
// Note: You might want to add admin role middleware here
router.get('/', verifyToken, getOrders); // Lấy tất cả đơn hàng (admin)
router.put('/:id/status', verifyToken, updateOrderStatus); // Cập nhật trạng thái đơn hàng (admin)
router.put('/:id/payment', verifyToken, updatePaymentStatus); // Cập nhật trạng thái thanh toán (admin)
router.get('/admin/stats', verifyToken, getOrderStats); // Thống kê đơn hàng (admin)

export default router;