import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Keyboard,
  RotateCcw,
  Volume2,
  VolumeX,
  Sliders,
  History,
  HelpCircle,
  Settings,
  Flame,
  CheckCircle,
  Terminal,
  Layers,
  Sparkles,
  Grid,
} from 'lucide-react';
import shortid from 'shortid';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';

// Layout theme configurations
const THEMES = [
  {
    id: 'mint',
    name: 'Emerald Mint',
    activeClass: 'bg-amber-400 text-slate-900 border-amber-500 shadow-lg shadow-amber-400/20 scale-[0.98]',
    testedClass: 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/10',
    keyBorderColor: 'border-slate-200 hover:border-slate-400',
    bannerClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    indicatorColor1: 'bg-amber-400',
    indicatorColor2: 'bg-emerald-500',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    activeClass: 'bg-fuchsia-500 text-white border-fuchsia-600 shadow-lg shadow-fuchsia-500/30 scale-[0.98]',
    testedClass: 'bg-cyan-500 text-white border-cyan-600 shadow-md shadow-cyan-500/10',
    keyBorderColor: 'border-slate-200 hover:border-slate-400',
    bannerClass: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100',
    indicatorColor1: 'bg-fuchsia-500',
    indicatorColor2: 'bg-cyan-500',
  },
  {
    id: 'retro',
    name: 'Retro Gray',
    activeClass: 'bg-orange-400 text-white border-orange-500 shadow-lg shadow-orange-400/20 scale-[0.98]',
    testedClass: 'bg-slate-700 text-white border-slate-800 shadow-md shadow-slate-700/10',
    keyBorderColor: 'border-slate-300 hover:border-slate-500',
    bannerClass: 'text-orange-600 bg-orange-50 border-orange-100',
    indicatorColor1: 'bg-orange-400',
    indicatorColor2: 'bg-slate-700',
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    activeClass: 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-lg shadow-yellow-400/20 scale-[0.98]',
    testedClass: 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/10',
    keyBorderColor: 'border-slate-200 hover:border-slate-400',
    bannerClass: 'text-yellow-600 bg-yellow-50 border-yellow-100',
    indicatorColor1: 'bg-yellow-400',
    indicatorColor2: 'bg-indigo-600',
  },
];

// Sound synthesis via Web Audio API
const playKeySound = (profile, isMuted, volume = 0.5) => {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.35, now);
    masterGain.connect(ctx.destination);

    if (profile === 'clicky') {
      // High-frequency mechanical contact click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(1700, now);
      clickOsc.frequency.exponentialRampToValueAtTime(1100, now + 0.006);

      clickGain.gain.setValueAtTime(0.7, now);
      clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.008);

      clickOsc.connect(clickGain);
      clickGain.connect(masterGain);
      clickOsc.start(now);
      clickOsc.stop(now + 0.01);

      // Deeper standard bottom out switch body thump
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(120, now + 0.001);
      thudOsc.frequency.exponentialRampToValueAtTime(70, now + 0.035);

      thudGain.gain.setValueAtTime(0.5, now + 0.001);
      thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      thudOsc.connect(thudGain);
      thudGain.connect(masterGain);
      thudOsc.start(now + 0.001);
      thudOsc.stop(now + 0.042);
    } else if (profile === 'tactile') {
      // Deeper tactile bump sound
      const bumpOsc = ctx.createOscillator();
      const bumpGain = ctx.createGain();
      bumpOsc.type = 'triangle';
      bumpOsc.frequency.setValueAtTime(200, now);
      bumpOsc.frequency.exponentialRampToValueAtTime(110, now + 0.03);

      bumpGain.gain.setValueAtTime(0.65, now);
      bumpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);

      bumpOsc.connect(bumpGain);
      bumpGain.connect(masterGain);
      bumpOsc.start(now);
      bumpOsc.stop(now + 0.04);

      // Low end resonance
      const lowOsc = ctx.createOscillator();
      const lowGain = ctx.createGain();
      lowOsc.type = 'sine';
      lowOsc.frequency.setValueAtTime(95, now);
      lowOsc.frequency.exponentialRampToValueAtTime(55, now + 0.045);

      lowGain.gain.setValueAtTime(0.35, now);
      lowGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      lowOsc.connect(lowGain);
      lowGain.connect(masterGain);
      lowOsc.start(now);
      lowOsc.stop(now + 0.052);
    } else { // "linear"
      // Quiet, smooth sliding travel click
      const strokeOsc = ctx.createOscillator();
      const strokeGain = ctx.createGain();
      strokeOsc.type = 'triangle';
      strokeOsc.frequency.setValueAtTime(140, now);
      strokeOsc.frequency.exponentialRampToValueAtTime(75, now + 0.045);

      strokeGain.gain.setValueAtTime(0.55, now);
      strokeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      strokeOsc.connect(strokeGain);
      strokeGain.connect(masterGain);
      strokeOsc.start(now);
      strokeOsc.stop(now + 0.052);
    }
  } catch (err) {
    /* eslint-disable-next-line no-console */
    console.error('Sound synth error:', err);
  }
};

