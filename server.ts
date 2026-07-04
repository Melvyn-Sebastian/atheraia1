/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const defaultNodes = [
  {
    id: "node-nexus",
    label: "Nexus",
    icon: "Hub",
    description: "The core anchor of the collaborative dreaming state. All paths flow from here.",
    x: 50,
    y: 50,
    colorClass: "primary",
    timestamp: "02:14 AM"
  },
  {
    id: "node-cavern",
    label: "Cavern",
    icon: "Sparkles",
    description: "An ancient cavern glowing with crystal shards and echoes of memories.",
    x: 30,
    y: 35,
    colorClass: "secondary",
    parentId: "node-nexus",
    timestamp: "02:14 AM"
  },
  {
    id: "node-mirrors",
    label: "Mirrors",
    icon: "Network",
    description: "A shifting forest of reflective panes revealing parallel subconscious timelines.",
    x: 70,
    y: 25,
    colorClass: "tertiary",
    parentId: "node-nexus",
    timestamp: "02:30 AM"
  },
  {
    id: "node-river",
    label: "River",
    icon: "Waves",
    description: "A liquid silver stream flowing backwards, carrying lost fragments of thoughts.",
    x: 50,
    y: 75,
    colorClass: "accent",
    parentId: "node-nexus",
    timestamp: "03:15 AM"
  },
  {
    id: "node-echoes",
    label: "Echoes",
    icon: "Ear",
    description: "Residual vibrations of sounds and voices left behind in the dream scape.",
    x: 15,
    y: 20,
    colorClass: "secondary",
    parentId: "node-cavern",
    timestamp: "02:14 AM"
  },
  {
    id: "node-archivist",
    label: "Archivist",
    icon: "BookOpen",
    description: "The dream librarian, organizing symbols and narrative paths into records.",
    x: 85,
    y: 80,
    colorClass: "neutral",
    parentId: "node-mirrors",
    timestamp: "03:15 AM"
  }
];

const defaultFragments = [
  {
    id: "f1",
    text: "Neon rain on glass...",
    icon: "Cloud",
    type: "Memory",
    color: "primary",
    rotation: "-rotate-2",
    translateY: "translate-y-12"
  },
  {
    id: "f2",
    text: "Floating silver forests drifting slowly upwards.",
    icon: "Trees",
    type: "Vision",
    color: "secondary",
    rotation: "rotate-1",
    translateY: "-translate-y-8"
  }
];

const defaultHistory = [
  { id: "h1", time: "02:14 AM", text: "Synchronized with AETHER-7.83HZ. Consciousness channel established." },
  { id: "h2", time: "02:30 AM", text: "Entered the crystal cavern. Whispers of past echoes detected." },
  { id: "h3", time: "03:15 AM", text: "Initial dream tree map successfully loaded and stabilized." }
];

