/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SlidersHorizontal, Palette, Calendar, PlusCircle, Sparkles, Filter } from 'lucide-react';
import { GalleryItem } from '../types';

interface GalleryViewProps {
  galleryItems: GalleryItem[];
  onStartNewDream: () => void;
  onSyncDream?: (item: GalleryItem) => void;
}

export default function GalleryView({ galleryItems, onStartNewDream, onSyncDream }: GalleryViewProps) {
  const [selectedVibe, setSelectedVibe] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Shimmer colors mapping for custom overlay effects
  const vibes = ['all', 'lucid', 'fluid', 'calm', 'pastel', 'energetic', 'ambient', 'soft', 'expansive'];

  const filteredItems = galleryItems.filter(item => {
    const matchesVibe = selectedVibe === 'all' || item.vibe === selectedVibe;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesVibe && matchesSearch;
  });

  return (
    <div className="relative flex-grow flex flex-col h-full overflow-y-auto pt-24 pb-32 px-6 md:px-16 max-w-[1920px] mx-auto z-10" id="gallery-view">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8 relative">
        <div className="flex flex-col gap-6 w-full lg:w-auto">
          {/* Decorative faint background title */}
          <h1 className="hidden md:block font-display text-8xl text-purple-600/5 tracking-tighter absolute -top-12 -left-4 select-none pointer-events-none">
            Aetheria
          </h1>
          <h2 className="font-display text-4xl md:text-5xl text-purple-950 font-semibold tracking-tight relative z-10">
            Synthesis Gallery
          </h2>

          {/* Search bar & filters combined */}
          <div className="flex flex-wrap items-center gap-3 z-10">
            <div className="flex items-center bg-white/30 hover:bg-white/50 border border-white/50 rounded-full px-4 py-2 transition-all duration-300">
              <Filter className="w-3.5 h-3.5 text-purple-700/60 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dream syntheses..."
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs text-purple-950 placeholder-purple-900/40 w-44 font-sans font-medium"
              />
            </div>

            {/* Vibe Filter selector */}
            <div className="flex items-center gap-1 bg-white/30 border border-white/50 rounded-full p-1.5 backdrop-blur-md">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-700/60 ml-2 mr-1" />
              <select
                value={selectedVibe}
                onChange={(e) => setSelectedVibe(e.target.value)}
                className="bg-transparent border-none text-[10px] text-purple-950 font-bold uppercase tracking-wider outline-none focus:ring-0 cursor-pointer pr-5 py-0.5"
              >
                {vibes.map(v => (
                  <option key={v} value={v} className="bg-white/95 text-purple-950 font-bold uppercase tracking-widest text-[10px]">
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Holographic CTA Button to start a new dream */}
        <button
          onClick={onStartNewDream}
          className="group relative z-10 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 via-pink-400 to-sky-400 p-[1px] shadow-[0_4px_20px_rgba(167,139,250,0.3)] hover:shadow-[0_4px_30px_rgba(167,139,250,0.6)] hover:-translate-y-0.5 transition-all duration-500 flex-shrink-0"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></span>
          <div className="bg-white/40 group-hover:bg-white/10 backdrop-blur-md rounded-full px-7 py-3.5 flex items-center gap-2 transition-colors">
            <PlusCircle className="w-5 h-5 text-purple-950 group-hover:text-white transition-colors" />
            <span className="text-xs font-bold text-purple-950 group-hover:text-white uppercase tracking-wider font-sans">
              Start a New Dream
            </span>
          </div>
        </button>
      </div>

      {/* Fluid Masonry/Bento Grid Layout */}
      {filteredItems.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center p-12 bg-white/20 border border-white/40 rounded-3xl backdrop-blur-lg">
          <Sparkles className="w-10 h-10 text-purple-400 mb-3 animate-pulse" />
          <p className="font-display text-lg text-purple-950 font-semibold mb-1">No syntheses match your vibe</p>
          <p className="font-sans text-xs text-purple-950/60">Try clearing filters or whisper a new thought into Aetheria!</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 w-full">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="break-inside-avoid relative group rounded-3xl overflow-hidden bg-white/30 backdrop-blur-2xl shadow-md hover:shadow-[0_0_35px_rgba(219,184,255,0.45)] border border-white/40 hover:border-white transition-all duration-500 transform hover:-translate-y-1"
            >
              <div className="relative w-full overflow-hidden aspect-[4/5]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  // Gradient fallback if image is loading or offline
                  <div
                    className="w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{ background: item.gradient }}
                  />
                )}
                {/* Overlay soft gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/90 via-purple-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <p className="text-xs text-purple-100 font-medium line-clamp-3 mb-3">
                    {item.description}
                  </p>
                  {onSyncDream && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSyncDream(item);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-white/20 hover:bg-white/45 text-white border border-white/30 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 backdrop-blur-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>Project to Canvas</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Text metadata footer content panel */}
              <div className="p-6 relative bg-white/20 backdrop-blur-xl border-t border-white/40 group-hover:bg-white/40 transition-colors duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg md:text-xl text-purple-950 font-bold group-hover:text-purple-700 transition-colors">
                    {item.title}
                  </h3>
                  <span className="font-mono text-[9px] text-purple-700/60 font-semibold uppercase tracking-wider">
                    {item.date}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={`${item.id}-tag-${idx}`}
                      className="bg-purple-600/10 backdrop-blur-md border border-white/40 rounded-full px-3 py-1 text-[10px] font-bold text-purple-800 tracking-wider uppercase font-sans"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="bg-pink-500/10 backdrop-blur-md border border-white/40 rounded-full px-3 py-1 text-[10px] font-bold text-pink-700 tracking-wider uppercase font-sans">
                    {item.vibe}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Shimmer animation CSS */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%) skewX(12deg); }
        }
      `}</style>
    </div>
  );
}
