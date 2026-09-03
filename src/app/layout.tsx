import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import 'animate.css';
import GlobalEffects from "@/components/GlobalEffects";

const displayFont = Montserrat({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["700", "900"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "DUNG GRAD'27",
  description: "Chia sẽ những khoảnh khắc và lời chúc thân thương để tô màu cho bức tranh thanh xuân của Dũng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${displayFont.variable} ${bodyFont.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lavishly+Yours&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface text-on-surface font-body antialiased overflow-x-hidden flex flex-col selection:bg-primary selection:text-on-primary">
        {/* Global Effects (conditionally rendered) */}
        <GlobalEffects />

        {/* Pattern Background Layer */}
        <div className="fixed inset-0 pattern-dots opacity-20 pointer-events-none z-[-2]"></div>
        
        {/* Abstract Gradient Blobs Background */}
        <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary opacity-20 blur-[100px] pointer-events-none z-[-1]"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-tertiary opacity-20 blur-[120px] pointer-events-none z-[-1]"></div>

        {children}
      </body>
    </html>
  );
}
