"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sound } from "../utils/audio";
import confetti from "canvas-confetti";
import { siteContent } from "../data/content";
import {
  Sun,
  Moon,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Cake,
  Compass,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  X,
  Wind,
} from "lucide-react";

interface StageConfig {
  id: number;
  title: string;
  subtitle: string;
  dayImg: string;
  nightImg: string;
  focusPoint: string;
}

const STAGES: StageConfig[] = [
  {
    id: 0,
    title: "Top Aerial View",
    subtitle: "High above the pristine beach & open-air seaside Great Hall",
    dayImg: "/images/hp_stage1_top_day.jpg",
    nightImg: "/images/hp_stage1_top_night.jpg",
    focusPoint: "50% 50%",
  },
  {
    id: 1,
    title: "Descending Inside the Hall",
    subtitle: "Swooping through the gothic timber arches into the grand pavilion",
    dayImg: "/images/hp_beach_day.jpg",
    nightImg: "/images/hp_beach_night.jpg",
    focusPoint: "50% 60%",
  },
  {
    id: 2,
    title: "Orbiting the Banquet Table",
    subtitle: "Gliding along the feast table past golden goblets & floating candles",
    dayImg: "/images/hp_beach_day.jpg",
    nightImg: "/images/hp_beach_night.jpg",
    focusPoint: "65% 72%",
  },
  {
    id: 3,
    title: "In Front of the Birthday Cake 🎂",
    subtitle: "Standing right before the grand multi-tier golden celebration cake",
    dayImg: "/images/hp_stage4_cake_day.jpg",
    nightImg: "/images/hp_stage4_cake_night.jpg",
    focusPoint: "50% 50%",
  },
];

