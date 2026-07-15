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

export default function CronExpressionParser() {
  const [expression, setExpression] = useState('*/5 * * * *');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('presets'); // presets | builder

  // Builder states
  const [builderMinute, setBuilderMinute] = useState('*');
  const [builderHour, setBuilderHour] = useState('*');
  const [builderDom, setBuilderDom] = useState('*');
  const [builderMonth, setBuilderMonth] = useState('*');
  const [builderDow, setBuilderDow] = useState('*');

  useEffect(() => {
    const savedExpr = CronStorage.get('cronExpression');
    if (savedExpr) {
      setExpression(savedExpr);
      syncBuilderFromExpr(savedExpr);
    }
  }, []);

  const handleExpressionChange = (val) => {
    setExpression(val);
    CronStorage.set('cronExpression', val);
    syncBuilderFromExpr(val);
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

  const result = parseCron(expression);

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
              Parse cron expressions into human-readable text, verify their schedule execution dates, and build custom expressions visually.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Input & Form Builder */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />

                {/* Main Input */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Cron Expression
                  </label>
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
                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                    Next execution runs
                  </h3>

                  <div className="space-y-2.5 font-mono text-xs">
                    {result.nextRuns.map((runDate, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100 hover:border-amber-200 transition-colors"
                      >
                        <span className="text-[10px] text-amber-500 font-bold w-4">{idx + 1}.</span>
                        <span className="font-medium">
                          {runDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="ml-auto font-bold text-slate-900 bg-white border border-slate-150 px-2 py-0.5 rounded">
                          {runDate.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
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
