import React from "react";
import { motion } from "framer-motion";
import {
  Type,
  Hash,
  Code,
  Calculator,
  CalendarDays,
  ArrowRight,
  Zap,
  Shield,
  Cpu,
  ChevronRight,
  Sparkles,
  Key,
  Users
} from "lucide-react";
import Link from "next/link";
import Layout from "../components/Layout";
import { MENU_ITEMS } from "../constants/PageURL";

const TOOLS = [
  {
    id: "json_beautifier",
    name: "JSON Beautifier",
    description: "Format, validate and beautify your JSON data instantly.",
    icon: Code,
    color: "text-amber-600",
    bg: "bg-amber-100/50",
    border: "hover:border-amber-500/30 group-hover:shadow-amber-500/10"
  },
  {
    id: "base_64_encode_decoder",
    name: "Base64 Encoder",
    description:
      "Encode and decode Base64 strings with a developer-friendly interface.",
    icon: Hash,
    color: "text-indigo-600",
    bg: "bg-indigo-100/50",
    border: "hover:border-indigo-500/30 group-hover:shadow-indigo-500/10"
  },
  {
    id: "str_len",
    name: "String Length",
    description: "Real-time string character counting utility.",
    icon: Type,
    color: "text-blue-600",
    bg: "bg-blue-100/50",
    border: "hover:border-blue-500/30 group-hover:shadow-blue-500/10"
  },
  {
    id: "emi",
    name: "EMI Calculator",
    description: "Calculate Equated Monthly Installments for various loans.",
    icon: Calculator,
    color: "text-teal-600",
    bg: "bg-teal-100/50",
    border: "hover:border-teal-500/30 group-hover:shadow-teal-500/10"
  },
  {
    id: "kh_tax",
    name: "Salary Tax Calc",
    description:
      "Reverse calculate gross salary from expected net income in Cambodia.",
    icon: CalendarDays,
    color: "text-emerald-600",
    bg: "bg-emerald-100/50",
    border: "hover:border-emerald-500/30 group-hover:shadow-emerald-500/10"
  },
  {
    id: "password_generator",
    name: "Password Gen",
    description: "Generate secure, random passwords with custom requirements.",
    icon: Key,
    color: "text-purple-600",
    bg: "bg-purple-100/50",
    border: "hover:border-purple-500/30 group-hover:shadow-purple-500/10"
  },
  {
    id: "random_group_generator",
    name: "Random & Grouping",
    description: "Split lists into random groups or pick winners easily.",
    icon: Users,
    color: "text-rose-600",
    bg: "bg-rose-100/50",
    border: "hover:border-rose-500/30 group-hover:shadow-rose-500/10"
  }
];

export default function LandingPage() {
  return (
    <Layout>
      <div className="pb-12 xl:pb-24">
        {/* Hero Section */}
        <div className="relative py-16 sm:py-24 xl:py-32 overflow-hidden rounded-3xl mb-12">
          {/* Background Decorative Element */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-slate-300/50 text-slate-700 text-xs font-semibold tracking-wide uppercase mb-8 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              All-in-one Toolkit
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl font-bold tracking-tighter text-slate-900 mb-6 leading-tight"
            >
              Developer tools, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                simplified.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed"
            >
              A modern, blazing fast collection of daily utilities for
              developers and financial planning. Clean interfaces, instant
              processing, zero friction.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/json-beautifier"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-medium hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group"
              >
                Start Formatting{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => {
                  document
                    .getElementById("tools-grid")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur text-slate-700 border border-slate-300/50 rounded-2xl font-medium hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Explore Tools
              </button>
            </motion.div>
          </div>
        </div>

        {/* Tools Grid Section */}
        <div id="tools-grid" className="scroll-mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Available Utilities
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool, idx) => {
              const Icon = tool.icon;
              const item = MENU_ITEMS[tool.id];
              if (!item) return null;
              return (
                <Link href={item.page} key={tool.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * idx }}
                    className={`group text-left p-6 bg-white rounded-3xl shadow-sm border border-slate-200 transition-all relative overflow-hidden flex flex-col ${tool.border} hover:-translate-y-1 hover:shadow-xl cursor-pointer`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tool.bg} ${tool.color} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2 group-hover:text-slate-900 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                      {tool.description}
                    </p>

                    <div className="flex items-center text-sm font-semibold text-slate-400 group-hover:text-slate-900 transition-colors mt-auto">
                      Open Utility{" "}
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Features / Architectural Info */}
        <div className="mt-24 sm:mt-32 pt-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mb-6 text-slate-700">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3 tracking-tight">
                Blazing Fast
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                No server roundtrips. Everything processes instantly right
                inside your browser session.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mb-6 text-slate-700">
                <Shield className="w-6 h-6 text-indigo-500" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3 tracking-tight">
                Privacy First
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Your data never leaves the device. Safely paste confidential
                JSON or access local utilities securely.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mb-6 text-slate-700">
                <Cpu className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3 tracking-tight">
                Modern Tech Stack
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Built upon Next.js, Tailwind CSS, and Framer Motion for a fluid,
                application-like experience.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="mt-24 pt-8 text-center border-t border-slate-200/50">
          <p className="text-xs text-slate-400 font-medium">
            Crafted with attention to detail.
          </p>
        </div>
      </div>
    </Layout>
  );
}
