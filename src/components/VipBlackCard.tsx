"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Wifi, Hexagon, ChevronRight } from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem("dung_has_seen_welcome_v4");
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsActivating(true);
    setTimeout(() => {
      setIsOpen(false);
      sessionStorage.setItem("dung_has_seen_welcome_v4", "true");
      const nameInput = document.getElementById("guestName");
      if (nameInput) setTimeout(() => nameInput.focus(), 100);
    }, 1000);
  };

  // --- 3D TILT EFFECT LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), { damping: 20, stiffness: 150 });
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), { damping: 20, stiffness: 150 });
  
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-50, 150]), { damping: 20, stiffness: 150 });
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-50, 150]), { damping: 20, stiffness: 150 });

  const glareLeft = useTransform(glareX, v => `${v}%`);
  const glareTop = useTransform(glareY, v => `${v}%`);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = (e.clientX - rect.left) / width - 0.5;
    const mouseYPos = (e.clientY - rect.top) / height - 0.5;
    
    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 perspective-[2000px]">
          {/* Cinematic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-[#080808]/90 backdrop-blur-xl"
            onClick={handleClose}
          >
            {/* Subtle glow behind the card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[600px] bg-gradient-to-b from-gray-700/20 to-transparent blur-3xl opacity-50 rounded-full"></div>
          </motion.div>

          <div className="relative z-10 flex flex-col items-center">
            {/* 3D Container */}
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ y: "100vh", rotateZ: -10, scale: 0.5, opacity: 0 }}
              animate={
                isActivating 
                  ? { y: "-100vh", rotateZ: 10, scale: 1.1, opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }
                  : { y: 0, rotateZ: 0, scale: 1, opacity: 1, transition: { type: "spring", damping: 20, stiffness: 100, delay: 0.2 } }
              }
              exit={{ opacity: 0 }}
              style={{
                rotateX: rotateXSpring,
                rotateY: rotateYSpring,
                transformStyle: "preserve-3d"
              }}
              className="relative w-[340px] h-[214px] sm:w-[420px] sm:h-[265px] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden group cursor-pointer transition-shadow"
            >
              {/* Card Base (Matte Black with subtle noise/gradient) */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a]">
                {/* Subtle metallic brush effect */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)" }}></div>
              </div>

              {/* Holographic Glare */}
              <motion.div 
                style={{
                  left: glareLeft,
                  top: glareTop,
                  background: "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)"
                }}
                className="absolute w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
              />

              {/* CARD CONTENT */}
              <div className="absolute inset-0 p-5 sm:p-6 text-white" style={{ transform: "translateZ(30px)" }}>
                
                {/* TOP ROW: Logo & Type */}
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-2">
                    {/* Abstract Bank Logo */}
                    <div className="w-6 h-6 bg-white rounded-br-full rounded-tl-full flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                    <span className="font-display font-black tracking-widest text-sm sm:text-base">UTH BANK</span>
                  </div>
                  <span className="font-display font-medium text-xs sm:text-sm tracking-widest text-gray-300 uppercase">
                    VIP Pass
                  </span>
                </div>

                {/* MIDDLE ROW: Chip & NFC */}
                <div className="absolute top-[4.5rem] sm:top-24 w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] flex justify-between items-center">
                  {/* EMV Chip */}
                  <div className="w-11 h-8 sm:w-12 sm:h-9 bg-gradient-to-br from-[#f8df93] via-[#d4af37] to-[#aa7c11] rounded-md relative overflow-hidden border border-[#8b6508] shadow-inner">
                    <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-[#8b6508]/40"></div>
                    <div className="absolute top-0 bottom-0 right-1/3 w-[1px] bg-[#8b6508]/40"></div>
                    <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#8b6508]/40"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-5 border border-[#8b6508]/40 rounded-sm"></div>
                  </div>

                  {/* Contactless Icon */}
                  <Wifi className="w-5 h-5 sm:w-6 sm:h-6 rotate-90 text-gray-400 opacity-80" />
                </div>

                {/* BOTTOM ROW: Numbers & Details */}
                <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6">
                  {/* Card Number */}
                  <div 
                    className="font-mono text-xl sm:text-[26px] tracking-[0.1em] sm:tracking-[0.15em] mb-1 sm:mb-2 text-gray-100"
                    style={{ textShadow: "1px 1px 0px rgba(255,255,255,0.2), -1px -1px 0px rgba(0,0,0,0.8)" }}
                  >
                    2027 0000 9999 1049
                  </div>

                  {/* Security Code & Expiry */}
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] sm:text-xs text-gray-400 tracking-wider mb-2 sm:mb-3">6324</span>
                      <span className="font-display font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm text-gray-200">
                        KHACH QUY (VIP)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <div className="text-[5px] sm:text-[6px] uppercase leading-tight text-gray-400 font-bold">
                        valid<br/>thru
                      </div>
                      <div className="font-mono text-sm sm:text-base tracking-widest text-gray-200">
                        08/27
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* ACTION BUTTON (Below the card) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isActivating ? 0 : 1, y: isActivating ? 20 : 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-8 sm:mt-12 w-full max-w-[280px]"
            >
              <button
                onClick={handleClose}
                className="relative w-full group overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 text-white font-display font-bold text-sm sm:text-base py-3 sm:py-4 rounded-full flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-white/20 hover:border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                
                {isActivating ? (
                  <span className="tracking-[0.2em]">AUTHORIZING...</span>
                ) : (
                  <>
                    <span className="tracking-[0.2em]">KÍCH HOẠT THẺ</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
