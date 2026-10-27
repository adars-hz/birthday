"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sound } from "../utils/audio";
import confetti from "canvas-confetti";
import { siteContent } from "../data/content";
import {
  Sun,
  Moon,
  Sparkles,
  ArrowDown,
  ArrowUp,
  Compass,
  Cake,
  Mail,
  Volume2,
  VolumeX,
} from "lucide-react";

interface MagicalBeachHallProps {
  onEnterCelebration?: () => void;
}

export default function MagicalBeachHall({ onEnterCelebration }: MagicalBeachHallProps) {
  // Theme: "day" | "night"
  const [theme, setTheme] = useState<"day" | "night">("day");
  // Camera perspective: false = wide hall exterior/entrance view; true = moved inside at banquet table & cake
  const [isInside, setIsInside] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle swipe gestures (Swipe up = move inside, Swipe down = zoom out)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (diff > 50) {
      // Swiped UP -> Move inside the hall
      if (!isInside) {
        moveInsideHall();
      }
    } else if (diff < -50) {
      // Swiped DOWN -> Zoom out
      if (isInside) {
        setIsInside(false);
      }
    }
    setTouchStartY(null);
  };

  // Wheel scroll to move inside
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 40 && !isInside) {
      moveInsideHall();
    } else if (e.deltaY < -40 && isInside) {
      setIsInside(false);
    }
  };

  const moveInsideHall = () => {
    sound.playSlideClick();
    setIsInside(true);
  };

  const toggleTheme = () => {
    sound.playSlideClick();
    setTheme((prev) => (prev === "day" ? "night" : "day"));
  };

  const toggleMusic = () => {
    const active = sound.toggleMusic((playing) => setIsAudioPlaying(playing));
    setIsAudioPlaying(active);
  };

  const [showNextPageModal, setShowNextPageModal] = useState(false);

  const handleCakeClick = () => {
    sound.playGiftUnbox();

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#ffd700", "#f59e0b", "#fb7185", "#38bdf8", "#a855f7", "#ffffff"],
    });

    setShowNextPageModal(true);
    if (onEnterCelebration) {
      onEnterCelebration();
    }
  };

  return (
    <section
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-screen overflow-hidden bg-black select-none"
    >
      {/* 1. Main Background Scene Container (With 3D Zoom / Dolly-In Animation) */}
      <motion.div
        animate={{
          scale: isInside ? 1.62 : 1,
          y: isInside ? "16%" : "0%",
        }}
        transition={{
          duration: 1.4,
          ease: [0.16, 1, 0.3, 1], // Smooth cinematic camera motion
        }}
        className="absolute inset-0 w-full h-full origin-[50%_72%]"
      >
        {/* Day Theme Image */}
        <div
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
            theme === "day" ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('/images/hp_beach_day.jpg')` }}
        />

        {/* Night Theme Image */}
        <div
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${
            theme === "night" ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('/images/hp_beach_night.jpg')` }}
        />

        {/* 2. Realistic Flying Seagulls in the sky */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div className="absolute bird-flying-1">
            <svg
              className={`w-14 h-9 ${theme === "day" ? "text-slate-800 drop-shadow-md" : "text-amber-100/70"}`}
              viewBox="0 0 100 45"
              fill="none"
            >
              <path d="M48 22 Q50 20 54 22 Q52 25 48 24 Z" fill="currentColor" opacity="0.95" />
              <path d="M54 22 L58 23 L54 24 Z" fill="#f59e0b" />
              <path
                className="wing-left"
                d="M48 22 C35 12 18 8 2 12 C14 18 28 22 46 24 C42 19 32 16 20 14 Z"
                fill="currentColor"
              />
              <path
                className="wing-right"
                d="M52 22 C65 12 82 8 98 12 C86 18 72 22 54 24 C58 19 68 16 80 14 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="absolute bird-flying-2">
            <svg
              className={`w-11 h-7 ${theme === "day" ? "text-slate-700 drop-shadow" : "text-amber-200/60"}`}
              viewBox="0 0 100 45"
              fill="none"
            >
              <path d="M48 22 Q50 20 54 22 Q52 25 48 24 Z" fill="currentColor" opacity="0.9" />
              <path d="M54 22 L57 23 L54 24 Z" fill="#f59e0b" />
              <path
                className="wing-left"
                d="M48 22 C35 12 18 8 2 12 C14 18 28 22 46 24 Z"
                fill="currentColor"
              />
              <path
                className="wing-right"
                d="M52 22 C65 12 82 8 98 12 C86 18 72 22 54 24 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* 3. Photorealistic Floating Levitating Harry Potter Candles */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {[
            { top: "18%", left: "38%", delay: 0, scale: 1 },
            { top: "14%", left: "46%", delay: 0.8, scale: 0.95 },
            { top: "20%", left: "54%", delay: 1.4, scale: 1.05 },
            { top: "24%", left: "42%", delay: 2.1, scale: 0.88 },
            { top: "22%", left: "58%", delay: 0.5, scale: 1.0 },
            { top: "12%", left: "50%", delay: 1.8, scale: 0.92 },
            { top: "28%", left: "48%", delay: 1.1, scale: 1.1 },
          ].map((candle, idx) => (
            <div
              key={idx}
              className="absolute floating-candle-levitate filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              style={{
                top: candle.top,
                left: candle.left,
                animationDelay: `${candle.delay}s`,
                transform: `scale(${candle.scale})`,
              }}
            >
              {/* Luminous Ambient Halo */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400/20 blur-md pointer-events-none animate-pulse" />

              {/* Realistic Teardrop Flame with Inner Core */}
              <div className="relative mx-auto w-3 h-5 candle-flame-anim">
                <div className="absolute inset-0 rounded-[50%_50%_40%_40%/70%_70%_30%_30%] bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 shadow-[0_0_12px_#f59e0b]" />
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-2.5 rounded-[50%_50%_40%_40%/70%_70%_30%_30%] bg-white/95" />
              </div>

              {/* Charred cotton wick */}
              <div className="w-[1.5px] h-1.5 bg-zinc-900 mx-auto" />

              {/* Realistic Melted Wax Taper with Wax Drips */}
              <div className="relative w-3.5 h-11 bg-gradient-to-b from-[#fffef5] via-[#f7ecd5] to-[#ebd8b7] rounded-sm shadow-md border-t border-amber-100/80">
                <div className="absolute -top-0.5 inset-x-0.5 h-1 rounded-full bg-[#f3e3c6] opacity-80" />
                <div className="absolute top-1 left-0 w-1 h-4 bg-gradient-to-b from-[#fffef5] to-[#f4e2be] rounded-r-full shadow-sm" />
                <div className="absolute top-5 left-0 w-1.5 h-1.5 bg-[#f4e2be] rounded-full" />
                <div className="absolute top-2 right-0 w-0.8 h-5 bg-gradient-to-b from-[#fffef5] to-[#f0dec0] rounded-l-full" />
                <div className="absolute top-7 right-0 w-1.5 h-1.5 bg-[#ebd5b3] rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* 4. Interactive Clickable Hotspot on the Birthday Cake & Table */}
        <div
          onClick={handleCakeClick}
          className="absolute z-30 cursor-pointer group"
          style={{
            top: "60%",
            right: "17%",
            width: isInside ? "240px" : "150px",
            height: isInside ? "280px" : "180px",
            transform: "translate(50%, -50%)",
          }}
          title="Click the Birthday Cake to Reveal Your Next Surprises!"
        >
          {/* Pulsing magical aura around the cake */}
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl group-hover:bg-amber-400/40 transition-all duration-300 animate-pulse" />

          {/* Interactive Sparkler Pin over the cake */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] sm:text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.8)] border border-white flex items-center gap-1 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>TAP THE CAKE ✨</span>
          </motion.div>
        </div>
      </motion.div>

      {/* 5. Floating Controls & Theme Switcher (Top Header) */}
      <header className="absolute top-6 inset-x-0 z-40 px-6 max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Title Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full glass-luxury border-amber-400/30 shadow-2xl backdrop-blur-xl">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="font-cinzel text-xs sm:text-sm font-bold tracking-widest text-amber-200">
            HOGWARTS SEASIDE CELEBRATION
          </span>
        </div>

        {/* Day / Night Theme & Audio Controls */}
        <div className="flex items-center gap-3">
          {/* Day / Night Switcher */}
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xl transition-all duration-300 border ${
              theme === "day"
                ? "bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                : "glass-luxury text-amber-200 border-amber-400/50 hover:bg-white/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            }`}
            title="Toggle Day & Night Theme"
          >
            {theme === "day" ? (
              <>
                <Sun className="w-4 h-4 text-slate-950 animate-spin" style={{ animationDuration: "12s" }} />
                <span>Day Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-300" />
                <span>Night Mode</span>
              </>
            )}
          </button>

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-2.5 rounded-full border transition-all duration-300 ${
              isAudioPlaying
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                : "glass-luxury text-zinc-300 border-white/15 hover:border-amber-400/40"
            }`}
            title={isAudioPlaying ? "Mute Music" : "Play Birthday Music"}
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 6. Bottom Navigation Hint: Swipe In / Zoom Controls & Next Page Redirect */}
      <div className="absolute bottom-8 inset-x-0 z-40 flex flex-col items-center justify-center px-4 pointer-events-auto">
        <AnimatePresence mode="wait">
          {!isInside ? (
            /* Exterior view hint: prompt to swipe or step inside */
            <motion.div
              key="exterior-hint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <button
                onClick={moveInsideHall}
                className="px-6 py-3 rounded-full glass-luxury-gold text-amber-200 text-xs sm:text-sm font-bold tracking-wide shadow-[0_0_30px_rgba(245,158,11,0.4)] border border-amber-400/60 hover:brightness-125 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span>Swipe In / Step Inside The Hall 🏰</span>
              </button>

              <p className="text-[11px] sm:text-xs text-amber-100/80 drop-shadow font-light tracking-wide flex items-center gap-1.5">
                <span>The banquet table and birthday cake await inside</span>
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              </p>
            </motion.div>
          ) : (
            /* Inside view: prompt to tap the cake or scroll to the next page */
            <motion.div
              key="inside-hint"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-3 text-center max-w-lg"
            >
              {/* Royal Invitation parchment */}
              <div className="glass-luxury-gold px-6 py-4 rounded-3xl border border-amber-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                <div className="flex items-center justify-center gap-2 text-amber-300 font-serif-luxury font-bold text-sm sm:text-base mb-1">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>Your Seaside Birthday Table Is Ready! 🎂</span>
                </div>
                <p className="text-zinc-200 text-xs leading-relaxed font-light mb-4">
                  Tap the glowing birthday cake on the table, or continue below to unlock your cinematic memory reel & surprises!
                </p>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleCakeClick}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Cake className="w-4 h-4" />
                    <span>Cut Cake & Enter Next Page</span>
                  </button>

                  <button
                    onClick={() => setIsInside(false)}
                    className="px-4 py-2 rounded-full glass-card text-zinc-300 hover:text-white text-xs font-semibold transition-colors border-white/20"
                  >
                    Step Back
                  </button>
                </div>
              </div>

              <div
                onClick={handleCakeClick}
                className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 cursor-pointer mt-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Tap the Birthday Cake to Reveal Next Surprise</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 7. Next Page Hint / Royal Birthday Reveal Modal */}
      <AnimatePresence>
        {showNextPageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", damping: 18 }}
              className="w-full max-w-lg glass-luxury-gold rounded-3xl p-6 sm:p-10 border border-amber-400/60 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden"
            >
              {/* Corner Sparkle accents */}
              <div className="absolute top-4 left-4 text-amber-400/40">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="absolute top-4 right-4 text-amber-400/40">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>

              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-6">
                <Cake className="w-8 h-8 text-slate-950" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-amber-200 mb-3">
                Happy Birthday, {siteContent.recipient.name}! 🎂✨
              </h3>

              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-light mb-6">
                The magical banquet hall is yours. The floating candles are lit, the tropical ocean breeze is rolling in, and the feast is set.
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-amber-400/30 text-xs sm:text-sm text-amber-200/90 font-medium mb-6">
                🔮 <strong>Hint for the Next Page:</strong> Next journey portal unlocked! Ready to unveil personal memories and wishes whenever you choose.
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    sound.playPop();
                    confetti({
                      particleCount: 60,
                      spread: 70,
                      origin: { y: 0.5 },
                    });
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>More Fireworks!</span>
                </button>

                <button
                  onClick={() => setShowNextPageModal(false)}
                  className="px-5 py-2.5 rounded-full glass-card hover:bg-white/10 text-zinc-300 text-xs sm:text-sm font-semibold transition-all border-white/20"
                >
                  Enjoy The Hall
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

