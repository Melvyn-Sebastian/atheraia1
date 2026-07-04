/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon } from './MainHub';
import { DreamNode, DreamAction } from '../types';
import { Sparkles, ZoomIn, ZoomOut, Maximize2, Plus, ArrowLeft } from 'lucide-react';

interface NodeTreeProps {
  nodes: DreamNode[];
  history: DreamAction[];
  onAddCustomNode: (label: string) => Promise<void>;
  isAddingNode: boolean;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  onSelectNode: (node: DreamNode) => void;
}

export default function NodeTree({
  nodes,
  history,
  onAddCustomNode,
  isAddingNode,
  onUpdateNodePosition,
  onSelectNode
}: NodeTreeProps) {
  const [zoom, setZoom] = useState(100);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("node-nexus");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingNodeIdRef = useRef<string | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const nodeStartCoordsRef = useRef({ x: 0, y: 0 });

  // Handle Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 70));
  const handleZoomReset = () => setZoom(100);

  // Handle Mouse Down on Node to Drag
  const handleNodeMouseDown = (e: React.MouseEvent, id: string, initialX: number, initialY: number) => {
    e.stopPropagation();
    draggingNodeIdRef.current = id;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    nodeStartCoordsRef.current = { x: initialX, y: initialY };
  };

  // Global Mouse Move & Mouse Up for Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNodeIdRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;

      // Convert pixel delta to percentage delta relative to container
      const percentDx = (dx / rect.width) * 100;
      const percentDy = (dy / rect.height) * 100;

      let newX = Math.round(nodeStartCoordsRef.current.x + percentDx);
      let newY = Math.round(nodeStartCoordsRef.current.y + percentDy);

      // Clamp coordinates to stay on canvas
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

  const handleCreateNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim() || isAddingNode) return;
    const name = newNodeName.trim();
    setNewNodeName('');
    setIsDialogOpen(false);
    await onAddCustomNode(name);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="relative flex-grow flex h-full overflow-hidden" ref={containerRef} id="node-tree-view">
      
      {/* 1. Left Sidebar: Dream History Logs (Hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-80 h-[calc(100vh-140px)] mt-24 ml-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-6 overflow-y-auto space-y-6 z-20 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-purple-950 font-semibold tracking-tight">Dream History</h2>
          <span className="p-1 rounded-full bg-purple-100 text-purple-700">
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        <div className="space-y-4 flex-grow overflow-y-auto pr-1">
          {history.map((log) => (
            <div
              key={log.id}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                log.active
                  ? "bg-white/75 border-purple-300 shadow-md ring-1 ring-purple-200"
                  : "bg-white/20 border-white/40 hover:bg-white/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-[10px] text-purple-700/80 font-semibold uppercase tracking-wider">
                  {log.time}
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
              </div>
              <p className="font-sans text-xs text-purple-900 leading-relaxed font-medium">
                {log.text}
              </p>
            </div>
          ))}
        </div>

        {/* Action Button: New Dream Node */}
        <button
          onClick={() => setIsDialogOpen(true)}
          disabled={isAddingNode}
          className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-purple-300 to-pink-300 text-purple-900 font-semibold hover:shadow-lg transition-all duration-300 text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Dream Node
        </button>
      </aside>

      {/* 2. Interactive Canvas Container */}
      <main className="flex-1 relative h-full flex items-center justify-center overflow-hidden">
        
        {/* Canvas Control Bar Overlays */}
        <div className="absolute top-24 left-8 z-30 flex gap-3">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="md:hidden flex items-center gap-1.5 bg-white/50 hover:bg-white/70 backdrop-blur-md border border-white/60 py-2 px-4 rounded-full text-purple-950 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Node
          </button>
          <div className="flex items-center bg-white/50 border border-white/60 backdrop-blur-md rounded-full px-3 py-1 shadow-sm gap-2">
            <button onClick={handleZoomOut} className="p-1 rounded-full text-purple-950/70 hover:bg-white/60">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-purple-950 font-bold px-1 select-none">
              {zoom}%
            </span>
            <button onClick={handleZoomIn} className="p-1 rounded-full text-purple-950/70 hover:bg-white/60">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleZoomReset} className="p-1 rounded-full text-purple-950/70 hover:bg-white/60">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SVG connection lines layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {nodes.map((node) => {
            if (!node.parentId) return null;
            const parent = nodes.find(n => n.id === node.parentId);
            if (!parent) return null;

            // Simple responsive relative line coordinates
            const x1 = parent.x;
            const y1 = parent.y;
            const x2 = node.x;
            const y2 = node.y;

            // Generate a beautiful quadratic bezier curve path
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2 + (y2 > y1 ? -5 : 5); // Add slight organic arc

            return (
              <g key={`line-${node.id}`}>
                {/* Outer soft glowing line path */}
                <path
                  d={`M ${x1}% ${y1}% Q ${cx}% ${cy}% ${x2}% ${y2}%`}
                  fill="none"
                  stroke="rgba(167, 139, 250, 0.15)"
                  strokeWidth="6"
                />
                {/* Inner dashed animated path */}
                <path
                  d={`M ${x1}% ${y1}% Q ${cx}% ${cy}% ${x2}% ${y2}%`}
                  fill="none"
                  stroke="rgba(111, 80, 146, 0.35)"
                  strokeWidth="2"
                  strokeDasharray="6, 6"
                  className="animate-[dash_25s_linear_infinite]"
                  style={{
                    animationKeyframes: `
                      @keyframes dash {
                        to { stroke-dashoffset: -1000; }
                      }
                    `
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Draggable Nodes Canvas */}
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            
            // Map Lucide icons cleanly
            const colorGlow = node.colorClass === "primary"
              ? "shadow-[0_0_20px_rgba(111,80,146,0.3)] border-purple-500 bg-white/90"
              : node.colorClass === "secondary"
              ? "shadow-[0_0_20px_rgba(236,72,153,0.3)] border-pink-400 bg-white/80"
              : "shadow-[0_0_20px_rgba(56,189,248,0.3)] border-sky-400 bg-white/80";

            return (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-grab active:cursor-grabbing"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id, node.x, node.y)}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  onSelectNode(node);
                }}
              >
                <div
                  className={`w-24 h-24 md:w-28 md:h-28 rounded-full border flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 select-none ${colorGlow} ${
                    isSelected ? "ring-4 ring-purple-300 border-purple-600 scale-105" : ""
                  }`}
                >
                  <div className="p-1.5 bg-white/50 rounded-full border border-white/50 mb-1">
                    <LucideIcon name={node.icon} className="w-5 h-5 text-purple-700/80" />
                  </div>
                  <span className="font-display text-xs md:text-sm font-semibold text-purple-950 text-center px-2 truncate w-full">
                    {node.label}
                  </span>
                  {isSelected && (
                    <span className="absolute -bottom-2 bg-purple-600 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-white">
                      Selected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Overlay Card (Bottom Center) */}
        {selectedNode && (
          <div className="absolute bottom-8 left-6 right-6 md:left-auto md:right-8 md:w-80 bg-white/50 backdrop-blur-xl border border-white/60 p-5 rounded-2xl shadow-lg z-30 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-display text-lg text-purple-950 font-semibold">{selectedNode.label}</h3>
                <p className="text-[10px] font-mono text-purple-700/80 font-bold uppercase tracking-wider mt-0.5">
                  Resonance Node • {selectedNode.timestamp}
                </p>
              </div>
              <div className="p-2 bg-white/60 border border-white rounded-full">
                <LucideIcon name={selectedNode.icon} className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="font-sans text-xs text-purple-950/80 leading-relaxed font-medium">
              {selectedNode.description}
            </p>
            {selectedNode.parentId && (
              <p className="text-[9px] font-mono font-semibold text-purple-600 uppercase tracking-wider mt-3">
                Branches from: {nodes.find(n => n.id === selectedNode.parentId)?.label || "Root Node"}
              </p>
            )}
          </div>
        )}
      </main>

      {/* CSS style injected directly for SVG dash animation */}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}</style>

      {/* Modal Dialog for creating a custom Dream Node */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-purple-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 border border-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative transition-all">
            <h3 className="font-display text-2xl text-purple-900 font-semibold tracking-tight mb-2">New Dream Branch</h3>
            <p className="text-xs text-purple-950/60 leading-relaxed mb-6 font-medium">
              Whisper a concept to formulate a new consciousness node. Our Shared Dream Engine will dynamically synthesize and branch it from <strong>{selectedNode?.label || "Nexus"}</strong>.
            </p>

            <form onSubmit={handleCreateNodeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-purple-800 mb-1 ml-2 uppercase tracking-widest">
                  Concept Name
                </label>
                <input
                  type="text"
                  required
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="e.g., Infinite Forest, Silver Wind"
                  className="w-full bg-white/50 border border-purple-200 rounded-full px-5 py-3 text-sm text-purple-950 placeholder-purple-900/40 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-purple-200 hover:bg-purple-50 text-xs font-semibold text-purple-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingNode || !newNodeName.trim()}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {isAddingNode ? "Synthesizing..." : "Synthesize Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
