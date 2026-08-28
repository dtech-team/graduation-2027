"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VipProtectedRoute } from "@/components/VipProtectedRoute";
import { Heart, Camera, Star, Users, GraduationCap, SlidersHorizontal, ImagePlus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const MOCK_PHOTOS = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    author: "@LinhNguyen",
    caption: "Khoảnh khắc đáng nhớ!",
    tag: "VIBES",
    color: "pink",
    rotate: "rotate-0",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=1200&fit=crop",
    author: "@MinhKhoa",
    caption: "We did it!",
    color: "cyan",
    rotate: "rotate-0",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1525926477800-7a3babfbdb65?w=800&h=600&fit=crop",
    author: "@AnhThu",
    caption: "Chuẩn bị sẵn sàng.",
    tag: "",
    color: "yellow",
    rotate: "rotate-0",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=1000&fit=crop",
    author: "@HoangNam",
    caption: "Một đêm không thể quên!",
    color: "pink",
    rotate: "rotate-0",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1511629091441-ee46146481b6?w=800&h=800&fit=crop",
    author: "@TuấnNeo",
    caption: "Biết ơn hành trình này!",
    tag: "",
    color: "cyan",
    rotate: "rotate-0",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1493225457124-a1a2a5fafe24?w=800&h=1100&fit=crop",
    author: "@MaiPhuong",
    caption: "Cùng nhau chạm ước mơ!",
    color: "yellow",
    rotate: "rotate-0",
  }
];

const COLORS = {
  pink: { 
    border: "border-[#ff3af2]", 
    glow: "shadow-[0_0_15px_rgba(255,58,242,0.6),inset_0_0_10px_rgba(255,58,242,0.4)]", 
    hoverGlow: "hover:shadow-[0_0_25px_#ff3af2,inset_0_0_20px_#ff3af2]", 
    text: "text-[#ff3af2]",
    bg: "bg-[#fde400]" // Keep tags yellow
  },
  cyan: { 
    border: "border-[#00f2d1]", 
    glow: "shadow-[0_0_15px_rgba(0,242,209,0.6),inset_0_0_10px_rgba(0,242,209,0.4)]", 
    hoverGlow: "hover:shadow-[0_0_25px_#00f2d1,inset_0_0_20px_#00f2d1]", 
    text: "text-[#00f2d1]",
    bg: "bg-[#fde400]"
  },
  yellow: { 
    border: "border-[#fde400]", 
    glow: "shadow-[0_0_15px_rgba(253,228,0,0.6),inset_0_0_10px_rgba(253,228,0,0.4)]", 
    hoverGlow: "hover:shadow-[0_0_25px_#fde400,inset_0_0_20px_#fde400]", 
    text: "text-[#fde400]",
    bg: "bg-[#fde400]"
  },
};

const FILTERS = [
  { id: 'ALL', label: 'TẤT CẢ', icon: Star, color: 'pink' },
  { id: 'GRAD', label: 'LỄ TỐT NGHIỆP', icon: GraduationCap, color: 'white' },
  { id: 'FRIENDS', label: 'BẠN BÈ', icon: Users, color: 'white' },
  { id: 'MEMORIES', label: 'KỶ NIỆM ĐÁNG NHỚ', icon: Heart, color: 'white' },
];

