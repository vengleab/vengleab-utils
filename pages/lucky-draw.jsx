import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Trash2,
  RotateCcw,
  History,
  Info,
  Gift,
  HelpCircle,
  Play
} from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";

// Curated Sleek Color Palettes (HSL Harmonious Segments)
const THEMES = {
  vibrant: [
    { bg: "hsl(217, 91%, 60%)", text: "#fff" }, // Blue
    { bg: "hsl(326, 85%, 55%)", text: "#fff" }, // Pink
    { bg: "hsl(142, 70%, 45%)", text: "#fff" }, // Green
    { bg: "hsl(36, 100%, 55%)", text: "#fff" },  // Orange
    { bg: "hsl(270, 76%, 53%)", text: "#fff" },  // Purple
    { bg: "hsl(180, 75%, 40%)", text: "#fff" }   // Teal
  ],
  neon: [
    { bg: "hsl(317, 100%, 54%)", text: "#fff" }, // Neon Pink
    { bg: "hsl(187, 100%, 42%)", text: "#fff" }, // Neon Cyan
    { bg: "hsl(80, 100%, 50%)", text: "#000" },  // Neon Lime
    { bg: "hsl(27, 100%, 50%)", text: "#fff" },  // Neon Orange
    { bg: "hsl(267, 100%, 60%)", text: "#fff" }, // Neon Indigo
    { bg: "hsl(52, 100%, 50%)", text: "#000" }   // Neon Yellow
  ],
  gold: [
    { bg: "hsl(43, 74%, 49%)", text: "#fff" },   // Gold
    { bg: "hsl(26, 48%, 32%)", text: "#fff" },   // Dark Bronze
    { bg: "hsl(43, 85%, 65%)", text: "#3b2f0f" }, // Light Champagne
    { bg: "hsl(19, 52%, 46%)", text: "#fff" },   // Rose Gold
    { bg: "hsl(45, 60%, 25%)", text: "#fff" },   // Deep Chocolate
    { bg: "hsl(41, 100%, 45%)", text: "#fff" }    // Classic Golden Amber
  ]
};

const DEFAULT_PARTICIPANTS = [
  "Sofia Rodriguez",
  "Ethan Chen",
  "Liam Gallagher",
  "Mia Novak",
  "Olivia Taylor",
  "Yuki Tanaka",
  "Omar Al-Fayed",
  "Amara Okafor",
  "Lucas Silva",
  "Emma Watson"
];

const PRESETS = {
  names: DEFAULT_PARTICIPANTS,
  prizes: [
    "Grand Prize 🌟 iPad Pro",
    "Gold Prize 📱 iPhone 15",
    "Silver Prize 🎧 AirPods Pro",
    "Bronze Prize 🎫 Gift Card $50",
    "Lucky Prize ☕ Branded Mug",
    "Try Again Tomorrow ☘️"
  ],
  numbers: ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010"]
};

// ----------------------------------------------------
// NATIVE WEB AUDIO API SYNTHESIZER
// ----------------------------------------------------
let audioCtx = null;
const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
};

const playTickSound = (freq = 600, duration = 0.05, volume = 0.1) => {
  try {
    initAudio();
    if (!audioCtx || audioCtx.state === "suspended") return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn("Audio Context blocked or failed:", e);
  }
};

const playWinSound = () => {
  try {
    initAudio();
    if (!audioCtx || audioCtx.state === "suspended") return;
    const now = audioCtx.currentTime;
    // Multi-tone arpeggio fanfare in C major
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  } catch (e) {
    console.warn(e);
  }
};

const playScratchSound = () => {
  // Synthesize a quick white noise sand friction noise
  try {
    initAudio();
    if (!audioCtx || audioCtx.state === "suspended") return;
    const now = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 0.02; // very short click noise
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1000 + Math.random() * 2000;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } catch (e) {
    // fallback to quick low sine
    playTickSound(150, 0.01, 0.02);
  }
};