const defaultGalleryItems = [
  {
    id: "g1",
    title: "Midnight Echoes",
    description: "Translucent magenta, periwinkle, and pale cyan ribbons of liquid glass catching soft glowing light reflections. High-end light mode digital etherealism.",
    tags: ["Lucid", "Fluid"],
    gradient: "linear-gradient(135deg, #efdbff, #bee9ff)",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoIegpfxESseYvP2Cd4UhgxaHo4wNAOm6-6bGfIuPvyaJKYjd_eL75KxCprJUc03grg47l5o5i3mNwBl1noEV4hHUBElwGScYBXhEIbUG_yJ3_smh62GkL2WysBmiNhfetC1fLrf0XAWhqU6vlv_urNvv-lJUxVuLSPFDAT4FalGkBzwoVF1p_zRgnFEpb2Hk-IMpcxSscTqDdYNrAcu9I4qLzXhGwh4I0RGQkJpyKITwgOgsykOlC",
    vibe: "lucid",
    date: "Just Now"
  },
  {
    id: "g2",
    title: "Luminescent Drift",
    description: "Gentle waves of pearlescent pink and soft teal drifting lazily over a clean, bright canvas. Layered semi-transparent liquid shapes.",
    tags: ["Calm", "Pastel"],
    gradient: "linear-gradient(135deg, #ffd8ed, #bee9ff)",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAg6tZ-whJGbmmYFPDzKAxXwFfxNhRs4tMBp_7Yz0hGFGbgG1rqLhIGcNBolpdIERr6WtIKw5tXUei8gf8qca9kMrIqtq6TXzDo6yTwo8970L1jVo86piIz_r9SNQ7FQlOo7dTUHfS9i0wTkWkFMUiQZhe-uRxm6NeNV-w4vstwJCeB5aUSSkZ1aK6xd2wF-waRpVQb2FbeGVh3jo0P6kyHESaL-riNSV4sdpf__0vvXsbIbfBXIi0X",
    vibe: "calm",
    date: "10m ago"
  },
  {
    id: "g3",
    title: "Astral Resonance",
    description: "Vibrant streaks of lavender and gold flowing dynamically through a suspended, transparent crystalline structure. Macro shot of digital fluid anomaly.",
    tags: ["Energetic"],
    gradient: "linear-gradient(135deg, #efdbff, #fdd0ea)",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUt7Xa1JPNm6z_vZ5FmUHXou84JiHKEvEvUsBIR9Ak6t-YqJtADHDlY9naxwqsGzMCO6_v3XYNaJvy5uBANgG3IVcw8DZFp3rSwrST_VyEzBEzrGfgGVfvH2I38SWvtJrF8lrnv4YeGAqiPHOKSq53lCPa7dOZsI7GWaWoBjq7i0pybRP7o7p8bBRb4KNsOugafmHeXx1wl_RlNe5Fj_gUX1FSonXQHrqby__-0PS4ar8-oHpfjVt8",
    vibe: "energetic",
    date: "30m ago"
  },
  {
    id: "g4",
    title: "Whispering Void",
    description: "Soft, billowing clouds of color in shades of muted rose, ice blue, and pale lilac bleeding into each other softly like watercolor on a wet, glowing canvas.",
    tags: ["Ambient", "Soft"],
    gradient: "linear-gradient(135deg, #fdd0ea, #bee9ff)",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4z5ZdFdkm17lAIFFWNH4SR8sS7TLcDrvdgV31QLZcgPqCG2zMWbHL-HAt2IKTjFrpVKiMCGClcAgSewuWdzDRV4kRbnyQLtilspyTx4_A1DnK56VL24U7HcrkqgJWHFtstDCcoZPwxYqp3jYnlN0wgLNBgnKcNNJgqdQpape6wE24vW1GSM9rxHk4QeF3gzQz3ilnqZU2Lc3OpqFef-WFtT-GDyv2xjEQhd8MVgzSuWs0I_LMI1LM",
    vibe: "ambient",
    date: "1h ago"
  },
  {
    id: "g5",
    title: "Crystalline Horizon",
    description: "A sweeping panoramic view of a digital fluid landscape. Smooth, rolling waves of iridescent silver, pale violet, and soft mint green intermingle against an intensely bright backdrop.",
    tags: ["Expansive"],
    gradient: "linear-gradient(135deg, #eceef0, #efdbff)",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLPKFgu5XQfeqD4gqVxCZxMB7-C8Lw1Hc05tPFBH9IEYlIOz_VwqFs_ujXHIl_QYiFBCWIQ0G-3lMgqBGEBKYyyFTP1H2gIh5-fcNVYtVfsIR2Dx9h-DQGjPHxLxviBFUWC15krLTimvVIl2A8wvIZxCc-ig8dWgdazNKpMCWNLTq-CIMbiOQC5FLpzG8qOKxbxB9L2uyBS5EMJXAkCl__goDMm7Oo85hYTKB1osPQsg2eg7yvTZJz",
    vibe: "expansive",
    date: "2h ago"
  }
];

interface DreamNode {
  id: string;
  label: string;
  icon: string;
  description: string;
  x: number;
  y: number;
  colorClass: string;
  parentId?: string;
  timestamp: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  gradient: string;
  imageUrl?: string;
  vibe: string;
  date: string;
}

interface DreamFragment {
  id: string;
  text: string;
  icon: string;
  type: string;
  color: string;
  rotation: string;
  translateY: string;
}

interface DreamAction {
  id: string;
  time: string;
  text: string;
  active?: boolean;
}

