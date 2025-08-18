import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import UserLayout from "../components/user/UserLayout";
import {
  ShoppingBag,
  TrendingUp,
  Star,
  Package,
  Heart,
  Clock,
  ArrowRight,
  Zap,
  Gift,
  Users,
  Award,
  Sparkles,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carousel states
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerPage = 3; // Số sản phẩm hiển thị cùng lúc
  const totalSlides = Math.ceil(featuredProducts.length / itemsPerPage);

  const [activeIndex, setActiveIndex] = useState(0);

  // Tạo base64 placeholder image
  const getPlaceholderImage = () => {
    const svg = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" 
              font-family="Arial, sans-serif" font-size="16">
          No Image
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Thêm function này sau getPlaceholderImage()
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.includes("placeholder")) {
      return getPlaceholderImage();
    }

    // Extract filename từ path
    let filename = imagePath;
    if (imagePath.includes("/uploads/")) {
      filename = imagePath.replace("/uploads/", "");
    } else if (imagePath.includes("/")) {
      filename = imagePath.split("/").pop();
    }

    // Sử dụng /uploads/ endpoint
    return `http://localhost:4173/uploads/${filename}`;
  };

  // Auto slide effect
  useEffect(() => {
    if (featuredProducts.length > itemsPerPage) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 4000); // Auto slide every 4 seconds

      return () => clearInterval(interval);
    }
  }, [featuredProducts.length, totalSlides]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Get current products to display
  const getCurrentProducts = () => {
    const startIndex = currentSlide * itemsPerPage;
    return featuredProducts.slice(startIndex, startIndex + itemsPerPage);
  };

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        console.log("🚀 Fetching products from API...");

        const response = await fetch(
          "/api/products?page=1&limit=9&sortBy=newest"
        ); // Tăng limit để có nhiều sản phẩm cho carousel
        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📦 Data received:", data);

        setFeaturedProducts(data.products || []);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
        setError(err.message);

        // Fallback data với nhiều sản phẩm hơn để test carousel
        setFeaturedProducts([
          {
            _id: "1",
            productName: "Áo thun nam basic Cotton",
            price: 299000,
            image: null,
            status: "available",
            inventory: 50,
            description: "Áo thun nam cổ tròn, chất liệu cotton 100%",
          },
          {
            _id: "2",
            productName: "Quần jeans nữ skinny fit",
            price: 599000,
            image: null,
            status: "available",
            inventory: 30,
            description: "Quần jeans nữ ôm dáng, co giãn tốt",
          },
          {
            _id: "3",
            productName: "Váy midi vintage floral",
            price: 799000,
            image: null,
            status: "available",
            inventory: 20,
            description: "Váy midi họa tiết hoa vintage, thắt eo",
          },
          {
            _id: "4",
            productName: "Áo khoác bomber unisex",
            price: 899000,
            image: null,
            status: "available",
            inventory: 15,
            description: "Áo khoác bomber phong cách streetwear",
          },
          {
            _id: "5",
            productName: "Chân váy tennis pleated",
            price: 399000,
            image: null,
            status: "available",
            inventory: 25,
            description: "Chân váy tennis xếp ly, phong cách Y2K",
          },
          {
            _id: "6",
            productName: "Áo sơ mi oversized",
            price: 699000,
            image: null,
            status: "available",
            inventory: 40,
            description: "Áo sơ mi form rộng, phong cách Korean",
          },
          {
            _id: "7",
            productName: "Quần short thể thao",
            price: 199000,
            image: null,
            status: "available",
            inventory: 35,
            description: "Quần short thoáng mát cho mùa hè",
          },
          {
            _id: "8",
            productName: "Áo croptop basic",
            price: 149000,
            image: null,
            status: "available",
            inventory: 45,
            description: "Áo croptop basic nhiều màu",
          },
          {
            _id: "9",
            productName: "Túi xách mini",
            price: 399000,
            image: null,
            status: "available",
            inventory: 20,
            description: "Túi xách mini thời trang",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const categories = [
    {
      name: "SOFA",
      count: "50+",
      slug: "sofa",
      bgImage:
        "https://noithatdangkhoa.com/wp-content/uploads/2024/06/ghe-sofa-vang-da-phong-khach-sfdk124.jpg",
    },
    {
      name: "Bàn trà",
      count: "30+",
      slug: "ban-tra",
      bgImage:
        "https://noithatkenli.vn/wp-content/uploads/2023/05/ban-tra-trixi-anh-bia.jpg",
    },
    {
      name: "Bàn ghế ăn",
      count: "20+",
      bgImage:
        "https://phongkhachdep.org/wp-content/uploads/2022/05/Bo%CC%A3%CC%82-Pho%CC%80ng-A%CC%86n-Royal-PKD-01-2.jpeg",
    },
    {
      name: "Ghế",
      count: "15+",
      bgImage:
        "https://i.pinimg.com/1200x/a3/86/83/a38683b5f33b9fec1c0f27e4cd8251d1.jpg",
    },
    {
      name: "Kệ",
      count: "10+",
      slug: "ke",
      bgImage:
        "https://woodaction.com/cdn/shop/files/half-nancy-corner-shelf-636_1024x1024@2x.jpg?v=1729585668",
    },
    {
      name: "Thảm",
      count: "8+",
      slug: "tham",
      bgImage:
        "https://vietcanvas.net/cdn/shop/products/tham-sofa-trai-san.webp?v=1671010822",
    },
  ];

  const quickActions = [
    {
      title: "Thời trang mới nhất",
      description: "Khám phá xu hướng thời trang hot trend",
      icon: Sparkles,
      color: "bg-pink-500",
      link: "/products?filter=new",
    },
    {
      title: "Sale up to 70%",
      description: "Ưu đãi đặc biệt cho thời trang mùa",
      icon: Gift,
      color: "bg-red-500",
      link: "/products?filter=sale",
    },
    {
      title: "Bộ sưu tập yêu thích",
      description: "Lưu những outfit bạn thích nhất",
      icon: Heart,
      color: "bg-pink-500",
      link: "/wishlist",
    },
    {
      title: "Đơn hàng của tôi",
      description: "Theo dõi tình trạng đơn hàng",
      icon: Package,
      color: "bg-blue-500",
      link: "/orders",
    },
  ];

  const reasons = [
    {
      title: "Tiếp nối di sản 25 năm",
      content:
        "Từ năm 1999, Interior  đã đồng hành với hàng triệu gia đình Việt Nam. Hệ thống phân mục sản phẩm đa dạng từ chăn ga, gối, đệm đến màn rèm, khăn, phụ kiện làm từ vải. Đến nay, Interior  không ngừng nâng cấp chất lượng và đổi mới danh mục sản phẩm, góp phần kiến tạo trải nghiệm sống tinh tế cho từng căn nhà.",
      image:
        "https://i.pinimg.com/736x/f2/b6/2f/f2b62fff563fcf6dc38c58cb9175bbfc.jpg",
    },
    {
      title: "Chất liệu cao cấp & thân thiện",
      content:
        "Interior  luôn sử dụng những chất liệu tự nhiên như cotton, modal, tencel... mang lại sự êm ái, thấm hút tốt và thân thiện với môi trường.",
      image:
        "https://i.pinimg.com/736x/df/5e/06/df5e0647f9e42619edb770a90e7ccf31.jpg",
    },
    {
      title: "Họa tiết tinh tế, đậm chất Hàn Quốc",
      content:
        "Các bộ sưu tập của Interior  lấy cảm hứng từ thiên nhiên, kết hợp giữa yếu tố truyền thống và hiện đại để tạo ra phong cách riêng biệt.",
      image:
        "https://i.pinimg.com/1200x/e3/c7/13/e3c7131ea53be4ee7012c6cf7ee558e4.jpg",
    },
    {
      title: "Kỹ thuật may hiện đại",
      content:
        "Interior  ứng dụng công nghệ sản xuất tiên tiến, từng đường may được chăm chút tỉ mỉ, đảm bảo độ bền và tính thẩm mỹ cao.",
      image:
        "https://i.pinimg.com/736x/7d/97/e1/7d97e1b51286be375a519de1ac68b0ed.jpg",
    },
    {
      title: "Phát triển bền vững",
      content:
        "Interior  hướng tới phát triển bền vững bằng cách tối ưu hóa quy trình sản xuất và sử dụng nguyên liệu thân thiện với môi trường.",
      image:
        "https://i.pinimg.com/736x/4c/32/49/4c324983248a45a782d5a93848845b48.jpg",
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <UserLayout>
      <div
        className="min-h-screen"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, #051F20, #0B2B26, #163832, #235347, #8EB69B, #DAF1DE)",
        }}
      >
        {/* Hero Banner */}
        <section className="relative text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://7715496.fs1.hubspotusercontent-na1.net/hub/7715496/hubfs/n%E1%BB%99i%20th%E1%BA%A5t%20th%C3%B4ng%20minh/noi-that-thong-minh%20(4)-1.jpg?quality=low&width=1000&height=666&name=noi-that-thong-minh%20(4)-1.jpg')",
            }}
          ></div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/0"></div>

          <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 p-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                  Không gian đẹp, cuộc sống chất
                </h1>
                <p className="text-xl mb-8 text-white">
                  Từ chất liệu đến cảm xúc – mỗi món nội thất là một câu chuyện
                  về phong cách và sự tinh tế.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/products"
                    className="bg-gradient-to-r font-bold from-[#fffeef] to-[#9fd700] text-black px-8 py-3 rounded-xl leading-snug hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{
                      boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",
                    }}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop ngay
                  </Link>
                  <Link
                    to="/products?filter=sale"
                    className="border-2  text-white px-8 py-3 opacity-50rounded-xl leading-snug font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    style={{
                      borderColor: "#b2f2bb",
                      boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",
                    }}
                  >
                    <Zap className="w-5 h-5" />
                    Sale hot
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-3xl p-8 border border-white/20 overflow-hidden">
                  {/* Layer nền gradient với opacity */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9fd700] to-[#446158]  z-0" />

                  {/* Nội dung chính */}
                  <div className="relative z-10 backdrop-blur-sm text-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[#272c1a] rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white-800" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Ưu đãi hôm nay</h3>
                        <p className="text-blue-100">Chỉ có trong 24h</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Miễn phí vận chuyển</span>
                        <span className="bg-[#446158] text-white px-2 py-1 rounded-full text-sm">
                          ✓ Active
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Giảm 20% đơn đầu tiên</span>
                        <span className="bg-[#446158] text-white px-2 py-1 rounded-full text-sm">
                          ✓ Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Categories */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                Danh mục
                <span style={{ color: "#9fd700" }}> phổ biến</span>
              </h2>
              <Link
                to="/products"
                className="text-white hover:text-green-700 font-medium flex items-center gap-2"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {/* <Link
                    to={`/products?category=${category.slug}`}
                    className="block bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">{category.count}</p>
                  </Link> */}

                  <Link
                    to={`/products?category=${category.slug}`}
                    key={category.slug}
                    className="relative flex items-center rounded-lg p-4  overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 text-white aspect-square"
                    style={{
                      backgroundImage: `url(${category.bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Overlay đen mờ để chữ nổi bật */}
                    <div className="absolute inset-0 bg-black bg-opacity-60"></div>

                    {/* Nội dung phải nằm trên overlay */}
                    <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
                      <h3 className="text-lg font-semibold mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm">{category.count} sản phẩm</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          <article className="flex flex-col-reverse justify-center gap-5 md:flex-row items-center w-full mb-16">
            <div className="relative flex flex-col justify-center text-center md:text-left md:justify-between items-center md:items-start gap-9 md:basis-1/2 basis-full">
              <h1 className="text-6xl font-bold text-white ">
                Nội thất{" "}
                <span
                  className="text-rosa"
                  style={{
                    background: "linear-gradient(to right, #fffeef, #9fd700)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {" "}
                  chuẩn gu{" "}
                </span>
              </h1>
              <h1 className="text-6xl font-bold text-white ">
                Nhà{" "}
                <span
                  className="text-rosa"
                  style={{
                    background: "linear-gradient(to right, #fffeef, #9fd700)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {" "}
                  chuẩn chất{" "}
                </span>
              </h1>
              <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-yellow-200 rounded-full blur-3xl opacity-20 z-10 ml-24"></div>

              <p className="text-lg text-white max-w-[430px]">
                Chúng tôi luôn mang đến niềm vui, cảm hứng và sự hài lòng cho
                khách hàng thông qua vô vàn lựa chọn nội thất đa dạng, kết hợp
                giữa thiết kế tinh tế, chất liệu bền đẹp và phong cách phù hợp
                với mọi không gian sống.
              </p>
            </div>

            <div className="flex flex-row items-center justify-center relative pt-20 gap-4 md:basis-1/2 basis-full bggreen-600 w-full">
              <img
                loading="lazy"
                className="absolute -z-10 top-5 left-0 right-0 mx-auto"
                src="/layer.svg"
                alt="bg in svg"
              />

              <div className="flex sm:flex-col gap-4">
                <img
                  loading="lazy"
                  className="rounded-3xl w-60 h-80 hidden sm:block"
                  src="https://i.pinimg.com/736x/e6/35/13/e635130764d42dc473c08109a9ed9c2c.jpg"
                  alt="image interior"
                />
                <img
                  loading="lazy"
                  className="rounded-3xl w-60 h-80"
                  src="https://i.pinimg.com/736x/ec/02/0e/ec020eba34b36068c534935502b9526c.jpg"
                  alt="image interior"
                />
              </div>

              <div className="hidden sm:block">
                <img
                  loading="lazy"
                  className="w-60 h-80 object-cover rounded-3xl"
                  src="https://i.pinimg.com/736x/c0/41/0d/c0410dd778565ea2cae4efc5dec3e40a.jpg"
                  alt="image interior"
                />
              </div>
            </div>
          </article>

          {/* Featured Products Carousel */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                Sản phẩm
                <span style={{ color: "#9fd700" }}> nổi bật</span>
              </h2>
              <Link
                to="/products"
                className="text-white hover:text-green-700 font-medium flex items-center gap-2"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Đang tải sản phẩm...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="text-red-500 mb-4">
                  ❌ Không thể tải sản phẩm: {error}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
                >
                  Thử lại
                </button>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-500 mb-4">
                  📦 Chưa có sản phẩm nào
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 max-w-screen-2xl mx-auto">
                {/* Left button */}
                {totalSlides > 1 && (
                  <button
                    onClick={prevSlide}
                    className="flex-shrink-0 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                )}
                <div className="flex flex-col space-y-8 ">
                  {/* Carousel Container */}
                  <div className="overflow-hidden ">
                    <motion.div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                      }}
                    >
                      {Array.from({ length: totalSlides }).map(
                        (_, slideIndex) => (
                          <div
                            key={slideIndex}
                            className="w-full flex-shrink-0 grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                          >
                            {featuredProducts
                              .slice(
                                slideIndex * itemsPerPage,
                                (slideIndex + 1) * itemsPerPage
                              )
                              .map((product, index) => (
                                <motion.div
                                  key={product._id}
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                  }}
                                  viewport={{ once: true }}
                                  className="bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group"
                                >
                                  <div className="relative ">
                                    {/* <img
                                    src={
                                      product.image
                                        ? `http://localhost:4173/${product.image}`
                                        : getPlaceholderImage()
                                    }
                                    alt={product.productName}
                                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                      e.target.src = getPlaceholderImage();
                                    }}
                                  /> */}
                                    <img
                                      src={getImageUrl(product.image)}
                                      alt={product.productName}
                                      className="w-full group-hover:scale-105 h-64 object-cover transition-transform duration-500 rounded-lg"
                                      onError={(e) => {
                                        e.target.src = getPlaceholderImage();
                                      }}
                                    />
                                    {/* Out of stock overlay */}
                                    {product.inventory <= 0 && (
                                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                        <span className="text-white font-semibold text-lg">
                                          Hết hàng
                                        </span>
                                      </div>
                                    )}

                                    <div className="absolute top-4 left-4 flex gap-2">
                                      {product.status === "available" &&
                                        product.inventory < 10 && (
                                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                            🔥 Sắp hết
                                          </span>
                                        )}
                                      {slideIndex * itemsPerPage + index <
                                        3 && (
                                        <span className="bg-[#9fd700] text-white px-2 py-1 rounded-full text-xs font-medium">
                                          ✨ HOT
                                        </span>
                                      )}
                                    </div>
                                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                                      <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                                    </button>
                                  </div>
                                  <div className="pt-4 pb-4">
                                    <h3 className="font-semibold text-white mb-2 group-hover:text-[#6BB392] transition-colors line-clamp-2">
                                      {product.productName}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-300 fill-current" />
                                        <span className="text-sm text-white font-medium">
                                          4.5
                                        </span>
                                      </div>
                                      {/* <span className="text-gray-300">•</span>
                                    <span className="text-sm text-gray-500">
                                      Còn {product.inventory}
                                    </span> */}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="text-xl font-bold text-[#9fd700]">
                                          {formatPrice(product.price)}
                                        </div>
                                        <div className="text-sm text-white/60">
                                          Miễn phí ship
                                        </div>
                                      </div>
                                      <Link
                                        to={`/products/${product._id}`}
                                        className="bg-gradient-to-r from-[#446158] to-[#384b04] text-white font-bold px-4 py-2 rounded-lg hover:scale-105 transition-colors flex items-center gap-2"
                                      >
                                        <ShoppingBag className="w-4 h-4 " />
                                        Mua ngay
                                      </Link>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                          </div>
                        )
                      )}
                    </motion.div>
                  </div>

                  {/* Dots Indicator */}
                  {totalSlides > 1 && (
                    <div className="flex justify-center mt-8 space-x-2">
                      {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            currentSlide === index
                              ? "bg-[#9fd700]"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right button */}
                {totalSlides > 1 && (
                  <button
                    onClick={nextSlide}
                    className="flex-shrink-0 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                )}
              </div>
            )}
          </section>

          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-12">
              {/* Left Side */}
              <div className="md:w-1/3 flex flex-col justify-between text-right">
                <div>
                  <h1
                    className="text-4xl font-extrabold mb-2 inline-block"
                    style={{
                      background:
                        "linear-gradient(to bottom, #fffeef, #9fd700)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    5 LÝ DO
                  </h1>

                  <h3
                    className="text-4xl font-extrabold mb-2 inline-block"
                    style={{
                      background:
                        "linear-gradient(to bottom, #9fd700, #3D6036)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    ĐỂ BẠN CHỌN Interior 
                  </h3>

                  {/* Tabs */}
                  <ul className="space-y-2 mt-16 text-white text-sm font-medium text-right">
                    {reasons.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`cursor-pointer ${
                          activeIndex === index ? "text-[#e6b97f]" : ""
                        }`}
                      >
                        {index === 0
                          ? "Thương hiệu"
                          : index === 1
                          ? "Chất liệu"
                          : index === 2
                          ? "Họa tiết"
                          : index === 3
                          ? "Kỹ thuật"
                          : "Bền vững"}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Navigation + Progress */}
                <div className="mt-8">
                  <div className="flex items-center justify-start gap-6 mb-4">
                    <button
                      className="text-xl text-white"
                      onClick={() =>
                        setActiveIndex((prev) =>
                          prev > 0 ? prev - 1 : reasons.length - 1
                        )
                      }
                    >
                      &larr;
                    </button>
                    <button
                      className="text-xl text-white"
                      onClick={() =>
                        setActiveIndex((prev) =>
                          prev < reasons.length - 1 ? prev + 1 : 0
                        )
                      }
                    >
                      &rarr;
                    </button>
                  </div>
                  <div className="w-full h-[1px] bg-white">
                    <div
                      className="h-full bg-[#212a07] transition-all duration-300"
                      style={{
                        width: `${((activeIndex + 1) / reasons.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="md:w-2/3 flex flex-col md:flex-row gap-6 transition-all duration-500">
                {/* Image */}
                <div className="w-full md:w-1/2">
                  <img
                    src={reasons[activeIndex].image}
                    alt={reasons[activeIndex].title}
                    className="w-full h-[60vh] rounded transition-all duration-500"
                  />
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <h3 className="text-3xl text-white font-bold leading-tight mb-4">
                    {reasons[activeIndex].title}
                  </h3>
                  <p className="text-gray-700 text-white text-sm leading-relaxed">
                    {reasons[activeIndex].content}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Achievements */}
          <section className=" rounded-3xl p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#0f340b] mb-4">
                Cảm ơn sự yêu thích của bạn!
              </h2>
              <p className="text-xl text-[#0f340b]">
                Cùng tạo nên phong cách sống độc đáo
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div
                  className="w-16 h-16 bg-[#1eae75] rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    boxShadow: "0 0 5px #1eae75, 0 0 5px #1eae75",
                  }}
                >
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#40322d] mb-2">
                  20K+
                </div>
                <div className="text-gray-600">Khách hàng tin tưởng</div>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 bg-[#7ad9bd] rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    boxShadow: "0 0 5px #7ad9bd, 0 0 5px #7ad9bd",
                  }}
                >
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#40322d] mb-2">
                  50K+
                </div>
                <div className="text-gray-600">Sản phẩm đã giao</div>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 bg-[#8fcbab] rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    boxShadow: "0 0 5px #8fcbab, 0 0 5px #8fcbab",
                  }}
                >
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#40322d] mb-2">
                  4.8/5
                </div>
                <div className="text-gray-600">Đánh giá </div>
              </div>
              <div className="text-center">
                <div
                  className="w-16 h-16 bg-[#c6eebb] rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    boxShadow: "0 0 5px #c6eebb, 0 0 5px #c6eebb",
                  }}
                >
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-[#40322d] mb-2">
                  99%
                </div>
                <div className="text-gray-600">Hài lòng về chất lượng</div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="w-8 h-8 text-green-200" />
                <span className="text-2xl font-bold">Interior </span>
              </div>
              <p className="text-gray-400 mb-4">
                Nền tảng thương mại điện tử đáng tin cậy, mang đến trải nghiệm
                mua sắm tuyệt vời.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Điện tử
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Thời trang
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Gia dụng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Sách
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Chính sách bảo hành
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Chính sách đổi trả
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Kết nối</h3>
              <p className="text-gray-400 mb-4">
                Theo dõi chúng tôi để cập nhật những ưu đãi mới nhất
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <span className="text-sm font-semibold">f</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-pink-700 transition-colors">
                  <span className="text-sm font-semibold">ig</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Interior . Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </UserLayout>
  );
};

export default HomePage;
