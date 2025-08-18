import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "../components/Particles/Particles";
import Aurora from "../components/Aurora/Aurora";
import CoverflowSwiper from '../components/CoverflowSwiper';
import GradientText from '../components/GradientText/GradientText';
import StripedText from '../components/StripedText';
import HeartbeatLine from '../components/HeartbeatLine';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import {
  ShoppingBag,
  Star,
  Shield,
  Truck,
  CreditCard,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Heart,
  Award,
  User,
} from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: Shield,
      title: "Thanh toán an toàn",
      description:
        "Bảo mật SSL 256-bit và các phương thức thanh toán đáng tin cậy",
        bgImage:"https://i.pinimg.com/736x/fd/b1/6c/fdb16c736f469bfc85a0a2a8b9c43a36.jpg",
      },
    {
      icon: Truck,
      title: "Giao hàng nhanh chóng",
      description: "Giao hàng toàn quốc trong 1-3 ngày, miễn phí đơn từ 500k",
      bgImage:"https://i.pinimg.com/1200x/cd/92/58/cd9258b021362030f980ac17b3bed450.jpg",
    },
    {
      icon: Users,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ tư vấn nhiệt tình, sẵn sàng hỗ trợ mọi lúc",
      bgImage:"https://i.pinimg.com/1200x/8e/ec/78/8eec78ddf6418377b6f27ed8c06d4645.jpg",
    },
    {
      icon: Award,
      title: "Chất lượng đảm bảo",
      description: "Sản phẩm chính hãng, bảo hành đầy đủ và đổi trả dễ dàng",
      bgImage:"https://i.pinimg.com/736x/59/de/f8/59def81264dbd7be206031a330588efb.jpg",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "Khách hàng thân thiết",
      content:
        "Sản phẩm chất lượng tuyệt vời, giao hàng nhanh chóng. Tôi rất hài lòng!",
      rating: 5,
    },
    {
      name: "Trần Văn Nam",
      role: "Doanh nhân",
      content:
        "Interior  đã giúp tôi tìm được những sản phẩm tốt nhất với giá cả hợp lý.",
      rating: 5,
    },
    {
      name: "Lê Thị Hoa",
      role: "Mẹ bỉm sữa",
      content:
        "Dịch vụ khách hàng tuyệt vời, luôn giải đáp mọi thắc mắc nhanh chóng.",
      rating: 5,
    },
  ];

  const stats = [
    { number: "50K+", label: "Khách hàng hài lòng" },
    { number: "100K+", label: "Sản phẩm đã bán" },
    { number: "4.9/5", label: "Đánh giá trung bình" },
    { number: "99%", label: "Tỷ lệ hài lòng" },
  ];

  return (
    <div  className="min-h-screen"
    style={{
      backgroundImage:
        "linear-gradient(to bottom, #051F20, #0B2B26, #163832, #235347, #8EB69B, #DAF1DE)",
    }}>
      <div className="absolute inset-0 z-0">
  {/* Lớp Aurora ở phía dưới */}
  <div className="absolute inset-0 z-10">
    <Aurora
      colorStops={["#8dfc95", "#8dfcf1", "#8de2fc"]}
      blend={0.5}
      amplitude={1.0}
      speed={0.5}
    />
  </div>
  
  {/* Lớp Particles ở phía trên */}
  <div className="absolute inset-0 z-20">
    <Particles
      particleColors={['#ffffff', '#ffffff']}
      particleCount={200}
      particleSpread={10}
      speed={0.1}
      particleBaseSize={100}
      moveParticlesOnHover={true}
      alphaParticles={false}
      disableRotation={false}
    />
  </div>
</div>
      {/* Header */}
      <header className="bg-[#032221] shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-8 h-8 text-green-200" />
              <span className="text-2xl font-bold text-white">Interior </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="border-2  text-white px-8 py-3 rounded-xl leading-snug font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                style={{
                  borderColor: "#b2f2bb",
                  boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",
                }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r font-bold from-[#fffeef] to-[#9fd700] text-black px-8 py-3 rounded-xl leading-snug hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",
                }}
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative  overflow-hidden mt-10">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Mua sắm thông minh
                <span className="text-[#9fd700]"> cùng Interior </span>
              </h1>
              <p className="text-xl text-white mb-8 leading-relaxed">
                Khám phá hàng ngàn sản phẩm chất lượng cao với giá cả tốt nhất.
                Trải nghiệm mua sắm an toàn, tiện lợi và đáng tin cậy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="bg-gradient-to-r font-bold from-[#fffeef] to-[#9fd700] text-black px-8 py-3 rounded-xl leading-snug hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  style={{
                    boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",
                  }}
                >
                  Bắt đầu mua sắm
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="border-2  text-white px-8 py-3 rounded-xl leading-snug font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  style={{
                    borderColor: "#b2f2bb",
                    boxShadow: "0 0 5px #9fd700, 0 0 5px #9fd700",
                  }}
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-l from-[#9fd700] to-[#446158] rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Ưu đãi đặc biệt!</h3>
                <p className="text-lg mb-6">
                  Miễn phí vận chuyển cho đơn hàng đầu tiên + Giảm 20% cho thành
                  viên mới
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span>Áp dụng ngay khi đăng ký</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8 w-36 h-36 flex items-center justify-center mx-auto ">
  {/* Vòng tròn gradient xanh lá */}
  <svg className="w-full h-full" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#a3e635" />
        <stop offset="50%" stopColor="#6ee7b7" />
        <stop offset="100%" stopColor="#16a34a" />
      </linearGradient>
    </defs>
    <circle
      cx="50"
      cy="50"
      r="45"
      stroke="url(#greenGradient)"
      strokeWidth="10"
      fill="none"
    />
  </svg>

  {/* Số ở giữa */}
  <span className="absolute text-3xl font-bold bg-gradient-to-r from-lime-300 via-lime-400 to-lime-700 bg-clip-text text-transparent">
    {stat.number}
  </span>
</div>

                <div className="text-white">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative mb-24">
        
  {/* Layer chữ ở dưới */}
  <StripedText>
    Interior 
  </StripedText>
{/* Lớp Particles ở phía trên */}
<div className="absolute inset-0 z-5">
    <Particles
      particleColors={['#ffffff', '#ffffff']}
      particleCount={200}
      particleSpread={10}
      speed={0.1}
      particleBaseSize={100}
      moveParticlesOnHover={true}
      alphaParticles={false}
      disableRotation={false}
    />
  </div>
  <div className="absolute inset-0 z-7 w-screen h-screen flex items-start mt-32 justify-center ">
  <HeartbeatLine ></HeartbeatLine>
  </div>
  {/* Swiper nằm trên chữ */}
  <div className="absolute inset-0 z-10">
    <CoverflowSwiper />
  </div>
</div>


      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
  <GradientText
    colors={[ "#4D7111", "#C3E956", "#91EAAF", "#F4FFFC"]}
    animationSpeed={6}
    showBorder={false}
    className="custom-class"
  >
 TẠI SAO CHỌN Interior ?
  </GradientText>
            <p className="text-xl mt-16 text-white max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với dịch
              vụ chuyên nghiệp
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16">
  {features.map((feature, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
      style={{
        backgroundImage: `url(${feature.bgImage})`, // bạn cần thêm thuộc tính bgImage cho mỗi feature
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay mờ */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Nội dung card */}
      <div className="relative z-10 p-8 flex flex-col items-start text-left">
  <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
    <feature.icon className="w-8 h-8 text-white" />
  </div>
  <h3 className="text-xl font-semibold text-white mb-3">
    {feature.title}
  </h3>
  <p className="text-white/90 leading-relaxed">
    {feature.description}
  </p>
</div>

    </motion.div>
  ))}
</div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#9fd700] mb-4">
              Khách hàng nói gì về chúng tôi?
            </h2>
            <p className="text-xl text-white">
              Hàng nghìn khách hàng đã tin tưởng và hài lòng với dịch vụ của
              Interior 
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#446158] rounded-2xl p-8 shadow-2xl shadow-black/50 hover:shadow-black/70 transition-shadow duration-300 opacity-50"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-white mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-white">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#a9b880] to-[#446158] ">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-xl text-white mb-8 leading-relaxed">
              Tham gia cộng đồng hàng nghìn khách hàng hài lòng. Đăng ký ngay để
              nhận ưu đãi đặc biệt!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-[#446158] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Đăng ký miễn phí
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="w-8 h-8 text-blue-400" />
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
    </div>
  );
};

export default LandingPage;
