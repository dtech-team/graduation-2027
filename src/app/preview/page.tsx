"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InvitationCard } from "@/components/InvitationCard";

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
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Header />
      
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 flex flex-col items-center relative flex-grow">
        <InvitationCard {...formData} />
      </main>

      <Footer />
    </>
  );
}