export default function RealisticBeachHall() {
  const [currentStage, setCurrentStage] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [theme, setTheme] = useState<"day" | "night">("day");
  const [isAutoTour, setIsAutoTour] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showCakeModal, setShowCakeModal] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);

  const isTransitioningRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  // Smooth stage change with debouncing
  const goToStage = useCallback((newStage: number, dir?: number) => {
    if (newStage < 0 || newStage >= STAGES.length || newStage === currentStage) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    sound.playSlideClick();
    setDirection(dir !== undefined ? dir : newStage > currentStage ? 1 : -1);
    setCurrentStage(newStage);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 850);
  }, [currentStage]);

  const nextStage = useCallback(() => {
    if (currentStage < STAGES.length - 1) {
      goToStage(currentStage + 1, 1);
    }
  }, [currentStage, goToStage]);

  const prevStage = useCallback(() => {
    if (currentStage > 0) {
      goToStage(currentStage - 1, -1);
    }
  }, [currentStage, goToStage]);

  // Auto Flight timer
  useEffect(() => {
    if (!isAutoTour) return;

    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          setDirection(1);
          sound.playSlideClick();
          return prev + 1;
        } else {
          setIsAutoTour(false);
          return prev;
        }
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [isAutoTour]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showCakeModal) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextStage();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        prevStage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStage, prevStage, showCakeModal]);

  // Touch Swipe Handlers (Swipe UP = go deeper/next, Swipe DOWN = go back)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 45) {
      // Swiped UP
      nextStage();
    } else if (diff < -45) {
      // Swiped DOWN
      prevStage();
    }
    touchStartY.current = null;
  };

  // Mouse Wheel Handler with strict throttle
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 30) return;
    if (e.deltaY > 0) {
      nextStage();
    } else {
      prevStage();
    }
  };

  const toggleTheme = () => {
    sound.playSlideClick();
    setTheme((t) => (t === "day" ? "night" : "day"));
  };

  const toggleMusic = () => {
    const active = sound.toggleMusic((p) => setIsAudioPlaying(p));
    setIsAudioPlaying(active);
  };

  const handleCakeClick = () => {
    sound.playCandleBlow();
    setCandlesBlown(true);

    confetti({
      particleCount: 140,
      spread: 95,
      origin: { y: 0.6 },
      colors: ["#ffd700", "#ff69b4", "#00ffff", "#f59e0b", "#ffffff"],
    });

    setTimeout(() => {
      sound.playGiftUnbox();
      setShowCakeModal(true);
    }, 400);
  };

  const activeStage = STAGES[currentStage];
  const activeImage = theme === "day" ? activeStage.dayImg : activeStage.nightImg;

  // Cinematic Motion Variants (Simulating camera zoom, push-in, and depth)
  const cinematicVariants = {
    enter: (dir: number) => ({
      scale: dir > 0 ? 1.08 : 0.94,
      opacity: 0,
      filter: "blur(6px)",
      y: dir > 0 ? 15 : -15,
    }),
    center: {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.95,
        ease: [0.16, 1, 0.3, 1] as const, // Smooth film dolly curve
      },
    },
    exit: (dir: number) => ({
      scale: dir > 0 ? 0.94 : 1.08,
      opacity: 0,
      filter: "blur(6px)",
      y: dir > 0 ? -15 : 15,
      transition: {
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    }),
  };

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full overflow-hidden select-none bg-black"
    >
      {/* =========================================================================
          CINEMATIC CAMERA STAGE: Pure Photorealism with Living Breathing Motion
         ========================================================================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={`${currentStage}-${theme}`}
            custom={direction}
            variants={cinematicVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
            style={{ transformOrigin: activeStage.focusPoint }}
          >
            {/* Active Photorealistic Render with Subtle Living Ken Burns Drift */}
            <motion.div
              animate={{
                scale: [1, 1.035, 1],
                x: [0, (currentStage % 2 === 0 ? 6 : -6), 0],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-full h-full"
            >
              <img
                src={activeImage}
                alt={activeStage.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* =========================================================================
          LIVING OVERLAYS: Realistic Coastal Seagulls in Ocean Sky
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute bird-flying-1">
          <svg
            className={`w-14 h-9 ${theme === "day" ? "text-slate-800 drop-shadow-md" : "text-amber-100/70"}`}
            viewBox="0 0 100 45"
            fill="none"
          >
            {/* Streamlined gull body */}
            <path d="M48 22 Q50 20 54 22 Q52 25 48 24 Z" fill="currentColor" opacity="0.95" />
            {/* Yellow beak */}
            <path d="M54 22 L58 23 L54 24 Z" fill="#f59e0b" />
            {/* Left wing with primary feathers */}
            <path
              className="wing-left"
              d="M48 22 C35 12 18 8 2 12 C14 18 28 22 46 24 C42 19 32 16 20 14 Z"
              fill="currentColor"
            />
            {/* Right wing with primary feathers */}
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

      {/* =========================================================================
          LIVING OVERLAYS: Photorealistic Levitating Hogwarts Candles (Stages 1 & 2)
         ========================================================================= */}
      {(currentStage === 1 || currentStage === 2) && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[
            { top: "18%", left: "42%", delay: 0, scale: 1 },
            { top: "13%", left: "48%", delay: 0.8, scale: 0.9 },
            { top: "21%", left: "55%", delay: 1.4, scale: 1.05 },
            { top: "25%", left: "37%", delay: 2.1, scale: 0.85 },
            { top: "11%", left: "53%", delay: 1.8, scale: 0.95 },
            { top: "28%", left: "46%", delay: 1.1, scale: 1.1 },
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

              {/* Realistic Teardrop Flame with Inner White Core */}
              <div className="relative mx-auto w-3 h-5 candle-flame-anim">
                {/* Outer golden flame envelope */}
                <div className="absolute inset-0 rounded-[50%_50%_40%_40%/70%_70%_30%_30%] bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 shadow-[0_0_12px_#f59e0b]" />
                {/* Inner incandescent core */}
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-2.5 rounded-[50%_50%_40%_40%/70%_70%_30%_30%] bg-white/95" />
              </div>

              {/* Charred cotton wick */}
              <div className="w-[1.5px] h-1.5 bg-zinc-900 mx-auto" />

              {/* Realistic Melted Wax Taper with Molten Rim & Wax Drips */}
              <div className="relative w-3.5 h-11 bg-gradient-to-b from-[#fffef5] via-[#f7ecd5] to-[#ebd8b7] rounded-sm shadow-md border-t border-amber-100/80">
                {/* Top molten wax depression */}
                <div className="absolute -top-0.5 inset-x-0.5 h-1 rounded-full bg-[#f3e3c6] opacity-80" />
                {/* Wax drip trail 1 */}
                <div className="absolute top-1 left-0 w-1 h-4 bg-gradient-to-b from-[#fffef5] to-[#f4e2be] rounded-r-full shadow-sm" />
                <div className="absolute top-5 left-0 w-1.5 h-1.5 bg-[#f4e2be] rounded-full" />
                {/* Wax drip trail 2 */}
                <div className="absolute top-2 right-0 w-0.8 h-5 bg-gradient-to-b from-[#fffef5] to-[#f0dec0] rounded-l-full" />
                <div className="absolute top-7 right-0 w-1.5 h-1.5 bg-[#ebd5b3] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE CAKE HOTSPOT (Active in Stage 3 - Close up)
         ========================================================================= */}
      {currentStage === 3 && (
        <div
          onClick={handleCakeClick}
          className="absolute z-40 cursor-pointer pointer-events-auto"
          style={{
            top: "54%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "380px",
            height: "460px",
          }}
          title="Click to blow out candles and reveal the next surprise!"
        >
          {/* Pulsing golden aura around the cake */}
          <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-2xl animate-pulse" />

          {/* Interactive Button */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-6 left-1/2 -translate-x-1/2 px-7 py-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-rose-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider shadow-[0_0_40px_rgba(245,158,11,0.9)] border-2 border-white flex items-center gap-2 whitespace-nowrap active:scale-95 transition-transform"
          >
            <Cake className="w-4 h-4 text-slate-950" />
            <span>🎂 TAP TO CUT CAKE & MAKE A WISH 🎂</span>
          </motion.div>
        </div>
      )}

      {/* =========================================================================
          HEADER HUD CONTROLS
         ========================================================================= */}
      <header className="absolute top-5 inset-x-0 z-40 px-6 max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full glass-luxury border-amber-400/40 shadow-2xl backdrop-blur-xl">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="font-cinzel text-xs sm:text-sm font-bold tracking-widest text-amber-200">
            HOGWARTS SEASIDE BANQUET
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Day / Night Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xl transition-all duration-300 border ${
              theme === "day"
                ? "bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                : "glass-luxury text-amber-200 border-amber-400/50 hover:bg-white/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            }`}
            title="Toggle Day & Night Mode"
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

          {/* Auto Flight Toggle */}
          <button
            onClick={() => {
              sound.playSlideClick();
              setIsAutoTour(!isAutoTour);
            }}
            className={`px-3.5 py-2 rounded-full border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              isAutoTour
                ? "bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                : "glass-luxury text-zinc-300 border-white/20 hover:text-white"
            }`}
            title="Auto cinematic flight"
          >
            {isAutoTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isAutoTour ? "Pause Tour" : "Auto Flight"}</span>
          </button>

          {/* Music Toggle */}
          <button
            onClick={toggleMusic}
            className={`p-2.5 rounded-full border transition-all ${
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

      {/* =========================================================================
          STAGE TITLE & SUBTITLE OVERLAY (Top Center)
         ========================================================================= */}
      <div className="absolute top-20 inset-x-0 z-30 flex flex-col items-center pointer-events-none px-4 text-center">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-luxury px-5 py-2 rounded-full border border-amber-400/30 text-xs sm:text-sm text-amber-200 font-medium flex items-center gap-2 shadow-2xl backdrop-blur-md mb-1"
        >
          <span className="font-bold text-amber-400 font-mono">Stage {currentStage + 1}/4</span>
          <span className="text-zinc-400">•</span>
          <span>{activeStage.title}</span>
        </motion.div>
        <p className="text-[11px] sm:text-xs text-zinc-300 drop-shadow font-light">
          {activeStage.subtitle}
        </p>
      </div>

      {/* =========================================================================
          SIDE QUICK NAVIGATION CHEVRONS (Desktop & Tablet)
         ========================================================================= */}
      {currentStage > 0 && (
        <button
          onClick={prevStage}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full glass-luxury hover:bg-white/15 text-amber-300 border border-amber-400/30 shadow-2xl transition-all hover:scale-110 pointer-events-auto hidden sm:flex items-center justify-center"
          title="Previous Stage (Arrow Up / Left)"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {currentStage < STAGES.length - 1 && (
        <button
          onClick={nextStage}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full glass-luxury hover:bg-white/15 text-amber-300 border border-amber-400/30 shadow-2xl transition-all hover:scale-110 pointer-events-auto hidden sm:flex items-center justify-center"
          title="Next Stage (Arrow Down / Right)"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      )}

      {/* =========================================================================
          BOTTOM NAVIGATION PILLS & PROGRESS BAR
         ========================================================================= */}
      <div className="absolute bottom-6 inset-x-0 z-40 px-4 max-w-2xl mx-auto flex flex-col items-center gap-3 pointer-events-auto">
        {/* Stage selection buttons */}
        <div className="grid grid-cols-4 gap-2 w-full glass-luxury p-2 rounded-2xl border border-white/15 backdrop-blur-xl text-[10px] sm:text-xs">
          {STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToStage(idx)}
              className={`py-2 px-1 rounded-xl font-bold transition-all text-center truncate ${
                currentStage === idx
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_15px_#f59e0b] scale-102"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {s.id + 1}. {s.id === 0 ? "Top View" : s.id === 1 ? "Enter Hall" : s.id === 2 ? "Banquet Table" : "Cake 🎂"}
            </button>
          ))}
        </div>

        {/* Swipe instructions banner */}
        <div className="flex items-center justify-between w-full px-2 text-zinc-300 text-[11px] font-light">
          {currentStage > 0 ? (
            <button
              onClick={prevStage}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Swipe Down / Prev</span>
            </button>
          ) : (
            <span className="text-zinc-500">Aerial Overview</span>
          )}

          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Swipe or scroll to fly inside</span>
          </div>

          {currentStage < STAGES.length - 1 ? (
            <button
              onClick={nextStage}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors"
            >
              <span>Swipe Up / Next</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCakeClick}
              className="text-amber-300 font-bold animate-pulse flex items-center gap-1"
            >
              <span>Cut Cake 🎂</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          ROYAL BIRTHDAY CAKE MODAL & NEXT PAGE HINT
         ========================================================================= */}
      <AnimatePresence>
        {showCakeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: "spring", damping: 18 }}
              className="w-full max-w-lg glass-luxury-gold rounded-3xl p-6 sm:p-10 border border-amber-400/60 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden"
            >
              <button
                onClick={() => setShowCakeModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-6">
                <Cake className="w-8 h-8 text-slate-950" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-amber-200 mb-3">
                Happy Birthday, {siteContent.recipient.name}! 🎂✨
              </h3>

              <p className="text-zinc-200 text-sm sm:text-base leading-relaxed font-light mb-6">
                You have reached the grand birthday cake at the seaside Great Hall banquet table. The candles have been lit and the feast is prepared in your honor!
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-amber-400/30 text-xs sm:text-sm text-amber-200 font-medium mb-6">
                🔮 <strong>Next Page Hint:</strong> The royal portal is ready! The next page of cherished memories, video reel, and personalized wishes is ready to unfold.
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    sound.playPop();
                    confetti({
                      particleCount: 90,
                      spread: 85,
                      origin: { y: 0.5 },
                    });
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Celebration Fireworks!</span>
                </button>

                <button
                  onClick={() => setShowCakeModal(false)}
                  className="px-5 py-2.5 rounded-full glass-card hover:bg-white/10 text-zinc-300 text-xs sm:text-sm font-semibold transition-all border-white/20"
                >
                  Stay in the Hall
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