// --- MACBOOK PRO KEYBOARD LAYOUT ---
const MAC_LAYOUT = [
  // Row 0 (Function Keys)
  [
    { code: 'Escape', label: 'esc', width: 1.25 },
    { code: 'F1', label: 'F1', width: 1 },
    { code: 'F2', label: 'F2', width: 1 },
    { code: 'F3', label: 'F3', width: 1 },
    { code: 'F4', label: 'F4', width: 1 },
    { code: 'F5', label: 'F5', width: 1 },
    { code: 'F6', label: 'F6', width: 1 },
    { code: 'F7', label: 'F7', width: 1 },
    { code: 'F8', label: 'F8', width: 1 },
    { code: 'F9', label: 'F9', width: 1 },
    { code: 'F10', label: 'F10', width: 1 },
    { code: 'F11', label: 'F11', width: 1 },
    { code: 'F12', label: 'F12', width: 1 },
    { code: 'F13', label: 'Touch ID', width: 1.25 },
  ],
  // Row 1 (Number row)
  [
    { code: 'Backquote', label: '~\n`', width: 1 },
    { code: 'Digit1', label: '!\n1', width: 1 },
    { code: 'Digit2', label: '@\n2', width: 1 },
    { code: 'Digit3', label: '#\n3', width: 1 },
    { code: 'Digit4', label: '$\n4', width: 1 },
    { code: 'Digit5', label: '%\n5', width: 1 },
    { code: 'Digit6', label: '^\n6', width: 1 },
    { code: 'Digit7', label: '&\n7', width: 1 },
    { code: 'Digit8', label: '*\n8', width: 1 },
    { code: 'Digit9', label: '(\n9', width: 1 },
    { code: 'Digit0', label: ')\n0', width: 1 },
    { code: 'Minus', label: '_\n-', width: 1 },
    { code: 'Equal', label: '+\n=', width: 1 },
    { code: 'Backspace', label: 'delete', width: 1.5 },
  ],
  // Row 2 (Tab and top letters)
  [
    { code: 'Tab', label: 'tab', width: 1.5 },
    { code: 'KeyQ', label: 'Q', width: 1 },
    { code: 'KeyW', label: 'W', width: 1 },
    { code: 'KeyE', label: 'E', width: 1 },
    { code: 'KeyR', label: 'R', width: 1 },
    { code: 'KeyT', label: 'T', width: 1 },
    { code: 'KeyY', label: 'Y', width: 1 },
    { code: 'KeyU', label: 'U', width: 1 },
    { code: 'KeyI', label: 'I', width: 1 },
    { code: 'KeyO', label: 'O', width: 1 },
    { code: 'KeyP', label: 'P', width: 1 },
    { code: 'BracketLeft', label: '{\n[', width: 1 },
    { code: 'BracketRight', label: '}\n]', width: 1 },
    { code: 'Backslash', label: '|\n\\', width: 1 },
  ],
  // Row 3 (Caps lock and middle letters)
  [
    { code: 'CapsLock', label: 'caps lock', width: 1.85 },
    { code: 'KeyA', label: 'A', width: 1 },
    { code: 'KeyS', label: 'S', width: 1 },
    { code: 'KeyD', label: 'D', width: 1 },
    { code: 'KeyF', label: 'F', width: 1 },
    { code: 'KeyG', label: 'G', width: 1 },
    { code: 'KeyH', label: 'H', width: 1 },
    { code: 'KeyJ', label: 'J', width: 1 },
    { code: 'KeyK', label: 'K', width: 1 },
    { code: 'KeyL', label: 'L', width: 1 },
    { code: 'Semicolon', label: ':\n;', width: 1 },
    { code: 'Quote', label: "\"\n'", width: 1 },
    { code: 'Enter', label: 'return', width: 1.65 },
  ],
  // Row 4 (Shift and bottom letters)
  [
    { code: 'ShiftLeft', label: 'shift', width: 2.35 },
    { code: 'KeyZ', label: 'Z', width: 1 },
    { code: 'KeyX', label: 'X', width: 1 },
    { code: 'KeyC', label: 'C', width: 1 },
    { code: 'KeyV', label: 'V', width: 1 },
    { code: 'KeyB', label: 'B', width: 1 },
    { code: 'KeyN', label: 'N', width: 1 },
    { code: 'KeyM', label: 'M', width: 1 },
    { code: 'Comma', label: '<\n,', width: 1 },
    { code: 'Period', label: '>\n.', width: 1 },
    { code: 'Slash', label: '?\n/', width: 1 },
    { code: 'ShiftRight', label: 'shift', width: 2.15 },
  ],
  // Row 5 (Bottom modifiers & space & arrow keys)
  [
    { code: 'Fn', label: 'fn', width: 1 },
    { code: 'ControlLeft', label: 'control', width: 1 },
    { code: 'AltLeft', label: 'option\n⌥', width: 1 },
    { code: 'MetaLeft', label: 'command\n⌘', width: 1.25 },
    { code: 'Space', label: '', width: 5.0 },
    { code: 'MetaRight', label: 'command\n⌘', width: 1.25 },
    { code: 'AltRight', label: 'option\n⌥', width: 1 },
    { code: 'ArrowLeft', label: '◀', width: 1 },
    {
      code: 'ArrowUpDown',
      type: 'split',
      width: 1,
      subkeys: [
        { code: 'ArrowUp', label: '▲' },
        { code: 'ArrowDown', label: '▼' },
      ],
    },
    { code: 'ArrowRight', label: '▶', width: 1 },
  ],
];

