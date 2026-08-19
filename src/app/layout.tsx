import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

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
  title: "GRAD'24 - Elegant Invitation",
  description: "Create your professional graduation invitation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${displayFont.variable} ${bodyFont.variable} dark`}>
      <body className="min-h-screen bg-surface text-on-surface font-body antialiased overflow-x-hidden flex flex-col selection:bg-primary selection:text-on-primary">
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
