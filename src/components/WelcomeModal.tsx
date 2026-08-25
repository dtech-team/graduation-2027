"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Camera, BookOpen, ChevronRight } from "lucide-react";
import Image from "next/image";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem("dung_has_seen_welcome_v5");
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      sessionStorage.setItem("dung_has_seen_welcome_v5", "true");
      const nameInput = document.getElementById("guestName");
      if (nameInput) setTimeout(() => nameInput.focus(), 100);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 perspective-[1000px]">
          {/* Elegant Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleClose}
          >
            {/* Ambient Gold Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-red-500/40 to-transparent blur-[100px] rounded-full pointer-events-none"></div>
          </motion.div>

          {/* Luxury Glass Plaque */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95, rotateX: 10 }}
            animate={
              isClosing
                ? { opacity: 0, y: -40, scale: 1.05, rotateX: -10, transition: { duration: 0.8, ease: [0.32, 0, 0.67, 0] } }
                : { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 } }
            }
            className="relative w-full max-w-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Thin Gold Accent Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50"></div>

            <div className="p-8 sm:p-12">
              <div className="text-center mb-10">
                <p className="text-[#d4af37] font-mono text-xs sm:text-sm tracking-[0.3em] uppercase mb-4">
                  NHIỆT LIỆT CHÀO MỪNG
                </p>
                <h2 className="font-display text-3xl sm:text-5xl text-white tracking-wide mb-4" style={{ textShadow: "0 2px 10px rgba(255,255,255,0.2)" }}>
                  VỊ KHÁCH ĐẶC BIỆT
                </h2>
                <p className="text-gray-400 text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed">
                  Nơi đây là không gian lưu giữ kỷ niệm và tương tác dành riêng cho những vị khách quý giá nhất.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                {/* Feature 1 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#d4af37]/10 group-hover:border-[#d4af37]/30 transition-all duration-500">
                    <Image src="/icons/vip_card.png" alt="vip_card" width={30} height={30} />
                  </div>
                  <h3 className="text-white text-sm font-medium tracking-wide mb-2">Thiệp 3D</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">Mở chiếc thiệp được gửi đích danh đến bạn.</p>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#d4af37]/10 group-hover:border-[#d4af37]/30 transition-all duration-500">
                    <Image src="/icons/autograph.png" alt="autograph" width={30} height={30} />
                  </div>
                  <h3 className="text-white text-sm font-medium tracking-wide mb-2">Lưu Bút</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">Để lại những dòng chúc tốt đẹp nhất.</p>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#d4af37]/10 group-hover:border-[#d4af37]/30 transition-all duration-500">
                    <Image src="/icons/camera_yellow.png" alt="memory" width={30} height={30} />
                  </div>
                  <h3 className="text-white text-sm font-medium tracking-wide mb-2">Khoảnh Khắc</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">Bộ sưu tập hình ảnh kỷ niệm độc quyền.</p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleClose}
                  className="group relative cursor-pointer px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center gap-3 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent group-hover:animate-[shimmer_2s_infinite]"></div>
                  <span className="text-white font-medium tracking-[0.15em] text-sm relative z-10">
                    TRẢI NGHIỆM NGAY
                  </span>
                  <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform relative z-10" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
