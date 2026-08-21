"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InvitationCard } from "@/components/InvitationCard";
import { fireGrandCelebration } from "@/utils/confetti";
import { decodeInviteData } from "@/utils/share";
import { motion } from "framer-motion";

export default function PreviewPage() {
  const [formData, setFormData] = useState({
    guestName: "",
    pronoun: "",
    relationship: "",
    message: "",
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Ưu tiên đọc dữ liệu từ URL Query String
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const encodedInvite = params.get("i");

      if (encodedInvite) {
        const decoded = decodeInviteData(encodedInvite);
        if (decoded && decoded.guestName) {
          setFormData({
            guestName: decoded.guestName,
            pronoun: decoded.pronoun || "",
            relationship: decoded.relationship || "",
            message: decoded.message || "",
          });
          localStorage.setItem("inviteData", JSON.stringify(decoded));
          triggerFireworks();
          return;
        }
      }

      // Hỗ trợ thêm dạng query params trực tiếp ?guest=...&pronoun=...
      const guest = params.get("guest") || params.get("n");
      if (guest) {
        const directData = {
          guestName: guest,
          pronoun: params.get("pronoun") || params.get("p") || "",
          relationship: params.get("rel") || params.get("r") || "",
          message: params.get("msg") || params.get("m") || "",
        };
        setFormData(directData);
        localStorage.setItem("inviteData", JSON.stringify(directData));
        triggerFireworks();
        return;
      }
    }

    // 2. Fallback đọc từ LocalStorage
    const data = localStorage.getItem("inviteData");
    if (data) {
      try {
        setFormData(JSON.parse(data));
      } catch (e) {
        console.error(e);
      }
    }

    triggerFireworks();
  }, []);

  const triggerFireworks = () => {
    // Bắn đợt 1 ngay khi vào trang
    const timer1 = setTimeout(() => {
      fireGrandCelebration();
    }, 150);

    return () => {
      clearTimeout(timer1);
    };
  };

  if (!mounted) return null;

  return (
    <>
      <Header />
      
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 flex flex-col items-center relative flex-grow">
        
        {/* Floating Celebration Header Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-6 flex items-center gap-2 bg-[#220d33] border-2 border-secondary-fixed px-5 py-2 rounded-full shadow-[4px_4px_0px_0px_#ff3af2] select-none cursor-pointer hover:scale-105 transition-transform"
          onClick={() => fireGrandCelebration()}
          title="Bấm để bắn pháo hoa lần nữa!"
        >
          <span className="text-lg">🎉</span>
          <span className="font-display font-black text-xs sm:text-sm text-secondary-fixed uppercase tracking-wider">
            THƯ MỜI MỞ KHÓA THÀNH CÔNG!
          </span>
        </motion.div>

        {/* Animated Entrance for Invitation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 22 }}
          className="w-full flex justify-center"
        >
          <InvitationCard {...formData} />
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