export default function GalleryPage() {
  const [photos] = useState(MOCK_PHOTOS);
  const [filter, setFilter] = useState("ALL");

  return (
    <div className="min-h-screen flex flex-col bg-[#05010a] text-white relative overflow-hidden font-sans selection:bg-[#ff3af2] selection:text-white">
      {/* Dark Cyberpunk Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#130318] via-[#05010a] to-[#05010a]"></div>
      
      {/* Subtle Star Particles / Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{
        backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }}></div>

      <Header />
      
      <main className="flex-grow  min-h-screen px-4 sm:px-6 md:px-16 z-10 relative my-auto">
        <VipProtectedRoute title="Thư Viện Kỷ Niệm">
          <div className="max-w-6xl mx-auto flex flex-col gap-12 md:gap-16">
            
            {/* Hero Section */}
            <section className="text-center flex flex-col items-center gap-10 relative mt-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative w-full flex flex-col items-center justify-center"
              >
                {/* Decorative Vectors */}
                <div className="absolute top-0 left-0 md:left-12 lg:-left-12 -rotate-12 hidden sm:block">
                  <Star className="w-8 h-8 text-[#ff3af2] drop-shadow-[0_0_10px_#ff3af2] animate-pulse" />
                </div>
                <div className="absolute top-1/4 right-0 md:right-12 lg:-right-12 rotate-12 hidden sm:block">
                  <GraduationCap className="w-12 h-12 text-[#00f2d1] drop-shadow-[0_0_12px_#00f2d1]" />
                </div>
                <div className="absolute bottom-0 left-10 md:left-24 lg:-left-4 -rotate-6 hidden sm:block">
                  <Camera className="w-10 h-10 text-[#ff3af2] drop-shadow-[0_0_12px_#ff3af2]" />
                </div>
                <div className="absolute bottom-1/4 right-10 md:right-24 lg:right-0 rotate-45 hidden sm:block">
                  <Star className="w-6 h-6 text-[#fde400] drop-shadow-[0_0_8px_#fde400] animate-pulse" />
                </div>

                {/* Typography KHOẢNH KHẮC RỰC RỠ */}
                <div className="relative z-10 flex flex-col items-center select-none">
                  <div className="flex items-center gap-4 md:gap-8">
                    <span className="text-[#00f2d1] text-3xl md:text-6xl font-light opacity-80 drop-shadow-[0_0_10px_#00f2d1]"> </span>
                    <h1 className="font-display font-black text-[13vw] sm:text-7xl md:text-8xl lg:text-[6.5rem] tracking-widest text-transparent neon-text-pink outline-text-pink leading-none uppercase">
                      Khoảnh Khắc
                    </h1>
                    <span className="text-[#fde400] text-3xl md:text-6xl font-light opacity-80 drop-shadow-[0_0_10px_#fde400]"> </span>
                  </div>
                  
                  <h1 className="font-display font-black text-[14vw] sm:text-8xl md:text-9xl lg:text-[7.5rem] tracking-wider text-[#fde400] drop-shadow-[0_0_20px_rgba(253,228,0,0.7)] leading-none uppercase -mt-2 md:-mt-6">
                    Rực Rỡ
                  </h1>
                </div>
              </motion.div>

              {/* Subtitle Box */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative max-w-2xl w-full mx-auto"
              >
                <div className="absolute inset-0 border-[2px] border-[#ff3af2] rounded-[2rem] md:rounded-full shadow-[0_0_10px_#ff3af2,inset_0_0_10px_#ff3af2] pointer-events-none"></div>
                <p className="px-6 py-5 md:px-10 md:py-6 text-sm md:text-base text-gray-200 text-center font-medium leading-relaxed relative z-10">
                  Góp thêm những bức ảnh kỷ niệm để chúng ta cùng tạo nên một bức tranh hoàn chỉnh của ngày lễ tốt nghiệp đáng nhớ này.
                </p>
                <Star className="absolute -bottom-3 -right-2 md:-right-4 w-6 h-6 text-[#ff3af2] drop-shadow-[0_0_8px_#ff3af2] bg-[#05010a]" />
              </motion.div>
            </section>

            {/* Upload Action */}
            <section className="flex justify-center w-full mt-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full md:w-4/5 lg:w-3/4 bg-transparent border-[2px] border-dashed border-[#00f2d1] rounded-[2rem] p-10 md:p-14 flex flex-col items-center justify-center gap-6 shadow-[0_0_15px_rgba(0,242,209,0.3),inset_0_0_15px_rgba(0,242,209,0.2)] hover:shadow-[0_0_25px_rgba(0,242,209,0.5),inset_0_0_25px_rgba(0,242,209,0.3)] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00f2d1]/5 to-[#ff3af2]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[#00f2d1] blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[2px] border-[#00f2d1] flex items-center justify-center shadow-[0_0_15px_#00f2d1,inset_0_0_10px_#00f2d1] relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <ImagePlus className="w-10 h-10 md:w-12 md:h-12 text-[#00f2d1] drop-shadow-[0_0_8px_#00f2d1]" />
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <span className="font-display font-black text-2xl md:text-3xl uppercase tracking-[0.2em] text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-colors">
                    Tải lên kỷ niệm
                  </span>
                  <span className="text-gray-400 text-xs md:text-sm font-medium flex items-center gap-4">
                    <span className="w-8 md:w-12 h-[1px] bg-gradient-to-r from-transparent to-[#00f2d1]"></span>
                    Chia sẻ khoảnh khắc của bạn và lưu giữ kỷ niệm tuyệt vời!
                    <span className="w-8 md:w-12 h-[1px] bg-gradient-to-l from-transparent to-[#00f2d1]"></span>
                  </span>
                </div>
              </motion.button>
            </section>

            {/* Filters */}
            <section className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4 w-full">
              <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
                {FILTERS.map((f) => {
                  const Icon = f.icon;
                  const isSelected = filter === f.id;
                  const baseClasses = "flex items-center gap-2 px-5 py-2.5 rounded-full border-[1.5px] transition-all duration-300 text-xs font-bold tracking-widest uppercase";
                  
                  let colorClasses = "";
                  if (f.color === 'pink') {
                    colorClasses = isSelected 
                      ? "bg-[#ff3af2]/20 border-[#ff3af2] text-[#ff3af2] shadow-[0_0_15px_#ff3af2,inset_0_0_10px_#ff3af2]" 
                      : "bg-transparent border-[#ff3af2]/40 text-[#ff3af2]/60 hover:border-[#ff3af2] hover:text-[#ff3af2] hover:shadow-[0_0_10px_rgba(255,58,242,0.5)]";
                  } else {
                    colorClasses = isSelected
                      ? "bg-white/10 border-white text-white shadow-[0_0_10px_rgba(255,255,255,0.4),inset_0_0_8px_rgba(255,255,255,0.2)]"
                      : "bg-transparent border-gray-600 text-gray-400 hover:border-white/80 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]";
                  }

                  return (
                    <button 
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`${baseClasses} ${colorClasses}`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected && f.color === 'pink' ? 'drop-shadow-[0_0_5px_#ff3af2]' : ''}`} />
                      {f.label}
                    </button>
                  )
                })}
              </div>
              
              <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border-[1.5px] border-gray-600 text-gray-400 hover:border-white hover:text-white transition-all text-xs font-bold tracking-widest uppercase">
                  MỚI NHẤT <span className="text-[9px]">▼</span>
                </button>
                <button className="flex items-center justify-center w-11 h-11 rounded-full border-[1.5px] border-[#ff3af2] text-[#ff3af2] shadow-[0_0_10px_rgba(255,58,242,0.3),inset_0_0_5px_rgba(255,58,242,0.2)] hover:shadow-[0_0_15px_rgba(255,58,242,0.6)] transition-all">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Gallery Grid */}
            <section className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 pb-6 w-full">
              {photos.map((photo, i) => {
                const theme = COLORS[photo.color as keyof typeof COLORS];
                return (
                  <motion.div 
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                    className={`break-inside-avoid relative bg-transparent border-[2px] ${theme.border} rounded-xl overflow-hidden ${theme.glow} ${theme.hoverGlow} transition-all duration-300 group`}
                  >
                    <div className="relative w-full">
                      <img 
                        src={photo.url} 
                        alt="Gallery Image" 
                        className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05010a]/90 via-[#05010a]/20 to-transparent opacity-90 transition-opacity duration-300"></div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex justify-between items-end z-10">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-white text-sm md:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{photo.author}</p>
                        <p className="text-gray-300 text-[11px] md:text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{photo.caption}</p>
                      </div>
                      <button className={`w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-600 bg-black/40 flex items-center justify-center hover:border-current hover:bg-black/60 transition-colors backdrop-blur-sm ${theme.text}`}>
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>

                    {photo.tag && (
                      <div className={`absolute top-4 left-4 ${theme.bg} text-[#111] font-black text-[10px] md:text-xs px-2.5 py-1 -rotate-6 shadow-[0_0_10px_currentColor] tracking-widest uppercase`}>
                        {photo.tag}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </section>
            
            {/* View More Button */}
            <div className="flex justify-center w-full">
              <button className="px-8 py-3.5 rounded-full border-[1.5px] border-[#ff3af2] text-[#ff3af2] font-bold text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(255,58,242,0.3),inset_0_0_10px_rgba(255,58,242,0.2)] hover:bg-[#ff3af2] hover:text-[#05010a] hover:shadow-[0_0_25px_#ff3af2] transition-all flex items-center gap-3">
                Xem thêm khoảnh khắc <span className="text-[9px]">▼</span>
              </button>
            </div>

          </div>
        </VipProtectedRoute>
      </main>

      <Footer />
      <style dangerouslySetInnerHTML={{__html: `
        .outline-text-pink {
          -webkit-text-stroke: 1.5px #ff3af2;
          @media (min-width: 768px) {
            -webkit-text-stroke: 2.5px #ff3af2;
          }
        }
        .neon-text-pink {
          text-shadow: 0 0 10px rgba(255,58,242,0.8), 0 0 20px rgba(255,58,242,0.5);
        }
      `}} />
    </div>
  );
}
