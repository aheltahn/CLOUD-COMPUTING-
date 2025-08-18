import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore"; // Import wishlist store
import {
  Heart,
  ShoppingCart,
  Trash2,
  Eye,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Filter,
  Grid,
  List,
} from "lucide-react";
import toast from "react-hot-toast";

const WishlistPage = () => {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const {
    items: wishlistItems,
    isLoading: loading,
    fetchWishlist,
    removeFromWishlist,
    clearWishlist,
    getTotalItems,
  } = useWishlistStore(); // Use real wishlist store

  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [addingToCart, setAddingToCart] = useState(new Set());

  // Fetch wishlist when component mounts
  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  // Helper function để tạo URL hình ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.includes("placeholder")) {
      return "http://localhost:4173/placeholder-product.jpg";
    }

    let filename = imagePath;
    if (imagePath.includes("/uploads/")) {
      filename = imagePath.replace("/uploads/", "");
    } else if (imagePath.includes("/")) {
      filename = imagePath.split("/").pop();
    }

    return `http://localhost:4173/uploads/${filename}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getUniqueColors = (variants) => {
    if (!variants || variants.length === 0) return [];
    const colors = variants.map((v) => v.color).filter(Boolean);
    return [...new Set(colors)];
  };

  const getUniqueSizes = (variants) => {
    if (!variants || variants.length === 0) return [];
    const sizes = variants.map((v) => v.size).filter(Boolean);
    return [...new Set(sizes)];
  };

  const handleRemoveFromWishlist = async (productId, productName) => {
    const result = await removeFromWishlist(productId);
    if (result.success) {
      // Toast already shown in store
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    if (product.status !== "available" || product.inventory <= 0) {
      toast.error("Sản phẩm hiện tại không có sẵn");
      return;
    }

    setAddingToCart((prev) => new Set(prev).add(product._id));

    try {
      await addToCart(product, 1);
      toast.success(`Đã thêm ${product.productName} vào giỏ hàng!`);
    } catch (error) {
      toast.error(error.message || "Không thể thêm vào giỏ hàng");
    } finally {
      setAddingToCart((prev) => {
        const updated = new Set(prev);
        updated.delete(product._id);
        return updated;
      });
    }
  };

  const handleMoveToCart = async (product) => {
    await handleAddToCart(product);
    await handleRemoveFromWishlist(product._id, product.productName);
  };

  const handleClearWishlist = async () => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?"
      )
    ) {
      await clearWishlist();
    }
  };

  // Filter and sort wishlist items
  const getFilteredAndSortedItems = () => {
    let filtered = [...wishlistItems];

    // Filter by availability
    if (filterBy === "available") {
      filtered = filtered.filter(
        (item) => item.status === "available" && item.inventory > 0
      );
    } else if (filterBy === "unavailable") {
      filtered = filtered.filter(
        (item) => item.status !== "available" || item.inventory <= 0
      );
    }

    // Sort items
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        filtered.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case "name_desc":
        filtered.sort((a, b) => b.productName.localeCompare(a.productName));
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.addedToWishlistAt) - new Date(b.addedToWishlistAt)
        );
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.addedToWishlistAt) - new Date(a.addedToWishlistAt)
        );
        break;
    }

    return filtered;
  };

  const filteredItems = getFilteredAndSortedItems();

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách yêu thích...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <UserLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-pink-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Danh sách yêu thích trống
            </h2>
            <p className="text-gray-600 mb-8">
              Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá
              và lưu lại những sản phẩm bạn thích!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Khám phá sản phẩm
            </Link>
          </motion.div>
        </div>
      </UserLayout>
    );
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
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-[#9fd700]">
              Danh sách yêu thích
            </h1>
          </div>
          <p className="text-white">
            Bạn có {getTotalItems()} sản phẩm trong danh sách yêu thích
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">Tất cả sản phẩm</option>
              <option value="available">Còn hàng</option>
              <option value="unavailable">Hết hàng</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price_asc">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-[#9fd700] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-[#9fd700] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Clear All */}
            <button
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              Xóa tất cả
            </button>
          </div>
        </div>

        {/* Items Count */}
        <div className="mb-6">
          <p className="text-white">
            Hiển thị {filteredItems.length} sản phẩm
          </p>
        </div>

        {/* Wishlist Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-white">
              Thử thay đổi bộ lọc để xem kết quả khác
            </p>
          </div>
        ) : (
          <motion.div
            className={`grid gap-8 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredItems.map((item, index) => {
              const isAddingToCart = addingToCart.has(item._id);
              const isAvailable =
                item.status === "available" && item.inventory > 0;
              const uniqueColors = getUniqueColors(item.variant);
              const uniqueSizes = getUniqueSizes(item.variant);

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group flex flex-col ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  {/* Product Image */}
                  <div
                    className={`relative ${
                      viewMode === "list" ? "w-48 flex-shrink-0" : ""
                    }`}
                  >
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.productName}
                      className={`object-cover ${
                        viewMode === "list" ? "w-full h-full" : "w-full h-48"
                      }`}
                      onError={(e) => {
                        e.target.src =
                          "http://localhost:4173/placeholder-product.jpg";
                      }}
                    />

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isAvailable ? "Còn hàng" : "Hết hàng"}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() =>
                        handleRemoveFromWishlist(item._id, item.productName)
                      }
                      className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      <Heart className="w-4 h-4 text-pink-600 fill-current" />
                    </button>

                    {/* Out of stock overlay */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          Hết hàng
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <Link to={`/products/${item._id}`}>
                      <h3 className="font-bold text-white hover:text-[#9fd700] transition-colors line-clamp-2">
                        {item.productName}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#9fd700]">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice &&
                          item.originalPrice > item.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                      </div>
                      {item.originalPrice &&
                        item.originalPrice > item.price && (
                          <div className="text-sm text-green-600 font-medium">
                            Tiết kiệm{" "}
                            {formatPrice(item.originalPrice - item.price)}
                          </div>
                        )}
                    </div>

                    {/* Variants */}
                    {(uniqueColors.length > 0 || uniqueSizes.length > 0) && (
                      <div className="mb-4 space-y-2">
                        {uniqueColors.length > 0 && (
                          <div>
                            <span className="text-sm text-white">
                              Màu sắc:{" "}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {uniqueColors.slice(0, 2).map((color, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                >
                                  {color}
                                </span>
                              ))}
                              {uniqueColors.length > 2 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                  +{uniqueColors.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {uniqueSizes.length > 0 && (
                          <div>
                            <span className="text-sm text-white">
                              Kích thước:{" "}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {uniqueSizes.slice(0, 3).map((size, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                >
                                  {size}
                                </span>
                              ))}
                              {uniqueSizes.length > 3 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                  +{uniqueSizes.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Inventory Warning */}
                    {isAvailable && item.inventory <= 5 && (
                      <p className="text-sm text-orange-600 mb-3">
                        ⚠️ Chỉ còn {item.inventory} sản phẩm
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-auto space-y-2">
                      <div
                        className={`grid gap-2 ${
                          viewMode === "list"
                            ? "grid-cols-1 sm:grid-cols-3"
                            : "grid-cols-1"
                        }`}
                      >
                        <Link
                          to={`/products/${item._id}`}
                          className="border-2 rounded-lg text-white px-8 py-3 opacity-50rounded-xl leading-snug font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    style={{
                      borderColor: "#b2f2bb",
                      boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",}}
                        >
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </Link>

                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={!isAvailable || isAddingToCart}
                          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            !isAvailable
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : isAddingToCart
                              ? "bg-blue-500 text-white cursor-wait"
                              : "bg-gradient-to-r from-[#446158] to-[#384b04] text-white "
                          }`}
                        >
                          {isAddingToCart ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Đang thêm...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Thêm vào giỏ
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleMoveToCart(item)}
                          disabled={!isAvailable || isAddingToCart}
                          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            !isAvailable
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-pink-400 hover:bg-pink-500 text-white"
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          Chuyển vào giỏ
                        </button>
                      </div>
                    </div>

                    {/* Added Date */}
                    <div className="text-xs text-gray-400 mt-2">
                      Đã thêm:{" "}
                      {new Date(item.addedToWishlistAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Quick Actions */}
        {getTotalItems() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 bg-gradient-to-r from-[#a9b880] to-[#446158] rounded-lg p-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-4">
                Thao tác nhanh
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const availableItems = wishlistItems.filter(
                      (item) =>
                        item.status === "available" && item.inventory > 0
                    );
                    availableItems.forEach((item) => handleAddToCart(item));
                  }}
                  className="bg-gradient-to-r font-bold from-[#fffeef] to-[#9fd700] text-black px-8 py-3 rounded-xl leading-snug hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{
                      boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",
                    }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm tất cả vào giỏ
                </button>

                <Link
                  to="/products"
                  className="border-2  text-white px-8 py-3 opacity-50rounded-xl leading-snug font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  style={{
                    borderColor: "#b2f2bb",
                    boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",
                  }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </UserLayout>
  );
};

export default WishlistPage;
