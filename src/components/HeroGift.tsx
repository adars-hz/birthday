"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { siteContent } from "../data/content";
import { sound } from "../utils/audio";
import { Sparkles, Gift, Heart, ArrowDown, ChevronRight, Award } from "lucide-react";

interface HeroGiftProps {
  onScrollToReel?: () => void;
}

export default function HeroGift({ onScrollToReel }: HeroGiftProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenGift = () => {
    if (!isOpened) {
      setIsOpened(true);
      sound.playGiftUnbox();

      // Fire luxury golden and rose confetti
      const end = Date.now() + 3.5 * 1000;
      const colors = ["#f59e0b", "#fef08a", "#fb7185", "#f43f5e", "#c084fc", "#ffffff"];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  };

  const scrollToNext = () => {
    if (onScrollToReel) {
      onScrollToReel();
    } else {
      const reel = document.getElementById("slideshow-section");
      reel?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-16 pb-24 overflow-hidden">
      {/* Top Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-amber-500/20 text-amber-300 text-xs sm:text-sm font-medium mb-6 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
      >
        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        <span>{siteContent.hero.badge}</span>
      </motion.div>

      {/* Main Birthday Greeting */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="text-center max-w-4xl mx-auto mb-10"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
          <span className="text-zinc-200">{siteContent.hero.headline} </span>
          <span className="shimmer-gold block sm:inline font-serif-luxury mt-1">
            {siteContent.recipient.name}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
          {siteContent.hero.subheadline}
        </p>
      </motion.div>

      {/* The 3D Interactive Luxury Gift Box / Opened Letter Container */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[380px]">
        <AnimatePresence mode="wait">
          {!isOpened ? (
            <motion.div
              key="closed-box"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Box container with 3D hover effects */}
              <motion.div
                onClick={handleOpenGift}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                animate={{
                  y: [0, -12, 0],
                  rotateZ: isHovered ? [0, -2, 2, -1, 0] : 0,
                }}
                transition={{
                  y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                  rotateZ: { duration: 0.5 },
                }}
                className="relative cursor-pointer group"
                style={{ perspective: 1000 }}
              >
                {/* Glow aura */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-rose-500/30 to-purple-600/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 scale-110" />

                {/* Gift Box Base */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-br from-rose-950 via-purple-950 to-slate-950 border border-amber-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
                  {/* Luxury Satin Gold Ribbons */}
                  <div className="absolute inset-x-0 h-10 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 shadow-md border-y border-amber-200/50" />
                  <div className="absolute inset-y-0 w-10 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-600 via-amber-300 to-amber-600 shadow-md border-x border-amber-200/50" />

                  {/* Shimmering Center Bow / Gem */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center border border-white/60"
                  >
                    <Gift className="w-10 h-10 text-slate-950" />
                  </motion.div>

                  {/* Corner Sparkle accents */}
                  <div className="absolute top-3 right-3 text-amber-300/60">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                </div>

                {/* Interactive Click Me Tag */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full glass-luxury-gold text-amber-200 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap shadow-xl border border-amber-400/50 flex items-center gap-1.5"
                >
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Click to Unwrap Gift</span>
                </motion.div>
              </motion.div>

              <p className="mt-12 text-zinc-400 text-xs sm:text-sm font-light text-center">
                {siteContent.hero.giftBoxHint}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="opened-box"
              initial={{ scale: 0.7, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 18, stiffness: 120 }}
              className="w-full glass-luxury-gold rounded-3xl p-6 sm:p-10 relative overflow-hidden text-center border border-amber-400/40 shadow-[0_0_60px_rgba(245,158,11,0.2)]"
            >
              {/* Decorative corner stars */}
              <div className="absolute top-4 left-4 text-amber-400/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="absolute top-4 right-4 text-amber-400/40">
                <Sparkles className="w-5 h-5" />
              </div>

              {/* Photo & Greeting Inside */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-300/80 shadow-[0_0_30px_rgba(245,158,11,0.5)] overflow-hidden mb-6 bg-slate-900"
                >
                  <img
                    src="/images/photo5.jpg"
                    alt={siteContent.recipient.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to photo1 if photo5 is missing
                      (e.currentTarget as HTMLImageElement).src = "/images/photo1.jpg";
                    }}
                  />
                </motion.div>

                <h3 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-amber-200 mb-4">
                  {siteContent.hero.giftLetter.title}
                </h3>

                <p className="text-zinc-200 text-base sm:text-lg leading-relaxed max-w-xl mx-auto font-light mb-6">
                  {siteContent.hero.giftLetter.message}
                </p>

                <div className="flex items-center gap-2 text-rose-400 font-medium text-sm mb-8">
                  <Heart className="w-4 h-4 fill-rose-400" />
                  <span>{siteContent.hero.giftLetter.signature}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.button
                    onClick={scrollToNext}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-2 hover:brightness-110 transition-all"
                  >
                    <span>Watch Memory Reel</span>
                    <ArrowDown className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={() => {
                      sound.playPop();
                      confetti({
                        particleCount: 50,
                        spread: 70,
                        origin: { y: 0.6 },
                      });
                    }}
                    className="px-5 py-3 rounded-full glass-card hover:bg-white/10 text-amber-200 text-sm font-semibold transition-all border-white/15 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>More Sparkles!</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Down arrow invitation */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-16 flex flex-col items-center cursor-pointer text-zinc-500 hover:text-amber-300 transition-colors"
        onClick={scrollToNext}
      >
        <span className="text-xs uppercase tracking-widest font-semibold mb-1">Explore Memories</span>
        <ArrowDown className="w-4 h-4" />
      </motion.div>
    </section>
  );
}
