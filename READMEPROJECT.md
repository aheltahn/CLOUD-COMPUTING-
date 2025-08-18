# ECOMMERCE SYSTEM

## 📌 Mục tiêu

Hệ thống **E-Commerce** là một nền tảng trực tuyến cho phép cửa hàng bán sản phẩm và khách hàng thực hiện mua sắm trực tuyến. Hệ thống hỗ trợ:

- Quản lý sản phẩm, đơn hàng, thanh toán, khách hàng và dịch vụ hậu mãi cho cửa hàng.
- Tìm kiếm, mua sắm, theo dõi đơn hàng và quản lý tài khoản cho khách hàng.
- Điều hành toàn bộ hệ thống, đảm bảo vận hành ổn định và an toàn cho **Admin**.

---

## 🧭 Phạm vi hệ thống

Hệ thống bao gồm các phân hệ chính:

- **Admin**: Quản lý toàn bộ hoạt động hệ thống.
- **Customer**: Trải nghiệm mua sắm và theo dõi đơn hàng.

---

## 👥 Vai trò và chức năng

### 1. Admin - Quản trị hệ thống

| Mã chức năng | Chức năng                 | Mô tả                                                                                                                                                                                | Tiến độ       |
| ------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| AD-ADM01     | Quản lý sản phẩm          | Kiểm duyệt, cập nhật trạng thái (available, unavailable, out_of_stock), quản lý kho (inventory), giao diện admin hoàn thành, routing và bảo vệ trang admin, tài khoản admin mặc định, Backend pagination, Real-time inventory management | ✅ Hoàn thành |
| AD-ADM02     | Quản lý đơn hàng          | Xử lý và cập nhật đơn hàng, Order model với status tracking, Inventory integration, Payment status management, Customer order history, Order statistics | ✅ Hoàn thành |
| AD-ADM03     | Quản lý khách hàng        | Chỉnh sửa, xóa thông tin khách hàng                                                                                                                                                  | ❌ Chưa làm   |
| AD-ADM04     | Quản lý thanh toán        | Theo dõi các giao dịch                                                                                                                                                               | ❌ Chưa làm   |
| AD-ADM05     | Quản lý thông báo         | Gửi thông báo đến khách hàng                                                                                                                                                         | ❌ Chưa làm   |
| AD-ADM06     | Quản lý đánh giá sản phẩm | Xem và phản hồi đánh giá                                                                                                                                                             | ❌ Chưa làm   |
| AD-ADM07     | Quản lý khuyến mãi        | Tạo/chỉnh sửa/xóa khuyến mãi                                                                                                                                                         | ❌ Chưa làm   |
| AD-ADM08     | Quản lý phân quyền        | Phân quyền cho nhân viên nội bộ                                                                                                                                                      | ❌ Chưa làm   |
| AD-ADM19     | Quản lý tài chính         | Theo dõi doanh thu và chi phí hệ thống                                                                                                                                               | ❌ Chưa làm   |

> ⚠️ Điều kiện: Tất cả chức năng yêu cầu Admin đăng nhập.

---

### 2. Customer - Khách hàng

| Mã chức năng | Chức năng            | Mô tả                                                | Tiến độ       |
| ------------ | -------------------- | ---------------------------------------------------- | ------------- |
| CTM-REG01    | Đăng ký tài khoản    | Tạo tài khoản mới, email verification                | ✅ Hoàn thành |
| CTM-LOG01    | Đăng nhập            | Truy cập hệ thống, forgot password, reset password   | ✅ Hoàn thành |
| CTM-PRD01    | Tìm kiếm sản phẩm    | Product listing với pagination, Search & filter functionality, Product cards với inventory display, Smart variants display | ✅ Hoàn thành |
| CTM-PRD02    | Xem chi tiết sản phẩm | Product detail page với variants selection, Image display, Add to cart, Share functionality | ✅ Hoàn thành |
| CTM-ORD01    | Đặt hàng             | Shopping cart với inventory validation, Real-time stock checking, Checkout process | ✅ Hoàn thành |
| CTM-ORD02    | Xem lịch sử đặt hàng | Order history với status tracking, Order details view, Cancel order functionality | ✅ Hoàn thành |
| CTM-RVW01    | Đánh giá sản phẩm    | Gửi nhận xét sau khi mua                             | ❌ Chưa làm   |
| CTM-ACC01    | Quản lý tài khoản    | Dashboard với user info, Profile management           | ✅ Hoàn thành |
| CTM-SPT01    | Yêu cầu hỗ trợ       | Gửi câu hỏi/hỗ trợ kỹ thuật                          | ❌ Chưa làm   |
| CTM-PRM01    | Xem khuyến mãi       | Xem chương trình khuyến mãi                          | ❌ Chưa làm   |
| CTM-SHP01    | Theo dõi vận chuyển  | Cập nhật trạng thái giao hàng                        | ❌ Chưa làm   |
| CTM-FIN01    | Quản lý thanh toán   | Xem lịch sử giao dịch của mình                       | ❌ Chưa làm   |
| CTM-WIS01    | Danh sách yêu thích  | Lưu sản phẩm yêu thích, Thêm/xóa khỏi wishlist, Wishlist management với real-time sync | ✅ Hoàn thành |
| CTM-CMP01    | So sánh sản phẩm     | So sánh các sản phẩm về giá, tính năng, đánh giá...  | ❌ Chưa làm   |
| CTM-NOT01    | Thông báo đẩy        | Nhận thông báo về đơn hàng, khuyến mãi, cập nhật mới | ❌ Chưa làm   |

> Ghi chú:
>
> - ✅ Hoàn thành
> - ⏳ Đang phát triển
> - ❌ Chưa làm

---

