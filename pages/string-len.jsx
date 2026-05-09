import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
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
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
