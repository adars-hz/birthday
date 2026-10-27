"use client";

import { useState, useEffect } from "react";
import { sound } from "../utils/audio";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const toggleAudio = () => {
    setHasInteracted(true);
    setShowHint(false);
    const state = sound.toggleMusic((playing) => {
      setIsPlaying(playing);
    });
    setIsPlaying(state);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <AnimatePresence>
        {showHint && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="glass-luxury-gold py-2 px-4 rounded-full text-xs font-semibold text-amber-200 hidden sm:flex items-center gap-2 shadow-2xl cursor-pointer"
            onClick={toggleAudio}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>Play Birthday Music</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleAudio}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`relative p-3.5 rounded-full backdrop-blur-xl border transition-all duration-300 flex items-center justify-center shadow-2xl ${
          isPlaying
            ? "bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
            : "glass-card text-zinc-300 border-white/10 hover:border-amber-400/50 hover:text-amber-200"
        }`}
        title={isPlaying ? "Mute Birthday Music" : "Play Birthday Music"}
      >
        {isPlaying ? (
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-5 h-5 text-slate-950" />
            {/* Equalizer animation bars */}
            <div className="flex items-end gap-[2px] h-3.5">
              <motion.span
                animate={{ height: ["4px", "14px", "6px", "14px"] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="w-[2px] bg-slate-950 rounded-full"
              />
              <motion.span
                animate={{ height: ["10px", "4px", "14px", "8px"] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-[2px] bg-slate-950 rounded-full"
              />
              <motion.span
                animate={{ height: ["6px", "14px", "4px", "10px"] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                className="w-[2px] bg-slate-950 rounded-full"
              />
            </div>
          </div>
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </motion.button>
    </div>
  );
}
