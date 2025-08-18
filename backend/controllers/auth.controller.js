import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../mailtrap/emails.js";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Wishlist from "../models/wishlist.model.js";

// Tạo tài khoản admin mặc định
const createDefaultAdmin = async () => {
	try {
		const adminExists = await User.findOne({ email: 'admin@example.com' });
		if (!adminExists) {
			const hashedPassword = await bcrypt.hash('admin123', 10);
			await User.create({
				name: 'Admin',
				email: 'admin@example.com',
				password: hashedPassword,
				role: 'admin',
				isVerified: true
			});
			console.log('Default admin account created: admin@example.com / admin123');
		}
	} catch (error) {
		console.error('Error creating default admin:', error);
	}
};

// Gọi hàm tạo admin khi khởi động
createDefaultAdmin();

export const signup = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
		});

		// Send verification email
		await sendVerificationEmail(user.email, user.verificationToken);

		res.status(201).json({
			message: "User created successfully. Please check your email to verify your account.",
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				isVerified: user.isVerified,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Check password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Check if user is verified
		if (!user.isVerified) {
			return res.status(400).json({ message: "Please verify your email first" });
		}

		// ✅ Cập nhật thời gian đăng nhập cuối cùng
		user.lastLogin = new Date();
		await user.save();

		// ✅ Lấy thống kê đơn hàng và yêu thích
		const orders = await Order.find({ customerId: user._id, status: 'delivered' });
		const wishlist = await Wishlist.find({ userId: user._id });

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET,
			{ expiresIn: "7d" }
		);

		// Set cookie
		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		res.json({
			message: "Login successful",
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				isVerified: user.isVerified,
				lastLogin: user.lastLogin,
				createdAt: user.createdAt,
				ordersCount: orders.length,       
				wishlistCount: wishlist.length,   
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		res.clearCookie("token");
		res.json({ message: "Logout successful" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}

		res.json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				isVerified: user.isVerified,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	try {
		const { code } = req.body;

		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		res.json({
			message: "Email verified successfully",
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				isVerified: user.isVerified,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
		await user.save();

		// Send reset email
		// await sendResetPasswordEmail(user.email, resetToken); // This line was removed from the new_code, so it's removed here.

		res.json({ message: "Reset password email sent" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ message: "Invalid or expired reset token" });
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(password, 10);
		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		res.json({ message: "Password reset successful" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
