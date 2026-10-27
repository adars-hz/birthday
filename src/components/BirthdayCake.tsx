"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { siteContent } from "../data/content";
import { sound } from "../utils/audio";
import { Sparkles, Flame, Wind, RotateCcw, Heart, Stars } from "lucide-react";

export default function BirthdayCake() {
  const totalCandles = siteContent.cake.candlesCount || 5;
  // State for which candles are lit (true = lit, false = blown out)
  const [candlesLit, setCandlesLit] = useState<boolean[]>(Array(totalCandles).fill(true));
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const litCount = candlesLit.filter(Boolean).length;
  const allBlownOut = litCount === 0;

  // Blow out an individual candle
  const blowCandle = (index: number) => {
    if (!candlesLit[index]) return;

    sound.playCandleBlow();
    const updated = [...candlesLit];
    updated[index] = false;
    setCandlesLit(updated);

    // If that was the last candle
    if (updated.filter(Boolean).length === 0) {
      triggerWishCelebration();
    }
  };

  // Blow out all candles at once
  const blowAllCandles = () => {
    if (allBlownOut) return;

    sound.playCandleBlow();
    setCandlesLit(Array(totalCandles).fill(false));
    triggerWishCelebration();
  };

  const triggerWishCelebration = () => {
    setHasCelebrated(true);

    // Multi-stage confetti celebration
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 35,
        spread: 360,
        startVelocity: 30,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors: ["#ffd700", "#ff69b4", "#ff1493", "#9370db", "#00ffff", "#ffffff"],
      });
    }, 250);
  };

  // Relight the candles
  const relightCandles = () => {
    sound.playPop();
    setCandlesLit(Array(totalCandles).fill(true));
    setHasCelebrated(false);
  };

  return (
    <section id="cake-section" className="relative py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-amber-300 text-xs font-semibold mb-3 border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Wish Ceremony</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-serif-luxury text-white tracking-tight">
          {siteContent.cake.title}
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base mt-2 font-light max-w-lg mx-auto">
          {siteContent.cake.subtitle}
        </p>
      </motion.div>

      {/* The Cake Stage */}
      <div className="relative max-w-md mx-auto min-h-[380px] flex flex-col items-center justify-end pb-8">
        {/* Ambient Candle Warmth Glow */}
        {litCount > 0 && (
          <motion.div
            animate={{
              opacity: [0.6, 0.9, 0.6],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 inset-x-0 h-44 bg-gradient-to-t from-amber-500/25 via-orange-500/15 to-transparent rounded-full blur-2xl pointer-events-none"
          />
        )}

        {/* Candles Row */}
        <div className="flex items-end justify-center gap-4 sm:gap-6 z-20 mb-[-4px]">
          {candlesLit.map((isLit, idx) => (
            <div
              key={idx}
              onClick={() => blowCandle(idx)}
              className="flex flex-col items-center cursor-pointer group select-none relative"
              title={isLit ? "Click to blow out candle" : "Candle blown out"}
            >
              {/* Flame or Smoke */}
              <div className="h-14 flex items-end justify-center relative">
                {isLit ? (
                  <motion.div
                    animate={{
                      y: [0, -2, 0],
                      scaleY: [1, 1.08, 0.95, 1],
                      scaleX: [1, 0.94, 1.05, 1],
                    }}
                    transition={{
                      duration: 0.35 + (idx % 3) * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative flex items-center justify-center glow-candle"
                  >
                    {/* Outer radiant halo */}
                    <div className="w-6 h-9 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 candle-flame-anim shadow-[0_0_20px_#f59e0b]" />
                    {/* Inner blue core */}
                    <div className="absolute bottom-0 w-2.5 h-3.5 rounded-full bg-blue-300 opacity-80" />
                  </motion.div>
                ) : (
                  /* Smoke puff */
                  <div className="relative flex items-center justify-center">
                    <span className="text-zinc-400 text-xs font-mono font-bold smoke-puff">~ 💭</span>
                  </div>
                )}
              </div>

              {/* Candle Wick */}
              <div className="w-0.5 h-2.5 bg-zinc-700" />

              {/* Candle Body */}
              <div
                className={`w-3.5 sm:w-4 h-16 sm:h-20 rounded-t-sm shadow-md transition-all ${
                  idx % 2 === 0
                    ? "bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 border-x border-amber-100/40"
                    : "bg-gradient-to-b from-rose-300 via-rose-500 to-pink-700 border-x border-rose-200/40"
                }`}
              >
                {/* Candle spiral stripes */}
                <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,white_4px,white_8px)]" />
              </div>
            </div>
          ))}
        </div>

        {/* 3-Tier Luxury Cake */}
        <div className="w-full flex flex-col items-center relative z-10">
          {/* Top Tier */}
          <div className="w-48 sm:w-56 h-14 rounded-2xl bg-gradient-to-r from-rose-950 via-purple-900 to-slate-900 border border-amber-400/40 shadow-xl relative overflow-hidden flex items-center justify-center">
            {/* Golden frosting drip edge */}
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 shadow-sm" />
            <span className="text-[11px] font-serif-luxury font-bold text-amber-200/90 tracking-widest uppercase">
              ✨ Happy Birthday ✨
            </span>
          </div>

          {/* Middle Tier */}
          <div className="w-64 sm:w-72 h-16 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-rose-950 border border-amber-400/30 shadow-2xl relative overflow-hidden -mt-2 flex items-center justify-center">
            <div className="absolute top-0 inset-x-0 h-3.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 shadow-sm" />
            <div className="flex gap-4 text-amber-300/40">
              <Sparkles className="w-3.5 h-3.5" />
              <Heart className="w-3.5 h-3.5" />
              <Stars className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Bottom Tier */}
          <div className="w-80 sm:w-92 h-20 rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 border border-amber-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden -mt-2 flex items-center justify-center">
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 shadow-md" />
            <span className="text-sm font-cinzel font-black tracking-widest shimmer-gold">
              CELEBRATING {siteContent.recipient.name.toUpperCase()}
            </span>
          </div>

          {/* Cake Stand / Platter */}
          <div className="w-96 sm:w-[26rem] h-4 rounded-full bg-gradient-to-r from-zinc-700 via-amber-400 to-zinc-700 shadow-2xl border-t border-amber-200 -mt-1" />
          <div className="w-28 h-6 bg-gradient-to-b from-zinc-700 to-zinc-900 border-x border-zinc-600 rounded-b-xl shadow-lg" />
        </div>
      </div>

      {/* Interactive Controls & Wish Reveal */}
      <div className="mt-8 flex flex-col items-center">
        {!allBlownOut ? (
          <div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={blowAllCandles}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-bold text-base shadow-[0_0_35px_rgba(245,158,11,0.5)] flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <Wind className="w-5 h-5" />
              <span>Blow Out All Candles & Make a Wish</span>
            </motion.button>
            <p className="text-xs text-zinc-500 font-light">
              Tip: You can also click each candle individually to blow them out one by one!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-full max-w-xl glass-luxury-gold rounded-3xl p-6 sm:p-8 border border-amber-400/50 shadow-[0_0_60px_rgba(245,158,11,0.25)]"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>WISH SENT TO THE HEAVENS</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-amber-200 mb-3">
                May All Your Dreams Come True! 🌟
              </h3>

              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-light mb-6">
                {siteContent.cake.wishMessage}
              </p>

              <button
                onClick={relightCandles}
                className="px-6 py-2.5 rounded-full glass-card hover:bg-white/10 text-amber-300 text-xs sm:text-sm font-semibold flex items-center gap-2 mx-auto border-amber-400/30 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Relight Candles & Wish Again</span>
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
