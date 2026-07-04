/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DreamNode {
  id: string;
  label: string;
  icon: string; // Lucide icon name, e.g., 'Sparkles', 'Hub', 'Network', 'Droplet', 'Ear', 'BookOpen'
  description: string;
  x: number; // Percentage coordinate on canvas, e.g. 45
  y: number; // Percentage coordinate on canvas, e.g. 35
  colorClass: string; // Tailwind color accent
  parentId?: string; // ID of the parent node
  timestamp: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  gradient: string; // CSS inline gradient or Tailwind class combination
  imageUrl?: string; // Hotlinked or generated image
  vibe: 'lucid' | 'fluid' | 'calm' | 'pastel' | 'energetic' | 'ambient' | 'soft' | 'expansive';
  date: string;
}

export interface DreamFragment {
  id: string;
  text: string;
  icon: string; // Lucide icon name, e.g., 'Cloud', 'Trees', 'Hearing', 'Eye'
  type: string; // e.g. "Memory", "Echo", "Whisper", "Vision"
  color: string; // e.g. "primary", "secondary", "tertiary"
  rotation: string; // e.g. "-rotate-2", "rotate-1", etc.
  translateY: string; // e.g. "translate-y-4"
}

export interface DreamAction {
  id: string;
  time: string;
  text: string;
  active?: boolean;
}

export interface CoDreamSession {
  userName: string;
  partnerName: string;
  partnerFrequency: string;
  isSynchronized: boolean;
  currentView: 'hub' | 'tree' | 'gallery' | 'flow' | 'settings';
  nodes: DreamNode[];
  galleryItems: GalleryItem[];
  fragments: DreamFragment[];
  history: DreamAction[];
  users?: string[];
  activeNodeId?: string;
  selectedVibe?: string;
  entropySpeed?: number;
  canvasMode?: 'flow' | 'crystalline';
}
