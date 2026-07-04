/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cloud,
  Network,
  Activity,
  Image as ImageIcon,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  Sparkles,
  Bell,
  Sliders,
  Infinity as InfinityIcon,
  ArrowLeft
} from 'lucide-react';
import { DreamNode, GalleryItem, DreamFragment, DreamAction, CoDreamSession } from './types';
import AmbientShader from './components/AmbientShader';
import EnterState from './components/EnterState';
import MainHub from './components/MainHub';
import NodeTree from './components/NodeTree';
import GalleryView from './components/GalleryView';
import SettingsView from './components/SettingsView';
import FlowStateView from './components/FlowStateView';

export default function App() {
  const [session, setSession] = useState<CoDreamSession>({
    userName: '',
    partnerName: 'Lyra',
    partnerFrequency: 'AETHER-7.83HZ',
    isSynchronized: false,
    currentView: 'hub',
    nodes: [],
    galleryItems: [],
    fragments: [],
    history: []
  });

  const [shaderIntensity, setShaderIntensity] = useState(1.0);
  const [isWhispering, setIsWhispering] = useState(false);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Establish Resonance with the server
  const handleSynchronize = async (name: string, freqInput: string) => {
    setIsWhispering(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/dream/synchronize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: name, partnerFrequency: freqInput }),
      });
      if (!res.ok) {
        throw new Error('Failed to synchronize dream consciousness');
      }
      const data = await res.json();
      setSession(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Resonance mapping failed.');
    } finally {
      setIsWhispering(false);
    }
  };

  // 2. Whisper a thought to the Shared Dream Engine (Calls Gemini!)
  const handleWhisper = async (text: string, speakerName?: string) => {
    setIsWhispering(true);
    setErrorMsg(null);
    try {
      const finalSender = speakerName || session.userName;
      const res = await fetch('/api/dream/whisper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: finalSender,
          whisper: text,
          frequency: session.partnerFrequency,
          parentNodeId: session.activeNodeId
        }),
      });

      if (!res.ok) {
        throw new Error('Dream Engine failed to decode whisper resonance');
      }

      const data = await res.json();
      setSession((prev) => ({
        ...prev,
        ...data,
        currentView: prev.currentView, // Preserve client view router state
      }));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit whisper to Gemini.');
    } finally {
      setIsWhispering(false);
    }
  };

  // 3. Quick-branch custom node tree action
  const handleAddCustomNode = async (label: string) => {
    setIsAddingNode(true);
    await handleWhisper(`Branching path: ${label}`);
    setIsAddingNode(false);
  };

  const handleUpdateNodePosition = async (id: string, x: number, y: number) => {
    // Optimistic update
    setSession(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => node.id === id ? { ...node, x, y } : node)
    }));

    try {
      await fetch('/api/dream/update-node-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency: session.partnerFrequency,
          id,
          x,
          y
        })
      });
    } catch (err) {
      console.error("Failed to sync node position:", err);
    }
  };

  const handleSelectNodeId = async (id: string) => {
    // Optimistic update
    setSession(prev => ({
      ...prev,
      activeNodeId: id
    }));

    try {
      const res = await fetch('/api/dream/select-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency: session.partnerFrequency,
          id,
          userName: session.userName
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSession(prev => ({
          ...prev,
          ...data,
          currentView: prev.currentView
        }));
      }
    } catch (err) {
      console.error("Failed to sync node selection:", err);
    }
  };

  const handleUpdateAesthetic = async (vibe: string, speed: number, mode: 'flow' | 'crystalline') => {
    // Optimistic update
    setSession(prev => ({
      ...prev,
      selectedVibe: vibe,
      entropySpeed: speed,
      canvasMode: mode
    }));

    try {
      await fetch('/api/dream/update-aesthetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency: session.partnerFrequency,
          selectedVibe: vibe,
          entropySpeed: speed,
          canvasMode: mode
        })
      });
    } catch (err) {
      console.error("Failed to sync aesthetic settings:", err);
    }
  };

  const handleSyncDream = async (item: GalleryItem) => {
    // Optimistic update
    setSession(prev => ({
      ...prev,
      selectedVibe: item.vibe,
      currentView: 'hub'
    }));

    try {
      await fetch('/api/dream/update-aesthetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency: session.partnerFrequency,
          selectedVibe: item.vibe,
          entropySpeed: 1.2,
          canvasMode: 'flow'
        })
      });

      // Dispatch a special system message to trigger Gemini to dynamically weave the projection!
      const whisperText = `Projected the essence of "${item.title}" from the Synthesis Gallery into the live canvas.`;
      const res = await fetch('/api/dream/whisper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: session.userName,
          whisper: whisperText,
          frequency: session.partnerFrequency,
          parentNodeId: session.activeNodeId
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(prev => ({
          ...prev,
          ...data,
          currentView: 'hub'
        }));
      }
    } catch (err) {
      console.error("Failed to project dream state:", err);
    }
  };

  const handleLogout = () => {
    setSession({
      userName: '',
      partnerName: 'Lyra',
      partnerFrequency: 'AETHER-7.83HZ',
      isSynchronized: false,
      currentView: 'hub',
      nodes: [],
      galleryItems: [],
      fragments: [],
      history: []
    });
  };

  // Real-time synchronization polling effect
  React.useEffect(() => {
    if (!session.isSynchronized) return;

    let active = true;
    const pollInterval = setInterval(async () => {
      try {
        const url = `/api/dream/poll?frequency=${encodeURIComponent(session.partnerFrequency)}&userName=${encodeURIComponent(session.userName)}`;
        const res = await fetch(url);
        if (res.ok && active) {
          const data = await res.json();
          setSession((prev) => ({
            ...prev,
            ...data,
            currentView: prev.currentView, // Preserve client view router state
          }));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [session.isSynchronized, session.partnerFrequency, session.userName]);

  const isFlowState = session.currentView === 'flow';

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-purple-950 font-sans selection:bg-purple-200 selection:text-purple-900 bg-gradient-to-tr from-purple-100/10 via-pink-100/10 to-sky-100/10 backdrop-blur-[2px]">
      
      {/* Dynamic Liquid background shader (Always running, mouse-interactive) */}
      <AmbientShader intensity={shaderIntensity} className="fixed inset-0 -z-10" />

      {/* Ambient background blur circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_12s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-pink-200/20 rounded-full mix-blend-multiply filter blur-3xl animate-[pulse_16s_ease-in-out_infinite_reverse]"></div>
      </div>

      {/* VIEW ENGINE */}
      {!session.isSynchronized ? (
        // Login/Intro screen
        <EnterState onSynchronize={handleSynchronize} isLoading={isWhispering} errorMsg={errorMsg} />
      ) : (
        // Main Application Workspace
        <div className="flex h-screen w-screen relative overflow-hidden" id="app-workspace">
          
          {/* A. SIDE NAVIGATION BAR (Hidden in Flow State) */}
          {!isFlowState && (
            <nav className="hidden md:flex flex-col w-72 h-full bg-white/30 border-r border-white/20 backdrop-blur-2xl shadow-xl fixed left-0 top-0 z-40 pt-24 pb-8">
              <div className="px-6 mb-10">
                <h2 className="font-display text-3xl text-purple-900 font-bold tracking-tighter mb-1 animate-pulse">
                  Aetheria Node
                </h2>
                <p className="text-xs text-purple-950/60 font-semibold tracking-wide uppercase">
                  Collaborative Workspace
                </p>
              </div>

              {/* Quick Branch Node Action Button */}
              <div className="px-6 mb-8">
                <button
                  onClick={() => setSession(prev => ({ ...prev, currentView: 'tree' }))}
                  className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 hover:from-purple-300 hover:to-pink-300 text-purple-950 font-bold text-xs tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-700 animate-spin" style={{ animationDuration: '4s' }} />
                  Explore Tree
                </button>
              </div>

              {/* Sidebar Links */}
              <ul className="flex flex-col flex-grow px-4 gap-1.5">
                <li>
                  <button
                    onClick={() => setSession(prev => ({ ...prev, currentView: 'hub' }))}
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:translate-x-1 ${
                      session.currentView === 'hub'
                        ? 'text-purple-900 bg-white/50 border border-white shadow-md'
                        : 'text-purple-950/70 hover:bg-white/10'
                    }`}
                  >
                    <Cloud className="w-5 h-5 text-purple-700" />
                    Home Hub
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSession(prev => ({ ...prev, currentView: 'tree' }))}
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:translate-x-1 ${
                      session.currentView === 'tree'
                        ? 'text-purple-900 bg-white/50 border border-white shadow-md'
                        : 'text-purple-950/70 hover:bg-white/10'
                    }`}
                  >
                    <Network className="w-5 h-5 text-purple-700" />
                    Node Tree
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSession(prev => ({ ...prev, currentView: 'flow' }))}
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:translate-x-1 ${
                      session.currentView === 'flow'
                        ? 'text-purple-900 bg-white/50 border border-white shadow-md'
                        : 'text-purple-950/70 hover:bg-white/10'
                    }`}
                  >
                    <Activity className="w-5 h-5 text-purple-700" />
                    Flow State
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSession(prev => ({ ...prev, currentView: 'gallery' }))}
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:translate-x-1 ${
                      session.currentView === 'gallery'
                        ? 'text-purple-900 bg-white/50 border border-white shadow-md'
                        : 'text-purple-950/70 hover:bg-white/10'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5 text-purple-700" />
                    Synthesis Gallery
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSession(prev => ({ ...prev, currentView: 'settings' }))}
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 hover:translate-x-1 ${
                      session.currentView === 'settings'
                        ? 'text-purple-900 bg-white/50 border border-white shadow-md'
                        : 'text-purple-950/70 hover:bg-white/10'
                    }`}
                  >
                    <SettingsIcon className="w-5 h-5 text-purple-700" />
                    Sync Settings
                  </button>
                </li>
              </ul>

              {/* Bottom Nav Actions */}
              <ul className="flex flex-col px-4 gap-1.5 mt-auto border-t border-purple-200/40 pt-4">
                <li>
                  <button
                    onClick={() => setSession(prev => ({ ...prev, currentView: 'settings' }))}
                    className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-bold text-sm text-purple-950/70 hover:bg-white/10 hover:translate-x-1 transition-all duration-300"
                  >
                    <HelpCircle className="w-5 h-5 text-purple-600/70" />
                    Help Specs
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-bold text-sm text-purple-950/70 hover:bg-red-500/10 hover:text-red-700 hover:translate-x-1 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5 text-red-600/70" />
                    Logout Resonance
                  </button>
                </li>
              </ul>
            </nav>
          )}

          {/* B. TOP HEADER BAR (Hidden in Flow State) */}
          {!isFlowState && (
            <header className="bg-white/30 backdrop-blur-3xl border-b border-white/20 w-full fixed top-0 left-0 h-20 z-40 flex justify-between items-center px-6 md:px-16 pl-6 md:pl-80 shadow-md">
              <div className="flex items-center gap-8">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tighter text-purple-900 animate-pulse">
                  Aetheria
                </h1>
                <nav className="hidden xl:flex ml-8">
                  <ul className="flex gap-6">
                    <li>
                      <button
                        onClick={() => setSession(prev => ({ ...prev, currentView: 'hub' }))}
                        className={`text-sm font-semibold uppercase tracking-wider py-2 px-3 rounded-xl transition-all ${
                          session.currentView === 'hub' ? 'text-purple-900 bg-white/40' : 'text-purple-950/60 hover:bg-white/10'
                        }`}
                      >
                        Nexus Hub
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setSession(prev => ({ ...prev, currentView: 'tree' }))}
                        className={`text-sm font-semibold uppercase tracking-wider py-2 px-3 rounded-xl transition-all ${
                          session.currentView === 'tree' ? 'text-purple-900 bg-white/40 border-b-2 border-purple-600' : 'text-purple-950/60 hover:bg-white/10'
                        }`}
                      >
                        Dream Stream
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setSession(prev => ({ ...prev, currentView: 'gallery' }))}
                        className={`text-sm font-semibold uppercase tracking-wider py-2 px-3 rounded-xl transition-all ${
                          session.currentView === 'gallery' ? 'text-purple-900 bg-white/40' : 'text-purple-950/60 hover:bg-white/10'
                        }`}
                      >
                        Collaborators
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Trailing Settings/Profile aura widget */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSession(prev => ({ ...prev, currentView: 'settings' }))}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-purple-950/60 hover:bg-white/30 border border-transparent hover:border-white transition-all shadow-sm"
                >
                  <Bell className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSession(prev => ({ ...prev, currentView: 'settings' }))}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-purple-950/60 hover:bg-white/30 border border-transparent hover:border-white transition-all shadow-sm"
                >
                  <Sliders className="w-4 h-4" />
                </button>
                {/* Profile circular celestial avatar picture representing a digital dreamer */}
                <div
                  onClick={() => setSession(prev => ({ ...prev, currentView: 'settings' }))}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-300 overflow-hidden border-2 border-white/60 cursor-pointer hover:scale-105 transition-transform shadow-[0_0_15px_rgba(219,184,255,0.6)]"
                >
                  <img
                    alt="Dreamer celestial portrait"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAT8VTkyQGuPhmvZ0yNjXxhFdbkgHSJFYP0-xa28ko_MzDvAeqlaBUPR6tZEUY6PUMt78Uln2WgrZQuIZACNIKXCHsl9nCg9UB2Bw4wLXFdg8wm7jIuH2cS7nNgyxWYDPDqA5deZdkLa7KRwbhtaK8GU97EK9yoZ8MrF01DczyOQ74R8IVvhnAxGLNbUp2CW0TEqg4ysOLkjrckvQe60d0S0Po7gVbQcvdD9t7CK-Hc_UfocrdLnEf"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </header>
          )}

          {/* C. MAIN WORKSPACE VIEW ROUTER */}
          <div className={`flex-grow h-full w-full ${!isFlowState ? 'pl-0 md:pl-72' : ''}`}>
            
            {/* If Flow State: Immersive full-screen interactive shader and particle experience */}
            {isFlowState && (
              <FlowStateView
                partnerFrequency={session.partnerFrequency}
                fragments={session.fragments}
                onWhisper={handleWhisper}
                isWhispering={isWhispering}
                onBack={() => setSession(prev => ({ ...prev, currentView: 'hub' }))}
                selectedVibe={session.selectedVibe}
              />
            )}

            {/* View router condition */}
            {session.currentView === 'hub' && (
              <MainHub
                userName={session.userName}
                partnerName={session.partnerName}
                partnerFrequency={session.partnerFrequency}
                fragments={session.fragments}
                nodes={session.nodes}
                history={session.history}
                galleryItems={session.galleryItems}
                onWhisper={handleWhisper}
                isWhispering={isWhispering}
                onUpdateNodePosition={handleUpdateNodePosition}
                selectedVibe={session.selectedVibe}
                entropySpeed={session.entropySpeed}
                canvasMode={session.canvasMode}
                activeNodeId={session.activeNodeId}
                users={session.users}
                onUpdateAesthetic={handleUpdateAesthetic}
                onSelectNodeId={handleSelectNodeId}
              />
            )}

            {session.currentView === 'tree' && (
              <NodeTree
                nodes={session.nodes}
                history={session.history}
                onAddCustomNode={handleAddCustomNode}
                isAddingNode={isAddingNode}
                onUpdateNodePosition={handleUpdateNodePosition}
                onSelectNode={(node) => handleSelectNodeId(node.id)}
              />
            )}

            {session.currentView === 'gallery' && (
              <GalleryView
                galleryItems={session.galleryItems}
                onStartNewDream={() => setSession(prev => ({ ...prev, currentView: 'hub' }))}
                onSyncDream={handleSyncDream}
              />
            )}

            {session.currentView === 'settings' && (
              <SettingsView
                partnerFrequency={session.partnerFrequency}
                onUpdateFrequency={(freq) => setSession(prev => ({ ...prev, partnerFrequency: freq }))}
                shaderIntensity={shaderIntensity}
                onUpdateShaderIntensity={setShaderIntensity}
              />
            )}
          </div>

          {/* D. MOBILE NAVIGATION BAR (Hidden in Flow State) */}
          {!isFlowState && (
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm rounded-full border border-white/50 shadow-xl flex justify-around items-center p-2.5 z-50 bg-white/40 backdrop-blur-2xl">
              <button
                onClick={() => setSession(prev => ({ ...prev, currentView: 'hub' }))}
                className={`p-3 rounded-full transition-all ${
                  session.currentView === 'hub' ? 'bg-purple-100 text-purple-800 shadow-md border border-white scale-105' : 'text-purple-950/60'
                }`}
              >
                <Cloud className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSession(prev => ({ ...prev, currentView: 'tree' }))}
                className={`p-3 rounded-full transition-all ${
                  session.currentView === 'tree' ? 'bg-purple-100 text-purple-800 shadow-md border border-white scale-105' : 'text-purple-950/60'
                }`}
              >
                <Network className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSession(prev => ({ ...prev, currentView: 'flow' }))}
                className={`p-3 rounded-full transition-all ${
                  session.currentView === 'flow' ? 'bg-purple-100 text-purple-800 shadow-md border border-white scale-105' : 'text-purple-950/60'
                }`}
              >
                <Activity className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSession(prev => ({ ...prev, currentView: 'gallery' }))}
                className={`p-3 rounded-full transition-all ${
                  session.currentView === 'gallery' ? 'bg-purple-100 text-purple-800 shadow-md border border-white scale-105' : 'text-purple-950/60'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSession(prev => ({ ...prev, currentView: 'settings' }))}
                className={`p-3 rounded-full transition-all ${
                  session.currentView === 'settings' ? 'bg-purple-100 text-purple-800 shadow-md border border-white scale-105' : 'text-purple-950/60'
                }`}
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </nav>
          )}

        </div>
      )}
    </div>
  );
}
