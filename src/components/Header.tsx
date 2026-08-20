"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, MapPin, PlusCircle, Menu, X, Camera, Heart } from "lucide-react";
import { DEFAULT_EVENT_CONFIG } from "@/config/event";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#13071b]/95 backdrop-blur-xl border-b-4 border-black shadow-[0_6px_0px_0px_#ff3af2] transition-all">
      {/* Top Multi-Color Neon Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#ff3af2] via-[#00f2d1] to-[#fde400]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between">

        {/* --- 3D SIGNATURE LOGO --- */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 select-none focus:outline-none"
        >
          {/* Slanted 3D Icon Box */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#ff3af2] to-[#ab00a3] border-2 border-white shadow-[3px_3px_0px_0px_#00f2d1] flex items-center justify-center -rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 shrink-0">
            <Image src="/icons/grad1.png" alt="Icon" width={30} height={30} className="object-contain" />
          </div>

          {/* Multi-layered 3D Text */}
          <div className="flex flex-col">
            <div
              className="font-display font-black italic text-2xl sm:text-3xl tracking-wider leading-none uppercase transform -skew-x-6 group-hover:skew-x-0 transition-transform duration-300"
              style={{
                textShadow: `
                  2px 2px 0px #3b0764,
                  3px 3px 0px #7e22ce,
                  4px 4px 0px #ff3af2,
                  6px 6px 0px #00f2d1
                `
              }}
            >
              <span className="text-[#00f2d1] mr-1.5 group-hover:text-white transition-colors">DUNG</span>
              <span className="text-[#fde400] group-hover:text-[#ff3af2] transition-colors">GRAD'27</span>
            </div>
            <span className="font-black tracking-[0.25em] text-gray-500 ">
              Official Invitation
            </span>
          </div>
        </Link>

        {/* --- DESKTOP NAVIGATION CAPSULE --- */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-[#1c0c29]/90 border-2 border-primary-container/60 p-1.5 rounded-full shadow-[3px_3px_0px_0px_#000]">


          {/* 2. Thư Viện Ảnh */}
          <Link
            href="#gallery"
            className="px-3.5 py-1.5 rounded-full text-xs font-display font-black tracking-wider uppercase text-gray-300 hover:text-white hover:bg-primary-container transition-all flex items-center gap-1.5 group select-none"
          >
            <Image src="/icons/camera.png" alt="camera" width={25} height={25} />
            <span>Thư Viện Ảnh</span>
          </Link>

          {/* 3. Sổ Lời Chúc */}
          <Link
            href="#wishes"
            className="px-3.5 py-1.5 rounded-full text-xs font-display font-black tracking-wider uppercase text-gray-300 hover:text-black hover:bg-tertiary-fixed transition-all flex items-center gap-1.5 group select-none"
          >
            <Image src="/icons/wish.png" alt="wish" width={25} height={25} />
            <span>Sổ Lời Chúc</span>
          </Link>


        </nav>

        {/* --- RIGHT ACTIONS --- */}
        <div className="flex items-center gap-3">

          {/* Main CTA Button */}
          <Link
            href="/"
            className="relative group bg-gradient-to-r from-[#ff3af2] to-[#ab00a3] text-white font-display font-black text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_#00f2d1] hover:scale-105 hover:shadow-[5px_5px_0px_0px_#fde400] active:scale-95 active:shadow-none transition-all uppercase tracking-wider flex items-center gap-2 select-none"
          >
            <Image src="/icons/add_wish.png" alt="wish" width={25} height={25} />
            <span className="drop-shadow-[1px_1px_0_#000]">TẠO THIỆP</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-xl bg-[#221033] border-2 border-secondary-fixed text-secondary-fixed flex items-center justify-center shadow-[2px_2px_0px_0px_#000] active:translate-y-0.5 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-[#180924] border-b-4 border-primary-container px-5 py-4 flex flex-col gap-2.5 overflow-hidden shadow-2xl"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#251036] border border-tertiary-fixed text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-tertiary-fixed hover:text-black transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-tertiary-fixed" />
                Tạo Thư Mời Cá Nhân
              </span>
              <span className="text-xs text-tertiary-fixed">➔</span>
            </Link>

            <Link
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#251036] border border-primary-container text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-primary-container hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-primary" />
                Thư Viện Ảnh Kỷ Niệm
              </span>
              <span className="text-xs text-primary">➔</span>
            </Link>

            <Link
              href="#wishes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#251036] border border-pink-500 text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-pink-500 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                Sổ Lưu Bút & Lời Chúc
              </span>
              <span className="text-xs text-pink-400">➔</span>
            </Link>

            <Link
              href={DEFAULT_EVENT_CONFIG.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#251036] border border-secondary-fixed text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-secondary-fixed hover:text-black transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-secondary-fixed" />
                Vị Trí & Chỉ Đường Hội Trường
              </span>
              <span className="text-xs text-secondary-fixed">➔</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
