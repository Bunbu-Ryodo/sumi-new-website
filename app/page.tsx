"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const ITEMS = ["/feed2.jpeg", "/feed3.jpeg", "/feed4.jpeg"];
const DISCUSSION_CARD_COUNT = 3;
const APP_USE_IMAGES = [
  "/appuse1.jpeg",
  "/appuse2.jpeg",
  "/appuse3.jpeg",
  "/appuse4.jpeg",
  "/appuse5.jpeg",
  "/appuse6.jpeg",
  "/appuse7.jpeg",
  "/appuse8.jpeg",
  "/appuse9.jpeg",
];
const APP_USE_HOLD_RATIO = 0.72;
// Maps each app screen frame index to a paragraph index (0-based)
const FRAME_TO_PARA = [0, 1, 2, 2, 3, 3, 4, 5, 6];

export default function Home() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const listViewportRef = useRef<HTMLDivElement>(null);
  const discussionSectionRef = useRef<HTMLDivElement>(null);
  const superpowerSectionRef = useRef<HTMLDivElement>(null);
  const discussionCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const discussionCardShellRefs = useRef<Array<HTMLDivElement | null>>([]);
  const superpowerImageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const superpowerParaRefs = useRef<Array<HTMLParagraphElement | null>>([]);
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

      const isMobile = window.innerWidth < 1024;

      discussionCardRefs.current.forEach((card, index) => {
        if (!card) return;

        const localProgress = Math.max(
          0,
          Math.min(1, discussionProgress * DISCUSSION_CARD_COUNT - index),
        );
        const eased = localProgress * localProgress * (3 - 2 * localProgress);
        let opacity = eased;
        let y = (1 - eased) * 60;

        if (isMobile) {
          const segmentProgress = Math.max(
            0,
            Math.min(
              1,
              (discussionProgress - index / DISCUSSION_CARD_COUNT) /
                (1 / DISCUSSION_CARD_COUNT),
            ),
          );
          const enterProgress = Math.max(
            0,
            Math.min(1, segmentProgress / 0.35),
          );
          const enterEased =
            enterProgress * enterProgress * (3 - 2 * enterProgress);
          const exitProgress = Math.max(
            0,
            Math.min(1, (segmentProgress - 0.6) / 0.4),
          );
          const exitEased =
            exitProgress * exitProgress * (3 - 2 * exitProgress);

          if (segmentProgress < 0.35) {
            opacity = enterEased;
            y = 0;
          } else if (
            segmentProgress > 0.8 &&
            index < DISCUSSION_CARD_COUNT - 1
          ) {
            opacity = 1 - exitEased;
            y = 0;
          } else {
            opacity = 1;
            y = 0;
          }
        }

        card.style.opacity = String(opacity);
        card.style.transform = `translateY(${y}px)`;
        card.style.zIndex = String(index + 1);

        const shell = discussionCardShellRefs.current[index];
        if (!shell) return;

        const shouldBuzz = isMobile
          ? opacity > 0.95 && !discussionBuzzedRef.current[index]
          : eased >= 0.995 && !discussionBuzzedRef.current[index];

        if (shouldBuzz) {
          discussionBuzzedRef.current[index] = true;
          shell.classList.remove("card-buzz");
          // Force restart so each reveal can replay the buzz animation.
          void shell.offsetWidth;
          shell.classList.add("card-buzz");
        }

        const shouldStopBuzzing = isMobile
          ? opacity < 0.95 && discussionBuzzedRef.current[index]
          : eased < 0.98 && discussionBuzzedRef.current[index];

        if (shouldStopBuzzing) {
          discussionBuzzedRef.current[index] = false;
          shell.classList.remove("card-buzz");
        }
      });

      const superpowerSection = superpowerSectionRef.current;
      if (!superpowerSection) return;

      const { top: superpowerTop, height: superpowerHeight } =
        superpowerSection.getBoundingClientRect();
      const superpowerScrollable = superpowerHeight - window.innerHeight;
      if (superpowerScrollable <= 0) return;

      const superpowerProgress = Math.max(
        0,
        Math.min(1, -superpowerTop / superpowerScrollable),
      );
      const reveal = Math.min(1, superpowerProgress / 0.08);
      const cappedFrame = Math.min(
        APP_USE_IMAGES.length - 0.0001,
        superpowerProgress * APP_USE_IMAGES.length,
      );
      const frameIndex = Math.floor(cappedFrame);
      const frameProgress = cappedFrame - frameIndex;
      const fadeProgress = Math.max(
        0,
        Math.min(
          1,
          (frameProgress - APP_USE_HOLD_RATIO) / (1 - APP_USE_HOLD_RATIO),
        ),
      );

      superpowerImageRefs.current.forEach((imageFrame, index) => {
        if (!imageFrame) return;

        let opacity = 0;
        if (index === frameIndex) {
          opacity = 1 - fadeProgress;
        }
        if (index === frameIndex + 1) {
          opacity = fadeProgress;
        }
        if (frameIndex === APP_USE_IMAGES.length - 1 && index === frameIndex) {
          opacity = 1;
        }

        const finalOpacity = opacity * reveal;

        imageFrame.style.opacity = String(finalOpacity);
      });

      const activePara = FRAME_TO_PARA[frameIndex];
      const nextFrameIndex = Math.min(
        frameIndex + 1,
        APP_USE_IMAGES.length - 1,
      );
      const nextPara = FRAME_TO_PARA[nextFrameIndex];

      superpowerParaRefs.current.forEach((para, index) => {
        if (!para) return;
        let opacity = 0;
        if (activePara === nextPara) {
          opacity = index === activePara ? 1 : 0;
        } else {
          if (index === activePara) opacity = 1 - fadeProgress;
          else if (index === nextPara) opacity = fadeProgress;
        }
        para.style.opacity = String(opacity * reveal);
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
        <div className="sticky top-0 h-screen flex flex-col lg:flex-row w-full bg-primary overflow-hidden">
          {/* Left column — stays fixed while items scroll */}
          <div className="flex flex-col justify-center items-center text-center lg:items-start lg:text-left w-full lg:w-1/2 h-1/3 lg:h-full p-8">
            <p className="font-eb-garamond text-6xl lg:text-8xl mb-4">Sumi</p>
            <p className="font-be-vietnam-pro text-2xl lg:text-3xl mb-4">
              Your new feed, flooded with the Great Books
            </p>
            <a href="https://apps.apple.com/gb/app/sumi-scroll-smarter/id6779934781">
              <Image
                src="/app-store.svg"
                alt="App Store"
                width={150}
                height={50}
              />
            </a>
          </div>

          {/* Right column — items are driven by scroll progress */}
          <div
            ref={listViewportRef}
            className="relative w-full lg:w-1/2 h-2/3 lg:h-full overflow-hidden"
          >
            <div ref={trackRef} className="flex flex-col will-change-transform">
              {ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="h-[66.666667vh] lg:h-screen flex items-center justify-center"
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
        <div className="discussion-sticky sticky top-0 h-screen bg-secondary flex w-full items-center justify-center p-3 lg:p-8 overflow-hidden">
          <div className="w-full max-w-7xl flex flex-col items-center">
            <p className="discussion-heading font-eb-garamond mb-2 lg:mb-8 sm:text-3xl md:text-4xl lg:text-6xl text-center text-primary mb-4">
              How many novels worth of inane and vacuous text have you
              doom-scrolled this week?
            </p>

            <div className="relative w-full min-h-[20rem] sm:min-h-[22rem] lg:min-h-0 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-2 lg:gap-8">
              <div
                ref={(el) => {
                  discussionCardRefs.current[0] = el;
                }}
                className="absolute inset-x-0 top-0 flex justify-center px-3 lg:px-0 w-full mb-1 lg:mb-4 lg:static will-change-transform"
                style={{ opacity: 0, transform: "translateY(60px)" }}
              >
                <div
                  ref={(el) => {
                    discussionCardShellRefs.current[0] = el;
                  }}
                  className="discussion-card-shell flex flex-col bg-primary rounded w-full max-w-md h-auto"
                >
                  <div className="flex flex-row items-center p-4 gap-3">
                    <div className="shrink-0 h-12 w-12 bg-secondary rounded-full" />
                    <p className="font-be-vietnam-pro shrink-0">VoteNow</p>
                    <p className="font-be-vietnam-pro truncate min-w-0">
                      @PlanetIsDoomed
                    </p>
                    <p className="font-be-vietnam-pro shrink-0">1h</p>
                  </div>
                  <p className="font-be-vietnam-pro px-4 pb-4">
                    As a young boy I dreamed of being a baseball. But tonight I
                    say we must move forward not backward. Upward, not forward.
                    And always twirling, twirling, twirling towards freedom.
                  </p>
                </div>
              </div>

              <div
                ref={(el) => {
                  discussionCardRefs.current[1] = el;
                }}
                className="absolute inset-x-0 top-0 flex justify-center px-3 lg:px-0 w-full mb-1 lg:mb-4 lg:static will-change-transform"
                style={{ opacity: 0, transform: "translateY(60px)" }}
              >
                <div
                  ref={(el) => {
                    discussionCardShellRefs.current[1] = el;
                  }}
                  className="discussion-card-shell flex flex-col bg-secondary w-full max-w-md border border-primary rounded h-auto p-2"
                >
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center">
                      <div className="shrink-0 h-8 w-8 bg-primary rounded-full m-4" />
                      <p className="font-be-vietnam-pro mr-4 text-primary">
                        Fluellen
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
                      <div className="shrink-0 h-8 w-8 bg-primary rounded-full m-4" />
                      <p className="font-be-vietnam-pro mr-4 text-primary">
                        Knave
                      </p>
                      <p className="font-be-vietnam-pro text-primary">15m</p>
                    </div>
                    <p className="font-be-vietnam-pro ml-12 text-primary">
                      Avaunt, blackguard!
                    </p>
                    <p className="font-be-vietnam-pro ml-12 text-error">-25</p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center">
                      <div className="shrink-0 h-8 w-8 bg-primary rounded-full m-4" />
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
                className="absolute inset-x-0 top-0 flex justify-center px-3 lg:px-0 w-full lg:static will-change-transform"
                style={{ opacity: 0, transform: "translateY(60px)" }}
              >
                <div
                  ref={(el) => {
                    discussionCardShellRefs.current[2] = el;
                  }}
                  className="discussion-card-shell flex flex-col justify-center items-center bg-primary rounded w-96 h-96 p-4 lg:p-8"
                >
                  <p className="font-be-vietnam-pro text-primary text-2xl text-secondary text-center">
                    Curtains for Zoosha!? K-dog and batboy jestermaxxing, caught
                    flipping a grunt, in police custody, bail set at $5000.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={superpowerSectionRef}
        style={{ height: `calc(100vh * ${APP_USE_IMAGES.length + 1})` }}
      >
        <div className="sticky top-0 h-screen bg-primary p-6 lg:p-10 overflow-hidden">
          <div className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10">
            <div className="w-full lg:w-1/3 order-1 lg:order-2 flex flex-col justify-center text-secondary">
              <p className="font-eb-garamond text-4xl lg:text-6xl mb-4 lg:mb-6 text-center lg:text-left">
                Meet Sumi.
              </p>
              <div className="relative min-h-[8rem]">
                <p
                  ref={(el) => {
                    superpowerParaRefs.current[0] = el;
                  }}
                  className="absolute top-0 left-0 right-0 font-be-vietnam-pro text-base lg:text-lg text-center lg:text-left"
                  style={{ opacity: 0 }}
                >
                  Serving up serialized classics of literature in an enticing
                  social media format. Trick yourself into becoming a voracious
                  reader.
                </p>
                <p
                  ref={(el) => {
                    superpowerParaRefs.current[1] = el;
                  }}
                  className="absolute top-0 left-0 right-0 font-be-vietnam-pro text-base lg:text-lg text-center lg:text-left"
                  style={{ opacity: 0 }}
                >
                  Thousands of chapters on launch, with more added all the time.
                  Never run out of content.
                </p>
                <p
                  ref={(el) => {
                    superpowerParaRefs.current[2] = el;
                  }}
                  className="absolute top-0 left-0 right-0 font-be-vietnam-pro text-base lg:text-lg text-center lg:text-left"
                  style={{ opacity: 0 }}
                >
                  Read actively by annotating and highlighting your extracts.
                </p>
                <p
                  ref={(el) => {
                    superpowerParaRefs.current[3] = el;
                  }}
                  className="absolute top-0 left-0 right-0 font-be-vietnam-pro text-base lg:text-lg text-center lg:text-left"
                  style={{ opacity: 0 }}
                >
                  Use AI-powered reading aids to boost comprehension and get the
                  most out of your reading. You can generate a literary style
                  chapter argument, a bullet point summary, or a synopsis for a
                  novel. (Premium subscription required).
                </p>
                <p
                  ref={(el) => {
                    superpowerParaRefs.current[4] = el;
                  }}
                  className="absolute top-0 left-0 right-0 font-be-vietnam-pro text-base lg:text-lg text-center lg:text-left"
                  style={{ opacity: 0 }}
                >
                  Collect artworks from John Singer Sergeant, Sir John Everett
                  Millais, Thomas Lawrence and more.
                </p>
                <p
                  ref={(el) => {
                    superpowerParaRefs.current[5] = el;
                  }}
                  className="absolute top-0 left-0 right-0 font-be-vietnam-pro text-base lg:text-lg text-center lg:text-left"
                  style={{ opacity: 0 }}
                >
                  Login daily and track your reader streaks on the global
                  leaderboards.
                </p>
                <p
                  ref={(el) => {
                    superpowerParaRefs.current[6] = el;
                  }}
                  className="absolute top-0 left-0 right-0 font-be-vietnam-pro text-base lg:text-lg text-center lg:text-left"
                  style={{ opacity: 0 }}
                >
                  Receive new instalments daily, every few days, weekly, or
                  bi-weekly. No-ads and no sharing your data with third parties.
                  Core reading features will remain free.
                </p>
              </div>
            </div>

            <div className="w-full lg:w-2/3 order-2 lg:order-1 relative h-[56vh] lg:h-full">
              {APP_USE_IMAGES.map((imageSrc, i) => (
                <div
                  key={imageSrc}
                  ref={(el) => {
                    superpowerImageRefs.current[i] = el;
                  }}
                  className="absolute inset-0 will-change-transform"
                  style={{
                    opacity: i === 0 ? 1 : 0,
                    transform: "translateY(0)",
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={imageSrc}
                      alt={`Sumi app screenshot ${i + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 66vw"
                      priority={i < 2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-8 bg-secondary h-screen">
        <a href="https://apps.apple.com/gb/app/sumi-scroll-smarter/id6779934781">
          <Image
            src="/black-app-store.svg"
            alt="App Store"
            width={150}
            height={50}
            className="mb-6"
          />
        </a>
        <a
          href=""
          className="font-zen-maru-gothic text-2xl lg:text-3xl text-center text-primary mb-6 lg:mb-8"
        >
          ひと休みしましょう
        </a>
        <a
          href=""
          className="font-be-vietnam-pro text-2xl lg:text-3xl text-center text-primary mb-6 lg:mb-8"
        >
          Hitoyasumi Shimashou.
        </a>
        <a
          href=""
          className="font-eb-garamond text-3xl md:text-4xl lg:text-6xl text-center text-primary mb-6 lg:mb-8"
        >
          Take a short rest. Reboot your mind. Reclaim your focus.
        </a>
        <a
          href=""
          className="font-be-vietnam-pro text-2xl lg:text-3xl text-center text-primary mb-6 lg:mb-8"
        >
          support@sumi.club
        </a>
        <a
          href="https://sumidiaries.substack.com/"
          className="font-be-vietnam-pro text-2xl lg:text-3xl text-center text-primary underline mb-6 lg:mb-8"
        >
          Substack
        </a>
        <a
          href="https://app.termly.io/policy-viewer/policy.html?policyUUID=091a3906-219a-4a01-8730-b4e68871892d"
          className="font-be-vietnam-pro text-2xl lg:text-3xl text-center text-primary mb-4 lg:mb-8 underline"
        >
          Privacy Policy
        </a>
        <a
          href="https://app.termly.io/policy-viewer/policy.html?policyUUID=241c1655-5932-4940-8aff-b157a703d9c6"
          className="font-be-vietnam-pro text-2xl lg:text-3xl text-center text-primary mb-4 lg:mb-8 underline"
        >
          Terms & Conditions
        </a>
        <p className="font-be-vietnam-pro text-2xl lg:text-3xl text-center text-primary mb-4 lg:mb-8">
          (c) 2026 Jay Lacey. All rights reserved.
        </p>
      </div>
    </div>
  );
}
