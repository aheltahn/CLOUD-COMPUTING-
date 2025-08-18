import React, { useState } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";

const SearchFilterBar = ({ onSearch, onFilter, filters = {} }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || "all",
    priceMin: filters.priceMin || "",
    priceMax: filters.priceMax || "",
    sortBy: filters.sortBy || "newest",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      status: "all",
      priceMin: "",
      priceMax: "",
      sortBy: "newest",
    };
    setLocalFilters(defaultFilters);
    onFilter?.(defaultFilters);
  };

  const hasActiveFilters =
    localFilters.status !== "all" ||
    localFilters.priceMin ||
    localFilters.priceMax ||
    localFilters.sortBy !== "newest";

  return (
    <div className=" rounded-lg shadow-sm p-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex-1 relative ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-white bg-transparent  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r font-bold from-[#fffeef] to-[#9fd700] text-black px-8 py-3 rounded-xl leading-snug hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  style={{
                    boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",
                  }}
        >
          Tìm kiếm
        </button>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-white hover:text-[#446158] transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Bộ lọc
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Đang lọc
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Trạng thái
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="available">Còn hàng</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Giá từ (VNĐ)
              </label>
              <input
                type="number"
                placeholder="0"
                value={localFilters.priceMin}
                onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Giá đến (VNĐ)
              </label>
              <input
                type="number"
                placeholder="999999999"
                value={localFilters.priceMax}
                onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Sắp xếp theo
              </label>
              <select
                value={localFilters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
                <option value="name_asc">Tên A-Z</option>
                <option value="name_desc">Tên Z-A</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
