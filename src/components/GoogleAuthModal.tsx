"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ShieldCheck, 
  Clock, 
  LogOut, 
  AlertCircle, 
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { VipUserItem } from "@/app/api/auth/vip/route";
import Image from "next/image";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: VipUserItem) => void;
}

export function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const [currentUser, setCurrentUser] = useState<VipUserItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);

  // Tải thông tin từ localStorage khi mở modal
  useEffect(() => {
    if (isOpen) {
      const savedUserStr = localStorage.getItem("vip_auth_user");
      if (savedUserStr) {
        try {
          const user: VipUserItem = JSON.parse(savedUserStr);
          setCurrentUser(user);
          checkLiveStatus(user.email);
        } catch (e) {}
      }
    }
  }, [isOpen]);

  // Kiểm tra trạng thái duyệt mới nhất từ server
  const checkLiveStatus = async (userEmail: string) => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/vip?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("vip_auth_user", JSON.stringify(data.user));
        if (data.user.status === "approved" && onSuccess) {
          onSuccess(data.user);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vip_auth_user");
    setCurrentUser(null);
    setStatusMsg(null);
    window.dispatchEvent(new Event("storage")); // Báo cho Header update
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md ">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#180924] border-4 border-secondary-fixed rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ff3af2] text-white animate__animated animate__bounceIn"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#2a133d] hover:bg-red-950 text-gray-400 hover:text-red-400 border border-gray-700 transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl  text-black flex items-center justify-center font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Image src={currentUser ? "/icons/info1.png" : "/icons/login3.png"} alt="login" width={35} height={35} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-white">
                {currentUser ? "THÔNG TIN TÀI KHOẢN" : "ĐĂNG NHẬP NGAY"}
              </h2>
              <p className="text-xs text-gray-400">
                {currentUser ? "Quản lý trạng thái đặc quyền của bạn" : "Đăng nhập và được cấp quyền sử dụng đầy đủ tính năng"}
              </p>
            </div>
          </div>

          {/* TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP */}
          {currentUser ? (
            <div className="flex flex-col gap-4">
              {/* Profile Card */}
              <div className=" p-4 rounded-2xl border border-gray-800 flex items-center gap-3.5">
                <img
                  src={currentUser.googleAvatar || "/icons/user.png"}
                  onError={(e) => { e.currentTarget.src = "/icons/user.png"; }}
                  referrerPolicy="no-referrer"
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-secondary-fixed bg-black shrink-0 object-cover"
                />
                <div className="flex-1 min-w-0 ">
                  <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-sm text-white truncate">
                      {currentUser.googleName}
                    </span>
                    {currentUser.status === "approved" && (
                      <span className="text-[10px] bg-yellow-400 text-black font-black px-2 py-0.5 rounded-full shrink-0">
                        VIP 
                      </span>
                    )}
                  </div> {"•"}
                  {currentUser.claimedGuestName && (
                    <p className="text-[11px] text-tertiary-fixed font-bold mt-0.5">
                      {currentUser.claimedGuestName}
                    </p>
                  )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                  
                </div>
              </div>

              {/* Status Banner */}
              {currentUser.status === "approved" ? (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 text-xs font-display flex items-center gap-2.5">
                  <Image src="/icons/check1.png" alt="verified" width={30} height={30} />
                  <div>
                    <p className="font-black text-emerald-300 uppercase tracking-wider text-sm">
                      DŨNG ĐÃ DUYỆT CHO BẠN! 
                    </p>
                    <p className="mt-1 leading-relaxed text-gray-300">
                      Tài khoản Google của bạn đã được xác nhận thành công
                    </p>
                  </div>
                </div>
              ) : currentUser.status === "rejected" ? (
                <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-display flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-red-300 uppercase tracking-wider text-sm">
                      YÊU CẦU CHƯA ĐƯỢC DUYỆT
                    </p>
                    <p className="mt-1 text-gray-300">
                      Thông tin Google của bạn chưa trùng khớp với khách mời nào trong danh sách.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500 text-amber-200 text-xs font-display flex items-start gap-2.5">
                  {/* <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" /> */}
                  <div>
                    <p className="font-black text-amber-300 uppercase tracking-wider text-sm">
                      ĐANG CHỜ DUYỆT THÔNG TIN 
                    </p>
                    <p className="mt-1 text-gray-300 leading-relaxed">
                      Dũng sẽ kiểm tra thông tin của <span className="font-bold text-white">"{currentUser.googleName}"</span> để kích hoạt quyền. Bạn hãy bấm "Kiểm Tra Lại" sau ít phút nhé!
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => checkLiveStatus(currentUser.email)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-secondary-fixed text-black font-display font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {/* <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> */}
                  <span>{loading ? "ĐANG KIỂM TRA..." : "KIỂM TRA LẠI TRẠNG THÁI"}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="py-3 px-3.5 rounded-xl bg-gray-800 hover:bg-red-950 text-gray-400 hover:text-red-400 border border-gray-700 transition-colors cursor-pointer"
                  title="Đăng xuất tài khoản này"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP -> CHUYỂN HƯỚNG SANG GOOGLE OAUTH */
            <div className="flex flex-col gap-4">
              {/* <p className="text-sm text-gray-300 font-display mb-2">
                Hệ thống sẽ chuyển hướng bạn tới trang đăng nhập an toàn của Google. 
              </p> */}
              
              <button
                onClick={() => {
                  window.location.href = "/api/auth/google/login";
                }}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-display font-bold py-3.5 px-4 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_#00f2d1] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 cursor-pointer select-none"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span className="text-[15px] font-black">CHUYỂN ĐẾN ĐĂNG NHẬP GOOGLE</span>
              </button>

              {statusMsg && (
                <div
                  className={`mt-2 p-3 rounded-xl text-xs font-display font-bold border ${
                    statusMsg.type === "success"
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                      : statusMsg.type === "warning"
                      ? "bg-amber-950/80 border-amber-500 text-amber-200"
                      : "bg-red-950/80 border-red-500 text-red-200"
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
