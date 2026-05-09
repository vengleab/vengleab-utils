import React, { useState } from 'react';
import { Menu as MenuIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MySideBar from '../MySideBar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-900 w-full relative">
      
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
