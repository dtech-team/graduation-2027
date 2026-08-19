import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#160a14] w-full relative overflow-hidden border-t-8 border-dashed border-secondary-fixed shadow-[0px_-8px_0px_0px_#00f2d1] flex flex-col items-center py-10 px-4 sm:px-6 md:px-12 mt-20 z-40">
      {/* Background Watermark */}
      <div className="font-display text-5xl sm:text-7xl md:text-9xl opacity-10 text-white font-black tracking-tighter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full text-center whitespace-nowrap select-none">
        GRADUATION CHAOS
      </div>

      {/* Nav Links */}
      {/* <nav className="flex gap-6 sm:gap-8 z-10 flex-wrap justify-center font-display font-black text-xs sm:text-sm uppercase tracking-widest text-on-surface-variant">
        <Link className="hover:text-primary hover:bg-primary hover:text-on-primary px-3 py-1 rounded transition-all active:rotate-3 active:scale-105" href="#">Privacy</Link>
        <Link className="hover:text-primary hover:bg-primary hover:text-on-primary px-3 py-1 rounded transition-all active:rotate-3 active:scale-105" href="#">Terms</Link>
        <Link className="hover:text-primary hover:bg-primary hover:text-on-primary px-3 py-1 rounded transition-all active:rotate-3 active:scale-105" href="#">Support</Link>
        <Link className="hover:text-primary hover:bg-primary hover:text-on-primary px-3 py-1 rounded transition-all active:rotate-3 active:scale-105" href="#">Contact</Link>
      </nav> */}

      {/* Contact */}


      {/* Information */}
      <div className="z-10 text-sky-500 font-display font-bold text-xs sm:text-sm tracking-wider mt-4 text-center">
        <p> A product of DTECH TEAM. <Link href="https://maps.app.goo.gl/a87GBZkeDN6v3HLF7" target="_blank" className="underline font-bold">Xem bản đồ</Link></p>
      </div>

      {/* Copyright */}
      <div className="z-10 text-tertiary-fixed font-display font-bold text-xs sm:text-sm uppercase tracking-wider mt-3 text-center">
        © 2027 DUNG'S GRADUATION. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}
