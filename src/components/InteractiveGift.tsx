"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import confetti from "canvas-confetti";
import { Gift } from "lucide-react";
import { siteContent } from "../data/content";

export default function InteractiveGift() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    
    // Fire confetti from canvas-confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  return (
    <section id="gift-section" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-20 relative">
      <div className="max-w-4xl mx-auto px-4 text-center w-full flex flex-col items-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-16 drop-shadow-md relative -top-24 md:-top-32">{siteContent.interactiveGift.title}</h2>
        
        <div className="relative inline-block cursor-pointer" onClick={handleOpen}>
          {/* Gift Box */}
          <motion.div
            animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1, y: [0, -20, 0] }}
            transition={{ y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
            className="w-64 h-64 bg-pink-600 rounded-2xl shadow-2xl flex items-center justify-center relative border-4 border-pink-400"
          >
            <div className="absolute w-full h-8 bg-yellow-400 top-1/2 -translate-y-1/2 shadow-sm"></div>
            <div className="absolute h-full w-8 bg-yellow-400 left-1/2 -translate-x-1/2 shadow-sm"></div>
            <Gift className="w-24 h-24 text-white z-10" />
            <div className="absolute -top-10 text-white font-bold text-xl animate-pulse">Click Me!</div>
          </motion.div>

          {/* Opened Card */}
          {isOpen && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-sm glass p-6 md:p-8 rounded-3xl text-white shadow-2xl flex flex-col items-center"
            >
              <h3 className="text-3xl font-bold mb-4 text-yellow-300 drop-shadow-md">{siteContent.interactiveGift.modalTitle}</h3>
              
              <div className="w-full aspect-[4/5] max-h-72 bg-white/10 rounded-xl mb-4 overflow-hidden relative shadow-inner flex items-center justify-center">
                <img 
                  src={siteContent.interactiveGift.surprisePhoto} 
                  alt="Surprise Photo" 
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-lg leading-relaxed font-medium text-center">
                {siteContent.interactiveGift.modalMessage}
              </p>
              
              <div className="mt-4">
                <span className="text-4xl animate-pulse inline-block drop-shadow-lg">💖</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
