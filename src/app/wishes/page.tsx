"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VipProtectedRoute } from "@/components/VipProtectedRoute";
import { useState, useEffect } from "react";
import { VipUserItem } from "@/app/api/auth/vip/route";
import { Send, Star, Heart, Flame, Award, Sparkles } from "lucide-react";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin", "vietnamese"], weight: "700" });

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
          <section className="flex flex-col items-center justify-center text-center relative z-10 mt-10">
            <div className="relative w-full max-w-4xl flex justify-center">
              <h1 
                className="font-display font-black text-5xl sm:text-[100px] sm:leading-[100px] text-transparent bg-clip-text bg-gradient-to-r from-[#ffabee] via-[#26fedc] to-[#fde400] uppercase -rotate-2 transform hover:rotate-0 transition-transform duration-300 border-[6px] sm:border-8 border-[#1c0f19] p-4 sm:p-6 rounded-2xl backdrop-blur-md bg-[#291b26]/50 shadow-[8px_8px_0px_0px_#ab00a3,16px_16px_0px_0px_#00dfc1]"
                style={{ WebkitTextStroke: "2px transparent" }}
              >
                SỔ LỜI CHÚC<br/>TỐT NGHIỆP
              </h1>
              <div className="absolute -top-12 -right-4 sm:-right-12 text-[#fde400] animate-[spin_10s_linear_infinite] opacity-80 mix-blend-screen pointer-events-none">
                <Sparkles className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-6 mt-8 sm:mt-12 z-20">
              <p className="font-display font-bold text-lg sm:text-3xl text-[#26fedc] bg-[#3f303b] p-4 sm:p-6 rounded-xl border-4 border-[#26fedc] max-w-2xl transform rotate-2 shadow-[8px_8px_0px_0px_#5a0056]">
                Hãy để lại những lời chúc thân thương cho Dũng nhé! <span className="text-sm text-gray-500">(có thể không thân lắm mà đại đại i)</span>
              </p>
              
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
