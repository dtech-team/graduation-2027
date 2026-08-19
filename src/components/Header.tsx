import Link from "next/link";

export function Header() {
  return (
    <header className="bg-[#1c0f19] w-full sticky top-0 z-50 border-b-4 border-primary shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center px-4 sm:px-6 md:px-12 py-3 max-w-full">
      {/* 3D Multi-Layered Logo */}
      <Link 
        href="/" 
        className="group inline-flex items-center gap-1 font-display font-black italic uppercase tracking-wider text-xl sm:text-2xl md:text-3xl transform -skew-x-6 hover:skew-x-0 hover:scale-105 transition-all duration-300 select-none py-1"
        style={{
          textShadow: `
            2px 2px 0px #3b0764,
            4px 4px 0px #7e22ce,
            6px 6px 0px #ff3af2,
            8px 8px 0px #00f2d1
          `
        }}
      >
        {/* <span className="text-[#f43f5e] group-hover:brightness-110 transition-all">DUNG</span> */}
        <span className="text-[#00f2d1] group-hover:brightness-110 transition-all mr-2">DUNG </span>
        <span className="text-[#a3e635] group-hover:brightness-110 transition-all">GRAD'27</span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex gap-6 lg:gap-8 items-center font-display font-black text-xs sm:text-sm uppercase tracking-widest">
        <Link href="#" className="text-on-surface-variant hover:text-secondary-fixed transition-colors hover:skew-x-2">Gallery</Link>
        <Link href="#" className="text-on-surface-variant hover:text-secondary-fixed transition-colors hover:skew-x-2">Events</Link>
        <Link href="#" className="text-secondary-fixed border-b-2 border-secondary-fixed pb-0.5 hover:skew-x-2">Registry</Link>
        <Link href="#" className="text-on-surface-variant hover:text-secondary-fixed transition-colors hover:skew-x-2">RSVP</Link>
      </nav>

      {/* CTA Button */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="bg-primary text-on-primary font-display font-black text-xs px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-secondary-fixed)] active:translate-y-0 active:shadow-none transition-all uppercase tracking-widest block"
        >
          INVITE
        </Link>
        
        <button className="md:hidden text-primary p-1">
          <span className="material-symbols-outlined" style={{ fontSize: "24px", fontFamily: "'Material Symbols Outlined'" }}>menu</span>
        </button>
      </div>
    </header>
  );
}