interface RoomSession {
  userName: string;
  partnerName: string;
  partnerFrequency: string;
  isSynchronized: boolean;
  currentView: string;
  nodes: DreamNode[];
  galleryItems: GalleryItem[];
  fragments: DreamFragment[];
  history: DreamAction[];
  users: string[];
  activeNodeId: string;
  selectedVibe: string;
  entropySpeed: number;
  canvasMode: 'flow' | 'crystalline';
  lastActive: number;
}

const roomSessions = new Map<string, RoomSession>();

function getOrCreateRoomSession(frequency: string, userName?: string): RoomSession {
  const freqNormalized = (frequency || "LYRA-440HZ").trim().toUpperCase();
  let session = roomSessions.get(freqNormalized);
  if (!session) {
    session = {
      userName: userName || "Subconscious Observer",
      partnerName: "Lyra",
      partnerFrequency: freqNormalized,
      isSynchronized: true,
      currentView: 'hub',
      nodes: [...defaultNodes],
      galleryItems: [...defaultGalleryItems],
      fragments: [...defaultFragments],
      history: [...defaultHistory],
      users: userName ? [userName] : [],
      activeNodeId: "node-nexus",
      selectedVibe: "fluid",
      entropySpeed: 1.0,
      canvasMode: "flow",
      lastActive: Date.now()
    };
    roomSessions.set(freqNormalized, session);
  } else if (userName && !session.users.includes(userName)) {
    session.users.push(userName);
  }
  session.lastActive = Date.now();
  return session;
}

