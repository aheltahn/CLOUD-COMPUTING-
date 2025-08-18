import React, { useState } from "react";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore"; // Import wishlist store
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProductCard = ({ product, index }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore(); // Use wishlist store
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const navigate = useNavigate();

  const getStatusBadge = (status, inventory) => {
    if (inventory <= 0) {
      return { text: "Hết hàng", class: "bg-red-100 text-red-800" };
    }
    if (status === "available") {
      return { text: "Còn hàng", class: "bg-green-100 text-green-800" };
    }
    return { text: "Ngưng bán", class: "bg-gray-100 text-gray-800" };
  };

  const handleAddToCart = () => {
    toast.success("Bạn cần chọn màu sắc, kích thước và số lượng sản phẩm");
    navigate(`/products/${product._id}`); 
  };
  
  // NEW: Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking heart
    e.stopPropagation();

    setIsTogglingWishlist(true);
    try {
      await toggleWishlist(product._id);
    } catch (error) {
      // Error already handled in store
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const statusBadge = getStatusBadge(product.status, product.inventory);
  const isAvailable = product.status === "available" && product.inventory > 0;
  const productInWishlist = isInWishlist(product._id); // Check if in wishlist

  return (
    <div className="bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group flex flex-col">
      {/* Product Image */}
      <div className="relative ">
        <img
          src={
            product.image
              ? `http://localhost:4173${product.image}`
              : "http://localhost:4173/placeholder-product.jpg"
          }
          alt={product.productName}
          className="w-full group-hover:scale-105 h-64 object-cover transition-transform duration-500 rounded-lg"
        />

        {/* Status Badge */}
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}
        >
          {statusBadge.text}
        </div>

        {/* Quick Actions - Show on hover */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* UPDATED: Wishlist Button with active state */}
          <button
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
            className={`p-2 rounded-full shadow-md transition-all ${
              productInWishlist
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "bg-white hover:bg-pink-50 text-gray-600 hover:text-pink-500"
            } ${isTogglingWishlist ? "cursor-wait opacity-75" : ""}`}
            title={
              productInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"
            }
          >
            {isTogglingWishlist ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <Heart
                className={`w-4 h-4 ${productInWishlist ? "fill-current" : ""}`}
              />
            )}
          </button>

          <Link
            to={`/products/${product._id}`}
            className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
          </Link>
        </div>

        {/* Out of stock overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {product.inventory <= 0 ? "Hết hàng" : "Ngưng bán"}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-white hover:text-[#9fd700] transition-colors line-clamp-2 min-h-[3rem]">
            {product.productName}
          </h3>
        </Link>

        {/* Price */}
        <div className="mb-3">
          <span className="text-xl font-bold text-[#9fd700]">
            {product.price?.toLocaleString("vi-VN")}đ
          </span>
        </div>

        {/* Variants Preview - FIXED VERSION */}
        <div className="mb-3 min-h-[3rem]">
          {product.variant && product.variant.length > 0 ? (
            <>
              {/* Helper functions để xử lý variants */}
              {(() => {
                const uniqueColors = [
                  ...new Set(
                    product.variant.map((v) => v.color).filter(Boolean)
                  ),
                ];
                const uniqueSizes = [
                  ...new Set(
                    product.variant.map((v) => v.size).filter(Boolean)
                  ),
                ];

                return (
                  <div className="space-y-2">
                    {/* Colors */}
                    {uniqueColors.length > 0 && (
                      <div>
                        <div className="text-sm text-white mb-1">
                          Màu sắc:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {uniqueColors.slice(0, 2).map((color, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {color}
                            </span>
                          ))}
                          {uniqueColors.length > 2 && (
                            <span className="text-xs text-white px-2 py-1">
                              +{uniqueColors.length - 2} màu khác
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {uniqueSizes.length > 0 && (
                      <div>
                        <div className="text-sm text-white mb-1">Kích thước:</div>
                        <div className="flex flex-wrap gap-1">
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
                              +{uniqueSizes.length - 3} Kích thước khác
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="text-sm text-gray-400">Không có biến thể</div>
          )}
        </div>

        {/* Add to Cart Button - Simple without quantity */}
        <div className="mt-auto">
  <button
    onClick={handleAddToCart}
    disabled={!isAvailable || isAdding}
    className={`w-full flex items-center justify-center hover:scale-105 font-bold gap-2 py-3 px-4 rounded-lg transition-colors ${
      !isAvailable
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-gradient-to-r from-[#446158] to-[#384b04] text-white "
    }`}
  >
    <ShoppingCart className="w-4 h-4" />
    Thêm vào giỏ
  </button>
</div>


        {/* Inventory Warning */}
        {isAvailable && product.inventory <= 5 && (
          <p className="text-xs text-orange-600 mt-2 text-center">
            ⚠️ Chỉ còn {product.inventory} sản phẩm
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
