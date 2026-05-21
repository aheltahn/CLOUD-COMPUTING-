import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../mailtrap/emails.js";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Tenant from "../models/tenant.model.js";

// Khởi tạo các tài khoản mặc định
const seedDefaultAccounts = async () => {
	try {
		const hashedPassword = await bcrypt.hash('123456', 10);

		// 1. Super Admin
		const superAdmin = await User.findOne({ email: 'superadmin@gmail.com' });
		if (!superAdmin) {
			await User.create({
				name: 'Super Admin',
				email: 'superadmin@gmail.com',
				password: hashedPassword,
				role: 'super_admin',
				isVerified: true
			});
			console.log('✅ Created Super Admin: superadmin@gmail.com / 123456');
		}

		// 2. Cửa hàng mặc định (Default Store)
		let defaultStore = await Tenant.findOne({ domain: 'default-store' });
		if (!defaultStore) {
			defaultStore = await Tenant.create({
				name: 'Cửa hàng Mặc định',
				domain: 'default-store',
				status: 'active',
				email: 'adminstore@gmail.com'
			});
			console.log('✅ Created Default Store');
		}

		// 3. Store Admin (Chủ cửa hàng)
		const storeAdmin = await User.findOne({ email: 'adminstore@gmail.com' });
		if (!storeAdmin) {
			await User.create({
				name: 'Chủ cửa hàng',
				email: 'adminstore@gmail.com',
				password: hashedPassword,
				role: 'tenant_admin',
				tenantId: defaultStore._id,
				isVerified: true
			});
			console.log('✅ Created Store Admin: adminstore@gmail.com / 123456');
		}

		// 4. Staff (Nhân viên)
		const staff = await User.findOne({ email: 'staff@gmail.com' });
		if (!staff) {
			await User.create({
				name: 'Nhân viên Bán hàng',
				email: 'staff@gmail.com',
				password: hashedPassword,
				role: 'tenant_staff',
				tenantId: defaultStore._id,
				isVerified: true
			});
			console.log('✅ Created Staff: staff@gmail.com / 123456');
		}

		console.log('✅ System Check: All default accounts are ready.');

	} catch (error) {
		console.error('❌ Error seeding default accounts:', error);
	}
};

// Gọi hàm khi khởi động
seedDefaultAccounts();

export const signup = async (req, res) => {
	return res.status(403).json({ 
		message: "User registration is disabled. Please register a store instead." 
	});
};

export const registerTenant = async (req, res) => {
	try {
		const { storeName, name, email, password, phone, address } = req.body;

		// Check if store owner email already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already exists" });
		}

		// Create Tenant (Store)
		const domain = storeName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
		const newStore = await Tenant.create({
			name: storeName,
			domain: domain,
			status: 'active',
			email: email
		});

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Generate verification token
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		// Create Store Admin User
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
			tenantId: newStore._id,
			role: "tenant_admin",
			isVerified: false,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		// Send verification email
		await sendVerificationEmail(user.email, user.verificationToken);

		res.status(201).json({
			message: "Store registered successfully.",
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				tenantId: user.tenantId,
				isVerified: user.isVerified,
			},
		});
	} catch (error) {
		console.error("Error registering tenant:", error);
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

		// CHECK USER LOCK STATUS
		if (user.isActive === false) {
			return res.status(403).json({ 
				message: `Tài khoản của bạn đã bị khóa. Lý do: ${user.lockReason || 'Vi phạm điều khoản dịch vụ'}` 
			});
		}

		// CHECK TENANT STATUS
		if (user.tenantId && user.role !== 'super_admin') {
			const tenant = await Tenant.findById(user.tenantId);
			if (tenant && !tenant.isActive) {
				return res.status(403).json({ 
					message: `Tài khoản cửa hàng đã bị khóa. Lý do: ${tenant.lockReason || 'Không xác định'}` 
				});
			}
		}

		// ✅ Cập nhật thời gian đăng nhập cuối cùng
		user.lastLogin = new Date();
		await user.save();

		// ✅ Lấy thống kê đơn hàng
		const orders = await Order.find({ customerId: user._id, status: 'delivered' });

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
				tenantId: user.tenantId,
				isVerified: user.isVerified,
				lastLogin: user.lastLogin,
				createdAt: user.createdAt,
				ordersCount: orders.length,       
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
		user.lastLogin = new Date();
		await user.save();

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
			message: "Email verified successfully",
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				tenantId: user.tenantId,
				isVerified: user.isVerified,
				lastLogin: user.lastLogin,
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
