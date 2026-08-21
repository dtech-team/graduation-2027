"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import Image from "next/image";
import { DEFAULT_EVENT_CONFIG } from "@/config/event";
import { fireGrandCelebration } from "@/utils/confetti";
import { generateShareUrl } from "@/utils/share";
import { generateGoogleCalendarUrl } from "@/utils/calendar";

export interface CardProps {
  guestName?: string;
  pronoun?: string;
  relationship?: string;
  message?: string;
  // Flexible Event Details
  graduateName?: string;
  eventDate?: string;
  eventDateDisplay?: string;
  eventTime?: string;
  locationName?: string;
  locationAddress?: string;
  major?: string;
  dresscode?: string;
  mapUrl?: string;
}

// Helper function to safely parse any date format
function parseEventDate(dateStr?: string): Date {
  if (!dateStr) return new Date(DEFAULT_EVENT_CONFIG.eventDate);
  try {
    const normalized = dateStr
      .trim()
      .replace(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/, (_, y, m, d) => {
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      })
      .replace(" ", "T");

    const parsed = new Date(normalized);
    if (!isNaN(parsed.getTime())) return parsed;

    const fallback = new Date(dateStr);
    if (!isNaN(fallback.getTime())) return fallback;
  } catch (e) {
    console.error("Date parse error:", e);
  }
  return new Date();
}

// Trích xuất Tên đệm + Tên chính (hoặc tên ngắn) để xưng hô thân mật và tình cảm
function getShortDisplayName(fullName?: string): string {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 2) return fullName.trim();
  // Lấy 2 từ cuối (Tên đệm + Tên chính)
  return parts.slice(-2).join(" ");
}

// --- PROFESSIONAL 3D DIGIT COUNTDOWN BLOCK ---
function CountdownDigitBlock({
  value,
  label,
  color = "tertiary",
}: {
  value: number | string;
  label: string;
  color?: "tertiary" | "secondary" | "primary";
}) {
  const formatted = typeof value === "number" ? String(value).padStart(2, "0") : value;

  const colorStyles = {
    tertiary: {
      border: "border-tertiary-fixed",
      text: "text-tertiary-fixed",
      glow: "drop-shadow-[0_0_8px_rgba(253,228,0,0.5)]",
      bottomShadow: "shadow-[4px_4px_0px_0px_#fde400]",
    },
    secondary: {
      border: "border-secondary-fixed",
      text: "text-secondary-fixed",
      glow: "drop-shadow-[0_0_8px_rgba(38,254,220,0.5)]",
      bottomShadow: "shadow-[4px_4px_0px_0px_#00f2d1]",
    },
    primary: {
      border: "border-primary-container",
      text: "text-primary",
      glow: "drop-shadow-[0_0_8px_rgba(255,58,242,0.5)]",
      bottomShadow: "shadow-[4px_4px_0px_0px_#ff3af2]",
    },
  }[color];

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* 3D Digit Card */}
      <div
        className={`relative bg-[#100717] border-2 ${colorStyles.border} ${colorStyles.bottomShadow} rounded-2xl w-14 sm:w-18 md:w-20 h-16 sm:h-20 flex items-center justify-center overflow-hidden transition-transform hover:scale-105`}
      >
        {/* Horizontal Card Crease */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10 z-10 pointer-events-none"></div>

        {/* Animated Number */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formatted}
            initial={{ y: -16, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
            className={`font-display font-black text-2xl sm:text-3xl md:text-4xl ${colorStyles.text} ${colorStyles.glow} tracking-tight select-none z-0`}
          >
            {formatted}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Subtitle Label */}
      <span className="font-display font-black text-[10px] sm:text-xs tracking-widest text-gray-300 uppercase">
        {label}
      </span>
    </div>
  );
}

// Glowing Colon Separator
function ColonSeparator() {
  return (
    <div className="flex flex-col justify-center gap-2 pb-5 sm:pb-6 select-none">
      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_#00f2d1] animate-pulse"></div>
      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_#00f2d1] animate-pulse"></div>
    </div>
  );
}

