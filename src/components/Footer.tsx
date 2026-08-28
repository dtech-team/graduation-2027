"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Heart, Eye, Sparkles } from "lucide-react";
import { DEFAULT_EVENT_CONFIG } from "@/config/event";
import Image from "next/image";

export function Footer() {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInvites: 0,
    onlineCount: 3,
  });

  useEffect(() => {
    // Tự động ghi nhận lượt truy cập 1 lần mỗi phiên
    const hasVisitedSession = typeof window !== "undefined" ? sessionStorage.getItem("has_visited_session") : null;

    if (!hasVisitedSession) {
      if (typeof window !== "undefined") sessionStorage.setItem("has_visited_session", "true");
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "view" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setStats(data.data);
          }
        })
        .catch(console.error);
    } else {
      // Nếu đã ghi nhận trong session, chỉ lấy số liệu hiển thị
      fetch("/api/stats")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setStats(data.data);
          }
        })
        .catch(console.error);
    }
  }, []);

  return (
    <footer className="bg-[#14081c] w-full relative overflow-hidden border-t-8 border-dashed border-secondary-fixed shadow-[0px_-8px_0px_0px_#00f2d1] flex flex-col items-center py-10 px-4 sm:px-6 md:px-12 mt-24 z-40">
      {/* Background Watermark */}
      <div className="font-display text-5xl sm:text-7xl md:text-9xl opacity-5 text-white font-black tracking-tighter absolute top-90 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full text-center whitespace-nowrap select-none">
        DUNG GRAD'27
      </div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center gap-7">

        {/* Section Title Pill */}
        <div className="flex items-center gap-2 bg-[#231033] border-2 border-tertiary-fixed px-5 py-1.5 rounded-full shadow-[3px_3px_0px_0px_#fde400]">
          <Image src="/icons/location.png" alt="map" width={25} height={25} />
          <span className="font-display font-black text-xs sm:text-sm text-tertiary-fixed uppercase tracking-wider">
            THÔNG TIN LIÊN HỆ 
          </span>
        </div>

        {/* Contact Bento Grid (3 Interactive Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">

          {/* Card 1: Hotline / Zalo Direct */}
          <Link
            href="tel:0779461536"
            className="group bg-[#1b0d26]/90 border-2 border-secondary-fixed/70 hover:border-secondary-fixed p-4 sm:p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#00f2d1] hover:-translate-y-1 transition-all flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary-fixed/15 border border-secondary-fixed flex items-center justify-center text-secondary-fixed shrink-0 group-hover:scale-110 transition-transform">
              <Image src="/icons/phone3.png" alt="phone" width={25} height={25} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="font-display font-black text-[11px] text-gray-400 uppercase tracking-wider">HOTLINE / ZALO</p>
              <p className="font-display font-bold text-sm sm:text-base text-white group-hover:text-secondary-fixed transition-colors truncate">
                077.946.1536
              </p>
            </div>
          </Link>

          {/* Card 2: Email Direct */}
          <Link
            href="mailto:dtech.webdevteam@gmail.com"
            className="group bg-[#1b0d26]/90 border-2 border-primary-container/70 hover:border-primary-container p-4 sm:p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#ff3af2] hover:-translate-y-1 transition-all flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-primary-container/15 border border-primary-container flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
              <Image src="/icons/email.png" alt="email" width={25} height={25} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="font-display font-black text-[11px] text-gray-400 uppercase tracking-wider">HÒM THƯ EMAIL</p>
              <p className="font-display font-bold text-sm sm:text-base text-white group-hover:text-primary transition-colors truncate">
                dtech.webdevteam@gmail.com
              </p>
            </div>
          </Link>

          {/* Card 3: Google Maps Navigation */}
          <Link
            href={DEFAULT_EVENT_CONFIG.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-[#1b0d26]/90 border-2 border-tertiary-fixed/70 hover:border-tertiary-fixed p-4 sm:p-5 rounded-2xl shadow-[4px_4px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#fde400] hover:-translate-y-1 transition-all flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-tertiary-fixed/15 border border-tertiary-fixed flex items-center justify-center text-tertiary-fixed shrink-0 group-hover:scale-110 transition-transform">
              <Image src="/icons/location_draw.png" alt="location " width={25} height={25} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="font-display font-black text-[11px] text-gray-400 uppercase tracking-wider">VỊ TRÍ TỔ CHỨC</p>
              <p className="font-display font-bold text-sm sm:text-base text-white group-hover:text-tertiary-fixed transition-colors truncate">
                Xem Google Maps
              </p>
            </div>
          </Link>

        </div>

        {/* --- LIVE VISITOR & ACTIVITY STATS BADGE --- */}
        <div className="w-full bg-[#180a24]/90 border-2 border-primary-container/50 rounded-2xl p-3.5 sm:p-4 shadow-[4px_4px_0px_0px_#000] flex flex-wrap items-center justify-around gap-4 sm:gap-6 backdrop-blur-sm">

          {/* Stat 1: Tổng lượt xem */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/15 border border-tertiary-fixed/40 flex items-center justify-center text-tertiary-fixed">
              <Image src="/icons/eye.png" alt="eye" width={25} height={25} />
            </div>
            <div className="text-left">
              <p className="text-[10px] sm:text-[11px] font-display font-bold text-gray-400 uppercase tracking-wider">TỔNG TRUY CẬP</p>
              <p className="font-display font-black text-sm sm:text-base text-tertiary-fixed tracking-wide">
                {stats.totalViews > 0 ? stats.totalViews.toLocaleString("vi-VN") : "268"} <span className="text-[10px] text-gray-400 font-normal">lượt</span>
              </p>
            </div>
          </div>

          {/* Stat 2: Đang trực tuyến */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-secondary-fixed/15 border border-secondary-fixed/40 flex items-center justify-center text-secondary-fixed">
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
              <Image src="/icons/circle.png" alt="circle" width={25} height={25} />

            </div>
            <div className="text-left">
              <p className="text-[10px] sm:text-[11px] font-display font-bold text-gray-400 uppercase tracking-wider">ĐANG TRỰC TUYẾN</p>
              <p className="font-display font-black text-sm sm:text-base text-secondary-fixed tracking-wide flex items-center gap-1.5">
                <span>{stats.onlineCount}</span>
                <span className="text-[10px] text-gray-400 font-normal">đang xem</span>
              </p>
            </div>
          </div>

          {/* Stat 3: Thiệp đã tạo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/15 border border-primary-container/40 flex items-center justify-center text-primary">
              <Image src="/icons/rsvp.png" alt="rsvp" width={25} height={25} />
            </div>
            <div className="text-left">
              <p className="text-[10px] sm:text-[11px] font-display font-bold text-gray-400 uppercase tracking-wider">THIỆP ĐÃ TẠO</p>
              <p className="font-display font-black text-sm sm:text-base text-primary tracking-wide">
                {stats.totalInvites > 0 ? stats.totalInvites.toLocaleString("vi-VN") : "42"} <span className="text-[10px] text-gray-400 font-normal">thư mời</span>
              </p>
            </div>
          </div>

        </div>

        {/* Divider line with gradient */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent my-0.5"></div>

        {/* Team Attribution & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 text-center sm:text-left text-xs sm:text-sm font-display font-bold text-gray-400">
          <p className="flex items-center justify-center sm:justify-start gap-1.5">
            Designed with <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse inline" /> by{" "}
            <span className="text-secondary-fixed font-black">DTECH TEAM</span>
          </p>
          <p className="text-tertiary-fixed font-black tracking-wider">
            © 2027 DUNG GRAD'27. ALL RIGHTS RESERVED.
          </p>
        </div>

      </div>
    </footer>
  );
}
