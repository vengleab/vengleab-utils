import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { MENU_ITEMS, MENU_GROUPS } from '../constants/PageURL';
import { TOOLS } from '../constants/Tools';

const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((tool) => [tool.id, tool]));

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

function ToolCard({ tool }) {
  const Icon = tool.icon;
  const item = MENU_ITEMS[tool.id];
  if (!item) return null;
  return (
    <Link
      href={item.page}
      className="group block bg-surface-raised border border-bench-line rounded-md p-5 hover:border-signal hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-md grid place-items-center ${tool.bg} ${tool.color}`}
        >
          <Icon className="w-[22px] h-[22px]" />
        </div>
        <span className="font-mono text-[11px] text-ink-soft opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
          open ❯
        </span>
      </div>
      <h3 className="mt-4 font-display text-[17px] font-semibold tracking-tight text-ink">
        {tool.name}
      </h3>
      <p className="mt-1.5 text-[13px] text-ink-soft leading-relaxed">
        {tool.description}
      </p>
    </Link>
  );
}

export default function LandingPage() {
  const [query, setQuery] = useState('');

  const groups = useMemo(
    () => MENU_GROUPS.map((group) => ({
      ...group,
      tools: group.items.map((id) => TOOLS_BY_ID[id]).filter(Boolean),
    })).filter((group) => group.tools.length > 0),
    [],
  );

  const toolCount = groups.reduce((sum, group) => sum + group.tools.length, 0);

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const matches = useMemo(() => {
    if (!isSearching) return [];
    const seen = new Set();
    const out = [];
    groups.forEach((group) => {
      group.tools.forEach((tool) => {
        if (seen.has(tool.id)) return;
        if (
          tool.name.toLowerCase().includes(q)
          || tool.description.toLowerCase().includes(q)
        ) {
          seen.add(tool.id);
          out.push(tool);
        }
      });
    });
    return out;
  }, [groups, isSearching, q]);

  return (
    <Layout>
      <div className="pb-8">
        {/* Hero — the thesis */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="pt-4 pb-12 sm:pt-10 sm:pb-16 max-w-3xl"
        >
          <div className="font-mono text-[12px] tracking-wide text-signal mb-7 flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 bg-signal" />
            {toolCount} tools · browser-only · no sign-in
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-semibold tracking-tight text-ink leading-[1.02]">
            Small tools,
            <br />
            kept sharp.
          </h1>

          <p className="mt-6 text-lg text-ink-soft max-w-xl leading-relaxed">
            Formatters, encoders, generators and calculators for the small jobs
            between the work — each one running entirely in your browser. No
            uploads, no accounts, no waiting on a server.
          </p>

          {/* Google-style search bar */}
          <div className="mt-9 max-w-xl">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-ink-soft group-focus-within:text-signal transition-colors">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools — JSON, base64, QR, tax…"
                aria-label="Search tools"
                autoComplete="off"
                className="w-full h-14 pl-14 pr-20 bg-surface-raised border border-bench-line rounded-full text-ink placeholder-ink-soft text-[15px] shadow-sm focus:outline-none focus:border-signal focus:shadow-md transition-all"
              />
              <kbd className="absolute inset-y-0 right-4 my-auto h-7 hidden sm:inline-flex items-center font-mono text-[11px] text-ink-soft border border-bench-line rounded px-2">
                {isMac ? '⌘' : 'Ctrl'} K
              </kbd>
            </div>
            <p className="mt-2.5 pl-1 font-mono text-[12px] text-ink-soft">
              press{' '}
              <span className="text-ink">{isMac ? '⌘' : 'Ctrl'} K</span> anywhere
              to search
            </p>
          </div>
        </motion.header>

        {/* The bench */}
        <div id="bench" className="scroll-mt-6">
          {isSearching ? (
            // Flat results view while searching
            <section>
              <div className="flex items-baseline gap-3 mb-5">
                <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink shrink-0">
                  <span className="text-ink-soft">{'// '}</span>
                  results
                </h2>
                <span className="font-mono text-[11px] text-ink-soft">
                  {matches.length}
                </span>
                <div className="flex-1 h-px bg-bench-line" />
              </div>

              {matches.length === 0 ? (
                <div className="py-16 text-center font-mono text-[14px] text-ink-soft">
                  no tools match
                  <span className="text-ink"> {query}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            // Default: grouped grid mirroring the rail taxonomy
            groups.map((group) => (
              <section key={group.id} className="mb-14 last:mb-0">
                <div className="flex items-baseline gap-3 mb-5">
                  <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink shrink-0">
                    <span className="text-ink-soft">{'// '}</span>
                    {group.name}
                  </h2>
                  <span className="font-mono text-[11px] text-ink-soft">
                    {group.tools.length}
                  </span>
                  <div className="flex-1 h-px bg-bench-line" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Principles — recast as a disciplined mono strip */}
        <div className="mt-16 border-t border-bench-line pt-6 grid gap-3 sm:grid-cols-3 font-mono text-[12px] text-ink-soft">
          <p>
            <span className="text-ink">local-first</span> — your data never
            leaves the tab
          </p>
          <p>
            <span className="text-ink">instant</span> — no network roundtrips,
            no spinners
          </p>
          <p>
            <span className="text-ink">honest</span> — open source on next.js +
            tailwind
          </p>
        </div>
      </div>
    </Layout>
  );
}
