"use client";
import { useEffect, useRef, useState } from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  animationClass: string; // ví dụ: "animate__fadeInUp" hoặc "animate__bounceIn"
}

export function ScrollAnimate({ children, animationClass, className = "", ...props }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          if (ref.current) {
             observer.unobserve(ref.current);
          }
        }
      },
      { threshold: 0.1 } // Kích hoạt khi phần tử hiển thị 10% trên màn hình
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div 
      ref={ref} 
      className={`${className} ${hasAnimated ? `animate__animated ${animationClass}` : 'opacity-0'}`}
      {...props}
    >
      {children}
    </div>
  );
}
