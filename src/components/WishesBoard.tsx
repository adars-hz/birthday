"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "../data/content";
import { sound } from "../utils/audio";
import confetti from "canvas-confetti";
import { Sparkles, Heart, Trophy, Compass, Send, MessageSquareHeart } from "lucide-react";

interface Note {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export default function WishesBoard() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "note-1",
      sender: "Best Friend",
      text: "You make life 100x more fun, bright, and memorable. Thank you for being who you are!",
      timestamp: "Today",
    },
    {
      id: "note-2",
      sender: "Your Cheerleader",
      text: "May this upcoming year open doors you never even imagined. You deserve the absolute world!",
      timestamp: "Today",
    },
  ]);

  const [senderName, setSenderName] = useState("");
  const [messageText, setMessageText] = useState("");

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      sender: senderName.trim() || "A Special Friend",
      text: messageText.trim(),
      timestamp: "Just now",
    };

    setNotes([newNote, ...notes]);
    setSenderName("");
    setMessageText("");
    sound.playPop();

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#f59e0b", "#fb7185", "#c084fc"],
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Trophy":
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case "Heart":
        return <Heart className="w-5 h-5 text-rose-400" />;
      case "Compass":
        return <Compass className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-yellow-300" />;
    }
  };

  return (
    <section id="wishes-section" className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Title */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-rose-300 text-xs font-semibold mb-3 border-rose-500/30">
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>Birthday Pillars & Blessings</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold font-serif-luxury text-white tracking-tight">
          Heartfelt Wishes For You
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base mt-2 font-light">
          Celebrating your journey with blessings of joy, purpose, and genuine warmth
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {siteContent.wishes.map((wish, idx) => (
          <motion.div
            key={wish.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="glass-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group"
          >
            {/* Ambient hover top bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  {getIcon(wish.icon)}
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded-full bg-white/5">
                  {wish.tag}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 font-serif-luxury group-hover:text-amber-200 transition-colors">
                {wish.title}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                {wish.content}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-amber-300/80">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Special Wish</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Birthday Note Wall */}
      <div className="glass-luxury rounded-3xl p-6 sm:p-10 border border-white/10 max-w-4xl mx-auto shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-white">
              Birthday Wish Wall 💌
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm font-light mt-1">
              Leave a custom message or memorable thought for the birthday person
            </p>
          </div>
        </div>

        {/* Note input form */}
        <form onSubmit={handleAddNote} className="mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Your Name (e.g. Alex)"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400/50"
            />
            <input
              type="text"
              placeholder="Your heartfelt birthday wish..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400/50"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow hover:brightness-110 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Pin to Wish Wall</span>
            </button>
          </div>
        </form>

        {/* Pinned Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between hover:border-amber-400/30 transition-all"
              >
                <p className="text-zinc-200 text-sm leading-relaxed mb-4 font-light italic">
                  "{note.text}"
                </p>
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-white/5">
                  <span className="font-semibold text-amber-300">— {note.sender}</span>
                  <span>{note.timestamp}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
