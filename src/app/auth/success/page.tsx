"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const userParam = searchParams.get("user");
    if (userParam) {
      try {
        // Save to localStorage so Header and GoogleAuthModal pick it up
        localStorage.setItem("vip_auth_user", userParam);
        
        // Dispatch event for other tabs/components
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        console.error("Error saving user:", e);
      }
    }
    
    // Redirect to home after a brief delay for UX
    setTimeout(() => {
      router.replace("/");
    }, 1500);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0a0410] flex items-center justify-center p-4">
      <div className="bg-[#180924] border-4 border-secondary-fixed rounded-3xl p-8 max-w-md w-full text-center shadow-[8px_8px_0px_0px_#00f2d1]">
        <div className="w-16 h-16 bg-secondary-fixed text-black rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display font-black text-2xl text-white mb-2 uppercase tracking-wide">
          Xác Thực Thành Công
        </h1>
        <p className="text-gray-400 text-sm font-display">
          Đang chuyển hướng về trang chủ...
        </p>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0410]" />}>
      <AuthSuccessContent />
    </Suspense>
  );
}
