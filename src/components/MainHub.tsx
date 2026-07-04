/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import {
  Send,
  Sparkles,
  HelpCircle,
  Network,
  Activity,
  MessageSquare,
  Flame,
  Shuffle,
  Volume2,
  Zap,
  CheckCircle2,
  Cpu,
  User,
  Plus
} from 'lucide-react';
import { DreamFragment, DreamNode, DreamAction, GalleryItem } from '../types';

interface MainHubProps {
  userName: string;
  partnerName: string;
  partnerFrequency: string;
  fragments: DreamFragment[];
  nodes: DreamNode[];
  history: DreamAction[];
  galleryItems: GalleryItem[];
  onWhisper: (text: string, speakerName?: string) => Promise<void>;
  isWhispering: boolean;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  selectedVibe?: string;
  entropySpeed?: number;
  canvasMode?: 'flow' | 'crystalline';
  activeNodeId?: string;
  users?: string[];
  onUpdateAesthetic?: (vibe: string, speed: number, mode: 'flow' | 'crystalline') => void;
  onSelectNodeId?: (id: string) => void;
}

// Dynamic Lucide Icon utility
export function LucideIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

// Synesthesia Vibe configuration
interface VibeAesthetic {
  gradient: string;
  colors: string[];
  glowColor: string;
  speed: string;
  frequency: string;
  vibeLabel: string;
  description: string;
}

const VIBE_AESTHETICS: Record<string, VibeAesthetic> = {
  lucid: {
    gradient: 'from-purple-400 via-fuchsia-500 to-indigo-500',
    colors: ['#C084FC', '#E879F9', '#818CF8'],
    glowColor: 'rgba(192, 132, 252, 0.4)',
    speed: '8s',
    frequency: '528 Hz (Transformation)',
    vibeLabel: 'LUCID AURA',
    description: 'Vivid purple/magenta gradients representing heightened consciousness.'
  },
  fluid: {
    gradient: 'from-teal-300 via-blue-400 to-indigo-400',
    colors: ['#5EEAD4', '#60A5FA', '#818CF8'],
    glowColor: 'rgba(94, 234, 212, 0.4)',
    speed: '12s',
    frequency: '432 Hz (Cosmic Harmony)',
    vibeLabel: 'FLUID DRIFT',
    description: 'Slow-rolling cyan and periwinkle curves echoing the backwards stream.'
  },
  calm: {
    gradient: 'from-pink-300 via-rose-300 to-orange-200',
    colors: ['#FBCFE8', '#FECDD3', '#FED7AA'],
    glowColor: 'rgba(251, 207, 232, 0.35)',
    speed: '16s',
    frequency: '396 Hz (Liberation)',
    vibeLabel: 'CALMING LIGHT',
    description: 'Warm pastel peach and rose tones creating a peaceful meditative space.'
  },
  energetic: {
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    colors: ['#FBBF24', '#F97316', '#F43F5E'],
    glowColor: 'rgba(251, 191, 36, 0.45)',
    speed: '6s',
    frequency: '639 Hz (Resonance)',
    vibeLabel: 'ENERGY EMISSION',
    description: 'Swiftly mutating hot-amber shards and solar lens-flare ripples.'
  },
  ambient: {
    gradient: 'from-slate-700 via-purple-900 to-pink-900',
    colors: ['#475569', '#581C87', '#831843'],
    glowColor: 'rgba(139, 92, 246, 0.3)',
    speed: '20s',
    frequency: '741 Hz (Intuition)',
    vibeLabel: 'DEEP AMBIENCE',
    description: 'Slow-evolving shadow violet tones whispering sub-harmonic frequencies.'
  },
  soft: {
    gradient: 'from-emerald-200 via-teal-300 to-sky-300',
    colors: ['#A7F3D0', '#99F6E4', '#BAE6FD'],
    glowColor: 'rgba(167, 243, 208, 0.3)',
    speed: '14s',
    frequency: '285 Hz (Healing Aura)',
    vibeLabel: 'SOFT DEW',
    description: 'Pristine light-mint and silver-white mist blobs floating lazily.'
  },
  expansive: {
    gradient: 'from-sky-300 via-pink-200 to-indigo-300',
    colors: ['#7DD3FC', '#FBCFE8', '#C7D2FE'],
    glowColor: 'rgba(125, 211, 252, 0.35)',
    speed: '10s',
    frequency: '852 Hz (Spiritual Order)',
    vibeLabel: 'EXPANSIVE REALM',
    description: 'Delicate iridescent fields expanding outwards into multidimensional space.'
  }
};

