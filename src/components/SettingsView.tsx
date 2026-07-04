/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sliders, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

interface SettingsViewProps {
  partnerFrequency: string;
  onUpdateFrequency: (freq: string) => void;
  shaderIntensity: number;
  onUpdateShaderIntensity: (intensity: number) => void;
}

export default function SettingsView({
  partnerFrequency,
  onUpdateFrequency,
  shaderIntensity,
  onUpdateShaderIntensity
}: SettingsViewProps) {
  const [freq, setFreq] = useState(partnerFrequency);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleFreqSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFrequency(freq.trim().toUpperCase() || "AETHER-7.83HZ");
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="relative flex-grow flex flex-col h-full overflow-y-auto pt-24 pb-32 px-6 md:px-16 max-w-xl mx-auto z-10" id="settings-view">
      <div className="mb-8">
        <h2 className="font-display text-4xl text-purple-950 font-semibold tracking-tight">Sync Settings</h2>
        <p className="font-sans text-xs text-purple-950/60 font-medium mt-1">
          Configure physical tuning parameters and adjust the high-fidelity Liquid Shader interface.
        </p>
      </div>

      <div className="space-y-6 bg-white/40 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-3xl shadow-lg">
        
        {/* Tuning Frequency Setting */}
        <form onSubmit={handleFreqSave} className="space-y-3 pb-6 border-b border-purple-200/50">
          <div className="flex items-center gap-2 text-purple-950 font-semibold text-sm">
            <RefreshCw className="w-4 h-4 text-purple-600 animate-[spin_6s_linear_infinite]" />
            <span>Resonance Tuning Frequency</span>
          </div>
          <p className="text-[11px] text-purple-950/60 leading-relaxed font-medium">
            Channels are aligned on a specific harmonic interval. Update this frequency to join a different collaborative dream chamber.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
              placeholder="e.g. LYRA-440HZ"
              className="flex-1 bg-white/50 border border-purple-200 rounded-full px-5 py-3 text-sm text-purple-950 font-semibold placeholder-purple-900/40 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 uppercase font-mono tracking-wider"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-sm"
            >
              Apply
            </button>
          </div>

          {successMsg && (
            <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>Resonance successfully synchronized.</span>
            </div>
          )}
        </form>

        {/* Ambient Shader Speed / Intensity Setting */}
        <div className="space-y-3 pb-6 border-b border-purple-200/50">
          <div className="flex items-center gap-2 text-purple-950 font-semibold text-sm">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Liquid Canvas Drift Speed</span>
          </div>
          <p className="text-[11px] text-purple-950/60 leading-relaxed font-medium">
            Control the flow rate of the underlying WebGL Simplex Noise animation. Higher values generate a more vibrant, energetic aesthetic.
          </p>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={shaderIntensity}
              onChange={(e) => onUpdateShaderIntensity(parseFloat(e.target.value))}
              className="flex-grow accent-purple-600 cursor-pointer"
            />
            <span className="font-mono text-xs text-purple-950 font-bold bg-white/60 border border-white px-3 py-1.5 rounded-lg shadow-sm">
              {shaderIntensity.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Dream Engine Specifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-purple-950 font-semibold text-sm">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>Shared Dream Engine Specs</span>
          </div>
          <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-2xl text-xs space-y-2 text-purple-950/80 font-medium leading-relaxed">
            <p>
              <strong>Core Model:</strong> Gemini 3.5 Flash (Standard Text Tasks)
            </p>
            <p>
              <strong>Vector Integration:</strong> Sentiment & Token analysis generates dynamic branching nodes, customized bento layouts, and holographic artwork gradients.
            </p>
            <p>
              <strong>Secure Processing:</strong> All API credentials are lazy-initialized on our custom node server to safeguard key configurations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
