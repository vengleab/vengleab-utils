import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Copy,
  Check,
  Download,
  RotateCcw,
  Globe,
  FolderTree,
  Network,
  Code2,
  Plus,
  Trash2,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import Layout from "../components/Layout";
import PageContext from "../contexts/page";
import { PAGE } from "../constants/PageURL";

let locationSeq = 0;
const makeLocation = (overrides = {}) => {
  locationSeq += 1;
  return {
    id: `loc_${locationSeq}`,
    path: "/",
    handler: "static", // "static" | "proxy" | "custom"
    proxyTarget: "",
    websocket: false,
    spa: false,
    custom: "",
    ...overrides,
  };
};

const DEFAULT_STATE = {
  configName: "",
  serverName: "",
  includeWww: false,
  ipv6: false,
  port: 80,
  // static files (server level, used by any static location)
  root: "",
  indexFile: "",
  // routes
  locations: [],
  // tls
  ssl: false,
  forceHttps: true,
  http2: true,
  certPath: "",
  certKeyPath: "",
  // extras
  gzip: false,
  securityHeaders: false,
  staticCache: false,
  maxBodySize: "",
  logging: false,
  customDirectives: "",
};

function slugify(value, fallback) {
  const slug = (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function buildServerNames(state) {
  const base = (state.serverName || "").trim();
  if (!base) return "";
  if (state.includeWww && !base.startsWith("www.")) {
    return `${base} www.${base}`;
  }
  return base;
}

function locationBody(loc, state, indent) {
  const body = [];
  const pad = `${indent}${indent}`;
  if (loc.handler === "static") {
    if (loc.spa) {
      body.push(`${pad}try_files $uri $uri/ /${state.indexFile || "index.html"};`);
    } else {
      body.push(`${pad}try_files $uri $uri/ =404;`);
    }
  } else if (loc.handler === "proxy") {
    body.push(`${pad}proxy_pass ${loc.proxyTarget || "http://127.0.0.1:3000"};`);
    body.push(`${pad}proxy_http_version 1.1;`);
    body.push(`${pad}proxy_set_header Host $host;`);
    body.push(`${pad}proxy_set_header X-Real-IP $remote_addr;`);
    body.push(`${pad}proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`);
    body.push(`${pad}proxy_set_header X-Forwarded-Proto $scheme;`);
    if (loc.websocket) {
      body.push(`${pad}proxy_set_header Upgrade $http_upgrade;`);
      body.push(`${pad}proxy_set_header Connection "upgrade";`);
    }
  } else {
    (loc.custom || "")
      .split("\n")
      .forEach((line) => body.push(line.trim() ? `${pad}${line.trim()}` : ""));
  }
  return body;
}

function generateConfig(state) {
  const names = buildServerNames(state);
  const logName = slugify(state.configName || state.serverName, "site");
  const indent = "    ";
  const blocks = [];

  // HTTP -> HTTPS redirect block
  if (state.ssl && state.forceHttps) {
    const redirect = ["server {", `${indent}listen 80;`];
    if (state.ipv6) redirect.push(`${indent}listen [::]:80;`);
    if (names) redirect.push(`${indent}server_name ${names};`);
    redirect.push("", `${indent}return 301 https://$host$request_uri;`, "}");
    blocks.push(redirect.join("\n"));
  }

  const main = [];
  main.push("server {");

  if (state.ssl) {
    main.push(`${indent}listen 443 ssl;`);
    if (state.ipv6) main.push(`${indent}listen [::]:443 ssl;`);
    if (state.http2) main.push(`${indent}http2 on;`);
  } else {
    main.push(`${indent}listen ${state.port || 80};`);
    if (state.ipv6) main.push(`${indent}listen [::]:${state.port || 80};`);
  }

  if (names) main.push(`${indent}server_name ${names};`);
  main.push("");

  if (state.ssl) {
    main.push(
      `${indent}ssl_certificate ${
        state.certPath || "/etc/letsencrypt/live/example.com/fullchain.pem"
      };`
    );
    main.push(
      `${indent}ssl_certificate_key ${
        state.certKeyPath || "/etc/letsencrypt/live/example.com/privkey.pem"
      };`
    );
    main.push(`${indent}ssl_protocols TLSv1.2 TLSv1.3;`);
    main.push(`${indent}ssl_ciphers HIGH:!aNULL:!MD5;`);
    main.push(`${indent}ssl_prefer_server_ciphers on;`);
    main.push("");
  }

  if (state.maxBodySize && state.maxBodySize.trim()) {
    main.push(`${indent}client_max_body_size ${state.maxBodySize.trim()};`);
  }

  if (state.logging) {
    main.push(`${indent}access_log /var/log/nginx/${logName}.access.log;`);
    main.push(`${indent}error_log /var/log/nginx/${logName}.error.log;`);
  }

  if (state.gzip) {
    main.push(`${indent}gzip on;`);
    main.push(`${indent}gzip_vary on;`);
    main.push(
      `${indent}gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;`
    );
  }

  if (state.securityHeaders) {
    main.push(`${indent}add_header X-Frame-Options "SAMEORIGIN" always;`);
    main.push(`${indent}add_header X-Content-Type-Options "nosniff" always;`);
    main.push(`${indent}add_header Referrer-Policy "strict-origin-when-cross-origin" always;`);
    if (state.ssl) {
      main.push(
        `${indent}add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`
      );
    }
  }

  const root = (state.root || "").trim();
  if (root) main.push(`${indent}root ${root};`);
  if ((state.indexFile || "").trim()) {
    main.push(`${indent}index ${state.indexFile.trim()};`);
  }

  state.locations.forEach((loc) => {
    main.push("");
    main.push(`${indent}location ${loc.path || "/"} {`);
    locationBody(loc, state, indent).forEach((line) => main.push(line));
    main.push(`${indent}}`);
  });

  if (root && state.staticCache) {
    main.push("");
    main.push(`${indent}location ~* \\.(?:css|js|jpg|jpeg|png|gif|ico|svg|woff2?|ttf|eot)$ {`);
    main.push(`${indent}${indent}expires 30d;`);
    main.push(`${indent}${indent}add_header Cache-Control "public, immutable";`);
    main.push(`${indent}${indent}access_log off;`);
    main.push(`${indent}}`);
  }

  const custom = (state.customDirectives || "").trim();
  if (custom) {
    main.push("");
    custom.split("\n").forEach((line) => {
      main.push(line.trim() ? `${indent}${line.trim()}` : "");
    });
  }

  main.push("}");

  blocks.push(main.join("\n"));
  return blocks.join("\n\n");
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 transition-colors text-left"
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        {hint && <div className="text-xs text-slate-400 mt-0.5">{hint}</div>}
      </div>
      <div
        className={`w-10 h-6 rounded-full p-0.5 shrink-0 transition-colors ${
          checked ? "bg-emerald-500" : "bg-slate-200"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-mono";

const HANDLERS = [
  { id: "static", label: "Static", icon: FolderTree },
  { id: "proxy", label: "Proxy", icon: Network },
  { id: "custom", label: "Custom", icon: Code2 },
];

function LocationCard({ loc, index, onChange, onRemove }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
          #{index + 1}
        </span>
        <input
          className={`${inputClass} bg-white`}
          value={loc.path}
          onChange={(e) => onChange(loc.id, { path: e.target.value })}
          placeholder="/  or  /api/  or  ~* \.php$"
        />
        <button
          type="button"
          onClick={() => onRemove(loc.id)}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Remove location"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {HANDLERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(loc.id, { handler: id })}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
              loc.handler === id
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {loc.handler === "static" && (
        <Toggle
          label="SPA fallback"
          hint="Route unknown paths to the index file"
          checked={loc.spa}
          onChange={(v) => onChange(loc.id, { spa: v })}
        />
      )}

      {loc.handler === "proxy" && (
        <div className="space-y-3">
          <input
            className={`${inputClass} bg-white`}
            value={loc.proxyTarget}
            onChange={(e) => onChange(loc.id, { proxyTarget: e.target.value })}
            placeholder="http://127.0.0.1:3000"
          />
          <Toggle
            label="WebSocket support"
            hint="Adds Upgrade / Connection headers"
            checked={loc.websocket}
            onChange={(v) => onChange(loc.id, { websocket: v })}
          />
        </div>
      )}

      {loc.handler === "custom" && (
        <textarea
          className={`${inputClass} bg-white min-h-[90px] resize-y leading-relaxed`}
          value={loc.custom}
          onChange={(e) => onChange(loc.id, { custom: e.target.value })}
          placeholder={"return 200 'ok';\nadd_header Content-Type text/plain;"}
          spellCheck={false}
        />
      )}
    </div>
  );
}

export default function NginxConfigGenerator() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);

  const set = useCallback((key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateLocation = useCallback((id, patch) => {
    setState((prev) => ({
      ...prev,
      locations: prev.locations.map((loc) =>
        loc.id === id ? { ...loc, ...patch } : loc
      ),
    }));
  }, []);

  const addLocation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      locations: [...prev.locations, makeLocation({ path: "" })],
    }));
  }, []);

  const removeLocation = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc.id !== id),
    }));
  }, []);

  const clearAll = useCallback(() => {
    setState({ ...DEFAULT_STATE, locations: [] });
  }, []);

  const config = useMemo(() => generateConfig(state), [state]);
  const fileName = useMemo(
    () => slugify(state.configName || state.serverName, "site"),
    [state.configName, state.serverName]
  );
  const copyConfig = () => {
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deployCommand = useMemo(
    () =>
      [
        `sudo nano /etc/nginx/sites-available/${fileName}.conf`,
        `sudo ln -s /etc/nginx/sites-available/${fileName}.conf /etc/nginx/sites-enabled/`,
        "sudo nginx -t && sudo systemctl reload nginx",
      ].join("\n"),
    [fileName]
  );

  const copyCommand = () => {
    navigator.clipboard.writeText(deployCommand);
    setCmdCopied(true);
    setTimeout(() => setCmdCopied(false), 2000);
  };

  const downloadConfig = () => {
    const blob = new Blob([config], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.conf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContext.Provider value={{ activeItem: PAGE.NGINX_CONFIG }}>
      <Layout title="Nginx Config Generator">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Server className="w-6 h-6 text-emerald-600" />
              </div>
              Nginx Config Generator
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Fill in your server details and get a production-ready nginx server block.
              Everything runs locally in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-6">
              {/* Server */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-500" /> Server
                </h3>
                <div className="space-y-4">
                  <Field label="Config file name (optional)">
                    <input
                      className={inputClass}
                      value={state.configName}
                      onChange={(e) => set("configName", e.target.value)}
                      placeholder={`${fileName}.conf`}
                    />
                  </Field>
                  <Field label="Domain / Server name">
                    <input
                      className={inputClass}
                      value={state.serverName}
                      onChange={(e) => set("serverName", e.target.value)}
                      placeholder="example.com"
                    />
                  </Field>
                  <Toggle
                    label="Include www subdomain"
                    hint="Also matches www.example.com"
                    checked={state.includeWww}
                    onChange={(v) => set("includeWww", v)}
                  />
                  <Toggle
                    label="Listen on IPv6"
                    hint="Adds listen [::] directives"
                    checked={state.ipv6}
                    onChange={(v) => set("ipv6", v)}
                  />
                  {!state.ssl && (
                    <Field label="Listen port">
                      <input
                        type="number"
                        className={inputClass}
                        value={state.port}
                        onChange={(e) => set("port", parseInt(e.target.value, 10) || 80)}
                      />
                    </Field>
                  )}
                </div>
              </div>

              {/* Static files */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-emerald-500" /> Static Files
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Optional server-level root, shared by all location blocks.
                </p>
                <div className="space-y-4">
                  <Field label="Root directory">
                    <input
                      className={inputClass}
                      value={state.root}
                      onChange={(e) => set("root", e.target.value)}
                      placeholder="/var/www/example.com/public"
                    />
                  </Field>
                  <Field label="Index file">
                    <input
                      className={inputClass}
                      value={state.indexFile}
                      onChange={(e) => set("indexFile", e.target.value)}
                      placeholder="index.html"
                    />
                  </Field>
                </div>
              </div>

              {/* Locations */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Network className="w-4 h-4 text-emerald-500" /> Locations
                  </h3>
                  <button
                    type="button"
                    onClick={addLocation}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add location
                  </button>
                </div>
                <div className="space-y-3">
                  {state.locations.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No location blocks. Add one to handle specific routes.
                    </p>
                  )}
                  <AnimatePresence initial={false}>
                    {state.locations.map((loc, index) => (
                      <motion.div
                        key={loc.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <LocationCard
                          loc={loc}
                          index={index}
                          onChange={updateLocation}
                          onRemove={removeLocation}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* TLS */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> TLS / SSL
                </h3>
                <div className="space-y-4">
                  <Toggle
                    label="Enable HTTPS (SSL)"
                    hint="Listen on 443 with certificates"
                    checked={state.ssl}
                    onChange={(v) => set("ssl", v)}
                  />
                  <AnimatePresence>
                    {state.ssl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <Toggle
                          label="Redirect HTTP to HTTPS"
                          checked={state.forceHttps}
                          onChange={(v) => set("forceHttps", v)}
                        />
                        <Toggle
                          label="Enable HTTP/2"
                          checked={state.http2}
                          onChange={(v) => set("http2", v)}
                        />
                        <Field label="Certificate path">
                          <input
                            className={inputClass}
                            value={state.certPath}
                            onChange={(e) => set("certPath", e.target.value)}
                          />
                        </Field>
                        <Field label="Certificate key path">
                          <input
                            className={inputClass}
                            value={state.certKeyPath}
                            onChange={(e) => set("certKeyPath", e.target.value)}
                          />
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Extras */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Optimizations
                </h3>
                <div className="space-y-4">
                  <Toggle
                    label="Enable gzip compression"
                    checked={state.gzip}
                    onChange={(v) => set("gzip", v)}
                  />
                  <Toggle
                    label="Add security headers"
                    hint="X-Frame-Options, nosniff, HSTS…"
                    checked={state.securityHeaders}
                    onChange={(v) => set("securityHeaders", v)}
                  />
                  <Toggle
                    label="Access & error logging"
                    checked={state.logging}
                    onChange={(v) => set("logging", v)}
                  />
                  {state.root.trim() && (
                    <Toggle
                      label="Cache static assets"
                      hint="Long expires for css/js/images/fonts"
                      checked={state.staticCache}
                      onChange={(v) => set("staticCache", v)}
                    />
                  )}
                  <Field label="Max upload size (client_max_body_size)">
                    <input
                      className={inputClass}
                      value={state.maxBodySize}
                      onChange={(e) => set("maxBodySize", e.target.value)}
                      placeholder="10m"
                    />
                  </Field>
                </div>
              </div>

              {/* Advanced */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-500" /> Advanced
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Any extra nginx directives, injected verbatim into the server block.
                </p>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-y leading-relaxed`}
                  value={state.customDirectives}
                  onChange={(e) => set("customDirectives", e.target.value)}
                  placeholder={"# e.g.\nerror_page 404 /404.html;\nrewrite ^/old/(.*)$ /new/$1 permanent;"}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Output */}
            <div className="lg:sticky lg:top-6 self-start">
              <div className="bg-[#1e1e1e] rounded-3xl shadow-lg border border-[#2d2d2d] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-[#1a1a1a] border-b border-[#2d2d2d]">
                  <span className="text-sm font-mono text-slate-300 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    {fileName}.conf
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearAll}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#2d2d2d] transition-colors"
                      title="Clear all fields"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={downloadConfig}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#2d2d2d] transition-colors"
                      title="Download .conf"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={copyConfig}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copied
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-[#2d2d2d] text-slate-300 hover:bg-[#3a3a3a]"
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <pre className="p-5 text-sm text-slate-200 font-mono overflow-x-auto leading-relaxed custom-scrollbar">
                  <code>{config}</code>
                </pre>
              </div>

              <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <p className="text-sm font-semibold text-emerald-900">Deploy steps</p>
                <ul className="mt-2 space-y-1.5">
                  <li className="flex gap-2 text-sm text-emerald-800">
                    <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Save the config to{" "}
                      <span className="font-mono font-semibold">/etc/nginx/sites-available/</span>
                    </span>
                  </li>
                  <li className="flex gap-2 text-sm text-emerald-800">
                    <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Symlink it into{" "}
                      <span className="font-mono font-semibold">sites-enabled/</span>
                    </span>
                  </li>
                  <li className="flex gap-2 text-sm text-emerald-800">
                    <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Test and reload with{" "}
                      <span className="font-mono font-semibold whitespace-nowrap">nginx -t &amp;&amp; systemctl reload nginx</span>
                    </span>
                  </li>
                </ul>

                <div className="mt-3 rounded-xl bg-[#1e1e1e] border border-emerald-900/30 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                    <span className="text-xs font-mono text-slate-400">deploy.sh</span>
                    <button
                      onClick={copyCommand}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                        cmdCopied
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-[#2d2d2d] text-slate-300 hover:bg-[#3a3a3a]"
                      }`}
                    >
                      {cmdCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {cmdCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="px-3 py-2.5 text-xs text-slate-200 font-mono overflow-x-auto leading-relaxed custom-scrollbar">
                    <code>{deployCommand}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
