"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { encodeInviteData } from "@/utils/share";
import { matchGuestInList, SECRET_GUEST_LIST, GuestItem } from "@/config/guests";
import { FullScreenLoader } from "@/components/FullScreenLoader";

export function InputForm() {
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("inviteData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.guestName) {
          setGuestName(parsed.guestName);
        }
      }
    } catch (e) {
      // Ignore parse error
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Lấy danh sách khách mời mới nhất từ server
      let currentGuests: GuestItem[] = SECRET_GUEST_LIST;
      try {
        const res = await fetch("/api/guests");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          currentGuests = data.data;
        }
      } catch (err) {
        console.warn("Fallback to local guest list", err);
      }

      // 2. So khớp tên trong danh sách khách mời
      const matchedGuest = matchGuestInList(guestName, currentGuests);

      // Ghi nhận nhật ký tra cứu để Dũng theo dõi ai đang tò mò trên web
      fetch("/api/lookup-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputName: guestName.trim(),
          matched: Boolean(matchedGuest),
          matchedGuestName: matchedGuest ? matchedGuest.name : null,
        }),
      }).catch((err) => console.error("Log error:", err));

      if (!matchedGuest) {
        setErrorMessage(
          `Tên "${guestName}" chưa có trong danh sách hợp lệ. Vui lòng kiểm tra lại chính xác họ tên nhé!`
        );
        setIsSubmitting(false);
        return;
      }

      // 3. Tự động điền dữ liệu chuẩn được Dũng định sẵn
      const finalData = {
        guestName: matchedGuest.name,
        pronoun: matchedGuest.pronoun || "Bạn",
        relationship: matchedGuest.relationship || "Bạn bè",
        message: matchedGuest.message || "",
      };

      // Ghi nhận số lượng thiệp đã tạo
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite" }),
      }).catch(() => {});

      localStorage.setItem("inviteData", JSON.stringify(finalData));
      const encoded = encodeInviteData(finalData);
      router.push(`/preview?i=${encoded}`);
    } catch (err) {
      setErrorMessage("Có lỗi xảy ra khi kiểm tra danh sách khách mời!");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isSubmitting && <FullScreenLoader text="ĐANG TẠO THIỆP VIP..." subText="Đang kiểm tra vé mời mỏi cả mắt..." />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-xl relative z-20"
      >
      {/* Outer Card with Yellow Border & Hard Pink Shadow */}
      <div className="w-full bg-[#1c0f24] rounded-3xl p-6 sm:p-8 md:p-10 border-4 border-tertiary-fixed shadow-[10px_10px_0px_0px_#ff3af2] relative animate__animated animate__zoomIn">
        
        {/* VIP ACCESS / Sticker Badge on Top Right */}
        <div className="absolute -top-4 right-6 bg-secondary-fixed text-black font-display font-black text-xs px-4 py-1.5 border-2 border-black uppercase tracking-wider rounded-sm shadow-[3px_3px_0px_0px_#000] rotate-3 z-30 select-none">
          VIP GUEST
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" autoComplete="off">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="guestName" className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider">
              TÊN KHÁCH MỜI <span className="text-primary">*</span>
            </label>
            <input 
              type="text" 
              id="guestName"
              name="guestName"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              required
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Nhập chính xác Họ và Tên của bạn..."
              className="w-full bg-[#13091a] text-white font-body px-6 py-3.5 rounded-full border-2 border-secondary-fixed focus:border-primary focus:ring-2 focus:ring-secondary-fixed focus:outline-none placeholder-gray-500 font-bold text-base shadow-[0_0_12px_rgba(38,254,220,0.15)] transition-all"
            />
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium pl-2">
              🔒 Hệ thống sẽ kiểm tra tên có trong danh sách hợp lệ.
            </p>
          </div>

          {/* Error Message Alert */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="p-4 rounded-2xl bg-red-950/90 border-2 border-red-500 text-red-200 text-xs sm:text-sm font-display font-bold shadow-[4px_4px_0px_0px_#000] flex items-center gap-3"
              >
                <span className="text-2xl shrink-0">⚠️</span>
                <p className="leading-snug">{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#ffabee] via-[#ff3af2] to-[#ab00a3] text-white font-display font-black text-xl sm:text-2xl py-4 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_var(--color-secondary-fixed)] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider cursor-pointer mt-2 select-none"
          >
            {isSubmitting ? "ĐANG KIỂM TRA..." : "TẠO THƯ MỜI"}
          </button>
        </form>
      </div>
      </motion.div>
    </>
  );
}
