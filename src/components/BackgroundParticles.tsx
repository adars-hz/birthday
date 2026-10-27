"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BackgroundParticles() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate static positions client-side to prevent hydration mismatches
    const generatedStars = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
    }));
    setStars(generatedStars);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ambient Radial Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[140px]" />
      <div className="absolute top-2/3 left-10 w-[28rem] h-[28rem] bg-rose-500/10 rounded-full blur-[130px]" />
      <div className="absolute -bottom-20 right-1/4 w-[32rem] h-[32rem] bg-indigo-600/15 rounded-full blur-[140px]" />

      {/* Floating Golden Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-amber-200"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: `0 0 ${star.size * 3}px rgba(254, 240, 138, 0.8)`,
          }}
          animate={{
            opacity: [0.15, 0.9, 0.15],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Slow floating dust particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute w-1 h-1 rounded-full bg-rose-300/40"
          style={{
            left: `${(i * 7) % 100}%`,
            top: `${(i * 11) % 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-15, 15, -15],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
