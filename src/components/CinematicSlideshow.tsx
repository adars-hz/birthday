"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent, SlidePhoto } from "../data/content";
import { sound } from "../utils/audio";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  RotateCcw,
  Sparkles,
  Film,
  X,
  Check,
  Calendar,
} from "lucide-react";

const STORAGE_KEY = "birthday_custom_slideshow_v1";

export default function CinematicSlideshow() {
  const [slides, setSlides] = useState<SlidePhoto[]>(siteContent.slideshow.defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

  // New slide form state
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newDate, setNewDate] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideDuration = 6000; // 6 seconds per slide

  // Load customized slides from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlides(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load slides from localStorage", e);
    }
  }, []);

  // Save slides to localStorage whenever they change
  const saveSlides = (newSlides: SlidePhoto[]) => {
    setSlides(newSlides);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSlides));
    } catch (e) {
      console.warn("Could not save slides to localStorage", e);
    }
  };

  // Auto-play slideshow timer & progress bar
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;

    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / slideDuration) * 100;

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % slides.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, slides.length, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isManagerOpen) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isManagerOpen, slides.length]);

  const handleNext = () => {
    sound.playSlideClick();
    setSlideProgress(0);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    sound.playSlideClick();
    setSlideProgress(0);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Upload custom photo from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const newSlide: SlidePhoto = {
            id: `custom-${Date.now()}-${Math.random()}`,
            url: result,
            title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            caption: "Special memory added from your gallery",
            date: "Today",
          };
          saveSlides([...slides, newSlide]);
          sound.playPop();
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add slide via URL
  const handleAddSlideUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    const newSlide: SlidePhoto = {
      id: `custom-${Date.now()}`,
      url: newImageUrl.trim(),
      title: newTitle.trim() || "Cherished Memory",
      caption: newCaption.trim() || "A moment to remember forever.",
      date: newDate.trim() || "Special Moment",
    };

    saveSlides([...slides, newSlide]);
    setNewImageUrl("");
    setNewTitle("");
    setNewCaption("");
    setNewDate("");
    sound.playPop();
  };

  // Delete a slide
  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) {
      alert("You need at least 1 photo in your slideshow.");
      return;
    }
    const filtered = slides.filter((s) => s.id !== id);
    saveSlides(filtered);
    if (currentIndex >= filtered.length) {
      setCurrentIndex(0);
    }
  };

  // Reset to original default photos
  const handleResetDefaults = () => {
    if (confirm("Reset slideshow to original default photos?")) {
      saveSlides(siteContent.slideshow.defaultSlides);
      setCurrentIndex(0);
      setSlideProgress(0);
    }
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section id="slideshow-section" className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-amber-300 text-xs font-semibold mb-3 border-amber-500/30">
            <Film className="w-3.5 h-3.5" />
            <span>Interactive Memory Video Reel</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-serif-luxury tracking-tight text-zinc-100">
            {siteContent.slideshow.title}
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 font-light max-w-xl">
            {siteContent.slideshow.subtitle}
          </p>
        </div>

        {/* Change / Add Images Button */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setIsManagerOpen(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 rounded-full glass-luxury-gold text-amber-200 text-sm font-semibold flex items-center gap-2 shadow-lg border border-amber-400/40 hover:border-amber-300 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-amber-300" />
            <span>Add & Change Photos</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </motion.button>
        </div>
      </div>

      {/* Main Cinematic Video Player Frame */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-3xl overflow-hidden glass-luxury border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] group ${
          isFullscreen ? "h-screen rounded-none border-none" : "aspect-[16/10] sm:aspect-[16/9] max-h-[720px]"
        }`}
      >
        {/* Subtle cinematic lens flare glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

        {/* Active Slide Image with Ken Burns Pan/Zoom Effect */}
        <AnimatePresence mode="wait">
          {currentSlide && (
            <motion.div
              key={currentSlide.id + currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden"
            >
              <img
                src={currentSlide.url}
                alt={currentSlide.title}
                className={`w-full h-full object-cover select-none ${
                  currentIndex % 2 === 0 ? "ken-burns-in" : "ken-burns-out"
                }`}
                onError={(e) => {
                  // Fallback
                  (e.currentTarget as HTMLImageElement).src = "/images/photo1.jpg";
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Video Reel Overlay Badge */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-red-500 animate-ping" : "bg-zinc-500"}`} />
            <span className="tracking-widest uppercase text-[10px]">REEL PLAYBACK</span>
          </div>

          {currentSlide?.date && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs text-amber-300">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{currentSlide.date}</span>
            </div>
          )}
        </div>

        {/* Top-Right Fullscreen / Slide Counter */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono text-zinc-300">
            <span className="text-amber-300 font-bold">{String(currentIndex + 1).padStart(2, "0")}</span>
            <span className="text-zinc-500 mx-1">/</span>
            <span>{String(slides.length).padStart(2, "0")}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white hover:bg-black/80 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Left & Right Slide Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white/80 hover:text-white border border-white/10 hover:border-amber-400/50 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white/80 hover:text-white border border-white/10 hover:border-amber-400/50 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Bottom Captions & Media Controls */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-6 sm:p-8 flex flex-col gap-4">
          {/* Animated Slide Progress Bar */}
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden backdrop-blur-sm cursor-pointer">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${slideProgress}%` }}
            />
          </div>

          {/* Caption text & Play/Pause controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl"
              >
                <h3 className="text-xl sm:text-3xl font-bold font-serif-luxury text-white drop-shadow-md">
                  {currentSlide?.title}
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm mt-1 leading-relaxed line-clamp-2 drop-shadow">
                  {currentSlide?.caption}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Video Controls Bar */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:brightness-110 transition-all"
                title={isPlaying ? "Pause Slideshow (Spacebar)" : "Play Slideshow (Spacebar)"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
                <span>{isPlaying ? "Pause" : "Play Reel"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Thumbnail Strip */}
      <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => {
              sound.playSlideClick();
              setCurrentIndex(idx);
              setSlideProgress(0);
            }}
            className={`relative rounded-xl overflow-hidden shrink-0 w-20 sm:w-28 aspect-video border-2 transition-all ${
              currentIndex === idx
                ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105"
                : "border-white/10 opacity-50 hover:opacity-100 hover:border-white/30"
            }`}
          >
            <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-1 right-1 text-[9px] font-mono font-bold text-white px-1 rounded bg-black/60">
              {idx + 1}
            </div>
          </button>
        ))}

        <button
          onClick={() => setIsManagerOpen(true)}
          className="rounded-xl shrink-0 w-20 sm:w-28 aspect-video border-2 border-dashed border-white/20 hover:border-amber-400/60 text-zinc-400 hover:text-amber-300 flex flex-col items-center justify-center gap-1 transition-all bg-white/[0.02]"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px] font-medium">Add Photo</span>
        </button>
      </div>

      {/* Image Manager & Customizer Modal */}
      <AnimatePresence>
        {isManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl max-h-[90vh] glass-luxury rounded-3xl border border-amber-500/30 shadow-2xl flex flex-col overflow-hidden bg-[#0c0d15]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif-luxury text-white">Customize Slideshow Photos</h3>
                    <p className="text-zinc-400 text-xs">Upload new photos from your phone or PC, or manage existing memories</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsManagerOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-8 flex-1">
                {/* Method 1: Upload from Device */}
                <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.03]">
                  <h4 className="text-sm font-bold text-amber-200 mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload Images from Device (Phone / PC)</span>
                  </h4>
                  <p className="text-xs text-zinc-400 mb-4">
                    Select one or more pictures from your photos. They will immediately appear in your slideshow video reel!
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="photo-upload-input"
                  />
                  <label
                    htmlFor="photo-upload-input"
                    className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold text-sm shadow hover:brightness-110 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Photos to Add</span>
                  </label>
                </div>

                {/* Method 2: Add via Image URL */}
                <form onSubmit={handleAddSlideUrl} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <h4 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Or Add an Image via Web Link</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input
                      type="url"
                      placeholder="Paste Image URL (https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Memory Title (e.g. Birthday Trip)"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Caption / Short Story"
                      value={newCaption}
                      onChange={(e) => setNewCaption(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
                    />
                    <input
                      type="text"
                      placeholder="Date / Occasion tag"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl glass-card hover:bg-white/10 text-amber-300 text-xs font-bold border-amber-400/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Slideshow</span>
                  </button>
                </form>

                {/* List of current slides */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-zinc-200">Current Reel Photos ({slides.length})</h4>
                    <button
                      onClick={handleResetDefaults}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Original Defaults</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {slides.map((slide, i) => (
                      <div
                        key={slide.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-white/10 bg-white/[0.03] group hover:border-amber-500/30 transition-all"
                      >
                        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                          <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{slide.title}</p>
                          <p className="text-[11px] text-zinc-400 truncate">{slide.caption}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Changes are saved automatically</span>
                </span>
                <button
                  onClick={() => setIsManagerOpen(false)}
                  className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
