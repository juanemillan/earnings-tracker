import React from 'react';

export function BreakdownTable({
  activeBreakdown,
  setActiveBreakdown,
  weeklyStatsInRange,
  dailyStatsInRange,
  timeGoalHours,
  page,
  setPage,
  pageSize,
  setPageSize,
  formatDateRange,
  showRowSelector = true // Show row selector by default (for Original UI)
}) {
  // Pagination logic for weekly
  const totalWeekly = weeklyStatsInRange.length;
  const totalWeeklyPages = Math.max(1, Math.ceil(totalWeekly / pageSize));
  const weeklyStartIdx = (page - 1) * pageSize;
  const pagedWeekly = weeklyStatsInRange.slice(weeklyStartIdx, weeklyStartIdx + pageSize);

  // Pagination logic for daily
  const totalDaily = dailyStatsInRange.length;
  const totalDailyPages = Math.max(1, Math.ceil(totalDaily / pageSize));
  const dailyStartIdx = (page - 1) * pageSize;
  const pagedDaily = dailyStatsInRange.slice(dailyStartIdx, dailyStartIdx + pageSize);

  // Determine which set to use based on active breakdown
  const totalPages = activeBreakdown === 'weekly' ? totalWeeklyPages : totalDailyPages;
  const currPage = Math.min(page, totalPages);

  // Visible pages for pagination
  const visiblePages = React.useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currPage === 1) return [1, 2, 3];
    if (currPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [currPage - 1, currPage, currPage + 1];
  }, [currPage, totalPages]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Detailed Breakdown</h2>
          <p className="text-sm text-slate-600">
            {activeBreakdown === 'weekly' ? 'Weekly totals (current range)' : 'Daily totals (current range)'}
          </p>
        </div>
        
        {/* Weekly/Daily toggle */}
        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setActiveBreakdown('weekly')}
            className={`px-3 py-1.5 text-sm font-medium ${
              activeBreakdown === 'weekly' 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveBreakdown('daily')}
            className={`px-3 py-1.5 text-sm font-medium ${
              activeBreakdown === 'daily' 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200">
        {activeBreakdown === 'weekly' && (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Week</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hours Remaining/Extra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entries</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pay Types</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {pagedWeekly.map((week, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {formatDateRange(week.weekStart, week.weekEnd)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {week.totalHours.toFixed(1)}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(() => {
                      const hoursRemaining = week.totalHours - timeGoalHours;
                      const isOvertime = hoursRemaining >= 0;
                      return (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isOvertime 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isOvertime ? '+' : ''}{hoursRemaining.toFixed(1)}h
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    ${week.totalEarnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    ${week.avgHourlyRate.toFixed(2)}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {week.entryCount}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="max-w-xs">
                      {week.projects.map((project, i) => (
                        <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {project}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="max-w-xs">
                      {Object.entries(week.payTypes).map(([type, count]) => (
                        <span key={type} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {type}: {count}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeBreakdown === 'daily' && (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entries</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pay Types</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {pagedDaily.map((day, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {day.totalHours.toFixed(1)}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    ${day.totalEarnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    ${day.avgHourlyRate.toFixed(2)}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {day.entryCount}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="max-w-xs">
                      {day.projects.map((project, i) => (
                        <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {project}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    <div className="max-w-xs">
                      {Object.entries(day.payTypes).map(([type, count]) => (
                        <span key={type} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                          {type}: {count}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {activeBreakdown === 'weekly' && pagedWeekly.map((week, idx) => {
          const diff = week.totalHours - timeGoalHours;
          const isOver = diff >= 0;
          return (
            <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">
                  {formatDateRange(week.weekStart, week.weekEnd)}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  isOver ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isOver ? '+' : ''}{diff.toFixed(1)}h
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div>Hours: <span className="font-semibold">{week.totalHours.toFixed(1)}h</span></div>
                <div>Earnings: <span className="font-semibold">${week.totalEarnings.toFixed(2)}</span></div>
                <div>Avg: <span className="font-semibold">${week.avgHourlyRate.toFixed(2)}/hr</span></div>
                <div>Entries: <span className="font-semibold">{week.entryCount}</span></div>
              </div>
              {!!week.projects?.length && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {week.projects.slice(0, 4).map((p, i) => (
                    <span key={i} className="inline-block bg-blue-100 text-blue-800 text-[11px] px-2 py-0.5 rounded-full">
                      {p}
                    </span>
                  ))}
                  {week.projects.length > 4 && (
                    <span className="text-[11px] text-slate-500">+{week.projects.length - 4} more</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {activeBreakdown === 'daily' && pagedDaily.map((day, idx) => (
          <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">
                {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h4>
              <span className="text-[11px] text-slate-600">
                {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div>Hours: <span className="font-semibold">{day.totalHours.toFixed(1)}h</span></div>
              <div>Earnings: <span className="font-semibold">${day.totalEarnings.toFixed(2)}</span></div>
              <div>Avg: <span className="font-semibold">${day.avgHourlyRate.toFixed(2)}/hr</span></div>
              <div>Entries: <span className="font-semibold">{day.entryCount}</span></div>
            </div>
            {!!day.projects?.length && (
              <div className="mt-2 flex flex-wrap gap-1">
                {day.projects.slice(0, 4).map((p, i) => (
                  <span key={i} className="inline-block bg-blue-100 text-blue-800 text-[11px] px-2 py-0.5 rounded-full">
                    {p}
                  </span>
                ))}
                {day.projects.length > 4 && (
                  <span className="text-[11px] text-slate-500">+{day.projects.length - 4} more</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-2 py-1 rounded-md text-sm border bg-slate-50 text-slate-700 hover:bg-white"
          aria-label="Previous page"
        >
          ‹
        </button>
        {visiblePages.map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded-md text-sm font-medium border ${
              p === currPage 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
            }`}
            aria-label={`Go to page ${p}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          className="px-2 py-1 rounded-md text-sm border bg-slate-50 text-slate-700 hover:bg-white"
          aria-label="Next page"
        >
          ›
        </button>

        {showRowSelector && (
          <div className="ml-3 flex items-center gap-1">
            <label className="text-xs text-slate-600">Rows</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-slate-300 rounded-md text-sm bg-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
