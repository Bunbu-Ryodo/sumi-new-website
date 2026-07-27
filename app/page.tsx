"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const ITEMS = ["/feed2.jpeg", "/feed3.jpeg", "/feed4.jpeg"];
const DISCUSSION_CARD_COUNT = 3;

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const listViewportRef = useRef<HTMLDivElement>(null);
  const discussionSectionRef = useRef<HTMLDivElement>(null);
  const discussionCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const discussionCardShellRefs = useRef<Array<HTMLDivElement | null>>([]);
  const discussionBuzzedRef = useRef<boolean[]>(
    Array.from({ length: DISCUSSION_CARD_COUNT }, () => false),
  );

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

      const discussionSection = discussionSectionRef.current;
      if (!discussionSection) return;

      const { top: discussionTop, height: discussionHeight } =
        discussionSection.getBoundingClientRect();
      const discussionScrollable = discussionHeight - window.innerHeight;
      if (discussionScrollable <= 0) return;

      const discussionProgress = Math.max(
        0,
        Math.min(1, -discussionTop / discussionScrollable),
      );

      discussionCardRefs.current.forEach((card, index) => {
        if (!card) return;

        const localProgress = Math.max(
          0,
          Math.min(1, discussionProgress * DISCUSSION_CARD_COUNT - index),
        );
        const eased = localProgress * localProgress * (3 - 2 * localProgress);
        const y = (1 - eased) * 60;

        card.style.opacity = String(eased);
        card.style.transform = `translateY(${y}px)`;

        const shell = discussionCardShellRefs.current[index];
        if (!shell) return;

        if (eased >= 0.995 && !discussionBuzzedRef.current[index]) {
          discussionBuzzedRef.current[index] = true;
          shell.classList.remove("card-buzz");
          // Force restart so each reveal can replay the buzz animation.
          void shell.offsetWidth;
          shell.classList.add("card-buzz");
        }

        if (eased < 0.98 && discussionBuzzedRef.current[index]) {
          discussionBuzzedRef.current[index] = false;
          shell.classList.remove("card-buzz");
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {/* Parallax section — tall enough that one full-screen scroll = one item */}
      <div ref={sectionRef} style={{ height: `calc(100vh * ${ITEMS.length})` }}>
        <div className="sticky top-0 h-screen flex flex-col md:flex-row w-full bg-primary overflow-hidden">
          {/* Left column — stays fixed while items scroll */}
          <div className="flex flex-col justify-center items-center text-center md:items-start md:text-left w-full md:w-1/2 h-1/3 md:h-full p-8 md:p-8">
            <p className="font-eb-garamond text-6xl md:text-8xl mb-12">Sumi</p>
            <p className="font-eb-garamond text-2xl md:text-3xl">
              Your new feed, flooded with the Great Books
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

      <div
        ref={discussionSectionRef}
        style={{ height: `calc(100vh * ${DISCUSSION_CARD_COUNT + 1})` }}
      >
        <div className="discussion-sticky sticky top-0 h-screen bg-secondary flex w-full items-center justify-center p-8 overflow-hidden">
          <div className="w-full max-w-7xl flex flex-col items-center">
            <p className="discussion-heading font-eb-garamond mb-8 text-4xl md:text-6xl text-center text-primary">
              How many novels worth of inane and vacuous text have you
              doom-scrolled this week?
            </p>

            <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-8">
              <div
                ref={(el) => {
                  discussionCardRefs.current[0] = el;
                }}
                className="w-full max-w-md mb-4 will-change-transform"
                style={{ opacity: 0, transform: "translateY(60px)" }}
              >
                <div
                  ref={(el) => {
                    discussionCardShellRefs.current[0] = el;
                  }}
                  className="discussion-card-shell flex flex-col bg-primary rounded h-auto"
                >
                  <div className="flex flex-row items-center">
                    <div className="h-12 w-12 bg-secondary rounded-full m-4" />
                    <p className="font-be-vietnam-pro mr-4">Shouty Person</p>
                    <p className="font-be-vietnam-pro mr-4">@Shouty</p>
                    <p className="font-be-vietnam-pro">1h</p>
                  </div>
                  <p className="font-be-vietnam-pro m-4">
                    It was the best of times... it was the blurst of times!? You
                    stupid monkey! The quick brown fox jumps lazily over the dog
                    after lorem ipsum dolor sit amet Caecilius est pater Metella
                    est mater Cereberus est canis. Everyone has the right to
                    remain silent! What you say will be used against you because
                    Santa Claus is coming to town.
                  </p>
                </div>
              </div>

              <div
                ref={(el) => {
                  discussionCardRefs.current[1] = el;
                }}
                className="w-full max-w-md mb-4 will-change-transform"
                style={{ opacity: 0, transform: "translateY(60px)" }}
              >
                <div
                  ref={(el) => {
                    discussionCardShellRefs.current[1] = el;
                  }}
                  className="discussion-card-shell flex flex-col bg-secondary border border-primary rounded h-auto"
                >
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center">
                      <div className="h-8 w-8 bg-primary rounded-full m-4" />
                      <p className="font-be-vietnam-pro mr-4 text-primary">
                        shouty1337
                      </p>
                      <p className="font-be-vietnam-pro text-primary">29m</p>
                    </div>
                    <p className="font-be-vietnam-pro ml-12 text-primary">
                      Have at you sir!
                    </p>
                    <p className="font-be-vietnam-pro ml-12 text-error">-300</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center">
                      <div className="h-8 w-8 bg-primary rounded-full m-4" />
                      <p className="font-be-vietnam-pro mr-4 text-primary">
                        Knave
                      </p>
                      <p className="font-be-vietnam-pro text-primary">15m</p>
                    </div>
                    <p className="font-be-vietnam-pro ml-12 text-primary">
                      Avaunt! Blackguard! I say, avaunt!
                    </p>
                    <p className="font-be-vietnam-pro ml-12 text-error">-25</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center">
                      <div className="h-8 w-8 bg-primary rounded-full m-4" />
                      <p className="font-be-vietnam-pro mr-4 text-primary">
                        Pistol
                      </p>
                      <p className="font-be-vietnam-pro text-primary">2m</p>
                    </div>
                    <p className="font-be-vietnam-pro ml-12 text-primary">
                      A fig for thee, then!
                    </p>
                    <p className="font-be-vietnam-pro ml-12 text-error">-49</p>
                  </div>
                </div>
              </div>

              <div
                ref={(el) => {
                  discussionCardRefs.current[2] = el;
                }}
                className="w-full max-w-md will-change-transform"
                style={{ opacity: 0, transform: "translateY(60px)" }}
              >
                <div
                  ref={(el) => {
                    discussionCardShellRefs.current[2] = el;
                  }}
                  className="discussion-card-shell flex flex-col justify-center items-center bg-primary rounded h-96 p-8"
                >
                  <p className="font-be-vietnam-pro text-primary text-2xl text-secondary text-center">
                    Curtains for Zoosha!? K-dog and batboy jestermaxxing, caught
                    flipping a grunt, in police custody.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
