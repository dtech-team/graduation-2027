"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { VipUserItem } from "@/app/api/auth/vip/route";

export function VipProtectedRoute({ children, title }: { children: React.ReactNode, title: string }) {
  const [vipUser, setVipUser] = useState<VipUserItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const saved = localStorage.getItem("vip_auth_user");
      if (saved) {
        try {
          setVipUser(JSON.parse(saved));
        } catch (e) {}
      } else {
        setVipUser(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#0a0410]"></div>;

  if (!vipUser || vipUser.status !== "approved") {
    return (
      <div className="w-full flex-grow flex flex-col items-center justify-center min-h-[90vh] px-4">
        <div className="w-full max-w-2xl p-8 border-4 border-dashed border-gray-800 rounded-3xl bg-[#12061c]/50 backdrop-blur-sm text-center shadow-2xl">
          <Lock className="w-16 h-16 text-gray-600 mx-auto mb-6" />
          <h3 className="font-display font-black text-2xl text-white uppercase tracking-wider mb-4">
            Khu vực Đặc biệt
          </h3>
          <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed mb-6">
            Trang <span className="text-white font-bold">{title}</span> chỉ dành cho các tài khoản đã xác thực. 
            {vipUser?.status === "pending" 
              ? " Tài khoản của bạn đang chờ duyệt, vui lòng quay lại sau!"
              : " Vui lòng đăng nhập ở góc phải bên trên để truy cập."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