// --- WINDOWS COMPACT / ALPHANUMERIC BLOCKS ---
const WIN_ALPHA_LAYOUT = [
  // Row 0 (Function Keys)
  [
    { code: 'Escape', label: 'Esc', width: 1.25 },
    { type: 'spacer', width: 0.25 },
    { code: 'F1', label: 'F1', width: 1 },
    { code: 'F2', label: 'F2', width: 1 },
    { code: 'F3', label: 'F3', width: 1 },
    { code: 'F4', label: 'F4', width: 1 },
    { type: 'spacer', width: 0.25 },
    { code: 'F5', label: 'F5', width: 1 },
    { code: 'F6', label: 'F6', width: 1 },
    { code: 'F7', label: 'F7', width: 1 },
    { code: 'F8', label: 'F8', width: 1 },
    { type: 'spacer', width: 0.25 },
    { code: 'F9', label: 'F9', width: 1 },
    { code: 'F10', label: 'F10', width: 1 },
    { code: 'F11', label: 'F11', width: 1 },
    { code: 'F12', label: 'F12', width: 1 },
  ],
  // Row 1 (Number Row)
  [
    { code: 'Backquote', label: '~\n`', width: 1 },
    { code: 'Digit1', label: '!\n1', width: 1 },
    { code: 'Digit2', label: '@\n2', width: 1 },
    { code: 'Digit3', label: '#\n3', width: 1 },
    { code: 'Digit4', label: '$\n4', width: 1 },
    { code: 'Digit5', label: '%\n5', width: 1 },
    { code: 'Digit6', label: '^\n6', width: 1 },
    { code: 'Digit7', label: '&\n7', width: 1 },
    { code: 'Digit8', label: '*\n8', width: 1 },
    { code: 'Digit9', label: '(\n9', width: 1 },
    { code: 'Digit0', label: ')\n0', width: 1 },
    { code: 'Minus', label: '_\n-', width: 1 },
    { code: 'Equal', label: '+\n=', width: 1 },
    { code: 'Backspace', label: 'Backspace', width: 2 },
  ],
  // Row 2 (Tab Row)
  [
    { code: 'Tab', label: 'Tab', width: 1.5 },
    { code: 'KeyQ', label: 'Q', width: 1 },
    { code: 'KeyW', label: 'W', width: 1 },
    { code: 'KeyE', label: 'E', width: 1 },
    { code: 'KeyR', label: 'R', width: 1 },
    { code: 'KeyT', label: 'T', width: 1 },
    { code: 'KeyY', label: 'Y', width: 1 },
    { code: 'KeyU', label: 'U', width: 1 },
    { code: 'KeyI', label: 'I', width: 1 },
    { code: 'KeyO', label: 'O', width: 1 },
    { code: 'KeyP', label: 'P', width: 1 },
    { code: 'BracketLeft', label: '{\n[', width: 1 },
    { code: 'BracketRight', label: '}\n]', width: 1 },
    { code: 'Backslash', label: '|\n\\', width: 1.5 },
  ],
  // Row 3 (Caps Row)
  [
    { code: 'CapsLock', label: 'Caps Lock', width: 1.75 },
    { code: 'KeyA', label: 'A', width: 1 },
    { code: 'KeyS', label: 'S', width: 1 },
    { code: 'KeyD', label: 'D', width: 1 },
    { code: 'KeyF', label: 'F', width: 1 },
    { code: 'KeyG', label: 'G', width: 1 },
    { code: 'KeyH', label: 'H', width: 1 },
    { code: 'KeyJ', label: 'J', width: 1 },
    { code: 'KeyK', label: 'K', width: 1 },
    { code: 'KeyL', label: 'L', width: 1 },
    { code: 'Semicolon', label: ':\n;', width: 1 },
    { code: 'Quote', label: "\"\n'", width: 1 },
    { code: 'Enter', label: 'Enter', width: 2.25 },
  ],
  // Row 4 (Shift Row)
  [
    { code: 'ShiftLeft', label: 'Shift', width: 2.25 },
    { code: 'KeyZ', label: 'Z', width: 1 },
    { code: 'KeyX', label: 'X', width: 1 },
    { code: 'KeyC', label: 'C', width: 1 },
    { code: 'KeyV', label: 'V', width: 1 },
    { code: 'KeyB', label: 'B', width: 1 },
    { code: 'KeyN', label: 'N', width: 1 },
    { code: 'KeyM', label: 'M', width: 1 },
    { code: 'Comma', label: '<\n,', width: 1 },
    { code: 'Period', label: '>\n.', width: 1 },
    { code: 'Slash', label: '?\n/', width: 1 },
    { code: 'ShiftRight', label: 'Shift', width: 2.75 },
  ],
  // Row 5 (Bottom Row)
  [
    { code: 'ControlLeft', label: 'Ctrl', width: 1.25 },
    { code: 'MetaLeft', label: 'Win', width: 1.25 },
    { code: 'AltLeft', label: 'Alt', width: 1.25 },
    { code: 'Space', label: '', width: 6.25 },
    { code: 'AltRight', label: 'Alt', width: 1.25 },
    { code: 'MetaRight', label: 'Win', width: 1.25 },
    { code: 'ContextMenu', label: 'Menu', width: 1.25 },
    { code: 'ControlRight', label: 'Ctrl', width: 1.25 },
  ],
];