## 🎨 Giao diện

### Admin Pages

- **Product Management Page** – Quản lý sản phẩm ✅
- **Order Management Page** – Xử lý đơn hàng ✅
- **Customer Management Page** – Danh sách khách hàng ❌
- **Payment Management Page** – Quản lý giao dịch ❌
- **Notification Page** – Gửi thông báo ❌
- **Review Management Page** – Quản lý đánh giá ❌
- **Promotion Page** – Quản lý chương trình khuyến mãi ❌
- **Access Control Page** – Phân quyền người dùng ❌
- **Financial Management Page** – Quản lý tài chính ❌

### Customer Pages

- **Registration / Login Pages** – Đăng ký, đăng nhập ✅
- **Landing Page** – Trang chủ cho khách chưa đăng nhập ✅
- **Home Page** – Trang chủ cho khách đã đăng nhập ✅
- **Product Listing Page** – Danh sách sản phẩm với search & filter ✅
- **Product Detail Page** – Chi tiết sản phẩm với variants selection ✅
- **Shopping Cart Page** – Giỏ hàng với quantity management ✅
- **Checkout Page** – Thanh toán ✅
- **Order Success Page** – Xác nhận đặt hàng thành công ✅
- **Order History Page** – Lịch sử đơn hàng ✅
- **Wishlist Page** – Danh sách yêu thích ✅
- **Dashboard Page** – Trang tổng quan tài khoản ✅
- **Review Page** – Đánh giá sản phẩm ❌
- **Account Settings Page** – Quản lý tài khoản ❌
- **Support Page** – Gửi yêu cầu hỗ trợ ❌
- **Promotion Page** – Xem khuyến mãi ❌
- **Shipping Tracking Page** – Theo dõi vận chuyển ❌
- **Payment History Page** – Quản lý giao dịch ❌
- **Product Comparison Page** – So sánh sản phẩm ❌
- **Notification Center Page** – Trung tâm thông báo ❌

---

## 🏗️ Kiến trúc hệ thống

### Backend (Node.js + Express + MongoDB)
- **🔐 Authentication**: JWT tokens, email verification, password reset ✅
- **👤 User Management**: Role-based access (user/admin), default admin creation ✅
- **📦 Product Management**: CRUD operations với file upload, pagination, inventory management, variants support ✅
- **📋 Order Management**: Order processing, status tracking, inventory integration ✅
- **💝 Wishlist Management**: Add/remove products, sync với database ✅
- **🗃️ Database**: MongoDB với Mongoose ODM ✅
- **🛡️ Security**: bcrypt password hashing, HTTP-only cookies, CORS ✅
- **📁 File Management**: Image upload với multiple location support, normalized paths ✅

### Frontend (React + Vite + Tailwind CSS)
- **🎨 UI Framework**: React với Tailwind CSS ✅
- **🔄 State Management**: Zustand cho authentication, cart, và wishlist ✅
- **🛣️ Routing**: React Router với protected routes ✅
- **🎭 Animations**: Framer Motion ✅ 
- **📱 Responsive Design**: Mobile-first approach ✅
- **🔔 Notifications**: React Hot Toast ✅
- **🖼️ Image Handling**: Smart image URL processing, fallback support ✅
- **🎯 Smart UI Components**: Variants selection, cart management, wishlist integration ✅

---

## 🚀 Tính năng đã hoàn thành

### 🛍️ Shopping Experience
- **Product Discovery**: Advanced search, filtering, pagination
- **Product Details**: Smart variants selection (color/size), image gallery
- **Shopping Cart**: Real-time inventory validation, quantity management
- **Wishlist**: Add/remove products, cross-component sync
- **Checkout Process**: Complete order flow with inventory reduction

### 🎨 User Interface
- **Responsive Design**: Mobile-first approach, adaptive layouts
- **Smart Components**: ProductCard, ProductDetailPage, WishlistPage
- **Image Management**: Fallback handling, multiple upload locations
- **User Feedback**: Toast notifications, loading states, error handling

### 🔧 Technical Features
- **State Management**: Zustand stores for auth, cart, wishlist
- **API Integration**: RESTful APIs với proper error handling
- **Database Design**: Optimized schemas với relationships
- **Authentication Flow**: Complete auth system với role-based access

---

## 📊 Tiến độ tổng quan

### Hoàn thành: **70%** 
- ✅ **Authentication & Authorization** (100%)
- ✅ **Product Management** (100%)
- ✅ **Shopping Cart & Checkout** (100%)
- ✅ **Order Management** (100%)
- ✅ **Wishlist System** (100%)
- ✅ **User Interface & Experience** (90%)

### Đang phát triển: **0%**
- Tất cả features chính đã hoàn thành

### Chưa làm: **30%**
- ❌ Review & Rating System
- ❌ Promotion & Discount System
- ❌ Customer Support System
- ❌ Advanced Analytics & Reporting
- ❌ Notification System
- ❌ Payment Gateway Integration

---

## ✅ Điều kiện hoạt động

- **Admin** phải đăng nhập để thực hiện các chức năng quản trị.
- **Customer** phải có tài khoản để đặt hàng, quản lý wishlist, hoặc theo dõi đơn hàng.
- **Responsive Design** hoạt động trên tất cả thiết bị.

---

## 📌 Ghi chú triển khai

- Backend sử dụng mô hình MVC với middleware authentication.
- Frontend sử dụng React, Tailwind, Zustand với component-based architecture.
- Database: MongoDB với Mongoose ODM và optimized schemas.
- Real-time inventory management system với stock validation.
- Comprehensive order processing workflow với status tracking.
- Smart image handling với multiple fallback mechanisms.
- Cross-component state synchronization với Zustand stores.

---