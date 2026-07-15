import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Calculator,
  Type,
  Hash,
  Code,
  Key,
  CalendarDays,
  Home,
  ChevronDown,
  Lock,
  Users,
  Regex,
  Keyboard,
  Monitor,
  QrCode,
  Search,
  Sparkles,
  Table,
  Coins,
  Server,
  Clock,
  Terminal
} from "lucide-react";
import { MENU_ITEMS, MENU_GROUPS, PAGE } from "../../constants/PageURL";

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
  table_converter: Table,
  day_count: CalendarDays,
  gold_price: Coins,
  nginx_config: Server,
  cron_expression: Clock,
  code_highlighter: Terminal
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
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;
  const matchesQuery = (key) =>
    MENU_ITEMS[key] && MENU_ITEMS[key].name.toLowerCase().includes(query);

  const toggleGroup = (id) =>
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderItem = (key) => {
    const item = MENU_ITEMS[key];
    if (!item) return null;
    const Icon = ICON_MAP[key] || Code;
    const isActive =
      activePath === item.page || activePath === `/${item.page}`;

    return (
      <Link
        href={item.page}
        key={key}
        onClick={() => !isCollapsed && setSidebarOpen && setSidebarOpen(false)}
        title={item.name}
        className={`group relative w-full flex items-center gap-3 px-4 py-2 font-mono text-[13px] border-l-2 transition-colors ${
          isActive
            ? "bg-signal/25 text-white border-signal"
            : "text-slate-300 hover:text-white hover:bg-white/[0.06] border-transparent"
        } ${isCollapsed ? "justify-center" : ""}`}
      >
        <Icon
          className={`w-[18px] h-[18px] shrink-0 ${
            isActive ? "text-signal-bright" : "text-slate-400 group-hover:text-slate-200"
          }`}
        />
        {!isCollapsed && (
          <span className="truncate whitespace-nowrap">{item.name}</span>
        )}
      </Link>
    );
  };

  const homeMatches =
    !isSearching || "homepage".includes(query) || "home".includes(query);
  const totalMatches = MENU_GROUPS.reduce(
    (sum, group) => sum + group.items.filter(matchesQuery).length,
    0
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 bg-ink text-slate-300 border-r border-ink-line flex flex-col transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "w-16" : "w-72"}`}
    >
      {/* Wordmark / rail header */}
      <div
        className={`flex items-center h-14 border-b border-ink-line shrink-0 ${
          isCollapsed ? "justify-center px-0" : "px-4 gap-2"
        }`}
      >
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-9 h-9 grid place-items-center text-signal-bright hover:bg-white/[0.06] transition-colors font-mono text-lg"
            title="Expand"
            aria-label="Expand sidebar"
          >
            ❯
          </button>
        ) : (
          <>
            <span className="font-mono text-[15px] font-semibold text-white tracking-tight flex items-center gap-1.5 truncate">
              <span className="text-signal-bright">❯</span>
              devtools
              <span className="caret-blink w-[7px] h-[15px] bg-slate-300 inline-block" />
            </span>

            <button
              onClick={() => setSidebarOpen && setSidebarOpen(false)}
              className="ml-auto p-2 lg:hidden text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden lg:flex ml-auto p-2 text-slate-500 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-[18px] h-[18px]" />
            </button>
          </>
        )}
      </div>

      {/* Filter */}
      {!isCollapsed && (
        <div className="px-3 py-3 border-b border-ink-line shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-600">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="filter tools"
              aria-label="Filter tools"
              className="w-full pl-9 pr-3 py-2 bg-ink-rail text-slate-200 placeholder-slate-600 font-mono text-[13px] rounded-md border border-ink-line focus:outline-none focus:border-signal transition-colors"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar overflow-x-hidden">
        {homeMatches && (
          <Link
            href={PAGE.INDEX}
            onClick={() =>
              !isCollapsed && setSidebarOpen && setSidebarOpen(false)
            }
            title="Home"
            className={`group relative w-full flex items-center gap-3 px-4 py-2 font-mono text-[13px] border-l-2 transition-colors ${
              activePath === PAGE.INDEX
                ? "bg-signal/25 text-white border-signal"
                : "text-slate-300 hover:text-white hover:bg-white/[0.06] border-transparent"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <Home
              className={`w-[18px] h-[18px] shrink-0 ${
                activePath === PAGE.INDEX ? "text-signal-bright" : "text-slate-400 group-hover:text-slate-200"
              }`}
            />
            {!isCollapsed && <span className="truncate">bench</span>}
          </Link>
        )}

        {/* Collapsed (icon-only) rail: flat list, no group headers */}
        {isCollapsed &&
          MENU_GROUPS.flatMap((group) => group.items).map((key) =>
            renderItem(key)
          )}

        {/* Searching: flat list of matching items */}
        {!isCollapsed &&
          isSearching &&
          MENU_GROUPS.flatMap((group) =>
            group.items.filter(matchesQuery)
          ).map((key) => renderItem(key))}

        {/* Default: collapsible grouped sections, framed like a file tree */}
        {!isCollapsed &&
          !isSearching &&
          MENU_GROUPS.map((group) => {
            const isOpen = !collapsedGroups[group.id];
            return (
              <div key={group.id} className="mt-2 first:mt-0">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="group w-full flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronDown
                    className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                      isOpen ? "" : "-rotate-90"
                    }`}
                  />
                  <span className="truncate text-left">{group.name}</span>
                </button>
                {isOpen && (
                  <div>{group.items.map((key) => renderItem(key))}</div>
                )}
              </div>
            );
          })}

        {!isCollapsed && isSearching && totalMatches === 0 && !homeMatches && (
          <div className="px-4 py-8 text-center font-mono text-[13px] text-slate-500">
            no tools match
            <span className="text-slate-200"> {searchQuery}</span>
          </div>
        )}
      </div>

      {/* Expand control on collapsed rail bottom (desktop) */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden lg:grid place-items-center h-10 shrink-0 border-t border-ink-line text-slate-600 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="w-[18px] h-[18px]" />
        </button>
      )}
    </aside>
  );
}
