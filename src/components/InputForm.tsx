"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { encodeInviteData } from "@/utils/share";
import { matchGuestInList, SECRET_GUEST_LIST, GuestItem } from "@/config/guests";

export function InputForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    guestName: "",
    pronoun: "",
    relationship: "",
    message: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const matchedGuest = matchGuestInList(formData.guestName, currentGuests);

      if (!matchedGuest) {
        setErrorMessage(
          `Tên "${formData.guestName}" chưa có trong danh sách hợp lệ. Vui lòng kiểm tra lại chính xác họ tên nhé!`
        );
        setIsSubmitting(false);
        return;
      }

      // 3. Tự động điền dữ liệu chuẩn được Dũng định sẵn
      const finalData = {
        guestName: matchedGuest.name,
        pronoun: formData.pronoun || matchedGuest.pronoun,
        relationship: formData.relationship || matchedGuest.relationship,
        message: matchedGuest.message || formData.message || "",
      };

      localStorage.setItem("inviteData", JSON.stringify(finalData));
      const encoded = encodeInviteData(finalData);
      router.push(`/preview?i=${encoded}`);
    } catch (err) {
      setErrorMessage("Có lỗi xảy ra khi kiểm tra danh sách khách mời!");
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-full max-w-xl relative z-20"
    >
      {/* Outer Card with Yellow Border & Hard Pink Shadow */}
      <div className="w-full bg-[#1c0f24] rounded-3xl p-6 sm:p-8 md:p-10 border-4 border-tertiary-fixed shadow-[10px_10px_0px_0px_#ff3af2] relative">
        
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
              value={formData.guestName}
              onChange={(e) => {
                setFormData({...formData, guestName: e.target.value});
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

          {/* Pronoun & Relationship (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="pronoun" className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider">
                XƯNG HÔ <span className="text-xs text-gray-400 font-normal lowercase">(tự động/tùy chọn)</span>
              </label>
              <input 
                type="text" 
                id="pronoun"
                autoComplete="off"
                value={formData.pronoun}
                onChange={(e) => setFormData({...formData, pronoun: e.target.value})}
                placeholder="VD: Bạn, Anh, Chị..."
                className="w-full bg-[#13091a] text-white font-body px-6 py-3.5 rounded-full border-2 border-tertiary-fixed focus:border-primary focus:ring-2 focus:ring-tertiary-fixed focus:outline-none placeholder-gray-500 font-bold text-base shadow-[0_0_12px_rgba(253,228,0,0.15)] transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="relationship" className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider">
                MỐI QUAN HỆ <span className="text-xs text-gray-400 font-normal lowercase">(tùy chọn)</span>
              </label>
              <input 
                type="text" 
                id="relationship"
                autoComplete="off"
                value={formData.relationship}
                onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                placeholder="VD: Bạn thân, Đồng nghiệp..."
                className="w-full bg-[#13091a] text-white font-body px-6 py-3.5 rounded-full border-2 border-secondary-fixed focus:border-primary focus:ring-2 focus:ring-secondary-fixed focus:outline-none placeholder-gray-500 font-bold text-base shadow-[0_0_12px_rgba(38,254,220,0.15)] transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-[#ffabee] via-[#ff3af2] to-[#ab00a3] text-white font-display font-black text-xl sm:text-2xl py-4 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_var(--color-secondary-fixed)] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider cursor-pointer mt-2"
          >
            TẠO THƯ MỜI
          </button>
        </form>
      </div>
    </motion.div>
  );
}
