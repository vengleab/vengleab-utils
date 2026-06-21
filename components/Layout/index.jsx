import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Menu as MenuIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import MySideBar from "../MySideBar";
import { PAGE } from "../../constants/PageURL";

const ROOT_DOMAIN = 'svl-labs.uk';

export default function Layout({
  children,
  title,
  description = "A workbench of small, fast, browser-only developer and finance instruments. Nothing leaves your device.",
  keywords = "developer tools, formatter, beautifier, keyboard tester, screen color calibrator, base64 encoder, tax calculator, loan emi, regex tester, nginx config"
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    if (host.endsWith(`.${ROOT_DOMAIN}`) && host !== `www.${ROOT_DOMAIN}` && host !== `tools.${ROOT_DOMAIN}`) {
      setIsSubdomain(true);
    }
  }, []);

  const isLandingPage = router.pathname === PAGE.INDEX || isSubdomain;
  const displayTitle = title
    ? `${title} | devtools`
    : "devtools — a workbench of browser-only utilities";

  // Status-bar path: the current instrument, framed as a shell path.
  const benchPath = isLandingPage
    ? "~/devtools"
    : `~/devtools${router.pathname}`;

  return (
    <div className="flex h-screen overflow-hidden bg-surface font-sans text-ink w-full relative">
      <Head>
        <title>{displayTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={displayTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="devtools" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={displayTitle} />
        <meta name="twitter:description" content={description} />

        {/* Theme Color */}
        <meta name="theme-color" content="#2440d9" />
      </Head>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!isLandingPage && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {!isLandingPage && (
        <MySideBar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header */}
        {!isLandingPage && (
          <header className="lg:hidden h-14 bg-ink border-b border-ink-line flex items-center px-4 justify-between shrink-0 relative z-30">
            <div className="font-mono text-sm text-slate-200 flex items-center gap-1.5">
              <span className="text-signal-bright">❯</span>
              devtools
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-400 hover:bg-ink-line rounded-md transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </header>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar bench-grid">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </div>

        {/* Signature: persistent status bar */}
        <footer className="shrink-0 h-7 bg-signal text-white/95 flex items-center justify-between px-3 sm:px-4 font-mono text-[11px] tracking-tight select-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="opacity-70">❯</span>
            <span className="truncate">{benchPath}</span>
            <span className="caret-blink ml-0.5 inline-block w-[7px] h-[13px] bg-white/90 align-middle" />
          </div>
          <div className="hidden sm:flex items-center gap-4 shrink-0 text-white/75">
            <span>local · no uploads</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/90" />
              ready
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
