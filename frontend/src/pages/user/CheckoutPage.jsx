import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import UserLayout from "../../components/user/UserLayout";
import {
  CreditCard,
  Truck,
  Shield,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getCartTotal, clearCart, processCheckout } = useCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Shipping Address
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",

    // Payment
    paymentMethod: "cod", // cod, bank_transfer, e_wallet

    // Notes
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      toast.error("Giỏ hàng trống!");
      navigate("/cart");
    }
  }, [items, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!formData.city.trim()) newErrors.city = "Vui lòng chọn tỉnh/thành phố";

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Chỉnh sửa handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsProcessing(true);

    try {
      // Debug: Log items để kiểm tra structure
      console.log("🔍 Cart items:", items);
      console.log("🔍 User:", user);

      // Create order - Thêm finalAmount và orderNumber
      const shippingFee = 0; // Giá trị từ giao diện là miễn phí
      const discountAmount = 0; // Có thể lấy từ mã giảm giá nếu có
      const totalAmount = getCartTotal();
      const finalAmount = totalAmount + shippingFee - discountAmount;
      const orderNumber = `ORD-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`; // Tạo tạm thời

      const orderData = {
        items: items.map((item) => ({
          productId: item.productId || item._id || item.id,
          quantity: item.quantity || 1,
          price: item.price || 0,
          productName: item.productName || item.name || "",
          image: item.image || "",
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        totalAmount,
        shippingFee,
        discountAmount,
        finalAmount,
        orderNumber,
      };

      // Debug: Log order data trước khi gửi
      console.log("🚀 Order data to send:", orderData);

      const response = await fetch("http://localhost:4173/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      // Debug: Log response
      console.log("📦 API Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Không thể tạo đơn hàng");
      }

      // Clear cart after successful order
      clearCart();

      toast.success("Đặt hàng thành công!");
      navigate(`/order-success/${result.order._id}`);
    } catch (error) {
      console.error("❌ Checkout error:", error);
      toast.error(error.message || "Có lỗi xảy ra khi đặt hàng!");
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng (COD)",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      icon: Truck,
    },
    {
      id: "bank_transfer",
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản qua ATM hoặc Internet Banking",
      icon: CreditCard,
    },
    {
      id: "e_wallet",
      name: "Ví điện tử",
      description: "Thanh toán qua MoMo, ZaloPay, VNPAY",
      icon: Shield,
    },
  ];

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-white hover:text-[#9fd700] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại giỏ hàng
          </button>
          <h1 className="text-3xl font-bold text-[#9fd700] mb-2">Thanh toán</h1>
          <p className="text-white">
            Vui lòng điền thông tin để hoàn tất đơn hàng
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/20 rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-[#9fd700] mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#9fd700]" />
                  Thông tin giao hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.fullName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Số điện thoại *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Khác">Tỉnh/thành khác</option>
                    </select>
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Quận/Huyện
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập quận/huyện"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Phường/Xã
                    </label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập phường/xã"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-white mb-2">
                    Địa chỉ cụ thể *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nhập địa chỉ cụ thể (số nhà, tên đường...)"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/20 rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-[#9fd700] mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#9fd700]" />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.paymentMethod === method.id
                            ? "border-[#9fd700] bg-[#446158] "
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <Icon
                          className={`w-5 h-5 mr-3 ${
                            formData.paymentMethod === method.id
                              ? "text-[#9fd700]"
                              : "text-white"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {method.name}
                          </p>
                          <p className="text-sm text-white">
                            {method.description}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            formData.paymentMethod === method.id
                              ? "border-[#9fd700] bg-[#9fd700]"
                              : "border-white"
                          }`}
                        >
                          {formData.paymentMethod === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </motion.div>

              {/* Order Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/20 rounded-lg shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-[#446158] mb-4">
                  Ghi chú đơn hàng
                </h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
                />
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/20 rounded-lg shadow-sm p-6 sticky top-24"
              >
                <h2 className="text-xl font-semibold text-[#9fd700] mb-6">
                  Đơn hàng của bạn
                </h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white truncate">
                          {item.productName}
                        </p>
                        <p className="text-sm text-white">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-white">
                    <span>Tạm tính</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600 font-bold">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-white border-t border-gray-200 pt-3">
                    <span>Tổng cộng</span>
                    <span className="text-[#9fd700]">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-[#fffeef] to-[#9fd700] text-black hover:scale-105 font-medium py-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt hàng"
                  )}
                </button>

                {/* Security Note */}
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm text-center">
                    🔒 Thông tin của bạn được bảo mật an toàn
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </UserLayout>
  );
};

export default CheckoutPage;
