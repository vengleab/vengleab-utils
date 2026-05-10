import React, { useContext, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Menu,
  X,
  Calculator,
  Type,
  Hash,
  Code,
  Key,
  CalendarDays,
  Home,
  ChevronRight,
  Lock
} from "lucide-react";
import { MENU_ITEMS } from "../../constants/PageURL";

const ICON_MAP = {
  str_len: Type,
  base_64_encode_decoder: Hash,
  json_beautifier: Code,
  jwt_token_viewer: Key,
  emi: Calculator,
  kh_tax: CalendarDays,
  kh_tax_gross: CalendarDays,
  password_generator: Lock
};

export default function MySideBar({
  sidebarOpen,
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed
}) {
  const router = useRouter();
  const activePath = router.pathname;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-[#1e1e1e] text-slate-300 border-r border-[#2d2d2d] flex flex-col transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "w-20" : "w-72"}`}
    >
      <div
        className={`flex items-center gap-3 px-4 h-16 bg-[#1a1a1a] border-b border-[#2d2d2d] shrink-0 transition-all ${
          isCollapsed ? "justify-center" : "px-6"
        }`}
      >
        <div className="bg-slate-700/50 p-2 rounded-lg text-slate-300 shrink-0">
          <Calculator className="w-5 h-5" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-white tracking-wide truncate">
            DevTools
          </span>
        )}

        <button
          onClick={() =>
            isCollapsed
              ? setIsCollapsed(false)
              : setSidebarOpen
              ? setSidebarOpen(false)
              : null
          }
          className="ml-auto p-2 lg:hidden text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex ml-auto p-2 text-slate-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar overflow-x-hidden">
        <Link
          href="/"
          onClick={() =>
            !isCollapsed && setSidebarOpen && setSidebarOpen(false)
          }
          title="Dashboard"
          className={`group relative w-full flex items-center px-4 py-3 transition-all text-sm font-medium border-l-[3px] ${
            activePath === "/"
              ? "bg-[#2d2d2d] text-slate-200 border-slate-400"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#252525] border-transparent"
          } ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Home className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="truncate whitespace-nowrap">Dashboard</span>
            )}
          </div>
          {!isCollapsed && activePath === "/" && (
            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-slate-400 absolute right-0" />
          )}
        </Link>

        {Object.entries(MENU_ITEMS).map(([key, item]) => {
          const Icon = ICON_MAP[key] || Code;
          const isActive =
            activePath === item.page || activePath === `/${item.page}`;

          return (
            <Link
              href={item.page}
              key={key}
              onClick={() =>
                !isCollapsed && setSidebarOpen && setSidebarOpen(false)
              }
              title={item.name}
              className={`group relative w-full flex items-center px-4 py-3 transition-all text-sm font-medium border-l-[3px] ${
                isActive
                  ? "bg-[#2d2d2d] text-slate-200 border-slate-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#252525] border-transparent"
              } ${isCollapsed ? "justify-center" : "justify-between"}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </div>
              {!isCollapsed && isActive && (
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-slate-400 absolute right-0" />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
