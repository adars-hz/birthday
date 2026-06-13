"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import InteractiveGift from "@/components/InteractiveGift";
import MemoryGallery from "@/components/MemoryGallery";
import QuizGame from "@/components/QuizGame";

export default function Home() {
  const [showSurprise, setShowSurprise] = useState(false);

  const handleSurpriseClick = () => {
    setShowSurprise(true);
    // After rendering the components, scroll to the gift section
    setTimeout(() => {
      const giftSection = document.getElementById("gift-section");
      if (giftSection) {
        giftSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <main className={`bg-slate-50 min-h-screen ${!showSurprise ? "overflow-hidden h-screen" : ""}`}>
      <Hero onSurpriseClick={handleSurpriseClick} />
      
      {showSurprise && (
        <div className="fade-in">
          <InteractiveGift />
          <MemoryGallery />
          <QuizGame />
        </div>
      )}
    </main>
  );
}
