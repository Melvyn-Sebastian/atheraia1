/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, Wind, Moon, Activity } from 'lucide-react';
import { DreamFragment } from '../types';

interface FlowStateViewProps {
  partnerFrequency: string;
  fragments: DreamFragment[];
  onWhisper: (text: string, speakerName?: string) => Promise<void>;
  isWhispering: boolean;
  onBack: () => void;
  selectedVibe?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

interface Ripple {
  x: number;
  y: number;
  size: number;
  maxSize: number;
  color: string;
  alpha: number;
}

const VIBE_COLORS: Record<string, string[]> = {
  lucid: ['#D946EF', '#C084FC', '#818CF8'],
  fluid: ['#818CF8', '#A78BFA', '#F472B6'],
  calm: ['#2DD4BF', '#38BDF8', '#818CF8'],
  pastel: ['#F472B6', '#FBCFE8', '#FDE047'],
  energetic: ['#EC4899', '#F43F5E', '#FB923C'],
  ambient: ['#A78BFA', '#F472B6', '#38BDF8'],
  soft: ['#F472B6', '#E9D5FF', '#FDF2F8'],
  expansive: ['#38BDF8', '#60A5FA', '#C084FC']
};

export default function FlowStateView({
  partnerFrequency,
  fragments,
  onWhisper,
  isWhispering,
  onBack,
  selectedVibe = 'fluid'
}: FlowStateViewProps) {
  const [inputText, setInputText] = useState('');
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });

  // Cycle the breathing guide
  useEffect(() => {
    let active = true;
    const cycleBreathing = async () => {
      while (active) {
        setBreathPhase('Inhale');
        await new Promise((resolve) => setTimeout(resolve, 4000));
        if (!active) break;
        setBreathPhase('Hold');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (!active) break;
        setBreathPhase('Exhale');
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    };
    cycleBreathing();
    return () => {
      active = false;
    };
  }, []);

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      if (canvas && containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Initial particles
    const themeColors = VIBE_COLORS[selectedVibe] || VIBE_COLORS.fluid;
    particlesRef.current = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.2 - Math.random() * 0.8,
      size: 1 + Math.random() * 3,
      color: themeColors[Math.floor(Math.random() * themeColors.length)],
      alpha: 0.2 + Math.random() * 0.6
    }));

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const colors = VIBE_COLORS[selectedVibe] || VIBE_COLORS.fluid;

      // Update and draw particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Spawn gentle wind force from mouse
        const dx = p.x - mousePosRef.current.x;
        const dy = p.y - mousePosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.05;
          p.vy += (dy / dist) * force * 0.05;
        }

        // Apply friction
        p.vx *= 0.98;
        if (p.vy > -0.1) p.vy -= 0.02;

        // Reset if offscreen
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
          p.vx = (Math.random() - 0.5) * 0.5;
          p.vy = -0.2 - Math.random() * 0.8;
          p.alpha = 0.2 + Math.random() * 0.6;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      // Update and draw ripples
      ripplesRef.current = ripplesRef.current.filter((r) => {
        r.size += 3;
        r.alpha -= 0.015;

        if (r.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = r.color;
        ctx.stroke();
        ctx.restore();

        return true;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [selectedVibe]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const colors = VIBE_COLORS[selectedVibe] || VIBE_COLORS.fluid;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Add ripple
    ripplesRef.current.push({
      x,
      y,
      size: 5,
      maxSize: 150,
      color: randomColor,
      alpha: 0.8
    });

    // Burst particles
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0
      });
    }

    // Keep particles length in check
    if (particlesRef.current.length > 150) {
      particlesRef.current.splice(0, particlesRef.current.length - 150);
    }
  };

  const handleSendWhisper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isWhispering) return;

    const text = inputText.trim();
    setInputText('');

    // Trigger local massive burst at center
    const colors = VIBE_COLORS[selectedVibe] || VIBE_COLORS.fluid;
    const canvas = canvasRef.current;
    if (canvas) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ripplesRef.current.push({
        x: cx,
        y: cy,
        size: 10,
        maxSize: 300,
        color: '#E9D5FF',
        alpha: 1.0
      });

      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0
        });
      }
    }

    await onWhisper(text, 'User A');
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className="absolute inset-0 z-50 flex flex-col justify-between items-center py-8 px-6 overflow-hidden cursor-crosshair select-none bg-black/10 backdrop-blur-[1px]"
      id="flow-state-workspace"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Floating Header */}
      <div className="w-full flex justify-between items-center z-10 max-w-7xl">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/35 text-purple-950 font-bold text-xs tracking-wider uppercase border border-white/40 shadow-sm backdrop-blur-md transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-purple-900" />
          <span>Exit Flow</span>
        </button>

        <div className="text-right">
          <div className="font-mono text-[10px] text-purple-900/60 font-black tracking-widest uppercase">
            Resonance Path
          </div>
          <div className="font-mono text-xs font-bold text-purple-850 bg-white/30 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
            {partnerFrequency}
          </div>
        </div>
      </div>

      {/* Central Interactive Breathing Guide / Concentric Glowing Orbs */}
      <div className="flex flex-col items-center justify-center z-10 text-center pointer-events-none">
        <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
          {/* Outer expansion pulsing border */}
          <div
            className={`absolute inset-0 rounded-full bg-purple-400/10 border border-purple-300/30 transition-all duration-[4000s] ease-in-out ${
              breathPhase === 'Inhale' ? 'scale-110 opacity-70Blur' : breathPhase === 'Hold' ? 'scale-105 opacity-90' : 'scale-90 opacity-30'
            }`}
            style={{
              transform: breathPhase === 'Inhale' ? 'scale(1.2)' : breathPhase === 'Hold' ? 'scale(1.15)' : 'scale(0.85)',
              transition: 'transform 4s ease-in-out, opacity 4s ease-in-out',
              boxShadow: '0 0 60px rgba(167, 139, 250, 0.15)'
            }}
          />

          {/* Medium dynamic blur ring */}
          <div
            className={`absolute inset-6 rounded-full bg-gradient-to-tr from-pink-300/20 via-purple-300/20 to-sky-300/20 backdrop-blur-sm border border-white/20`}
            style={{
              transform: breathPhase === 'Inhale' ? 'scale(1.1)' : breathPhase === 'Hold' ? 'scale(1.08)' : 'scale(0.9)',
              transition: 'transform 4s ease-in-out',
              boxShadow: '0 0 40px rgba(244, 114, 182, 0.1)'
            }}
          />

          {/* Core breathing sphere */}
          <div
            className={`absolute inset-16 rounded-full bg-gradient-to-tr from-purple-400/50 via-white/80 to-pink-300/50 border border-white flex flex-col items-center justify-center shadow-lg transition-transform`}
            style={{
              transform: breathPhase === 'Inhale' ? 'scale(1.15)' : breathPhase === 'Hold' ? 'scale(1.1)' : 'scale(0.85)',
              transition: 'transform 4s ease-in-out, box-shadow 4s ease-in-out',
              boxShadow: breathPhase === 'Hold' 
                ? '0 0 50px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(255,255,255,0.8)' 
                : '0 0 30px rgba(168, 85, 247, 0.25)'
            }}
          >
            <Activity className="w-8 h-8 text-purple-700/80 mb-2 animate-pulse" />
            <span className="font-display text-xl font-extrabold text-purple-950 tracking-wide uppercase transition-all duration-500">
              {breathPhase}
            </span>
            <span className="text-[9px] font-mono tracking-widest text-purple-950/60 font-bold uppercase mt-1">
              {breathPhase === 'Inhale' ? 'Breathe In' : breathPhase === 'Hold' ? 'Retain Essence' : 'Let it Drift'}
            </span>
          </div>
        </div>

        {/* Informative Subtext */}
        <h2 className="font-display text-2xl font-bold text-purple-950 mt-8 mb-2 drop-shadow-sm">
          Aetheria Fluid Space
        </h2>
        <p className="font-sans text-xs text-purple-950/70 max-w-sm leading-relaxed">
          Tap the screen to ripple thoughts and trigger sparkly bursts. Breathe in sync with the expanding light orb to harmonize.
        </p>
      </div>

      {/* Floating Clouds of Dream Fragments */}
      <div className="absolute inset-x-0 top-1/4 h-24 pointer-events-none overflow-hidden z-0">
        <div className="relative w-full h-full">
          {fragments.map((frag, idx) => (
            <div
              key={`float-frag-${frag.id}`}
              className="absolute bg-white/25 border border-white/40 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm text-xs text-purple-950 font-medium whitespace-nowrap animate-[floatCloud_30s_linear_infinite]"
              style={{
                top: `${(idx * 30) % 70}px`,
                animationDelay: `${idx * 6}s`,
                left: '-250px',
                // Custom floating speed
                animationDuration: `${25 + idx * 8}s`,
                boxShadow: '0 4px 20px rgba(111, 80, 146, 0.05)'
              }}
            >
              <span className="inline-block mr-2 text-[10px] font-bold tracking-widest uppercase text-purple-700 bg-purple-100/50 px-2 py-0.5 rounded-full">
                {frag.type}
              </span>
              "{frag.text}"
            </div>
          ))}
        </div>
      </div>

      {/* Floating Pill Whisper submission form at the bottom */}
      <div className="w-full max-w-xl z-10 px-4">
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            handleSendWhisper(e);
          }}
          onClick={(e) => e.stopPropagation()} // Stop click ripple when clicking input
          className="relative flex items-center bg-white/35 hover:bg-white/50 focus-within:bg-white/45 border border-white/50 focus-within:border-white shadow-[0_10px_35px_rgba(111,80,146,0.06)] rounded-full px-5 py-2 transition-all duration-300 backdrop-blur-xl"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isWhispering}
            placeholder="Whisper a new dream thought into the flow..."
            className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-xs md:text-sm text-purple-950 placeholder-purple-950/40 font-medium pr-4"
          />
          <button
            type="submit"
            disabled={isWhispering || !inputText.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes floatCloud {
          0% {
            transform: translateX(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 300px));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
