// src/components/MetricTiles.jsx
import React from 'react';
import { DollarSign, Clock, TrendingUp, Target } from 'lucide-react';

// Small helpers (optionally reuse your fmtH2)
const fmt$ = (n) => (n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmtH2 = (n) => {
  if (n == null || isNaN(n)) return '0';
  const v = Math.round(Number(n) * 100) / 100;
  return Number.isInteger(v) ? String(v) : String(v);
};

export function MetricTiles({
  timeRangeLabel = '3m',
  weeklyAvgHours = 0,
  weeklyAvgEarnings = 0,
  ytdEarnings = 0,
  goalHoursPerWeek = 30,
  avgRate = 0,
  totalEarningsRange = 0,
  totalEarningsAllTime = 0,
}) {
  const earningsTargetWeekly = goalHoursPerWeek * avgRate;

  const items = [
    {
      key: 'avgHours',
      label: 'Avg Weekly Hours',
      value: `${fmtH2(weeklyAvgHours)}h`,
      icon: <Clock size={18} className="text-indigo-600" />,
      tone: 'from-indigo-50 to-violet-50',
      border: 'border-indigo-200',
    },
    {
      key: 'avgEarnings',
      label: 'Avg Weekly Earnings',
      value: `$${fmt$((weeklyAvgEarnings))}`,
      icon: <DollarSign size={18} className="text-emerald-600" />,
      tone: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
    },
    {
      key: 'avgRate',
      label: 'Avg Hourly Rate',
      value: `$${fmtH2(avgRate)}/h`,
      icon: <TrendingUp size={18} className="text-sky-600" />,
      tone: 'from-sky-50 to-cyan-50',
      border: 'border-sky-200',
    },
    {
      key: 'weeklyTarget',
      label: `${goalHoursPerWeek}h Weekly Target (~$)`,
      value: `$${fmt$(earningsTargetWeekly)}`,
      icon: <Target size={18} className="text-violet-600" />,
      tone: 'from-violet-50 to-fuchsia-50',
      border: 'border-violet-200',
    },
    {
      key: 'totalEarningsRange',
      label: `Total Earnings (${timeRangeLabel})`,
      value: `$${fmt$(totalEarningsRange)}`,
      icon: <DollarSign size={18} className="text-sky-600" />,
      tone: 'from-sky-50 to-cyan-50',
      border: 'border-sky-200',
    },
    {
      key: 'totalEarningsAllTime',
      label: 'Total Earnings (All time)',
      value: `$${fmt$(totalEarningsAllTime)}`,
      icon: <DollarSign size={18} className="text-slate-600" />,
      tone: 'from-slate-50 to-slate-100',
      border: 'border-slate-200',
    },
  ];

  return (
    <section className="mb-6">
      {/* header chip */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
        Summary — <span className="text-slate-800">{timeRangeLabel}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {items.map((m) => (
          <div
            key={m.key}
            className={`relative overflow-hidden rounded-xl border ${m.border} bg-white shadow-lg`}
          >
            {/* soft tone */}
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${m.tone}`} style={{ opacity: 0.45 }} />
            {/* top glow line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

            <div className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="text-slate-600 text-xs font-medium">{m.label}</div>
                <div className="shrink-0 rounded-md bg-white/80 p-1.5 border border-slate-200 backdrop-blur">
                  {m.icon}
                </div>
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {m.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
