// backend/middleware/verifyToken.js

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
	try {
		console.log('🔍 Auth middleware called for:', req.method, req.url);
		console.log('🍪 All cookies:', req.cookies);

		const token = req.cookies.token;

		if (!token) {
			console.log('❌ No token found in cookies');
			return res.status(401).json({
				success: false,
				message: "Unauthorized - no token provided"
			});
		}

		console.log('🎫 Token found, verifying...');
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			console.log('❌ Token verification failed');
			return res.status(401).json({
				success: false,
				message: "Unauthorized - invalid token"
			});
		}

		console.log('✅ Token decoded successfully, userId:', decoded.userId);

		// Fetch user from database
		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			console.log('❌ User not found in database:', decoded.userId);
			return res.status(401).json({
				success: false,
				message: "User not found"
			});
		}

		console.log('✅ User found:', user.name, user.email, 'Role:', user.role);

		req.userId = decoded.userId;
		req.user = user;

		next();
	} catch (error) {
		console.error("❌ Token verification error:", error.message);

		// Specific error handling
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				success: false,
				message: "Token expired - please login again"
			});
		}

		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				success: false,
				message: "Invalid token format"
			});
		}

		return res.status(401).json({
			success: false,
			message: "Unauthorized - token verification failed"
		});
	}
};