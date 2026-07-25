import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Copy,
  Check,
  Play,
  Calendar,
  Layers,
  Sliders,
  BookOpen,
  Globe,
} from 'lucide-react';
import Layout from '../components/Layout';
import PageContext from '../contexts/page';
import { PAGE } from '../constants/PageURL';
import { parseCron } from '../utils/cron';
import CronStorage from '../utils/storage/Cron';

const PRESETS = [
  { name: 'Every Minute', value: '* * * * *' },
  { name: 'Every 5 Minutes', value: '*/5 * * * *' },
  { name: 'Every 15 Minutes', value: '*/15 * * * *' },
  { name: 'Hourly (at :00)', value: '0 * * * *' },
  { name: 'Every 2 Hours', value: '0 */2 * * *' },
  { name: 'Daily at Midnight', value: '0 0 * * *' },
  { name: 'Daily at 9:00 AM', value: '0 9 * * *' },
  { name: 'Every Weekday at Midnight', value: '0 0 * * 1-5' },
  { name: 'Every Weekend at Midnight', value: '0 0 * * 0,6' },
  { name: 'Weekly on Sunday', value: '0 0 * * 0' },
  { name: 'Monthly on the 1st', value: '0 0 1 * *' },
  { name: 'Quarterly on 1st Day', value: '0 0 1 */3 *' },
];

const CHEATSHEET = [
  { field: 'Minute', values: '0-59', special: '* , - /' },
  { field: 'Hour', values: '0-23', special: '* , - /' },
  { field: 'Day of Month', values: '1-31', special: '* , - /' },
  { field: 'Month', values: '1-12 (or JAN-DEC)', special: '* , - /' },
  { field: 'Day of Week', values: '0-7 (0 or 7 is Sun, or SUN-SAT)', special: '* , - /' },
];

