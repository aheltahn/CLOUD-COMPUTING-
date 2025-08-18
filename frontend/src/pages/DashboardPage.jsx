import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/helpers";
import UserLayout from "../components/user/UserLayout";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  Heart,
  User,
  Edit,
  CreditCard,
  History,
} from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuthStore();

  const quickActions = [
    {
      icon: ShoppingBag,
      title: "Mua sắm",
      description: "Khám phá sản phẩm mới",
      link: "/products",
      color: "bg-blue-500",
    },
    {
      icon: Package,
      title: "Đơn hàng",
      description: "Theo dõi đơn hàng của bạn",
      link: "/orders",
      color: "bg-green-500",
    },
    {
      icon: Heart,
      title: "Yêu thích",
      description: "Sản phẩm bạn đã lưu",
      link: "/wishlist",
      color: "bg-red-500",
    },
    {
      icon: CreditCard,
      title: "Thanh toán",
      description: "Lịch sử giao dịch",
      link: "/payments",
      color: "bg-purple-500",
    },
  ];

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#9fd700] mb-2">
              Xin chào, {user?.name}! 👋
            </h1>
            <p className="text-white">
              Chào mừng bạn trở lại với Interior . Hãy khám phá những sản phẩm
              tuyệt vời!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-white mb-4">
                Thao tác nhanh
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      to={action.link}
                      className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}
                        >
                          <action.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Profile Section */}
            <div className="space-y-6">
              {/* Profile Information */}
              <motion.div
                className="bg-white rounded-lg shadow-sm border p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Thông tin cá nhân
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Tên
                    </label>
                    <p className="text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Vai trò
                    </label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user?.role === "user" ? "Khách hàng" : user?.role}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Ngày tham gia
                    </label>
                    <p className="text-gray-900">
                      {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Trạng thái xác thực
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.isVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user?.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="bg-white rounded-lg shadow-sm border p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thống kê
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {user?.ordersCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">Đơn hàng đã hoàn thành</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {user?.wishlistCount || 0}
                    </div>
                    <div className="text-sm text-gray-500">Yêu thích</div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              {/* <motion.div
                className="bg-white rounded-lg shadow-sm border p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <History className="w-5 h-5 mr-2 text-blue-600" />
                    Hoạt động gần đây
                  </h3>
                  <Link
                    to="/orders"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Xem tất cả →
                  </Link>
                </div> */}

                {/* <div className="space-y-3"> */}
                  {/* Sample recent activities */}
                  {/* <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Chưa có hoạt động nào
                        </p>
                        <p className="text-xs text-gray-500">
                          Hãy bắt đầu mua sắm
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div> */}
            </div>
          </div>
        </motion.div>
      </div>
    </UserLayout>
  );
};

export default DashboardPage;
