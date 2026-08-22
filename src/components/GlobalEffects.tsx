"use client";

import { usePathname } from "next/navigation";
import AmbientAtmosphere from "./AmbientAtmosphere";
import MusicPlayer from "./MusicPlayer";

export default function GlobalEffects() {
  const pathname = usePathname();
  
  // Disable effects on admin page
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <AmbientAtmosphere />
      <MusicPlayer />
    </>
  );
}