// --- WINDOWS NAVIGATION CLUSTER ---
const WIN_NAV_LAYOUT = [
  // Row 0
  [
    { code: 'PrintScreen', label: 'PrtSc', width: 1 },
    { code: 'ScrollLock', label: 'ScrLk', width: 1 },
    { code: 'Pause', label: 'Pause', width: 1 },
  ],
  // Row 1
  [
    { code: 'Insert', label: 'Ins', width: 1 },
    { code: 'Home', label: 'Home', width: 1 },
    { code: 'PageUp', label: 'PgUp', width: 1 },
  ],
  // Row 2
  [
    { code: 'Delete', label: 'Del', width: 1 },
    { code: 'End', label: 'End', width: 1 },
    { code: 'PageDown', label: 'PgDn', width: 1 },
  ],
  // Row 3 (Empty layout spacer)
  [
    { type: 'spacer', width: 1 },
    { type: 'spacer', width: 1 },
    { type: 'spacer', width: 1 },
  ],
  // Row 4
  [
    { type: 'spacer', width: 1 },
    { code: 'ArrowUp', label: '▲', width: 1 },
    { type: 'spacer', width: 1 },
  ],
  // Row 5
  [
    { code: 'ArrowLeft', label: '◀', width: 1 },
    { code: 'ArrowDown', label: '▼', width: 1 },
    { code: 'ArrowRight', label: '▶', width: 1 },
  ],
];

// --- WINDOWS NUMPAD CLUSTER (Absolute CSS Grid arrangement) ---
const WIN_NUMPAD_KEYS = [
  {
    code: 'NumLock', label: 'Num', col: 'col-start-1 col-span-1', row: 'row-start-1 row-span-1',
  },
  {
    code: 'NumpadDivide', label: '/', col: 'col-start-2 col-span-1', row: 'row-start-1 row-span-1',
  },
  {
    code: 'NumpadMultiply', label: '*', col: 'col-start-3 col-span-1', row: 'row-start-1 row-span-1',
  },
  {
    code: 'NumpadSubtract', label: '-', col: 'col-start-4 col-span-1', row: 'row-start-1 row-span-1',
  },

  {
    code: 'Numpad7', label: '7', col: 'col-start-1 col-span-1', row: 'row-start-2 row-span-1',
  },
  {
    code: 'Numpad8', label: '8', col: 'col-start-2 col-span-1', row: 'row-start-2 row-span-1',
  },
  {
    code: 'Numpad9', label: '9', col: 'col-start-3 col-span-1', row: 'row-start-2 row-span-1',
  },
  {
    code: 'NumpadAdd', label: '+', col: 'col-start-4 col-span-1', row: 'row-start-2 row-span-2',
  },

  {
    code: 'Numpad4', label: '4', col: 'col-start-1 col-span-1', row: 'row-start-3 row-span-1',
  },
  {
    code: 'Numpad5', label: '5', col: 'col-start-2 col-span-1', row: 'row-start-3 row-span-1',
  },
  {
    code: 'Numpad6', label: '6', col: 'col-start-3 col-span-1', row: 'row-start-3 row-span-1',
  },

  {
    code: 'Numpad1', label: '1', col: 'col-start-1 col-span-1', row: 'row-start-4 row-span-1',
  },
  {
    code: 'Numpad2', label: '2', col: 'col-start-2 col-span-1', row: 'row-start-4 row-span-1',
  },
  {
    code: 'Numpad3', label: '3', col: 'col-start-3 col-span-1', row: 'row-start-4 row-span-1',
  },
  {
    code: 'NumpadEnter', label: 'Ent', col: 'col-start-4 col-span-1', row: 'row-start-4 row-span-2',
  },

  {
    code: 'Numpad0', label: '0', col: 'col-start-1 col-span-2', row: 'row-start-5 row-span-1',
  },
  {
    code: 'NumpadDecimal', label: '.', col: 'col-start-3 col-span-1', row: 'row-start-5 row-span-1',
  },
];

// macOS keys that cannot be tested via a normal hardware keypress, with an
// explanation shown on hover. Keyed by physical `code`.
const MAC_CONFLICT_NOTES = {
  F11: {
    title: 'macOS Shortcut Conflict',
    body: (
      <>
        F11/Fn+F11 is mapped to <span className="font-semibold text-slate-200">Show Desktop</span> by macOS.
        <div className="mt-1.5 text-[10px] text-slate-300 space-y-1">
          <p>1. Open <span className="font-semibold">System Settings &gt; Keyboard &gt; Keyboard Shortcuts &gt; Desktop &amp; Dock</span>.</p>
          <p>2. Uncheck <span className="font-semibold">Show Desktop</span>.</p>
        </div>
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
          You can also click this key on screen to test manually.
        </div>
      </>
    ),
  },
  Fn: {
    title: 'Hardware Key — Not Detectable',
    placement: 'top', // bottom-row key: open upward so the container doesn't clip it
    align: 'left', // leftmost key: anchor left edge so a centered tooltip isn't clipped
    body: (
      <>
        The <span className="font-semibold text-slate-200">Fn</span> key is processed inside the
        keyboard&apos;s firmware and never sends a key event to the OS or browser — so it cannot be
        detected electronically by any web page.
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
          Click this key on screen to mark it tested manually.
        </div>
      </>
    ),
  },
  F13: {
    title: 'Touch ID — Not a Standard Key',
    body: (
      <>
        <span className="font-semibold text-slate-200">Touch ID</span> is a biometric/power sensor,
        not a typing key, so it does not emit a keyboard event that the browser can read.
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
          Click this key on screen to mark it tested manually.
        </div>
      </>
    ),
  },
};

