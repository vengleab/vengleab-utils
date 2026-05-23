import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Keyboard,
  RotateCcw,
  Volume2,
  VolumeX,
  List,
  Shield,
  HelpCircle,
  Activity,
  Zap,
  Laptop
} from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";

const SWITCH_SOUND = {
  CLICKY: "clicky",
  TACTILE: "tactile",
  LINEAR: "linear",
  MUTE: "mute"
};

const LAYOUT = {
  TKL: "TKL",
  COMPACT_60: "60"
};

const OS_LAYOUT = {
  WIN: "win",
  MAC: "mac"
};

const THEME = {
  CARBON: "carbon"
};

const KEY_CHAR = {
  SPACE: " "
};

const KEY_NAME = {
  SPACE: "Space"
};

const KEY_TYPE = {
  GAP: "gap",
  SPACER: "spacer"
};

const OSCILLATOR_TYPE = {
  SINE: "sine",
  TRIANGLE: "triangle",
  SAWTOOTH: "sawtooth",
  SQUARE: "square"
};

const FILTER_TYPE = {
  LOWPASS: "lowpass",
  HIGHPASS: "highpass"
};

const AUDIO_CONTEXT_STATE = {
  SUSPENDED: "suspended",
  RUNNING: "running",
  CLOSED: "closed"
};

// Web Audio API mechanical switch click synthesizer
let globalAudioCtx = null;
const playSwitchSound = (type, muted) => {
  if (muted) return;
  try {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!globalAudioCtx) {
      globalAudioCtx = new AudioContextClass();
    }

    if (globalAudioCtx.state === AUDIO_CONTEXT_STATE.SUSPENDED) {
      globalAudioCtx.resume();
    }

    const ctx = globalAudioCtx;
    const now = ctx.currentTime;

    if (type === SWITCH_SOUND.CLICKY) {
      // Blue Switch: High frequency crisp transient click + mechanical spring sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = OSCILLATOR_TYPE.SINE;
      osc1.frequency.setValueAtTime(3200, now);
      osc1.frequency.exponentialRampToValueAtTime(1000, now + 0.004);

      osc2.type = OSCILLATOR_TYPE.TRIANGLE;
      osc2.frequency.setValueAtTime(2400, now + 0.003);
      osc2.frequency.exponentialRampToValueAtTime(600, now + 0.012);

      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.setValueAtTime(0.08, now + 0.003);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      const filter = ctx.createBiquadFilter();
      filter.type = FILTER_TYPE.HIGHPASS;
      filter.frequency.value = 1200;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.025);
      osc2.stop(now + 0.025);

    } else if (type === SWITCH_SOUND.LINEAR) {
      // Red Switch: Deep, satisfying, plastic-on-plastic "thock"
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = OSCILLATOR_TYPE.TRIANGLE;
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.04);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      const filter = ctx.createBiquadFilter();
      filter.type = FILTER_TYPE.LOWPASS;
      filter.frequency.value = 280;

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);

    } else if (type === SWITCH_SOUND.TACTILE) {
      // Brown Switch: A perfect hybrid of tactile bump + rounded plastic collision
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = OSCILLATOR_TYPE.SINE;
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.032);

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

      const filter = ctx.createBiquadFilter();
      filter.type = FILTER_TYPE.LOWPASS;
      filter.frequency.value = 500;

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.038);
    }
  } catch (err) {
    console.error("Synthesizer audio error:", err);
  }
};