// ----------------------------------------------------
// LIGHTWEIGHT CONFETTI PARTICLE SYSTEM
// ----------------------------------------------------
class ConfettiParticle {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = Math.random() * canvasWidth;
    this.y = -10 - Math.random() * 40;
    this.size = Math.random() * 8 + 6;
    this.color = `hsl(${Math.random() * 360}, 90%, 65%)`;
    this.vx = Math.random() * 4 - 2;
    this.vy = Math.random() * 5 + 4;
    this.gravity = 0.15;
    this.opacity = 1;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 8 - 4;
    this.wobble = Math.random() * 2 * Math.PI;
    this.wobbleSpeed = Math.random() * 0.05 + 0.02;
  }

  update() {
    this.y += this.vy;
    this.x += this.vx + Math.sin(this.wobble) * 1.5;
    this.vy += this.gravity;
    this.vx *= 0.99;
    this.wobble += this.wobbleSpeed;
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

// ----------------------------------------------------
// MAIN REACT EXPORT
// ----------------------------------------------------
export default function LuckyDrawTools() {
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS);
  const [inputText, setInputText] = useState(DEFAULT_PARTICIPANTS.join("\n"));
  const [activeTab, setActiveTab] = useState("wheel"); // 'wheel', 'slots', 'gift', 'scratch'
  const [winnersHistory, setWinnersHistory] = useState([]);
  const [removeOnWin, setRemoveOnWin] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [activeTheme, setActiveTheme] = useState("vibrant");
  const [drawResult, setDrawResult] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // References for Canvas rendering
  const wheelCanvasRef = useRef(null);
  const scratchCanvasRef = useRef(null);
  const confettiCanvasRef = useRef(null);

  // Confetti state
  const confettiParticles = useRef([]);
  const confettiAnimId = useRef(null);

  // Scratch specific state
  const [scratchWinner, setScratchWinner] = useState("");
  const [scratchProgress, setScratchProgress] = useState(0);
  const [scratchCleaned, setScratchCleaned] = useState(false);
  const isScratching = useRef(false);

  // Wheel configuration
  const wheelRotation = useRef(0);
  const wheelSpeed = useRef(0);
  const animFrameId = useRef(null);
  const prevActiveSegmentIndex = useRef(-1);

  // Load state and audio authorization on mount
  useEffect(() => {
    // Attempt local storage recall
    const cachedHistory = localStorage.getItem("lucky_draw_history");
    if (cachedHistory) {
      try {
        setWinnersHistory(JSON.parse(cachedHistory));
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  const handleInputChange = (text) => {
    setInputText(text);
    const parsed = text
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setParticipants(parsed);
  };

  const applyPreset = (presetKey) => {
    const list = PRESETS[presetKey];
    setInputText(list.join("\n"));
    setParticipants(list);
  };

  const addWinnerToHistory = (winner) => {
    const nextHistory = [
      { name: winner, time: new Date().toLocaleTimeString(), id: Date.now() },
      ...winnersHistory
    ];
    setWinnersHistory(nextHistory);
    localStorage.setItem("lucky_draw_history", JSON.stringify(nextHistory));

    if (removeOnWin) {
      const remaining = participants.filter((p) => p !== winner);
      setParticipants(remaining);
      setInputText(remaining.join("\n"));
    }
  };

  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.parentElement.clientWidth * dpr;
    canvas.height = canvas.parentElement.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    confettiParticles.current = [];
    for (let i = 0; i < 150; i++) {
      confettiParticles.current.push(
        new ConfettiParticle(canvas.width / dpr, canvas.height / dpr)
      );
    }

    const animateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      let active = false;
      confettiParticles.current.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
        if (particle.y < particle.canvasHeight) {
          active = true;
        }
      });

      if (active) {
        confettiAnimId.current = requestAnimationFrame(animateConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    };
    cancelAnimationFrame(confettiAnimId.current);
    animateConfetti();
  };

  const handleDrawFinish = (winner) => {
    setDrawResult(winner);
    setIsDrawing(false);
    setShowResultModal(true);
    if (!isSoundMuted) playWinSound();
    addWinnerToHistory(winner);
    setTimeout(() => {
      triggerConfetti();
    }, 100);
  };

  const clearHistory = () => {
    setWinnersHistory([]);
    localStorage.removeItem("lucky_draw_history");
  };

  // ----------------------------------------------------
  // WHEEL OF FORTUNE CORE ENGINE
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab !== "wheel") return;
    const canvas = wheelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(canvas.parentElement.clientWidth, 420);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const colors = THEMES[activeTheme];

    const drawWheel = () => {
      const radius = size / 2;
      ctx.clearRect(0, 0, size, size);

      if (participants.length === 0) {
        // Draw empty helper circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(radius, radius, radius - 15, 0, 2 * Math.PI);
        ctx.fillStyle = "#f1f5f9";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#cbd5e1";
        ctx.stroke();
        ctx.restore();

        // Empty message text
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 15px var(--font-sans)";
        ctx.textAlign = "center";
        ctx.fillText("Enter participants first", radius, radius);
        return;
      }

      const numSegments = participants.length;
      const anglePerSeg = (2 * Math.PI) / numSegments;

      // Draw shadow ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(radius, radius, radius - 8, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();

      // Draw Segments
      for (let i = 0; i < numSegments; i++) {
        const startAngle = wheelRotation.current + i * anglePerSeg;
        const endAngle = startAngle + anglePerSeg;
        const themeColor = colors[i % colors.length];

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius - 12, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = themeColor.bg;
        ctx.fill();

        // High gloss edge stroke
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Draw Labels
        ctx.save();
        ctx.translate(radius, radius);
        // Center text in segment wedge
        ctx.rotate(startAngle + anglePerSeg / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = themeColor.text;
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 2;

        // Cap names dynamically for aesthetics
        const name = participants[i];
        const dispName = name.length > 14 ? `${name.substring(0, 12)}...` : name;

        // Text sizing logic
        let fontSize = 14;
        if (numSegments > 12) fontSize = 11;
        if (numSegments > 24) fontSize = 8;
        ctx.font = `bold ${fontSize}px var(--font-sans)`;

        ctx.fillText(dispName, radius - 35, 0);
        ctx.restore();
      }

      // Outer Premium Frame Border
      ctx.save();
      ctx.beginPath();
      ctx.arc(radius, radius, radius - 12, 0, 2 * Math.PI);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#1e293b";
      ctx.stroke();
      ctx.restore();

      // Glowing outer dots (little round pegs)
      ctx.save();
      const dotCount = Math.max(12, numSegments);
      for (let i = 0; i < dotCount; i++) {
        const dotAngle = (i * 2 * Math.PI) / dotCount + wheelRotation.current;
        const x = radius + Math.cos(dotAngle) * (radius - 12);
        const y = radius + Math.sin(dotAngle) * (radius - 12);
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = "#fbbf24";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // Draw Center Hub Pin
      ctx.save();
      ctx.beginPath();
      ctx.arc(radius, radius, 24, 0, 2 * Math.PI);
      ctx.fillStyle = "#1e293b";
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 6;
      ctx.fill();

      // Golden inner ring
      ctx.beginPath();
      ctx.arc(radius, radius, 14, 0, 2 * Math.PI);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
      ctx.restore();
    };

    const renderLoop = () => {
      drawWheel();
      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animFrameId.current);
    };
  }, [participants, activeTab, activeTheme]);

  const spinWheel = () => {
    if (participants.length === 0 || isDrawing) return;
    setIsDrawing(true);
    setDrawResult(null);

    // Clicker sound check variables
    const numSegments = participants.length;
    const anglePerSeg = (2 * Math.PI) / numSegments;

    // Pick target winner index
    const winIdx = Math.floor(Math.random() * participants.length);
    const targetWinner = participants[winIdx];

    // Compute stopping angle relative to 0 position (right edge, i.e. 3 o'clock)
    // Pointer is pointing at 270 deg (top, i.e. 1.5 * PI)
    const pointerOffset = 1.5 * Math.PI;

    // Target stop angle in range
    const targetAngle = pointerOffset - (winIdx * anglePerSeg + anglePerSeg / 2);

    // Number of full rotations
    const spins = 6 + Math.random() * 3;
    const finalAngle = targetAngle + spins * 2 * Math.PI;

    const duration = 6500; // 6.5s smooth deceleration
    const start = performance.now();
    const startRotation = wheelRotation.current % (2 * Math.PI);

    // Sound tracker peg logic
    let totalTicks = 0;

    const animateWheel = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Easing cubic deceleration: 1 - (1 - x)^4
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentRot = startRotation + ease * (finalAngle - startRotation);
      wheelRotation.current = currentRot;

      // Track peg passing segment boundaries
      const totalSegAngleTraversed = currentRot / anglePerSeg;
      const currentSegmentPassed = Math.floor(totalSegAngleTraversed);

      if (currentSegmentPassed !== prevActiveSegmentIndex.current) {
        if (!isSoundMuted && progress < 0.95) {
          // Dynamic sound tone: slow down frequency pitch as rotation gets slower
          const velocity = (1 - progress) * 12 + 1;
          const pitch = 350 + (1 - progress) * 300;
          playTickSound(pitch, 0.03, 0.08);
        }
        prevActiveSegmentIndex.current = currentSegmentPassed;
      }

      if (progress < 1) {
        animFrameId.current = requestAnimationFrame(animateWheel);
      } else {
        handleDrawFinish(targetWinner);
      }
    };

    animFrameId.current = requestAnimationFrame(animateWheel);
  };

  // ----------------------------------------------------
  // MYSTERY Present BOX ENGINE
  // ----------------------------------------------------
  const [giftState, setGiftState] = useState("idle"); // 'idle', 'shaking', 'burst'

  const openGiftBox = () => {
    if (participants.length === 0 || isDrawing) return;
    setIsDrawing(true);
    setDrawResult(null);
    setGiftState("shaking");

    if (!isSoundMuted) {
      // Synthesize rhythmic shaking
      const shakeInterval = setInterval(() => {
        playTickSound(180, 0.08, 0.1);
      }, 250);
      setTimeout(() => clearInterval(shakeInterval), 2200);
    }

    // 2.5s dramatic shaking prior to opening
    setTimeout(() => {
      const winIdx = Math.floor(Math.random() * participants.length);
      const winnerName = participants[winIdx];
      setGiftState("burst");
      handleDrawFinish(winnerName);
    }, 2400);
  };

  const resetGiftBox = () => {
    setGiftState("idle");
    setDrawResult(null);
    setShowResultModal(false);
  };

  // ----------------------------------------------------
  // CANVAS SCRATCH CARD CARD CORE ENGINE
  // ----------------------------------------------------
  const initScratchCard = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 240 * dpr;
    canvas.style.height = "240px";
    ctx.scale(dpr, dpr);

    // Draw high quality silver metallic mask
    const width = rect.width;
    const height = 240;

    ctx.save();
    // Silver Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#94a3b8");
    gradient.addColorStop(0.25, "#e2e8f0");
    gradient.addColorStop(0.5, "#cbd5e1");
    gradient.addColorStop(0.75, "#cbd5e1");
    gradient.addColorStop(1, "#64748b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Textured speckles (brush feel)
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    for (let i = 0; i < 2000; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    for (let i = 0; i < 1500; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }

    // Call-to-action text
    ctx.fillStyle = "#334155";
    ctx.font = "bold 20px var(--font-sans)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
    ctx.shadowBlur = 4;
    ctx.fillText("SCRATCH CARD TO REVEAL!", width / 2, height / 2);
    ctx.restore();

    setScratchProgress(0);
    setScratchCleaned(false);
  };

  useEffect(() => {
    if (activeTab === "scratch") {
      // Pick winner on initial click/tab load
      if (participants.length > 0) {
        const rIdx = Math.floor(Math.random() * participants.length);
        setScratchWinner(participants[rIdx]);
      }
      setTimeout(initScratchCard, 100);
    }
  }, [activeTab, participants]);

  const handleScratchMove = (e) => {
    if (!isScratching.current || scratchCleaned) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    // Get client position
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Erase circles where the pointer slides
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    if (!isSoundMuted && Math.random() < 0.25) {
      playScratchSound();
    }

    // Performance optimized throttle calculation
    if (Math.random() < 0.08) {
      calculateScratchPercent();
    }
  };

  const calculateScratchPercent = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width;
    const height = canvas.height;

    // Fast image buffer sampling (grid-sample, not whole buffer)
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let transparent = 0;
    const total = 250; // sample 250 pixels
    const step = Math.floor(data.length / (total * 4));

    for (let i = 0; i < total; i++) {
      if (data[i * step * 4 + 3] === 0) {
        transparent++;
      }
    }

    const percent = Math.floor((transparent / total) * 100);
    setScratchProgress(percent);

    if (percent > 45 && !scratchCleaned) {
      // Clear entire card with gold flash
      setScratchCleaned(true);
      ctx.clearRect(0, 0, width / dpr, height / dpr);
      handleDrawFinish(scratchWinner);
    }
  };

  return (
    <PageContext.Provider value={{ activeItem: PAGE.LUCKY_DRAW }}>
      <Layout
        title="Lucky Draw Tools"
        description="A beautiful, interactive circular wheel of fortune, physical gift mystery boxes, and high-fidelity scratch cards."
      >
        <div className="max-w-6xl mx-auto pb-16">
          {/* Header Description */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                Lucky Draw Tools
              </h1>
              <p className="mt-2 text-slate-500 max-w-xl text-sm font-medium">
                Sleek, highly-gamified interactive tools for party events, gift giveaways, or split picking decisions with customizable lists.
              </p>
            </div>

            {/* Global sound / duplicates controls */}
            <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-2xl shadow-sm">
              <button
                onClick={() => setIsSoundMuted(!isSoundMuted)}
                className={`p-2 rounded-xl transition-all ${
                  isSoundMuted
                    ? "text-slate-400 hover:text-slate-500 bg-slate-50"
                    : "text-amber-500 bg-amber-50 hover:bg-amber-100"
                }`}
                title={isSoundMuted ? "Unmute sound" : "Mute sound"}
              >
                {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="h-6 w-[1px] bg-slate-200" />
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-600 pl-1">
                <input
                  type="checkbox"
                  checked={removeOnWin}
                  onChange={(e) => setRemoveOnWin(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                Remove Winner
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Play Center Viewport */}
            <div className="lg:col-span-8 space-y-6">
              {/* Tab Navigation */}
              <div className="bg-[#1e1e1e] p-1.5 rounded-3xl flex gap-1 shadow-sm border border-slate-800">
                {[
                  { id: "wheel", label: "Wheel", desc: "Classic Wheel" },
                  { id: "gift", label: "Mystery Box", desc: "Unboxing Present" },
                  { id: "scratch", label: "Scratch", desc: "Scratch Card" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isDrawing) return;
                      setActiveTab(tab.id);
                      setDrawResult(null);
                    }}
                    disabled={isDrawing}
                    className={`flex-1 py-3 px-2 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 flex flex-col items-center justify-center ${
                      activeTab === tab.id
                        ? "bg-slate-800 text-white shadow-lg border border-slate-700 bg-gradient-to-tr from-amber-500/10 to-transparent"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#252525]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[9px] font-medium tracking-normal text-slate-500 hidden sm:inline uppercase mt-0.5">
                      {tab.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Viewport Frame */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden">
                <canvas
                  ref={confettiCanvasRef}
                  className="absolute inset-0 pointer-events-none z-30 w-full h-full"
                />

                {/* Draw Tab Renderings */}
                <AnimatePresence mode="wait">
                  {activeTab === "wheel" && (
                    <motion.div
                      key="wheel"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center w-full relative"
                    >
                      {/* Wheel Pointer Peg */}
                      <div className="absolute top-[-8px] z-20 flex flex-col items-center">
                        {/* Elegant triangular glowing pointer pin */}
                        <div className="w-6 h-8 bg-amber-500 border-2 border-slate-900 rounded-b-full shadow-lg transform rotate-180 flex items-center justify-center animate-pulse">
                          <div className="w-1.5 h-1.5 bg-white rounded-full mb-2" />
                        </div>
                      </div>

                      <div className="relative p-4 bg-slate-100/70 border border-slate-200/50 rounded-full shadow-inner mb-6">
                        <canvas ref={wheelCanvasRef} className="mx-auto select-none" />
                      </div>

                      <button
                        onClick={spinWheel}
                        disabled={participants.length === 0 || isDrawing}
                        className="w-full sm:w-auto px-12 py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 disabled:opacity-40 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 border-2 border-slate-800"
                      >
                        <Play className="w-4 h-4 fill-white" /> SPIN WHEEL
                      </button>
                    </motion.div>
                  )}


                  {activeTab === "gift" && (
                    <motion.div
                      key="gift"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center w-full"
                    >
                      {/* Box Interactive View */}
                      <div className="h-64 flex items-center justify-center relative mb-8">
                        {giftState === "idle" && (
                          <motion.div
                            whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                            className="cursor-pointer"
                            onClick={openGiftBox}
                          >
                            <div className="relative bg-gradient-to-br from-rose-500 to-rose-600 w-36 h-36 rounded-2xl shadow-xl flex items-center justify-center">
                              {/* Bow tie ribbons */}
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-yellow-400 shadow-sm" />
                              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-yellow-400 shadow-sm" />
                              <div className="absolute -top-3 w-10 h-10 bg-yellow-400 border-4 border-yellow-300 rounded-full flex items-center justify-center shadow-lg" />
                              <Gift className="w-16 h-16 text-white/90 relative z-10" />
                            </div>
                          </motion.div>
                        )}

                        {giftState === "shaking" && (
                          <motion.div
                            animate={{
                              x: [0, -10, 10, -8, 8, -6, 6, 0],
                              y: [0, -5, 5, -3, 3, -1, 1, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 0.35 }}
                            className="relative bg-gradient-to-br from-rose-500 to-rose-600 w-36 h-36 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-rose-400"
                          >
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-yellow-400" />
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-yellow-400" />
                            <Gift className="w-16 h-16 text-white relative z-10" />
                          </motion.div>
                        )}

                        {giftState === "burst" && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.1, opacity: 1 }}
                            className="flex flex-col items-center justify-center"
                          >
                            {/* Glowing rays */}
                            <div className="absolute w-52 h-52 bg-gradient-to-tr from-yellow-300 to-amber-500 blur-2xl rounded-full opacity-35 animate-spin" />
                            <div className="text-8xl animate-bounce">🎁</div>
                          </motion.div>
                        )}
                      </div>

                      {giftState !== "idle" ? (
                        <button
                          onClick={resetGiftBox}
                          className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-sm flex items-center gap-2 border border-slate-200"
                        >
                          <RotateCcw className="w-4 h-4" /> Reset Present
                        </button>
                      ) : (
                        <button
                          onClick={openGiftBox}
                          disabled={participants.length === 0 || isDrawing}
                          className="w-full sm:w-auto px-12 py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 disabled:opacity-40 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 border-2 border-slate-800"
                        >
                          <Play className="w-4 h-4 fill-white" /> OPEN BOX
                        </button>
                      )}
                    </motion.div>
                  )}

                  {activeTab === "scratch" && (
                    <motion.div
                      key="scratch"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="w-full max-w-md flex flex-col items-center"
                    >
                      {/* Scratch Outer Card Box */}
                      <div className="w-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-1.5 rounded-[2.25rem] shadow-2xl relative mb-6">
                        <div className="w-full bg-[#030712] rounded-[2.1rem] overflow-hidden p-6 text-center text-white relative min-h-[240px] flex flex-col items-center justify-center">
                          {/* Reveal text card layers */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/20">
                            <span className="text-[10px] font-bold text-pink-400 tracking-[0.3em] uppercase mb-2">
                              REVEALED WINNER
                            </span>
                            <span className="text-3xl sm:text-4xl font-black text-white break-all tracking-tight px-4 leading-normal">
                              {scratchWinner || "?"}
                            </span>
                          </div>

                          {/* Scratch foil layer */}
                          <canvas
                            ref={scratchCanvasRef}
                            onMouseDown={() => (isScratching.current = true)}
                            onMouseUp={() => (isScratching.current = false)}
                            onMouseLeave={() => (isScratching.current = false)}
                            onMouseMove={handleScratchMove}
                            onTouchStart={() => (isScratching.current = true)}
                            onTouchEnd={() => (isScratching.current = false)}
                            onTouchMove={handleScratchMove}
                            className="absolute inset-0 w-full h-full cursor-crosshair z-25 rounded-2xl"
                          />
                        </div>
                      </div>

                      {/* Info progress status bar */}
                      <div className="w-full flex items-center justify-between px-2 text-xs font-bold text-slate-400 mb-6">
                        <span className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" /> Drag mouse to scratch card
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                          Scratched: {scratchProgress}%
                        </span>
                      </div>

                      <button
                        onClick={initScratchCard}
                        className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-sm flex items-center gap-2 border border-slate-200"
                      >
                        <RotateCcw className="w-4 h-4" /> Reset New Card
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Configuration & List Controls */}
            <div className="lg:col-span-4 space-y-6">
              {/* Entrants Text Area */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
                <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase mb-3 flex justify-between items-center">
                  <span>Participants list</span>
                  <span className="text-xs text-slate-400 font-semibold lowercase">
                    {participants.length} items
                  </span>
                </h3>

                <textarea
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Paste name rows here..."
                  className="w-full h-52 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none custom-scrollbar"
                />

                {/* Preset Fast Actions */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => applyPreset("names")}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200/60 transition-all uppercase tracking-wide"
                  >
                    Names Preset
                  </button>
                  <button
                    onClick={() => applyPreset("prizes")}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200/60 transition-all uppercase tracking-wide"
                  >
                    Prizes Preset
                  </button>
                  <button
                    onClick={() => applyPreset("numbers")}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200/60 transition-all uppercase tracking-wide"
                  >
                    ID Tickets
                  </button>
                </div>
              </div>

              {/* Segment color customizer (Only for Wheel) */}
              {activeTab === "wheel" && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                  <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                    Wheel Theme
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "vibrant", label: "Vibrant", colors: ["#2563eb", "#db2777", "#16a34a"] },
                      { id: "neon", label: "Neon Party", colors: ["#ff007f", "#00ffff", "#80ff00"] },
                      { id: "gold", label: "Golden Lux", colors: ["#ca8a04", "#78350f", "#fef08a"] }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setActiveTheme(theme.id)}
                        className={`p-2 bg-slate-50 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                          activeTheme === theme.id
                            ? "border-amber-500 bg-amber-50/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-600">{theme.label}</span>
                        <div className="flex gap-0.5">
                          {theme.colors.map((c, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full border border-white"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Winner Logs History Panel */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-800" />
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-400" /> Draw History
                  </h3>
                  {winnersHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>

                <div className="space-y-2 h-44 overflow-y-auto custom-scrollbar pr-1">
                  {winnersHistory.map((winner) => (
                    <div
                      key={winner.id}
                      className="flex justify-between items-center p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/50 transition-colors"
                    >
                      <span className="text-xs font-black text-slate-700 truncate max-w-[150px]">
                        {winner.name}
                      </span>
                      <span className="text-[9px] font-medium text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                        {winner.time}
                      </span>
                    </div>
                  ))}

                  {winnersHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                      <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        No previous outcomes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Celebration Popup Modal */}
        <AnimatePresence>
          {showResultModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-white rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-2xl relative border-4 border-amber-400 overflow-hidden"
              >
                {/* Gold glowing burst background */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent" />

                <div className="bg-amber-100 text-amber-600 p-5 rounded-full inline-flex items-center justify-center mb-6 shadow-xl shadow-amber-100/50 border-2 border-amber-300">
                  <Sparkles className="w-10 h-10 animate-pulse" />
                </div>

                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                  CONGRATULATIONS!
                </h2>
                <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">
                  We Have A Winner
                </h3>

                <div className="bg-slate-900 text-amber-400 rounded-3xl p-5 text-2xl sm:text-3xl font-black mb-8 break-all shadow-inner tracking-tight border border-slate-800 leading-normal">
                  {drawResult}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      setDrawResult(null);
                    }}
                    className="flex-1 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg border-2 border-slate-800"
                  >
                    Confirm Winner
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </Layout>
    </PageContext.Provider>
  );
}