export default function MainHub(props: MainHubProps) {
  const {
    userName,
    partnerName,
    partnerFrequency,
    fragments,
    nodes,
    history,
    galleryItems,
    onWhisper,
    isWhispering,
    onUpdateNodePosition,
    users = []
  } = props;

  // Input & Sender selection states
  const [inputText, setInputText] = useState('');
  const [senderMode, setSenderMode] = useState<'user' | 'partner'>('user');
  const [autoPilot, setAutoPilot] = useState(true);
  const [lastWhisperSent, setLastWhisperSent] = useState('');

  // Interactive Live Canvas states (fallbacks)
  const [localSelectedVibe, setLocalSelectedVibe] = useState<string>('fluid');
  const [localEntropySpeed, setLocalEntropySpeed] = useState<number>(1.0);
  const [localCanvasMode, setLocalCanvasMode] = useState<'flow' | 'crystalline'>('flow');
  const [localActiveNodeId, setLocalActiveNodeId] = useState<string>('node-nexus');

  // Synchronize state with props if provided
  const selectedVibe = props.selectedVibe || localSelectedVibe;
  const entropySpeed = props.entropySpeed !== undefined ? props.entropySpeed : localEntropySpeed;
  const canvasMode = props.canvasMode || localCanvasMode;
  const activeNodeId = props.activeNodeId || localActiveNodeId;

  const changeSelectedVibe = (vibe: string) => {
    setLocalSelectedVibe(vibe);
    if (props.onUpdateAesthetic) {
      props.onUpdateAesthetic(vibe, entropySpeed, canvasMode);
    }
  };

  const changeEntropySpeed = (speed: number) => {
    setLocalEntropySpeed(speed);
    if (props.onUpdateAesthetic) {
      props.onUpdateAesthetic(selectedVibe, speed, canvasMode);
    }
  };

  const changeCanvasMode = (mode: 'flow' | 'crystalline') => {
    setLocalCanvasMode(mode);
    if (props.onUpdateAesthetic) {
      props.onUpdateAesthetic(selectedVibe, entropySpeed, mode);
    }
  };

  const changeActiveNodeId = (id: string) => {
    setLocalActiveNodeId(id);
    if (props.onSelectNodeId) {
      props.onSelectNodeId(id);
    }
  };

  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Multi-tab panel toggle
  const [activeTab, setActiveTab] = useState<'tree' | 'whispers'>('tree');
  const miniCanvasRef = useRef<HTMLDivElement>(null);
  const draggingNodeIdRef = useRef<string | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const nodeStartCoordsRef = useRef({ x: 0, y: 0 });

  const particleIdRef = useRef(0);
  const rippleIdRef = useRef(0);

  // Sync Vibe state automatically based on the latest AI generation
  useEffect(() => {
    if (galleryItems && galleryItems.length > 0) {
      const latestVibe = galleryItems[0].vibe;
      if (VIBE_AESTHETICS[latestVibe]) {
        changeSelectedVibe(latestVibe);
      }
    }
  }, [galleryItems]);

  // Floating particles loop
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * entropySpeed,
            y: p.y + p.vy * entropySpeed - 1.2 * entropySpeed, // slow float upward
            alpha: p.alpha - 0.015
          }))
          .filter((p) => p.alpha > 0)
      );
    }, 45);
    return () => clearInterval(interval);
  }, [entropySpeed]);

  // Slowly expand and clear canvas ripples
  useEffect(() => {
    const interval = setInterval(() => {
      setRipples((prev) =>
        prev
          .map((r) => ({
            ...r,
            size: r.size + 4
          }))
          .filter((r) => r.size < 200)
      );
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Spawn random sparkly stars periodically to represent ongoing partner dreaming
  useEffect(() => {
    const timer = setInterval(() => {
      const activeVibe = VIBE_AESTHETICS[selectedVibe] || VIBE_AESTHETICS.fluid;
      const color = activeVibe.colors[Math.floor(Math.random() * activeVibe.colors.length)];
      setParticles((prev) => [
        ...prev,
        {
          id: particleIdRef.current++,
          x: 10 + Math.random() * 80,
          y: 60 + Math.random() * 30,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -0.5 - Math.random() * 1.5,
          color,
          size: 3 + Math.random() * 4,
          alpha: 0.8 + Math.random() * 0.2
        }
      ]);
    }, 1800);
    return () => clearInterval(timer);
  }, [selectedVibe]);

  // Click on Canvas trigger ripple & particle burst
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const activeVibe = VIBE_AESTHETICS[selectedVibe] || VIBE_AESTHETICS.fluid;

    // Create ripple
    setRipples((prev) => [
      ...prev,
      {
        id: rippleIdRef.current++,
        x,
        y,
        color: activeVibe.colors[0],
        size: 10
      }
    ]);

    // Spawn 8 bursting particles
    const newParticles: Particle[] = Array.from({ length: 8 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      return {
        id: particleIdRef.current++,
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: activeVibe.colors[Math.floor(Math.random() * activeVibe.colors.length)],
        size: 3 + Math.random() * 5,
        alpha: 1.0
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Trigger manual burst trigger
  const triggerBurst = () => {
    const activeVibe = VIBE_AESTHETICS[selectedVibe] || VIBE_AESTHETICS.fluid;
    const burstParticles: Particle[] = Array.from({ length: 15 }).map(() => ({
      id: particleIdRef.current++,
      x: 15 + Math.random() * 70,
      y: 75,
      vx: (Math.random() - 0.5) * 4,
      vy: -2 - Math.random() * 4,
      color: activeVibe.colors[Math.floor(Math.random() * activeVibe.colors.length)],
      size: 4 + Math.random() * 6,
      alpha: 1.0
    }));
    setParticles((prev) => [...prev, ...burstParticles]);
  };

  // Whisper Submission Handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isWhispering) return;

    const textToSend = inputText.trim();
    setInputText('');
    setLastWhisperSent(textToSend);

    const activeSpeaker = senderMode === 'user' ? userName : `${partnerName} (Partner)`;

    // Trigger local synesthesia reaction ripple on submission
    setRipples((prev) => [
      ...prev,
      {
        id: rippleIdRef.current++,
        x: 150 + Math.random() * 150,
        y: 150 + Math.random() * 150,
        color: '#D946EF',
        size: 20
      }
    ]);

    // Submit whisper
    await onWhisper(textToSend, activeSpeaker);

    // AI Autopilot mode - Partner "Lyra" replies 2.5s later to weave their dream thought!
    if (autoPilot && senderMode === 'user') {
      setTimeout(async () => {
        const continuationPrompts = [
          `Crystallizing "${textToSend}" into an obsidian tower reflecting periwinkle rays.`,
          `Fusing with your thought: "${textToSend}". We glide over the liquid silver river.`,
          `Resonating with: "${textToSend}". I can hear the humming of past echoes.`,
          `Echoing "${textToSend}". Gold vines now anchor deep into the Dream Nexus.`,
          `I weave a warm peach fog around "${textToSend}". Let the starlight descend.`
        ];
        const randomContinuation = continuationPrompts[Math.floor(Math.random() * continuationPrompts.length)];
        
        // Trigger partner whisper back to the server
        await onWhisper(randomContinuation, partnerName);
      }, 2500);
    }
  };

  // Dragging Nodes logic for mini tree
  const handleNodeMouseDown = (e: React.MouseEvent, id: string, initialX: number, initialY: number) => {
    e.stopPropagation();
    draggingNodeIdRef.current = id;
    changeActiveNodeId(id);
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    nodeStartCoordsRef.current = { x: initialX, y: initialY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNodeIdRef.current || !miniCanvasRef.current) return;
      const rect = miniCanvasRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;

      // Calculate relative percentage delta
      const percentDx = (dx / rect.width) * 100;
      const percentDy = (dy / rect.height) * 100;

      let newX = Math.round(nodeStartCoordsRef.current.x + percentDx);
      let newY = Math.round(nodeStartCoordsRef.current.y + percentDy);

      newX = Math.max(5, Math.min(newX, 95));
      newY = Math.max(10, Math.min(newY, 90));

      onUpdateNodePosition(draggingNodeIdRef.current, newX, newY);
    };

    const handleMouseUp = () => {
      draggingNodeIdRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onUpdateNodePosition]);

  const activeVibe = VIBE_AESTHETICS[selectedVibe] || VIBE_AESTHETICS.fluid;
  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  return (
    <div className="relative flex-grow w-full flex flex-col h-full overflow-y-auto" id="main-hub-view">
      
      {/* 1. TOP HEADER SUMMARY BANNER */}
      <div className="w-full bg-gradient-to-b from-white/70 via-white/40 to-transparent pt-24 pb-4 px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20 border-b border-purple-100/10 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="font-display text-2xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
              Co-Dreaming Canvas
              <span className="text-xs font-mono font-bold tracking-wide bg-purple-500/15 text-purple-700 px-3 py-0.5 rounded-full uppercase">
                {activeVibe.vibeLabel}
              </span>
            </h1>
          </div>
          <p className="text-xs text-purple-950/60 font-semibold mt-1">
            Resonance path frequency: <span className="font-mono text-purple-700 font-bold">{partnerFrequency}</span> • Active speaker: <span className="text-purple-900 font-bold uppercase">{senderMode === 'user' ? 'You (User A)' : `${partnerName} (User B)`}</span>
            {users.length > 0 && (
              <span> • Present: <span className="text-purple-900 font-bold uppercase">{users.join(', ')}</span></span>
            )}
          </p>
        </div>

        {/* Co-Dreaming status indicators */}
        <div className="flex items-center gap-6 bg-white/50 border border-white/60 rounded-2xl py-2 px-4 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-purple-950/40 font-bold uppercase">Synthesized Nodes</span>
            <span className="font-mono text-sm font-black text-purple-900">{nodes.length}</span>
          </div>
          <div className="w-px h-6 bg-purple-200/50"></div>
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-purple-950/40 font-bold uppercase">Solmization Align</span>
            <span className="font-mono text-xs font-bold text-purple-700">{activeVibe.frequency.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* 2. THE MAIN TWO-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-7xl mx-auto px-6 md:px-12 py-6 flex-grow pb-32">
        
        {/* ========================================================= */}
        {/* COLUMN 1: THE GENERATIVE SYNESTHESIA ART CANVAS (7 COLS) */}
        {/* ========================================================= */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          
          {/* A. Outer Bezel Museum Display Frame */}
          <div className="relative bg-white/40 border border-white rounded-3xl p-4 shadow-xl backdrop-blur-2xl flex flex-col gap-4">
            
            {/* Display header status bar */}
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-purple-600/70" />
                <span className="font-mono text-[9px] text-purple-950/50 font-bold uppercase tracking-wider">
                  SVG/CSS Fluid Shader Generator • Aura Canvas
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="font-mono text-[9px] text-purple-700 font-bold uppercase tracking-widest">
                  Live Rendering
                </span>
              </div>
            </div>

            {/* B. The Interactive Viewport with morphing auras */}
            <div
              id="synesthesia-canvas"
              onClick={handleCanvasClick}
              className="relative w-full h-[380px] md:h-[440px] rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-950/10 shadow-2xl cursor-crosshair group flex items-center justify-center transition-all duration-500"
            >
              {/* Grid Background lines representing mathematical token alignments */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-60" />
              <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,transparent_20%,rgba(15,23,42,0.65))" />

              {/* Real-time physical expanding ripples */}
              {ripples.map((rip) => (
                <div
                  key={rip.id}
                  className="absolute rounded-full border-2 pointer-events-none transition-all duration-300"
                  style={{
                    left: rip.x,
                    top: rip.y,
                    width: `${rip.size}px`,
                    height: `${rip.size}px`,
                    borderColor: rip.color,
                    opacity: (200 - rip.size) / 200,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}

              {/* Sparkly Particle floating layer */}
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="absolute rounded-full pointer-events-none transition-all"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    opacity: p.alpha,
                    boxShadow: `0 0 10px ${p.color}`,
                    transform: 'translate(-50%, -50%)',
                    transitionDuration: '50ms'
                  }}
                />
              ))}

              {/* MORPHING FLUID BLOBS (Procedural SVG overlapping structures) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none blur-3xl opacity-85 select-none z-10">
                <svg viewBox="0 0 100 100" className="w-[110%] h-[110%] scale-105">
                  <defs>
                    <linearGradient id="blobGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={activeVibe.colors[0]} />
                      <stop offset="100%" stopColor={activeVibe.colors[1]} />
                    </linearGradient>
                    <linearGradient id="blobGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={activeVibe.colors[1]} />
                      <stop offset="100%" stopColor={activeVibe.colors[2] || activeVibe.colors[0]} />
                    </linearGradient>
                    <linearGradient id="blobGrad3" x1="50%" y1="100%" x2="50%" y2="0%">
                      <stop offset="0%" stopColor={activeVibe.colors[2] || '#D946EF'} />
                      <stop offset="100%" stopColor={activeVibe.colors[0]} />
                    </linearGradient>
                  </defs>

                  {/* Morphing blob 1 */}
                  <path
                    d="M25,50 C25,30 42,22 62,28 C82,34 85,58 72,72 C59,86 32,78 25,50 Z"
                    fill="url(#blobGrad1)"
                    className="origin-center animate-[spin_24s_linear_infinite_reverse]"
                    style={{
                      transformScale: 0.9 + Math.sin(Date.now() / 2000) * 0.1,
                      animationDuration: canvasMode === 'crystalline' ? '5s' : '22s'
                    }}
                  />

                  {/* Morphing blob 2 */}
                  <path
                    d="M35,40 C35,22 58,15 75,32 C92,49 84,72 65,75 C46,78 35,68 35,40 Z"
                    fill="url(#blobGrad2)"
                    className="origin-center animate-[spin_32s_linear_infinite]"
                    style={{
                      animationDuration: canvasMode === 'crystalline' ? '8s' : '30s'
                    }}
                  />

                  {/* Morphing blob 3 */}
                  <path
                    d="M45,35 C65,18 80,35 75,58 C70,81 48,82 32,68 C16,54 25,52 45,35 Z"
                    fill="url(#blobGrad3)"
                    className="origin-center animate-[pulse_14s_ease-in-out_infinite_alternate]"
                    style={{
                      animationDuration: canvasMode === 'crystalline' ? '4s' : '12s'
                    }}
                  />
                </svg>
              </div>

              {/* Crystalline wireframe node grid overlaid (if enabled) */}
              {canvasMode === 'crystalline' && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-40">
                  <svg className="w-full h-full stroke-white/20" strokeWidth="1">
                    {nodes.map((node) => {
                      if (!node.parentId) return null;
                      const parent = nodes.find(n => n.id === node.parentId);
                      if (!parent) return null;
                      return (
                        <line
                          key={`canvas-link-${node.id}`}
                          x1={`${parent.x}%`}
                          y1={`${parent.y}%`}
                          x2={`${node.x}%`}
                          y2={`${node.y}%`}
                          stroke="rgba(255,255,255,0.25)"
                          strokeDasharray="4 4"
                        />
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* HUD / Aesthetic telemetry overlays */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none select-none font-mono text-[9px] text-white/40 flex flex-col gap-1">
                <span>[RES_GRID] ESTABLISHED_OK</span>
                <span>[INPUT_CH] CH_A + CH_B SYNC</span>
                <span>[CO_CONSCIOUS_MOD] RES_TUP_937</span>
              </div>

              <div className="absolute bottom-4 right-4 z-20 pointer-events-none select-none font-mono text-[9px] text-white/40 text-right flex flex-col gap-1">
                <span>DREAM ENGINE 3.5 FLASH</span>
                <span>MUTATIVE ENERGY SPEED: {entropySpeed.toFixed(1)}x</span>
                <span>CO-CREATOR ENTROPY: 0.742</span>
              </div>

              {/* Floating Center Poetic Aura Text (The latest generated text!) */}
              {fragments && fragments.length > 0 && (
                <div className="absolute bottom-8 left-6 right-6 z-20 pointer-events-none select-none bg-black/40 border border-white/10 backdrop-blur-md p-4 rounded-xl max-w-md shadow-2xl animate-fade-in">
                  <span className="font-mono text-[8px] text-fuchsia-300 font-bold uppercase tracking-widest block mb-1">
                    LATEST SYNTHESIZED RESONANCE
                  </span>
                  <p className="font-sans text-xs md:text-sm text-white italic font-medium leading-relaxed">
                    {fragments[fragments.length - 1].text}
                  </p>
                </div>
              )}

              {/* Interactive prompt to click */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/25 pointer-events-none duration-300 z-10">
                <span className="px-4 py-2 rounded-full bg-white/20 border border-white/30 text-white font-semibold text-xs tracking-wider uppercase backdrop-blur-md">
                  Tap sub-conscious to ripple
                </span>
              </div>

              {/* Loading indicator Overlay */}
              {isWhispering && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 z-30 animate-fade-in">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-fuchsia-400 absolute animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-xs text-fuchsia-400 font-bold uppercase tracking-widest animate-pulse">
                      Shared Dream Engine Active
                    </p>
                    <p className="font-sans text-[10px] text-white/60 mt-1 max-w-xs px-4">
                      Decoding linguistic resonance vectors to mutate CSS shaders and branching nodes...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* C. Interactive Canvas Controls & Modifiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Preset Vibe modifier cards */}
              <div className="bg-white/40 border border-white/50 p-4 rounded-2xl flex flex-col gap-2">
                <h4 className="font-display text-xs text-purple-950 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                  <Shuffle className="w-3.5 h-3.5 text-purple-600" />
                  Vibration Aesthetics Preset
                </h4>
                <div className="grid grid-cols-4 gap-1.5 mt-1">
                  {Object.keys(VIBE_AESTHETICS).map((vibeKey) => (
                    <button
                      key={vibeKey}
                      onClick={() => changeSelectedVibe(vibeKey)}
                      className={`py-1 px-1.5 rounded-lg font-mono text-[9px] font-bold uppercase border transition-all truncate text-center ${
                        selectedVibe === vibeKey
                          ? 'bg-purple-900 border-purple-950 text-white shadow-md'
                          : 'bg-white/50 border-white/60 hover:bg-white text-purple-950/70'
                      }`}
                    >
                      {vibeKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity & Particle triggers */}
              <div className="bg-white/40 border border-white/50 p-4 rounded-2xl flex flex-col justify-between gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-display text-xs text-purple-950 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                    Agitation / Entropy Flux
                  </span>
                  <span className="font-mono text-[10px] font-black text-purple-800">{entropySpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={entropySpeed}
                  onChange={(e) => changeEntropySpeed(parseFloat(e.target.value))}
                  className="w-full accent-purple-600 h-1 bg-purple-200/50 rounded-lg cursor-pointer"
                />
                <div className="flex gap-2">
                  <button
                    onClick={triggerBurst}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-bold text-[10px] tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3 animate-bounce" />
                    Aether Sparkle Burst
                  </button>
                  <button
                    onClick={() => changeCanvasMode(canvasMode === 'flow' ? 'crystalline' : 'flow')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[10px] tracking-wider uppercase border transition-all ${
                      canvasMode === 'crystalline'
                        ? 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700'
                        : 'bg-white/50 border-white/60 text-purple-950/70'
                    }`}
                  >
                    {canvasMode === 'crystalline' ? 'Grid: ON' : 'Grid: OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* D. Spectral Metrics Readout Terminal */}
          <div className="bg-white/30 border border-white/40 backdrop-blur-2xl rounded-3xl p-5 shadow-lg flex flex-col gap-3">
            <h4 className="font-display text-xs text-purple-950 font-extrabold uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Subconscious Spectral Analysis
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
              <div className="p-3.5 rounded-2xl bg-white/50 border border-white flex flex-col gap-1">
                <span className="font-mono text-[8px] text-purple-950/40 font-bold uppercase">Harmonic Waveband</span>
                <span className="font-mono text-xs font-bold text-purple-900">{activeVibe.frequency}</span>
                <p className="text-[9px] text-purple-950/50 leading-snug mt-1 font-medium">{activeVibe.description}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/50 border border-white flex flex-col gap-1 justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-[8px] text-purple-950/40 font-bold uppercase">Color Vector Blend</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {activeVibe.colors.map((c, i) => (
                      <span key={i} className="w-3.5 h-3.5 rounded-full shadow-inner border border-white" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="w-full bg-purple-100/50 rounded-full h-1 mt-2 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${60 + entropySpeed * 15}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/50 border border-white flex flex-col gap-1">
                <span className="font-mono text-[8px] text-purple-950/40 font-bold uppercase">Sentiment Dimension</span>
                <span className="font-mono text-xs font-extrabold text-fuchsia-700 uppercase tracking-widest mt-0.5">
                  {selectedVibe === 'lucid' ? 'Vivid / Astral' : selectedVibe === 'fluid' ? 'Dynamic / Cyan' : selectedVibe === 'calm' ? 'Warm / Peace' : selectedVibe === 'energetic' ? 'Aggressive Solar' : selectedVibe === 'ambient' ? 'Subconscious Void' : selectedVibe === 'soft' ? 'Pristine Mint' : 'Spiritual Order'}
                </span>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex-grow bg-purple-200/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${selectedVibe === 'lucid' ? 90 : selectedVibe === 'energetic' ? 95 : selectedVibe === 'calm' ? 40 : 65}%` }} />
                  </div>
                  <span className="font-mono text-[9px] text-purple-950/50 font-bold">
                    {selectedVibe === 'lucid' ? '90%' : selectedVibe === 'energetic' ? '95%' : selectedVibe === 'calm' ? '40%' : '65%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* COLUMN 2: INTEGRATED TREE & CHAT SYSTEM (5 COLS) */}
        {/* ========================================================= */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white/40 border border-white rounded-3xl shadow-xl flex flex-col h-[530px] overflow-hidden backdrop-blur-2xl">
            
            {/* Header Tabs Navigation */}
            <div className="flex border-b border-purple-200/40 bg-white/50 p-2 gap-1 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('tree')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-display text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'tree'
                    ? 'bg-purple-950 text-white shadow-md'
                    : 'text-purple-950/60 hover:bg-white/50'
                }`}
              >
                <Network className="w-4 h-4" />
                Branching Tree Map
              </button>
              <button
                onClick={() => setActiveTab('whispers')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-display text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'whispers'
                    ? 'bg-purple-950 text-white shadow-md'
                    : 'text-purple-950/60 hover:bg-white/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Aether Whispers
              </button>
            </div>

            {/* TAB CONTENT: mini interactive branching tree */}
            {activeTab === 'tree' && (
              <div className="flex-grow flex flex-col h-full overflow-hidden relative">
                
                {/* Drag instruction overlay banner */}
                <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex justify-between items-center bg-white/70 border border-white px-3 py-1.5 rounded-xl backdrop-blur-md shadow-sm">
                  <span className="font-mono text-[8px] text-purple-950/50 font-bold uppercase tracking-wider">
                    Drag nodes to reshape consciousness
                  </span>
                  <span className="font-mono text-[8px] text-purple-700 font-bold">
                    {nodes.length} Nodes Loaded
                  </span>
                </div>

                {/* SVG Connections and node canvas container */}
                <div
                  ref={miniCanvasRef}
                  id="mini-tree-canvas"
                  className="w-full h-72 bg-gradient-to-b from-purple-50/20 to-white/10 relative overflow-hidden flex-grow select-none border-b border-purple-100/15"
                >
                  {/* SVG Line Connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {nodes.map((node) => {
                      if (!node.parentId) return null;
                      const parent = nodes.find((n) => n.id === node.parentId);
                      if (!parent) return null;

                      const x1 = parent.x;
                      const y1 = parent.y;
                      const x2 = node.x;
                      const y2 = node.y;

                      const cx = (x1 + x2) / 2;
                      const cy = (y1 + y2) / 2 + (y2 > y1 ? -4 : 4);

                      return (
                        <g key={`mini-line-${node.id}`}>
                          {/* Main stroke line */}
                          <path
                            d={`M ${x1}% ${y1}% Q ${cx}% ${cy}% ${x2}% ${y2}%`}
                            fill="none"
                            stroke="rgba(147, 51, 234, 0.2)"
                            strokeWidth="1.5"
                          />
                          {/* Animated sliding light particle */}
                          <circle r="1.5" fill="#EC4899">
                            <animateMotion
                              dur="5s"
                              repeatCount="indefinite"
                              path={`M ${x1}% ${y1}% Q ${cx}% ${cy}% ${x2}% ${y2}%`}
                            />
                          </circle>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Render Draggable Nodes */}
                  {nodes.map((node) => {
                    const isSelected = node.id === activeNodeId;
                    return (
                      <div
                        key={`mini-node-${node.id}`}
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id, node.x, node.y)}
                        className={`absolute cursor-grab active:cursor-grabbing group p-2 rounded-xl border backdrop-blur-xl flex items-center justify-center transition-shadow shadow-sm z-10 ${
                          isSelected
                            ? 'bg-purple-900 border-purple-950 text-white scale-105 shadow-md ring-1 ring-purple-500'
                            : 'bg-white/70 border-purple-200 text-purple-950 hover:bg-white hover:scale-103'
                        }`}
                        style={{
                          left: `${node.x}%`,
                          top: `${node.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <LucideIcon
                          name={node.icon}
                          className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-purple-600'}`}
                        />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-[80px] group-hover:ml-1.5 transition-all text-[9px] font-bold uppercase whitespace-nowrap">
                          {node.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Node Details Readout */}
                <div className="bg-white/60 p-4 border-t border-purple-200/40 flex flex-col gap-1.5 backdrop-blur-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-full bg-purple-100 border border-purple-200">
                        <LucideIcon name={activeNode?.icon || 'Hub'} className="w-3.5 h-3.5 text-purple-700" />
                      </div>
                      <span className="font-display text-xs text-purple-950 font-extrabold uppercase tracking-wider">
                        Branch: {activeNode?.label || 'Nexus'}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-purple-950/40 font-bold">
                      {activeNode?.timestamp || 'Nexus Entry'}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-950/70 leading-relaxed font-medium">
                    {activeNode?.description || 'The primordial anchor connecting your consciousness stream with Lyra.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Chat style Whisper logs feed */}
            {activeTab === 'whispers' && (
              <div className="flex-grow flex flex-col h-full overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-purple-50/10 to-transparent">
                {history.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center text-purple-950/40 p-6">
                    <MessageSquare className="w-8 h-8 text-purple-300 mb-2" />
                    <p className="font-display text-xs font-bold uppercase tracking-wider">No whispers decrypted yet</p>
                    <p className="text-[10px] mt-1 max-w-xs">Type in the bar below to begin sending thoughts to the Shared Dream Engine.</p>
                  </div>
                ) : (
                  history.map((log) => {
                    const isLyra = log.text.includes('[Lyra') || log.text.includes('Lyra: ') || log.text.includes('Lyra (Partner)');
                    return (
                      <div
                        key={log.id}
                        className={`p-3.5 rounded-2xl border transition-all max-w-[90%] ${
                          isLyra
                            ? 'bg-pink-500/10 border-pink-200/50 text-purple-950 self-start'
                            : 'bg-purple-500/10 border-purple-200/50 text-purple-950 self-end text-right'
                        }`}
                      >
                        <div className={`flex items-center gap-1.5 mb-1 ${isLyra ? 'justify-start' : 'justify-end'}`}>
                          <span className="font-mono text-[8px] text-purple-950/40 font-bold uppercase tracking-wider">
                            {log.time}
                          </span>
                          <span className={`font-mono text-[8px] font-black uppercase ${isLyra ? 'text-pink-600' : 'text-purple-600'}`}>
                            {isLyra ? '• Partner' : '• You'}
                          </span>
                        </div>
                        <p className="text-[11px] font-sans font-semibold leading-relaxed">
                          {log.text.replace(/^\[.*?\]\s*/, '')}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* E. DUAL-CREATOR INPUT CONTROLLER */}
          <div className="bg-white/40 border border-white rounded-3xl p-4 shadow-xl backdrop-blur-2xl flex flex-col gap-3">
            
            {/* Control elements: Speaker selector & Autopilot toggler */}
            <div className="flex justify-between items-center gap-4 bg-white/50 border border-purple-100 p-2.5 rounded-2xl">
              
              {/* Speaker Select Button Group */}
              <div className="flex gap-1 bg-purple-100/40 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSenderMode('user')}
                  className={`py-1 px-3 rounded-lg font-display text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    senderMode === 'user'
                      ? 'bg-purple-900 text-white shadow-md'
                      : 'text-purple-950/60 hover:text-purple-950'
                  }`}
                >
                  <User className="w-3 h-3" />
                  Your Input
                </button>
                <button
                  type="button"
                  onClick={() => setSenderMode('partner')}
                  className={`py-1 px-3 rounded-lg font-display text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    senderMode === 'partner'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'text-purple-950/60 hover:text-purple-950'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Sim partner
                </button>
              </div>

              {/* Autopilot Toggler */}
              <button
                type="button"
                onClick={() => setAutoPilot((p) => !p)}
                className={`py-1.5 px-3 rounded-xl border font-mono text-[9px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                  autoPilot
                    ? 'bg-emerald-500/10 border-emerald-300 text-emerald-700 font-extrabold'
                    : 'bg-white border-purple-200 text-purple-950/40'
                }`}
                title="If ON, Partner AI automatically responds and branches with its own dream continuation thoughts!"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${autoPilot ? 'bg-emerald-500 animate-pulse' : 'bg-purple-950/20'}`}></span>
                Auto Co-Dream: {autoPilot ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Main typing bar form */}
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <input
                type="text"
                required
                disabled={isWhispering}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  senderMode === 'user'
                    ? "Whisper a thought or feelings into the shared canvas..."
                    : `Simulate ${partnerName} whispering an evocative poetic response...`
                }
                className="flex-grow bg-white/70 hover:bg-white/95 focus:bg-white border border-purple-200/60 focus:border-purple-500 focus:ring-0 rounded-2xl py-3 px-4 text-xs font-semibold text-purple-950 placeholder-purple-950/30 shadow-inner focus:shadow-md transition-all outline-none"
              />
              <button
                type="submit"
                disabled={isWhispering || !inputText.trim()}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none ${
                  senderMode === 'user'
                    ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white'
                    : 'bg-gradient-to-tr from-pink-500 to-rose-400 text-white'
                }`}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