// Standard 60% Layout Rows (Excluding the bottom Row 4 which is OS-specific)
const LAYOUT_60_CORES = [
  // Row 0
  [
    { code: "Escape", label: "Esc", width: "w-[42px] sm:w-[48px]" },
    { code: "Digit1", label: "1", subLabel: "!" },
    { code: "Digit2", label: "2", subLabel: "@" },
    { code: "Digit3", label: "3", subLabel: "#" },
    { code: "Digit4", label: "4", subLabel: "$" },
    { code: "Digit5", label: "5", subLabel: "%" },
    { code: "Digit6", label: "6", subLabel: "^" },
    { code: "Digit7", label: "7", subLabel: "&" },
    { code: "Digit8", label: "8", subLabel: "*" },
    { code: "Digit9", label: "9", subLabel: "(" },
    { code: "Digit0", label: "0", subLabel: ")" },
    { code: "Minus", label: "-", subLabel: "_" },
    { code: "Equal", label: "=", subLabel: "+" },
    { code: "Backspace", label: "Backspace", width: "grow flex-1 min-w-[70px] sm:min-w-[80px]" }
  ],
  // Row 1
  [
    { code: "Tab", label: "Tab", width: "w-[58px] sm:w-[68px] shrink-0" },
    { code: "KeyQ", label: "Q" },
    { code: "KeyW", label: "W" },
    { code: "KeyE", label: "E" },
    { code: "KeyR", label: "R" },
    { code: "KeyT", label: "T" },
    { code: "KeyY", label: "Y" },
    { code: "KeyU", label: "U" },
    { code: "KeyI", label: "I" },
    { code: "KeyO", label: "O" },
    { code: "KeyP", label: "P" },
    { code: "BracketLeft", label: "[", subLabel: "{" },
    { code: "BracketRight", label: "]", subLabel: "}" },
    { code: "Backslash", label: "\\", subLabel: "|", width: "grow flex-1 min-w-[50px] sm:min-w-[60px]" }
  ],
  // Row 2
  [
    { code: "CapsLock", label: "Caps Lock", width: "w-[68px] sm:w-[82px] shrink-0" },
    { code: "KeyA", label: "A" },
    { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" },
    { code: "KeyF", label: "F" },
    { code: "KeyG", label: "G" },
    { code: "KeyH", label: "H" },
    { code: "KeyJ", label: "J" },
    { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" },
    { code: "Semicolon", label: ";", subLabel: ":" },
    { code: "Quote", label: "'", subLabel: "\"" },
    { code: "Enter", label: "Enter", width: "grow flex-1 min-w-[75px] sm:min-w-[94px]" }
  ],
  // Row 3
  [
    { code: "ShiftLeft", label: "Shift", width: "w-[88px] sm:w-[106px] shrink-0" },
    { code: "KeyZ", label: "Z" },
    { code: "KeyX", label: "X" },
    { code: "KeyC", label: "C" },
    { code: "KeyV", label: "V" },
    { code: "KeyB", label: "B" },
    { code: "KeyN", label: "N" },
    { code: "KeyM", label: "M" },
    { code: "Comma", label: ",", subLabel: "<" },
    { code: "Period", label: ".", subLabel: ">" },
    { code: "Slash", label: "/", subLabel: "?" },
    { code: "ShiftRight", label: "Shift", width: "grow flex-1 min-w-[85px] sm:min-w-[110px]" }
  ]
];

// OS-specific lower rows layout (Ctrl, Alt, Win/Command physical placements)
const ROW_4_WIN = [
  { code: "ControlLeft", label: "Ctrl", width: "w-[50px] sm:w-[58px] shrink-0" },
  { code: "MetaLeft", label: "Win", width: "w-[42px] sm:w-[48px] shrink-0" },
  { code: "AltLeft", label: "Alt", width: "w-[42px] sm:w-[48px] shrink-0" },
  { code: "Space", label: "Space", width: "grow flex-1 max-w-[350px] min-w-[180px] sm:min-w-[220px]" },
  { code: "AltRight", label: "Alt", width: "w-[42px] sm:w-[48px] shrink-0" },
  { code: "MetaRight", label: "Win", width: "w-[42px] sm:w-[48px] shrink-0" },
  { code: "ContextMenu", label: "Menu", width: "w-[42px] sm:w-[48px] shrink-0" },
  { code: "ControlRight", label: "Ctrl", width: "w-[50px] sm:w-[58px] shrink-0" }
];

const ROW_4_MAC = [
  { code: "ControlLeft", label: "Control", subLabel: "⌃", width: "w-[54px] sm:w-[62px] shrink-0" },
  { code: "AltLeft", label: "Option", subLabel: "⌥", width: "w-[46px] sm:w-[52px] shrink-0" },
  { code: "MetaLeft", label: "Command", subLabel: "⌘", width: "w-[56px] sm:w-[64px] shrink-0" },
  { code: "Space", label: "Space", width: "grow flex-1 max-w-[340px] min-w-[180px] sm:min-w-[220px]" },
  { code: "MetaRight", label: "Command", subLabel: "⌘", width: "w-[56px] sm:w-[64px] shrink-0" },
  { code: "AltRight", label: "Option", subLabel: "⌥", width: "w-[46px] sm:w-[52px] shrink-0" },
  { code: "ControlRight", label: "Control", subLabel: "⌃", width: "w-[54px] sm:w-[62px] shrink-0" }
];

// TKL Function Row Header
const TKL_FUNCTION_ROW = [
  { code: "Escape", label: "Esc", width: "w-[42px] sm:w-[48px]" },
  { code: "gap-1", type: "gap", width: "w-6 sm:w-8" },
  { code: "F1", label: "F1" },
  { code: "F2", label: "F2" },
  { code: "F3", label: "F3" },
  { code: "F4", label: "F4" },
  { code: "gap-2", type: "gap", width: "w-4 sm:w-6" },
  { code: "F5", label: "F5" },
  { code: "F6", label: "F6" },
  { code: "F7", label: "F7" },
  { code: "F8", label: "F8" },
  { code: "gap-3", type: "gap", width: "w-4 sm:w-6" },
  { code: "F9", label: "F9" },
  { code: "F10", label: "F10" },
  { code: "F11", label: "F11" },
  { code: "F12", label: "F12" }
];

const TKL_NAV_CLUSTER = [
  // Row 0
  [
    { code: "PrintScreen", label: "PrtSc" },
    { code: "ScrollLock", label: "ScrLk" },
    { code: "Pause", label: "Pause" }
  ],
  // Row 1
  [
    { code: "Insert", label: "Ins" },
    { code: "Home", label: "Home" },
    { code: "PageUp", label: "PgUp" }
  ],
  // Row 2
  [
    { code: "Delete", label: "Del" },
    { code: "End", label: "End" },
    { code: "PageDown", label: "PgDn" }
  ],
  // Row 3 (Empty Spacer Row)
  [
    { code: "spacer-1", type: "spacer", height: "h-9 sm:h-[42px]" }
  ],
  // Row 4
  [
    { code: "spacer-arrow-up", type: "gap", width: "w-[42px] sm:w-[48px]" },
    { code: "ArrowUp", label: "▲" },
    { code: "spacer-arrow-up-right", type: "gap", width: "w-[42px] sm:w-[48px]" }
  ],
  // Row 5
  [
    { code: "ArrowLeft", label: "◀" },
    { code: "ArrowDown", label: "▼" },
    { code: "ArrowRight", label: "▶" }
  ]
];

// Aesthetic key cap designer styling presets
const THEMES = {
  carbon: {
    name: "Carbon Grey",
    bg: "bg-slate-900 border-slate-800",
    keyDefault: "bg-[#27272a] text-zinc-100 hover:bg-[#3f3f46] border-zinc-700/80 shadow-md",
    keyActive: "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.65)] scale-[0.97]",
    keyTested: "bg-indigo-950/65 text-indigo-200 border-indigo-500/40 hover:bg-indigo-900/60 shadow-[0_0_8px_rgba(99,102,241,0.15)]",
    cardBg: "bg-white border-slate-200",
    border: "border-slate-800",
    textMuted: "text-slate-400",
    textHeading: "text-white"
  },
  retro: {
    name: "Classic Retro (80s)",
    bg: "bg-[#dbdbdb] border-[#c0c0c0]",
    keyDefault: "bg-[#ececec] text-[#333333] border-[#ffffff] border-t-2 border-l-2 border-b-[#888888] border-r-[#888888] hover:bg-[#f4f4f4] shadow-sm",
    keyActive: "bg-[#d15822] text-white border-[#888888] border-t-2 border-l-2 shadow-inner scale-[0.97]",
    keyTested: "bg-[#dcedc8] text-[#33691e] border-[#81c784] hover:bg-[#c5e1a5]",
    cardBg: "bg-white border-[#c8c8c8]",
    border: "border-slate-300",
    textMuted: "text-slate-500",
    textHeading: "text-slate-800"
  },
  cyberpunk: {
    name: "Cyberpunk Neon",
    bg: "bg-[#0b0514] border-[#ff0055]/30",
    keyDefault: "bg-[#180a2b] text-[#ff00ff] border-[#ff00ff]/30 hover:bg-[#251042] hover:border-[#ff00ff]/60 shadow-[0_0_5px_rgba(255,0,255,0.1)]",
    keyActive: "bg-[#00f0ff] text-slate-900 border-[#00f0ff] shadow-[0_0_18px_#00f0ff] scale-[0.97] font-extrabold",
    keyTested: "bg-[#6b0f3e] text-[#ffd6e7] border-[#ff0055]/70 hover:bg-[#7d144b] shadow-[0_0_8px_rgba(255,0,85,0.2)]",
    cardBg: "bg-white border-[#ff0055]/20",
    border: "border-[#ff0055]/20",
    textMuted: "text-[#a28abf]",
    textHeading: "text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00f0ff]"
  },
  olivia: {
    name: "Olivia Rose",
    bg: "bg-[#111111] border-[#e0b0b0]/20",
    keyDefault: "bg-[#ece0d8]/95 text-[#2c2c2c] border-[#d7ccc8] hover:bg-[#f5ebe6] shadow-sm",
    keyActive: "bg-[#e0b0b0] text-[#1a1a1a] border-[#e0b0b0] shadow-[0_0_12px_rgba(224,176,176,0.6)] scale-[0.97]",
    keyTested: "bg-[#2d2828] text-[#e0b0b0] border-[#e0b0b0]/40 hover:bg-[#3a3333]",
    cardBg: "bg-white border-[#2d2828]",
    border: "border-[#2d2828]",
    textMuted: "text-[#a39494]",
    textHeading: "text-[#ece0d8]"
  }
};

export default function KeyboardTester() {
  const [pressedKeys, setPressedKeys] = useState({});
  const [testedKeys, setTestedKeys] = useState({});
  const [lastPressed, setLastPressed] = useState(null);
  const [keyHistory, setKeyHistory] = useState([]);
  const [maxRollover, setMaxRollover] = useState(0);
  const [blockDefault, setBlockDefault] = useState(true);
  const [switchSound, setSwitchSound] = useState(SWITCH_SOUND.CLICKY);
  const [layoutType, setLayoutType] = useState(LAYOUT.TKL);
  const [theme, setTheme] = useState(THEME.CARBON);
  const [osLayout, setOsLayout] = useState(OS_LAYOUT.WIN); // "win" | "mac"

  // Detect user's operational layout on mounting
  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator) {
      const userAgent = window.navigator.userAgent || window.navigator.platform || "";
      const isMac = /Mac|iPod|iPhone|iPad|Macintosh|MacIntel/i.test(userAgent);
      if (isMac) {
        setOsLayout(OS_LAYOUT.MAC);
      }
    }
  }, []);

  // Set up general event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const code = e.code;
      if (!code) return;

      // Click Audio Synthesizer triggering
      playSwitchSound(switchSound, switchSound === SWITCH_SOUND.MUTE);

      // Register currently pressed key
      setPressedKeys((prev) => {
        const next = { ...prev, [code]: true };
        const activeCount = Object.keys(next).length;
        setMaxRollover((max) => Math.max(max, activeCount));
        return next;
      });

      // Register tested keycap
      setTestedKeys((prev) => ({ ...prev, [code]: true }));

      // Resolve dynamic key labels based on current OS Layout
      const targetLabel = getMacSensitiveDetails({ code, label: e.key });

      // Set stats info
      const keyDetail = {
        code,
        key: targetLabel.label === KEY_CHAR.SPACE ? KEY_NAME.SPACE : targetLabel.label,
        keyCode: e.keyCode || e.which,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      };
      setLastPressed(keyDetail);

      // Save key logs up to 100 entries
      setKeyHistory((prev) => [keyDetail, ...prev].slice(0, 100));

      // Overrides browser actions (preventing default key shortcuts like F5 or Tab from messing up testing)
      if (blockDefault) {
        const defaultBlocked = [
          "Tab", "Backspace", "Space", "F5", "F1", "F3", "F4", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
          "AltLeft", "AltRight", "ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight", "ArrowUp", "ArrowDown",
          "ArrowLeft", "ArrowRight"
        ];
        if (defaultBlocked.includes(code) || code.startsWith("Key") || code.startsWith("Digit")) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      if (!code) return;

      setPressedKeys((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
    };

    const handleBlur = () => {
      // Clear stuck states if application window loses operational focus
      setPressedKeys({});
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [blockDefault, switchSound, osLayout]);

  // Clean all tested counters
  const handleResetBoard = () => {
    setPressedKeys({});
    setTestedKeys({});
    setLastPressed(null);
    setKeyHistory([]);
    setMaxRollover(0);
  };

  // Helper function to dynamically map Mac labels onto keycaps
  const getMacSensitiveDetails = (key) => {
    if (osLayout === OS_LAYOUT.MAC) {
      switch (key.code) {
        case "Backspace":
          return { ...key, label: "Delete", subLabel: "⌫" };
        case "Enter":
          return { ...key, label: "Return", subLabel: "↩" };
        case "CapsLock":
          return { ...key, label: "Caps Lock", subLabel: "⇪" };
        case "MetaLeft":
        case "MetaRight":
          return { ...key, label: "Command", subLabel: "⌘" };
        case "AltLeft":
        case "AltRight":
          return { ...key, label: "Option", subLabel: "⌥" };
        case "ControlLeft":
        case "ControlRight":
          return { ...key, label: "Control", subLabel: "⌃" };
        default:
          break;
      }
    }
    return key;
  };

  const currentTheme = THEMES[theme];

  // Helper renderer for standard key caps
  const renderKeycap = (key) => {
    if (key.type === KEY_TYPE.GAP) {
      return <div key={key.code} className={`${key.width} shrink-0`} />;
    }

    if (key.type === KEY_TYPE.SPACER) {
      return <div key={key.code} className={`${key.height} w-full shrink-0`} />;
    }

    const isPressed = !!pressedKeys[key.code];
    const isTested = !!testedKeys[key.code];

    let customKeyStyle = currentTheme.keyDefault;
    if (isPressed) {
      customKeyStyle = currentTheme.keyActive;
    } else if (isTested) {
      customKeyStyle = currentTheme.keyTested;
    }

    // Resolve key attributes based on selected keyboard OS (Windows vs Mac)
    const resolvedKey = getMacSensitiveDetails(key);

    // Default sizing values for standard keycaps
    const capWidth = resolvedKey.width || "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12";

    return (
      <motion.button
        key={resolvedKey.code}
        whileTap={{ scale: 0.94 }}
        className={`rounded-lg select-none border border-b-2 flex flex-col items-center justify-between p-1.5 font-sans leading-none text-[10px] sm:text-xs font-semibold tracking-tight transition-all duration-75 shrink-0 ${capWidth} ${customKeyStyle}`}
        style={{ touchAction: "none" }}
      >
        {/* Secondary shift characters on top, labels on bottom */}
        {resolvedKey.subLabel ? (
          <>
            <span className="text-[9px] opacity-75 self-start leading-none">{resolvedKey.subLabel}</span>
            <span className="self-end leading-none text-[10px] sm:text-[11px]">{resolvedKey.label}</span>
          </>
        ) : (
          <span className="m-auto leading-none truncate w-full text-center">{resolvedKey.label}</span>
        )}
      </motion.button>
    );
  };

  // Dynamically compile the layout rows based on OS selection
  const activeLayoutRows = [
    ...LAYOUT_60_CORES,
    osLayout === OS_LAYOUT.MAC ? ROW_4_MAC : ROW_4_WIN
  ];

  return (
    <PageContext.Provider value={{ activeItem: PAGE.KEYBOARD_TESTER }}>
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col space-y-6"
        >
          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Keyboard className="w-7 h-7 text-indigo-600" />
                Keyboard Tester
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-500">
                Verify input hardware keys, multi-key rollover (NKRO), and mechanical switch sound profiles.
              </p>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Reset button */}
              <button
                onClick={handleResetBoard}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Board
              </button>

              {/* OS Layout Toggler */}
              <div className="flex bg-slate-200/80 p-0.5 rounded-xl border border-slate-200/40">
                <button
                  onClick={() => setOsLayout(OS_LAYOUT.WIN)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    osLayout === OS_LAYOUT.WIN
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Windows Layout
                </button>
                <button
                  onClick={() => setOsLayout(OS_LAYOUT.MAC)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    osLayout === OS_LAYOUT.MAC
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Mac Layout
                </button>
              </div>

              {/* Layout Size Toggler */}
              <div className="flex bg-slate-200/80 p-0.5 rounded-xl border border-slate-200/40">
                <button
                  onClick={() => setLayoutType(LAYOUT.TKL)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    layoutType === LAYOUT.TKL
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  TKL (80%)
                </button>
                <button
                  onClick={() => setLayoutType(LAYOUT.COMPACT_60)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    layoutType === LAYOUT.COMPACT_60
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Compact (60%)
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Keyboard Visual Board */}
          <div className={`p-4 sm:p-6 rounded-3xl border shadow-md transition-colors duration-200 overflow-x-auto w-full custom-scrollbar ${currentTheme.bg}`}>
            <div className="min-w-[920px] flex flex-col space-y-4">
              
              {/* TKL Function Row Header */}
              {layoutType === LAYOUT.TKL && (
                <div className="flex justify-between items-center w-full">
                  {/* Left Function Area */}
                  <div className="flex gap-1">
                    {TKL_FUNCTION_ROW.map((key) => renderKeycap(key))}
                  </div>

                  {/* Right Navigation Controls Row 0 */}
                  <div className="flex gap-1 ml-auto">
                    {TKL_NAV_CLUSTER[0].map((key) => renderKeycap(key))}
                  </div>
                </div>
              )}

              {/* Main Alpha Block & Navigation Cluster */}
              <div className="flex w-full justify-between items-start gap-4">
                
                {/* Core Alphanumeric Keycap Block */}
                <div className="flex flex-col space-y-1 sm:space-y-1.5 grow max-w-[800px]">
                  {activeLayoutRows.map((row, idx) => (
                    <div key={idx} className="flex gap-1 sm:gap-1.5 w-full">
                      {row.map((key) => renderKeycap(key))}
                    </div>
                  ))}
                </div>

                {/* TKL Right hand navigation block columns */}
                {layoutType === LAYOUT.TKL && (
                  <div className="flex flex-col space-y-1.5 w-[145px] shrink-0 border-l border-white/5 pl-4 ml-auto">
                    {/* Rows 1, 2, 3, 4, 5 of Nav Cluster */}
                    {TKL_NAV_CLUSTER.slice(1).map((row, idx) => (
                      <div key={idx} className="flex gap-1 w-full justify-end">
                        {row.map((key) => renderKeycap(key))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration & Stats Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Designer Keyboard Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                Customize Board
              </h2>

              {/* Theme Settings Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Keyboard Skin Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(THEMES).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={`p-2.5 text-left rounded-xl border text-xs font-semibold transition-all ${
                        theme === key
                          ? "bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Settings Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Mechanical Switches Audio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: SWITCH_SOUND.CLICKY, name: "Clicky Blue", icon: Volume2 },
                    { id: SWITCH_SOUND.TACTILE, name: "Tactile Brown", icon: Volume2 },
                    { id: SWITCH_SOUND.LINEAR, name: "Linear Red", icon: Volume2 },
                    { id: SWITCH_SOUND.MUTE, name: "Sound Off", icon: VolumeX }
                  ].map((sw) => (
                    <button
                      key={sw.id}
                      onClick={() => {
                        setSwitchSound(sw.id);
                        playSwitchSound(sw.id, sw.id === SWITCH_SOUND.MUTE);
                      }}
                      className={`p-2.5 text-left rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        switchSound === sw.id
                          ? "bg-indigo-50 border-indigo-600 text-indigo-900 shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{sw.name}</span>
                      <sw.icon className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* OS Default Prevention Toggler */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={blockDefault}
                    onChange={(e) => setBlockDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700">
                      Intercept Browser Shortcuts
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Prevents Tab, Backspace, and F-keys from closing/navigating.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Column 2: Operational Stats Tracker */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="w-5 h-5 text-indigo-600" />
                Live Stats Dashboard
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Active Pressed Keys
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {Object.keys(pressedKeys).length}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Rollover Record (NKRO)
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {maxRollover}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl col-span-2">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Tested Keys Coverage
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {Object.keys(testedKeys).length}{" "}
                    <span className="text-xs font-medium text-slate-400">
                      / {layoutType === LAYOUT.TKL ? "87" : "61"} total
                    </span>
                  </span>
                </div>
              </div>

              {/* Active inputs descriptor info */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Last Keypress Event Details
                </span>
                {lastPressed ? (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="text-slate-400">Event Key Code:</span>
                    <span className="font-semibold text-slate-800 font-mono">{lastPressed.code}</span>
                    <span className="text-slate-400">Character Key:</span>
                    <span className="font-semibold text-slate-800 font-mono">{lastPressed.key}</span>
                    <span className="text-slate-400">JavaScript KeyCode:</span>
                    <span className="font-semibold text-slate-800 font-mono">{lastPressed.keyCode}</span>
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-400 block">
                    Waiting for hardware input presses...
                  </span>
                )}
              </div>
            </div>

            {/* Column 3: Chronological Action Logs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col h-[320px] lg:h-auto">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 shrink-0">
                <List className="w-5 h-5 text-emerald-500" />
                Live Key Log History
              </h2>

              <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-1.5 custom-scrollbar text-xs font-mono">
                <AnimatePresence initial={false}>
                  {keyHistory.length > 0 ? (
                    keyHistory.map((item, idx) => (
                      <motion.div
                        key={idx + "-" + item.code}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100/50 hover:bg-slate-100/60 transition-colors"
                      >
                        <span className="font-bold text-slate-700 bg-white border border-slate-200/60 px-1.5 py-0.5 rounded shadow-sm">
                          {item.code}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span>Key: "{item.key}"</span>
                          <span>ID: {item.keyCode}</span>
                          <span className="opacity-75">{item.time}</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 italic">
                      No events registered. Press keys to begin logs.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* Quick Informational Tips Section */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-xs text-amber-800 leading-relaxed">
            <Shield className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <span className="font-bold block mb-0.5">Privacy First Processing</span>
              All keyboard interactions are processed fully inside your local browser sandbox. No keyboard events, strings, or passwords typed are ever transmitted over the network or saved. Feel safe testing your secure credentials.
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
