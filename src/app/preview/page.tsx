"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InvitationCard } from "@/components/InvitationCard";
import { fireGrandCelebration } from "@/utils/confetti";
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
    const data = localStorage.getItem("inviteData");
    if (data) {
      setFormData(JSON.parse(data));
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
