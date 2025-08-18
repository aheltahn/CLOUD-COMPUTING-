import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import {
  Home,
  ShoppingBag,
  Heart,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Package,
} from "lucide-react";

const UserHeader = () => {
  const { user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  const [showUserMenu, setShowUserMenu] = useState(false);

  const totalCartItems = getTotalItems();

  // Navigation items - BỎ "Giỏ hàng" khỏi nav chính
  const navItems = [
    { label: "Trang chủ", path: "/home", icon: Home },
    { label: "Sản phẩm", path: "/products", icon: ShoppingBag },
    { label: "Yêu thích", path: "/wishlist", icon: Heart },
  ];

  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-[#032221] shadow-sm  sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="w-8 h-8 text-green-200" />
            <span className="text-xl font-bold text-white">Interior </span>
          </Link>

          {/* Desktop Navigation - BỎ "Giỏ hàng" */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? "text-white"
                      : "text-white hover:text-white hover:bg-green-800/40"
                  }`}
                  style={
                    isActivePath(item.path)
                      ? { background: "linear-gradient(to bottom, #051F20, #0B2B26, #163832, #235347, #8EB69B, #DAF1DE)" }
                      : {}
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side - Cart + User Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon - CHỈ ICON, KHÔNG TEXT */}
            <Link
              to="/cart"
              className="relative p-2 text-white hover:text-green-200 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalCartItems > 99 ? "99+" : totalCartItems}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-green-800/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-white hidden lg:block">
                  {user?.name || "User"}
                </span>
                <ChevronDown className="w-4 h-4 text-white" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-green-900/40 rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to="/dashboard" // ← Sửa thành dashboard
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-black/50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Tài khoản
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-black/50 transition-colors"
                  >
                    <Package className="w-4 h-4 mr-3" />
                    Đơn hàng
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="flex font-bold items-center w-full px-4 py-2 text-sm text-green-300 hover:bg-black/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation - THÊM CART VÀO ĐÂY */}
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActivePath(item.path) ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Cart */}
            <Link
              to="/cart"
              className="flex flex-col items-center space-y-1 px-2 py-2 rounded-md text-xs font-medium transition-colors text-gray-600 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Giỏ hàng</span>

              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {totalCartItems > 9 ? "9+" : totalCartItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
