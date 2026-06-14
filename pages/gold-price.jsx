import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Clock,
  AlertCircle,
  ChevronDown,
  Minus,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const TROY_OZ_GRAMS = 31.1035;
const KHR_RATE = 4100;

const PRICE_CACHE_KEY = "gold_price_cache_v1";
const CHART_CACHE_KEY_PREFIX = "gold_chart_cache_v1_";
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

const DATE_RANGES = [
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

const KARATS = [
  { label: "24K", purity: 0.999, desc: "Fine Gold (99.9%)" },
  { label: "22K", purity: 0.916, desc: "Standard Jewelry" },
  { label: "21K", purity: 0.875, desc: "High-End Jewelry" },
  { label: "18K", purity: 0.750, desc: "Premium / Platine" },
  { label: "14K", purity: 0.583, desc: "Durable Jewelry" },
  { label: "10K", purity: 0.417, desc: "Economy Jewelry" },
];

const UNITS = [
  { key: "oz", label: "Troy Ounce", labelKh: null, grams: TROY_OZ_GRAMS },
  { key: "g", label: "Gram", labelKh: null, grams: 1 },
  { key: "kg", label: "Kilogram", labelKh: null, grams: 1000 },
  { key: "damleung", label: "Damleung", labelKh: "ដំឡឹង", grams: 37.5 },
  { key: "chi", label: "Chi", labelKh: "ជី", grams: 3.75 },
  { key: "hun", label: "Hun", labelKh: "ហ៊ុន", grams: 0.375 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(value, currency = "USD") {
  if (value == null || isNaN(value)) return "—";
  if (currency === "KHR") {
    return `៛${Math.round(value).toLocaleString()}`;
  }
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNum(value) {
  if (value == null || isNaN(value)) return "—";
  if (value >= 1000) return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 1) return value.toFixed(4);
  if (value >= 0.01) return value.toFixed(6);
  return value.toFixed(8);
}

function relativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

// ─── SVG Chart Component ─────────────────────────────────────────────────────

function TrendChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="w-full h-[220px] sm:h-[260px] rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Loading chart…</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[220px] sm:h-[260px] rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
        <span className="text-xs text-slate-400 font-medium">No chart data available</span>
      </div>
    );
  }

  const W = 600;
  const H = 200;
  const PAD = { top: 20, right: 16, bottom: 32, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const prices = data.map((d) => d[1]);
  const timestamps = data.map((d) => d[0]);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const points = prices.map((p, i) => {
    const x = PAD.left + (i / (prices.length - 1)) * innerW;
    const y = PAD.top + innerH - ((p - minP) / range) * innerH;
    return { x, y, price: p, time: timestamps[i] };
  });

  const pathD = points
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(2)} ${PAD.top + innerH} L ${points[0].x.toFixed(2)} ${PAD.top + innerH} Z`;

  const isUp = prices[prices.length - 1] >= prices[0];
  const strokeColor = isUp ? "#10b981" : "#ef4444";
  const fillGradientId = isUp ? "chartGradGreen" : "chartGradRed";

  const minIdx = prices.indexOf(minP);
  const maxIdx = prices.indexOf(maxP);

  // Y-axis labels
  const yLabels = [minP, minP + range * 0.25, minP + range * 0.5, minP + range * 0.75, maxP];

  // X-axis labels (first, middle, last)
  const xLabelIdxs = [0, Math.floor(timestamps.length / 2), timestamps.length - 1];

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200 shadow-sm p-3 sm:p-4 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartGradGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartGradRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map((v, i) => {
          const y = PAD.top + innerH - ((v - minP) / range) * innerH;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="0.8"
                strokeDasharray="4 3"
              />
              <text x={PAD.left - 6} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="9" fontFamily="system-ui">
                ${v.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {xLabelIdxs.map((idx) => {
          const pt = points[idx];
          if (!pt) return null;
          const d = new Date(timestamps[idx]);
          const label = `${d.getMonth() + 1}/${d.getDate()}`;
          return (
            <text
              key={idx}
              x={pt.x}
              y={H - 6}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
              fontFamily="system-ui"
            >
              {label}
            </text>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${fillGradientId})`} />

        {/* Line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* High marker */}
        <circle cx={points[maxIdx].x} cy={points[maxIdx].y} r="3.5" fill="#fff" stroke="#10b981" strokeWidth="2" />
        <text
          x={points[maxIdx].x}
          y={points[maxIdx].y - 8}
          textAnchor="middle"
          fill="#10b981"
          fontSize="8"
          fontWeight="600"
          fontFamily="system-ui"
        >
          H ${maxP.toFixed(0)}
        </text>

        {/* Low marker */}
        <circle cx={points[minIdx].x} cy={points[minIdx].y} r="3.5" fill="#fff" stroke="#ef4444" strokeWidth="2" />
        <text
          x={points[minIdx].x}
          y={points[minIdx].y + 14}
          textAnchor="middle"
          fill="#ef4444"
          fontSize="8"
          fontWeight="600"
          fontFamily="system-ui"
        >
          L ${minP.toFixed(0)}
        </text>
      </svg>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function GoldPricePage() {
  const [pricePerOz, setPricePerOz] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedKarat, setSelectedKarat] = useState(0); // index into KARATS
  const [currency, setCurrency] = useState("USD"); // "USD" | "KHR"
  const [weightInput, setWeightInput] = useState("1");
  const [weightUnit, setWeightUnit] = useState("oz");
  const [karatOpen, setKaratOpen] = useState(false);
  const [chartRangeIdx, setChartRangeIdx] = useState(1); // index into DATE_RANGES, default 7D

  // ── Fetchers ─────────────────────────────────────────────────────────────

  const fetchPrice = useCallback(async (force = false) => {
    // Try cache first unless a forced refresh is requested
    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(PRICE_CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const age = Date.now() - cached.timestamp;
          if (age < CACHE_MAX_AGE_MS) {
            setPricePerOz(cached.pricePerOz);
            setLastUpdated(new Date(cached.timestamp));
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore malformed cache
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd&include_24hr_change=true"
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const usd = data?.["pax-gold"]?.usd;
      if (usd == null) throw new Error("Invalid response");
      const now = Date.now();
      setPricePerOz(usd);
      setLastUpdated(new Date(now));
      try {
        localStorage.setItem(
          PRICE_CACHE_KEY,
          JSON.stringify({ pricePerOz: usd, timestamp: now })
        );
      } catch {
        // Storage may be unavailable (e.g. private mode) — ignore
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChart = useCallback(async (force = false, days = DATE_RANGES[chartRangeIdx].days) => {
    const cacheKey = `${CHART_CACHE_KEY_PREFIX}${days}`;

    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const age = Date.now() - cached.timestamp;
          if (age < CACHE_MAX_AGE_MS) {
            setChartData(cached.data);
            setChartLoading(false);
            return;
          }
        }
      } catch {
        // Ignore malformed cache
      }
    }

    setChartLoading(true);
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/pax-gold/market_chart?vs_currency=usd&days=${days}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.prices) {
        // Downsample to ~100 points for performance
        const raw = data.prices;
        const step = Math.max(1, Math.floor(raw.length / 100));
        const sampled = raw.filter((_, i) => i % step === 0);
        setChartData(sampled);
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data: sampled, timestamp: Date.now() })
          );
        } catch {
          // Storage may be unavailable (e.g. private mode) — ignore
        }
      }
    } catch {
      // Chart failure is non-critical — we just don't display chart data
    } finally {
      setChartLoading(false);
    }
  }, [chartRangeIdx]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  useEffect(() => {
    fetchChart();
  }, [chartRangeIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived values ───────────────────────────────────────────────────────

  const karat = KARATS[selectedKarat];
  const purityMultiplier = karat.purity;
  const currencyMultiplier = currency === "KHR" ? KHR_RATE : 1;

  const pricePerGram = useMemo(() => {
    if (pricePerOz == null) return null;
    return (pricePerOz / TROY_OZ_GRAMS) * purityMultiplier;
  }, [pricePerOz, purityMultiplier]);

  const inputWeight = parseFloat(weightInput) || 0;
  const selectedUnit = UNITS.find((u) => u.key === weightUnit);
  const inputGrams = inputWeight * (selectedUnit?.grams ?? 1);

  // Price for entered weight
  const enteredPrice = useMemo(() => {
    if (pricePerGram == null) return null;
    return pricePerGram * inputGrams * currencyMultiplier;
  }, [pricePerGram, inputGrams, currencyMultiplier]);

  // Conversion table: price per unit at selected karat & currency
  const unitPrices = useMemo(() => {
    if (pricePerGram == null) return {};
    const result = {};
    for (const u of UNITS) {
      result[u.key] = pricePerGram * u.grams * currencyMultiplier;
    }
    return result;
  }, [pricePerGram, currencyMultiplier]);

  // Weight conversions from input
  const weightConversions = useMemo(() => {
    const result = {};
    for (const u of UNITS) {
      result[u.key] = inputGrams / u.grams;
    }
    return result;
  }, [inputGrams]);

  // 24h change from chart data
  const change24h = useMemo(() => {
    if (chartData.length < 2) return null;
    const now = chartData[chartData.length - 1][1];
    // Find the point closest to 24h ago
    const targetTime = Date.now() - 24 * 60 * 60 * 1000;
    let closest = chartData[0];
    for (const d of chartData) {
      if (Math.abs(d[0] - targetTime) < Math.abs(closest[0] - targetTime)) {
        closest = d;
      }
    }
    const prev = closest[1];
    return ((now - prev) / prev) * 100;
  }, [chartData]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <PageContext.Provider value={{ activeItem: PAGE.GOLD_PRICE }}>
      <Layout
        title="Gold Price Tracker"
        description="Track real-time gold spot prices, convert across international & Cambodian units, adjust karat purity, and view historical trends."
        keywords="gold price, gold tracker, XAU, PAXG, damleung, chi, hun, cambodia gold, karat, gold converter"
      >
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-amber-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                  <path d="M7 6h1v4" />
                  <path d="m16.71 13.88.7.71-2.82 2.82" />
                </svg>
              </span>
              Gold Price Tracker
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Real-time gold spot price via PAXG · Conversion across international & Cambodian units
            </p>
          </div>

          {/* ── Live Price Banner ───────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 relative overflow-hidden mb-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Gold Spot Price (XAU/USD)
                  </span>
                  {loading && (
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  {pricePerOz != null ? (
                    <>
                      <span className="text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums tracking-tight">
                        ${pricePerOz.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm text-slate-400 font-medium">/oz t</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-slate-300">—</span>
                  )}

                  {change24h != null && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        change24h >= 0
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-red-50 text-red-600 border border-red-200"
                      }`}
                    >
                      {change24h >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {change24h >= 0 ? "+" : ""}
                      {change24h.toFixed(2)}%
                    </span>
                  )}
                </div>

                {lastUpdated && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    Updated {relativeTime(lastUpdated)}
                    <span className="text-slate-300">·</span>
                    <span>Source: CoinGecko (PAXG)</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  fetchPrice(true);
                  fetchChart(true);
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-sm self-start sm:self-center"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Failed to fetch live price ({error}). Showing last known value.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── 7-Day Trend ────────────────────────────────────────────── */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Price Trend
              </h2>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {DATE_RANGES.map((range, i) => (
                  <button
                    key={range.label}
                    onClick={() => setChartRangeIdx(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      i === chartRangeIdx
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <TrendChart data={chartData} isLoading={chartLoading} />
          </div>

          {/* ── Controls Row ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Karat Picker */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 relative overflow-visible">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Purity / Karat
              </label>
              <div className="relative">
                <button
                  onClick={() => setKaratOpen(!karatOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-300 to-amber-500 text-white text-xs font-bold shadow-sm">
                      {karat.label}
                    </span>
                    <div className="text-left">
                      <div className="font-semibold">{karat.label}</div>
                      <div className="text-xs text-slate-400">{karat.desc} · {(karat.purity * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${karatOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {karatOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                    >
                      {KARATS.map((k, i) => (
                        <button
                          key={k.label}
                          onClick={() => {
                            setSelectedKarat(i);
                            setKaratOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                            i === selectedKarat
                              ? "bg-amber-50 text-amber-900"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-amber-500 text-white text-[10px] font-bold">
                            {k.label}
                          </span>
                          <div className="text-left">
                            <div className="font-medium">{k.label}</div>
                            <div className="text-xs text-slate-400">{k.desc}</div>
                          </div>
                          <span className="ml-auto text-xs font-mono text-slate-400">
                            {(k.purity * 100).toFixed(1)}%
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Currency Toggle */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Display Currency
              </label>
              <div className="flex gap-2">
                {[
                  { key: "USD", label: "USD", symbol: "$", flag: "🇺🇸" },
                  { key: "KHR", label: "KHR", symbol: "៛", flag: "🇰🇭" },
                ].map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCurrency(c.key)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currency === c.key
                        ? "bg-slate-900 text-white shadow-md"
                        : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span>{c.label}</span>
                    <span className="text-xs opacity-60">{c.symbol}</span>
                  </button>
                ))}
              </div>
              {currency === "KHR" && (
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  Rate: 1 USD = {KHR_RATE.toLocaleString()} KHR (fixed reference)
                </p>
              )}
            </div>
          </div>

          {/* ── Price Per Unit Table ────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-400" />
            <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-amber-500" />
              Price Per Unit
              <span className="ml-auto text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {karat.label} ({(karat.purity * 100).toFixed(1)}%)
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {UNITS.map((u) => (
                <div
                  key={u.key}
                  className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors group"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-amber-800 transition-colors">
                      {u.label}
                    </div>
                    {u.labelKh && (
                      <div className="text-xs text-slate-400">{u.labelKh} · {u.grams}g</div>
                    )}
                    {!u.labelKh && u.key !== "g" && (
                      <div className="text-xs text-slate-400">{u.grams}g</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatPrice(unitPrices[u.key], currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Weight Converter ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
            <h2 className="text-sm font-semibold text-slate-800 mb-4">
              Weight &amp; Price Converter
            </h2>

            {/* Input row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Weight</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all tabular-nums"
                  placeholder="Enter weight…"
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Unit</label>
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all appearance-none cursor-pointer"
                >
                  {UNITS.map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.label}
                      {u.labelKh ? ` (${u.labelKh})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Total value */}
            {enteredPrice != null && inputWeight > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl px-5 py-4 mb-5"
              >
                <div className="text-xs text-amber-700 font-medium mb-1">
                  Total Value ({karat.label} · {inputWeight} {selectedUnit?.label})
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-900 tabular-nums">
                  {formatPrice(enteredPrice, currency)}
                </div>
                {currency === "USD" && (
                  <div className="text-xs text-amber-600 mt-1">
                    ≈ {formatPrice(enteredPrice * KHR_RATE, "KHR")}
                  </div>
                )}
                {currency === "KHR" && (
                  <div className="text-xs text-amber-600 mt-1">
                    ≈ {formatPrice(enteredPrice / KHR_RATE, "USD")}
                  </div>
                )}
              </motion.div>
            )}

            {/* Weight conversion grid */}
            <div className="border-t border-slate-100 pt-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Weight Equivalents
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {UNITS.map((u) => (
                  <div
                    key={u.key}
                    className={`px-3 py-2.5 rounded-xl text-center transition-colors ${
                      u.key === weightUnit
                        ? "bg-amber-100 border border-amber-300"
                        : "bg-slate-50 border border-slate-100"
                    }`}
                  >
                    <div className="text-[10px] font-medium text-slate-400 uppercase mb-1">
                      {u.label}
                    </div>
                    <div className={`text-sm font-bold tabular-nums ${
                      u.key === weightUnit ? "text-amber-800" : "text-slate-800"
                    }`}>
                      {formatNum(weightConversions[u.key])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer note ───────────────────────────────────────────── */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Prices sourced from CoinGecko (PAX Gold / PAXG) · Data refreshes on demand ·
              <span className="block sm:inline">
                {" "}1 Damleung = 10 Chi = 100 Hun = 37.5g · 1 Troy Ounce ≈ 31.1035g
              </span>
            </p>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
