"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { siteContent } from "../data/content";

export default function Hero({ name = siteContent.hero.name, onSurpriseClick }: { name?: string, onSurpriseClick?: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(1);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setCurrentPhoto((prev) => (prev % 4) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
  };

  const balloonVariants: any = {
    animate: (custom: number) => ({
      y: ["-10px", "10px", "-10px"],
      x: ["-5px", "5px", "-5px"],
      rotate: [-5, 5, -5],
      transition: {
        duration: 3 + custom,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <section className="relative min-h-screen flex flex-col bg-[#ffe6e1] overflow-hidden font-sans pb-16">
      {/* Decorative Confetti Background */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${i % 3 === 0 ? "bg-[#ff8c8c]" : i % 2 === 0 ? "bg-[#8a88cc]" : "bg-teal-400"
                }`}
              initial={{
                width: Math.random() * 8 + 4 + "px",
                height: Math.random() * 8 + 4 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: 0,
                scale: 0,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0.5],
                y: [0, Math.random() * 100 - 50],
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 5 + 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
          {/* Rectangular Confetti */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`rect-${i}`}
              className="absolute bg-[#ff8c8c] rounded-sm"
              initial={{
                width: Math.random() * 12 + 6 + "px",
                height: Math.random() * 4 + 4 + "px",
                top: Math.random() * -20 + "%",
                left: Math.random() * 100 + "%",
                opacity: 0.8,
              }}
              animate={{
                top: "120%",
                rotate: 720,
                x: Math.random() * 100 - 50,
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 flex-1 flex flex-col md:flex-row items-center justify-between w-full">

        {/* Left Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full md:w-1/2 flex flex-col items-start pt-10 md:pt-0"
        >
          <motion.h2 variants={itemVariants} className="text-2xl md:text-4xl font-bold text-[#333] mb-2">{name}'s</motion.h2>

          <motion.div variants={itemVariants} className="flex items-center text-[#8a88cc] font-bold text-5xl md:text-8xl tracking-wider mb-4" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
            <motion.span
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-[#333] font-light mr-4 origin-bottom"
            >
              {'{'}
            </motion.span>
            Birthday
            <motion.span
              animate={{ rotate: [10, -10, 10] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-[#333] font-light ml-4 origin-bottom"
            >
              {'}'}
            </motion.span>
          </motion.div>

          <motion.h3 variants={itemVariants} className="text-xl md:text-3xl font-bold text-[#333] mb-6 tracking-wide">{siteContent.hero.dateText}</motion.h3>

          <motion.p variants={itemVariants} className="text-[#444] text-base md:text-lg leading-relaxed max-w-lg font-medium mb-10">
            {siteContent.hero.message}
          </motion.p>

          <motion.button
            onClick={onSurpriseClick}
            variants={itemVariants}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(138, 136, 204, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#8a88cc] text-white px-8 py-3 rounded-full shadow-lg font-semibold text-lg hover:bg-[#7b78bd] transition-colors"
          >
            {siteContent.hero.buttonText}
          </motion.button>
        </motion.div>

        {/* Right Content - Photo and Balloons */}
        <div className="w-full md:w-1/2 flex justify-center items-center mt-16 md:mt-0 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 60, delay: 0.4 }}
            className="relative"
          >
            {/* The circular photo frame with continuous breathing animation */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-72 h-72 md:w-96 md:h-96 rounded-full border-[12px] border-[#aab1e6] overflow-hidden shadow-2xl relative z-10 bg-white"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-xl cursor-pointer overflow-hidden relative"
              >
                {/* Image carousel */}
                {siteContent.hero.photos.map((photoSrc, index) => (
                  <img
                    key={index}
                    src={photoSrc}
                    alt={`Photo ${index + 1}`}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${currentPhoto === index + 1 ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Decorative Balloons with complex swaying */}
            <motion.div
              custom={0} variants={balloonVariants} animate="animate"
              className="absolute -top-10 -left-10 w-24 h-32 bg-[#ff8c8c] rounded-[50%] shadow-lg z-20 flex flex-col items-center"
            >
              <div className="w-1 h-12 bg-gray-400 absolute -bottom-10 origin-top"></div>
              <div className="absolute top-2 left-3 w-4 h-8 bg-white/40 rounded-full rotate-[-20deg]"></div>
            </motion.div>

            <motion.div
              custom={1} variants={balloonVariants} animate="animate"
              className="absolute -top-4 -right-12 w-28 h-36 bg-[#ff8c8c] rounded-[50%] shadow-lg z-20 flex flex-col items-center"
            >
              <div className="w-1 h-16 bg-gray-400 absolute -bottom-14 origin-top"></div>
              <div className="absolute top-3 left-4 w-5 h-10 bg-white/40 rounded-full rotate-[-20deg]"></div>
            </motion.div>

            <motion.div
              custom={0.5} variants={balloonVariants} animate="animate"
              className="absolute bottom-10 -left-16 w-20 h-24 bg-[#ffad8c] rounded-[50%] shadow-lg z-20 flex flex-col items-center"
            >
              <div className="w-1 h-10 bg-gray-400 absolute -bottom-8 origin-top"></div>
              <div className="absolute top-2 left-2 w-3 h-6 bg-white/40 rounded-full rotate-[-20deg]"></div>
            </motion.div>

            <motion.div
              custom={1.5} variants={balloonVariants} animate="animate"
              className="absolute bottom-16 -right-16 w-20 h-24 bg-[#ffad8c] rounded-[50%] shadow-lg z-20 flex flex-col items-center"
            >
              <div className="w-1 h-12 bg-gray-400 absolute -bottom-10 origin-top"></div>
              <div className="absolute top-2 left-2 w-3 h-6 bg-white/40 rounded-full rotate-[-20deg]"></div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Plaid Pattern with Parallax */}
      <motion.div
        style={{ x: y2 }}
        className="absolute bottom-0 w-[200%] -left-[50%] h-16 plaid-pattern z-20 opacity-90"
      ></motion.div>
    </section>
  );
}