// Reusable hover tooltip + pulsing marker for OS-reserved / undetectable keys.
// `note.placement === 'top'` opens the tooltip upward (for bottom-row keys whose
// downward tooltip would be clipped by the keyboard container's overflow).
const KeyConflictTooltip = ({ note }) => {
  const posClass = note.placement === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-2';
  const alignClass = note.align === 'left'
    ? 'left-0'
    : 'left-1/2 -translate-x-1/2';
  return (
    <>
      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <div className={`absolute ${alignClass} ${posClass} w-64 bg-slate-950 text-white text-[11px] p-3.5 rounded-xl shadow-xl border border-slate-800 hidden group-hover:block z-50 pointer-events-none font-normal text-left leading-normal`}>
        <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          {note.title}
        </div>
        {note.body}
      </div>
    </>
  );
};

// Presets for ghosting combinations
const COMBO_PRESETS = [
  {
    name: 'WASD Movement',
    keys: ['KeyW', 'KeyA', 'KeyS', 'KeyD'],
    description: 'Standard action/RPG character navigation',
  },
  {
    name: 'Cut / Copy / Paste',
    keys: ['ControlLeft', 'MetaLeft', 'KeyX', 'KeyC', 'KeyV'],
    description: 'Multi-rollover office modifier testing',
  },
  {
    name: 'Task Manager Combo',
    keys: ['ControlLeft', 'ShiftLeft', 'Escape'],
    description: 'Windows quick diagnostics toggle shortcut',
  },
  {
    name: 'Gaming Space Jump',
    keys: ['ShiftLeft', 'KeyW', 'Space'],
    description: 'Frequent trigger key combo that blocks on bad keyboards',
  },
  {
    name: 'Arrow Navigation',
    keys: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
    description: 'Directional cross tests',
  },
];

