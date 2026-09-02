"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VipProtectedRoute } from "@/components/VipProtectedRoute";
import { ScrollAnimate } from "@/components/ScrollAnimate";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VipUserItem } from "@/app/api/auth/vip/route";
import { Send, Star, Heart, Flame, Award, Sparkles, Loader2, Image as ImageIcon, Ghost } from "lucide-react";
import { Caveat } from "next/font/google";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

const caveat = Caveat({ subsets: ["latin", "latin-ext"], weight: "700" });

const CARD_THEMES = [
  { bg: "bg-[#ffabee]/20", border: "border-white", shadow: "shadow-[8px_8px_0px_0px_#ff3af2]", text: "text-[#ffabee]", icon: "/icons/love1.png" },
  { bg: "bg-[#26fedc]/20", border: "border-white", shadow: "shadow-[8px_8px_0px_0px_#00dfc1]", text: "text-[#26fedc]", icon: "/icons/fire.png" },
  { bg: "bg-[#fde400]/20", border: "border-white", shadow: "shadow-[8px_8px_0px_0px_#dec800]", text: "text-[#fde400]", icon: "/icons/gift.png" },
  { bg: "bg-[#ab00a3]/20", border: "border-white", shadow: "shadow-[8px_8px_0px_0px_#ffabee]", text: "text-[#ffabee]", icon: "/icons/star1.png" },
];