const TIMEZONE_OPTIONS = [
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  { label: 'Local Time (Browser)', value: 'local' },
  { label: 'America/New_York (US Eastern)', value: 'America/New_York' },
  { label: 'America/Chicago (US Central)', value: 'America/Chicago' },
  { label: 'America/Denver (US Mountain)', value: 'America/Denver' },
  { label: 'America/Los_Angeles (US Pacific)', value: 'America/Los_Angeles' },
  { label: 'America/Sao_Paulo (Brazil)', value: 'America/Sao_Paulo' },
  { label: 'Europe/London (UK, GMT/BST)', value: 'Europe/London' },
  { label: 'Europe/Paris (Central Europe)', value: 'Europe/Paris' },
  { label: 'Europe/Berlin (Germany)', value: 'Europe/Berlin' },
  { label: 'Europe/Moscow (MSK)', value: 'Europe/Moscow' },
  { label: 'Africa/Cairo (EET)', value: 'Africa/Cairo' },
  { label: 'Asia/Dubai (Gulf Standard Time)', value: 'Asia/Dubai' },
  { label: 'Asia/Kolkata (India Standard Time)', value: 'Asia/Kolkata' },
  { label: 'Asia/Bangkok (Indochina Time)', value: 'Asia/Bangkok' },
  { label: 'Asia/Phnom_Penh (Cambodia)', value: 'Asia/Phnom_Penh' },
  { label: 'Asia/Singapore (Singapore)', value: 'Asia/Singapore' },
  { label: 'Asia/Shanghai (China Standard Time)', value: 'Asia/Shanghai' },
  { label: 'Asia/Tokyo (Japan Standard Time)', value: 'Asia/Tokyo' },
  { label: 'Asia/Seoul (Korea Standard Time)', value: 'Asia/Seoul' },
  { label: 'Australia/Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
  { label: 'Pacific/Auckland (NZST/NZDT)', value: 'Pacific/Auckland' },
];

export default function CronExpressionParser() {
  const [expression, setExpression] = useState('*/5 * * * *');
  const [timezone, setTimezone] = useState('UTC');
  const [detectedTz, setDetectedTz] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('presets'); // presets | builder

  // Builder states
  const [builderMinute, setBuilderMinute] = useState('*');
  const [builderHour, setBuilderHour] = useState('*');
  const [builderDom, setBuilderDom] = useState('*');
  const [builderMonth, setBuilderMonth] = useState('*');
  const [builderDow, setBuilderDow] = useState('*');

  useEffect(() => {
    if (typeof Intl !== 'undefined') {
      try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setDetectedTz(userTz);
      } catch (e) {
        // Fallback silently if timezone detection fails
      }
    }

    const savedExpr = CronStorage.get('cronExpression');
    if (savedExpr) {
      setExpression(savedExpr);
      syncBuilderFromExpr(savedExpr);
    }

    const savedTz = CronStorage.get('cronTimezone');
    if (savedTz && savedTz !== 'local') {
      setTimezone(savedTz);
    } else {
      setTimezone('UTC');
    }
  }, []);

  const handleExpressionChange = (val) => {
    setExpression(val);
    CronStorage.set('cronExpression', val);
    syncBuilderFromExpr(val);
  };

  const handleTimezoneChange = (val) => {
    setTimezone(val);
    CronStorage.set('cronTimezone', val);
  };

  const syncBuilderFromExpr = (expr) => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length === 5) {
      setBuilderMinute(parts[0]);
      setBuilderHour(parts[1]);
      setBuilderDom(parts[2]);
      setBuilderMonth(parts[3]);
      setBuilderDow(parts[4]);
    }
  };

  const updateExpressionFromBuilder = (field, value) => {
    let m = builderMinute;
    let h = builderHour;
    let dom = builderDom;
    let mon = builderMonth;
    let dow = builderDow;

    if (field === 'minute') { setBuilderMinute(value); m = value; }
    if (field === 'hour') { setBuilderHour(value); h = value; }
    if (field === 'dom') { setBuilderDom(value); dom = value; }
    if (field === 'month') { setBuilderMonth(value); mon = value; }
    if (field === 'dow') { setBuilderDow(value); dow = value; }

    const newExpr = `${m} ${h} ${dom} ${mon} ${dow}`;
    setExpression(newExpr);
    CronStorage.set('cronExpression', newExpr);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const result = parseCron(expression, timezone);

  return (
    <PageContext.Provider value={{ activeItem: PAGE.CRON_EXPRESSION }}>
      <Layout title="Cron Expression Parser">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              Cron Expression Parser & Generator
            </h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Parse cron expressions into human-readable text, verify their schedule execution dates across timezones, and build custom expressions visually.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Input & Form Builder */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />

                {/* Main Input & Timezone Selector */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Cron Expression
                    </label>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-500 shrink-0">Timezone:</span>
                      <select
                        value={timezone}
                        onChange={(e) => handleTimezoneChange(e.target.value)}
                        className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs transition-colors"
                      >
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.value === 'local' && detectedTz ? `Local (${detectedTz})` : tz.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={expression}
                      onChange={(e) => handleExpressionChange(e.target.value)}
                      placeholder="e.g. */15 9-17 * * 1-5"
                      className="w-full h-14 pl-5 pr-16 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-lg font-medium text-slate-800 focus:outline-none focus:border-orange-500 transition-colors"
                      spellCheck={false}
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`absolute right-3 p-2.5 rounded-xl transition-all border ${
                        copied
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-white text-slate-400 hover:text-orange-600 hover:bg-orange-50 border-slate-200 hover:border-orange-200'
                      }`}
                      title="Copy Expression"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Switcher Tab */}
                <div className="flex border-b border-slate-100 mt-8 mb-6">
                  <button
                    onClick={() => setActiveTab('presets')}
                    className={`pb-3 font-semibold text-sm px-4 border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'presets'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Presets
                  </button>
                  <button
                    onClick={() => setActiveTab('builder')}
                    className={`pb-3 font-semibold text-sm px-4 border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'builder'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    Interactive Generator
                  </button>
                </div>

                {/* Presets List */}
                {activeTab === 'presets' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handleExpressionChange(preset.value)}
                        className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                          expression === preset.value
                            ? 'bg-orange-50/50 border-orange-200 shadow-sm'
                            : 'bg-white border-slate-100 hover:border-orange-200 hover:bg-slate-50/30'
                        }`}
                      >
                        <span className="font-semibold text-sm text-slate-800">{preset.name}</span>
                        <span className="font-mono text-xs text-slate-400 mt-1">{preset.value}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Builder */}
                {activeTab === 'builder' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* Minute Field */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Minute
                        </label>
                        <select
                          value={builderMinute}
                          onChange={(e) => updateExpressionFromBuilder('minute', e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-orange-500"
                        >
                          <option value="*">Every minute (*)</option>
                          <option value="*/2">Every 2 minutes (*/2)</option>
                          <option value="*/5">Every 5 minutes (*/5)</option>
                          <option value="*/10">Every 10 minutes (*/10)</option>
                          <option value="*/15">Every 15 minutes (*/15)</option>
                          <option value="*/30">Every 30 minutes (*/30)</option>
                          <option value="0">At minute :00</option>
                          <option value="30">At minute :30</option>
                        </select>
                      </div>

                      {/* Hour Field */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Hour
                        </label>
                        <select
                          value={builderHour}
                          onChange={(e) => updateExpressionFromBuilder('hour', e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-orange-500"
                        >
                          <option value="*">Every hour (*)</option>
                          <option value="*/2">Every 2 hours (*/2)</option>
                          <option value="*/3">Every 3 hours (*/3)</option>
                          <option value="*/4">Every 4 hours (*/4)</option>
                          <option value="*/6">Every 6 hours (*/6)</option>
                          <option value="*/12">Every 12 hours (*/12)</option>
                          <option value="0">At midnight (00:00)</option>
                          <option value="9">At 9:00 AM</option>
                          <option value="12">At 12:00 PM</option>
                          <option value="18">At 6:00 PM</option>
                        </select>
                      </div>

                      {/* Day of Month */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Day of Month
                        </label>
                        <select
                          value={builderDom}
                          onChange={(e) => updateExpressionFromBuilder('dom', e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-orange-500"
                        >
                          <option value="*">Every day of month (*)</option>
                          <option value="1">On the 1st day of the month</option>
                          <option value="15">On the 15th day of the month</option>
                          <option value="*/2">Every even day (*/2)</option>
                        </select>
                      </div>

                      {/* Month */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Month
                        </label>
                        <select
                          value={builderMonth}
                          onChange={(e) => updateExpressionFromBuilder('month', e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-orange-500"
                        >
                          <option value="*">Every month (*)</option>
                          <option value="*/3">Every quarter (*/3)</option>
                          <option value="1">January only</option>
                          <option value="6">June only</option>
                          <option value="12">December only</option>
                        </select>
                      </div>

                      {/* Day of Week */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          Day of Week
                        </label>
                        <select
                          value={builderDow}
                          onChange={(e) => updateExpressionFromBuilder('dow', e.target.value)}
                          className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-orange-500"
                        >
                          <option value="*">Every day of the week (*)</option>
                          <option value="1-5">Weekdays only (Monday-Friday)</option>
                          <option value="0,6">Weekends only (Saturday-Sunday)</option>
                          <option value="0">Sundays only</option>
                          <option value="1">Mondays only</option>
                          <option value="5">Fridays only</option>
                        </select>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Results Sidebar */}
            <div className="space-y-6">

              {/* Output Description */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Play className="w-4 h-4 text-orange-500 shrink-0" />
                  Description
                </h3>

                {result.isValid ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl text-slate-800 leading-relaxed font-medium">
                      {result.explanation.summary}
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="font-semibold">Minute:</span>
                        <span className="font-mono text-slate-800">{result.explanation.fields.minute}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Hour:</span>
                        <span className="font-mono text-slate-800">{result.explanation.fields.hour}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Day of Month:</span>
                        <span className="font-mono text-slate-800">{result.explanation.fields.dayOfMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Month:</span>
                        <span className="font-mono text-slate-800">{result.explanation.fields.month}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Day of Week:</span>
                        <span className="font-mono text-slate-800">{result.explanation.fields.dayOfWeek}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-medium">
                    {result.error}
                  </div>
                )}
              </div>

              {/* Next Executions */}
              {result.isValid && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      Next execution runs
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 font-semibold shadow-2xs">
                      <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      {timezone === 'local' ? (detectedTz ? `Local (${detectedTz})` : 'Local Time') : timezone}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                    {timezone === 'UTC'
                      ? 'Server schedules run in UTC. Converted to your local browser time below.'
                      : timezone === 'local'
                      ? 'Evaluated in your local browser timezone.'
                      : `Evaluated in ${timezone}.`}
                  </p>

                  <div className="space-y-3 font-mono text-xs">
                    {result.nextRuns.map((runDate, idx) => {
                      const targetTz = timezone === 'local' ? undefined : timezone;

                      // Primary Cron Execution Time (in selected timezone)
                      const dateStr = runDate.toLocaleDateString(undefined, {
                        timeZone: targetTz,
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      });
                      const timeStr = runDate.toLocaleTimeString(undefined, {
                        timeZone: targetTz,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'short',
                      });

                      // Converted Local Browser Time
                      const isDifferentFromLocal = timezone !== 'local' && detectedTz && timezone !== detectedTz;
                      const localDateStr = isDifferentFromLocal
                        ? runDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })
                        : null;
                      const localTimeStr = isDifferentFromLocal
                        ? runDate.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : null;

                      // Converted UTC Server Time (when evaluated in local time)
                      const utcTimeStr = timezone === 'local'
                        ? runDate.toLocaleTimeString(undefined, {
                            timeZone: 'UTC',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short',
                          })
                        : null;

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100 hover:border-amber-200 transition-colors space-y-2"
                        >
                          {/* Primary Execution Time */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-amber-500 font-bold w-4">{idx + 1}.</span>
                              <span className="font-medium text-slate-800">{dateStr}</span>
                            </div>
                            <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                              {timeStr}
                            </span>
                          </div>

                          {/* Converted Local Time Equivalent */}
                          {isDifferentFromLocal && (
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 text-[11px]">
                              <span className="text-slate-400 font-normal">Local ({detectedTz}):</span>
                              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                {localDateStr}, {localTimeStr}
                              </span>
                            </div>
                          )}

                          {/* Converted UTC Time Equivalent */}
                          {timezone === 'local' && (
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 text-[11px]">
                              <span className="text-slate-400 font-normal">UTC Server Equivalent:</span>
                              <span className="font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {utcTimeStr}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cheatsheet */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-400" />
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  Cheat Sheet
                </h3>

                <div className="space-y-3">
                  {CHEATSHEET.map((row) => (
                    <div key={row.field} className="text-xs border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{row.field}</span>
                        <span className="font-mono text-slate-500">{row.values}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Allowed: {row.special}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </Layout>
    </PageContext.Provider>
  );
}

