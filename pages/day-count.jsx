import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  CalendarRange,
  Plus,
  Trash2,
  Bookmark,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  Info,
  Check
} from "lucide-react";
import moment from "moment";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";
import DayCountStorage from "../utils/storage/DayCount";
import DatePicker from "../components/DatePicker";

export default function DayCountCalculator() {
  const activeItem = PAGE.DAY_COUNT;

  // Tabs: "difference" | "adjust" | "milestones"
  const [activeTab, setActiveTab] = useState("difference");

  // State for Duration / Difference Calculator
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeEndDate, setIncludeEndDate] = useState(false);
  const [dayFilter, setDayFilter] = useState("all"); // "all" | "weekdays" | "weekends"
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

  // State for Date Adjuster
  const [adjustStartDate, setAdjustStartDate] = useState("");
  const [adjustOp, setAdjustOp] = useState("add"); // "add" | "subtract"
  const [adjustYears, setAdjustYears] = useState(0);
  const [adjustMonths, setAdjustMonths] = useState(0);
  const [adjustWeeks, setAdjustWeeks] = useState(0);
  const [adjustDays, setAdjustDays] = useState(0);

  // Saved Milestones
  const [milestones, setMilestones] = useState([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");

  // Initialize dates and load from LocalStorage
  useEffect(() => {
    const today = new Date();
    const formattedToday = moment(today).format("YYYY-MM-DD");
    
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    const formattedFuture = moment(futureDate).format("YYYY-MM-DD");

    // Load Difference State
    const savedStart = DayCountStorage.get("diff_start");
    const savedEnd = DayCountStorage.get("diff_end");
    const savedIncludeEnd = DayCountStorage.get("diff_include_end");
    const savedFilter = DayCountStorage.get("diff_filter");
    
    setStartDate(savedStart || formattedToday);
    setEndDate(savedEnd || formattedFuture);
    setIncludeEndDate(savedIncludeEnd === "true");
    setDayFilter(savedFilter || "all");

    // Load Adjust State
    const savedAdjustStart = DayCountStorage.get("adj_start");
    const savedAdjustOp = DayCountStorage.get("adj_op");
    const savedAdjY = DayCountStorage.get("adj_y");
    const savedAdjM = DayCountStorage.get("adj_m");
    const savedAdjW = DayCountStorage.get("adj_w");
    const savedAdjD = DayCountStorage.get("adj_d");

    setAdjustStartDate(savedAdjustStart || formattedToday);
    setAdjustOp(savedAdjustOp || "add");
    setAdjustYears(savedAdjY ? parseInt(savedAdjY, 10) : 0);
    setAdjustMonths(savedAdjM ? parseInt(savedAdjM, 10) : 0);
    setAdjustWeeks(savedAdjW ? parseInt(savedAdjW, 10) : 0);
    setAdjustDays(savedAdjD ? parseInt(savedAdjD, 10) : 7);

    // Load Milestones
    const savedMilestones = DayCountStorage.get("milestones");
    if (savedMilestones) {
      try {
        setMilestones(JSON.parse(savedMilestones));
      } catch (e) {
        console.error("Failed to parse milestones from storage", e);
      }
    } else {
      const defaultMilestones = [
        {
          id: "1",
          title: "New Year's Day",
          date: `${today.getFullYear() + 1}-01-01`,
        },
        {
          id: "2",
          title: "Summer Solstice",
          date: `${today.getFullYear()}-06-21`,
        }
      ];
      setMilestones(defaultMilestones);
      DayCountStorage.set("milestones", JSON.stringify(defaultMilestones));
    }
  }, []);

  // Save Difference Inputs to LocalStorage
  const handleDiffDateChange = (field, value) => {
    if (field === "start") {
      setStartDate(value);
      DayCountStorage.set("diff_start", value);
    } else if (field === "end") {
      setEndDate(value);
      DayCountStorage.set("diff_end", value);
    }
    setIsBookmarked(false);
  };

  const handleIncludeEndToggle = (value) => {
    setIncludeEndDate(value);
    DayCountStorage.set("diff_include_end", value ? "true" : "false");
    setIsBookmarked(false);
  };

  const handleDayFilterChange = (value) => {
    setDayFilter(value);
    DayCountStorage.set("diff_filter", value);
    setIsBookmarked(false);
  };

  // Save Adjust Inputs to LocalStorage
  const handleAdjustDateChange = (field, value) => {
    if (field === "start") {
      setAdjustStartDate(value);
      DayCountStorage.set("adj_start", value);
    } else if (field === "op") {
      setAdjustOp(value);
      DayCountStorage.set("adj_op", value);
    }
  };

  const handleAdjustValueChange = (unit, val) => {
    const numericVal = Math.max(0, parseInt(val || 0, 10));
    if (unit === "y") {
      setAdjustYears(numericVal);
      DayCountStorage.set("adj_y", numericVal.toString());
    } else if (unit === "m") {
      setAdjustMonths(numericVal);
      DayCountStorage.set("adj_m", numericVal.toString());
    } else if (unit === "w") {
      setAdjustWeeks(numericVal);
      DayCountStorage.set("adj_w", numericVal.toString());
    } else if (unit === "d") {
      setAdjustDays(numericVal);
      DayCountStorage.set("adj_d", numericVal.toString());
    }
  };

  // Reset Adjust values
  const resetAdjustments = () => {
    setAdjustYears(0);
    setAdjustMonths(0);
    setAdjustWeeks(0);
    setAdjustDays(0);
    DayCountStorage.set("adj_y", "0");
    DayCountStorage.set("adj_m", "0");
    DayCountStorage.set("adj_w", "0");
    DayCountStorage.set("adj_d", "0");
  };

  // Perform Calculations
  const diffCalculation = useMemo(() => {
    if (!startDate || !endDate) return null;

    const start = moment(startDate, "YYYY-MM-DD").toDate();
    const end = moment(endDate, "YYYY-MM-DD").toDate();

    let isNegative = false;
    let baseStart = start;
    let baseEnd = end;

    if (start > end) {
      isNegative = true;
      baseStart = end;
      baseEnd = start;
    }

    let totalDays = 0;
    let workingDays = 0;
    let weekendDays = 0;

    const cur = new Date(baseStart);
    const limit = new Date(baseEnd);
    if (includeEndDate) {
      limit.setDate(limit.getDate() + 1);
    }

    while (cur < limit) {
      const day = cur.getDay();
      const isWeekend = day === 0 || day === 6;
      totalDays++;
      if (isWeekend) {
        weekendDays++;
      } else {
        workingDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    let displayCount = totalDays;
    if (dayFilter === "weekdays") displayCount = workingDays;
    if (dayFilter === "weekends") displayCount = weekendDays;

    // Detailed Breakdown
    let years = baseEnd.getFullYear() - baseStart.getFullYear();
    let months = baseEnd.getMonth() - baseStart.getMonth();
    let days = baseEnd.getDate() - baseStart.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(baseEnd.getFullYear(), baseEnd.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalWeeks = Math.floor(totalDays / 7);
    const remainingDaysInWeek = totalDays % 7;

    return {
      displayCount,
      totalDays,
      workingDays,
      weekendDays,
      isNegative,
      years,
      months,
      days,
      weeks: totalWeeks,
      remainingDays: remainingDaysInWeek,
      hours: totalDays * 24,
      minutes: totalDays * 24 * 60,
      seconds: totalDays * 24 * 60 * 60
    };
  }, [startDate, endDate, includeEndDate, dayFilter]);

  const adjustCalculation = useMemo(() => {
    if (!adjustStartDate) return null;

    const result = moment(adjustStartDate, "YYYY-MM-DD").toDate();
    const sign = adjustOp === "add" ? 1 : -1;

    if (adjustYears) result.setFullYear(result.getFullYear() + adjustYears * sign);
    if (adjustMonths) result.setMonth(result.getMonth() + adjustMonths * sign);

    const extraDays = (adjustWeeks * 7 + adjustDays) * sign;
    if (extraDays) result.setDate(result.getDate() + extraDays);

    const relativeStr = () => {
      const parts = [];
      if (adjustYears) parts.push(`${adjustYears} year${adjustYears > 1 ? "s" : ""}`);
      if (adjustMonths) parts.push(`${adjustMonths} month${adjustMonths > 1 ? "s" : ""}`);
      if (adjustWeeks) parts.push(`${adjustWeeks} week${adjustWeeks > 1 ? "s" : ""}`);
      if (adjustDays) parts.push(`${adjustDays} day${adjustDays > 1 ? "s" : ""}`);
      if (parts.length === 0) return "0 days";
      return parts.join(", ");
    };

    return {
      formattedDate: moment(result).format("dddd, MMMM D, YYYY"),
      relativeText: `${adjustOp === "add" ? "Plus" : "Minus"} ${relativeStr()}`
    };
  }, [adjustStartDate, adjustOp, adjustYears, adjustMonths, adjustWeeks, adjustDays]);

  // Saved Milestones Calculations
  const processedMilestones = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return milestones.map((item) => {
      const target = moment(item.date, "YYYY-MM-DD").toDate();
      target.setHours(0, 0, 0, 0);

      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...item,
        daysDifference: diffDays,
        isFuture: diffDays > 0,
        isToday: diffDays === 0
      };
    }).sort((a, b) => Math.abs(a.daysDifference) - Math.abs(b.daysDifference));
  }, [milestones]);

  // Actions for Milestones
  const handleAddMilestone = (title, date) => {
    if (!title || !date) return;
    const newMilestone = {
      id: Date.now().toString(),
      title,
      date
    };
    const updated = [...milestones, newMilestone];
    setMilestones(updated);
    DayCountStorage.set("milestones", JSON.stringify(updated));
    setNewMilestoneTitle("");
    setNewMilestoneDate("");
  };

  const handleDeleteMilestone = (id) => {
    const updated = milestones.filter(item => item.id !== id);
    setMilestones(updated);
    DayCountStorage.set("milestones", JSON.stringify(updated));
  };

  // Add current calculation as a milestone
  const handleBookmarkCalculation = () => {
    if (!bookmarkTitle.trim() || !endDate) return;
    const newMilestone = {
      id: Date.now().toString(),
      title: bookmarkTitle.trim(),
      date: endDate
    };
    const updated = [...milestones, newMilestone];
    setMilestones(updated);
    DayCountStorage.set("milestones", JSON.stringify(updated));
    setBookmarkTitle("");
    setIsBookmarked(true);
    setTimeout(() => setIsBookmarked(false), 3000);
  };

  return (
    <PageContext.Provider value={{ activeItem }}>
      <Layout title="Day Count Calculator">
        <div className="max-w-4xl mx-auto">
          {/* Header Banner */}
          <div className="relative mb-8 p-6 sm:p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-indigo-950/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Time Utility
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Day Count Calculator</h1>
                <p className="mt-2 text-violet-100 max-w-xl text-sm sm:text-base">
                  Track dates, calculate differences, add or subtract intervals, and manage custom count milestone lists with local persistence.
                </p>
              </div>
              <div className="hidden md:flex p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 shrink-0 self-center">
                <Clock className="w-12 h-12 text-violet-100 opacity-90 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-200/60 backdrop-blur-md p-1.5 rounded-2xl mb-8 border border-slate-300/30">
            {[
              { id: "difference", name: "Duration Calculator", icon: CalendarRange },
              { id: "adjust", name: "Adjust Date", icon: RefreshCw },
              { id: "milestones", name: "Saved Milestones", icon: Bookmark }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all relative ${
                    isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white shadow-sm border border-slate-200/50 rounded-xl"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {activeTab === "difference" && (
                <motion.div
                  key="difference"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Inputs */}
                    <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
                      <div className="space-y-5">
                        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Options</h2>
                        
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={(val) => handleDiffDateChange("start", val)}
                        />

                        <DatePicker
                          label="End Date"
                          value={endDate}
                          onChange={(val) => handleDiffDateChange("end", val)}
                        />

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Include End Date</label>
                          <label className="relative flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={includeEndDate}
                              onChange={(e) => handleIncludeEndToggle(e.target.checked)}
                              className="w-4.5 h-4.5 rounded text-violet-600 focus:ring-violet-500/20 border-slate-300"
                            />
                            <div className="text-xs">
                              <p className="font-semibold text-slate-700">Add end date (+1 day)</p>
                              <p className="text-slate-400">Include target day in the total count</p>
                            </div>
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Day Exclusion</label>
                          <select
                            value={dayFilter}
                            onChange={(e) => handleDayFilterChange(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm text-slate-800"
                          >
                            <option value="all">All calendar days</option>
                            <option value="weekdays">Working days only (Mon - Fri)</option>
                            <option value="weekends">Weekend days only (Sat - Sun)</option>
                          </select>
                        </div>
                      </div>

                      {/* Bookmark Section */}
                      {endDate && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 bg-slate-50/50 p-3 rounded-2xl">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Save Calculation</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Title (e.g. Vacation)"
                              value={bookmarkTitle}
                              onChange={(e) => setBookmarkTitle(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-xs text-slate-800"
                            />
                            <button
                              onClick={handleBookmarkCalculation}
                              disabled={!bookmarkTitle.trim()}
                              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:hover:bg-violet-600 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition-all"
                            >
                              {isBookmarked ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Saved
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  Add
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Results Display */}
                    <div className="md:col-span-2 space-y-6">
                      {diffCalculation ? (
                        <>
                          {/* Giant Counter Display */}
                          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500" />
                            
                            <motion.span
                              key={`${diffCalculation.displayCount}-${dayFilter}`}
                              initial={{ scale: 0.85, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-7xl sm:text-8xl font-black text-slate-900 tracking-tighter"
                            >
                              {diffCalculation.displayCount}
                            </motion.span>
                            
                            <span className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-violet-500" />
                              {dayFilter === "all" && "Total Calendar Days"}
                              {dayFilter === "weekdays" && "Total Working Days"}
                              {dayFilter === "weekends" && "Total Weekend Days"}
                            </span>

                            {diffCalculation.isNegative && (
                              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                                <Info className="w-3.5 h-3.5" />
                                Note: Start date was after end date (Absolute difference shown)
                              </div>
                            )}
                          </div>

                          {/* Breakdown Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Breakdown Option 1 */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Calendar Breakdown</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between items-baseline py-1 border-b border-slate-50">
                                  <span className="text-sm text-slate-500">Years</span>
                                  <span className="font-bold text-slate-800 text-lg">{diffCalculation.years}</span>
                                </div>
                                <div className="flex justify-between items-baseline py-1 border-b border-slate-50">
                                  <span className="text-sm text-slate-500">Months</span>
                                  <span className="font-bold text-slate-800 text-lg">{diffCalculation.months}</span>
                                </div>
                                <div className="flex justify-between items-baseline py-1">
                                  <span className="text-sm text-slate-500">Days</span>
                                  <span className="font-bold text-slate-800 text-lg">{diffCalculation.days}</span>
                                </div>
                              </div>
                            </div>

                            {/* Breakdown Option 2 */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Alt Breakdown</h3>
                              <div className="space-y-2">
                                <div className="flex justify-between items-baseline py-1 border-b border-slate-50">
                                  <span className="text-sm text-slate-500">Weeks & Days</span>
                                  <span className="font-semibold text-slate-800">
                                    {diffCalculation.weeks}w {diffCalculation.remainingDays}d
                                  </span>
                                </div>
                                <div className="flex justify-between items-baseline py-1 border-b border-slate-50">
                                  <span className="text-sm text-slate-500">Total Hours</span>
                                  <span className="font-semibold text-slate-800">{diffCalculation.hours.toLocaleString()} h</span>
                                </div>
                                <div className="flex justify-between items-baseline py-1">
                                  <span className="text-sm text-slate-500">Total Minutes</span>
                                  <span className="font-semibold text-slate-800 text-sm truncate max-w-[140px]">{diffCalculation.minutes.toLocaleString()} m</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
                          <Calendar className="w-12 h-12 text-slate-300 mb-3" />
                          Please choose valid starting and ending dates.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "adjust" && (
                <motion.div
                  key="adjust"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Control Panel */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Adjust Value</h2>
                      </div>

                      <DatePicker
                        label="Start Date"
                        value={adjustStartDate}
                        onChange={(val) => handleAdjustDateChange("start", val)}
                      />

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Operation</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => handleAdjustDateChange("op", "add")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                              adjustOp === "add" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            Add (+1)
                          </button>
                          <button
                            onClick={() => handleAdjustDateChange("op", "subtract")}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                              adjustOp === "subtract" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            Subtract (-1)
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Values to Adjust</label>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Years</span>
                            <input
                              type="number"
                              min="0"
                              value={adjustYears || ""}
                              onChange={(e) => handleAdjustValueChange("y", e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-semibold"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Months</span>
                            <input
                              type="number"
                              min="0"
                              value={adjustMonths || ""}
                              onChange={(e) => handleAdjustValueChange("m", e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-semibold"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Weeks</span>
                            <input
                              type="number"
                              min="0"
                              value={adjustWeeks || ""}
                              onChange={(e) => handleAdjustValueChange("w", e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-semibold"
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
                            <input
                              type="number"
                              min="0"
                              value={adjustDays || ""}
                              onChange={(e) => handleAdjustValueChange("d", e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-semibold"
                            />
                          </div>
                        </div>

                        <button
                          onClick={resetAdjustments}
                          className="w-full py-2 border border-dashed border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 rounded-xl text-xs font-semibold tracking-wide transition-all"
                        >
                          Clear adjustments
                        </button>
                      </div>
                    </div>

                    {/* Target Date Output & Presets */}
                    <div className="md:col-span-2 space-y-6">
                      {/* Giant Target Display */}
                      {adjustCalculation ? (
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-center min-h-[180px] relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{adjustCalculation.relativeText}</span>
                          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">{adjustCalculation.formattedDate}</h3>
                        </div>
                      ) : (
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center text-slate-400 min-h-[180px] flex items-center justify-center">
                          Please enter a starting date.
                        </div>
                      )}

                      {/* Quick Presets Grid */}
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-violet-500" />
                          Quick Adjustment Presets
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { name: "+1 Week", action: () => { resetAdjustments(); handleAdjustValueChange("d", 7); setAdjustOp("add"); } },
                            { name: "+30 Days", action: () => { resetAdjustments(); handleAdjustValueChange("d", 30); setAdjustOp("add"); } },
                            { name: "+90 Days", action: () => { resetAdjustments(); handleAdjustValueChange("d", 90); setAdjustOp("add"); } },
                            { name: "+1 Year", action: () => { resetAdjustments(); handleAdjustValueChange("y", 1); setAdjustOp("add"); } },
                            { name: "-1 Week", action: () => { resetAdjustments(); handleAdjustValueChange("d", 7); setAdjustOp("subtract"); } },
                            { name: "-30 Days", action: () => { resetAdjustments(); handleAdjustValueChange("d", 30); setAdjustOp("subtract"); } },
                            { name: "-90 Days", action: () => { resetAdjustments(); handleAdjustValueChange("d", 90); setAdjustOp("subtract"); } },
                            { name: "-1 Year", action: () => { resetAdjustments(); handleAdjustValueChange("y", 1); setAdjustOp("subtract"); } },
                          ].map((preset, index) => (
                            <button
                              key={index}
                              onClick={preset.action}
                              className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:border-violet-500/50 hover:bg-violet-50/20 text-slate-700 hover:text-violet-700 font-semibold text-xs rounded-xl transition-all shadow-sm"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "milestones" && (
                <motion.div
                  key="milestones"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Create New Milestone form */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-base font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-1.5">
                      <Plus className="w-5 h-5 text-violet-500" />
                      Add Custom Date Tracker
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Wedding Anniversary"
                          value={newMilestoneTitle}
                          onChange={(e) => setNewMilestoneTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm text-slate-800 placeholder-slate-400 font-medium"
                        />
                      </div>

                      <DatePicker
                        label="Target Date"
                        value={newMilestoneDate}
                        onChange={(val) => setNewMilestoneDate(val)}
                      />

                      <button
                        onClick={() => handleAddMilestone(newMilestoneTitle, newMilestoneDate)}
                        disabled={!newMilestoneTitle.trim() || !newMilestoneDate}
                        className="py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:hover:bg-violet-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/10 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Create Tracker
                      </button>
                    </div>
                  </div>

                  {/* Milestones Listing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {processedMilestones.length > 0 ? (
                      processedMilestones.map((item) => {
                        const daysAbs = Math.abs(item.daysDifference);
                        const displayDate = moment(item.date, "YYYY-MM-DD").format("MMM D, YYYY");
                        
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            className="group relative bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-violet-500/30 transition-all overflow-hidden flex flex-col justify-between"
                          >
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${
                              item.isToday ? "bg-emerald-500" : item.isFuture ? "bg-violet-500" : "bg-indigo-500"
                            }`} />

                            <div className="pl-2.5">
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-violet-700 transition-colors tracking-tight">{item.title}</h3>
                                <div className="shrink-0 flex gap-1.5">
                                  {item.isToday ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-extrabold uppercase">Today</span>
                                  ) : item.isFuture ? (
                                    <span className="px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-[10px] font-extrabold uppercase">Countdown</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-extrabold uppercase">Countup</span>
                                  )}
                                </div>
                              </div>

                              <span className="text-xs text-slate-400 font-semibold block mb-4 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {displayDate}
                              </span>

                              <div className="flex items-baseline gap-1.5">
                                <span className={`text-4xl font-black tracking-tight ${
                                  item.isToday ? "text-emerald-600" : item.isFuture ? "text-violet-600" : "text-indigo-600"
                                }`}>
                                  {daysAbs}
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                  {item.isToday ? "days" : item.isFuture ? "days left" : "days ago"}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteMilestone(item.id)}
                              className="absolute bottom-4 right-4 p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              title="Delete tracker"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center min-h-[200px]">
                        <Bookmark className="w-10 h-10 text-slate-300 mb-2" />
                        No saved counters yet. Create one above to track custom deadlines or milestones!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Layout>
    </PageContext.Provider>
  );
}
