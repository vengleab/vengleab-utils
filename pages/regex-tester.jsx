import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Regex,
  Copy,
  Check,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Cpu,
  Activity,
  X,
  Code
} from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";
import RegexTesterStorage from "../utils/storage/RegexTester";

const PRESETS = [
  {
    name: "Email Address",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    flags: "g",
    testText: "Please contact support@example.com or admin.office@company.co.uk for inquiries. Invalid email addresses like hello@world, space inside@domain.com, or user@.com should not match."
  },
  {
    name: "URL / Link",
    pattern: "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)",
    flags: "g",
    testText: "Search on https://google.com or check out http://github.com/vengleab-util for details. Don't match secure ftp://invalid-url.com or plain text domains like example.org."
  },
  {
    name: "Cambodia Phone Number",
    pattern: "(?:\\+855|0)\\s*(\\d{2,3})[-.\\s]?(\\d{3})[-.\\s]?(\\d{3,4})\\b",
    flags: "g",
    testText: "Contact our Phnom Penh office at 023 888 999 or call mobile +855 12 345 678. You can also reach us via 098-765-4321 or simply 015678910. Invalid formats like +855 1234 or 012-34-56 or 1234567890 (no leading 0) will not match."
  },
  {
    name: "IPv4 Address",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    testText: "The local server is running on 127.0.0.1 and the gateway is 192.168.1.1. Let's make sure 256.100.0.50 (invalid octet) or 10.0.0.300 are not matched, but 10.0.0.1 is."
  },
  {
    name: "Date (YYYY-MM-DD)",
    pattern: "\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b",
    flags: "g",
    testText: "The project started on 2026-05-20 and will be delivered by 2026-06-30. Make sure invalid dates like 2026-13-45 or 999-12-12 are filtered out."
  },
  {
    name: "Hex Color",
    pattern: "#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b",
    flags: "gi",
    testText: "Use color #FF5733 for primary actions and #33B5E5 for links. Subtle backgrounds can use #f5f5f5 or #fff. Plain text like #xyz or hash without characters like #12 should not match."
  }
];

const CHEATSHEET = [
  {
    title: "Character Classes",
    items: [
      { code: ".", desc: "Any character except newline" },
      { code: "\\d", desc: "Any digit (0-9)" },
      { code: "\\D", desc: "Any non-digit" },
      { code: "\\w", desc: "Word char (a-z, A-Z, 0-9, _)" },
      { code: "\\W", desc: "Non-word character" },
      { code: "\\s", desc: "Whitespace (space, tab, newline)" },
      { code: "\\S", desc: "Non-whitespace" }
    ]
  },
  {
    title: "Anchors & Boundaries",
    items: [
      { code: "^", desc: "Start of string / line" },
      { code: "$", desc: "End of string / line" },
      { code: "\\b", desc: "Word boundary" },
      { code: "\\B", desc: "Non-word boundary" }
    ]
  },
  {
    title: "Quantifiers",
    items: [
      { code: "*", desc: "0 or more times" },
      { code: "+", desc: "1 or more times" },
      { code: "?", desc: "0 or 1 time (optional)" },
      { code: "{n}", desc: "Exactly n times" },
      { code: "{n,}", desc: "n or more times" },
      { code: "{n,m}", desc: "Between n and m times" }
    ]
  },
  {
    title: "Groups & Ranges",
    items: [
      { code: "[abc]", desc: "Any character in the set (a, b, c)" },
      { code: "[^abc]", desc: "Any character NOT in the set" },
      { code: "[a-z]", desc: "Range of characters (a to z)" },
      { code: "(x)", desc: "Capture group (remembers x)" },
      { code: "(?:x)", desc: "Non-capturing group" },
      { code: "x|y", desc: "Alternation (matches x or y)" }
    ]
  }
];

