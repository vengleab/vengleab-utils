import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor,
  Maximize2,
  Tv,
  Cpu,
  Layers,
  Grid,
  Info,
  Maximize,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Compass
} from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";

// Dead-pixel cycle colors preset array
const CYCLE_COLORS = [
  { hex: "#FFFFFF", name: "Pure White (Bright Pixels Test)" },
  { hex: "#000000", name: "Pure Black (Light Bleed & Stuck Pixels Test)" },
  { hex: "#FF0000", name: "Pure Red (Sub-Pixel Test)" },
  { hex: "#00FF00", name: "Pure Green (Sub-Pixel Test)" },
  { hex: "#0000FF", name: "Pure Blue (Sub-Pixel Test)" },
  { hex: "#FFFF00", name: "Vibrant Yellow" },
  { hex: "#FF00FF", name: "Vibrant Magenta" },
  { hex: "#00FFFF", name: "Vibrant Cyan" }
];

export default function DisplayColorTester() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenType, setFullscreenType] = useState(null); // "solid" | "gradient" | "pattern"
  const [activeColor, setActiveColor] = useState("#FFFFFF");
  const [cycleIndex, setCycleIndex] = useState(0);
  const [customColor, setCustomColor] = useState("#FF007F");
  const [specs, setSpecs] = useState({
    width: 1920,
    height: 1080,
    viewportWidth: 1920,
    viewportHeight: 1080,
    pixelRatio: 1,
    colorDepth: 24,
    orientation: "landscape"
  });

  const [showToast, setShowToast] = useState(false);
  const fullscreenContainerRef = useRef(null);

  // Fetch screen specifications dynamically on mounting & resizing
  useEffect(() => {
    const updateSpecs = () => {
      if (typeof window !== "undefined") {
        setSpecs({
          width: window.screen.width || 0,
          height: window.screen.height || 0,
          viewportWidth: window.innerWidth || 0,
          viewportHeight: window.innerHeight || 0,
          pixelRatio: window.devicePixelRatio || 1,
          colorDepth: window.screen.colorDepth || 24,
          orientation: window.innerWidth > window.innerHeight ? "landscape" : "portrait"
        });
      }
    };

    updateSpecs();
    window.addEventListener("resize", updateSpecs);
    return () => window.removeEventListener("resize", updateSpecs);
  }, []);

  // Listen to browser Fullscreen changes to cleanly sync React state
  useEffect(() => {
    const onFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        setFullscreenType(null);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);
    };
  }, []);

  // Keyboard navigation & clicking listeners while in fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return;

    // Show indicator toast on entry
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 3500);

    const handleKeyDown = (e) => {
      if (fullscreenType !== "solid") return; // cycle colors only in solid color mode

      if (e.key === "ArrowRight" || e.key === "Space" || e.key === " ") {
        e.preventDefault();
        const nextIdx = (cycleIndex + 1) % CYCLE_COLORS.length;
        setCycleIndex(nextIdx);
        setActiveColor(CYCLE_COLORS[nextIdx].hex);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIdx = (cycleIndex - 1 + CYCLE_COLORS.length) % CYCLE_COLORS.length;
        setCycleIndex(prevIdx);
        setActiveColor(CYCLE_COLORS[prevIdx].hex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isFullscreen, cycleIndex, fullscreenType]);

  const launchFullscreen = (type, colorOrPatternHex) => {
    setFullscreenType(type);
    if (type === "solid") {
      // If it's a solid preset color, match our cycle index
      const presetIdx = CYCLE_COLORS.findIndex(c => c.hex === colorOrPatternHex);
      if (presetIdx !== -1) {
        setCycleIndex(presetIdx);
        setActiveColor(colorOrPatternHex);
      } else {
        setActiveColor(colorOrPatternHex); // custom hex
      }
    } else {
      setActiveColor(colorOrPatternHex); // gradient or pattern code identifier
    }

    const container = fullscreenContainerRef.current;
    if (container) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      }
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const handleFullscreenClick = () => {
    // Left-clicking inside solid fullscreen mode cycles colors. Right-clicking or ESC exits.
    if (fullscreenType === "solid") {
      const nextIdx = (cycleIndex + 1) % CYCLE_COLORS.length;
      setCycleIndex(nextIdx);
      setActiveColor(CYCLE_COLORS[nextIdx].hex);
    } else {
      exitFullscreen();
    }
  };

  // Render Fullscreen Overlays for Gradients and Focus Patterns
  const renderFullscreenContent = () => {
    if (fullscreenType === "solid") {
      return (
        <div
          className="w-full h-full cursor-pointer transition-colors duration-150"
          style={{ backgroundColor: activeColor }}
          onClick={handleFullscreenClick}
        />
      );
    }

    if (fullscreenType === "gradient") {
      if (activeColor === "gray-bands") {
        return (
          <div className="w-full h-full flex cursor-pointer select-none" onClick={exitFullscreen}>
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex-1 h-full"
                style={{
                  backgroundColor: `rgb(${Math.round(i * 28.33)}, ${Math.round(
                    i * 28.33
                  )}, ${Math.round(i * 28.33)})`
                }}
              />
            ))}
          </div>
        );
      }

      if (activeColor === "gray-smooth") {
        return (
          <div
            className="w-full h-full bg-gradient-to-r from-black to-white cursor-pointer select-none"
            onClick={exitFullscreen}
          />
        );
      }

      if (activeColor === "rgb-red") {
        return (
          <div
            className="w-full h-full bg-gradient-to-r from-black to-red-600 cursor-pointer select-none"
            onClick={exitFullscreen}
          />
        );
      }

      if (activeColor === "rgb-green") {
        return (
          <div
            className="w-full h-full bg-gradient-to-r from-black to-green-600 cursor-pointer select-none"
            onClick={exitFullscreen}
          />
        );
      }

      if (activeColor === "rgb-blue") {
        return (
          <div
            className="w-full h-full bg-gradient-to-r from-black to-blue-600 cursor-pointer select-none"
            onClick={exitFullscreen}
          />
        );
      }

      if (activeColor === "rainbow") {
        return (
          <div
            className="w-full h-full cursor-pointer select-none"
            style={{
              background: "linear-gradient(to right, red, yellow, green, cyan, blue, magenta, red)"
            }}
            onClick={exitFullscreen}
          />
        );
      }
    }

    if (fullscreenType === "pattern") {
      if (activeColor === "focus-grid") {
        return (
          <div
            className="w-full h-full bg-black cursor-pointer select-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #333333 1px, transparent 1px), linear-gradient(to bottom, #333333 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
            onClick={exitFullscreen}
          />
        );
      }

      if (activeColor === "checkerboard") {
        return (
          <div
            className="w-full h-full bg-black cursor-pointer select-none"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #181818 25%, transparent 25%), linear-gradient(-45deg, #181818 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181818 75%), linear-gradient(-45deg, transparent 75%, #181818 75%)",
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px"
            }}
            onClick={exitFullscreen}
          />
        );
      }

      if (activeColor === "vert-lines") {
        return (
          <div
            className="w-full h-full bg-black cursor-pointer select-none"
            style={{
              backgroundImage: "linear-gradient(to right, #222222 2px, transparent 2px)",
              backgroundSize: "4px 100%"
            }}
            onClick={exitFullscreen}
          />
        );
      }
    }

    return null;
  };

  return (
    <PageContext.Provider value={{ activeItem: PAGE.DISPLAY_COLOR_TESTER }}>
      <Layout>
        {/* Hidden Container utilized by browser Fullscreen API */}
        <div
          ref={fullscreenContainerRef}
          className={`w-full h-full bg-black overflow-hidden flex items-center justify-center ${
            isFullscreen ? "fixed inset-0 z-50 block" : "hidden"
          }`}
        >
          {isFullscreen && (
            <>
              {renderFullscreenContent()}

              {/* Floating Entry Indicator */}
              <AnimatePresence>
                {showToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="absolute bottom-10 px-6 py-3.5 bg-black/85 backdrop-blur-md border border-zinc-800 rounded-2xl text-center text-xs text-white max-w-sm pointer-events-none shadow-2xl space-y-1 select-none z-[100]"
                  >
                    <span className="font-extrabold text-sm block tracking-wide">TRUE FULLSCREEN ACTIVE</span>
                    <span className="opacity-80 block font-medium">
                      {fullscreenType === "solid"
                        ? "Click or use Space/Arrows to cycle colors."
                        : "Click anywhere to exit."}
                    </span>
                    <span className="opacity-60 block text-[10px] uppercase font-bold pt-1">
                      Press ESC to exit testing
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Regular Page Render */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col space-y-6"
        >
          {/* Title Header area */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Monitor className="w-7 h-7 text-rose-600" />
              Display Tester
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-500">
              Calibrate monitor colors, detect dead pixels, test dynamic contrast steps, and check for backlight bleeding.
            </p>
          </div>

          {/* Top Specifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
              <Tv className="w-8 h-8 text-rose-500 shrink-0 opacity-85" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Screen Resolution
                </span>
                <span className="text-sm font-bold text-slate-800 truncate block">
                  {specs.width} × {specs.height}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
              <Compass className="w-8 h-8 text-indigo-500 shrink-0 opacity-85" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Viewport Area
                </span>
                <span className="text-sm font-bold text-slate-800 truncate block">
                  {specs.viewportWidth} × {specs.viewportHeight}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-amber-500 shrink-0 opacity-85" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pixel Ratio (HiDPI)
                </span>
                <span className="text-sm font-bold text-slate-800 truncate block">
                  {specs.pixelRatio}x {specs.pixelRatio > 1.5 ? "(Retina)" : "(Standard)"}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
              <Layers className="w-8 h-8 text-emerald-500 shrink-0 opacity-85" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Color Depth
                </span>
                <span className="text-sm font-bold text-slate-800 truncate block">
                  {specs.colorDepth}-bit Depth
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 col-span-2 md:col-span-4 lg:col-span-1">
              <Cpu className="w-8 h-8 text-teal-500 shrink-0 opacity-85" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Layout Orientation
                </span>
                <span className="text-sm font-bold text-slate-800 capitalize truncate block">
                  {specs.orientation}
                </span>
              </div>
            </div>
          </div>

          {/* Main Tests Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section 1: Solid Colors Dead Pixel Cycle */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 shrink-0">
                <Maximize2 className="w-5 h-5 text-rose-500" />
                Dead Pixel & Light Bleed Solid Tests
              </h2>
              <p className="text-xs text-slate-400 leading-normal">
                Solid fullscreen backgrounds help you instantly spot dead sub-pixels (black dots), bright/stuck sub-pixels (always-on colors), or uneven edge backlight bleeding (pure black test).
              </p>

              <div className="grid grid-cols-4 gap-3 pt-2">
                {CYCLE_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => launchFullscreen("solid", col.hex)}
                    className="flex flex-col items-center gap-2 focus:outline-none group text-center"
                  >
                    <div
                      className="w-full h-12 rounded-xl border border-slate-200 group-hover:scale-105 group-hover:shadow transition-all relative overflow-hidden"
                      style={{ backgroundColor: col.hex }}
                    >
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 truncate w-full">
                      {col.name.split(" ")[1] || col.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between text-xs text-slate-600">
                <span>Or cycle all solids in a hands-on sequence:</span>
                <button
                  onClick={() => launchFullscreen("solid", CYCLE_COLORS[0].hex)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-sm transition-all"
                >
                  Start Cycle Sequence
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Section 2: Contrast & Gradient Calibration */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 shrink-0">
                <Layers className="w-5 h-5 text-indigo-500" />
                Contrast & Gradient Calibration Sweeps
              </h2>
              <p className="text-xs text-slate-400 leading-normal">
                Observe the rendering of grey bands and smooth sweeps to evaluate your panel's contrast response limits and color banding depth levels.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: "gray-bands", name: "10-Step Grayscale", desc: "Checks clipping of whites/blacks" },
                  { id: "gray-smooth", name: "Smooth Grayscale", desc: "Reveals banding artifacts" },
                  { id: "rgb-red", name: "Red Gradient", desc: "Evaluates red channel saturation" },
                  { id: "rgb-green", name: "Green Gradient", desc: "Evaluates green channel saturation" },
                  { id: "rgb-blue", name: "Blue Gradient", desc: "Evaluates blue channel saturation" },
                  { id: "rainbow", name: "Smooth HSV Spectrum", desc: "Tests continuous spectrum blend" }
                ].map((grad) => (
                  <button
                    key={grad.id}
                    onClick={() => launchFullscreen("gradient", grad.id)}
                    className="p-3 text-left bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 hover:border-slate-300 rounded-2xl flex flex-col justify-between h-20 transition-all group relative overflow-hidden"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-700 block group-hover:text-rose-600 transition-colors">
                        {grad.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block pt-0.5 leading-tight">
                        {grad.desc}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5 mt-auto">
                      Fullscreen <Maximize className="w-2.5 h-2.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Fine Patterns Convergence & Scaling */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 shrink-0">
                <Grid className="w-5 h-5 text-emerald-500" />
                Convergence, Sharpness & Focus Patterns
              </h2>
              <p className="text-xs text-slate-400 leading-normal">
                Focus lines, checkerboards, and vertical strips reveal sharpness anomalies, bad pixel-mapping configurations, and image scaling artifacts.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { id: "focus-grid", name: "Thin Focus Grid", previewClass: "bg-black border border-zinc-800" },
                  { id: "checkerboard", name: "Fine Checkerboard", previewClass: "bg-zinc-800" },
                  { id: "vert-lines", name: "Vertical Striping", previewClass: "bg-black" }
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => launchFullscreen("pattern", pat.id)}
                    className="flex flex-col items-center gap-2 focus:outline-none group text-center"
                  >
                    <div className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 group-hover:scale-105 group-hover:shadow transition-all flex items-center justify-center relative overflow-hidden">
                      <Grid className="w-5 h-5 text-slate-400 opacity-60" />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize className="w-4 h-4 text-slate-800 drop-shadow" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 block">
                      {pat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: Interactive Custom Color Selection */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 shrink-0">
                  <RefreshCw className="w-5 h-5 text-amber-500" />
                  Custom Color Inspector Canvas
                </h2>
                <p className="text-xs text-slate-400 leading-normal mb-4">
                  Select a custom hex value with the color picker utility and deploy it onto fullscreen canvas to inspect specific custom display bounds.
                </p>

                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
                  {/* Styled circular color picker wrapper */}
                  <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: customColor }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Inspect Color HEX
                    </span>
                    <input
                      type="text"
                      value={customColor.toUpperCase()}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="text-sm font-bold text-slate-800 font-mono bg-transparent border-b border-slate-300 focus:border-rose-500 outline-none w-24 tracking-wider"
                    />
                  </div>

                  <button
                    onClick={() => launchFullscreen("solid", customColor)}
                    className="flex items-center gap-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all shrink-0"
                  >
                    Launch Fullscreen
                  </button>
                </div>
              </div>

              {/* Brief Quick Tips Footer block */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 leading-normal">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>
                  Tip: Wipe down your monitor screen with a microfiber cloth before starting stuck pixel tests to avoid mistaking real-world dust for monitor issues!
                </span>
              </div>
            </div>

          </div>

          {/* Informational Guidance Alert Box */}
          <div className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-4 flex gap-3 text-xs text-rose-800 leading-relaxed">
            <HelpCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold block mb-0.5">Stuck Pixel Revival Guidance</span>
              If you locate a stuck sub-pixel (which remains continuously green, red, or blue), you can sometimes massage it back to action. Open a solid bright fullscreen canvas and gently apply light focal pressure using a soft microfiber cloth for a few seconds. Alternatively, flash active high-frequency color boxes over the area for an extended period to stimulate electrical connections.
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
