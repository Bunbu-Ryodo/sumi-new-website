"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const ITEMS = ["/feed2.jpeg", "/feed3.jpeg", "/feed4.jpeg"];

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const listViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      const listViewport = listViewportRef.current;
      if (!section || !track || !listViewport) return;

      const { top, height } = section.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, -top / scrollable));
      const stepHeight = listViewport.clientHeight;
      const shift = progress * (ITEMS.length - 1) * stepHeight;

      track.style.transform = `translateY(-${shift}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {/* Parallax section — tall enough that one full-screen scroll = one item */}
      <div ref={sectionRef} style={{ height: `calc(100vh * ${ITEMS.length})` }}>
        <div className="sticky top-0 h-screen flex flex-col md:flex-row w-full bg-primary overflow-hidden">
          {/* Left column — stays fixed while items scroll */}
          <div className="flex flex-col justify-center items-center text-center md:items-start md:text-left w-full md:w-1/2 h-1/3 md:h-full p-8 md:p-8">
            <p className="font-eb-garamond text-6xl md:text-8xl">Sumi</p>
            <p className="font-eb-garamond text-2xl md:text-3xl">
              Your New Feed, Flooded with the Great Books
            </p>
          </div>

          {/* Right column — items are driven by scroll progress */}
          <div
            ref={listViewportRef}
            className="relative w-full md:w-1/2 h-2/3 md:h-full overflow-hidden"
          >
            <div ref={trackRef} className="flex flex-col will-change-transform">
              {ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="h-[66.666667vh] md:h-screen flex items-center justify-center"
                >
                  <div className="relative w-full h-full overflow-hidden bg-primary">
                    <Image
                      src={item}
                      alt={`Feed preview ${i + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={i === 0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