export default function WishesPage() {
  const [vipUser, setVipUser] = useState<VipUserItem | null>(null);

  const [wishes, setWishes] = useState<any[]>([]);
  const [newWish, setNewWish] = useState("");
  const [relation, setRelation] = useState("Bạn bè");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean, message: string, type: "success" | "error" | "rejected" }>({ isOpen: false, message: "", type: "success" });

  const [isUploading, setIsUploading] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const [isLoadingWishes, setIsLoadingWishes] = useState(true);

  const wishesRef = useRef(wishes);
  useEffect(() => {
    wishesRef.current = wishes;
  }, [wishes]);

  useEffect(() => {
    const saved = localStorage.getItem("vip_auth_user");
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setVipUser(user);
      } catch (e) { }
    }
    setIsAuthLoaded(true);
  }, []);

  const fetchWishes = async (user: VipUserItem | null) => {
    try {
      const url = user ? `/api/wishes?userId=${user.id}` : "/api/wishes";
      const timestamp = new Date().getTime();
      const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setWishes(data.data);
      }
    } catch (e) { 
      console.error(e);
    } finally {
      setIsLoadingWishes(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoaded) return;

    fetchWishes(vipUser);

    if (vipUser?.claimedGuestName) {
      fetch(`/api/rsvp?name=${encodeURIComponent(vipUser.claimedGuestName)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.guest?.relationship) {
            setRelation(data.guest.relationship);
          }
        })
        .catch(console.error);
    }

    // Lắng nghe realtime từ bảng wishes_gallery
    const channel = supabase
      .channel('public:wishes_gallery')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes_gallery' }, (payload) => {
        // Tự động nhảy popup lêu lêu nếu lời chúc của user bị từ chối
        if (payload.eventType === 'UPDATE' && payload.new && payload.new.status === 'rejected') {
          // Lấy danh sách hiện tại từ ref để tra cứu người gửi của lời chúc này
          const affectedWish = wishesRef.current.find(w => w.id === payload.new.id);
          if (affectedWish && affectedWish.vip_user_id === vipUser?.id) {
            setModal({
              isOpen: true,
              type: 'rejected',
              message: 'Lời chúc nào wow hơn tí đi! 😝'
            });
          }
        }

        // Có bất kỳ thay đổi nào (thêm mới, duyệt, sửa, xoá), fetch lại
        fetchWishes(vipUser);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vipUser, isAuthLoaded]);

  const userWishesCount = wishes.filter(w => w.vip_user_id === vipUser?.id).length;
  const isLimitReached = userWishesCount >= 4;

  const handleSendWish = async () => {
    if (!newWish.trim() || !vipUser || isLimitReached) return;

    setIsUploading(true);
    setIsFlying(true);
    
    // Cuộn màn hình từ từ xuống khu vực hiển thị lời chúc (cách đỉnh một chút để không bị lố)
    setTimeout(() => {
      const feed = document.getElementById("wishes-feed");
      if (feed) {
        const y = feed.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);

    try {
      // 2. Lưu lời chúc vào database
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vipUserId: vipUser.id,
          message: newWish,
          imageUrl: null,
          visibility: isAnonymous ? "anonymous" : "public"
        })
      });
      const data = await res.json();

      if (data.success) {
        // Chờ chim bay tới đích (1.5s)
        setTimeout(() => {
          setIsFlying(false); // Ẩn chim
          
          // Nổ pháo hoa ăn mừng
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ff3af2', '#26fedc', '#fde400']
          });

          // Làm mới feed để hiển thị card mới
          fetchWishes(vipUser);
          
          // Chờ 2s để user ngắm pháo hoa và xem thẻ rồi mới hiện modal
          setTimeout(() => {
            setModal({ isOpen: true, message: data.message, type: "success" });
            setNewWish("");
            setIsAnonymous(false);
            setIsUploading(false);
          }, 2000);
        }, 1500);
      } else {
        setIsFlying(false);
        setModal({ isOpen: true, message: "Lỗi: " + data.error, type: "error" });
        setIsUploading(false);
      }
    } catch (e: any) {
      setIsFlying(false);
      setModal({ isOpen: true, message: "Lỗi gửi lời chúc: " + e.message, type: "error" });
      setIsUploading(false);
    }
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
                <div className="absolute -top-10 sm:-top-16 z-20 transform -rotate-6 animate-float animate__animated animate__tada animate__slow">
                  <span
                    className={`${caveat.className} pr-4 text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-[#d946ef] group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300 inline-block`}
                    style={{ filter: "drop-shadow(2px 2px 0px #000) drop-shadow(0px 0px 10px rgba(217,70,239,0.8))" }}
                  >
                    Congrats Dũng!
                  </span>
                </div>

                {/* Main 3D Title Box */}
                <div className="relative bg-[#0a0014] border-[6px] sm:border-[10px] border-black py-8 px-10 sm:py-16 sm:px-24 rounded-[30px] sm:rounded-[50px] shadow-[8px_8px_0px_0px_#06b6d4,16px_16px_0px_0px_#d946ef] transform -rotate-2 group-hover:rotate-0 group-hover:-translate-y-2 transition-all duration-300 animate__animated animate__flipInX animate__slow">
                  {/* Inner glowing stroke (Cyberpunk feel) */}
                  <div className="absolute inset-3 sm:inset-5 border-2 sm:border-4 border-[#06b6d4] rounded-[20px] sm:rounded-[38px] opacity-80 pointer-events-none shadow-[inset_0_0_20px_rgba(6,182,212,0.5)]"></div>

                  <h1
                    className="relative font-display font-black text-5xl sm:text-[70px] md:text-[100px] leading-[1.1] text-white uppercase tracking-tight z-10 "
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
                    SỔ LỜI CHÚC<br />
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

                <div className="absolute -bottom-8 right-0 sm:-bottom-12 sm:right-0 bg-gradient-to-r from-[#eab308] to-[#d97706] text-black font-black text-xs sm:text-sm px-5 py-2.5 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_#000] transform -rotate-12 group-hover:-rotate-16 group-hover:scale-110 group-hover:-translate-y-2 transition-all cursor-pointer z-30 animate__animated animate__rotateInDownLeft animate__slow">
                  #MEMORIES ✨
                </div>
              </div>
            </div>

            {/* Khung Hướng Dẫn & Gửi Lời Chúc */}
            <div className="flex flex-col items-center gap-6 mt-16 sm:mt-16 z-20 animate__animated animate__zoomInUp animate__slow">
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
          <ScrollAnimate id="wish-form" animationClass="animate__zoomIn" className="grid md:grid-cols-12 gap-4 relative z-20 mt-12 sm:mt-16">
            <div className="md:col-span-10 md:col-start-2 bg-[#342630]/90 backdrop-blur-xl rounded-2xl p-5 sm:p-8 border-8 border-[#fde400] shadow-[12px_12px_0px_0px_#ab00a3] sm:shadow-[16px_16px_0px_0px_#ab00a3] relative">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-xl"
                style={{ backgroundImage: "radial-gradient(#554050 2px, transparent 2px)", backgroundSize: "20px 20px" }}
              ></div>

              <h2 className="font-display font-black text-2xl sm:text-4xl text-[#fde400] uppercase mb-4 border-b-4 border-[#fde400] pb-2 inline-block relative z-10">
                Gửi Gắm Yêu Thương 🤮
              </h2>


              <form className="flex flex-col gap-4 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-sm text-[#ffabee] uppercase tracking-widest">Tên cúng cơm</label>
                    <input
                      readOnly
                      value={vipUser?.googleName || ""}
                      className="bg-[#241721] border-4 border-[#26fedc] text-[#f3dcea] font-medium text-lg px-4 py-3 rounded-xl outline-none opacity-80 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-sm text-[#ffabee] uppercase tracking-widest">Cách thức dây dưa</label>
                    <input
                      readOnly
                      value={relation}
                      className="bg-[#241721] border-4 border-[#26fedc] text-[#f3dcea] font-medium text-lg px-4 py-3 rounded-xl outline-none opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 relative">
                  <label className="font-bold text-sm text-[#ffabee] uppercase tracking-widest flex justify-between items-center">
                    <span>Vài lời điêu trên đầu môi</span>
                    <span className={`${isLimitReached ? 'text-red-400' : 'text-[#26fedc]'}`}>
                      ({userWishesCount}/4)
                    </span>
                  </label>
                  <textarea
                    value={newWish}
                    onChange={(e) => setNewWish(e.target.value)}
                    disabled={isLimitReached}
                    placeholder={isLimitReached ? "Bạn đã gửi đủ 4 lời chúc rồi!" : "Viết vài lời điêu trên đầu môi..."}
                    className={`${caveat.className} bg-[#241721] border-4 ${isLimitReached ? 'border-red-500/50 opacity-50 cursor-not-allowed' : 'border-[#26fedc] focus:border-[#ffabee] focus:ring-4 focus:ring-[#ffabee]/50'} text-[#f3dcea] text-2xl sm:text-3xl leading-tight p-4 rounded-xl outline-none transition-all placeholder:text-[#dbbed2]/50 placeholder:font-display placeholder:text-lg`}
                    rows={3}
                  ></textarea>
                </div>

                <span className="text-[#ffabee] font-bold text-sm">Lưu ý: Viết lẹ BỐN lời chúc LIỀN cho tôi!</span>

                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 accent-[#ff3af2] cursor-pointer"
                  />
                  <label htmlFor="anonymous" className="text-[#f3dcea] cursor-pointer text-sm font-medium">
                    Gửi ẩn danh (Hiển thị vs tên "Ẩn Danh")
                  </label>
                </div>

                <div className="relative w-full sm:w-auto self-end mt-2">
                  <button
                    type="button"
                    onClick={handleSendWish}
                    disabled={!newWish.trim() || isUploading || isLimitReached}
                    className="cursor-pointer bg-gradient-to-r from-[#ff3af2] to-[#ab00a3] text-[#5a0056] font-display font-black text-xl sm:text-2xl uppercase border-4 border-black rounded-full py-3 px-8 shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#26fedc] hover:-translate-y-1 hover:-translate-x-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <span>ĐANG TẢI LÊN...</span>
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" fill="currentColor" />
                        <span>BẮN ĐI</span>
                      </>
                    )}
                  </button>

                  {/* Hiệu ứng chim bay thả thư */}
                  <AnimatePresence>
                    {isFlying && (
                      <motion.div
                        initial={{ opacity: 1, scale: 0.5, rotate: -45, x: 0, y: 0 }}
                        animate={{ 
                          x: [0, 100, -50, 0], // Lượn hình zic zac nhẹ
                          y: [0, 100, 200, 300], // Bay thẳng xuống phần feed bên dưới
                          scale: [0.5, 2, 1.5, 0], // Phóng to ra rồi thu nhỏ biến mất
                          rotate: [-45, 0, 45, 90]
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none drop-shadow-2xl"
                      >
                        <span className="text-[100px] filter drop-shadow-[0_0_10px_#fff]">🕊️</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </div>
          </ScrollAnimate>

          {/* Guestbook Feed */}
          <section id="wishes-feed" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 mt-16 sm:mt-24 mx-6 min-h-[300px]">
            {isLoadingWishes ? (
              // Skeleton Loading
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-[#342630]/50 backdrop-blur-xl border-4 border-gray-600 rounded-2xl p-6 sm:p-8 relative flex flex-col gap-4 min-h-[250px] animate-pulse">
                  <div className="w-full h-8 bg-gray-500/30 rounded-md mb-2"></div>
                  <div className="w-3/4 h-8 bg-gray-500/30 rounded-md"></div>
                  <div className="flex-grow"></div>
                  <div className="border-t-4 border-white/10 pt-4 flex justify-between items-end mt-4">
                    <div className="flex flex-col gap-2 w-1/2">
                      <div className="w-full h-6 bg-gray-500/30 rounded-md"></div>
                      <div className="w-1/2 h-4 bg-gray-500/30 rounded-md"></div>
                    </div>
                    <div className="w-10 h-10 bg-gray-500/30 rounded-full"></div>
                  </div>
                </div>
              ))
            ) : wishes.length === 0 ? (
              <div className="col-span-full text-center text-[#dbbed2] font-display text-2xl mt-12 opacity-50">
                Chưa có lời chúc nào... Hãy là người bắn phát súng đầu tiên!
              </div>
            ) : wishes.map((wish, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              const Icon = theme.icon;
              const rotate = ["rotate-1", "rotate-2", "-rotate-1", "-rotate-2", "-rotate-3"][index % 5];

              return (
                <ScrollAnimate key={wish.id} animationClass="animate__flash" className={`${theme.bg} backdrop-blur-xl border-4 ${theme.border} ${theme.shadow} border-black rounded-2xl p-6 sm:p-8 transform ${rotate} hover:scale-105 transition-transform duration-300 relative group flex flex-col gap-4 min-h-[250px]`}>

                  {/* Status Badges */}
                  <div className="absolute -top-4 -left-4 flex flex-col gap-2 z-20">
                    {wish.visibility === 'vip_only' && (
                      <div className="bg-[#ab00a3] text-white border-4 border-black px-4 py-1 rounded-full font-bold text-xs transform -rotate-12 shadow-[4px_4px_0px_0px_#000]">
                        VIP ONLY
                      </div>
                    )}
                    {wish.visibility === 'private' && (
                      <div className="bg-gray-600 text-white border-4 border-black px-4 py-1 rounded-full font-bold text-xs transform -rotate-12 shadow-[4px_4px_0px_0px_#000]">
                        PRIVATE
                      </div>
                    )}
                  </div>

                  {wish.status === 'pending' && (
                    <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-yellow-400 text-black border-4 border-black px-4 py-1 rounded-full font-bold text-xs z-20 shadow-[4px_4px_0px_0px_#000] whitespace-nowrap">
                      ĐANG CHỜ DUYỆT
                    </div>
                  )}

                  {wish.status === 'rejected' && (
                    <div
                      onClick={() => setModal({
                        isOpen: true,
                        type: 'rejected',
                        message: 'Lời chúc nào wow hơn tí đi!'
                      })}
                      className="absolute -top-4 right-1/2 translate-x-1/2 bg-red-600 text-white border-4 border-black px-4 py-1 rounded-full font-bold text-xs z-20 shadow-[4px_4px_0px_0px_#000] whitespace-nowrap cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                    >
                      BỊ TỪ CHỐI
                    </div>
                  )}

                  {/* Lời chúc */}
                  {wish.message && (
                    <div className={`${caveat.className} ${
                      wish.message.length > 150 ? 'text-xl sm:text-2xl' : 
                      wish.message.length > 80 ? 'text-2xl sm:text-[28px]' : 
                      wish.message.length < 30 ? 'text-4xl sm:text-[42px] text-center' : 
                      'text-3xl sm:text-[34px]'
                    } leading-[1.3] text-[#f3dcea] flex-grow mt-2 flex flex-col justify-center whitespace-pre-wrap break-words`}>
                      "{wish.message}"
                    </div>
                  )}

                  {/* Footer Tác giả */}
                  <div className={`border-t-4 border-white/30 pt-4 flex justify-between items-end mt-4`}>
                    <div>
                      <div className={`font-display font-black text-xl sm:text-2xl ${theme.text}`}>{wish.vip_users?.google_name}</div>
                      <div className={`font-bold text-xs uppercase tracking-widest mt-1 text-[#dbbed2]`}>{wish.vip_users?.claimed_guest_name || 'VIP'}</div>
                    </div>
                    {typeof Icon === 'string' ? (
                      <img src={Icon} alt="icon" className={`w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-125 transition-transform object-contain`} />
                    ) : (
                      <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${theme.text} group-hover:scale-125 transition-transform`} fill="currentColor" />
                    )}
                  </div>
                </ScrollAnimate>
              );
            })}
          </section>

        </VipProtectedRoute>
      </main>

      <Footer />

      {/* Modal Thông Báo */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with intense blur and slight color tint */}
          <div className={`absolute inset-0 backdrop-blur-md transition-opacity ${modal.type === 'success' ? 'bg-[#26fedc]/10' : 'bg-[#ab00a3]/20'}`} onClick={() => setModal({ ...modal, isOpen: false })}></div>

          {/* Main Modal Box - Cyberpunk / Brutalist */}
          <div className={`relative bg-[#0a0014] border-[6px] sm:border-[8px] animate__animated animate__bounceIn ${modal.type === 'success' ? 'border-[#26fedc] shadow-[12px_12px_0px_0px_#fde400,24px_24px_0px_0px_#26fedc]' : 'border-[#ff3af2] shadow-[12px_12px_0px_0px_#fde400,24px_24px_0px_0px_#ab00a3]'} px-8 py-12 sm:px-12 sm:py-16 rounded-[40px] max-w-lg w-full flex flex-col items-center text-center animate-in zoom-in-90 fade-in-0 duration-300 transform -rotate-1`}>

            {/* Decorative background grid */}
            <div className="absolute inset-0 rounded-[32px] opacity-20 pointer-events-none overflow-hidden">
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 2px)", backgroundSize: "30px 30px" }}></div>
            </div>

            {/* Icon Circle */}
            <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center mb-2 border-[6px] border-black shadow-[inset_0_0_20px_rgba(0,0,0,0.5),8px_8px_0px_0px_#000] z-10`}>
              {modal.type === 'success' ?  <Image src="/icons/wish.png" alt="icon" width={150} height={150} /> : <Image src="/icons/haha1.png" alt="icon" width={150} height={150} />}
            </div>

            {/* Title */}
            <h3 className={`relative z-10 font-display font-black text-3xl sm:text-5xl uppercase mb-6 tracking-tight ${modal.type === 'success' ? 'text-[#26fedc]' : 'text-[#ff3af2]'}`} style={{ textShadow: "4px 4px 0px #000" }}>
              {modal.type === 'success' ? 'Tuyệt Vời!' : modal.type === 'rejected' ? 'LÊU LÊU!' : 'Có Lỗi Xảy Ra!'}
            </h3>

            {/* Message Box */}
            <div className="relative z-10 bg-black/50 border-4 border-[#ffabee]/30 rounded-2xl p-6 mb-10 w-full backdrop-blur-sm">
              <p className="text-[#f3dcea] text-xl sm:text-2xl font-bold leading-snug">
                {modal.message}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setModal({ ...modal, isOpen: false })}
              className={`cursor-pointer relative z-10 font-display font-black text-2xl sm:text-3xl uppercase px-12 py-4 rounded-full border-[6px] border-black transition-all hover:scale-110 active:scale-95 ${modal.type === 'success' ? 'bg-[#26fedc] text-black shadow-[6px_6px_0px_0px_#ab00a3] hover:shadow-[10px_10px_0px_0px_#ab00a3]' : 'bg-[#ff3af2] text-black shadow-[6px_6px_0px_0px_#fde400] hover:shadow-[10px_10px_0px_0px_#fde400]'}`}
            >
              {modal.type === 'rejected' ? 'Được thôi!' : 'OK, ĐÃ HIỂU!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
