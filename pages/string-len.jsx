import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Type, AlignLeft, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";
import StringLengthStorage from "../utils/storage/StringLength";

export default function StringLength() {
  const [text, setText] = useState("");

  useEffect(() => {
    const saved = StringLengthStorage.get("text");
    if (saved) setText(saved);
  }, []);

  const handleOnChange = e => {
    const { value } = e.target;
    setText(value);
    StringLengthStorage.set("text", value);
  };

  const { wordCount, sentenceCount, tokenCount } = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [])
      .map(s => s.trim())
      .filter(Boolean).length;
    // Rough heuristic approximating common LLM tokenizers (~4 chars/token).
    const tokens = text.trim() ? Math.ceil(text.length / 4) : 0;
    return { wordCount: words, sentenceCount: sentences, tokenCount: tokens };
  }, [text]);

  return (
    <PageContext.Provider value={{ activeItem: PAGE.STRING_LEN }}>
      <Layout title="String Length">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              String Length
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Calculate the length of your text string in real-time.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 lg:p-7 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />

            <label className="text-sm font-semibold text-slate-800 mb-3 block">
              Please input text you want to count
            </label>
            <textarea
              value={text}
              onChange={handleOnChange}
              onInput={handleOnChange}
              placeholder="Please enter text you want to count length"
              className="w-full h-64 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-y transition-all shadow-sm text-base"
            />

            <div className="mt-8 pt-8 border-t border-slate-300/50 flex flex-col items-center justify-center">
              <span className="text-6xl sm:text-8xl font-bold tracking-tighter text-slate-900">
                {text.length}
              </span>
              <div className="mt-3 flex items-center gap-2 text-slate-600 font-medium uppercase tracking-widest text-xs">
                <Activity className="w-4 h-4" />
                Text Length
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-300/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Words",
                  value: wordCount,
                  icon: Type,
                  color: "text-violet-600",
                },
                {
                  label: "Sentences",
                  value: sentenceCount,
                  icon: AlignLeft,
                  color: "text-emerald-600",
                },
                {
                  label: "LLM Tokens (est.)",
                  value: tokenCount,
                  icon: Sparkles,
                  color: "text-amber-600",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col items-center justify-center"
                >
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                    {value.toLocaleString()}
                  </span>
                  <div className="mt-2 flex items-center gap-1.5 text-slate-600 font-medium uppercase tracking-widest text-[10px] sm:text-xs">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
