"use client";

import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import Image from "next/image";

const caveat = Caveat({ subsets: ["latin", "latin-ext"], weight: "700" });

interface FullScreenLoaderProps {
  text?: string;
  subText?: string;
}

export function FullScreenLoader({ 
  text = "ĐANG XỬ LÝ DỮ LIỆU...", 
  subText = "(Đợi xíu, hệ thống đang bung lụa...)" 
}: FullScreenLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1c0f19]/90 backdrop-blur-xl">
      {/* Brutalist Spinner */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 border-8 border-transparent border-t-[#fde400] border-r-[#ff3af2] border-b-[#26fedc] rounded-full drop-shadow-[0_0_15px_#ff3af2]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-4 border-8 border-transparent border-t-[#ff3af2] border-l-[#26fedc] rounded-full drop-shadow-[0_0_10px_#26fedc]"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="relative z-10"
        >
          <Image src="/icons/loading2.png" alt="loading" width={50} height={50} />
        </motion.div>
      </div>
      
      {/* Glitchy Text */}
      <motion.h2 
        initial={{ opacity: 0.8, x: -2 }}
        animate={{ 
          opacity: [0.8, 1, 0.8, 0.9, 0.7, 1],
          x: [-2, 2, -1, 1, -2, 0]
        }}
        transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
        className="text-[#fde400] font-display font-black text-3xl sm:text-5xl uppercase tracking-widest drop-shadow-[4px_4px_0px_#ab00a3] text-center px-4"
      >
        {text}
      </motion.h2>

      {/* Funny Subtitle */}
      <p className={`${caveat.className} mt-6 text-[#26fedc] text-3xl sm:text-4xl text-center px-4 drop-shadow-[2px_2px_0px_#000]`}>
        {subText}
      </p>
    </div>
  );
}
