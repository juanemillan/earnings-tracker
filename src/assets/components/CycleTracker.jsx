import React from 'react';

export function CycleTracker({ 
  cycles, 
  timeGoalHours, 
  cyclePage, 
  setCyclePage,
  fmtH2 
}) {
  // Pagination logic
  const cyclesPerPage = 6;
  const cycleTotalPages = Math.ceil(cycles.length / cyclesPerPage);
  const cycleCurrPage = Math.min(cyclePage, cycleTotalPages || 1);
  const cycleStart = (cycleCurrPage - 1) * cyclesPerPage;
  const cyclesPaged = cycles.slice(cycleStart, cycleStart + cyclesPerPage);

  // Visible page numbers for pagination
  const cycleVisiblePages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, cycleCurrPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(cycleTotalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    cycleVisiblePages.push(i);
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6">
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">4-Week Cycle Progress</h2>
          <p className="text-sm text-slate-600">Target: {fmtH2(timeGoalHours * 4)} hours per 4-week cycle</p>
        </div>

        {/* Pagination */}
        {cycleTotalPages > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCyclePage(p => Math.max(1, p - 1))}
              className="px-2 py-1 rounded-md text-sm border bg-slate-50 text-slate-700 hover:bg-white"
              aria-label="Previous page"
            >
              ‹
            </button>
            {cycleVisiblePages.map(p => (
              <button
                key={p}
                onClick={() => setCyclePage(p)}
                className={`px-3 py-1 rounded-md text-sm font-medium border ${
                  p === cycleCurrPage
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                }`}
                aria-label={`Go to page ${p}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCyclePage(p => Math.min(cycleTotalPages, p + 1))}
              className="px-2 py-1 rounded-md text-sm border bg-slate-50 text-slate-700 hover:bg-white"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {cyclesPaged.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-slate-500">
          No 4-week cycles yet — complete at least 4 weeks to see progress
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {cyclesPaged.map((cycle, index) => {
            const pct = Math.min(cycle.progressPercentage ?? 0, 100);
            return (
              <div
                key={`${cycle.cycleNumber}-${index}`}
                className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                {/* soft tone background */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      pct >= 100
                        ? 'linear-gradient(135deg, rgba(16,185,129,.08), rgba(5,150,105,.08))'
                        : pct >= 75
                        ? 'linear-gradient(135deg, rgba(59,130,246,.08), rgba(99,102,241,.08))'
                        : pct >= 50
                        ? 'linear-gradient(135deg, rgba(234,179,8,.08), rgba(249,115,22,.08))'
                        : 'linear-gradient(135deg, rgba(239,68,68,.08), rgba(236,72,153,.08))',
                  }}
                />
                {/* top glow */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                <div className="relative p-4">
                  {/* header row */}
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Cycle {cycle.cycleNumber}
                      {!cycle.isComplete && cycle.isActive && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          In Progress
                        </span>
                      )}
                      {!cycle.isComplete && !cycle.isActive && (
                        <span className="ml-2 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                          Incomplete
                        </span>
                      )}
                    </h3>
                    <span className="text-sm text-slate-600">
                      {cycle.weekCount} week{cycle.weekCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* date range */}
                  <p className="mb-3 text-sm text-slate-600">
                    {cycle.startWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                    {cycle.endWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  {/* progress bar */}
                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-slate-900">
                        {fmtH2(cycle.totalHours)}h / {fmtH2(cycle.targetHours)}h
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          pct >= 100
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : pct >= 75
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            : pct >= 50
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 text-center">
                      <span className={`text-sm font-medium ${pct >= 100 ? 'text-green-600' : 'text-slate-600'}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-2 text-center shadow-sm border border-slate-200">
                      <p className="text-xs text-slate-600">Hours Status</p>
                      <p className={`text-sm font-bold ${cycle.hoursRemaining <= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                        {cycle.hoursRemaining <= 0 ? '+' : ''}
                        {fmtH2(Math.abs(cycle.hoursRemaining))}h
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-2 text-center shadow-sm border border-slate-200">
                      <p className="text-xs text-slate-600">Earnings</p>
                      <p className="text-sm font-bold text-slate-900">
                        ${Math.round(cycle.totalEarnings).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* badges */}
                  <div className="mt-3 text-center">
                    {cycle.isComplete && pct >= 100 && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        🎉 Target Achieved!
                      </span>
                    )}
                    {cycle.isComplete && cycle.hasEnded && pct < 100 && (
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800">
                        ⚠️ Target Missed
                      </span>
                    )}
                    {cycle.isComplete && cycle.isActive && pct < 100 && (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                        ⏰ Final push! {fmtH2(cycle.hoursRemaining)}h to go!
                      </span>
                    )}
                    {!cycle.isComplete && cycle.isActive && (
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                        🚀 {4 - cycle.weekCount} week{4 - cycle.weekCount !== 1 ? 's' : ''} remaining
                      </span>
                    )}
                    {!cycle.isComplete && !cycle.isActive && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        📋 Cycle ended incomplete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Placeholder cuando solo hay un ciclo en la página */}
          {cyclesPaged.length === 1 && (
            <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-300">
              <div className="relative p-4 flex flex-col items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-500 mb-2">No more cycles</h3>
                  <p className="text-sm text-slate-400">
                    Continue working to complete more 4-week cycles
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* page indicator */}
      {cycleTotalPages > 1 && (
        <div className="mt-4 text-center text-xs text-slate-500">
          Page {cycleCurrPage} of {cycleTotalPages}
        </div>
      )}
    </div>
  );
}
