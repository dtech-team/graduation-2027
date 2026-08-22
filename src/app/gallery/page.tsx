"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VipProtectedRoute } from "@/components/VipProtectedRoute";
import { Camera, Upload } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function GalleryPage() {
  const [images] = useState([
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    "https://images.unsplash.com/photo-1525926477800-7a3babfbdb65?w=800&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80"
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0410]">
      <Header />
      
      <main className="flex-grow pt-10 pb-20 px-4 sm:px-6 z-10 relative">
        <VipProtectedRoute title="Thư Viện Ảnh">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-black border-2 border-white shadow-[3px_3px_0px_0px_#000]">
                  <Image src="/icons/gallery.png" alt="gallery" width={35} height={35} />
                </div>
                <div>
                  <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wider">
                    Thư Viện Ảnh
                  </h1>
                  <p className="text-gray-400 text-sm">Nơi lưu giữ những khoảnh khắc tuyệt vời nhất</p>
                </div>
              </div>
              
              <button className="flex items-center gap-2 bg-gradient-to-r from-primary to-[#00d0b0] text-black px-6 py-3 rounded-full font-display font-black text-sm uppercase tracking-wider hover:scale-105 transition-transform border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <Upload className="w-5 h-5" /> Đăng ảnh mới
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-3xl overflow-hidden border-4 border-gray-800 hover:border-primary transition-all cursor-pointer group relative shadow-xl hover:shadow-[8px_8px_0px_0px_#00f2d1] hover:-translate-y-1">
                  <img src={img} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-6 transition-all duration-300">
                    <span className="text-white font-bold text-lg mb-1">Khoảnh khắc đáng nhớ</span>
                    <span className="text-primary text-xs font-bold uppercase tracking-wider">Xem chi tiết &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </VipProtectedRoute>
      </main>

      <Footer />
    </div>
  );
}
