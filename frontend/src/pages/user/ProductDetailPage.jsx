import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Plus,
  Minus,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore"; // Import wishlist store
import LoadingSpinner from "../../components/LoadingSpinner";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore(); // Use wishlist store

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedColor, setSelectedColor] = useState(""); // Separate color selection
  const [selectedSize, setSelectedSize] = useState(""); // Separate size selection
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false); // Wishlist loading state

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();
        console.log("📦 Product data:", data);
        console.log("🖼️ Product image path:", data.image);
        setProduct(data);
      } catch (err) {
        console.error("❌ Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Helper functions để xử lý variants
  const getUniqueColors = () => {
    if (!product?.variant || product.variant.length === 0) return [];
    const colors = product.variant.map((v) => v.color).filter(Boolean);
    return [...new Set(colors)];
  };

  const getUniqueSizes = () => {
    if (!product?.variant || product.variant.length === 0) return [];
    const sizes = product.variant.map((v) => v.size).filter(Boolean);
    return [...new Set(sizes)];
  };

  const getSelectedVariant = () => {
    if (!product?.variant || product.variant.length === 0) return null;
    return (
      product.variant.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      ) || product.variant[0]
    );
  };

  const getAvailableSizesForColor = (color) => {
    if (!product?.variant || product.variant.length === 0) return [];
    return product.variant
      .filter((v) => v.color === color)
      .map((v) => v.size)
      .filter(Boolean);
  };

  const getAvailableColorsForSize = (size) => {
    if (!product?.variant || product.variant.length === 0) return [];
    return product.variant
      .filter((v) => v.size === size)
      .map((v) => v.color)
      .filter(Boolean);
  };

  

  // Set default selections when product loads
  useEffect(() => {
    if (product?.variant && product.variant.length > 0) {
      const firstVariant = product.variant[0];
      if (!selectedColor && firstVariant.color) {
        setSelectedColor(firstVariant.color);
      }
      if (!selectedSize && firstVariant.size) {
        setSelectedSize(firstVariant.size);
      }
    }
  }, [product]);

  // Helper function để tạo URL hình ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.includes("placeholder")) {
      return `http://localhost:4173/placeholder-product.jpg`;
    }

    // Extract filename từ path
    let filename = imagePath;
    if (imagePath.includes("/uploads/")) {
      filename = imagePath.replace("/uploads/", "");
    } else if (imagePath.includes("/")) {
      filename = imagePath.split("/").pop();
    }

    // Sử dụng /uploads/ endpoint vì nó đã hoạt động
    return `http://localhost:4173/uploads/${filename}`;
  };

  // const handleAddToCart = () => {
  //   if (!user) {
  //     navigate("/login");
  //     return;
  //   }

  //   // Lấy variant được chọn
  //   const selectedVariant = getSelectedVariant();

  //   const productToAdd = {
  //     ...product,
  //     quantity: quantity,
  //     selectedVariant: selectedVariant,
  //     selectedColor: selectedColor,
  //     selectedSize: selectedSize,
  //   };

  //   addToCart(productToAdd);

  //   // Show success message (you can implement toast notification)
  //   alert("Product added to cart successfully!");
  // };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
  
    console.log('🛒 Adding to cart with quantity:', quantity);
  
    // Lấy variant được chọn
    const selectedVariant = getSelectedVariant();
  
    // Gọi addToCart với 2 tham số riêng biệt
    addToCart(product, quantity); // ← SỬA ĐÂY: truyền quantity riêng
  
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prev) => Math.min(prev + 1, product.inventory));
    } else {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsTogglingWishlist(true);
    try {
      await toggleWishlist(product._id);
    } catch (error) {
      // Error already handled in store
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.productName,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }


  

  // Process product images - chỉ sau khi product đã được load
  const productImages = product.image
    ? [getImageUrl(product.image)]
    : [`http://localhost:4173/placeholder-product.jpg`];

  // Debug log
  console.log("🖼️ Original image path:", product.image);
  console.log("🖼️ Final image URL:", productImages[0]);

  return (
    <UserLayout>
    <div className="min-h-screen"
    style={{
      backgroundImage:
        "linear-gradient(to bottom, #051F20, #0B2B26, #163832, #235347, #8EB69B, #DAF1DE)",
    }}>
      {/* Navigation */}
      <div className="shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white hover:text-[#9fd700] transition duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10  rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={productImages[selectedImage]}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log("❌ Image load error for:", e.target.src);
                    console.log("❌ Setting fallback to placeholder");
                    e.target.src =
                      "http://localhost:4173/placeholder-product.jpg";
                  }}
                  onLoad={(e) => {
                    console.log("✅ Image loaded successfully:", e.target.src);
                  }}
                />
              </div>

              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.productName} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and Actions */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {product.productName}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating || 4.5)
                              ? "text-yellow-400 fill-current"
                              : "text-white"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-white">
                        ({product.reviews || 0} đánh giá)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleWishlist}
                    disabled={isTogglingWishlist}
                    className={`p-2 rounded-full border transition-all ${
                      isInWishlist(product._id)
                        ? "bg-pink-500 border-pink-500 text-white hover:bg-pink-600"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600"
                    } ${isTogglingWishlist ? "cursor-wait opacity-75" : ""}`}
                    title={
                      isInWishlist(product._id)
                        ? "Xóa khỏi yêu thích"
                        : "Thêm vào yêu thích"
                    }
                  >
                    {isTogglingWishlist ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    ) : (
                      <Heart
                        className={`w-5 h-5 ${
                          isInWishlist(product._id) ? "fill-current" : ""
                        }`}
                      />
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price with variant calculation */}
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-[#9fd700]">
                  {formatPrice(product.price)}
                  </span>
                  {getSelectedVariant()?.price && (
                    <div className="text-sm text-gray-500">
                      <div>Base: ${product.price.toFixed(2)}</div>
                      <div>
                        Option: +${getSelectedVariant().price.toFixed(2)}
                      </div>
                    </div>
                  )}
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="text-xl text-white line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                </div>

                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <div className="text-sm text-green-600 font-medium">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                      (
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % off)
                    </div>
                  )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    product.status === "available" && product.inventory > 10
                      ? "bg-green-500"
                      : product.status === "available" && product.inventory > 0
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    product.status === "available" && product.inventory > 10
                      ? "text-green-600"
                      : product.status === "available" && product.inventory > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {product.status === "available" && product.inventory > 10
                    ? "Còn hàng"
                    : product.status === "available" && product.inventory > 0
                    ? `Chỉ còn ${product.inventory} sản phẩm`
                    : product.status === "out_of_stock"
                    ? "Hết hàng"
                    : "Unavailable"}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Mô tả chi tiết
                </h3>
                <div
                  className={`text-white ${
                    showFullDescription ? "" : "line-clamp-3"
                  }`}
                >
                  {product.description}
                </div>
                {product.description && product.description.length > 150 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-white hover:text-[#9fd700] text-sm font-medium mt-1"
                  >
                    {showFullDescription ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>

              {/* Variants - New Smart Selection UI */}
              {product.variant && product.variant.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">
                    Lựa chọn
                  </h3>

                  {/* Color Selection */}
                  {getUniqueColors().length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-green-200 mb-3">
                        Màu sắc:{" "}
                        <span className="text-white font-semibold">
                          {selectedColor || "Please select"}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {getUniqueColors().map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              // Reset size if it's not available for this color
                              const availableSizes =
                                getAvailableSizesForColor(color);
                              if (
                                selectedSize &&
                                !availableSizes.includes(selectedSize)
                              ) {
                                setSelectedSize(availableSizes[0] || "");
                              }
                            }}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              selectedColor === color
                                ? "border-[#446158] bg-blue-50 text-[#446158]"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  {getUniqueSizes().length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Kích thước:{" "}
                        <span className="text-white font-semibold">
                          {selectedSize || "Please select"}
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {getUniqueSizes().map((size) => {
                          const isAvailable = selectedColor
                            ? getAvailableSizesForColor(selectedColor).includes(
                                size
                              )
                            : true;

                          return (
                            <button
                              key={size}
                              onClick={() => {
                                if (isAvailable) {
                                  setSelectedSize(size);
                                  // Reset color if it's not available for this size
                                  const availableColors =
                                    getAvailableColorsForSize(size);
                                  if (
                                    selectedColor &&
                                    !availableColors.includes(selectedColor)
                                  ) {
                                    setSelectedColor(availableColors[0] || "");
                                  }
                                }
                              }}
                              disabled={!isAvailable}
                              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                !isAvailable
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : selectedSize === size
                                  ? "border-[#446158] bg-blue-50 text-[#446158]"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                              }`}
                            >
                              {size}
                              {!isAvailable && (
                                <span className="ml-1 text-xs">✕</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Combination Summary */}
                  {(selectedColor || selectedSize) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-[#446158] mb-2">
                        Lựa chọn của bạn:
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4 text-sm">
                          {selectedColor && (
                            <span className="text-[#446158]">
                              <span className="font-medium">Màu sắc:</span>{" "}
                              {selectedColor}
                            </span>
                          )}
                          {selectedSize && (
                            <span className="text-[#446158]">
                              <span className="font-medium">Kích thước:</span>{" "}
                              {selectedSize}
                            </span>
                          )}
                        </div>
                        {getSelectedVariant()?.price && (
                          <span className="text-sm font-medium text-[#446158]">
                            +${getSelectedVariant().price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation Message */}
                  {product.variant.length > 0 &&
                    (!selectedColor || !selectedSize) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Vui lòng chọn cả màu sắc và kích thước trước khi thêm vào giỏ hàng.
                        </p>
                      </div>
                    )}
                </div>
              )}

              {/* Quantity and Add to Cart */}
              {product.status === "available" && product.inventory > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-white">
                      Số lượng:
                    </span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange("decrease")}
                        disabled={quantity <= 1}
                        className="p-2 text-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 text-white text-center min-w-12">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange("increase")}
                        disabled={quantity >= product.inventory}
                        className="p-2 text-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={
                      product.variant &&
                      product.variant.length > 0 &&
                      (!selectedColor || !selectedSize)
                    }
                    className={`w-full py-3 px-6 rounded-lg font-medium transition duration-200 flex items-center justify-center space-x-2 ${
                      product.variant &&
                      product.variant.length > 0 &&
                      (!selectedColor || !selectedSize)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#446158] to-[#384b04] text-white hover:scale-105"
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>
                      {product.variant &&
                      product.variant.length > 0 &&
                      (!selectedColor || !selectedSize)
                        ? "Please select options"
                        : "Thêm vào giỏ hàng"}
                    </span>
                  </button>
                </div>
              )}

              {/* Product unavailable message */}
              {(product.status !== "available" || product.inventory <= 0) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 font-medium text-center">
                    {product.status === "out_of_stock" || product.inventory <= 0
                      ? "This product is currently out of stock"
                      : "This product is currently unavailable"}
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Miễn phí vận chuyển
                      </div>
                      <div className="text-xs text-gray-500">
                        Áp dụng cho đơn hàng trên 1,000,000đ
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Đổi trả dễ dàng
                      </div>
                      <div className="text-xs text-gray-500">
                        Chính sách hoàn trả trong 30 ngày
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Bảo mật thanh toán
                      </div>
                      <div className="text-xs text-gray-500">
                        Quy trình thanh toán an toàn
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </UserLayout>
  );
};

export default ProductDetailPage;