export default function KeyboardTester() {
  const [layoutType, setLayoutType] = useState('mac');
  const [isMac, setIsMac] = useState(false);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/Mac|iPad|iPhone|iPod/.test(window.navigator.userAgent || window.navigator.platform));
    }
  }, []);

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundProfile, setSoundProfile] = useState('clicky');
  const [volume, setVolume] = useState(0.5);

  // Key registration states
  const [pressedKeys, setPressedKeys] = useState({});
  const [testedKeys, setTestedKeys] = useState({});
  const [lastPressed, setLastPressed] = useState(null);
  const [maxRollover, setMaxRollover] = useState(0);
  const [historyLog, setHistoryLog] = useState([]);

  // Reference for scrolling history log to bottom automatically (no window scroll)
  const logContainerRef = useRef(null);

  // Derive active theme object
  const theme = activeTheme;

  let layoutLabel = 'Windows Full-Size';
  if (layoutType === 'mac') {
    layoutLabel = 'MacBook Pro';
  } else if (layoutType === 'win-tkl') {
    layoutLabel = 'Windows TKL';
  }

  // Track key counts for current layout
  const getKeysCount = () => {
    if (layoutType === 'mac') {
      let count = 0;
      MAC_LAYOUT.forEach((row) => {
        row.forEach((k) => {
          if (k.type === 'split') count += k.subkeys.length;
          else count += 1;
        });
      });
      return count;
    }
    if (layoutType === 'win-tkl') {
      let count = 0;
      WIN_ALPHA_LAYOUT.forEach((row) => {
        row.forEach((k) => { if (k.code) count += 1; });
      });
      WIN_NAV_LAYOUT.forEach((row) => {
        row.forEach((k) => { if (k.code) count += 1; });
      });
      return count;
    }
    let count = 0;
    WIN_ALPHA_LAYOUT.forEach((row) => {
      row.forEach((k) => { if (k.code) count += 1; });
    });
    WIN_NAV_LAYOUT.forEach((row) => {
      row.forEach((k) => { if (k.code) count += 1; });
    });
    count += WIN_NUMPAD_KEYS.length;
    return count;
  };

  const totalKeysInLayout = getKeysCount();
  const testedKeysCount = Object.keys(testedKeys).filter((code) => {
    if (layoutType === 'mac') {
      return MAC_LAYOUT.some((row) => row.some((k) => {
        if (k.code === code) return true;
        if (k.type === 'split') {
          return k.subkeys.some((sk) => sk.code === code);
        }
        return false;
      }));
    }
    if (layoutType === 'win-tkl') {
      return (
        WIN_ALPHA_LAYOUT.some((row) => row.some((k) => k.code === code))
        || WIN_NAV_LAYOUT.some((row) => row.some((k) => k.code === code))
      );
    }
    return (
      WIN_ALPHA_LAYOUT.some((row) => row.some((k) => k.code === code))
      || WIN_NAV_LAYOUT.some((row) => row.some((k) => k.code === code))
      || WIN_NUMPAD_KEYS.some((k) => k.code === code)
    );
  }).length;

  const testedPercentage = totalKeysInLayout > 0
    ? Math.round((testedKeysCount / totalKeysInLayout) * 100)
    : 0;

  // Window key listener setup
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { code } = e;
      const keyName = e.key;

      // Keep an escape hatch so the user can still reload / open devtools via the
      // standard modifier shortcuts (Ctrl/Cmd+R, Ctrl/Cmd+I) while testing.
      const isReloadModifier = (e.ctrlKey || e.metaKey) && (code === 'KeyR' || code === 'KeyI');

      if (!isReloadModifier) {
        if (
          code === 'Tab'
          || code === 'AltLeft'
          || code === 'AltRight'
          || code === 'MetaLeft'
          || code === 'MetaRight'
          || code === 'ControlLeft'
          || code === 'ControlRight'
          || code === 'Backspace'
          || code === 'ArrowDown'
          || code === 'ArrowUp'
          || code === 'ArrowLeft'
          || code === 'ArrowRight'
          || keyName === ' '
          || /^F\d{1,2}$/.test(code)
        ) {
          // Suppress browser defaults for function keys (F5 reload, F1 help, etc.)
          // so the keypress registers in the tester instead. Note: F11 (fullscreen)
          // and F12 (devtools) may still be intercepted by the browser/OS before
          // the page sees them, depending on platform.
          e.preventDefault();
        }

        if (e.altKey || e.metaKey || e.ctrlKey) {
          e.preventDefault();
        }
      }

      setPressedKeys((prev) => {
        const next = { ...prev, [code]: true };
        const currentRolloverCount = Object.values(next).filter(Boolean).length;
        setMaxRollover((currMax) => Math.max(currMax, currentRolloverCount));
        return next;
      });

      setTestedKeys((prev) => ({ ...prev, [code]: true }));
      setLastPressed({ code, key: keyName });

      const timeStr = new Date().toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
      });
      setHistoryLog((prev) => [
        ...prev.slice(-49),
        {
          id: shortid.generate(), code, key: keyName, time: timeStr,
        },
      ]);

      playKeySound(soundProfile, !soundEnabled, volume);
    };

    const handleKeyUp = (e) => {
      const { code } = e;
      setPressedKeys((prev) => ({ ...prev, [code]: false }));
    };

    const handleBlur = () => {
      setPressedKeys({});
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [soundEnabled, soundProfile, volume]);

  // Scroll key log to bottom automatically without scrolling windows
  useEffect(() => {
    if (logContainerRef.current) {
      const container = logContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [historyLog]);

  const resetTester = () => {
    setPressedKeys({});
    setTestedKeys({});
    setLastPressed(null);
    setMaxRollover(0);
    setHistoryLog([]);
  };

  const getComboState = (comboKeys) => {
    const isCurrentlyActive = comboKeys.some((k) => pressedKeys[k]);
    const isFullyTested = comboKeys.every((k) => testedKeys[k]);
    return { active: isCurrentlyActive, tested: isFullyTested };
  };

  const handleLayoutChange = (type) => {
    setLayoutType(type);
    setPressedKeys({});
  };

  const unlockAudioEngine = () => {
    if (!soundEnabled) {
      setSoundEnabled(true);
      playKeySound(soundProfile, false, volume);
    }
  };

  const handleKeyClick = (code) => {
    if (!code) return;
    setTestedKeys((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Helper functions for class names to avoid nested ternaries and long lines
  const getKeyClass = (code, isSplit = false) => {
    if (pressedKeys[code]) return theme.activeClass;
    if (testedKeys[code]) return theme.testedClass;
    const textCol = isSplit ? 'text-slate-500' : 'text-slate-600';
    return `bg-slate-50 ${textCol} ${theme.keyBorderColor} border-slate-200`;
  };

  const getComboCardClass = (active, tested) => {
    if (active) return 'bg-amber-50/50 border-amber-200';
    if (tested) return 'bg-emerald-50/40 border-emerald-100';
    return 'bg-slate-50 border-slate-150';
  };

  const getComboTitleClass = (active, tested) => {
    if (tested) return 'text-emerald-700';
    if (active) return 'text-amber-700';
    return 'text-slate-700';
  };

  const getComboKeyClass = (kActive, kTested) => {
    if (kActive) return 'bg-amber-400 text-slate-900 border-amber-500';
    if (kTested) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-white text-slate-500 border-slate-200';
  };

  const getComboPillLabel = (active, tested) => {
    if (tested) return 'Verified';
    if (active) return 'Active';
    return 'Pending';
  };

  const getComboPillClass = (active, tested) => {
    if (tested) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (active) return 'text-amber-600 bg-amber-50 border-amber-100 animate-pulse';
    return 'text-slate-400 bg-white border-slate-200';
  };

  return (
    <PageContext.Provider value={{ activeItem: PAGE.KEYBOARD_TESTER }}>
      <Layout>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col space-y-6"
        >
          {/* Main Title Area */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Keyboard className="w-8 h-8 text-amber-500" />
                Hardware Keyboard Tester
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-500">
                Verify multi-key rollover (NKRO), diagnose sticky switches,
                test ghosting nodes, and customize layout skins. (Keys with
                OS conflicts like F1–F12 or Fn can be clicked to test manually).
              </p>
            </div>

            {/* Control Button panel */}
            <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={resetTester}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Canvas
              </button>
            </div>
          </div>

          {/* Quick Specifications Banner Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Layout Template</span>
                <span className="text-sm font-extrabold text-slate-800 capitalize block">
                  {layoutLabel}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Keys Calibrated</span>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {testedKeysCount} / {totalKeysInLayout}
                  <span className="text-xs font-medium text-slate-400 ml-1">
                    ({testedPercentage}%)
                  </span>
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Held Keys</span>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {Object.values(pressedKeys).filter(Boolean).length} Keys Active
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NKRO Rollover peak</span>
                <span className="text-sm font-extrabold text-slate-800 block">
                  {maxRollover} Max Congruent
                </span>
              </div>
            </div>
          </div>

          {/* Quick Real-Time Large Visual Display of Last Key Pressed */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-500">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block tracking-wide uppercase">Real-Time Core Stream</span>
                <p className="text-sm text-slate-600 font-medium">
                  Press any physical key on your keyboard to instantly run verification scans.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {lastPressed ? (
                <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-150 px-4 py-2 rounded-2xl">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Key Value</span>
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      &quot;{lastPressed.key === ' ' ? 'Space' : lastPressed.key}&quot;
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Physical Code</span>
                    <span className="text-xs font-mono font-bold text-emerald-600">{lastPressed.code}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-semibold text-slate-400 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                  Waiting for hardware event...
                </div>
              )}
            </div>
          </div>

          {/* Keyboard Outer Container - Now taking 100% full width of screen at the top! */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto select-none w-full">
            {layoutType === 'mac' && (
              <div className="flex flex-col gap-1.5 min-w-[700px] mx-auto py-1">
                {MAC_LAYOUT.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5">
                    {row.map((key, kIdx) => {
                      if (key.type === 'split') {
                        // Split arrow cluster for Apple layouts
                        return (
                          <div
                            key={key.code}
                            style={{ width: `${key.width * 48 - 6}px`, height: '42px' }}
                            className="flex flex-col gap-1.5 shrink-0"
                          >
                            {key.subkeys.map((subk) => (
                              <div
                                key={subk.code}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleKeyClick(subk.code);
                                }}
                                className={`flex-1 flex items-center justify-center text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${getKeyClass(subk.code, true)}`}
                              >
                                {subk.label}
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={kIdx}
                          onClick={() => handleKeyClick(key.code)}
                          style={{ width: `${key.width * 48 - 6}px`, height: '42px' }}
                          className={`rounded-lg border text-[10px] font-semibold flex items-center justify-center text-center p-1 cursor-pointer select-none transition-all duration-75 shrink-0 ${isMac && MAC_CONFLICT_NOTES[key.code] ? 'relative group' : ''} ${getKeyClass(key.code)}`}
                        >
                          <span className="whitespace-pre-line leading-none">
                            {key.label}
                          </span>
                          {isMac && MAC_CONFLICT_NOTES[key.code] && (
                            <KeyConflictTooltip note={MAC_CONFLICT_NOTES[key.code]} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Windows TKL or Full layout Rendering */}
            {(layoutType === 'win-tkl' || layoutType === 'win-full') && (
              <div className="flex gap-4 min-w-[750px] justify-between py-1">
                {/* Part A: Windows main alphanumeric core */}
                <div className="flex flex-col gap-1.5 flex-1 max-w-[720px]">
                  {WIN_ALPHA_LAYOUT.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1.5">
                      {row.map((key, kIdx) => {
                        if (key.type === 'spacer') {
                          return (
                            <div
                              key={`sp-${kIdx}`}
                              style={{ width: `${key.width * 48 - 6}px` }}
                              className="shrink-0"
                            />
                          );
                        }

                        return (
                          <div
                            key={kIdx}
                            onClick={() => handleKeyClick(key.code)}
                            style={{ width: `${key.width * 48 - 6}px`, height: '42px' }}
                            className={`rounded-lg border text-[10px] font-semibold flex items-center justify-center text-center p-1 cursor-pointer select-none transition-all duration-75 shrink-0 ${isMac && MAC_CONFLICT_NOTES[key.code] ? 'relative group' : ''} ${getKeyClass(key.code)}`}
                          >
                            <span className="whitespace-pre-line leading-none">
                              {key.label}
                            </span>
                            {isMac && MAC_CONFLICT_NOTES[key.code] && (
                              <KeyConflictTooltip note={MAC_CONFLICT_NOTES[key.code]} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Part B: Windows Standard Navigation Cluster */}
                <div className="flex flex-col gap-1.5 w-[138px] shrink-0">
                  {WIN_NAV_LAYOUT.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1.5">
                      {row.map((key, kIdx) => {
                        if (key.type === 'spacer') {
                          return (
                            <div
                              key={`nav-sp-${kIdx}`}
                              style={{ width: `${key.width * 48 - 6}px` }}
                              className="h-[42px] shrink-0"
                            />
                          );
                        }

                        return (
                          <div
                            key={kIdx}
                            onClick={() => handleKeyClick(key.code)}
                            style={{ width: `${key.width * 48 - 6}px`, height: '42px' }}
                            className={`rounded-lg border text-[10px] font-semibold flex items-center justify-center text-center p-1 cursor-pointer select-none transition-all duration-75 shrink-0 ${getKeyClass(key.code)}`}
                          >
                            <span className="leading-none">{key.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Part C: Optional Full-size Numpad Section */}
                {layoutType === 'win-full' && (
                  <div className="grid grid-cols-4 grid-rows-5 gap-1.5 w-[202px] h-[234px] mt-[48px] border-l border-slate-100 pl-4 shrink-0">
                    {WIN_NUMPAD_KEYS.map((key) => (
                      <div
                        key={key.code}
                        onClick={() => handleKeyClick(key.code)}
                        className={`rounded-lg border text-[10px] font-bold flex items-center justify-center text-center cursor-pointer select-none transition-all duration-75 ${key.col} ${key.row} ${getKeyClass(key.code)}`}
                      >
                        <span>{key.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Underneath Keyboard: Controls Sidebar & Diagnostics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Column 1: Config Panels (Layout, Synthesizer, Skins) */}
            <div className="space-y-6">
              {/* Option Selector 1: Layout Engine */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-50 pb-2.5 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-500" />
                  Layout Engine
                </h3>

                <div className="flex flex-col gap-2">
                  {[
                    { id: 'mac', label: 'MacBook Pro Compact' },
                    { id: 'win-tkl', label: 'Windows TKL (80%)' },
                    { id: 'win-full', label: 'Windows Full (104 Key)' },
                  ].map((lay) => (
                    <button
                      key={lay.id}
                      type="button"
                      onClick={() => handleLayoutChange(lay.id)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${layoutType === lay.id
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {lay.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option Selector 2: Sound Synthesis & Mechanical Switches */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    Switch Synthesizer
                  </h3>

                  <button
                    type="button"
                    onClick={unlockAudioEngine}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wide transition-all ${soundEnabled
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {soundEnabled ? 'Active' : 'Muted'}
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Switch profiles */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stem Profile</span>
                    <select
                      value={soundProfile}
                      onChange={(e) => setSoundProfile(e.target.value)}
                      disabled={!soundEnabled}
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700"
                    >
                      <option value="clicky">Cherry MX Blue (Clicky)</option>
                      <option value="tactile">Cherry MX Brown (Tactile)</option>
                      <option value="linear">Cherry MX Red (Linear)</option>
                    </select>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Synth Gain</span>
                      <span className="text-[10px] font-bold text-slate-500">{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      disabled={!soundEnabled}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-100 border border-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Option Selector 3: Visual Theme Skin Customizer */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-50 pb-2.5 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Keycap Skin Colors
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setActiveTheme(th)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${activeTheme.id === th.id
                        ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Theme Indicator color circles */}
                      <div className="flex gap-1">
                        <span className={`w-3.5 h-3.5 rounded-full ${th.indicatorColor1}`} />
                        <span className={`w-3.5 h-3.5 rounded-full ${th.indicatorColor2}`} />
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-600 leading-tight">
                        {th.name.split(' ')[1]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Anti-Ghosting Combos Checklist */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-indigo-500" />
                  Anti-Ghosting Combos Checklist
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hold these key combinations simultaneously to test layout
                  hardware bottlenecks.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {COMBO_PRESETS.map((combo) => {
                  const { active, tested } = getComboState(combo.keys);
                  return (
                    <div
                      key={combo.name}
                      className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 ${getComboCardClass(active, tested)}`}
                    >
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block ${getComboTitleClass(active, tested)}`}>
                          {combo.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block pt-0.5 leading-normal">
                          {combo.description}
                        </span>
                        {/* Visual pill caps for codes included in the combo */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {combo.keys.map((k) => {
                            const kActive = pressedKeys[k];
                            const kTested = testedKeys[k];
                            return (
                              <span
                                key={k}
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border font-semibold ${getComboKeyClass(kActive, kTested)}`}
                              >
                                {k.replace('Key', '').replace('Digit', '').replace('Left', '').replace('Right', '')}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border uppercase tracking-wide ${getComboPillClass(active, tested)}`}
                        >
                          {getComboPillLabel(active, tested)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Hardware Signal Log (Capped history container) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between h-[410px]">
              <div className="space-y-4 flex flex-col h-full min-h-0">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-500" />
                    Hardware Signal Log
                  </h3>

                  <button
                    type="button"
                    onClick={() => setHistoryLog([])}
                    disabled={historyLog.length === 0}
                    className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Clear log
                  </button>
                </div>

                {/* Scrollable log area with local scroll containerRef */}
                <div
                  ref={logContainerRef}
                  className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-1.5 text-xs font-mono select-text"
                >
                  {historyLog.length > 0 ? (
                    historyLog.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between py-1 px-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                      >
                        <span className="text-slate-400 text-[10px]">{log.time}</span>
                        <span className="font-semibold text-slate-700">Code: {log.code}</span>
                        <span className="text-indigo-600 font-extrabold">
                          &quot;{log.key === ' ' ? 'Space' : log.key}&quot;
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Terminal className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
                      <span className="text-slate-400 text-xs font-semibold">No hardware events logged</span>
                      <span className="text-[10px] text-slate-300 mt-1 max-w-[200px]">
                        Physical key logs will stream here in real-time
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Informational Guidelines Alert */}
          <div
            className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-xs text-amber-800 leading-relaxed"
          >
            <HelpCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-extrabold block mb-0.5">
                Browser Sandbox &amp; System Hotkey Conflicts
              </span>
              <p>
                To maintain system security, web browsers sandbox keyboard events,
                meaning high-privilege OS-level shortcuts cannot be blocked.
              </p>
              <div className="mt-2 space-y-1">
                <p>
                  • <span className="font-bold">macOS F11/Fn+F11 conflict:</span> By
                  default, macOS maps F11 to{' '}
                  <span className="font-semibold">Show Desktop</span> (Mission
                  Control). Pressing F11 or Fn+F11 triggers this system shortcut
                  instead of sending the key event to the browser. To test your
                  F11 key, you can disable this shortcut in{' '}
                  <span className="font-semibold">
                    System Settings &gt; Keyboard &gt; Keyboard Shortcuts &gt;
                    Desktop &amp; Dock &gt; Show Desktop
                  </span>
                  , or click the F11 key on the screen to test manually.
                </p>
                <p>
                  • <span className="font-bold">Other restricted keys:</span> System
                  shortcuts like <span className="font-semibold">Cmd+Tab</span>,{' '}
                  <span className="font-semibold">Alt+Tab</span>, or{' '}
                  <span className="font-semibold">Cmd+Q</span> /{' '}
                  <span className="font-semibold">Ctrl+W</span> will be intercepted
                  by the OS/browser and cannot be registered by the tester.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}
