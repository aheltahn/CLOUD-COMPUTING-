import { Navigate, Route, Routes } from "react-router-dom";


import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProductManagementPage from "./pages/admin/ProductManagementPage";
import OrderManagementPage from "./pages/admin/OrderManagementPage";
import ProductListingPage from "./pages/user/ProductListingPage";
import OrderHistory from "./pages/user/OrderHistory";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import OrderSuccessPage from "./pages/user/OrderSuccessPage";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/user/ProductDetailPage";

import LoadingSpinner from "./components/LoadingSpinner";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import WishlistPage from "./pages/user/WishlistPage";
import CustomerManagementPage from "./pages/admin/CustomerManagementPage";
import PaymentManagementPage from "./pages/admin/PaymentManagementPage";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

// protect admin routes
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/products" replace />; // 👈 UPDATE: redirect to products instead of "/"
  }

  return children;
};

// redirect authenticated users to appropriate home page based on role
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    // Redirect based on user role
    if (user.role === "admin") {
      return <Navigate to="/admin/products" replace />;
    } else {
      // 👈 UPDATE: User gets redirected to products page (main shopping page)
      return <Navigate to="/products" replace />;
    }
  }

  return children;
};

// Auth Layout with floating shapes and centering
const AuthLayout = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
  >
    <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: "url('https://i.pinimg.com/1200x/09/b6/cd/09b6cdda824eccb31af435090a0e0132.jpg')" }}
  ></div>
   {/* Overlay xanh lá đậm với opacity 40% */}
   <div className="absolute inset-0 bg-green-900 opacity-20"></div>

    {children}
  </div>
);

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <>
      <Routes>
        {/* 👈 NEW: Landing Page (Public Only) */}
        <Route
          path="/"
          element={
            <RedirectAuthenticatedUser>
              <LandingPage />
            </RedirectAuthenticatedUser>
          }
        />

        {/* 👈 NEW: Home Page for Authenticated Users */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* 👈 UPDATE: Dashboard now accessible via user menu */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* User Routes - Clean layout without floating shapes */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:orderId"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes - With floating shapes and centering */}
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <AuthLayout>
                <SignUpPage />
              </AuthLayout>
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthLayout>
              <EmailVerificationPage />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            </RedirectAuthenticatedUser>
          }
        />

        {/* Admin routes - Clean layout */}
        <Route
          path="/admin/products"
          element={
            <AdminProtectedRoute>
              <ProductManagementPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <OrderManagementPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <AdminProtectedRoute>
              <CustomerManagementPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PaymentManagementPage />
            </ProtectedRoute>
          }
        />

        {/* catch all routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
