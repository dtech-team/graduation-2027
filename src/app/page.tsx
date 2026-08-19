import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InputForm } from "@/components/InputForm";

export default function Home() {
  return (
    <>
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center py-10 sm:py-14 px-4 sm:px-6 md:px-8 z-10 relative w-full max-w-7xl mx-auto overflow-hidden">
        {/* Floating background emojis & stars */}
        <div className="absolute top-12 left-8 sm:left-20 text-3xl sm:text-5xl opacity-40 z-10 animate-float">✦</div>
        <div className="absolute top-28 right-8 sm:right-24 text-3xl sm:text-5xl opacity-40 z-10 text-secondary-fixed animate-float-delayed">☆</div>
        <div className="absolute bottom-24 left-10 sm:left-28 text-4xl sm:text-5xl opacity-40 z-10 animate-float">🎓</div>
        <div className="absolute bottom-32 right-12 sm:right-32 text-4xl sm:text-5xl opacity-40 z-10 text-tertiary-fixed animate-float-delayed">✨</div>
        
        {/* 3D Multi-layered Hero Title */}
        <div className="text-center z-20 mb-8 sm:mb-10 select-none">
          <h1 
            className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase text-white tracking-tighter leading-tight"
            style={{
              textShadow: "2px 2px 0px #00f2d1, 4px 4px 0px #fde400, 6px 6px 0px #ff3af2, 8px 8px 0px #000"
            }}
          >
            Thư mời 
          </h1>
        </div>
        
        <InputForm />
      </main>

      <Footer />
    </>
  );
}

