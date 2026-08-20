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

    // Trigger Grand Celebration Fireworks Sequence
    const timer = setTimeout(() => {
      fireGrandCelebration();
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Header />
      
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 flex flex-col items-center relative flex-grow">
        

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
