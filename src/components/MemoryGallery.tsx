"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { siteContent } from "../data/content";

const photos = siteContent.memoryGallery.photos;

export default function MemoryGallery() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <section className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-800 mb-16">{siteContent.memoryGallery.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              layoutId={`photo-${photo.id}`}
              onClick={() => setSelectedId(photo.id)}
              className={`${photo.color} ${photo.height} w-full rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-shadow relative overflow-hidden group`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                <span className="text-white font-bold text-xl">{photo.title}</span>
              </div>
              {photo.image && (
                <img 
                  src={photo.image} 
                  alt={photo.title} 
                  className="w-full h-full object-cover absolute inset-0" 
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {selectedId !== null && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={`photo-${selectedId}`}
              className={`${photos.find(p => p.id === selectedId)?.color} w-full max-w-4xl aspect-[4/5] md:aspect-video rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden`}
            >
              {photos.find(p => p.id === selectedId)?.image && (
                <img 
                  src={photos.find(p => p.id === selectedId)?.image} 
                  className="w-full h-full object-cover absolute inset-0" 
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
              <button className="absolute top-3 right-3 md:top-6 md:right-6 text-white bg-black/30 hover:bg-black/50 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-colors z-20">
                ✕
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
