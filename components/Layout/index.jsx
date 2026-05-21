import React, { useState } from "react";
import Head from "next/head";
import { Menu as MenuIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MySideBar from "../MySideBar";

export default function Layout({
  children,
  title,
  description = "A clean, modern, blazing fast collection of daily utilities for developers and financial planning. Clean interfaces, zero friction.",
  keywords = "developer tools, formatter, beautifier, keyboard tester, screen color calibrator, base64 encoder, tax calculator, loan emi, regex tester"
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const displayTitle = title ? `${title} | DevTools` : "DevTools - Dynamic Developer & Finance Utilities";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900 w-full relative">
      <Head>
        <title>{displayTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={displayTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="DevTools Toolkit" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={displayTitle} />
        <meta name="twitter:description" content={description} />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#4f46e5" />
      </Head>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <MySideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center px-4 justify-between shrink-0 shadow-sm relative z-30">
          <div className="font-bold text-slate-200 flex items-center gap-2">
            DevTools
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:bg-[#2d2d2d] rounded-lg transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
