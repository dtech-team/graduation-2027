"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function InputForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    guestName: "",
    pronoun: "",
    relationship: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("inviteData", JSON.stringify(formData));
    router.push("/preview");
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="guestName" className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider">
              TÊN KHÁCH MỜI <span className="text-primary">*</span>
            </label>
            <input 
              type="text" 
              id="guestName"
              required
              value={formData.guestName}
              onChange={(e) => setFormData({...formData, guestName: e.target.value})}
              placeholder="VD: Nguyễn Văn Minh"
              className="w-full bg-[#13091a] text-white font-body px-6 py-3.5 rounded-full border-2 border-secondary-fixed focus:border-primary focus:ring-2 focus:ring-secondary-fixed focus:outline-none placeholder-gray-500 font-bold text-base shadow-[0_0_12px_rgba(38,254,220,0.15)] transition-all"
            />
          </div>

          {/* Pronoun & Relationship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="pronoun" className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider">
                XƯNG HÔ
              </label>
              <input 
                type="text" 
                id="pronoun"
                value={formData.pronoun}
                onChange={(e) => setFormData({...formData, pronoun: e.target.value})}
                placeholder="VD: Bạn, Anh, Chị..."
                className="w-full bg-[#13091a] text-white font-body px-6 py-3.5 rounded-full border-2 border-tertiary-fixed focus:border-primary focus:ring-2 focus:ring-tertiary-fixed focus:outline-none placeholder-gray-500 font-bold text-base shadow-[0_0_12px_rgba(253,228,0,0.15)] transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="relationship" className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider">
                MỐI QUAN HỆ
              </label>
              <input 
                type="text" 
                id="relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                placeholder="VD: Bạn thân, Đồng nghiệp..."
                className="w-full bg-[#13091a] text-white font-body px-6 py-3.5 rounded-full border-2 border-secondary-fixed focus:border-primary focus:ring-2 focus:ring-secondary-fixed focus:outline-none placeholder-gray-500 font-bold text-base shadow-[0_0_12px_rgba(38,254,220,0.15)] transition-all"
              />
            </div>
          </div>

          {/* Personal Message */}
          {/* <div className="flex flex-col gap-2">
            <label htmlFor="message" className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider">
              LỜI NHẮN RIÊNG
            </label>
            <textarea 
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="VD: Nhớ đến đúng giờ quẩy cùng tớ nhé..."
              rows={3}
              className="w-full bg-[#13091a] text-white font-body p-4 sm:p-5 rounded-2xl border-2 border-tertiary-fixed focus:border-primary focus:ring-2 focus:ring-tertiary-fixed focus:outline-none placeholder-gray-500 font-medium text-base shadow-[0_0_12px_rgba(253,228,0,0.15)] resize-none transition-all"
            />
          </div> */}

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
