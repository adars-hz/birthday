"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Confetti from "react-confetti";

export default function QuizGame() {
  const [showResult, setShowResult] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [yesScale, setYesScale] = useState(1);
  const [fakeButtons, setFakeButtons] = useState<{ id: number, x: number, y: number }[]>([]);

  const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 });
  const controls = useAnimation();

  useEffect(() => {
    setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const handleHoverNo = () => {
    if (!windowDimension.width) return;

    // Generate extreme random position across the entire viewport
    const randomX = (Math.random() - 0.5) * (windowDimension.width * 0.7);
    const randomY = (Math.random() - 0.5) * 400; // Keep within relative bounds

    setNoPosition({ x: randomX, y: randomY });

    // Make the YES button grow uncontrollably
    setYesScale(prev => Math.min(prev + 0.3, 5));

    // Spawn a fake "No" button flying in the opposite direction
    if (fakeButtons.length < 15) { // Cap at 15 to avoid crashing
      setFakeButtons(prev => [
        ...prev,
        { id: Date.now() + Math.random(), x: randomX * -1.5, y: randomY * -1.5 }
      ]);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#ff8c8c] via-purple-500 to-[#8a88cc] flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Dynamic Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`bg-${i}`}
            className="absolute bg-white/20 rounded-full"
            initial={{
              width: Math.random() * 50 + 10,
              height: Math.random() * 50 + 10,
              x: Math.random() * (windowDimension.width || 1000),
              y: Math.random() * (windowDimension.height || 1000),
            }}
            animate={{
              x: Math.random() * (windowDimension.width || 1000),
              y: Math.random() * (windowDimension.height || 1000),
              scale: [1, 2, 1],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {showResult && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={true}
          numberOfPieces={800}
          gravity={0.3}
        />
      )}

      <motion.div
        animate={{ rotate: showResult ? [0, -5, 5, -5, 0] : 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full glass p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.3)] text-white text-center z-10 relative"
      >
        {!showResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
          >
            <motion.h2
              animate={{ color: ["#ffffff", "#ffea00", "#ff8c8c", "#ffffff"] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-4xl md:text-5xl font-extrabold mb-12 drop-shadow-2xl tracking-tight"
            >
              Am I your best friend?
            </motion.h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 relative min-h-[350px] w-full perspective-1000">

              {/* THE ALMIGHTY YES BUTTON */}
              <motion.button
                onClick={() => setShowResult(true)}
                animate={{ scale: yesScale }}
                whileHover={{ scale: yesScale + 0.1, rotateZ: (Math.random() - 0.5) * 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="px-12 py-6 bg-gradient-to-r from-green-400 to-emerald-600 text-white font-black rounded-full text-3xl shadow-[0_0_30px_rgba(74,222,128,0.6)] z-30 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                YES!
              </motion.button>

              {/* The Original Runaway No Button */}
              <motion.button
                animate={{
                  x: noPosition.x,
                  y: noPosition.y,
                  rotateZ: Math.random() * 360,
                  rotateX: Math.random() * 180,
                  scale: Math.random() * 0.4 + 0.8
                }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                onHoverStart={handleHoverNo}
                onClick={handleHoverNo}
                className="px-10 py-4 bg-gradient-to-r from-red-500 to-rose-700 text-white font-bold rounded-full text-2xl shadow-2xl absolute top-48 md:relative md:top-auto z-40 border-4 border-red-300"
                style={{ left: "auto" }}
              >
                NO
              </motion.button>

              {/* The Fake Cloned No Buttons that distract you */}
              {fakeButtons.map((fake, i) => (
                <motion.button
                  key={fake.id}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    x: fake.x,
                    y: fake.y,
                    rotate: fake.x * 2
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  onAnimationComplete={() => {
                    setFakeButtons(prev => prev.filter(b => b.id !== fake.id));
                  }}
                  className="px-10 py-4 bg-red-400 text-white font-bold rounded-full text-xl absolute pointer-events-none z-20 blur-[1px]"
                >
                  NO
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.1, rotate: 180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.7, duration: 2 }}
          >
            <motion.h3
              animate={{ scale: [1, 1.1, 1], textShadow: ["0px 0px 0px #fff", "0px 0px 20px #ffea00", "0px 0px 0px #fff"] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl md:text-8xl font-black mb-6 text-yellow-300 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
            >
              I KNEW IT! 🥰
            </motion.h3>
            <p className="text-3xl font-extrabold mb-8 text-white drop-shadow-md">
              Thank you for being such an important part of my life. ❤️

              No matter where life takes us, I'll always cherish our friendship, our memories, and all the crazy moments we've shared together.
            </p>
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setShowResult(false); setNoPosition({ x: 0, y: 0 }); setYesScale(1); setFakeButtons([]); }}
              className="mt-4 px-10 py-4 bg-white text-[#8a88cc] rounded-full font-black text-2xl shadow-[0_0_40px_rgba(255,255,255,0.8)] transition-colors hover:bg-yellow-300 hover:text-red-500"
            >
              Play Again!
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
