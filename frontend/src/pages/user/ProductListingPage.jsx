import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "../../components/user/ProductCard";
import SearchFilterBar from "../../components/user/SearchFilterBar";
import LoadingSpinner from "../../components/LoadingSpinner";
import UserLayout from "../../components/user/UserLayout";
import { ShoppingBag, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = "http://localhost:4173/api/products";

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách sản phẩm");
      }
      const data = await response.json();

      // Handle new pagination response format
      let availableProducts = [];
      if (data.products) {
        // New format: {products: [...], pagination: {...}}
        availableProducts = data.products.filter(
          (product) =>
            product.status === "available" || product.status === "out_of_stock"
        );
      } else if (Array.isArray(data)) {
        // Old format: [...]
        availableProducts = data.filter(
          (product) =>
            product.status === "available" || product.status === "out_of_stock"
        );
      } else {
        // Fallback
        availableProducts = [];
      }

      setProducts(availableProducts);
      setFilteredProducts(availableProducts);
    } catch (err) {
      setError(err.message);
      toast.error("Lỗi khi tải sản phẩm: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle search
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      setCurrentPage(1);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // Handle filter
  const handleFilter = (filters) => {
    let filtered = [...products];

    // Filter by status
    // if (filters.status !== "all") {
    //   filtered = filtered.filter(
    //     (product) => product.status === filters.status
    //   );
    // }

    if (filters.status === "available") {
      filtered = filtered.filter(
        (product) => product.status === "available" && product.inventory > 0
      );
    } else if (filters.status === "out_of_stock") {
      filtered = filtered.filter(
        (product) => product.inventory <= 0
      );
    }
    
    
    // Filter by price range
    if (filters.priceMin) {
      filtered = filtered.filter(
        (product) => product.price >= parseInt(filters.priceMin)
      );
    }
    if (filters.priceMax) {
      filtered = filtered.filter(
        (product) => product.price <= parseInt(filters.priceMax)
      );
    }

    // Sort products
    switch (filters.sortBy) {
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
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <UserLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="py-8">
        {/* Page Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-green-200" />
            <h1 className="text-3xl font-bold text-[#9fd700]">
              Khám phá sản phẩm
            </h1>
          </div>
          <p className="text-white mt-2">
            Tìm kiếm và mua sắm những sản phẩm tuyệt vời
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter */}
          <SearchFilterBar onSearch={handleSearch} onFilter={handleFilter} />

          {/* Products Count */}
          <div className="mb-6">
            <p className="text-white">
              Hiển thị {currentProducts.length} trong tổng số{" "}
              {filteredProducts.length} sản phẩm
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-600">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {currentProducts.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                  />
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default ProductListingPage;