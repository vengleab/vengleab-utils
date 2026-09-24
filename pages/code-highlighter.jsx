import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Copy,
  Check,
  Code,
  Sparkles,
  ClipboardCheck,
  RefreshCw,
  Eye,
  Camera,
  Image as ImageIcon,
  ChevronRight,
  CornerDownRight,
  Hash,
  AlignLeft,
  AlertTriangle,
  LayoutGrid,
  Columns,
  Maximize2,
  Minimize2,
  Wand2,
  FileCode,
  Sliders,
  Trash2,
  Clipboard,
  GripVertical,
  MoveHorizontal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import CodeHighlighterStorage from '../utils/storage/CodeHighlighter';

const LANGUAGES = [
  { name: 'JavaScript', id: 'javascript', prismId: 'javascript', ext: 'js' },
  { name: 'TypeScript', id: 'typescript', prismId: 'typescript', ext: 'ts' },
  { name: 'HTML / XML', id: 'html', prismId: 'markup', ext: 'html' },
  { name: 'CSS', id: 'css', prismId: 'css', ext: 'css' },
  { name: 'Python', id: 'python', prismId: 'python', ext: 'py' },
  { name: 'SQL', id: 'sql', prismId: 'sql', ext: 'sql' },
  { name: 'Java', id: 'java', prismId: 'java', ext: 'java' },
  { name: 'C++', id: 'cpp', prismId: 'cpp', ext: 'cpp' },
  { name: 'Bash / Shell', id: 'bash', prismId: 'bash', ext: 'sh' },
  { name: 'YAML', id: 'yaml', prismId: 'yaml', ext: 'yml' },
  { name: 'JSON', id: 'json', prismId: 'json', ext: 'json' },
  { name: 'Markdown', id: 'markdown', prismId: 'markdown', ext: 'md' },
];

