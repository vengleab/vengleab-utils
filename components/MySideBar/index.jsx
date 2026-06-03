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
  Lock,
  Users,
  Regex,
  Keyboard,
  Monitor,
  QrCode,
  Search,
  Sparkles,
  Table
} from "lucide-react";
import { MENU_ITEMS, PAGE } from "../../constants/PageURL";

const ICON_MAP = {
  str_len: Type,
  base_64_encode_decoder: Hash,
  json_beautifier: Code,
  jwt_token_viewer: Key,
  emi: Calculator,
  kh_tax: CalendarDays,
  kh_tax_gross: CalendarDays,
  password_generator: Lock,
  random_group_generator: Users,
  regex_tester: Regex,
  keyboard_tester: Keyboard,
  display_color_tester: Monitor,
  qr_code_generator: QrCode,
  lucky_draw: Sparkles,
  table_converter: Table
};

export default function MySideBar({
  sidebarOpen,
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed
}) {
  const router = useRouter();
  const activePath = router.pathname;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenuItems = Object.entries(MENU_ITEMS).filter(([key, item]) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#2d2d2d] rounded-lg transition-colors flex items-center justify-center"
            title="Expand Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        ) : (
          <>
            <div className="bg-slate-700/50 p-2 rounded-lg text-slate-300 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="font-bold text-white tracking-wide truncate">
              DevTools
            </span>

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
          </>
        )}
      </div>

      {/* Search Input */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-[#2d2d2d] bg-[#1a1a1a]/30 shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search utilities..."
              className="w-full pl-9 pr-4 py-2 bg-[#252525] text-slate-200 placeholder-slate-500 text-sm rounded-xl border border-[#2d2d2d] focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all duration-200"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar overflow-x-hidden">
        {(!searchQuery || "homepage".includes(searchQuery.toLowerCase()) || "home".includes(searchQuery.toLowerCase())) && (
          <Link
            href={PAGE.INDEX}
            onClick={() =>
              !isCollapsed && setSidebarOpen && setSidebarOpen(false)
            }
            title="Homepage"
            className={`group relative w-full flex items-center px-4 py-3 transition-all text-sm font-medium border-l-[3px] ${
              activePath === PAGE.INDEX
                ? "bg-[#2d2d2d] text-slate-200 border-slate-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#252525] border-transparent"
            } ${isCollapsed ? "justify-center" : "justify-between"}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Home className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">Homepage</span>
              )}
            </div>
            {!isCollapsed && activePath === PAGE.INDEX && (
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-slate-400 absolute right-0" />
            )}
          </Link>
        )}

        {filteredMenuItems.map(([key, item]) => {
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

        {filteredMenuItems.length === 0 && searchQuery && !("homepage".includes(searchQuery.toLowerCase()) || "home".includes(searchQuery.toLowerCase())) && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No utilities found matching "{searchQuery}"
          </div>
        )}
      </div>
    </aside>
  );
}