export function InvitationCard({
  guestName,
  pronoun,
  relationship,
  message,
  graduateName = DEFAULT_EVENT_CONFIG.graduateName,
  eventDate = DEFAULT_EVENT_CONFIG.eventDate,
  eventDateDisplay = DEFAULT_EVENT_CONFIG.eventDateDisplay,
  eventTime = DEFAULT_EVENT_CONFIG.eventTime,
  locationName = DEFAULT_EVENT_CONFIG.locationName,
  locationAddress = DEFAULT_EVENT_CONFIG.locationAddress,
  major = DEFAULT_EVENT_CONFIG.major,
  dresscode = DEFAULT_EVENT_CONFIG.dresscode,
  mapUrl = DEFAULT_EVENT_CONFIG.mapUrl,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // --- REAL-TIME DYNAMIC COUNTDOWN LOGIC ---
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    status: "upcoming" | "today" | "past";
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: "upcoming",
  });

  // --- RSVP STATE & LOGIC ---
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "declined" | "pending">("pending");
  const [isEditingRsvp, setIsEditingRsvp] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccessMsg, setRsvpSuccessMsg] = useState<string | null>(null);

  // Google Calendar URL generator with accurate event metadata
  const googleCalendarUrl = generateGoogleCalendarUrl({
    guestName: guestName ? getShortDisplayName(guestName) : "Khách Quý",
    pronoun: pronoun || "Bạn",
    graduateName,
    eventDate,
    eventDateDisplay,
    eventTime,
    locationName,
    locationAddress,
    dresscode,
    mapUrl,
  });

  // Fetch initial RSVP status from server
  useEffect(() => {
    if (guestName) {
      fetch(`/api/rsvp?name=${encodeURIComponent(guestName)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.status) {
            setRsvpStatus(data.status);
          }
        })
        .catch(console.error);
    }
  }, [guestName]);

  const handleRsvpSubmit = async (newStatus: "attending" | "declined") => {
    if (!guestName) return;
    setRsvpLoading(true);
    setRsvpSuccessMsg(null);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRsvpStatus(newStatus);
        setIsEditingRsvp(false);
        if (newStatus === "attending") {
          fireGrandCelebration();
          setRsvpSuccessMsg(`🎉 Cảm ơn ${pronoun ? pronoun.toLowerCase() : "bạn"} ${getShortDisplayName(guestName)}! Dũng đã nhận thông tin nha.`);
        } else {
          setRsvpSuccessMsg(`💌 Dũng đã ghi nhận phản hồi vắng mặt từ ${pronoun ? pronoun.toLowerCase() : "bạn"} ${getShortDisplayName(guestName)}.`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRsvpLoading(false);
    }
  };

  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = parseEventDate(eventDate);
      const targetTime = targetDate.getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (isNaN(targetTime)) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, status: "upcoming" });
        return;
      }

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds, status: "upcoming" });
      } else {
        // Trong vòng 12 tiếng kể từ giờ bắt đầu sự kiện
        const hoursSinceStart = Math.abs(diff) / (1000 * 60 * 60);
        if (hoursSinceStart <= 12) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, status: "today" });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, status: "past" });
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  const downloadImage = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 1, pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `Thu_Moi_${guestName?.replace(/\s+/g, "_") || "Tot_Nghiep"}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to export image", err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto z-20">

      {/* 
        Container to be exported as the final PNG image.
      */}
      <div
        ref={cardRef}
        className="flex flex-col items-center w-full relative z-20 px-4 sm:px-8 py-10 sm:py-12 rounded-3xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: "#0d0614",
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px"
        }}
      >
        {/* Floating Decorative Stars & Flourishes */}
        <div className="absolute top-6 left-6 text-white text-3xl sm:text-4xl drop-shadow-[0_0_10px_#fff] select-none">✦</div>
        <div className="absolute top-12 left-14 text-white text-lg drop-shadow-[0_0_8px_#fff] select-none">✦</div>
        <div className="absolute top-20 right-8 text-tertiary-fixed text-2xl sm:text-3xl drop-shadow-[0_0_12px_#fde400] select-none">✦</div>
        <div className="absolute bottom-16 left-6 text-tertiary-fixed text-3xl sm:text-4xl drop-shadow-[0_0_10px_#fde400] select-none">☆</div>
        <div className="absolute bottom-28 right-8 text-secondary-fixed text-3xl sm:text-4xl drop-shadow-[0_0_10px_#00f2d1] select-none">✦</div>

        {/* Hero Title Section */}
        <div className="flex flex-col items-center justify-center -space-y-4 sm:-space-y-6 z-10 w-full relative select-none">
          <div className="relative">
            <h1
              className="font-display text-5xl sm:text-7xl leading-none uppercase text-tertiary-fixed font-black transform -rotate-3 relative z-10 tracking-tighter"
              style={{
                textShadow: "3px 3px 0 #ab00a3, 6px 6px 0 #ab00a3, 9px 9px 0 #ab00a3, 12px 12px 0 #ab00a3, 15px 15px 0 #5a0056"
              }}
            >
              LỄ TỐT NGHIỆP
            </h1>

            {/* Graduation Cap Emoji */}
            <div className="absolute -right-10 sm:-right-14 -top-6 sm:-top-8 text-5xl sm:text-7xl transform rotate-12 drop-shadow-[0_0_20px_rgba(253,228,0,0.6)] z-20">
              🎓
            </div>
          </div>

          {/* Paint Swipes */}
          <div className="absolute top-[65%] right-[15%] w-36 sm:w-48 h-3 sm:h-4 bg-secondary-fixed rounded-full transform -rotate-3 blur-[1px] opacity-80 pointer-events-none"></div>
          <div className="absolute top-[82%] right-[22%] w-56 sm:w-72 h-4 sm:h-5 bg-primary-container rounded-full transform -rotate-2 blur-[1px] opacity-80 pointer-events-none"></div>
        </div>

        {/* Main Content Card */}
        <div className="w-full relative mt-12 sm:mt-16 z-20">

          {/* Yellow Tape Top Left */}
          <div className="absolute -top-4 -left-3 sm:-left-6 w-20 sm:w-28 h-7 sm:h-8 my-auto bg-tertiary-fixed rotate-[-15deg] z-30 shadow-[2px_4px_8px_rgba(0,0,0,0.6)] border border-yellow-200 text-center text-black uppercase font-extrabold text-xs sm:text-sm flex items-center justify-center select-none">
            VIP GUEST
          </div>

          <div className="w-full bg-[#120919]/95 border-2 border-primary-container rounded-3xl p-5 sm:p-7 md:p-8 relative shadow-[0_0_30px_rgba(255,58,242,0.25)]">

            {/* Dotted Patterns in corners */}
            <div className="absolute top-0 right-0 w-28 h-28 opacity-15 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ff3af2 2px, transparent 2px)", backgroundSize: "14px 14px" }}></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 opacity-15 pointer-events-none" style={{ backgroundImage: "radial-gradient(#00f2d1 2px, transparent 2px)", backgroundSize: "14px 14px" }}></div>

            <div className="relative z-10 flex flex-col items-center text-center">

              {/* TRÂN TRỌNG KÍNH MỜI */}
              <p className="font-display text-xs sm:text-sm text-tertiary-fixed tracking-[0.25em] font-black uppercase flex items-center justify-center gap-2">
                <span className="text-secondary-fixed text-base sm:text-lg">✦</span> TRÂN TRỌNG KÍNH MỜI <span className="text-secondary-fixed text-base sm:text-lg">✦</span>
              </p>

              {/* [TÊN KHÁCH MỜI] Bracket Box */}
              <div className="relative border-y-2 border-secondary-fixed px-6 rounded-lg sm:px-10 py-2 sm:py-3 mt-3 inline-block shadow-[0_0_15px_rgba(38,254,220,0.25)] bg-[#1a0f24]/80">
                <div className="absolute top-0 left-0 w-3 h-full border-l-2 rounded-lg border-secondary-fixed"></div>
                <div className="absolute top-0 right-0 w-3 h-full border-r-2 rounded-lg border-secondary-fixed"></div>

                <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-wider drop-shadow-md">
                  {guestName || "[TÊN KHÁCH MỜI]"}
                </h2>
              </div>

              {/* Đến dự lễ tốt nghiệp của */}
              <span className="font-display text-gray-300 uppercase tracking-widest text-[11px] sm:text-xs font-bold mt-6">
                ĐẾN DỰ LỄ TỐT NGHIỆP CỦA
              </span>

              <div className="relative mt-2 mb-6">
                <h3 className="font-display text-3xl sm:text-5xl leading-none text-primary-container italic font-black uppercase drop-shadow-[2px_2px_0_#ab00a3]">
                  {graduateName}
                </h3>
                {/* Yellow Swoosh Underline */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[120%] h-3 border-b-4 border-tertiary-fixed rounded-[100%] transform -rotate-2 -z-10 opacity-90"></div>
                <div className="absolute -top-3 -right-7 sm:-right-10 text-secondary-fixed text-xl sm:text-2xl font-black">///</div>
              </div>

              {/* Quote Box - Thông điệp tri ân tốt nghiệp chính thức */}
              <div className="relative w-full bg-[#180e22] border border-[#331c44] rounded-2xl p-5 sm:p-6 mt-2 shadow-inner text-center">
                <div className="absolute -top-5 -left-2 text-5xl sm:text-6xl text-tertiary-fixed font-serif select-none">“</div>
                <div className="absolute -bottom-9 -right-2 text-5xl sm:text-6xl text-primary font-serif rotate-180 select-none">“</div>
                <p className="font-body text-xs sm:text-sm md:text-base text-gray-300 italic leading-relaxed font-medium">
                  "Một chặng đường đã khép lại để mở ra những chân trời mới.<br className="hidden sm:inline" />
                  Sự hiện diện của{" "}
                  <span className="text-secondary-fixed font-bold">
                    {pronoun ? `${pronoun.toLowerCase()} ` : ""}
                    {getShortDisplayName(guestName) || "bạn"} {" "}
                  </span>

                  là niềm vinh hạnh và món quà ý nghĩa nhất trong ngày trọng đại của Dũng."
                </p>
              </div>

              {/* Bento Grid Info (Dynamic) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mt-6">
                {/* Date */}
                <div className="border-2 border-secondary-fixed bg-[#110a18] rounded-xl p-3.5 sm:p-3 flex items-center gap-3.5 shadow-[0_0_12px_rgba(38,254,220,0.15)] relative overflow-hidden">
                  <div className="bg-[#00f2d1]/20 border-2 border-secondary-fixed rounded-xl w-11 h-11 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                    <Image src="/icons/grad_day.png" alt="Ngày" width={32} height={32} />
                  </div>
                  <div className="text-left">
                    <p className="font-display text-secondary-fixed uppercase font-black text-[10px] sm:text-xs tracking-widest">NGÀY</p>
                    <p className="font-display text-base sm:text-md font-black text-white uppercase mt-0.5">{eventDateDisplay}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="border-2 border-primary-container bg-[#110a18] rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-[0_0_12px_rgba(255,58,242,0.15)] relative overflow-hidden">
                  <div className="bg-primary/20 rounded-xl w-11 h-11 flex items-center justify-center text-xl sm:text-2xl shrink-0 border-2 border-primary">
                    <Image src="/icons/time.png" alt="Ngày" width={32} height={32} />
                  </div>
                  <div className="text-left">
                    <p className="font-display text-primary uppercase font-black text-[10px] sm:text-xs tracking-widest">THỜI GIAN</p>
                    <p className="font-display text-base sm:text-md font-black text-white uppercase mt-0.5">{eventTime}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="border-2 border-tertiary-fixed bg-[#110a18] rounded-xl p-3 flex items-center gap-3.5 shadow-[0_0_12px_rgba(253,228,0,0.15)] sm:col-span-2">
                  <div className="bg-tertiary-fixed/20 rounded-xl w-11 h-11 flex items-center justify-center text-xl sm:text-2xl border-2 border-tertiary-fixed shrink-0 mt-0.5">
                    <Image src="/icons/school.png" alt="Ngày" width={32} height={32} />
                  </div>
                  <div className="text-left flex-1">
                    {/* <p className="font-display text-tertiary-fixed uppercase font-black text-[10px] sm:text-xs tracking-widest">ĐỊA ĐIỂM</p> */}
                    <p className="font-display text-base sm:text-xl font-black text-white uppercase leading-snug mt-0.5">{locationName}</p>
                    <p className="font-body text-gray-300 mt-1.5 text-xs sm:text-sm flex items-center gap-1.5">
                      <Image src="/icons/location.png" alt="Ngày" width={25} height={25} />
                      {locationAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Button */}
              <div className="relative mt-5 inline-block w-full sm:w-auto">
                <div className="absolute inset-0 bg-secondary-fixed blur-[8px] opacity-30"></div>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-full bg-[#110a18] border-2 border-secondary-fixed  text-secondary-fixed font-display text-xs sm:text-sm px-6 py-3 uppercase tracking-widest flex items-center justify-center gap-2 font-black hover:bg-secondary-fixed hover:text-black transition-colors rounded-xl skew-x-[-6deg] shadow-[0_0_15px_rgba(38,254,220,0.25)]"
                >
                  <Image src="/icons/google-maps.png" alt="Ngày" width={32} height={32} />
                  <span className="skew-x-[6deg]">XEM VỊ TRÍ TRÊN BẢN ĐỒ</span>
                </a>
              </div>

              {/* Khối Lời nhắn riêng tư từ Dũng / Lưu ý tham dự */}
              <div className="w-full mt-7 flex flex-col items-center">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-tertiary-fixed"></div>
                  <span className="font-display text-tertiary-fixed font-black tracking-widest text-xs sm:text-sm flex items-center gap-1.5 uppercase">
                    {message && message.trim() ? "✦ LỜI NHẮN DÀNH RIÊNG CHO BẠN ✦" : "✦ LƯU Ý THAM DỰ ✦"}
                  </span>
                  <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent to-tertiary-fixed"></div>
                </div>
                <p className="font-body italic text-gray-300 text-xs sm:text-sm mt-3 text-center px-4 leading-relaxed max-w-lg">
                  {message && message.trim() ? (
                    `"${message.trim()}"`
                  ) : (
                    `"Hẹn gặp ${pronoun ? `${pronoun.toLowerCase()} ` : ""}${getShortDisplayName(guestName) || "bạn"} vào hôm đó nha! Đừng quên mặc đúng Dresscode ${dresscode} để cùng nhau lưu giữ những khoảnh khắc thật đẹp."`
                  )}
                </p>
              </div>

            </div>
          </div>

          {/* Cyan Tape Bottom Right */}
          <div className="absolute -bottom-4 -right-3 sm:-right-6 w-24 sm:w-32 h-7 sm:h-8 bg-orange-500 rotate-[-12deg] z-40 shadow-[2px_4px_8px_rgba(0,0,0,0.6)] border border-teal-200 font-extrabold text-xs sm:text-sm flex items-center justify-center text-white">GRAD'27</div>
        </div>

      </div>

      {/* --- OUTSIDE EXPORT CANVAS: HOST INTERACTIVE BUTTONS --- */}
      <section className="w-full flex flex-col items-center gap-6 z-20 mt-8 px-2">

        {/* Professional 3D Bento Countdown Dashboard */}
        <div className="w-full bg-[#160a22]/95 border-4 border-primary-container p-5 sm:p-7 rounded-3xl shadow-[8px_8px_0px_0px_#5a0056] relative overflow-hidden flex flex-col items-center gap-4">

          {/* Header Status Tag (Chỉ hiển thị khi đang đếm ngược) */}
          {countdown.status === "upcoming" && (
            <div className="flex items-center gap-2 bg-[#251336] border-2 border-tertiary-fixed/60 px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_#000]">
              <Image src="/icons/clock.png" className="animate-spin" style={{ animationDuration: "5s" }} alt="Clock" width={32} height={32} />
              <span className="font-display font-black text-xs sm:text-base text-tertiary-fixed uppercase tracking-wider">
                ĐẾM NGƯỢC ĐẾN NGÀY TỐT NGHIỆP
              </span>
            </div>
          )}

          {/* Upcoming State: 4-Unit 3D Digit Displays */}
          {countdown.status === "upcoming" && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-4 mt-1 flex-wrap">
              <CountdownDigitBlock value={countdown.days} label="NGÀY" color="secondary" />
              <ColonSeparator />
              <CountdownDigitBlock value={countdown.hours} label="GIỜ" color="tertiary" />
              <ColonSeparator />
              <CountdownDigitBlock value={countdown.minutes} label="PHÚT" color="primary" />
              <ColonSeparator />
              <CountdownDigitBlock value={countdown.seconds} label="GIÂY" color="secondary" />
            </div>
          )}

          {/* Today State: Glowing Celebration Card */}
          {countdown.status === "today" && (
            <div className="py-4 px-6 sm:px-10 bg-gradient-to-r from-primary-container/20 via-tertiary-fixed/20 to-secondary-fixed/20 border-2 border-tertiary-fixed rounded-2xl text-center shadow-[0_0_20px_rgba(253,228,0,0.2)]">
              <p className="font-display font-black text-lg sm:text-2xl text-tertiary-fixed text-glow-primary uppercase tracking-wide animate-pulse">
                🎉 HÔM NAY LÀ NGÀY LỄ TỐT NGHIỆP!
              </p>
              <p className="font-body text-xs sm:text-sm font-semibold text-gray-300 mt-1">
                Cùng nhau tận hưởng và lưu giữ những khoảnh khắc tuyệt vời nhất nhé!
              </p>
            </div>
          )}

          {/* Past State */}
          {countdown.status === "past" && (
            <div className="py-4 px-6 sm:px-10 bg-[#1f0d2b] border-2 border-secondary-fixed rounded-2xl text-center">
              <p className="font-display font-black text-base sm:text-xl text-green-400  tracking-wide">
                🎉 Sự kiện đã diễn ra thành công tốt đẹp! 🎉
              </p>
            </div>
          )}
        </div>

        {/* --- 3D INTERACTIVE RSVP BENTO DASHBOARD --- */}
        <div className="w-full relative">
          <AnimatePresence mode="wait">

            {/* TRƯỜNG HỢP 1: ĐÃ XÁC NHẬN SẼ THAM GIA (VIP ACCESS PASS BADGE) */}
            {rsvpStatus === "attending" && !isEditingRsvp ? (
              <motion.div
                key="attending-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-gradient-to-br from-[#102d29] via-[#16102a] to-[#12081c] border-4 border-secondary-fixed p-6 sm:p-7 rounded-3xl shadow-[8px_8px_0px_0px_#00f2d1] relative overflow-hidden flex flex-col items-center gap-4 text-center"
              >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-fixed/10 blur-3xl pointer-events-none"></div>

                {/* Status Tag Pill */}
                <div className="flex items-center gap-2 bg-[#0c3833] border-2 border-secondary-fixed px-5 py-1.5 rounded-full shadow-[2px_2px_0px_0px_#000]">
                  <Image src="/icons/rsvp.png" alt="RSVP" width={22} height={22} />
                  <span className="font-display font-black text-xs sm:text-sm text-secondary-fixed uppercase tracking-wider">
                    ĐÃ XÁC NHẬN SẼ THAM DỰ • VIP GUEST
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 max-w-lg">
                  <h3 className="font-display font-black text-lg sm:text-2xl text-white uppercase tracking-tight">
                    HẸN GẶP {pronoun ? pronoun.toUpperCase() : "BẠN"} {getShortDisplayName(guestName).toUpperCase()}! 🎉
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-gray-300 leading-relaxed">
                    Dũng đã lưu thông tin và rất háo hức được đón tiếp {pronoun ? pronoun.toLowerCase() : "bạn"} tại lễ tốt nghiệp!
                  </p>
                </div>

                {/* Event Fast-Recap Bento */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-md bg-[#0a1f1c]/90 border border-secondary-fixed/40 p-3.5 rounded-2xl shadow-[3px_3px_0px_0px_#000]">
                  <div className="text-left pl-2">
                    <p className="text-[10px] font-display font-bold text-gray-400 uppercase">THỜI GIAN</p>
                    <p className="font-display font-black text-xs sm:text-sm text-secondary-fixed">{eventTime}</p>
                    <p className="text-[11px] text-white font-bold">{eventDateDisplay}</p>
                  </div>
                  <div className="text-left pl-2 border-l border-secondary-fixed/30">
                    <p className="text-[10px] font-display font-bold text-gray-400 uppercase">DRESSCODE</p>
                    <p className="font-display font-black text-xs sm:text-sm text-tertiary-fixed">{dresscode}</p>
                    <p className="text-[11px] text-gray-300">Tone thanh lịch</p>
                  </div>
                </div>

                {/* 1-Click Add to Google Calendar Button in VIP Pass */}
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-md bg-gradient-to-r from-tertiary-fixed via-yellow-400 to-[#ffd000] text-black font-display font-black py-3.5 px-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#00f2d1] active:translate-y-0 active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm"
                >
                  <Image src="/icons/grad_day.png" alt="Calendar" width={22} height={22} />
                  <span> THÊM VÀO LỊCH GOOGLE ĐỂ NHẮC HẸN</span>
                </a>

                {/* Change decision small link button */}
                <button
                  onClick={() => setIsEditingRsvp(true)}
                  className="text-xs font-display font-bold text-gray-400 hover:text-secondary-fixed underline underline-offset-4 transition-colors cursor-pointer mt-1"
                >
                  Bạn có thay đổi kế hoạch? Bấm vào đây để đổi ý
                </button>
              </motion.div>
            ) : rsvpStatus === "declined" && !isEditingRsvp ? (

              /* TRƯỜNG HỢP 2: ĐÃ BÁO VẮNG (WARM APPRECIATION CARD) */
              <motion.div
                key="declined-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-[#1e0a1a] border-4 border-red-500/80 p-6 sm:p-7 rounded-3xl shadow-[8px_8px_0px_0px_#000] relative overflow-hidden flex flex-col items-center gap-3.5 text-center"
              >
                {/* Status Tag Pill */}
                <div className="flex items-center gap-2 border-2 border-red-600 px-5 py-1.5 rounded-full shadow-[2px_2px_0px_0px_#000]">
                  {/* <span className="text-base">💌</span> */}
                  <span className="font-display font-black text-xs sm:text-sm text-red-500 uppercase tracking-wider">
                    ĐÃ GHI NHẬN PHẢN HỒI VẮNG MẶT
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 max-w-lg">
                  <h3 className="font-display font-black text-base sm:text-xl text-white">
                    CẢM ƠN {pronoun ? pronoun.toUpperCase() : "BẠN"} {getShortDisplayName(guestName).toUpperCase()}!
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-gray-300 leading-relaxed">
                    Dù rất tiếc vì {pronoun ? pronoun.toLowerCase() : "bạn"} không thể đến chung vui hôm đó, Dũng xin gửi lời cảm ơn chân thành nhất vì những tình cảm và sự quan tâm của bạn!
                  </p>
                </div>

                {/* Change decision small link button */}
                <button
                  onClick={() => setIsEditingRsvp(true)}
                  className="text-xs font-display font-bold text-tertiary-fixed hover:text-white underline underline-offset-4 transition-colors cursor-pointer mt-1"
                >
                  ✨ Đổi ý: Tôi có thể sắp xếp tham gia lại
                </button>
              </motion.div>
            ) : (

              /* TRƯỜNG HỢP 3: CHƯA PHẢN HỒI HOẶC ĐANG CHỌN ĐỔI Ý (SELECTION STATE) */
              <motion.div
                key="selection-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-[#160a22]/95 border-4 border-secondary-fixed/80 p-5 sm:p-7 rounded-3xl shadow-[8px_8px_0px_0px_#000] relative overflow-hidden flex flex-col items-center gap-4"
              >
                {/* Header Status Tag */}
                <div className="flex items-center gap-2 bg-[#251336] border-2 border-secondary-fixed/60 px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_#000]">
                  <Image src="/icons/rsvp.png" alt="RSVP" width={28} height={28} />
                  <span className="font-display font-black text-xs sm:text-base text-secondary-fixed uppercase tracking-wider">
                    XÁC NHẬN THAM DỰ LỄ TỐT NGHIỆP
                  </span>
                </div>

                <p className="font-body text-xs sm:text-sm text-gray-200 text-center max-w-lg leading-relaxed">
                  {pronoun ? pronoun : "Bạn"} <span className="text-secondary-fixed font-bold">{getShortDisplayName(guestName) || "khách quý"}</span> có thể sắp xếp đến chung vui cùng Dũng vào ngày <span className="text-tertiary-fixed font-bold">{eventDateDisplay}</span> được không?
                </p>

                {/* 2 Dual Action Tactile Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-lg mt-1">
                  {/* Button 1: SẼ THAM GIA */}
                  <button
                    onClick={() => handleRsvpSubmit("attending")}
                    disabled={rsvpLoading}
                    className="group relative w-full py-4 px-5 rounded-2xl border-4 border-black font-display font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer select-none bg-gradient-to-r from-secondary-fixed to-[#00d6b8] text-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#fde400] active:translate-y-0 active:shadow-none"
                  >
                    <span className="text-xl">🎉</span>
                    <span>SẼ THAM GIA</span>
                  </button>

                  {/* Button 2: BÁO VẮNG */}
                  <button
                    onClick={() => handleRsvpSubmit("declined")}
                    disabled={rsvpLoading}
                    className="group relative w-full py-4 px-5 rounded-2xl border-4 border-black font-display font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer select-none bg-[#14081c] text-gray-400 border-gray-700 hover:border-red-400 hover:text-red-300 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#ff3af2] active:translate-y-0 active:shadow-none"
                  >
                    <span className="text-lg">😢</span>
                    <span>BÁO VẮNG</span>
                  </button>
                </div>

                {isEditingRsvp && (
                  <button
                    onClick={() => setIsEditingRsvp(false)}
                    className="text-xs font-display font-bold text-gray-400 hover:text-white underline transition-colors cursor-pointer mt-1"
                  >
                    Hủy thay đổi
                  </button>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* --- ACTION BUTTONS SUITE (2-TIER HIERARCHICAL BENTO LAYOUT) --- */}
        <div className="flex flex-col gap-3 w-full max-w-2xl justify-center mt-2">

          {/* Tầng 1: 2 Nút Hành Động Trọng Tâm (Primary Hero Actions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
            {/* 1. Download Image Button */}
            <button
              onClick={downloadImage}
              className="group relative w-full bg-gradient-to-r from-[#ff3af2] via-[#f43f5e] to-[#ab00a3] text-white font-display font-black text-sm sm:text-base py-4 px-5 rounded-2xl border-4 border-black shadow-[5px_5px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#00f2d1] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer overflow-hidden select-none"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 pointer-events-none"></div>
              <Image src="/icons/download.png" alt="download" width={26} height={26} />
              <span className="drop-shadow-[1px_1px_0_#000] whitespace-nowrap">TẢI THƯ MỜI (PNG)</span>
            </button>

            {/* 2. Fireworks Celebration Button */}
            <button
              onClick={() => fireGrandCelebration()}
              className="group relative w-full bg-gradient-to-r from-secondary-fixed via-[#00f2d1] to-[#26fedc] text-black font-display font-black text-sm sm:text-base py-4 px-5 rounded-2xl border-4 border-black shadow-[5px_5px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#ff3af2] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer overflow-hidden select-none"
            >
              <Image src="/icons/firework.png" alt="download" width={26} height={26} />
              <span className="whitespace-nowrap">BẮN PHÁO HOA</span>
            </button>
          </div>

          {/* Tầng 2: 2 Nút Tiện Ích Phụ Trợ (Secondary Utility Actions) */}
          <div className="grid grid-cols-2 gap-6 w-full">
            {/* 3. Add to Google Calendar Button */}
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#1b0a26] border-2 border-secondary-fixed/50 hover:border-secondary-fixed text-secondary-fixed hover:bg-secondary-fixed hover:text-black font-display font-bold text-xs sm:text-sm py-3.5 px-3 rounded-xl shadow-[3px_3px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <Image src="/icons/grad_day.png" alt="calendar" width={18} height={18} />
              <span className="whitespace-nowrap">Lưu Lịch Google</span>
            </a>

            {/* 4. Edit Name Button */}
            <button
              onClick={() => window.history.back()}
              className="w-full bg-[#1b0a26] border-2 border-tertiary-fixed/50 hover:border-tertiary-fixed text-tertiary-fixed hover:bg-tertiary-fixed hover:text-black font-display font-bold text-xs sm:text-sm py-3.5 px-3 rounded-xl shadow-[3px_3px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <Image src="/icons/edit3.png" alt="edit" width={18} height={18} />
              <span className="whitespace-nowrap">Đổi Tên / Sửa Thiệp</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}

