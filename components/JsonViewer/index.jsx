import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Settings, ChevronDown, ChevronRight, Check, X, Clipboard, Type, Box, Indent, Maximize2, Minimize2, Palette, MousePointer2, Sun, Moon } from 'lucide-react';

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

const THEMES = [
  'apathy', 'apathy:inverted', 'ashes', 'bespin', 'brewer', 'bright:inverted', 'bright', 'chalk', 'codeschool', 'colors', 'eighties', 'embers', 'flat', 'google', 'grayscale', 'grayscale:inverted', 'greenscreen', 'harmonic', 'hopscotch', 'isotope', 'marrakesh', 'mocha', 'monokai', 'ocean', 'paraiso', 'pop', 'railscasts', 'rjv-default', 'shapeshifter', 'shapeshifter:inverted', 'solarized', 'summerfruit', 'summerfruit:inverted', 'threezerotwofour', 'tomorrow', 'tube', 'twilight'
];

const ICON_STYLES = ['circle', 'square', 'triangle'];
const INDENT_WIDTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const COLLAPSED_OPTIONS = [
  { value: false, label: 'None' },
  { value: true, label: 'All' },
  { value: 1, label: 'Level 1' },
  { value: 2, label: 'Level 2' }
];
const STRING_COLLAPSE_OPTIONS = [
  { value: false, label: 'None' },
  { value: 5, label: '5 chars' },
  { value: 10, label: '10 chars' },
  { value: 15, label: '15 chars' },
  { value: 20, label: '20 chars' }
];