const THEMES = [
  { name: 'Tomorrow Night (Dark)', id: 'tomorrow', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css', dark: true },
  { name: 'Okaidia / Monokai', id: 'okaidia', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css', dark: true },
  { name: 'Twilight (Retro Dark)', id: 'twilight', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-twilight.min.css', dark: true },
  { name: 'Solarized Light', id: 'solarized', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-solarizedlight.min.css', dark: false },
  { name: 'Default Light', id: 'default', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css', dark: false },
];

const SNAPSHOT_BACKGROUNDS = [
  { id: 'sunset', name: 'Sunset Glow', class: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600', preview: 'linear-gradient(to top right, #f59e0b, #f43f5e, #9333ea)' },
  { id: 'ocean', name: 'Deep Ocean', class: 'bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-700', preview: 'linear-gradient(to top right, #22d3ee, #2563eb, #4338ca)' },
  { id: 'aurora', name: 'Aurora Neon', class: 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-600', preview: 'linear-gradient(to top right, #34d399, #14b8a6, #4f46e5)' },
  { id: 'cyberpunk', name: 'Cyberpunk', class: 'bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-cyan-400', preview: 'linear-gradient(to top right, #c026d3, #db2777, #22d3ee)' },
  { id: 'lavender', name: 'Lavender Mist', class: 'bg-gradient-to-tr from-purple-300 via-indigo-300 to-pink-300', preview: 'linear-gradient(to top right, #d8b4fe, #a5b4fc, #f472b6)' },
  { id: 'emerald', name: 'Emerald Slate', class: 'bg-gradient-to-tr from-emerald-600 via-teal-800 to-slate-900', preview: 'linear-gradient(to top right, #059669, #115e59, #0f172a)' },
  { id: 'carbon', name: 'Carbon Dark', class: 'bg-gradient-to-tr from-slate-800 via-zinc-900 to-black', preview: 'linear-gradient(to top right, #1e293b, #18181b, #000000)' },
  { id: 'white', name: 'Minimal White', class: 'bg-gradient-to-tr from-slate-100 via-slate-100 to-slate-200', preview: 'linear-gradient(to top right, #f1f5f9, #e2e8f0)' },
  { id: 'none', name: 'Transparent', class: 'bg-transparent border-2 border-dashed border-slate-300/80', preview: 'transparent' },
];

const WINDOW_STYLES = [
  { id: 'macos', name: 'macOS Dots', desc: 'Traffic lights controls' },
  { id: 'windows', name: 'Windows', desc: 'Min / Max / Close controls' },
  { id: 'minimal', name: 'Minimal Header', desc: 'Clean title bar' },
  { id: 'frameless', name: 'Frameless', desc: 'No top window bar' },
];

const PADDING_OPTIONS = [
  { id: 'compact', name: 'Compact', value: 'p-4 sm:p-6' },
  { id: 'balanced', name: 'Balanced', value: 'p-6 sm:p-10' },
  { id: 'spacious', name: 'Spacious', value: 'p-8 sm:p-14' },
  { id: 'ultra', name: 'Ultra', value: 'p-10 sm:p-20' },
];

const FONT_SIZES = [
  { id: 'sm', name: 'Small', textClass: 'text-[12px] sm:text-[13px]', leading: 'leading-relaxed' },
  { id: 'md', name: 'Medium', textClass: 'text-[13px] sm:text-[14px]', leading: 'leading-relaxed' },
  { id: 'lg', name: 'Large', textClass: 'text-[14px] sm:text-[16px]', leading: 'leading-relaxed' },
  { id: 'xl', name: 'Extra Large', textClass: 'text-[16px] sm:text-[18px]', leading: 'leading-loose' },
];

const WIDTH_PRESETS = [
  { id: 'auto', name: 'Auto (100%)', width: 'auto' },
  { id: '520', name: 'Compact (520px)', width: 520 },
  { id: '680', name: 'Medium (680px)', width: 680 },
  { id: '840', name: 'Wide (840px)', width: 840 },
];

const TERMINAL_THEMES = [
  {
    id: 'macos',
    name: 'macOS Dark',
    bg: '#1e1e21',
    headerBg: '#323236',
    border: '#3a3a3e',
    title: '#b0b0ba',
    prompt: '#5af78e',
    command: '#f8f8f2',
    output: '#c0c0c8',
    comment: '#6b6b76',
    success: '#5af78e',
    error: '#ff5c57',
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu Terminal',
    bg: '#300a24',
    headerBg: '#3b1032',
    border: '#4a1b40',
    title: '#d7c9d3',
    prompt: '#8ae234',
    command: '#ffffff',
    output: '#d3c9d0',
    comment: '#8f7f8a',
    success: '#8ae234',
    error: '#ef5350',
  },
  {
    id: 'matrix',
    name: 'Matrix Green',
    bg: '#04120a',
    headerBg: '#07200f',
    border: '#0d3a1c',
    title: '#2fa361',
    prompt: '#00ff6a',
    command: '#c8ffdd',
    output: '#3ddc84',
    comment: '#1b6b3a',
    success: '#00ff6a',
    error: '#ff4d4d',
  },
  {
    id: 'powershell',
    name: 'PowerShell Blue',
    bg: '#012456',
    headerBg: '#01193d',
    border: '#0b3170',
    title: '#a9c6ea',
    prompt: '#ffd866',
    command: '#ffffff',
    output: '#cfe3ff',
    comment: '#6f8fb8',
    success: '#a7e22e',
    error: '#ff6b6b',
  },
  {
    id: 'lightterm',
    name: 'Light Terminal',
    bg: '#fdfdfd',
    headerBg: '#ededed',
    border: '#dcdcdc',
    title: '#57606a',
    prompt: '#1a7f37',
    command: '#1f2328',
    output: '#57606a',
    comment: '#8c959f',
    success: '#1a7f37',
    error: '#cf222e',
  },
];

const TERMINAL_LINE_TYPES = [
  { id: 'command', name: 'Command', prefix: '$ ', Icon: ChevronRight, tooltip: 'Prefix line with $ command' },
  { id: 'continuation', name: 'Continued', prefix: '> ', Icon: CornerDownRight, tooltip: 'Prefix line with > continuation' },
  { id: 'output', name: 'Output', prefix: '', Icon: AlignLeft, tooltip: 'Plain output text line' },
  { id: 'comment', name: 'Comment', prefix: '# ', Icon: Hash, tooltip: 'Prefix line with # comment' },
  { id: 'success', name: 'Success', prefix: '+ ', Icon: Check, tooltip: 'Prefix line with + success indicator' },
  { id: 'error', name: 'Error', prefix: '! ', Icon: AlertTriangle, tooltip: 'Prefix line with ! error indicator' },
];

const PROMPT_PRESETS = [
  'user@macbook ~ %',
  'dev@ubuntu:~$',
  '➜  project git:(main)',
  'PS C:\\Users\\Developer>',
  'admin@prod-server:~#',
];

const CODE_SAMPLES = {
  javascript: {
    name: 'JS Fetch & Async',
    code: `// Async Data Fetching Utility
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return { success: true, user: data.user, timestamp: Date.now() };
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return { success: false, error: error.message };
  }
}`,
  },
  typescript: {
    name: 'TS Interface & Generic',
    code: `// Generic ApiResponse Interface
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export async function processRequest<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  const json = await res.json();
  return {
    data: json,
    status: res.status,
    message: res.statusText
  };
}`,
  },
  python: {
    name: 'Python FastAPI',
    code: `# FastAPI REST Endpoint Example
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Util API")

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = None

@app.post("/items/{item_id}")
def create_item(item_id: int, item: Item):
    if item.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be positive")
    return {"item_name": item.name, "item_id": item_id, "discount": item.is_offer}`,
  },
  html: {
    name: 'HTML & CSS Card',
    code: `<!-- Modern Glassmorphism Card -->
<div className="glass-card">
  <div className="card-header">
    <span className="badge">Featured</span>
    <h3>Code Highlighter Studio</h3>
  </div>
  <p>Create high-resolution code snapshots with gradient backgrounds.</p>
  <button className="btn-primary">Get Started &rarr;</button>
</div>`,
  },
  sql: {
    name: 'SQL Analytics Query',
    code: `-- Top Performing Products Monthly Report
SELECT 
    p.product_name,
    c.category_name,
    COUNT(o.order_id) AS total_orders,
    ROUND(SUM(o.total_amount), 2) AS total_revenue
FROM orders o
JOIN products p ON o.product_id = p.id
JOIN categories c ON p.category_id = c.id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.product_name, c.category_name
HAVING SUM(o.total_amount) > 1000.00
ORDER BY total_revenue DESC
LIMIT 10;`,
  },
  bash: {
    name: 'Docker & Shell Deploy',
    code: `#!/bin/bash
# Production Deployment Script

echo "🚀 Building application container..."
docker build -t vengleab/util:latest .

echo "📦 Running static assets cleanup..."
docker run --rm -v $(pwd)/public:/app/public node:18 npm run purge

echo "✅ Container build finished successfully!"`,
  },
};

const TERMINAL_SAMPLES = {
  build: `# Step 1: Install dependencies
$ npm install
added 184 packages in 2.8s

# Step 2: Run production build
$ npm run build
   ▲ Next.js 16.2.6
+ Compiled successfully in 4.1s
+ Generating static pages (16/16)

Route (pages)                Size     First Load JS
┌ ○ /                        2.1 kB          92.4 kB
├ ○ /code-highlighter        5.2 kB         108.2 kB
└ ○ /cron-expression         3.4 kB          98.1 kB

$ docker run -d -p 3001:3001 vengleab/util:latest
+ Container started (id: a8f910e)
✓ Deployment complete!`,
  docker: `# Pull latest PostgreSQL image
$ docker pull postgres:16-alpine
postgres:16-alpine: Pulling from library/postgres
Digest: sha256:7b941...
Status: Downloaded newer image

$ docker run --name dev-db -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:16-alpine
✓ Container 9a4b10cd running on port 5432`,
  git: `# Check current branch status
$ git status
On branch feature/code-highlighter-redesign
Changes to be committed:
  modified: pages/code-highlighter.jsx

$ git commit -m "feat: redesign code highlighter page UI/UX"
[feature/code-highlighter-redesign 4a12bc9] feat: redesign code highlighter page UI/UX
 1 file changed, 420 insertions(+), 180 deletions(-)

$ git push origin feature/code-highlighter-redesign
+ Branch pushed to origin/feature/code-highlighter-redesign`,
};

const TERMINAL_MARKER_RE = /^\s*([$>#!+])\s?/;
const MARKER_TYPES = {
  $: 'command',
  '>': 'continuation',
  '#': 'comment',
  '+': 'success',
  '!': 'error',
};

const THEME_STYLING = {
  default: {
    bg: 'bg-[#f8f9fa]',
    headerBg: 'bg-[#e9ecef]',
    textColor: 'text-[#212529]',
    headerText: 'text-[#495057]',
    borderColor: 'border-[#dee2e6]',
    lineNoBorder: 'border-[#dee2e6]',
    lineNoText: 'text-[#6c757d]',
  },
  tomorrow: {
    bg: 'bg-[#2d2d2d]',
    headerBg: 'bg-[#1f1f1f]',
    textColor: 'text-[#cccccc]',
    headerText: 'text-[#999999]',
    borderColor: 'border-[#3d3d3d]',
    lineNoBorder: 'border-[#3d3d3d]',
    lineNoText: 'text-slate-500',
  },
  okaidia: {
    bg: 'bg-[#272822]',
    headerBg: 'bg-[#181915]',
    textColor: 'text-[#f8f8f2]',
    headerText: 'text-[#75715e]',
    borderColor: 'border-[#383932]',
    lineNoBorder: 'border-[#383932]',
    lineNoText: 'text-[#75715e]',
  },
  twilight: {
    bg: 'bg-[#1e1e1e]',
    headerBg: 'bg-[#121212]',
    textColor: 'text-[#f8f8f8]',
    headerText: 'text-[#606060]',
    borderColor: 'border-[#2c2c2c]',
    lineNoBorder: 'border-[#2c2c2c]',
    lineNoText: 'text-[#606060]',
  },
  solarized: {
    bg: 'bg-[#fdf6e3]',
    headerBg: 'bg-[#eee8d5]',
    textColor: 'text-[#586e75]',
    headerText: 'text-[#93a1a1]',
    borderColor: 'border-[#e0d9c5]',
    lineNoBorder: 'border-[#e0d9c5]',
    lineNoText: 'text-[#93a1a1]',
  },
};

const THEME_CSS = `
/* True Monokai (Okaidia) Override Rules */
.theme-okaidia .token.comment,
.theme-okaidia .token.prolog,
.theme-okaidia .token.doctype,
.theme-okaidia .token.cdata { color: #75715e !important; font-style: italic !important; }
.theme-okaidia .token.punctuation { color: #f8f8f2 !important; }
.theme-okaidia .token.property, .theme-okaidia .token.tag, .theme-okaidia .token.constant, .theme-okaidia .token.symbol, .theme-okaidia .token.deleted { color: #f92672 !important; }
.theme-okaidia .token.boolean, .theme-okaidia .token.number { color: #ae81ff !important; }
.theme-okaidia .token.selector, .theme-okaidia .token.attr-name, .theme-okaidia .token.string, .theme-okaidia .token.char, .theme-okaidia .token.inserted { color: #e6db74 !important; }
.theme-okaidia .token.operator, .theme-okaidia .token.entity, .theme-okaidia .token.url { color: #f92672 !important; }
.theme-okaidia .token.atrule, .theme-okaidia .token.attr-value, .theme-okaidia .token.class-name { color: #66d9ef !important; }
.theme-okaidia .token.function { color: #a6e22e !important; }
.theme-okaidia .token.keyword { color: #f92672 !important; font-weight: bold !important; }
.theme-okaidia .token.regex, .theme-okaidia .token.important, .theme-okaidia .token.variable { color: #fd971f !important; }

/* Tomorrow Night Overrides */
.theme-tomorrow .token.comment, .theme-tomorrow .token.prolog, .theme-tomorrow .token.doctype, .theme-tomorrow .token.cdata { color: #969896 !important; font-style: italic !important; }
.theme-tomorrow .token.punctuation { color: #cccccc !important; }
.theme-tomorrow .token.property, .theme-tomorrow .token.tag, .theme-tomorrow .token.constant, .theme-tomorrow .token.symbol, .theme-tomorrow .token.deleted { color: #cc6666 !important; }
.theme-tomorrow .token.boolean, .theme-tomorrow .token.number { color: #de935f !important; }
.theme-tomorrow .token.selector, .theme-tomorrow .token.attr-name, .theme-tomorrow .token.string, .theme-tomorrow .token.char, .theme-tomorrow .token.builtin, .theme-tomorrow .token.inserted { color: #b5bd68 !important; }
.theme-tomorrow .token.operator, .theme-tomorrow .token.entity, .theme-tomorrow .token.url { color: #8abeb7 !important; }
.theme-tomorrow .token.atrule, .theme-tomorrow .token.attr-value, .theme-tomorrow .token.keyword, .theme-tomorrow .token.class-name { color: #b294bb !important; }
.theme-tomorrow .token.function { color: #81a2be !important; }
.theme-tomorrow .token.regex, .theme-tomorrow .token.important, .theme-tomorrow .token.variable { color: #de935f !important; }

/* Twilight Overrides */
.theme-twilight .token.comment, .theme-twilight .token.prolog, .theme-twilight .token.doctype, .theme-twilight .token.cdata { color: #5f5a60 !important; font-style: italic !important; }
.theme-twilight .token.punctuation { color: #f8f8f8 !important; }
.theme-twilight .token.property, .theme-twilight .token.tag, .theme-twilight .token.constant, .theme-twilight .token.symbol, .theme-twilight .token.deleted { color: #cf6a4c !important; }
.theme-twilight .token.boolean, .theme-twilight .token.number { color: #cf6a4c !important; }
.theme-twilight .token.selector, .theme-twilight .token.attr-name, .theme-twilight .token.string, .theme-twilight .token.char, .theme-twilight .token.builtin, .theme-twilight .token.inserted { color: #8f9d6a !important; }
.theme-twilight .token.operator, .theme-twilight .token.entity, .theme-twilight .token.url { color: #cda869 !important; }
.theme-twilight .token.atrule, .theme-twilight .token.attr-value, .theme-twilight .token.keyword, .theme-twilight .token.class-name { color: #f9ee98 !important; }
.theme-twilight .token.function { color: #9b703f !important; }

/* Solarized Light Overrides */
.theme-solarized .token.comment, .theme-solarized .token.prolog, .theme-solarized .token.doctype, .theme-solarized .token.cdata { color: #93a1a1 !important; font-style: italic !important; }
.theme-solarized .token.punctuation { color: #586e75 !important; }
.theme-solarized .token.property, .theme-solarized .token.tag, .theme-solarized .token.constant, .theme-solarized .token.symbol, .theme-solarized .token.deleted { color: #268bd2 !important; }
.theme-solarized .token.boolean, .theme-solarized .token.number { color: #b58900 !important; }
.theme-solarized .token.selector, .theme-solarized .token.attr-name, .theme-solarized .token.string, .theme-solarized .token.char, .theme-solarized .token.builtin, .theme-solarized .token.inserted { color: #859900 !important; }

/* Default Light Overrides */
.theme-default .token.comment, .theme-default .token.prolog, .theme-default .token.doctype, .theme-default .token.cdata { color: #708090 !important; font-style: italic !important; }
.theme-default .token.punctuation { color: #999999 !important; }
.theme-default .token.property, .theme-default .token.tag, .theme-default .token.boolean, .theme-default .token.number, .theme-default .token.constant, .theme-default .token.symbol, .theme-default .token.deleted { color: #990055 !important; }
.theme-default .token.selector, .theme-default .token.attr-name, .theme-default .token.string, .theme-default .token.char, .theme-default .token.builtin, .theme-default .token.inserted { color: #669900 !important; }
.theme-default .token.operator, .theme-default .token.entity, .theme-default .token.url { color: #9a6e3a !important; }
.theme-default .token.atrule, .theme-default .token.attr-value, .theme-default .token.keyword, .theme-default .token.class-name { color: #0077aa !important; }
.theme-default .token.function { color: #dd4a68 !important; }
`;

const DEFAULT_CODE = CODE_SAMPLES.javascript.code;
const DEFAULT_PROMPT = 'user@macbook ~ %';
const DEFAULT_TERMINAL = TERMINAL_SAMPLES.build;

const parseTerminalLines = (text) => {
  let continuing = false;
  return text.split('\n').map((line) => {
    const trimmed = line.trimStart();
    const marker = TERMINAL_MARKER_RE.test(trimmed) ? trimmed[0] : null;
    const content = marker ? trimmed.slice(1).trimStart() : line;
    let type = MARKER_TYPES[marker];
    if (!type) type = continuing ? 'continuation' : 'output';
    continuing = (type === 'command' || type === 'continuation') && content.trimEnd().endsWith('\\');
    return { type, content: type === 'comment' ? trimmed : content };
  });
};

export default function CodeHighlighter() {
  const [mode, setMode] = useState('code'); // 'code' | 'terminal'
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'stacked' | 'focus'

  // Collapsible panels state
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('tomorrow');
  const [snapshotBg, setSnapshotBg] = useState('sunset');
  const [windowStyle, setWindowStyle] = useState('macos');
  const [paddingSize, setPaddingSize] = useState('balanced');
  const [fontSize, setFontSize] = useState('md');
  const [windowWidth, setWindowWidth] = useState('auto'); // 'auto' or numeric string like '640'
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [windowTitle, setWindowTitle] = useState('');

  const [terminalText, setTerminalText] = useState(DEFAULT_TERMINAL);
  const [terminalTheme, setTerminalTheme] = useState('macos');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  const [prismLoaded, setPrismLoaded] = useState(false);
  const [renderersLoaded, setRenderersLoaded] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState(new Set(['javascript', 'markup', 'css', 'clike']));

  // Mouse Drag Resizing
  const [isResizing, setIsResizing] = useState(false);

  // Feedback states
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedRich, setCopiedRich] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [pastedCode, setPastedCode] = useState(false);
  const [formatted, setFormatted] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');

  const previewRef = useRef(null);
  const textareaRef = useRef(null);
  const snapshotContainerRef = useRef(null);
  const windowFrameRef = useRef(null);

  // Initialize and load saved state from localStorage
  useEffect(() => {
    const savedCode = CodeHighlighterStorage.get('codeText');
    const savedLang = CodeHighlighterStorage.get('language');
    const savedTheme = CodeHighlighterStorage.get('theme');
    const savedLines = CodeHighlighterStorage.get('lineNumbers');
    const savedBg = CodeHighlighterStorage.get('snapshotBg');
    const savedMode = CodeHighlighterStorage.get('mode');
    const savedView = CodeHighlighterStorage.get('viewMode');
    const savedWinStyle = CodeHighlighterStorage.get('windowStyle');
    const savedPadding = CodeHighlighterStorage.get('paddingSize');
    const savedFont = CodeHighlighterStorage.get('fontSize');
    const savedWidth = CodeHighlighterStorage.get('windowWidth');
    const savedTitle = CodeHighlighterStorage.get('windowTitle');
    const savedHeaderCol = CodeHighlighterStorage.get('headerCollapsed');
    const savedCtrlCol = CodeHighlighterStorage.get('controlsCollapsed');
    const savedTerminal = CodeHighlighterStorage.get('terminalText');
    const savedTerminalTheme = CodeHighlighterStorage.get('terminalTheme');
    const savedPrompt = CodeHighlighterStorage.get('prompt');

    if (savedCode) setCode(savedCode);
    if (savedLang) setLanguage(savedLang);
    if (savedTheme) setTheme(savedTheme);
    if (savedLines !== null && savedLines !== undefined) setShowLineNumbers(savedLines === 'true');
    if (savedBg) setSnapshotBg(savedBg);
    if (savedMode) setMode(savedMode);
    if (savedView) setViewMode(savedView);
    if (savedWinStyle) setWindowStyle(savedWinStyle);
    if (savedPadding) setPaddingSize(savedPadding);
    if (savedFont) setFontSize(savedFont);
    if (savedWidth) setWindowWidth(savedWidth);
    if (savedTitle !== null && savedTitle !== undefined) setWindowTitle(savedTitle);
    if (savedHeaderCol) setHeaderCollapsed(savedHeaderCol === 'true');
    if (savedCtrlCol) setControlsCollapsed(savedCtrlCol === 'true');
    if (savedTerminal) setTerminalText(savedTerminal);
    if (savedTerminalTheme) setTerminalTheme(savedTerminalTheme);
    if (savedPrompt) setPrompt(savedPrompt);

    const loadPrismCore = async () => {
      if (window.Prism) {
        setPrismLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
      script.onload = () => setPrismLoaded(true);
      document.body.appendChild(script);
    };

    const loadRenderers = () => {
      // 1. Primary renderer: html-to-image (SVG foreignObject, natively supports Tailwind v4 & OKLCH)
      if (!window.htmlToImage) {
        const scriptImg = document.createElement('script');
        scriptImg.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
        scriptImg.onload = () => setRenderersLoaded(true);
        scriptImg.onerror = () => {};
        document.body.appendChild(scriptImg);
      }

      // 2. Secondary renderer: html2canvas-pro (supports modern CSS color spaces & variables)
      if (!window.html2canvas) {
        const scriptH2C = document.createElement('script');
        scriptH2C.src = 'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js';
        scriptH2C.onload = () => setRenderersLoaded(true);
        scriptH2C.onerror = () => {
          const fallback = document.createElement('script');
          fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          fallback.onload = () => setRenderersLoaded(true);
          document.body.appendChild(fallback);
        };
        document.body.appendChild(scriptH2C);
      }

      if (window.htmlToImage || window.html2canvas) {
        setRenderersLoaded(true);
      }
    };

    loadPrismCore();
    loadRenderers();
  }, []);

  // Optimized 60fps Drag Resize Handler (Zero Lag, 1:1 Pointer Tracking)
  useEffect(() => {
    let animationFrameId = null;

    const updatePosition = (clientX) => {
      if (!windowFrameRef.current) return;
      const rect = windowFrameRef.current.getBoundingClientRect();
      const newWidth = Math.max(300, Math.min(1150, Math.round(clientX - rect.left)));
      setWindowWidth(String(newWidth));
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const clientX = e.clientX;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => updatePosition(clientX));
    };

    const handleTouchMove = (e) => {
      if (!isResizing || !e.touches[0]) return;
      const clientX = e.touches[0].clientX;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => updatePosition(clientX));
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        // Save to localStorage ONLY when dragging completes (no blocking while dragging)
        setWindowWidth((current) => {
          CodeHighlighterStorage.set('windowWidth', current);
          return current;
        });
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isResizing]);

  // Sync theme stylesheets in head
  useEffect(() => {
    const selectedTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
    const existingThemes = document.querySelectorAll('link[data-prism-theme]');
    existingThemes.forEach((el) => el.remove());

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = selectedTheme.url;
    link.setAttribute('data-prism-theme', theme);
    document.head.appendChild(link);

    CodeHighlighterStorage.set('theme', theme);
  }, [theme]);

  // Load language grammar dynamically when language changes
  useEffect(() => {
    const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
    const targetPrismId = currentLang.prismId;

    if (!prismLoaded || loadedLanguages.has(targetPrismId)) return;

    const script = document.createElement('script');
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${targetPrismId}.min.js`;
    script.onload = () => setLoadedLanguages((prev) => new Set([...prev, targetPrismId]));
    document.body.appendChild(script);
  }, [language, prismLoaded, loadedLanguages]);

  const termStyle = TERMINAL_THEMES.find((t) => t.id === terminalTheme) || TERMINAL_THEMES[0];
  const isTerminal = mode === 'terminal';
  const activeText = isTerminal ? terminalText : code;

  // Derive title for window header
  const currentLangObj = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
  const displayTitle = windowTitle || (isTerminal ? prompt.split(' ')[0] || 'terminal.sh' : `script.${currentLangObj.ext}`);

  const toggleHeaderCollapsed = () => {
    const next = !headerCollapsed;
    setHeaderCollapsed(next);
    CodeHighlighterStorage.set('headerCollapsed', String(next));
  };

  const toggleControlsCollapsed = () => {
    const next = !controlsCollapsed;
    setControlsCollapsed(next);
    CodeHighlighterStorage.set('controlsCollapsed', String(next));
  };

  const handleModeChange = (next) => {
    setMode(next);
    CodeHighlighterStorage.set('mode', next);
  };

  const handleViewModeChange = (next) => {
    setViewMode(next);
    CodeHighlighterStorage.set('viewMode', next);
  };

  const handleTerminalChange = (e) => {
    setTerminalText(e.target.value);
    CodeHighlighterStorage.set('terminalText', e.target.value);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    CodeHighlighterStorage.set('prompt', e.target.value);
  };

  const applyLineFormat = (prefix) => {
    const el = textareaRef.current;
    if (!el) return;

    const blockStart = terminalText.lastIndexOf('\n', el.selectionStart - 1) + 1;
    const nextBreak = terminalText.indexOf('\n', el.selectionEnd);
    const blockEnd = nextBreak === -1 ? terminalText.length : nextBreak;

    const block = terminalText
      .slice(blockStart, blockEnd)
      .split('\n')
      .map((line) => `${prefix}${line.replace(TERMINAL_MARKER_RE, '')}`)
      .join('\n');

    const next = terminalText.slice(0, blockStart) + block + terminalText.slice(blockEnd);
    setTerminalText(next);
    CodeHighlighterStorage.set('terminalText', next);

    setTimeout(() => {
      el.focus();
      el.selectionStart = blockStart;
      el.selectionEnd = blockStart + block.length;
    }, 0);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
    CodeHighlighterStorage.set('codeText', e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const source = isTerminal ? terminalText : code;
      const newValue = `${source.substring(0, start)}  ${source.substring(end)}`;

      if (isTerminal) {
        setTerminalText(newValue);
        CodeHighlighterStorage.set('terminalText', newValue);
      } else {
        setCode(newValue);
        CodeHighlighterStorage.set('codeText', newValue);
      }

      setTimeout(() => {
        if (e.target) {
          e.target.selectionStart = start + 2;
          e.target.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleLangChange = (langId) => {
    setLanguage(langId);
    CodeHighlighterStorage.set('language', langId);
  };

  const toggleLineNumbers = () => {
    const next = !showLineNumbers;
    setShowLineNumbers(next);
    CodeHighlighterStorage.set('lineNumbers', String(next));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (isTerminal) {
          setTerminalText(text);
          CodeHighlighterStorage.set('terminalText', text);
        } else {
          setCode(text);
          CodeHighlighterStorage.set('codeText', text);
        }
        setPastedCode(true);
        setTimeout(() => setPastedCode(false), 2000);
      }
    } catch (err) {
      if (textareaRef.current) textareaRef.current.focus();
    }
  };

  const handleClear = () => {
    if (isTerminal) {
      setTerminalText('');
      CodeHighlighterStorage.set('terminalText', '');
    } else {
      setCode('');
      CodeHighlighterStorage.set('codeText', '');
    }
  };

  const handleFormatCode = () => {
    if (isTerminal) return;
    try {
      const formattedLines = code
        .split('\n')
        .map((l) => l.trimEnd())
        .join('\n');
      setCode(formattedLines);
      CodeHighlighterStorage.set('codeText', formattedLines);
      setFormatted(true);
      setTimeout(() => setFormatted(false), 2000);
    } catch (err) {
      // Ignore if formatting fails
    }
  };

  const loadSample = (sampleKey) => {
    if (isTerminal) {
      const sample = TERMINAL_SAMPLES[sampleKey];
      if (sample) {
        setTerminalText(sample);
        CodeHighlighterStorage.set('terminalText', sample);
      }
    } else {
      const sample = CODE_SAMPLES[sampleKey];
      if (sample) {
        setCode(sample.code);
        setLanguage(sampleKey);
        CodeHighlighterStorage.set('codeText', sample.code);
        CodeHighlighterStorage.set('language', sampleKey);
      }
    }
  };

  const getHighlightedCode = () => {
    const activeLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
    if (prismLoaded && window.Prism && window.Prism.languages[activeLang.prismId]) {
      try {
        return window.Prism.highlight(code, window.Prism.languages[activeLang.prismId], activeLang.prismId);
      } catch (err) {
        return code;
      }
    }
    return code;
  };

  const copyRaw = () => {
    navigator.clipboard.writeText(activeText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const copyHtml = () => {
    if (!previewRef.current) return;
    const innerHtml = previewRef.current.innerHTML;
    navigator.clipboard.writeText(innerHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const copyRich = async () => {
    if (!previewRef.current) return;
    try {
      const innerHtml = previewRef.current.innerHTML;
      let background = theme === 'default' || theme === 'solarized' ? '#f8f9fa' : '#2d2d2d';
      let color = theme === 'default' || theme === 'solarized' ? '#212529' : '#ccc';
      if (isTerminal) {
        background = termStyle.bg;
        color = termStyle.output;
      }
      const cleanHtml = `<pre style="font-family: monospace; font-size: 14px; padding: 16px; border-radius: 8px; background: ${background}; color: ${color}">${innerHtml}</pre>`;
      const blobHtml = new Blob([cleanHtml], { type: 'text/html' });
      const blobText = new Blob([activeText], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText });
      await navigator.clipboard.write([item]);
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2000);
    } catch (err) {
      copyRaw();
    }
  };

  const ensureRenderersReady = () => {
    if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
    if (window.htmlToImage || window.html2canvas) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts += 1;
        if (window.htmlToImage || window.html2canvas || attempts > 25) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const generateSnapshotDataUrl = async () => {
    await ensureRenderersReady();
    const target = document.getElementById('snapshot-capture-area');
    if (!target) throw new Error('Snapshot capture area not found');

    // 1. Try html-to-image (Primary)
    if (window.htmlToImage && typeof window.htmlToImage.toPng === 'function') {
      try {
        const dataUrl = await window.htmlToImage.toPng(target, {
          pixelRatio: 2,
          skipFonts: true,
          cacheBust: true,
          filter: (node) => !(node.getAttribute && node.getAttribute('data-snapshot-exclude') === 'true'),
        });
        if (dataUrl && dataUrl.startsWith('data:image/png')) {
          return dataUrl;
        }
      } catch (err) {
        console.warn('htmlToImage toPng error, falling back to html2canvas:', err);
      }
    }

    // 2. Fallback to html2canvas / html2canvas-pro
    if (window.html2canvas) {
      const canvas = await window.html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        ignoreElements: (el) => el.getAttribute && el.getAttribute('data-snapshot-exclude') === 'true',
      });
      return canvas.toDataURL('image/png');
    }

    throw new Error('No snapshot renderer available');
  };

  const generateSnapshotBlob = async () => {
    await ensureRenderersReady();
    const target = document.getElementById('snapshot-capture-area');
    if (!target) throw new Error('Snapshot capture area not found');

    // 1. Try html-to-image toBlob (Primary)
    if (window.htmlToImage && typeof window.htmlToImage.toBlob === 'function') {
      try {
        const blob = await window.htmlToImage.toBlob(target, {
          pixelRatio: 2,
          skipFonts: true,
          cacheBust: true,
          filter: (node) => !(node.getAttribute && node.getAttribute('data-snapshot-exclude') === 'true'),
        });
        if (blob && blob.size > 0) {
          return blob;
        }
      } catch (err) {
        console.warn('htmlToImage toBlob error, falling back to html2canvas:', err);
      }
    }

    // 2. Fallback to html2canvas canvas.toBlob
    if (window.html2canvas) {
      const canvas = await window.html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        ignoreElements: (el) => el.getAttribute && el.getAttribute('data-snapshot-exclude') === 'true',
      });
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) resolve(blob);
          else reject(new Error('Canvas produced an empty blob'));
        }, 'image/png');
      });
    }

    // 3. Last-resort fetch from dataUrl
    const dataUrl = await generateSnapshotDataUrl();
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  const downloadSnapshot = async () => {
    setExporting(true);
    try {
      const dataUrl = await generateSnapshotDataUrl();
      const link = document.createElement('a');
      link.download = isTerminal ? 'terminal-snapshot.png' : `code-snapshot-${language}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 150);
    } catch (err) {
      console.error('Download snapshot failed:', err);
      setCopyNotice('Failed to generate snapshot image.');
      setTimeout(() => setCopyNotice(''), 3000);
    } finally {
      setExporting(false);
    }
  };

  const copyImage = async () => {
    setCopyingImage(true);

    try {
      // Synchronously initiate blob creation to preserve transient user activation in Safari
      const blobPromise = generateSnapshotBlob();

      let writeSuccess = false;
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        try {
          // Standard modern API: pass Promise directly to ClipboardItem
          const item = new ClipboardItem({
            'image/png': blobPromise,
          });
          await navigator.clipboard.write([item]);
          writeSuccess = true;
        } catch (promiseErr) {
          // Fallback for browsers requiring resolved blob
          try {
            const blob = await blobPromise;
            const item = new ClipboardItem({
              'image/png': blob,
            });
            await navigator.clipboard.write([item]);
            writeSuccess = true;
          } catch (writeErr) {
            console.warn('Clipboard write failed:', writeErr);
          }
        }
      }

      if (writeSuccess) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      } else {
        // Fallback: If clipboard write is denied or unsupported, download PNG instead
        await downloadSnapshot();
        setCopyNotice('Clipboard access restricted. Downloaded snapshot as PNG instead.');
        setTimeout(() => setCopyNotice(''), 3500);
      }
    } catch (err) {
      console.error('copyImage error caught:', err);
      try {
        await downloadSnapshot();
        setCopyNotice('Clipboard access restricted. Downloaded snapshot as PNG instead.');
        setTimeout(() => setCopyNotice(''), 3500);
      } catch (e) {
        setCopyNotice('Failed to capture snapshot.');
        setTimeout(() => setCopyNotice(''), 3500);
      }
    } finally {
      setCopyingImage(false);
    }
  };

  const lines = code.split('\n');
  const terminalLines = parseTerminalLines(terminalText);
  const commandText = terminalLines
    .filter((l) => l.type === 'command' || l.type === 'continuation')
    .map((l) => l.content)
    .join('\n');

  const copyCommands = () => {
    navigator.clipboard.writeText(commandText);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2000);
  };

  const charCount = activeText.length;
  const wordCount = activeText.trim() ? activeText.trim().split(/\s+/).length : 0;
  const lineCount = activeText.split('\n').length;

  const selectedBg = SNAPSHOT_BACKGROUNDS.find((bg) => bg.id === snapshotBg) || SNAPSHOT_BACKGROUNDS[0];
  const currentStyle = THEME_STYLING[theme] || THEME_STYLING.tomorrow;
  const paddingObj = PADDING_OPTIONS.find((p) => p.id === paddingSize) || PADDING_OPTIONS[1];
  const fontSizeObj = FONT_SIZES.find((f) => f.id === fontSize) || FONT_SIZES[1];

  const frameWidthStyle = windowWidth === 'auto' ? { width: '100%', maxWidth: '100%' } : { width: `${windowWidth}px`, maxWidth: '100%' };

  let imageBtnLabel = 'Copy Image (PNG)';
  let ImageBtnIcon = ImageIcon;
  if (copyingImage) {
    ImageBtnIcon = RefreshCw;
    imageBtnLabel = 'Copying Image...';
  } else if (copiedImage) {
    ImageBtnIcon = Check;
    imageBtnLabel = 'Image Copied!';
  }

  return (
    <PageContext.Provider value={{ activeItem: PAGE.CODE_HIGHLIGHTER }}>
      <Layout title="Code Highlighter & Snapshot Studio">
        <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto pb-12 space-y-4 sm:space-y-6"
        >
          {/* Header Section (Collapsible) */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-md shadow-indigo-200 shrink-0">
                  <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    Code & Terminal Snapshot Studio
                  </h1>
                  {!headerCollapsed && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Create resizable macOS code screenshots, terminal session mocks, and rich highlighted snippets.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* View Layout & Studio Switchers */}
                <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5">
                    {[
                      { id: 'code', name: 'Code', Icon: Code },
                      { id: 'terminal', name: 'Terminal', Icon: Terminal },
                    ].map(({ id, name, Icon }) => (
                      <button
                        key={id}
                        onClick={() => handleModeChange(id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          mode === id
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 pl-1">
                    {[
                      { id: 'split', name: 'Split', Icon: Columns, tooltip: 'Side-by-side layout' },
                      { id: 'stacked', name: 'Stacked', Icon: LayoutGrid, tooltip: 'Top input, wide bottom preview' },
                      { id: 'focus', name: 'Focus', Icon: Maximize2, tooltip: 'Full preview focus' },
                    ].map(({ id, name, Icon, tooltip }) => (
                      <button
                        key={id}
                        onClick={() => handleViewModeChange(id)}
                        title={tooltip}
                        className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          viewMode === id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header Collapse Toggle Button */}
                <button
                  onClick={toggleHeaderCollapsed}
                  title={headerCollapsed ? 'Expand Header' : 'Collapse Header'}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
                >
                  {headerCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Preset Customization Bar (Collapsible) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Snapshot & Style Controls
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {controlsCollapsed ? 'Collapsed' : 'Auto-saved'}
                </span>
                <button
                  onClick={toggleControlsCollapsed}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                >
                  {controlsCollapsed ? (
                    <>
                      <span>Show Controls</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Hide Controls</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {!controlsCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Language / Terminal Prompt Control */}
                  {isTerminal ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 block flex justify-between">
                        <span>Prompt Style</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={prompt}
                          onChange={handlePromptChange}
                          placeholder="user@macbook ~ %"
                          className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                          spellCheck={false}
                        />
                      </div>
                      {/* Quick Prompt Presets */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {PROMPT_PRESETS.slice(0, 3).map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setPrompt(p);
                              CodeHighlighterStorage.set('prompt', p);
                            }}
                            className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer truncate max-w-[120px]"
                            title={`Use prompt: ${p}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 block">Language Syntax</label>
                      <select
                        value={language}
                        onChange={(e) => handleLangChange(e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Theme Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">Theme Color</label>
                    {isTerminal ? (
                      <select
                        value={terminalTheme}
                        onChange={(e) => {
                          setTerminalTheme(e.target.value);
                          CodeHighlighterStorage.set('terminalTheme', e.target.value);
                        }}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                      >
                        {TERMINAL_THEMES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                      >
                        {THEMES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Window Frame Style */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">Window Controls</label>
                    <select
                      value={windowStyle}
                      onChange={(e) => {
                        setWindowStyle(e.target.value);
                        CodeHighlighterStorage.set('windowStyle', e.target.value);
                      }}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      {WINDOW_STYLES.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Window Title Override */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">Window Title</label>
                    <input
                      type="text"
                      value={windowTitle}
                      onChange={(e) => {
                        setWindowTitle(e.target.value);
                        CodeHighlighterStorage.set('windowTitle', e.target.value);
                      }}
                      placeholder={displayTitle}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Resizable Width Controls & Background Swatches */}
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Background Swatches */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-600 block">Background Gradient Swatches</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {SNAPSHOT_BACKGROUNDS.map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() => {
                              setSnapshotBg(bg.id);
                              CodeHighlighterStorage.set('snapshotBg', bg.id);
                            }}
                            title={bg.name}
                            className={`relative w-7 h-7 rounded-xl transition-all cursor-pointer ${
                              bg.id === 'none'
                                ? 'bg-slate-100 border border-dashed border-slate-400'
                                : ''
                            } ${
                              snapshotBg === bg.id
                                ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110 shadow-sm'
                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                            }`}
                            style={bg.id !== 'none' ? { background: bg.preview } : {}}
                          >
                            {snapshotBg === bg.id && (
                              <Check className={`w-3.5 h-3.5 absolute inset-0 m-auto ${bg.id === 'white' || bg.id === 'none' ? 'text-slate-800' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frame Width Presets & Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                          <MoveHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                          Frame Width:
                          <span className="font-mono text-indigo-600 font-bold">
                            {windowWidth === 'auto' ? 'Auto (100%)' : `${windowWidth}px`}
                          </span>
                        </span>
                        {windowWidth !== 'auto' && (
                          <button
                            onClick={() => {
                              setWindowWidth('auto');
                              CodeHighlighterStorage.set('windowWidth', 'auto');
                            }}
                            className="text-[10px] text-slate-400 hover:text-indigo-600 underline cursor-pointer"
                          >
                            Reset Auto Width
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Width Preset Buttons */}
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          {WIDTH_PRESETS.map((w) => (
                            <button
                              key={w.id}
                              onClick={() => {
                                const val = String(w.width);
                                setWindowWidth(val);
                                CodeHighlighterStorage.set('windowWidth', val);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                (windowWidth === 'auto' && w.id === 'auto') || windowWidth === String(w.width)
                                  ? 'bg-white text-indigo-600 shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {w.name}
                            </button>
                          ))}
                        </div>

                        {/* Custom Width Slider */}
                        <input
                          type="range"
                          min="360"
                          max="1000"
                          step="20"
                          value={windowWidth === 'auto' ? 800 : Number(windowWidth)}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWindowWidth(val);
                            CodeHighlighterStorage.set('windowWidth', val);
                          }}
                          className="w-32 accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Canvas Padding & Font Size Toggle Pills */}
                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">Padding</span>
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          {PADDING_OPTIONS.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setPaddingSize(p.id);
                                CodeHighlighterStorage.set('paddingSize', p.id);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                paddingSize === p.id ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">Font Size</span>
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          {FONT_SIZES.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => {
                                setFontSize(f.id);
                                CodeHighlighterStorage.set('fontSize', f.id);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                fontSize === f.id ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {f.id.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {!isTerminal && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 block">Line Numbers</span>
                          <button
                            onClick={toggleLineNumbers}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              showLineNumbers
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <Hash className="w-3.5 h-3.5" />
                            {showLineNumbers ? 'On' : 'Off'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Grid View */}
          <div className={
            viewMode === 'stacked'
              ? 'space-y-8'
              : viewMode === 'focus'
                ? 'grid grid-cols-1 gap-8'
                : 'grid grid-cols-1 lg:grid-cols-12 gap-8'
          }>
            {/* Input Panel (Hidden in Focus Mode) */}
            {viewMode !== 'focus' && (
              <div className={viewMode === 'stacked' ? 'w-full' : 'lg:col-span-5 space-y-6'}>
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  {/* Input Toolbar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {isTerminal ? 'Terminal Session Transcript' : 'Source Code Editor'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePaste}
                        title="Paste from clipboard"
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {pastedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                        {pastedCode ? 'Pasted!' : 'Paste'}
                      </button>

                      {!isTerminal && (
                        <button
                          onClick={handleFormatCode}
                          title="Format indents & clean spaces"
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {formatted ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Wand2 className="w-3.5 h-3.5" />}
                          Format
                        </button>
                      )}

                      <button
                        onClick={handleClear}
                        title="Clear content"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Starter Samples Loader */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400">Sample Snippets:</span>
                    {isTerminal ? (
                      <>
                        <button onClick={() => loadSample('build')} className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer">Build & Deploy</button>
                        <button onClick={() => loadSample('docker')} className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer">Docker Run</button>
                        <button onClick={() => loadSample('git')} className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer">Git Flow</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => loadSample('javascript')} className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer">JS Fetch</button>
                        <button onClick={() => loadSample('typescript')} className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer">TS Interface</button>
                        <button onClick={() => loadSample('python')} className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer">Python API</button>
                        <button onClick={() => loadSample('sql')} className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer">SQL Query</button>
                        <button onClick={() => loadSample('bash')} className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors cursor-pointer">Shell Script</button>
                      </>
                    )}
                  </div>

                  {/* Terminal Line Type Quick Buttons */}
                  {isTerminal && (
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Line Marker Toolbar (Applies to cursor line)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {TERMINAL_LINE_TYPES.map(({ id, name, prefix, Icon, tooltip }) => (
                          <button
                            key={id}
                            onClick={() => applyLineFormat(prefix)}
                            title={tooltip}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {name}
                            <span className="font-mono text-[10px] text-slate-400">
                              {prefix.trim() || '—'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Textarea Editor */}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={activeText}
                      onChange={isTerminal ? handleTerminalChange : handleCodeChange}
                      onKeyDown={handleKeyDown}
                      placeholder={isTerminal ? '$ npm run build\nbuild completed in 2.4s' : 'Paste or type code here...'}
                      className="w-full min-h-[360px] p-4 font-mono text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-y text-slate-800 leading-relaxed"
                      spellCheck={false}
                    />
                  </div>

                  {/* Code Statistics */}
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                    <span>{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Output & Snapshot Preview Box Panel */}
            <div className={
              viewMode === 'stacked'
                ? 'w-full'
                : viewMode === 'focus'
                  ? 'w-full max-w-5xl mx-auto'
                  : 'lg:col-span-7 space-y-6'
            }>
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live Preview & Resizable Canvas
                    </h3>
                  </div>

                  {viewMode === 'focus' && (
                    <button
                      onClick={() => handleViewModeChange('split')}
                      className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      Exit Focus View
                    </button>
                  )}
                </div>

                {/* Captured Canvas Snapshot Area */}
                <div
                  ref={snapshotContainerRef}
                  className="flex-1 overflow-x-auto bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-6 flex flex-col justify-center items-center min-h-[420px]"
                >
                  <div
                    id="snapshot-capture-area"
                    className={`rounded-2xl flex items-center justify-center transition-all w-full max-w-full ${paddingObj.value} ${selectedBg.class}`}
                    style={selectedBg.id !== 'none' ? { background: selectedBg.preview } : { backgroundColor: 'transparent' }}
                  >
                    {isTerminal ? (
                      /* Terminal Session Frame */
                      <div
                        ref={windowFrameRef}
                        className={`rounded-2xl shadow-2xl overflow-hidden border select-none text-left relative ${
                          isResizing ? 'transition-none' : 'transition-all duration-150'
                        }`}
                        style={{ ...frameWidthStyle, backgroundColor: termStyle.bg, borderColor: termStyle.border }}
                      >
                        {/* Header Controls */}
                        {windowStyle !== 'frameless' && (
                          <div
                            className="flex items-center justify-between px-4 py-3 border-b select-none"
                            style={{ backgroundColor: termStyle.headerBg, borderColor: termStyle.border }}
                          >
                            {windowStyle === 'macos' && (
                              <div className="flex gap-2 shrink-0">
                                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-inner" />
                                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-inner" />
                                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-inner" />
                              </div>
                            )}

                            {windowStyle === 'windows' && (
                              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                                <span>─</span>
                                <span>□</span>
                                <span>✕</span>
                              </div>
                            )}

                            {windowStyle === 'minimal' && (
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                              </div>
                            )}

                            <div
                              className="text-[11px] font-bold tracking-wider font-mono truncate px-4 text-center flex-1"
                              style={{ color: termStyle.title }}
                            >
                              {displayTitle}
                            </div>

                            <div className="w-12 shrink-0" />
                          </div>
                        )}

                        {/* Terminal Body */}
                        <div
                          ref={previewRef}
                          className={`p-6 font-mono ${fontSizeObj.textClass} ${fontSizeObj.leading}`}
                        >
                          {terminalLines.map((line, i) => {
                            if (line.type === 'command' || line.type === 'continuation') {
                              const isCont = line.type === 'continuation';
                              const linePrompt = isCont ? '>' : prompt;

                              return (
                                <div key={i} className="whitespace-pre-wrap break-words">
                                  <span
                                    style={{
                                      color: termStyle.prompt,
                                      opacity: isCont ? 0.65 : 1,
                                    }}
                                  >
                                    {linePrompt}
                                  </span>
                                  {linePrompt ? ' ' : ''}
                                  <span style={{ color: termStyle.command, fontWeight: 600 }}>
                                    {line.content}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={i}
                                className="whitespace-pre-wrap break-words"
                                style={{
                                  color: termStyle[line.type] || termStyle.output,
                                  fontStyle: line.type === 'comment' ? 'italic' : 'normal',
                                }}
                              >
                                {line.type === 'success' && '✓ '}
                                {line.type === 'error' && '✗ '}
                                {line.content || ' '}
                              </div>
                            );
                          })}
                        </div>

                        {/* Interactive Drag Resize Handle */}
                        <div
                          data-snapshot-exclude="true"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsResizing(true);
                          }}
                          onTouchStart={(e) => {
                            setIsResizing(true);
                          }}
                          className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center hover:bg-indigo-500/20 group transition-colors select-none touch-none"
                          title="Drag to resize screenshot width"
                        >
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                    ) : (
                      /* Code Highlight Window Frame */
                      <div
                        ref={windowFrameRef}
                        className={`rounded-2xl shadow-2xl overflow-hidden border ${currentStyle.bg} ${currentStyle.borderColor} select-none text-left relative ${
                          isResizing ? 'transition-none' : 'transition-all duration-150'
                        }`}
                        style={frameWidthStyle}
                      >
                        {/* Header Controls */}
                        {windowStyle !== 'frameless' && (
                          <div className={`flex items-center justify-between px-4 py-3 ${currentStyle.headerBg} border-b ${currentStyle.borderColor} select-none`}>
                            {windowStyle === 'macos' && (
                              <div className="flex gap-2 shrink-0">
                                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-inner" />
                                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-inner" />
                                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-inner" />
                              </div>
                            )}

                            {windowStyle === 'windows' && (
                              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                                <span>─</span>
                                <span>□</span>
                                <span>✕</span>
                              </div>
                            )}

                            {windowStyle === 'minimal' && (
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                              </div>
                            )}

                            <div className={`text-[11px] font-bold tracking-wider font-mono truncate px-4 text-center flex-1 ${currentStyle.headerText}`}>
                              {displayTitle}
                            </div>

                            <div className="w-12 shrink-0 text-right text-[10px] uppercase font-mono font-bold text-slate-400">
                              {currentLangObj.name}
                            </div>
                          </div>
                        )}

                        {/* Code Highlight Content */}
                        <div className={`p-6 font-mono ${fontSizeObj.textClass} overflow-x-auto flex`}>
                          {showLineNumbers && (
                            <div className={`select-none text-right pr-4 border-r ${currentStyle.lineNoBorder} ${currentStyle.lineNoText} font-mono select-none w-8 sm:w-10 shrink-0 ${fontSizeObj.leading}`}>
                              {lines.map((_, i) => (
                                <div key={i}>{i + 1}</div>
                              ))}
                            </div>
                          )}

                          <pre className={`flex-1 pl-4 ${fontSizeObj.leading} overflow-visible !m-0 !p-0 !bg-transparent ${currentStyle.textColor}`}>
                            <code
                              ref={previewRef}
                              className={`language-${language} theme-${theme} whitespace-pre`}
                              dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
                            />
                          </pre>
                        </div>

                        {/* Interactive Drag Resize Handle */}
                        <div
                          data-snapshot-exclude="true"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsResizing(true);
                          }}
                          onTouchStart={(e) => {
                            setIsResizing(true);
                          }}
                          className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center hover:bg-indigo-500/20 group transition-colors select-none touch-none"
                          title="Drag to resize screenshot width"
                        >
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Export & Action Toolbar */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={downloadSnapshot}
                      disabled={exporting}
                      className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold shadow-md transition-all ${
                        exporting
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white cursor-pointer hover:shadow-indigo-200'
                      }`}
                    >
                      {exporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generating Snapshot...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          Download Snapshot (PNG)
                        </>
                      )}
                    </button>

                    <button
                      onClick={copyImage}
                      disabled={copyingImage || exporting}
                      className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold border transition-all ${
                        copiedImage
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <ImageBtnIcon className={`w-4 h-4 ${copyingImage ? 'animate-spin' : ''}`} />
                      {imageBtnLabel}
                    </button>
                  </div>

                  {copyNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 text-xs rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-center font-medium"
                    >
                      {copyNotice}
                    </motion.div>
                  )}

                  {isTerminal && (
                    <button
                      onClick={copyCommands}
                      disabled={!commandText}
                      title="Copy only executable commands, excluding prompts and output"
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold border transition-all ${
                        copiedCommands
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer'
                      }`}
                    >
                      {copiedCommands ? <Check className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                      {copiedCommands ? 'Commands Copied!' : 'Copy Commands Only'}
                    </button>
                  )}

                  {/* Secondary Export Formats Matrix */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={copyRaw}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        copiedRaw
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-slate-50'
                      }`}
                    >
                      {copiedRaw ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Raw Code
                    </button>

                    <button
                      onClick={copyHtml}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        copiedHtml
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-slate-50'
                      }`}
                    >
                      {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                      HTML Code
                    </button>

                    <button
                      onClick={copyRich}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        copiedRich
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-slate-50'
                      }`}
                    >
                      {copiedRich ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      Rich Text
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
