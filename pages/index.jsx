import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Link from "next/link";
import Layout from "../components/Layout";
import { MENU_ITEMS, MENU_GROUPS, PAGE } from "../constants/PageURL";
import { TOOLS } from "../constants/Tools";

const TOOLS_BY_ID = Object.fromEntries(TOOLS.map((tool) => [tool.id, tool]));

export default function LandingPage() {
  const groups = MENU_GROUPS.map((group) => ({
    ...group,
    tools: group.items.map((id) => TOOLS_BY_ID[id]).filter(Boolean)
  })).filter((group) => group.tools.length > 0);

  const toolCount = groups.reduce((sum, group) => sum + group.tools.length, 0);

  const scrollToTools = () =>
    document.getElementById("bench")?.scrollIntoView({ behavior: "smooth" });

  return (
    <Layout>
      <div className="pb-8">
        {/* Hero — the thesis */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="pt-4 pb-14 sm:pt-10 sm:pb-20 max-w-3xl"
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

          <div className="mt-9 flex flex-wrap gap-3 font-mono text-[13px]">
            <Link
              href={`/${PAGE.JSON_BEAUTIFIER}`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-signal text-white rounded-md hover:bg-signal-bright transition-colors"
            >
              <span className="opacity-80">❯</span> start with JSON
            </Link>
            <button
              type="button"
              onClick={scrollToTools}
              className="inline-flex items-center gap-2 px-5 py-3 border border-bench-line text-ink rounded-md hover:border-ink transition-colors"
            >
              browse all tools
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.header>

        {/* The bench — grid grouped to mirror the rail taxonomy */}
        <div id="bench" className="scroll-mt-6">
          {groups.map((group) => (
            <section key={group.id} className="mb-14 last:mb-0">
              <div className="flex items-baseline gap-3 mb-5">
                <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink shrink-0">
                  <span className="text-ink-soft">{"// "}</span>
                  {group.name}
                </h2>
                <span className="font-mono text-[11px] text-ink-soft">
                  {group.tools.length}
                </span>
                <div className="flex-1 h-px bg-bench-line" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.tools.map((tool) => {
                  const Icon = tool.icon;
                  const item = MENU_ITEMS[tool.id];
                  if (!item) return null;
                  return (
                    <Link
                      href={item.page}
                      key={tool.id}
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
                })}
              </div>
            </section>
          ))}
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
