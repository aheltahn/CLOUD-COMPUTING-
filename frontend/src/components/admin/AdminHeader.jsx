import React from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Package, FileText, ShoppingBag, Users, CreditCard } from "lucide-react";

const AdminHeader = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const adminNavItems = [
    {
      path: "/admin/products",
      label: "Quản lý sản phẩm",
      icon: Package,
    },
    {
      path: "/admin/orders",
      label: "Quản lý đơn hàng",
      icon: FileText,
    },
    {
      path: "/admin/customers",
      label: "Quản lý khách hàng",
      icon: Users,
    },
    {
      path: "/admin/payments",
      label: "Quản lý thanh toán",
      icon: CreditCard,
    },
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Main Header */}
      <header className="w-full bg-white shadow fixed top-0 left-0 right-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/admin/products"
                className="flex items-center space-x-2"
              >
                <ShoppingBag className="w-8 h-8 text-green-700" />
                <div className="text-xl font-bold text-green-700">
                  Admin Panel
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isActivePath(item.path)
                        ? "bg-green-100 text-green-700 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-lg">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="hidden sm:block">
                  <span className="font-medium text-gray-700">
                    {user?.name || "Admin"}
                  </span>
                  <div className="text-xs text-green-600">Administrator</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200">
          <nav className="grid grid-cols-3 gap-1 p-2 bg-white">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-2 py-3 rounded-md text-xs font-medium transition-colors ${
                    isActivePath(item.path)
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Spacer để tránh content bị che */}
      <div className="h-16 lg:h-14"></div>
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default AdminHeader;
