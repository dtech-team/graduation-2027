"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VipProtectedRoute } from "@/components/VipProtectedRoute";
import { useState, useEffect } from "react";
import { VipUserItem } from "@/app/api/auth/vip/route";
import { Send, Star, Heart, Flame, Award, Sparkles } from "lucide-react";
import { Caveat } from "next/font/google";
import Image from "next/image";

const caveat = Caveat({ subsets: ["latin", "latin-ext"], weight: "700" });

const CARD_THEMES = [
  { bg: "bg-[#ffabee]/20", border: "border-white", shadow: "shadow-[8px_8px_0px_0px_#ff3af2]", text: "text-[#ffabee]", icon: Heart },
  { bg: "bg-[#26fedc]/20", border: "border-white", shadow: "shadow-[8px_8px_0px_0px_#00dfc1]", text: "text-[#26fedc]", icon: Star },
  { bg: "bg-[#fde400]/20", border: "border-white", shadow: "shadow-[8px_8px_0px_0px_#dec800]", text: "text-[#fde400]", icon: Award },
  { bg: "bg-[#ab00a3]/20", border: "border-white", shadow: "shadow-[8px_8px_0px_0px_#ffabee]", text: "text-[#ffabee]", icon: Flame },
];

export default function WishesPage() {
  const [vipUser, setVipUser] = useState<VipUserItem | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem("vip_auth_user");
    if (saved) {
      try { setVipUser(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const [wishes, setWishes] = useState<any[]>([]);

  const [newWish, setNewWish] = useState("");
  const [relation, setRelation] = useState("Bạn bè");
  const [isRelationLocked, setIsRelationLocked] = useState(false);

  useEffect(() => {
    if (vipUser?.claimedGuestName) {
      fetch(`/api/rsvp?name=${encodeURIComponent(vipUser.claimedGuestName)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.guest?.relationship) {
            setRelation(data.guest.relationship);
            setIsRelationLocked(true);
          }
        })
        .catch(console.error);
    }
  }, [vipUser]);

  const handleSendWish = () => {
    if (!newWish.trim() || !vipUser) return;
    
    const randomTheme = Math.floor(Math.random() * CARD_THEMES.length);
    const randomRotate = ["rotate-1", "rotate-2", "-rotate-1", "-rotate-2", "-rotate-3"][Math.floor(Math.random() * 5)];

    setWishes([{
      id: Date.now(),
      name: vipUser.googleName,
      relation: relation,
      text: newWish,
      themeIndex: randomTheme,
      rotate: randomRotate,
      isVip: vipUser.status === "approved"
    }, ...wishes]);
    
    setNewWish("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05010a] text-white relative overflow-hidden font-display selection:bg-[#ff3af2] selection:text-white">
      {/* Dark Cyberpunk Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#130318] via-[#05010a] to-[#05010a]"></div>
      
      {/* Subtle Star Particles / Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{
        backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }}></div>

      <Header />
      
      <main className="flex-grow w-full flex flex-col gap-24 relative z-10">
        <VipProtectedRoute title="Sổ Lời Chúc">
          
          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center text-center relative z-10 mt-16 sm:mt-24">
            <div className="relative w-full max-w-4xl flex justify-center">
              {/* Vầng sáng nền phía sau H1 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[160%] bg-gradient-to-r from-[#d946ef]/40 via-[#06b6d4]/30 to-[#eab308]/40 blur-[80px] pointer-events-none z-0"></div>

              {/* Box H1 chính - Kết hợp Brutalist và Cyberpunk */}
              <div className="relative z-10 text-center flex flex-col items-center group">
                
                {/* Script Text "Congrats Dũng!" */}
                <div className="absolute -top-10 sm:-top-16 z-20 transform -rotate-6 animate-float">
                  <span 
                    className={`${caveat.className} pr-4 text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-[#d946ef] group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300 inline-block`}
                    style={{ filter: "drop-shadow(2px 2px 0px #000) drop-shadow(0px 0px 10px rgba(217,70,239,0.8))" }}
                  >
                    Congrats Dũng!
                  </span>
                </div>

                {/* Main 3D Title Box */}
                <div className="relative bg-[#0a0014] border-[6px] sm:border-[10px] border-black py-8 px-10 sm:py-16 sm:px-24 rounded-[30px] sm:rounded-[50px] shadow-[8px_8px_0px_0px_#06b6d4,16px_16px_0px_0px_#d946ef] transform -rotate-2 group-hover:rotate-0 group-hover:-translate-y-2 transition-all duration-300">
                  {/* Inner glowing stroke (Cyberpunk feel) */}
                  <div className="absolute inset-3 sm:inset-5 border-2 sm:border-4 border-[#06b6d4] rounded-[20px] sm:rounded-[38px] opacity-80 pointer-events-none shadow-[inset_0_0_20px_rgba(6,182,212,0.5)]"></div>

                  <h1 
                    className="relative font-display font-black text-5xl sm:text-[70px] md:text-[100px] leading-[1.1] text-white uppercase tracking-tight z-10"
                    style={{ 
                      textShadow: `
                        2px 2px 0px #000,
                        3px 3px 0px #06b6d4,
                        6px 6px 0px #06b6d4,
                        9px 9px 0px #d946ef,
                        12px 12px 0px #d946ef,
                        14px 14px 0px #000,
                        0px 0px 30px rgba(6,182,212,0.6)
                      `,
                      WebkitTextStroke: "1.5px #000",
                    }}
                  >
                    SỔ LỜI CHÚC<br/>
                    <span className="text-[#fde400]">TỐT NGHIỆP</span>
                  </h1>

                  {/* Corner Tech Accents */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#d946ef] border-4 border-black rounded-full shadow-[4px_4px_0px_0px_#000] z-20"></div>
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-[#06b6d4] border-4 border-black rounded-full shadow-[4px_4px_0px_0px_#000] z-20"></div>
                </div>

                {/* Các phần tử trang trí lơ lửng */}
                <div className="absolute -top-4 -right-8 sm:-top-8 sm:-right-16 text-[#eab308] animate-[spin_10s_linear_infinite] z-30 drop-shadow-[2px_2px_0px_#000]">
                  <Image src="/icons/star.png" alt="star" width={60} height={60} />
                </div>
                
                <div className="absolute -bottom-10 -left-6 sm:-bottom-12 sm:-left-12 text-[#06b6d4] animate-pulse z-30 transform -rotate-12 drop-shadow-[2px_2px_0px_#000]">
                  <Star className="w-14 h-14 sm:w-16 sm:h-16" fill="#06b6d4" />
                </div>

                <div className="absolute -bottom-8 right-0 sm:-bottom-12 sm:right-0 bg-gradient-to-r from-[#eab308] to-[#d97706] text-black font-black text-xs sm:text-sm px-5 py-2.5 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_#000] transform -rotate-12 group-hover:-rotate-16 group-hover:scale-110 group-hover:-translate-y-2 transition-all cursor-pointer z-30">
                  #MEMORIES ✨
                </div>
              </div>
            </div>

            {/* Khung Hướng Dẫn & Gửi Lời Chúc */}
            <div className="flex flex-col items-center gap-6 mt-16 sm:mt-16 z-20">
              
              
              <button 
                onClick={() => {
                  document.getElementById("wish-form")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="cursor-pointer bg-[#fde400] text-[#1c0f19] font-display font-black text-xl sm:text-2xl uppercase border-4 border-black rounded-full py-4 px-10 shadow-[4px_4px_0px_0px_#ab00a3] hover:shadow-[8px_8px_0px_0px_#ff3af2] hover:-translate-y-1 hover:-translate-x-1 transition-all flex items-center gap-2"
              >
                <span>Tặng Lời Chúc</span>
              </button>
            </div>
          </section>

          {/* Message Input Form */}
          <section id="wish-form" className="grid md:grid-cols-12 gap-6 relative z-20 mt-16 sm:mt-24">
            <div className="md:col-span-10 md:col-start-2 bg-[#342630]/90 backdrop-blur-xl rounded-2xl p-6 sm:p-10 border-8 border-[#fde400] shadow-[12px_12px_0px_0px_#ab00a3] sm:shadow-[16px_16px_0px_0px_#ab00a3] relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(#554050 2px, transparent 2px)", backgroundSize: "20px 20px" }}
              ></div>
              
              <h2 className="font-display font-black text-2xl sm:text-4xl text-[#fde400] uppercase mb-8 border-b-4 border-[#fde400] pb-2 inline-block relative z-10">
                Gửi Gắm Yêu Thương
              </h2>
              
              <form className="flex flex-col gap-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-[#ffabee] uppercase tracking-widest">Tên của bạn</label>
                    <input 
                      readOnly
                      value={vipUser?.googleName || ""}
                      className="bg-[#241721] border-4 border-[#26fedc] text-[#f3dcea] font-medium text-lg p-4 rounded-xl outline-none opacity-80 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-[#ffabee] uppercase tracking-widest">Mối quan hệ</label>
                    <input 
                      readOnly
                      value={relation}
                      className="bg-[#241721] border-4 border-[#26fedc] text-[#f3dcea] font-medium text-lg p-4 rounded-xl outline-none opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-[#ffabee] uppercase tracking-widest">Lời chúc</label>
                  <textarea 
                    value={newWish}
                    onChange={(e) => setNewWish(e.target.value)}
                    placeholder="Viết vài dòng tâm tình..." 
                    className={`${caveat.className} bg-[#241721] border-4 border-[#26fedc] text-[#f3dcea] text-3xl sm:text-[36px] leading-tight p-4 sm:p-6 rounded-xl focus:border-[#ffabee] focus:ring-4 focus:ring-[#ffabee]/50 outline-none transition-all placeholder:text-[#dbbed2]/50 placeholder:font-display placeholder:text-lg`}
                    rows={4}
                  ></textarea>
                </div>
                
                <button 
                  type="button"
                  onClick={handleSendWish}
                  disabled={!newWish.trim()}
                  className="mt-4 bg-gradient-to-r from-[#ff3af2] to-[#ab00a3] text-[#5a0056] font-display font-black text-xl sm:text-2xl uppercase border-4 border-black rounded-full py-4 px-8 shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#26fedc] hover:-translate-y-1 hover:-translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#000] transition-all w-full sm:w-auto self-end flex items-center justify-center gap-2"
                >
                  <span>GỬI LỜI CHÚC</span>
                  <Send className="w-6 h-6" fill="currentColor" />
                </button>
              </form>
            </div>
          </section>

          {/* Guestbook Feed */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 mt-16 sm:mt-24">
            {wishes.map((wish) => {
              const theme = CARD_THEMES[wish.themeIndex % CARD_THEMES.length];
              const Icon = theme.icon;
              
              return (
                <div key={wish.id} className={`${theme.bg} backdrop-blur-xl border-4 ${theme.border} p-6 sm:p-8 rounded-2xl transform ${wish.rotate} ${theme.shadow} hover:scale-105 transition-transform duration-300 relative group flex flex-col gap-4 min-h-[250px]`}>
                  
                  {wish.isVip && (
                    <div className="absolute -top-4 -right-4 bg-[#fde400] text-[#504700] border-4 border-black px-4 py-1 rounded-full font-bold text-sm transform rotate-12 z-20">
                      VIP
                    </div>
                  )}

                  <div className={`${caveat.className} text-3xl sm:text-[34px] leading-[1.2] text-[#f3dcea] flex-grow mt-2`}>
                    "{wish.text}"
                  </div>
                  
                  <div className="border-t-4 border-white/30 pt-4 flex justify-between items-end mt-4">
                    <div>
                      <div className={`font-display font-black text-xl sm:text-2xl ${theme.text}`}>{wish.name}</div>
                      <div className="font-bold text-xs text-[#dbbed2] uppercase tracking-widest mt-1">{wish.relation}</div>
                    </div>
                    <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${theme.text} group-hover:scale-125 transition-transform`} fill="currentColor" />
                  </div>
                </div>
              );
            })}
          </section>

        </VipProtectedRoute>
      </main>

      <Footer />
    </div>
  );
}
