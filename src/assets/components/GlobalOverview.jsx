import React from 'react';
import { TrendingUp, Clock, DollarSign, Calendar } from 'lucide-react';

export function GlobalOverview({ 
  totalEarningsAllTime, 
  totalHoursAllTime, 
  totalWeeks,
  avgWeeklyEarnings,
  avgWeeklyHours,
  totalEntries,
  timeGoalHours,
  onChangeTimeGoal,
  avgRate: avgRateFromRange
}) {
  const avgRate = totalHoursAllTime > 0 ? totalEarningsAllTime / totalHoursAllTime : 0;
  const earningsGoalPreview = avgRateFromRange && timeGoalHours ? avgRateFromRange * timeGoalHours : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-lg p-6">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(600px 300px at 50% -20%, rgba(99,102,241,0.15), transparent 70%)',
        }}
      />
      
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Global Overview</h3>
          </div>
          
          {/* Goal control in top right */}
          {timeGoalHours !== undefined && onChangeTimeGoal && (
            <div className="flex items-center gap-2 rounded-lg bg-white/70 backdrop-blur px-2 py-1.5 border border-slate-200">
              <label className="text-xs text-slate-600 whitespace-nowrap">Goal (h)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={timeGoalHours}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onChangeTimeGoal?.(Number.isFinite(v) ? v : 0);
                }}
                className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              {avgRateFromRange > 0 && (
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  ≈ ${Number.isFinite(earningsGoalPreview) ? Math.round(earningsGoalPreview).toLocaleString() : '0'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main stat */}
        <div className="mb-4 pb-4 border-b border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Earnings (All Time)</p>
          <p className="text-3xl font-bold text-slate-900">
            ${totalEarningsAllTime.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-slate-500" />
              <p className="text-xs text-slate-600">Weeks</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{totalWeeks}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <p className="text-xs text-slate-600">Total Hours</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{totalHoursAllTime.toFixed(1)}h</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <p className="text-xs text-slate-600">Avg/Week</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">${avgWeeklyEarnings.toFixed(0)}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <p className="text-xs text-slate-600">Avg Rate</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">${avgRate.toFixed(2)}/hr</p>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>{totalEntries} total entries</span>
          <span>{avgWeeklyHours.toFixed(1)}h avg/week</span>
        </div>
      </div>
    </div>
  );
}