// 1. Synchronize API - starts a beautiful dreaming session based on user name
app.post("/api/dream/synchronize", (req, res) => {
  try {
    const { userName, partnerFrequency } = req.body;
    if (!userName) {
      return res.status(400).json({ error: "Your Essence name is required" });
    }

    const frequency = partnerFrequency ? partnerFrequency.toUpperCase() : "LYRA-440HZ";
    const session = getOrCreateRoomSession(frequency, userName);
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.5 Polling API - syncs session variables in real-time
app.get("/api/dream/poll", (req, res) => {
  try {
    const { frequency, userName } = req.query;
    if (!frequency) {
      return res.status(400).json({ error: "Frequency parameter is required" });
    }
    const session = getOrCreateRoomSession(frequency as string, userName as string);
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.6 Update node coordinates to sync across rooms
app.post("/api/dream/update-node-position", (req, res) => {
  try {
    const { frequency, id, x, y } = req.body;
    if (!frequency || !id) {
      return res.status(400).json({ error: "Frequency and Node ID are required" });
    }
    const session = getOrCreateRoomSession(frequency);
    session.nodes = session.nodes.map(n => n.id === id ? { ...n, x, y } : n);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.7 Selection of active node (Focus/Branches update)
app.post("/api/dream/select-node", (req, res) => {
  try {
    const { frequency, id, userName } = req.body;
    if (!frequency || !id) {
      return res.status(400).json({ error: "Frequency and Node ID are required" });
    }
    const session = getOrCreateRoomSession(frequency);
    session.activeNodeId = id;
    
    const node = session.nodes.find(n => n.id === id);
    if (node) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      session.history = [
        {
          id: `h-sel-${Date.now()}`,
          time: timestamp,
          text: `[Focus State] Observer "${userName || 'Subconscious Observer'}" focused onto branch: "${node.label}"`
        },
        ...session.history
      ];
    }
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.8 Update visual preset/modifiers instantly
app.post("/api/dream/update-aesthetic", (req, res) => {
  try {
    const { frequency, selectedVibe, entropySpeed, canvasMode } = req.body;
    if (!frequency) {
      return res.status(400).json({ error: "Frequency is required" });
    }
    const session = getOrCreateRoomSession(frequency);
    if (selectedVibe !== undefined) session.selectedVibe = selectedVibe;
    if (entropySpeed !== undefined) session.entropySpeed = entropySpeed;
    if (canvasMode !== undefined) session.canvasMode = canvasMode;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Whisper/Shared Dream Engine API - Uses Gemini to dynamically expand the dream!
app.post("/api/dream/whisper", async (req, res) => {
  try {
    const { userName, whisper, frequency, parentNodeId } = req.body;
    if (!whisper) {
      return res.status(400).json({ error: "Whisper is required to enter the dream engine." });
    }

    const freqNormalized = frequency ? frequency.toUpperCase() : "LYRA-440HZ";
    const session = getOrCreateRoomSession(freqNormalized, userName);

    console.log(`[Shared Dream Engine] Analyzing whisper: "${whisper}" from user: "${userName}" in room: "${freqNormalized}"`);

    // Prioritize parent branch selection
    const activeBranchPoint = parentNodeId || session.activeNodeId || 'node-nexus';
    const parentNodeObj = session.nodes.find(n => n.id === activeBranchPoint) || session.nodes[0];

    const existingNodeDetails = session.nodes
      .map((n: any) => `- Node ID: "${n.id}", Label: "${n.label}" (Parent: "${n.parentId || 'None'}")`)
      .join("\n");

    const systemPrompt = `You are the Shared Dream Engine for Aetheria, a collaborative digital dream synthesis platform.
Your job is to analyze the user's input thought ("whisper") and integrate it into the collective dream space.
Based on the input: "${whisper}" whispered by "${userName || 'Subconscious Observer'}", you must generate:
1. A new Dream History log entry summarizing this integration. Mention that it is authored or initiated by "${userName}".
2. A new floating "Dream Fragment" card containing a short, evocative poetic quote (5-10 words) expressing the dream imagery, selecting an appropriate Lucide icon name, type, and color scheme.
3. A new "Synthesis Gallery" artwork entry. Choose an ethereal title, a high-fidelity detailed description of a fluid/pearl/holographic visual scene, 2-3 tags, and a gradient palette theme.
4. A new "Dream Node" in the interactive tree. The user has specifically requested or focused on branching from node "${activeBranchPoint}" (Label: "${parentNodeObj.label}"). Thus, set the 'parentId' to exactly "${activeBranchPoint}". Suggest an elegant descriptive label, appropriate icon name, description, and coordinate offsets.

List of existing nodes:
${existingNodeDetails}

You must return a strictly valid JSON response containing these fields exactly. No extra markdown, no backticks, no comments, just the pure JSON.`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            historyAction: {
              type: Type.STRING,
              description: "A short status action for the log sidebar, e.g. 'Alice synthesized the forest wind. Formed branch from Cavern.'"
            },
            newFragment: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "A highly poetic, beautiful 5-10 word quote representing the whisper. Wrap in double quotes." },
                icon: { type: Type.STRING, description: "An icon name, strictly select from: 'Cloud', 'Trees', 'Activity', 'Wind', 'Sparkles', 'Heart', 'Moon', 'Sun', 'Waves', 'Eye', 'Flame', 'Volume2', 'Anchor', 'Feather'" },
                type: { type: Type.STRING, description: "One of: 'Memory', 'Echo', 'Vision', 'Whisper', 'Glow', 'Anima'" },
                color: { type: Type.STRING, description: "One of: 'primary', 'secondary', 'tertiary'" }
              },
              required: ["text", "icon", "type", "color"]
            },
            newGalleryItem: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "An elegant, evocative title for the dream synthesis gallery, e.g. 'Starlight Cascade'" },
                description: { type: Type.STRING, description: "A high-fidelity detailed paragraph describing the pearlescent/liquid/glass/surreal light mode aesthetic of this dream synthesis." },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "2-3 short, clean tags, e.g. ['Ethereal', 'Holographic', 'Warm']"
                },
                gradient: { type: Type.STRING, description: "A valid CSS background gradient, e.g. 'linear-gradient(135deg, #efdbff, #bee9ff)'" },
                vibe: { type: Type.STRING, description: "One of: 'lucid', 'fluid', 'calm', 'pastel', 'energetic', 'ambient', 'soft', 'expansive'" }
              },
              required: ["title", "description", "tags", "gradient", "vibe"]
            },
            newNode: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "A short 1-2 word name of the new branching node, e.g. 'Stardust'" },
                icon: { type: Type.STRING, description: "严格限定为: 'Sparkles', 'Hub', 'Network', 'Droplet', 'Ear', 'BookOpen', 'Waves', 'Compass', 'Eye', 'Heart', 'Sun', 'Moon'" },
                description: { type: Type.STRING, description: "A single sentence explaining what this sub-conscious branch represents." },
                parentId: { type: Type.STRING, description: "Must be set exactly to the requested branch parent: " + activeBranchPoint },
                x: { type: Type.INTEGER, description: "A custom X percentage coordinate, e.g. between 10 and 90, relatively close to the parent's coordinates" },
                y: { type: Type.INTEGER, description: "A custom Y percentage coordinate, e.g. between 15 and 85, relatively close to the parent's coordinates" }
              },
              required: ["label", "icon", "description", "parentId", "x", "y"]
            }
          },
          required: ["historyAction", "newFragment", "newGalleryItem", "newNode"]
        }
      }
    });

    const resultText = response.text || "";
    console.log("[Shared Dream Engine] Raw result from Gemini:", resultText);
    const parsedData = JSON.parse(resultText);

    // Formulate unique IDs
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newFragId = `f-gen-${Date.now()}`;
    const newGalId = `g-gen-${Date.now()}`;
    const newNodeId = `node-gen-${Date.now()}`;
    const newLogId = `h-gen-${Date.now()}`;

    // Assemble state items
    const generatedFragment: DreamFragment = {
      id: newFragId,
      text: parsedData.newFragment.text,
      icon: parsedData.newFragment.icon,
      type: parsedData.newFragment.type,
      color: parsedData.newFragment.color,
      rotation: Math.random() > 0.5 ? 'rotate-2' : '-rotate-1',
      translateY: Math.random() > 0.5 ? 'translate-y-4' : '-translate-y-4'
    };

    const vibeImages: Record<string, string> = {
      lucid: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop',
      fluid: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      calm: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?q=80&w=600&auto=format&fit=crop',
      pastel: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
      energetic: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop',
      ambient: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop',
      soft: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=600&auto=format&fit=crop',
      expansive: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=600&auto=format&fit=crop'
    };

    const vibeLower = (parsedData.newGalleryItem.vibe || 'fluid').toLowerCase();
    const assignedImageUrl = vibeImages[vibeLower] || vibeImages.fluid;

    const generatedGalleryItem: GalleryItem = {
      id: newGalId,
      title: parsedData.newGalleryItem.title,
      description: parsedData.newGalleryItem.description,
      tags: parsedData.newGalleryItem.tags,
      gradient: parsedData.newGalleryItem.gradient,
      vibe: parsedData.newGalleryItem.vibe,
      imageUrl: assignedImageUrl,
      date: 'Just Synthesized'
    };

    const generatedNode: DreamNode = {
      id: newNodeId,
      label: parsedData.newNode.label,
      icon: parsedData.newNode.icon,
      description: parsedData.newNode.description,
      x: parsedData.newNode.x,
      y: parsedData.newNode.y,
      colorClass: parsedData.newFragment.color === 'primary' ? 'primary' : parsedData.newFragment.color === 'secondary' ? 'secondary' : 'sky',
      parentId: activeBranchPoint,
      timestamp
    };

    // Update session arrays securely in-place
    session.nodes.push(generatedNode);
    
    const updatedFragments = [...session.fragments, generatedFragment];
    if (updatedFragments.length > 4) {
      updatedFragments.shift();
    }
    session.fragments = updatedFragments;
    
    session.galleryItems.unshift(generatedGalleryItem);
    
    session.history = [
      { id: newLogId, time: timestamp, text: parsedData.historyAction, active: true },
      ...session.history.map(h => ({ ...h, active: false }))
    ];

    // Propagate latest visual states
    session.activeNodeId = newNodeId;
    session.selectedVibe = parsedData.newGalleryItem.vibe;

    res.json(session);
  } catch (error: any) {
    console.error("[Shared Dream Engine] Error in /api/dream/whisper:", error);
    res.status(500).json({ error: error.message || "An error occurred inside the Shared Dream Engine." });
  }
});

// Serve frontend assets & mount Vite dev server in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Aetheria Server] Running in Development Mode. Initializing Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Aetheria Server] Running in Production Mode. Serving static build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aetheria Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
