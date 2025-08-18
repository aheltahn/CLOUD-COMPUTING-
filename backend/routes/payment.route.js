import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
    getPayments,
    getPaymentById,
    processRefund,
    getPaymentStats,
    updatePaymentStatus,
    exportPayments
} from '../controllers/payment.controller.js';

const router = express.Router();

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ admin mới có quyền truy cập'
        });
    }
    next();
};

// Admin routes - all require authentication and admin role
router.use(verifyToken);
router.use(checkAdmin);

// Get all payments with filters and pagination
router.get('/', getPayments);

// Get payment statistics
router.get('/stats', getPaymentStats);

// Export payments data
router.get('/export', exportPayments);

// Get payment by ID
router.get('/:id', getPaymentById);

// Process refund
router.post('/:id/refund', processRefund);

// Update payment status
router.put('/:id/status', updatePaymentStatus);

export default router;