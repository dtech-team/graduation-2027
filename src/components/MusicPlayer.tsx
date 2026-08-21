"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MusicPlayerProps {
  audioSrc?: string;
}

export default function MusicPlayer({
  audioSrc = "/audio/bg-music.mp3",
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isManuallyPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fallback demo track online (nếu chưa có file local trong /public/audio/)
  const DEMO_FALLBACK_URL = "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.loop = true;

    // Cố gắng tự động phát ngay khi render
    const attemptPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        // Trình duyệt chặn autoplay -> đợi tương tác
        setIsPlaying(false);
      }
    };

    attemptPlay();

    // Lắng nghe tương tác đầu tiên của người dùng trên toàn trang
    const handleFirstUserInteraction = (e: Event) => {
      // Nếu tương tác xuất phát từ chính widget MusicPlayer thì bỏ qua, không tự ý play đè
      const target = e.target as HTMLElement | null;
      if (containerRef.current && target && containerRef.current.contains(target)) {
        return;
      }

      // Nếu người dùng đã chủ động bấm tắt trước đó thì không tự bật lại
      if (isManuallyPausedRef.current) return;

      if (audio && audio.paused) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    window.addEventListener("click", handleFirstUserInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstUserInteraction, { once: true });
    window.addEventListener("keydown", handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstUserInteraction);
      window.removeEventListener("touchstart", handleFirstUserInteraction);
      window.removeEventListener("keydown", handleFirstUserInteraction);
    };
  }, []);

  // Cập nhật âm lượng khi state volume thay đổi
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Bật / Tắt 1 chạm dứt khoát
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      isManuallyPausedRef.current = true;
      audio.pause();
      setIsPlaying(false);
    } else {
      isManuallyPausedRef.current = false;
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.error("Audio play error:", err);
      });
    }
  };

  const handleAudioError = () => {
    const audio = audioRef.current;
    if (audio && audio.src !== DEMO_FALLBACK_URL) {
      console.log("Local audio not found, switching to demo online track...");
      audio.src = DEMO_FALLBACK_URL;
      audio.load();
      if (!isManuallyPausedRef.current) {
        audio.play().catch(() => {});
      }
    }
  };

  return (
    <>
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onError={handleAudioError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* --- FLOATING CYBER MUSIC CONTROLLER CAPSULE (GÓC DƯỚI BÊN TRÁI) --- */}
      <div 
        ref={containerRef}
        className="music-player-capsule fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2 select-none"
      >
        
        {/* Expanded Volume & Control Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-[#180924]/95 border-2 border-secondary-fixed p-3.5 rounded-2xl shadow-[6px_6px_0px_0px_#000] backdrop-blur-xl flex flex-col gap-3 w-64 text-white"
            >
              {/* Header with Title & Live LED */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎧</span>
                  <div>
                    <p className="text-[11px] font-display font-black text-secondary-fixed uppercase tracking-wider">
                      NHẠC NỀN LỄ TỐT NGHIỆP
                    </p>
                    <p className="text-[9px] text-gray-400 font-mono">
                      {isPlaying ? "● Đang phát nhạc..." : "○ Đã tạm dừng"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-400 animate-ping" : "bg-gray-600"}`}></span>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-display font-bold text-gray-300">
                  <span className="flex items-center gap-1">
                    {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-secondary-fixed" />}
                    <span>Âm lượng</span>
                  </span>
                  <span className="font-mono text-secondary-fixed">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    setVolume(newVol);
                    if (newVol > 0 && !isPlaying && audioRef.current) {
                      isManuallyPausedRef.current = false;
                      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                    }
                  }}
                  className="w-full accent-secondary-fixed bg-gray-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Action Buttons in Panel */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={togglePlay}
                  className={`py-2 px-3 rounded-xl border text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isPlaying
                      ? "bg-red-500 hover:bg-red-600 text-white border-black shadow-[2px_2px_0px_0px_#000]"
                      : "bg-secondary-fixed hover:bg-[#00d6b8] text-black border-black shadow-[2px_2px_0px_0px_#000]"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>TẮT TIẾNG</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>BẬT NHẠC</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-display font-bold uppercase transition-all cursor-pointer flex items-center justify-center"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MAIN FLOATING MUSIC PILL --- */}
        <div className="flex items-center gap-1.5 bg-[#180924]/95 border-2 border-black p-1 rounded-full shadow-[4px_4px_0px_0px_#000] backdrop-blur-md">
          
          {/* 1-Click Quick Toggle: Khi phát hiện TẮT TIẾNG (đỏ), khi tắt hiện BẬT NHẠC (xanh) */}
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-full border-2 transition-all cursor-pointer select-none ${
              isPlaying
                ? "bg-[#250f36] border-red-500/80 text-red-400 hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_#000] active:scale-95"
                : "bg-secondary-fixed border-black text-black shadow-[2px_2px_0px_0px_#000] hover:scale-105 active:scale-95"
            }`}
            title={isPlaying ? "Bấm vào để TẮT TIẾNG" : "Bấm vào để BẬT NHẠC"}
          >
            {isPlaying ? (
              /* ĐANG PHÁT -> NÚT ĐỂ TẮT TIẾNG */
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-red-400" />
                <span className="text-[11px] font-display font-black uppercase tracking-wider">
                  TẮT TIẾNG
                </span>
                {/* Waveform mini */}
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-red-400 rounded-full animate-pulse h-3"></span>
                  <span className="w-1 bg-red-400 rounded-full animate-pulse h-1.5" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1 bg-red-400 rounded-full animate-pulse h-2.5" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            ) : (
              /* ĐANG TẮT -> NÚT ĐỂ BẬT NHẠC */
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-black animate-pulse" />
                <span className="text-[11px] font-display font-black uppercase tracking-wider text-black">
                  BẬT NHẠC
                </span>
              </div>
            )}
          </button>

          {/* Quick Settings / Expand Trigger */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-secondary-fixed transition-colors cursor-pointer"
            title="Tùy chỉnh âm lượng & chi tiết"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4 text-secondary-fixed" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </>
  );
}
