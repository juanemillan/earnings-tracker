import React from 'react';
import { Calendar, Clock, DollarSign, TrendingUp } from 'lucide-react';

export function CurrentWeekProgress({ 
  currentWeekHours = 0,
  currentWeekEarnings = 0,
  goalHoursPerWeek = 30,
  daysRemainingInWeek = 0,
  currentWeekStart,
  currentWeekEnd
}) {
  const progressPercentage = Math.min((currentWeekHours / goalHoursPerWeek) * 100, 100);
  const hoursRemaining = Math.max(0, goalHoursPerWeek - currentWeekHours);
  const isOverGoal = currentWeekHours >= goalHoursPerWeek;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: isOverGoal
            ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))'
            : 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(79,70,229,0.08))',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`p-2 rounded-lg ${isOverGoal ? 'bg-green-100' : 'bg-indigo-100'}`}>
            <Calendar className={`w-4 h-4 ${isOverGoal ? 'text-green-600' : 'text-indigo-600'}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Current Week Progress</h3>
            {currentWeekStart && currentWeekEnd && (
              <p className="text-xs text-slate-500">
                {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {currentWeekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-600 mb-2">
            <span>Progress</span>
            <span className="font-semibold">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOverGoal
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : progressPercentage >= 75
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : progressPercentage >= 50
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-600">Hours</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {currentWeekHours.toFixed(1)}h
              <span className="text-xs font-normal text-slate-500"> / {goalHoursPerWeek}h</span>
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-600">Earned</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              ${currentWeekEarnings.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Status message */}
        <div className={`rounded-lg p-3 ${
          isOverGoal
            ? 'bg-green-50 border border-green-200'
            : hoursRemaining === 0
            ? 'bg-slate-50 border border-slate-200'
            : 'bg-indigo-50 border border-indigo-200'
        }`}>
          {isOverGoal ? (
            <div className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-900">
                Goal achieved! +{(currentWeekHours - goalHoursPerWeek).toFixed(1)}h over target
              </span>
            </div>
          ) : hoursRemaining === 0 ? (
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="font-medium text-slate-700">
                On track to reach your goal
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="font-medium text-indigo-900">
                {hoursRemaining.toFixed(1)}h remaining • {daysRemainingInWeek} days left
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
