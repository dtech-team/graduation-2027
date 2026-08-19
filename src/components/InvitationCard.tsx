"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import * as htmlToImage from "html-to-image";

interface CardProps {
  guestName?: string;
  pronoun?: string;
  relationship?: string;
  message?: string;
}

export function InvitationCard({ guestName, pronoun, relationship, message }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

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

  const graduateName = "NGUYỄN VĂN A";

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto z-20">
      
      {/* 
        This is the container that will be exported as the final PNG image.
        It contains the dark synthwave poster background, the title, the card, and graphics.
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
          
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl uppercase text-white font-black drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] transform -rotate-3 mr-20 sm:mr-32">
            LỄ
          </h1>
          
          <div className="relative">
            <h1 
              className="font-display text-5xl sm:text-7xl md:text-8xl leading-none uppercase text-tertiary-fixed font-black transform -rotate-3 relative z-10 tracking-tighter"
              style={{
                textShadow: "3px 3px 0 #ab00a3, 6px 6px 0 #ab00a3, 9px 9px 0 #ab00a3, 12px 12px 0 #ab00a3, 15px 15px 0 #5a0056"
              }}
            >
              TỐT NGHIỆP
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
          <div className="absolute -top-4 -left-3 sm:-left-6 w-20 sm:w-28 h-7 sm:h-8 bg-tertiary-fixed rotate-[-15deg] z-30 shadow-[2px_4px_8px_rgba(0,0,0,0.6)] border border-yellow-200"></div>
          
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
              <div className="relative border-y-2 border-secondary-fixed px-6 sm:px-10 py-2 sm:py-3 mt-3 inline-block shadow-[0_0_15px_rgba(38,254,220,0.25)] bg-[#1a0f24]/80">
                <div className="absolute top-0 left-0 w-3 h-full border-l-2 border-secondary-fixed"></div>
                <div className="absolute top-0 right-0 w-3 h-full border-r-2 border-secondary-fixed"></div>
                
                <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-wider drop-shadow-md">
                  {guestName || "[TÊN KHÁCH MỜI]"}
                </h2>
              </div>

              {/* Đến dự lễ tốt nghiệp của */}
              <span className="font-display text-gray-300 uppercase tracking-widest text-[11px] sm:text-xs font-bold mt-6">
                ĐẾN DỰ LỄ TỐT NGHIỆP CỦA
              </span>
              
              <div className="relative mt-2 mb-6">
                <h3 className="font-display text-3xl sm:text-5xl md:text-6xl leading-none text-primary-container italic font-black uppercase drop-shadow-[2px_2px_0_#ab00a3]">
                  {graduateName}
                </h3>
                {/* Yellow Swoosh Underline */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[120%] h-3 border-b-4 border-tertiary-fixed rounded-[100%] transform -rotate-2 -z-10 opacity-90"></div>
                <div className="absolute -top-3 -right-7 sm:-right-8 text-secondary-fixed text-xl sm:text-2xl font-black">///</div>
              </div>

              {/* Quote Box */}
              <div className="relative w-full bg-[#180e22] border border-[#331c44] rounded-2xl p-5 sm:p-6 mt-2 shadow-inner text-center">
                <div className="absolute -top-5 -left-2 text-5xl sm:text-6xl text-tertiary-fixed font-serif select-none">“</div>
                <div className="absolute -bottom-9 -right-2 text-5xl sm:text-6xl text-primary font-serif rotate-180 select-none">“</div>
                <p className="font-body text-xs sm:text-sm md:text-base text-gray-300 italic leading-relaxed font-medium">
                  {message ? `"${message}"` : (
                    <>
                      "Một chặng đường đã khép lại để mở ra những chân trời mới.<br className="hidden sm:inline" />
                      Sự hiện diện của {pronoun ? pronoun.toLowerCase() : "bạn"} {relationship ? `(đại diện hội ${relationship.toLowerCase()})` : ""} là niềm vinh hạnh và động lực to lớn trong cột mốc quan trọng này của mình."
                    </>
                  )}
                </p>
              </div>

              {/* Bento Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mt-6">
                {/* Date */}
                <div className="border-2 border-secondary-fixed bg-[#110a18] rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-[0_0_12px_rgba(38,254,220,0.15)] relative overflow-hidden">
                  <div className="bg-[#00f2d1]/20 border-2 border-secondary-fixed rounded-xl w-11 h-11 flex items-center justify-center text-xl sm:text-2xl shrink-0">
                    🗓️
                  </div>
                  <div className="text-left">
                    <p className="font-display text-secondary-fixed uppercase font-black text-[10px] sm:text-xs tracking-widest">NGÀY</p>
                    <p className="font-display text-base sm:text-lg font-black text-white uppercase mt-0.5">25 THÁNG 10, 2024</p>
                  </div>
                </div>

                {/* Time */}
                <div className="border-2 border-primary-container bg-[#110a18] rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-[0_0_12px_rgba(255,58,242,0.15)] relative overflow-hidden">
                  <div className="bg-primary/20 rounded-xl w-11 h-11 flex items-center justify-center text-xl sm:text-2xl shrink-0 border-2 border-primary">
                    ⏰
                  </div>
                  <div className="text-left">
                    <p className="font-display text-primary uppercase font-black text-[10px] sm:text-xs tracking-widest">THỜI GIAN</p>
                    <p className="font-display text-base sm:text-lg font-black text-white uppercase mt-0.5">08:00 SÁNG – 11:30 TRƯA</p>
                  </div>
                </div>

                {/* Location */}
                <div className="border-2 border-tertiary-fixed bg-[#110a18] rounded-xl p-4 flex items-start gap-3.5 shadow-[0_0_12px_rgba(253,228,0,0.15)] sm:col-span-2">
                  <div className="bg-tertiary-fixed/20 rounded-xl w-11 h-11 flex items-center justify-center text-xl sm:text-2xl border-2 border-tertiary-fixed shrink-0 mt-0.5">
                    🏫
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-display text-tertiary-fixed uppercase font-black text-[10px] sm:text-xs tracking-widest">ĐỊA ĐIỂM</p>
                    <p className="font-display text-base sm:text-xl font-black text-white uppercase leading-snug mt-0.5">HỘI TRƯỜNG A, ĐẠI HỌC QUỐC GIA</p>
                    <p className="font-body text-gray-300 mt-1.5 text-xs sm:text-sm flex items-center gap-1.5">
                      <span className="text-primary text-sm">📍</span> 123 Đường Tốt Nghiệp, Quận 1, TP.HCM
                    </p>
                    <p className="font-body text-tertiary-fixed mt-1 text-xs sm:text-sm italic font-semibold flex items-center gap-1.5">
                      <span className="text-sm">🎓</span> Cơ nhánh Ngành Thiết kế Đồ họa
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Button */}
              <div className="relative mt-5 inline-block w-full sm:w-auto">
                <div className="absolute inset-0 bg-secondary-fixed blur-[8px] opacity-30"></div>
                <button 
                  type="button"
                  className="relative w-full bg-[#110a18] border-2 border-secondary-fixed text-secondary-fixed font-display text-xs sm:text-sm px-6 py-3 uppercase tracking-widest flex items-center justify-center gap-2 font-black hover:bg-secondary-fixed hover:text-black transition-colors rounded-sm skew-x-[-6deg] shadow-[0_0_15px_rgba(38,254,220,0.25)]"
                >
                  <span className="text-base skew-x-[6deg]">🗺️</span> 
                  <span className="skew-x-[6deg]">XEM VỊ TRÍ TRÊN BẢN ĐỒ</span>
                  <span className="text-xs skew-x-[6deg]">▶</span>
                </button>
              </div>

              {/* Lời nhắn riêng / Ghi chú */}
              <div className="w-full mt-8 flex flex-col items-center">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-tertiary-fixed"></div>
                  <span className="font-display text-tertiary-fixed font-black tracking-widest text-xs sm:text-sm flex items-center gap-1.5">
                    ✦ LỜI NHẮN 💖 ✦
                  </span>
                  <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent to-tertiary-fixed"></div>
                </div>
                <p className="font-body italic text-gray-400 text-xs sm:text-sm mt-3 text-center px-4 leading-relaxed">
                  "Hẹn gặp {pronoun ? pronoun.toLowerCase() : "bạn"} vào ngày vui của mình nhé! Đừng quên mặc theo Dresscode Đen / Trắng nha."
                </p>
              </div>

            </div>
          </div>
          
          {/* Cyan Tape Bottom Right */}
          <div className="absolute -bottom-4 -right-3 sm:-right-6 w-24 sm:w-32 h-7 sm:h-8 bg-secondary-fixed rotate-[-12deg] z-40 shadow-[2px_4px_8px_rgba(0,0,0,0.6)] border border-teal-200"></div>
        </div>

      </div>

      {/* --- OUTSIDE EXPORT CANVAS: HOST INTERACTIVE BUTTONS --- */}
      <section className="w-full flex flex-col items-center gap-6 z-20 mt-8 px-2">
        
        {/* Dynamic Countdown Banner */}
        <div className="bg-[#180e24] border-4 border-primary-container px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl shadow-[6px_6px_0px_0px_#5a0056] flex items-center gap-3 transform rotate-1 hover:rotate-0 transition-transform">
          <span className="text-2xl sm:text-3xl animate-bounce">⏳</span>
          <span className="font-display text-lg sm:text-xl md:text-2xl text-white uppercase tracking-tight font-black">
            CÒN <span className="text-tertiary-fixed text-glow-primary">14 NGÀY</span> NỮA
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-2">
          {/* Download Image Button */}
          <button 
            onClick={downloadImage}
            className="flex-1 bg-gradient-to-r from-primary-container to-primary-fixed text-white font-display font-black text-base sm:text-lg px-6 py-4 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_var(--color-secondary-fixed)] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>TẢI THƯ MỜI (PNG)</span>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", fontFamily: "'Material Symbols Outlined'" }}>download</span>
          </button>
          
          {/* Share Button */}
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Thư Mời Tốt Nghiệp", url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Đã sao chép link thư mời vào clipboard!");
              }
            }}
            className="flex-1 bg-[#251733] border-4 border-black text-white font-display font-black text-base sm:text-lg px-6 py-4 rounded-full shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#ff3af2] hover:text-secondary-fixed active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>CHIA SẺ</span>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", fontFamily: "'Material Symbols Outlined'" }}>share</span>
          </button>

          {/* Edit Button */}
          <button 
            onClick={() => window.history.back()}
            className="bg-transparent border-4 border-secondary-fixed text-secondary-fixed font-display font-black text-base sm:text-lg px-6 py-4 rounded-full shadow-[4px_4px_0px_0px_#000] hover:bg-secondary-fixed hover:text-black hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>SỬA</span>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", fontFamily: "'Material Symbols Outlined'" }}>edit</span>
          </button>
        </div>
      </section>

    </div>
  );
}
