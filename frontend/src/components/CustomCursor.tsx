"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let raf: number;
    let rx = -100, ry = -100;
    let tx = -100, ty = -100;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px)`;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      rx = lerp(rx, tx, 0.1);
      ry = lerp(ry, ty, 0.1);
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Dot — electric blue */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div
          className="h-1 w-1 rounded-full bg-[#4A9EFF]"
          style={{ boxShadow: "0 0 6px rgba(74, 158, 255, 0.9)" }}
        />
      </div>

      {/* Precision crosshair ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="relative flex h-9 w-9 items-center justify-center">
          {/* Horizontal arms */}
          <div className="absolute left-0 top-1/2 h-px w-2.5 -translate-y-1/2 bg-[#C8D8F0]/30" />
          <div className="absolute right-0 top-1/2 h-px w-2.5 -translate-y-1/2 bg-[#C8D8F0]/30" />
          {/* Vertical arms */}
          <div className="absolute top-0 left-1/2 h-2.5 w-px -translate-x-1/2 bg-[#C8D8F0]/30" />
          <div className="absolute bottom-0 left-1/2 h-2.5 w-px -translate-x-1/2 bg-[#C8D8F0]/30" />
          {/* Center gap ring */}
          <div
            className="h-3.5 w-3.5 rounded-full border border-[#4A9EFF]/20"
          />
        </div>
      </div>
    </>
  );
}
