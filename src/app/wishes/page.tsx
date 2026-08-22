"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VipProtectedRoute } from "@/components/VipProtectedRoute";
import { Heart, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { VipUserItem } from "@/app/api/auth/vip/route";
import Image from "next/image";

export default function WishesPage() {
  const [vipUser, setVipUser] = useState<VipUserItem | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem("vip_auth_user");
    if (saved) {
      try { setVipUser(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const [wishes, setWishes] = useState([
    { id: 1, name: "Minh Hà", text: "Chúc Dũng tốt nghiệp vui vẻ nhé! Tương lai rực rỡ!", time: "10 phút trước" },
    { id: 2, name: "Cô Phương", text: "Chúc mừng em, chúc em thành công trên con đường sắp tới.", time: "1 giờ trước" },
    { id: 3, name: "Hoàng Tuấn", text: "Tốt nghiệp rồi, anh em mình phải làm một bữa ra trò thôi!", time: "Hôm qua" }
  ]);
  const [newWish, setNewWish] = useState("");

  const handleSendWish = () => {
    if (!newWish.trim() || !vipUser) return;
    setWishes([{
      id: Date.now(),
      name: vipUser.googleName,
      text: newWish,
      time: "Vừa xong"
    }, ...wishes]);
    setNewWish("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0410]">
      <Header />
      
      <main className="flex-grow pt-10 pb-20 px-4 sm:px-6 z-10 relative">
        <VipProtectedRoute title="Sổ Lời Chúc">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 w-full">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-[3px_3px_0px_0px_#000]">
                  <Image src="/icons/wish.png" alt="heart" width={35} height={35} />
                </div>
                <div>
                  <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider">
                    Sổ Lời Chúc
                  </h1>
                  <p className="text-gray-400 text-sm">Hãy để lại một vài lời chúc tốt đẹp nhé!</p>
                </div>
              </div>
            </div>

            <div className="bg-[#180924] border-4 border-pink-500 rounded-3xl p-6 sm:p-10 shadow-[12px_12px_0px_0px_#ec4899]">
              
              {/* Vùng nhập lời chúc */}
              <div className="relative mb-10">
                <textarea 
                  value={newWish}
                  onChange={(e) => setNewWish(e.target.value)}
                  placeholder="Viết lời chúc của bạn tới Dũng..."
                  className="w-full bg-[#0a0410] border-4 border-gray-800 focus:border-pink-500 rounded-2xl p-5 text-base text-white resize-none outline-none transition-all focus:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                  rows={4}
                />
                <button 
                  onClick={handleSendWish}
                  className="absolute bottom-4 right-4 bg-gradient-to-r from-pink-600 to-pink-500 hover:to-pink-400 text-white px-6 py-3 rounded-xl font-display font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000] transition-all flex items-center gap-2"
                >
                  Gửi
                </button>
              </div>

              {/* Danh sách lời chúc */}
              <div className="space-y-6">
                <h3 className="font-display font-black text-xl text-pink-400 uppercase tracking-wider mb-2">
                  Lời chúc từ mọi người
                </h3>
                
                {wishes.map(wish => (
                  <div key={wish.id} className="bg-[#2a133d]/50 p-6 rounded-2xl border-2 border-pink-500/20 hover:border-pink-500/50 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-900 border-2 border-pink-500 flex items-center justify-center font-bold text-pink-200">
                          {wish.name.charAt(0)}
                        </div>
                        <span className="font-black text-white text-lg">{wish.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-bold bg-black/40 px-3 py-1 rounded-full">{wish.time}</span>
                    </div>
                    <p className="text-gray-300 text-base leading-relaxed pl-14">{wish.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </VipProtectedRoute>
      </main>

      <Footer />
    </div>
  );
}
