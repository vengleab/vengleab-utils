import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, 
  RefreshCw, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Lock,
  ChevronRight
} from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";

const CHARSET = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState({ label: "Strong", color: "text-emerald-500", score: 3 });

  const generatePassword = useCallback(() => {
    let charset = "";
    if (options.uppercase) charset += CHARSET.uppercase;
    if (options.lowercase) charset += CHARSET.lowercase;
    if (options.numbers) charset += CHARSET.numbers;
    if (options.symbols) charset += CHARSET.symbols;

    if (charset === "") {
      setPassword("");
      return;
    }

    let generatedPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }
    setPassword(generatedPassword);
    setCopied(false);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    // Calculate strength
    let score = 0;
    if (length > 8) score++;
    if (length > 12) score++;
    if (options.uppercase && options.lowercase) score++;
    if (options.numbers) score++;
    if (options.symbols) score++;

    if (score <= 2) {
      setStrength({ label: "Weak", color: "text-rose-500", score: 1 });
    } else if (score <= 4) {
      setStrength({ label: "Medium", color: "text-amber-500", score: 2 });
    } else {
      setStrength({ label: "Strong", color: "text-emerald-500", score: 3 });
    }
  }, [length, options]);

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (option) => {
    setOptions(prev => {
      const newOptions = { ...prev, [option]: !prev[option] };
      // Ensure at least one option is selected
      if (Object.values(newOptions).every(val => !val)) {
        return prev;
      }
      return newOptions;
    });
  };

  return (
    <PageContext.Provider value={{ activeItem: PAGE.PASSWORD_GENERATOR }}>
      <Layout title="Password Generator">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              Password Generator
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Create secure, random passwords to keep your online accounts safe. 
              All generation happens locally in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Generator Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
                
                <div className="space-y-8">
                  {/* Password Display */}
                  <div className="relative group">
                    <div className="bg-slate-50 rounded-2xl border-2 border-slate-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 group-hover:border-purple-200 transition-colors overflow-hidden">
                      <div className="flex-1 min-w-0 w-full">
                        <div className="text-xl sm:text-2xl md:text-3xl font-mono font-medium text-slate-800 break-all select-all leading-relaxed">
                          {password || <span className="text-slate-300">Select an option...</span>}
                        </div>
                      </div>
                      
                      <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-center">
                        <button 
                          onClick={generatePassword}
                          className="p-3 bg-white hover:bg-purple-50 rounded-xl text-slate-400 hover:text-purple-600 transition-all shadow-sm border border-slate-200 hover:border-purple-200 group/btn"
                          title="Regenerate"
                        >
                          <RefreshCw className={`w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-700`} />
                        </button>
                        <button 
                          onClick={copyToClipboard}
                          disabled={!password}
                          className={`p-3 rounded-xl transition-all border ${
                            copied 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-inner" 
                              : "bg-white text-slate-400 hover:text-purple-600 hover:bg-purple-50 shadow-sm border-slate-200 hover:border-purple-200"
                          }`}
                          title="Copy to clipboard"
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {copied && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-600 uppercase tracking-wider"
                        >
                          Copied to clipboard!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Length Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Password Length
                      </label>
                      <span className="text-2xl font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                        {length}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="64"
                      value={length}
                      onChange={(e) => setLength(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>4 chars</span>
                      <span>64 chars</span>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.keys(options).map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleOption(option)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          options[option]
                            ? "bg-white border-purple-200 shadow-sm ring-1 ring-purple-100"
                            : "bg-slate-50 border-slate-100 text-slate-400 grayscale"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${options[option] ? "bg-purple-100 text-purple-600" : "bg-slate-200 text-slate-500"}`}>
                            {option === 'uppercase' && <span className="font-bold">ABC</span>}
                            {option === 'lowercase' && <span className="font-bold">abc</span>}
                            {option === 'numbers' && <span className="font-bold">123</span>}
                            {option === 'symbols' && <span className="font-bold">#$&</span>}
                          </div>
                          <span className={`text-sm font-semibold capitalize ${options[option] ? "text-slate-900" : "text-slate-400"}`}>
                            Include {option}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          options[option] ? "border-purple-600 bg-purple-600" : "border-slate-300 bg-transparent"
                        }`}>
                          {options[option] && <Check className="w-3 h-3 text-white stroke-[4]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Stats / Strength Section */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">
                  Security Strength
                </h3>
                
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-5 rounded-full bg-slate-50 relative ${strength.color}`}>
                    {strength.score === 1 && <ShieldAlert className="w-12 h-12" />}
                    {strength.score === 2 && <Shield className="w-12 h-12" />}
                    {strength.score === 3 && <ShieldCheck className="w-12 h-12" />}
                    
                    <motion.div 
                      className="absolute inset-0 rounded-full border-4 border-current opacity-20"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  
                  <div>
                    <div className={`text-2xl font-bold ${strength.color}`}>
                      {strength.label}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Based on complexity and length
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-500 ${strength.score >= 1 ? "bg-rose-500" : ""}`}
                      style={{ width: "33.33%" }}
                    />
                    <div 
                      className={`h-full transition-all duration-500 ${strength.score >= 2 ? "bg-amber-500" : ""}`}
                      style={{ width: "33.33%" }}
                    />
                    <div 
                      className={`h-full transition-all duration-500 ${strength.score >= 3 ? "bg-emerald-500" : ""}`}
                      style={{ width: "33.33%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Lock className="w-24 h-24 rotate-12" />
                </div>
                <h4 className="text-lg font-bold mb-3 relative z-10">Best Practices</h4>
                <ul className="space-y-3 text-sm text-slate-300 relative z-10">
                  <li className="flex gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
                    Use at least 16 characters for critical accounts.
                  </li>
                  <li className="flex gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
                    Mix uppercase, numbers, and symbols.
                  </li>
                  <li className="flex gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
                    Use a password manager to store them safely.
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