export default function JSONView({ json }) {
  const [settings, setSettings] = useState({
    theme: 'monokai',
    iconStyle: 'circle',
    onEdit: false,
    onAdd: false,
    onDelete: false,
    enableClipboard: true,
    displayDataTypes: true,
    displayObjectSize: true,
    indentWidth: 2,
    collapsed: false,
    collapseStringsAfter: false,
    showSettings: false,
    isLightMode: false
  });

  const updateSetting = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const toggleSettings = () => {
    setSettings(prev => ({ ...prev, showSettings: !prev.showSettings }));
  };

  const toggleMode = () => {
    const newLightMode = !settings.isLightMode;
    setSettings(prev => ({ 
      ...prev, 
      isLightMode: newLightMode,
      theme: newLightMode ? 'rjv-default' : 'monokai'
    }));
  };

  const SelectField = ({ label, icon: Icon, value, options, onChange, name }) => (
    <div className="flex flex-col space-y-1.5">
      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-slate-400" />}
        {label}
      </label>
      <select
        value={String(value)}
        onChange={(e) => {
          const val = e.target.value;
          // Handle boolean conversion
          if (val === 'true') onChange(true);
          else if (val === 'false') onChange(false);
          else if (!isNaN(val) && val !== '' && val !== 'null') onChange(Number(val));
          else onChange(val);
        }}
        className={`border text-xs rounded-lg block w-full p-2 outline-none appearance-none cursor-pointer transition-colors ${
          settings.isLightMode 
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-amber-500 focus:border-amber-500' 
            : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750 focus:ring-amber-500 focus:border-amber-500'
        }`}
      >
        {options.map((opt, i) => {
          const isObject = typeof opt === 'object' && opt !== null;
          const optValue = isObject ? opt.value : opt;
          const optLabel = isObject ? opt.label : opt;
          return (
            <option key={i} value={String(optValue)}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </div>
  );

  const ToggleField = ({ label, icon: Icon, value, onChange }) => (
    <div 
      className={`flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer group ${
        settings.isLightMode 
          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' 
          : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
      }`} 
      onClick={() => onChange(!value)}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className={value ? 'text-amber-400' : 'text-slate-500'} />}
        <span className={`text-xs transition-colors ${
          settings.isLightMode ? 'text-slate-600 group-hover:text-slate-900' : 'text-slate-300 group-hover:text-slate-100'
        }`}>{label}</span>
      </div>
      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${value ? 'bg-amber-500' : 'bg-slate-600'}`}>
        <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ease-in-out ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Toolbar */}
      <div className={`flex items-center justify-between mb-4 pb-4 border-b transition-colors ${
        settings.isLightMode ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-amber-400" />
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className={`bg-transparent text-sm font-medium focus:outline-none cursor-pointer transition-colors ${
                settings.isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              {THEMES.map(t => <option key={t} value={t} className={settings.isLightMode ? 'bg-white' : 'bg-slate-900'}>{t}</option>)}
            </select>
          </div>
          <div className={`h-4 w-px ${settings.isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`} />
          <div className="flex items-center gap-2">
            <Box size={16} className="text-blue-400" />
            <select
              value={settings.iconStyle}
              onChange={(e) => updateSetting('iconStyle', e.target.value)}
              className={`bg-transparent text-sm font-medium focus:outline-none cursor-pointer transition-colors ${
                settings.isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              {ICON_STYLES.map(s => <option key={s} value={s} className={settings.isLightMode ? 'bg-white' : 'bg-slate-900'}>{s}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMode}
            className={`p-2 rounded-lg border transition-all ${
              settings.isLightMode 
                ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600'
            }`}
            title={settings.isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {settings.isLightMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={toggleSettings}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              settings.showSettings 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:border-slate-600'
            }`}
          >
            <Settings size={14} className={settings.showSettings ? 'rotate-180' : ''} />
            Settings
            {settings.showSettings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Settings Panel */}
      {settings.showSettings && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 rounded-xl border transition-all duration-300 ${
          settings.isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
        }`}>
          <SelectField 
            label="Indent Width" 
            icon={Indent} 
            value={settings.indentWidth} 
            options={INDENT_WIDTHS} 
            onChange={(val) => updateSetting('indentWidth', val)} 
          />
          <SelectField 
            label="Collapsed" 
            icon={Minimize2} 
            value={settings.collapsed} 
            options={COLLAPSED_OPTIONS} 
            onChange={(val) => updateSetting('collapsed', val)} 
          />
          <SelectField 
            label="Collapse Strings" 
            icon={Maximize2} 
            value={settings.collapseStringsAfter} 
            options={STRING_COLLAPSE_OPTIONS} 
            onChange={(val) => updateSetting('collapseStringsAfter', val)} 
          />
          
          <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
            <ToggleField label="Data Types" icon={Type} value={settings.displayDataTypes} onChange={(val) => updateSetting('displayDataTypes', val)} />
            <ToggleField label="Object Size" icon={Box} value={settings.displayObjectSize} onChange={(val) => updateSetting('displayObjectSize', val)} />
            <ToggleField label="Clipboard" icon={Clipboard} value={settings.enableClipboard} onChange={(val) => updateSetting('enableClipboard', val)} />
            <ToggleField label="Editable" icon={MousePointer2} value={settings.onEdit} onChange={(val) => updateSetting('onEdit', val)} />
          </div>
        </div>
      )}

      {/* JSON Display Area */}
      <div className={`flex-1 overflow-auto rounded-lg transition-colors duration-300 ${
        settings.isLightMode ? 'bg-[#fcfcfc] border border-slate-200 shadow-inner' : 'bg-slate-900/30'
      }`}>
        <ReactJson
          name={false}
          src={json}
          theme={settings.theme}
          iconStyle={settings.iconStyle}
          indentWidth={settings.indentWidth}
          collapsed={settings.collapsed}
          collapseStringsAfterLength={settings.collapseStringsAfter}
          displayDataTypes={settings.displayDataTypes}
          displayObjectSize={settings.displayObjectSize}
          enableClipboard={settings.enableClipboard}
          onEdit={settings.onEdit ? (e) => { /* Handle edit if needed */ } : false}
          onAdd={settings.onAdd ? (e) => { /* Handle add if needed */ } : false}
          onDelete={settings.onDelete ? (e) => { /* Handle delete if needed */ } : false}
          style={{
            backgroundColor: 'transparent',
            fontSize: '14px',
            fontFamily: 'var(--font-mono)',
            padding: '12px'
          }}
        />
      </div>

      {(settings.onEdit || settings.onAdd) && (
        <div className={`mt-4 p-3 rounded-lg border text-[11px] italic flex items-start gap-2 ${
          settings.isLightMode ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-blue-500/5 border-blue-500/10 text-blue-400/80'
        }`}>
          <div className="mt-0.5"><Settings size={12} /></div>
          <div>
            <p><strong>Editing enabled:</strong> Try <code>ctrl/cmd + click</code> to edit. Use <code>Enter</code> to submit and <code>Esc</code> to cancel.</p>
          </div>
        </div>
      )}
    </div>
  );
}
