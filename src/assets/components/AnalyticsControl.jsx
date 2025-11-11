// src/components/AnalyticsControls.jsx
import React from 'react';
import { LineChart as LineIcon, BarChart3, PieChart, CalendarClock } from 'lucide-react';

const RANGES = ['1m', '3m', '6m', '1Y', 'ALL'];
const CHART_TABS = [
  { key: 'trends',   label: 'Trends',   icon: <LineIcon size={16} /> },
  { key: 'projects', label: 'Projects', icon: <BarChart3 size={16} /> },
  { key: 'payTypes', label: 'Pay Types', icon: <PieChart size={16} /> },
  { key: 'daily',    label: 'Daily',    icon: <CalendarClock size={16} /> },
];

export function AnalyticsControls({
  timeRange,
  onChangeRange,
  activeChart,
  onChangeChart,
  timeGoalHours,
  onChangeTimeGoal,
  earningsGoalPreview = 0,     // ≈ $ preview (goal * avgRateInRange)
  entriesInRange = 0,          // count of entries in current range
  className = '',
}) {
  return (
    <section className={`relative 1 rounded-t-2xl border border-slate-200 bg-white shadow-lg ${className}`}>
      {/* top gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-t-2xl" />

      <div className="p-4 sm:p-5">
        {/* top row: title + entries badge */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Analytics</h2>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <span className="inline-flex h-2 w-2 rounded-full bg-indigo-600" />
            {entriesInRange} entries in range
          </div>
        </div>

        {/* controls */}
        <div className="flex flex-col gap-3">
          {/* Range selector (scrollable on mobile) */}
          <div className="-mx-2 overflow-x-auto">
            <div className="mx-2 inline-flex gap-2">
              {RANGES.map(r => {
                const active = timeRange === r;
                return (
                  <button
                    key={r}
                    onClick={() => onChangeRange?.(r)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                    title={`Show ${r}`}
                  >
                    {r === 'ALL' ? 'All' : r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabs + Goal control row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {CHART_TABS.map(t => {
                const active = activeChart === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => onChangeChart?.(t.key)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={active ? 'text-white' : 'text-slate-500'}>{t.icon}</span>
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Goal control */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600">Goal (h)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={timeGoalHours}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onChangeTimeGoal?.(Number.isFinite(v) ? v : 0);
                }}
                className="w-20 px-2 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">
                ≈ ${Number.isFinite(earningsGoalPreview) ? Math.round(earningsGoalPreview).toLocaleString() : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
