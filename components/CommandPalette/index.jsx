import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Home,
  Calculator,
  PiggyBank,
  Type,
  Hash,
  Code,
  Key,
  CalendarDays,
  Lock,
  Users,
  Regex,
  Keyboard,
  Monitor,
  QrCode,
  Sparkles,
  Table,
  Coins,
  Server,
} from 'lucide-react';
import { MENU_ITEMS, MENU_GROUPS, PAGE } from '../../constants/PageURL';

const ICON_MAP = {
  str_len: Type,
  base_64_encode_decoder: Hash,
  json_beautifier: Code,
  jwt_token_viewer: Key,
  emi: Calculator,
  savings_plan: PiggyBank,
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
};

const toHref = (page) => (page.startsWith('/') ? page : `/${page}`);

// Flat, ordered command list mirroring the sidebar taxonomy.
const ALL_COMMANDS = [
  {
    key: '__home', name: 'Bench (Home)', group: 'Navigate', page: PAGE.INDEX, icon: Home,
  },
  ...MENU_GROUPS.flatMap((group) => group.items
    .filter((key) => MENU_ITEMS[key])
    .map((key) => ({
      key,
      name: MENU_ITEMS[key].name,
      group: group.name,
      page: MENU_ITEMS[key].page,
      icon: ICON_MAP[key] || Code,
    }))),
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Reset state whenever the palette opens, and focus the field.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Defer focus until the input is mounted.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_COMMANDS;
    return ALL_COMMANDS.filter(
      (c) => c.name.toLowerCase().includes(q)
        || c.group.toLowerCase().includes(q),
    );
  }, [query]);

  // Keep the active index in range as results change.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(results.length - 1, 0)));
  }, [results.length]);

  const close = useCallback(() => setOpen(false), []);

  const go = useCallback(
    (command) => {
      if (!command) return;
      close();
      router.push(toHref(command.page));
    },
    [close, router],
  );

  const onInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[activeIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  // Scroll the active row into view as you navigate.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh] bg-ink/60 backdrop-blur-sm"
          onMouseDown={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl bg-ink border border-ink-line rounded-lg shadow-2xl overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Tool search"
          >
            {/* Search field */}
            <div className="flex items-center gap-3 px-4 h-14 border-b border-ink-line">
              <Search className="w-[18px] h-[18px] shrink-0 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search tools…"
                aria-label="Search tools"
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 font-mono text-[14px] focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] text-slate-500 border border-ink-line rounded px-1.5 py-0.5">
                esc
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-[52vh] overflow-y-auto custom-scrollbar py-2"
            >
              {results.length === 0 ? (
                <div className="px-4 py-10 text-center font-mono text-[13px] text-slate-500">
                  no tools match
                  <span className="text-slate-200"> {query}</span>
                </div>
              ) : (
                results.map((command, index) => {
                  const Icon = command.icon;
                  const isActive = index === activeIndex;
                  const prev = results[index - 1];
                  const showGroup = !prev || prev.group !== command.group;
                  return (
                    <React.Fragment key={command.key}>
                      {showGroup && (
                        <div className="px-4 pt-3 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          {command.group}
                        </div>
                      )}
                      <button
                        type="button"
                        data-index={index}
                        onMouseMove={() => setActiveIndex(index)}
                        onClick={() => go(command)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left font-mono text-[13px] transition-colors ${
                          isActive
                            ? 'bg-signal/25 text-white'
                            : 'text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon
                          className={`w-[18px] h-[18px] shrink-0 ${
                            isActive ? 'text-signal-bright' : 'text-slate-500'
                          }`}
                        />
                        <span className="truncate">{command.name}</span>
                        {isActive && (
                          <CornerDownLeft className="ml-auto w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 h-9 border-t border-ink-line font-mono text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" />
                open
              </span>
              <span className="ml-auto hidden sm:inline">
                {results.length} {results.length === 1 ? 'tool' : 'tools'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
