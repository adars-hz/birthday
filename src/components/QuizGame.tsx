"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { sound } from "../utils/audio";
import { Sparkles, Heart, Laugh } from "lucide-react";

export default function QuizGame() {
  const [showResult, setShowResult] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [yesScale, setYesScale] = useState(1);
  const [fakeButtons, setFakeButtons] = useState<{ id: number; x: number; y: number }[]>([]);
  const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleHoverNo = () => {
    sound.playSlideClick();
    const maxWidth = windowDimension.width || 800;
    const randomX = (Math.random() - 0.5) * (maxWidth * 0.5);
    const randomY = (Math.random() - 0.5) * 320;

    setNoPosition({ x: randomX, y: randomY });
    setYesScale((prev) => Math.min(prev + 0.25, 4));

    if (fakeButtons.length < 10) {
      setFakeButtons((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), x: randomX * -1.2, y: randomY * -1.2 },
      ]);
    }
  };

  const handleYesClick = () => {
    sound.playPop();
    setShowResult(true);
  };

  return (
    <section id="quiz-section" className="relative py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">
      {showResult && windowDimension.width > 0 && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={true}
          numberOfPieces={400}
          gravity={0.25}
        />
      )}

      <div className="glass-luxury-gold p-8 sm:p-14 rounded-3xl border border-amber-400/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {!showResult ? (
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold mb-4 border border-amber-400/20">
              <Laugh className="w-3.5 h-3.5" />
              <span>A Playful Truth Check</span>
            </div>

            <h3 className="text-3xl sm:text-5xl font-extrabold font-serif-luxury text-white mb-4">
              Am I Your Favorite Person / Best Friend?
            </h3>
            <p className="text-zinc-400 text-sm font-light mb-12">
              (Choose carefully... the universe is watching ✨)
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative min-h-[220px]">
              {/* YES BUTTON */}
              <motion.button
                onClick={handleYesClick}
                animate={{ scale: yesScale }}
                whileHover={{ scale: yesScale + 0.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 12 }}
                className="px-10 py-4 rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 font-black text-xl sm:text-2xl shadow-[0_0_35px_rgba(52,211,153,0.5)] z-20 cursor-pointer"
              >
                YES! ABSOLUTELY 💖
              </motion.button>

              {/* RUNAWAY NO BUTTON */}
              <motion.button
                animate={{
                  x: noPosition.x,
                  y: noPosition.y,
                  rotateZ: Math.random() * 20 - 10,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 15 }}
                onMouseEnter={handleHoverNo}
                onClick={handleHoverNo}
                className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 font-semibold text-sm border border-zinc-700 shadow-lg cursor-pointer"
              >
                No ❌
              </motion.button>

              {/* Fake escaping No decoy buttons */}
              {fakeButtons.map((fake) => (
                <motion.div
                  key={fake.id}
                  initial={{ opacity: 0.7, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.4, x: fake.x, y: fake.y }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  onAnimationComplete={() => {
                    setFakeButtons((prev) => prev.filter((b) => b.id !== fake.id));
                  }}
                  className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold absolute pointer-events-none border border-rose-500/30"
                >
                  No 🏃‍♂️💨
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex flex-col items-center py-4"
          >
            <span className="text-5xl sm:text-6xl mb-4 animate-bounce">🥰</span>
            <h3 className="text-3xl sm:text-5xl font-extrabold font-serif-luxury text-amber-200 mb-4">
              I Knew It All Along! ❤️
            </h3>
            <p className="text-zinc-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-light mb-8">
              Thank you for being such an incredible part of my life. No matter where the years lead us,
              our laughs, wild adventures, and memories are forever locked in the vault!
            </p>
            <button
              onClick={() => {
                setShowResult(false);
                setNoPosition({ x: 0, y: 0 });
                setYesScale(1);
                setFakeButtons([]);
              }}
              className="px-6 py-2.5 rounded-full glass-card hover:bg-white/10 text-amber-300 text-xs sm:text-sm font-semibold transition-all border-amber-400/30"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