export default function RegExTester() {
  const [pattern, setPattern] = useState("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
  const [flags, setFlags] = useState("g");
  const [subjectText, setSubjectText] = useState(
    "Please contact support@example.com or admin.office@company.co.uk for inquiries. Invalid email addresses like hello@world, space inside@domain.com, or user@.com should not match."
  );

  const [activePreset, setActivePreset] = useState("Email Address");
  const [cheatsheetOpen, setCheatsheetOpen] = useState({});
  const [copied, setCopied] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedPattern = RegexTesterStorage.get("pattern");
    const savedFlags = RegexTesterStorage.get("flags");
    const savedText = RegexTesterStorage.get("text");
    const savedPreset = RegexTesterStorage.get("preset");

    if (savedPattern) setPattern(savedPattern);
    if (savedFlags) setFlags(savedFlags);
    if (savedText) setSubjectText(savedText);
    if (savedPreset) setActivePreset(savedPreset);
  }, []);

  // Update storage helper on value changes
  const updatePattern = (val) => {
    setPattern(val);
    RegexTesterStorage.set("pattern", val);
    setActivePreset("");
    RegexTesterStorage.set("preset", "");
  };

  const updateFlags = (val) => {
    setFlags(val);
    RegexTesterStorage.set("flags", val);
    setActivePreset("");
    RegexTesterStorage.set("preset", "");
  };

  const updateSubjectText = (val) => {
    setSubjectText(val);
    RegexTesterStorage.set("text", val);
  };

  const applyPreset = (preset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setSubjectText(preset.testText);
    setActivePreset(preset.name);

    RegexTesterStorage.set("pattern", preset.pattern);
    RegexTesterStorage.set("flags", preset.flags);
    RegexTesterStorage.set("text", preset.testText);
    RegexTesterStorage.set("preset", preset.name);
  };

  const toggleCheatsheetSection = (title) => {
    setCheatsheetOpen(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const copyToClipboard = () => {
    const fullRegex = `/${pattern}/${flags}`;
    navigator.clipboard.writeText(fullRegex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compile and evaluate regex safely with performance tracking
  let error = null;
  let matches = [];
  let executionTime = 0;

  try {
    if (pattern !== "") {
      const startTime = performance.now();
      const regex = new RegExp(pattern, flags);

      if (regex.global) {
        let match;
        let limit = 0;
        regex.lastIndex = 0;

        while ((match = regex.exec(subjectText)) !== null) {
          matches.push(match);

          // Safeguard: force advance for zero-width matches to avoid infinite loop
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }

          limit++;
          if (limit > 5000) {
            break;
          }
        }
      } else {
        const match = regex.exec(subjectText);
        if (match) {
          matches.push(match);
        }
      }

      const endTime = performance.now();
      executionTime = (endTime - startTime).toFixed(2);
    }
  } catch (e) {
    error = e.message;
  }

  // Render Highlighted Matches Visualizer
  const renderHighlightedMatches = () => {
    if (!subjectText) {
      return <span className="text-slate-400 italic">Enter test text above to view highlights...</span>;
    }
    if (error || !pattern || matches.length === 0) {
      return <span>{subjectText}</span>;
    }

    let lastIndex = 0;
    const elements = [];

    matches.forEach((match, idx) => {
      const start = match.index;
      const end = start + match[0].length;

      // Unmatched prefix text
      if (start > lastIndex) {
        elements.push(subjectText.slice(lastIndex, start));
      }

      // Matched text highlight
      const matchedString = match[0];
      elements.push(
        <span
          key={`match-${idx}`}
          className="relative group bg-sky-100 text-sky-950 border-b-2 border-sky-500 rounded-sm px-0.5 font-medium transition-all hover:bg-sky-200 cursor-pointer"
        >
          {matchedString || <span className="text-slate-400 italic text-[10px]">[zero-width]</span>}

          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 font-sans shadow-md">
            Match #{idx + 1}
          </span>
        </span>
      );

      lastIndex = end;
    });

    // Unmatched suffix text
    if (lastIndex < subjectText.length) {
      elements.push(subjectText.slice(lastIndex));
    }

    return elements;
  };

  return (
    <PageContext.Provider value={{ activeItem: PAGE.REGEX_TESTER }}>
      <Layout title="RegEx Tester & Validator">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-sky-100 rounded-xl">
                  <Regex className="w-6 h-6 text-sky-600" />
                </div>
                RegEx Tester
              </h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!!error || !pattern}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${copied
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                    : "bg-white text-slate-700 hover:text-sky-600 hover:bg-sky-50 border-slate-200 hover:border-sky-200 shadow-sm"
                  }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy Expression"}
              </button>
            </div>
          </div>

          {/* Preset templates section */}
          <div className="mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">
              Common RegEx Templates
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${activePreset === preset.name
                      ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/15 scale-95"
                      : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600 shadow-sm"
                    }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editor & Visualizer Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Regex Builder Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 to-indigo-500" />

                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Regular Expression
                </h2>

                <div className="space-y-4">
                  {/* Pattern input assembly */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all shadow-sm">
                    <span className="px-3 text-slate-400 font-mono text-xl select-none">/</span>
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => updatePattern(e.target.value)}
                      placeholder="([a-zA-Z0-9]+)"
                      className="flex-1 bg-transparent border-0 outline-none text-slate-800 placeholder:text-slate-400 font-mono text-base md:text-lg py-2.5"
                    />
                    <span className="px-2 text-slate-400 font-mono text-xl select-none">/</span>
                    <input
                      type="text"
                      value={flags}
                      onChange={(e) => updateFlags(e.target.value)}
                      placeholder="flags"
                      className="w-16 bg-white border border-slate-200 rounded-xl py-2 px-2 text-center text-slate-700 font-mono text-base placeholder:text-slate-300 outline-none focus:border-sky-500"
                      title="Flags: g (global), i (case insensitive), m (multiline), s (dotAll), u (unicode), y (sticky)"
                    />
                  </div>

                  {/* Error banner indicator */}
                  <AnimatePresence mode="wait">
                    {error ? (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 flex gap-3 text-sm font-medium shadow-sm"
                      >
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                        <div>
                          <span className="font-bold">Regex Parse Error:</span>
                          <span className="font-mono text-xs block mt-1 leading-relaxed bg-white/50 p-2 rounded-lg border border-rose-100">
                            {error}
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-emerald-600 text-xs font-semibold px-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Valid Expression Standard Compiled
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Subject Input & Highlights Visualizer Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
                    Test Subject Text
                  </label>
                  <textarea
                    value={subjectText}
                    onChange={(e) => updateSubjectText(e.target.value)}
                    placeholder="Enter text to test your regular expression against here..."
                    className="w-full h-48 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none resize-y transition-all shadow-sm text-base font-mono"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Highlighted Matches Visualizer
                    </label>
                    {matches.length > 0 && (
                      <span className="text-xs bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full font-semibold border border-sky-100">
                        {matches.length} Match{matches.length === 1 ? "" : "es"}
                      </span>
                    )}
                  </div>
                  <div className="w-full min-h-[12rem] max-h-[20rem] p-5 rounded-2xl border border-slate-200 bg-slate-50 overflow-y-auto font-mono text-slate-800 break-all whitespace-pre-wrap leading-relaxed shadow-inner">
                    {renderHighlightedMatches()}
                  </div>
                </div>
              </div>

              {/* Detailed Match Inspector Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">
                  Detailed Matches Breakdown
                </h2>

                {matches.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <span>Detailed Breakdown</span>
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        Parsed in {executionTime}ms
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2 custom-scrollbar">
                      {matches.map((match, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-colors relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Match #{idx + 1}
                            </span>
                            <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg">
                              Pos: {match.index}..{match.index + match[0].length}
                            </span>
                          </div>

                          <div className="font-mono text-sm bg-white p-3 rounded-xl border border-slate-100 overflow-x-auto text-slate-800 break-all max-w-full">
                            {match[0] || <span className="text-slate-400 italic">[zero-width match]</span>}
                          </div>

                          {match.length > 1 && (
                            <div className="mt-3 pt-3 border-t border-slate-200/50 space-y-2">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                Captured Groups
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {match.slice(1).map((groupValue, groupIndex) => (
                                  <div
                                    key={groupIndex}
                                    className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col gap-0.5 text-xs shadow-sm hover:border-sky-100 hover:bg-sky-50/20 transition-all"
                                  >
                                    <span className="text-sky-600 font-bold">Group #{groupIndex + 1}</span>
                                    <span className="font-mono text-slate-800 break-all truncate">
                                      {groupValue !== undefined ? (
                                        groupValue === "" ? (
                                          <span className="text-slate-400 italic font-normal">[empty]</span>
                                        ) : (
                                          groupValue
                                        )
                                      ) : (
                                        <span className="text-slate-400 italic font-normal">[undefined]</span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <Cpu className="w-6 h-6 text-slate-300" />
                    </div>
                    <span className="text-base font-bold text-slate-700">No Match Matches Found</span>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                      Matches will dynamically appear as you adjust your pattern, flags, or test data.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Cheatsheet & Guide */}
            <div className="space-y-6">
              {/* Interactive Cheatsheet */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />

                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Interactive Cheatsheet
                </h3>

                <div className="space-y-3">
                  {CHEATSHEET.map((section) => {
                    const isOpen = cheatsheetOpen[section.title] ?? false;
                    return (
                      <div
                        key={section.title}
                        className="border border-slate-150 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
                      >
                        <button
                          onClick={() => toggleCheatsheetSection(section.title)}
                          className="w-full flex items-center justify-between p-3.5 font-semibold text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
                        >
                          <span>{section.title}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden bg-white border-t border-slate-150"
                            >
                              <div className="p-3 space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                                {section.items.map((item) => (
                                  <div
                                    key={item.code}
                                    className="flex items-start justify-between gap-3 text-xs"
                                  >
                                    <code
                                      className="bg-indigo-50 text-indigo-700 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-100 shrink-0 cursor-pointer hover:bg-indigo-100"
                                      onClick={() => updatePattern(prev => prev + item.code)}
                                      title="Click to insert at the end of pattern"
                                    >
                                      {item.code}
                                    </code>
                                    <span className="text-slate-500 text-right">
                                      {item.desc}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Best Practices Guide Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Code className="w-24 h-24 rotate-12" />
                </div>
                <h4 className="text-lg font-bold mb-3 relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Regex Flags Tip
                </h4>
                <ul className="space-y-3.5 text-sm text-slate-300 relative z-10 leading-relaxed">
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-2" />
                    <strong>g (Global)</strong>: Find all matches rather than stopping at the first match.
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-2" />
                    <strong>i (Case Insensitive)</strong>: Ignore capitalization when checking patterns.
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-2" />
                    <strong>m (Multiline)</strong>: Make ^ and $ match start/end of every line.
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-2" />
                    <strong>s (dotAll)</strong>: Allows the dot (.) wildcard to match newline characters as well.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
