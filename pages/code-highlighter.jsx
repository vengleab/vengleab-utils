import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import CodeHighlighterStorage from '../utils/storage/CodeHighlighter';

const LANGUAGES = [
  { name: 'JavaScript', id: 'javascript', prismId: 'javascript' },
  { name: 'TypeScript', id: 'typescript', prismId: 'typescript' },
  { name: 'HTML / XML', id: 'html', prismId: 'markup' },
  { name: 'CSS', id: 'css', prismId: 'css' },
  { name: 'Python', id: 'python', prismId: 'python' },
  { name: 'SQL', id: 'sql', prismId: 'sql' },
  { name: 'Java', id: 'java', prismId: 'java' },
  { name: 'C++', id: 'cpp', prismId: 'cpp' },
  { name: 'Bash / Shell', id: 'bash', prismId: 'bash' },
  { name: 'YAML', id: 'yaml', prismId: 'yaml' },
  { name: 'JSON', id: 'json', prismId: 'json' },
  { name: 'Markdown', id: 'markdown', prismId: 'markdown' },
];

const THEMES = [
  { name: 'Default (Light)', id: 'default', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css' },
  { name: 'Tomorrow Night (Dark)', id: 'tomorrow', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css' },
  { name: 'Okaidia / Monokai', id: 'okaidia', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css' },
  { name: 'Twilight (Retro Dark)', id: 'twilight', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-twilight.min.css' },
  { name: 'Solarized Light', id: 'solarized', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-solarizedlight.min.css' },
];

const SNAPSHOT_BACKGROUNDS = [
  { name: 'Sunset Glow', id: 'sunset', class: 'bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600' },
  { name: 'Deep Ocean', id: 'ocean', class: 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600' },
  { name: 'Aurora Green', id: 'aurora', class: 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-500' },
  { name: 'Dark Steel', id: 'steel', class: 'bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900' },
  { name: 'None (Transparent)', id: 'none', class: 'bg-transparent border border-dashed border-slate-200/50' },
];

// Terminal mode palettes. Values are raw hex because they are applied as inline
// styles (Tailwind cannot generate classes from runtime values).
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
    name: 'Ubuntu',
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

// Line markers the terminal editor toolbar writes/strips at the start of a line.
const TERMINAL_LINE_TYPES = [
  {
    id: 'command', name: 'Command', prefix: '$ ', Icon: ChevronRight,
  },
  {
    id: 'continuation', name: 'Continued', prefix: '> ', Icon: CornerDownRight,
  },
  {
    id: 'output', name: 'Output', prefix: '', Icon: AlignLeft,
  },
  {
    id: 'comment', name: 'Comment', prefix: '# ', Icon: Hash,
  },
  {
    id: 'success', name: 'Success', prefix: '+ ', Icon: Check,
  },
  {
    id: 'error', name: 'Error', prefix: '! ', Icon: AlertTriangle,
  },
];

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
    bg: 'bg-[#f5f2f0]',
    headerBg: 'bg-[#e1dfdd]',
    textColor: 'text-[#333333]',
    headerText: 'text-[#666666]',
    borderColor: 'border-[#d8d6d4]',
    lineNoBorder: 'border-[#d8d6d4]',
    lineNoText: 'text-[#90a4ae]',
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
.theme-okaidia .token.cdata {
  color: #75715e !important;
  font-style: italic !important;
}
.theme-okaidia .token.punctuation {
  color: #f8f8f2 !important;
}
.theme-okaidia .token.property,
.theme-okaidia .token.tag,
.theme-okaidia .token.constant,
.theme-okaidia .token.symbol,
.theme-okaidia .token.deleted {
  color: #f92672 !important;
}
.theme-okaidia .token.boolean,
.theme-okaidia .token.number {
  color: #ae81ff !important;
}
.theme-okaidia .token.selector,
.theme-okaidia .token.attr-name,
.theme-okaidia .token.string,
.theme-okaidia .token.char,
.theme-okaidia .token.inserted {
  color: #e6db74 !important;
}
.theme-okaidia .token.operator,
.theme-okaidia .token.entity,
.theme-okaidia .token.url {
  color: #f92672 !important;
}
.theme-okaidia .token.atrule,
.theme-okaidia .token.attr-value,
.theme-okaidia .token.class-name {
  color: #66d9ef !important;
}
.theme-okaidia .token.function {
  color: #a6e22e !important;
}
.theme-okaidia .token.keyword {
  color: #f92672 !important;
  font-weight: bold !important;
}
.theme-okaidia .token.regex,
.theme-okaidia .token.important,
.theme-okaidia .token.variable {
  color: #fd971f !important;
}
.theme-okaidia .token.builtin {
  color: #66d9ef !important;
}

/* Tomorrow Night Overrides */
.theme-tomorrow .token.comment,
.theme-tomorrow .token.prolog,
.theme-tomorrow .token.doctype,
.theme-tomorrow .token.cdata {
  color: #969896 !important;
  font-style: italic !important;
}
.theme-tomorrow .token.punctuation {
  color: #cccccc !important;
}
.theme-tomorrow .token.property,
.theme-tomorrow .token.tag,
.theme-tomorrow .token.constant,
.theme-tomorrow .token.symbol,
.theme-tomorrow .token.deleted {
  color: #cc6666 !important;
}
.theme-tomorrow .token.boolean,
.theme-tomorrow .token.number {
  color: #de935f !important;
}
.theme-tomorrow .token.selector,
.theme-tomorrow .token.attr-name,
.theme-tomorrow .token.string,
.theme-tomorrow .token.char,
.theme-tomorrow .token.builtin,
.theme-tomorrow .token.inserted {
  color: #b5bd68 !important;
}
.theme-tomorrow .token.operator,
.theme-tomorrow .token.entity,
.theme-tomorrow .token.url {
  color: #8abeb7 !important;
}
.theme-tomorrow .token.atrule,
.theme-tomorrow .token.attr-value,
.theme-tomorrow .token.keyword,
.theme-tomorrow .token.class-name {
  color: #b294bb !important;
}
.theme-tomorrow .token.function {
  color: #81a2be !important;
}
.theme-tomorrow .token.regex,
.theme-tomorrow .token.important,
.theme-tomorrow .token.variable {
  color: #de935f !important;
}

/* Twilight Overrides */
.theme-twilight .token.comment,
.theme-twilight .token.prolog,
.theme-twilight .token.doctype,
.theme-twilight .token.cdata {
  color: #5f5a60 !important;
  font-style: italic !important;
}
.theme-twilight .token.punctuation {
  color: #f8f8f8 !important;
}
.theme-twilight .token.property,
.theme-twilight .token.tag,
.theme-twilight .token.constant,
.theme-twilight .token.symbol,
.theme-twilight .token.deleted {
  color: #cf6a4c !important;
}
.theme-twilight .token.boolean,
.theme-twilight .token.number {
  color: #cf6a4c !important;
}
.theme-twilight .token.selector,
.theme-twilight .token.attr-name,
.theme-twilight .token.string,
.theme-twilight .token.char,
.theme-twilight .token.builtin,
.theme-twilight .token.inserted {
  color: #8f9d6a !important;
}
.theme-twilight .token.operator,
.theme-twilight .token.entity,
.theme-twilight .token.url {
  color: #cda869 !important;
}
.theme-twilight .token.atrule,
.theme-twilight .token.attr-value,
.theme-twilight .token.keyword,
.theme-twilight .token.class-name {
  color: #f9ee98 !important;
}
.theme-twilight .token.function {
  color: #9b703f !important;
}
.theme-twilight .token.regex,
.theme-twilight .token.important,
.theme-twilight .token.variable {
  color: #7587a6 !important;
}

/* Solarized Light Overrides */
.theme-solarized .token.comment,
.theme-solarized .token.prolog,
.theme-solarized .token.doctype,
.theme-solarized .token.cdata {
  color: #93a1a1 !important;
  font-style: italic !important;
}
.theme-solarized .token.punctuation {
  color: #586e75 !important;
}
.theme-solarized .token.property,
.theme-solarized .token.tag,
.theme-solarized .token.constant,
.theme-solarized .token.symbol,
.theme-solarized .token.deleted {
  color: #268bd2 !important;
}
.theme-solarized .token.boolean,
.theme-solarized .token.number {
  color: #b58900 !important;
}
.theme-solarized .token.selector,
.theme-solarized .token.attr-name,
.theme-solarized .token.string,
.theme-solarized .token.char,
.theme-solarized .token.builtin,
.theme-solarized .token.inserted {
  color: #859900 !important;
}
.theme-solarized .token.operator,
.theme-solarized .token.entity,
.theme-solarized .token.url {
  color: #93a1a1 !important;
}
.theme-solarized .token.atrule,
.theme-solarized .token.attr-value,
.theme-solarized .token.function,
.theme-solarized .token.class-name {
  color: #268bd2 !important;
}
.theme-solarized .token.keyword {
  color: #859900 !important;
}
.theme-solarized .token.regex,
.theme-solarized .token.important,
.theme-solarized .token.variable {
  color: #cb4b16 !important;
}

/* Default Light Overrides */
.theme-default .token.comment,
.theme-default .token.prolog,
.theme-default .token.doctype,
.theme-default .token.cdata {
  color: #708090 !important;
  font-style: italic !important;
}
.theme-default .token.punctuation {
  color: #999999 !important;
}
.theme-default .token.property,
.theme-default .token.tag,
.theme-default .token.boolean,
.theme-default .token.number,
.theme-default .token.constant,
.theme-default .token.symbol,
.theme-default .token.deleted {
  color: #990055 !important;
}
.theme-default .token.selector,
.theme-default .token.attr-name,
.theme-default .token.string,
.theme-default .token.char,
.theme-default .token.builtin,
.theme-default .token.inserted {
  color: #669900 !important;
}
.theme-default .token.operator,
.theme-default .token.entity,
.theme-default .token.url {
  color: #9a6e3a !important;
}
.theme-default .token.atrule,
.theme-default .token.attr-value,
.theme-default .token.keyword,
.theme-default .token.class-name {
  color: #0077aa !important;
}
.theme-default .token.function {
  color: #dd4a68 !important;
}
.theme-default .token.regex,
.theme-default .token.important,
.theme-default .token.variable {
  color: #ee9900 !important;
}
`;

const DEFAULT_CODE = `// Example JavaScript function
function greetUser(name = "Developer") {
  const currentHour = new Date().getHours();
  let greeting = "Hello";
  
  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }
  
  console.log(greeting + ", " + name + "!");
  return { message: greeting, date: new Date() };
}`;

const DEFAULT_PROMPT = 'user@macbook ~ %';

const DEFAULT_TERMINAL = `# install dependencies first
$ npm install
added 214 packages in 3.2s

$ npm run build
   ▲ Next.js 15.0.0
+ Compiled successfully
+ Generating static pages (14/14)

Route (pages)                Size     First Load JS
┌ ○ /                        2.1 kB          92.4 kB
└ ○ /code-highlighter        4.8 kB         104.0 kB

$ docker run -d \\
    --name toolkit \\
    -p 3001:3001 \\
    vengleab/util:latest
! Error: missing DEPLOY_TOKEN`;

// Lines are typed by their leading marker: "$" command, ">" continuation,
// "#" comment, "+" success, "!" error. Anything else is plain command output,
// except a line following a command that ends in "\" — the shell's own way of
// spelling a multi-line command, so it continues without needing a marker.
const parseTerminalLines = (text) => {
  let continuing = false;

  return text.split('\n').map((line) => {
    const trimmed = line.trimStart();
    const marker = TERMINAL_MARKER_RE.test(trimmed) ? trimmed[0] : null;
    const content = marker ? trimmed.slice(1).trimStart() : line;
    let type = MARKER_TYPES[marker];

    if (!type) type = continuing ? 'continuation' : 'output';

    continuing = (type === 'command' || type === 'continuation')
      && content.trimEnd().endsWith('\\');

    return { type, content: type === 'comment' ? trimmed : content };
  });
};

export default function CodeHighlighter() {
  const [mode, setMode] = useState('code');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('tomorrow');
  const [snapshotBg, setSnapshotBg] = useState('sunset');
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const [terminalText, setTerminalText] = useState(DEFAULT_TERMINAL);
  const [terminalTheme, setTerminalTheme] = useState('macos');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  const [prismLoaded, setPrismLoaded] = useState(false);
  const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);
  const [loadedLanguages, setLoadedLanguages] = useState(new Set(['javascript', 'markup', 'css', 'clike']));

  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedRich, setCopiedRich] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);
  const [exporting, setExporting] = useState(false);

  const previewRef = useRef(null);
  const textareaRef = useRef(null);

  // Load external scripts dynamically on mount
  useEffect(() => {
    const savedCode = CodeHighlighterStorage.get('codeText');
    const savedLang = CodeHighlighterStorage.get('language');
    const savedTheme = CodeHighlighterStorage.get('theme');
    const savedLines = CodeHighlighterStorage.get('lineNumbers');
    const savedBg = CodeHighlighterStorage.get('snapshotBg');
    const savedMode = CodeHighlighterStorage.get('mode');
    const savedTerminal = CodeHighlighterStorage.get('terminalText');
    const savedTerminalTheme = CodeHighlighterStorage.get('terminalTheme');
    const savedPrompt = CodeHighlighterStorage.get('prompt');

    if (savedCode) setCode(savedCode);
    if (savedLang) setLanguage(savedLang);
    if (savedTheme) setTheme(savedTheme);
    if (savedLines) setShowLineNumbers(savedLines === 'true');
    if (savedBg) setSnapshotBg(savedBg);
    if (savedMode) setMode(savedMode);
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
      script.onload = () => {
        setPrismLoaded(true);
      };
      document.body.appendChild(script);
    };

    const loadHtml2Canvas = () => {
      if (window.html2canvas) {
        setHtml2canvasLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = () => {
        setHtml2canvasLoaded(true);
      };
      document.body.appendChild(script);
    };

    loadPrismCore();
    loadHtml2Canvas();
  }, []);

  // Update theme stylesheet links in the head dynamically
  useEffect(() => {
    const selectedTheme = THEMES.find((t) => t.id === theme) || THEMES[1];

    // Remove existing themes
    const existingThemes = document.querySelectorAll('link[data-prism-theme]');
    existingThemes.forEach((el) => el.remove());

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = selectedTheme.url;
    link.setAttribute('data-prism-theme', theme);
    document.head.appendChild(link);

    CodeHighlighterStorage.set('theme', theme);
  }, [theme]);

  // Load language component script if not already loaded
  useEffect(() => {
    const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
    const targetPrismId = currentLang.prismId;

    if (!prismLoaded || loadedLanguages.has(targetPrismId)) return;

    const script = document.createElement('script');
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${targetPrismId}.min.js`;
    script.onload = () => {
      setLoadedLanguages((prev) => new Set([...prev, targetPrismId]));
    };
    document.body.appendChild(script);
  }, [language, prismLoaded, loadedLanguages]);

  const termStyle = TERMINAL_THEMES.find((t) => t.id === terminalTheme) || TERMINAL_THEMES[0];
  const isTerminal = mode === 'terminal';
  const activeText = isTerminal ? terminalText : code;

  const handleModeChange = (next) => {
    setMode(next);
    CodeHighlighterStorage.set('mode', next);
  };

  const handleTerminalChange = (e) => {
    setTerminalText(e.target.value);
    CodeHighlighterStorage.set('terminalText', e.target.value);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    CodeHighlighterStorage.set('prompt', e.target.value);
  };

  // Re-mark every line touched by the cursor/selection with the chosen format.
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

  const handleTerminalThemeChange = (e) => {
    setTerminalTheme(e.target.value);
    CodeHighlighterStorage.set('terminalTheme', e.target.value);
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

      // Insert 2 spaces for tab
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
        e.target.selectionStart = start + 2;
        e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleLangChange = (e) => {
    setLanguage(e.target.value);
    CodeHighlighterStorage.set('language', e.target.value);
  };

  const toggleLineNumbers = () => {
    const next = !showLineNumbers;
    setShowLineNumbers(next);
    CodeHighlighterStorage.set('lineNumbers', String(next));
  };

  // Perform highlighting with fallback
  const getHighlightedCode = () => {
    const activeLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

    if (prismLoaded && window.Prism && window.Prism.languages[activeLang.prismId]) {
      try {
        return window.Prism.highlight(
          code,
          window.Prism.languages[activeLang.prismId],
          activeLang.prismId,
        );
      } catch (err) {
        return code;
      }
    }
    return code; // Fallback plain text
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
      let background = theme === 'default' || theme === 'solarized' ? '#f5f2f0' : '#2d2d2d';
      let color = theme === 'default' || theme === 'solarized' ? '#000' : '#ccc';

      if (isTerminal) {
        background = termStyle.bg;
        color = termStyle.output;
      }

      const cleanHtml = `<pre style="font-family: monospace; font-size: 14px; padding: 16px; border-radius: 8px; background: ${background}; color: ${color}">${innerHtml}</pre>`;

      const blobHtml = new Blob([cleanHtml], { type: 'text/html' });
      const blobText = new Blob([activeText], { type: 'text/plain' });

      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      });

      await navigator.clipboard.write([item]);
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2000);
    } catch (err) {
      copyRaw();
    }
  };

  // Capture the snapshot container as a crisp retina canvas
  const captureSnapshot = () => {
    const target = document.getElementById('snapshot-capture-area');
    if (!html2canvasLoaded || !window.html2canvas || !target) {
      return Promise.reject(new Error('Snapshot renderer is not ready'));
    }

    // Let the pending state paint before html2canvas walks the DOM
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        window.html2canvas(target, {
          scale: 3, // Retina resolution export
          useCORS: true,
          backgroundColor: null, // Supports transparent backgrounds
          logging: false,
        })
          .then(resolve)
          .catch(reject);
      }, 150);
    });
  };

  const downloadSnapshot = () => {
    setExporting(true);

    captureSnapshot()
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = isTerminal ? 'terminal-snapshot.png' : `code-snapshot-${language}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      })
      .catch(() => {})
      .then(() => setExporting(false));
  };

  const copyImage = () => {
    setCopyingImage(true);

    captureSnapshot()
      .then((canvas) => new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Empty canvas'))), 'image/png');
      }))
      .then((blob) => navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]))
      .then(() => {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      })
      .catch(() => {})
      .then(() => setCopyingImage(false));
  };

  let ImageBtnIcon = ImageIcon;
  let imageBtnLabel = 'Copy Image to Clipboard (PNG)';
  if (copyingImage) {
    ImageBtnIcon = RefreshCw;
    imageBtnLabel = 'Copying Image...';
  } else if (copiedImage) {
    ImageBtnIcon = Check;
    imageBtnLabel = 'Image Copied!';
  }

  const lines = code.split('\n');
  const terminalLines = parseTerminalLines(terminalText);

  // Just the runnable part of the session — no prompts, comments, or output
  const commandText = terminalLines
    .filter((line) => line.type === 'command' || line.type === 'continuation')
    .map((line) => line.content)
    .join('\n');

  const copyCommands = () => {
    navigator.clipboard.writeText(commandText);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2000);
  };
  const selectedBgClass = SNAPSHOT_BACKGROUNDS.find((bg) => bg.id === snapshotBg)?.class || SNAPSHOT_BACKGROUNDS[0].class;
  const currentStyle = THEME_STYLING[theme] || THEME_STYLING.tomorrow;

  return (
    <PageContext.Provider value={{ activeItem: PAGE.CODE_HIGHLIGHTER }}>
      <Layout title="Code Highlighter">
        <style dangerouslySetInnerHTML={{ __html: THEME_CSS }} />
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Terminal className="w-6 h-6 text-indigo-600" />
              </div>
              Code Highlighter & Snapshot
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Beautify code snippets with high-fidelity syntax highlighting, or mock up a terminal
              session with commands and their output. Export beautiful macOS-styled image snapshots
              or copy formatted HTML/Rich Text in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />

                <div className="flex flex-col space-y-6">
                  {/* Mode switch */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                    {[
                      { id: 'code', name: 'Code Snippet', Icon: Code },
                      { id: 'terminal', name: 'Terminal Session', Icon: Terminal },
                    ].map(({ id, name, Icon }) => (
                      <button
                        key={id}
                        onClick={() => handleModeChange(id)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                          mode === id
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {name}
                      </button>
                    ))}
                  </div>

                  {/* Option controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {isTerminal ? (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Prompt
                        </label>
                        <input
                          type="text"
                          value={prompt}
                          onChange={handlePromptChange}
                          placeholder="user@macbook ~ %"
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                          spellCheck={false}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Language
                        </label>
                        <select
                          value={language}
                          onChange={handleLangChange}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Visual Theme
                      </label>
                      {isTerminal ? (
                        <select
                          value={terminalTheme}
                          onChange={handleTerminalThemeChange}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
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
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                        >
                          {THEMES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Canvas Background
                      </label>
                      <select
                        value={snapshotBg}
                        onChange={(e) => {
                          setSnapshotBg(e.target.value);
                          CodeHighlighterStorage.set('snapshotBg', e.target.value);
                        }}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        {SNAPSHOT_BACKGROUNDS.map((bg) => (
                          <option key={bg.id} value={bg.id}>
                            {bg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isTerminal ? (
                    <div className="py-3 border-y border-slate-100 space-y-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Line Format
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Applies to the line(s) at your cursor
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {TERMINAL_LINE_TYPES.map(({
                          id, name, prefix, Icon,
                        }) => (
                          <button
                            key={id}
                            onClick={() => applyLineFormat(prefix)}
                            title={`Mark the selected line(s) as ${name.toLowerCase()}`}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all cursor-pointer"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {name}
                            <span className="font-mono text-[10px] text-slate-400">
                              {prefix.trim() || '—'}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        A command ending in
                        {' '}
                        <code className="px-1 py-0.5 bg-slate-100 rounded font-mono text-slate-500">\</code>
                        {' '}
                        continues onto the next line automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-2 border-y border-slate-100">
                      <span className="text-sm font-semibold text-slate-700">Display Line Numbers</span>
                      <button
                        onClick={toggleLineNumbers}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          showLineNumbers ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            showLineNumbers ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Textarea */}
                  <div className="space-y-2 flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {isTerminal ? 'Input Terminal Session' : 'Input Code Snippet'}
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={activeText}
                      onChange={isTerminal ? handleTerminalChange : handleCodeChange}
                      onKeyDown={handleKeyDown}
                      placeholder={isTerminal ? '$ npm run build\nbuild finished in 3.2s' : 'Paste your source code here...'}
                      className="w-full min-h-[300px] p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-y"
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500" />

                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-500 shrink-0" />
                    Preview & Snapshot Box
                  </h3>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (isTerminal) {
                          setTerminalText('');
                          CodeHighlighterStorage.set('terminalText', '');
                        } else {
                          setCode('');
                          CodeHighlighterStorage.set('codeText', '');
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                      title={isTerminal ? 'Clear session' : 'Clear code'}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* macOS Style Live Window Snippet Area (for Snapshot & Preview) */}
                <div className="flex-1 overflow-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-center min-h-[350px]">
                  <div
                    id="snapshot-capture-area"
                    className={`p-6 sm:p-10 rounded-2xl flex items-center justify-center transition-all overflow-hidden ${selectedBgClass}`}
                  >
                    {isTerminal ? (
                      <div
                        className="w-full rounded-xl shadow-2xl overflow-hidden border select-none text-left"
                        style={{ backgroundColor: termStyle.bg, borderColor: termStyle.border }}
                      >
                        {/* Terminal Header Toolbar */}
                        <div
                          className="flex items-center justify-between px-4 py-3 border-b select-none"
                          style={{
                            backgroundColor: termStyle.headerBg,
                            borderColor: termStyle.border,
                          }}
                        >
                          <div className="flex gap-1.5 shrink-0">
                            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                          </div>
                          <div
                            className="text-[10px] font-bold tracking-wider uppercase font-mono truncate px-4"
                            style={{ color: termStyle.title }}
                          >
                            {prompt || 'bash'}
                          </div>
                          <div className="w-12 shrink-0" />
                        </div>

                        {/* Session Transcript */}
                        <div
                          ref={previewRef}
                          className="p-6 font-mono text-[13px] sm:text-[14px] leading-relaxed"
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
                                {line.content || ' '}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                    <div className={`w-full rounded-xl shadow-2xl overflow-hidden border ${currentStyle.bg} ${currentStyle.borderColor} select-none text-left`}>
                      {/* Window Header Toolbar */}
                      <div className={`flex items-center justify-between px-4 py-3 ${currentStyle.headerBg} border-b ${currentStyle.borderColor} select-none`}>
                        <div className="flex gap-1.5 shrink-0">
                          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                        </div>
                        <div className={`text-[10px] font-bold tracking-wider uppercase font-mono truncate px-4 ${currentStyle.headerText}`}>
                          {LANGUAGES.find((l) => l.id === language)?.name || 'Code'}
                        </div>
                        <div className="w-12 shrink-0" />
                      </div>

                      {/* Highlights Code View */}
                      <div className="p-6 font-mono text-[14px] sm:text-[15px] overflow-x-auto flex">
                        {showLineNumbers && (
                          <div className={`select-none text-right pr-4 border-r ${currentStyle.lineNoBorder} ${currentStyle.lineNoText} font-mono select-none w-9 shrink-0 text-xs leading-relaxed`}>
                            {lines.map((_, i) => (
                              <div key={i}>
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        )}

                        <pre className={`flex-1 pl-4 leading-relaxed overflow-visible !m-0 !p-0 !bg-transparent ${currentStyle.textColor}`}>
                          <code
                            ref={previewRef}
                            className={`language-${language} theme-${theme} whitespace-pre`}
                            dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
                          />
                        </pre>
                      </div>
                    </div>
                    )}
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="space-y-3 mt-6">
                  <button
                    onClick={downloadSnapshot}
                    disabled={!html2canvasLoaded || exporting}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold shadow-md transition-all ${
                      exporting
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white cursor-pointer'
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
                        Download Snapshot Image (PNG)
                      </>
                    )}
                  </button>

                  <button
                    onClick={copyImage}
                    disabled={!html2canvasLoaded || copyingImage || exporting}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                      copiedImage
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
                    }`}
                  >
                    <ImageBtnIcon className={`w-4 h-4 ${copyingImage ? 'animate-spin' : ''}`} />
                    {imageBtnLabel}
                  </button>

                  {isTerminal && (
                    <button
                      onClick={copyCommands}
                      disabled={!commandText}
                      title="Copy only the commands, ready to paste into a shell"
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                        copiedCommands
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
                      }`}
                    >
                      {copiedCommands
                        ? <Check className="w-4 h-4" />
                        : <Terminal className="w-4 h-4" />}
                      {copiedCommands ? 'Commands Copied!' : 'Copy Commands to Run'}
                    </button>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={copyRaw}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        copiedRaw
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                    >
                      {copiedRaw ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      Raw
                    </button>

                    <button
                      onClick={copyHtml}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        copiedHtml
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                    >
                      {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                      HTML
                    </button>

                    <button
                      onClick={copyRich}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        copiedRich
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
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
