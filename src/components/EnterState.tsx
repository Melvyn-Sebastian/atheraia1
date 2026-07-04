/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Hash, ArrowRight, HelpCircle, Infinity as InfinityIcon } from 'lucide-react';

interface EnterStateProps {
  onSynchronize: (userName: string, frequency: string) => void;
  isLoading: boolean;
  errorMsg?: string | null;
}

export default function EnterState({ onSynchronize, isLoading, errorMsg }: EnterStateProps) {
  const [userName, setUserName] = useState('');
  const [frequency, setFrequency] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    onSynchronize(userName.trim(), frequency.trim());
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12" id="enter-state-view">
      {/* Central Pulsing Orb/Sphere */}
      <div className="relative w-56 h-56 md:w-64 md:h-64 mb-8 flex items-center justify-center">
        {/* Core Sphere */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-300 via-white to-pink-300 animate-[pulse_4s_ease-in-out_infinite_alternate] opacity-80 backdrop-blur-sm border border-white/40 shadow-[0_0_50px_rgba(111,80,146,0.3)]"></div>
        {/* Inner Holographic Texture */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-bl from-white/60 to-transparent mix-blend-overlay"></div>
        {/* Icon floating in center */}
        <InfinityIcon className="w-20 h-20 text-purple-600 opacity-80 animate-pulse z-10" />
      </div>

      {/* Connection Form Container */}
      <div className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(111,80,146,0.05)] flex flex-col items-center transition-all duration-500 hover:scale-[1.01]">
        {/* Headline */}
        <h1 className="font-display text-4xl md:text-5xl text-purple-900 tracking-tighter text-center mb-2 font-semibold">
          Enter the Shared State
        </h1>
        <p className="font-sans text-sm md:text-base text-purple-950/70 text-center mb-8">
          Synchronize your consciousness to begin co-dreaming.
        </p>

        {errorMsg && (
          <div className="w-full mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-800 font-semibold text-center shadow-sm">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Your Name Input */}
          <div className="relative group">
            <label className="block text-xs font-semibold text-purple-800 mb-2 ml-4 opacity-80 uppercase tracking-widest" htmlFor="userName">
              Your Essence
            </label>
            <div className="flex items-center px-5 h-14 bg-white/30 hover:bg-white/50 border border-white/50 rounded-full transition-all duration-300 focus-within:border-white focus-within:bg-white/40 focus-within:ring-2 focus-within:ring-purple-200">
              <User className="w-5 h-5 text-purple-600/60 mr-3" />
              <input
                id="userName"
                type="text"
                required
                disabled={isLoading}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-purple-950 placeholder-purple-950/40 font-medium"
              />
            </div>
          </div>

          {/* Partner ID Input */}
          <div className="relative group">
            <label className="block text-xs font-semibold text-purple-800 mb-2 ml-4 opacity-80 uppercase tracking-widest" htmlFor="partnerId">
              Partner Frequency
            </label>
            <div className="flex items-center px-5 h-14 bg-white/30 hover:bg-white/50 border border-white/50 rounded-full transition-all duration-300 focus-within:border-white focus-within:bg-white/40 focus-within:ring-2 focus-within:ring-purple-200">
              <Hash className="w-5 h-5 text-purple-600/60 mr-3" />
              <input
                id="partnerId"
                type="text"
                disabled={isLoading}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="LYRA-440HZ (Optional)"
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-purple-950 placeholder-purple-950/40 uppercase font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Connect Button */}
          <button
            type="submit"
            disabled={isLoading || !userName.trim()}
            className="w-full mt-4 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-medium shadow-[0_4px_20px_rgba(111,80,146,0.3)] hover:shadow-[0_4px_30px_rgba(111,80,146,0.5)] transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                Establishing Resonance...
              </span>
            ) : (
              <span className="flex items-center">
                Synchronize
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            )}
          </button>
        </form>

        {/* Helper text */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors duration-300 opacity-75 hover:opacity-100 flex items-center justify-center gap-1 mx-auto"
          >
            <HelpCircle className="w-4 h-4" />
            Need help finding a frequency?
          </button>
          {showHelp && (
            <div className="mt-3 p-4 bg-white/50 border border-white/60 rounded-2xl text-xs text-purple-950 text-left space-y-2 max-w-xs transition-all duration-300">
              <p>
                <strong>Partner Frequency</strong> acts as a tuning fork to merge co-dream states.
              </p>
              <p>
                Leave it blank to automatically connect to <strong>LYRA-440HZ</strong>, our default ambient dream guide.
              </p>
              <p>
                Share a custom code (e.g. <code>NEXUS-9</code>) with a partner to link your canvases!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
