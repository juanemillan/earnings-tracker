import React from 'react';
import { TrendingUp } from 'lucide-react';

const WeeklyHeatmap = ({ dailyBreakdown }) => {
  // Calculate stats for the last 7 days window
  const dayStats = React.useMemo(() => {
    if (dailyBreakdown.length === 0) {
      return [];
    }

    // Find the most recent date in the data
    const mostRecentDate = dailyBreakdown.reduce((latest, day) => 
      day.date > latest ? day.date : latest
    , dailyBreakdown[0].date);

    // Create array of the last 7 days (including today)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(mostRecentDate);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    // Map each day of week to its data from the last 7 days
    const dayOfWeekMap = {
      0: { name: 'Sun', data: null },
      1: { name: 'Mon', data: null },
      2: { name: 'Tue', data: null },
      3: { name: 'Wed', data: null },
      4: { name: 'Thu', data: null },
      5: { name: 'Fri', data: null },
      6: { name: 'Sat', data: null },
    };

    // Find data for each day in the last 7 days window
    last7Days.forEach(targetDate => {
      const dayOfWeek = targetDate.getDay();
      const matchingDay = dailyBreakdown.find(day => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0, 0, 0, 0);
        return dayDate.getTime() === targetDate.getTime();
      });

      if (matchingDay) {
        dayOfWeekMap[dayOfWeek] = {
          name: dayOfWeekMap[dayOfWeek].name,
          data: {
            hours: matchingDay.totalHours,
            earnings: matchingDay.totalEarnings,
            date: targetDate,
          }
        };
      }
    });

    return Object.values(dayOfWeekMap);
  }, [dailyBreakdown]);

  const maxHours = Math.max(...dayStats.map(d => d.data?.hours || 0), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Last 7 Days Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Hours worked per day of week</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <TrendingUp className="text-blue-600" size={18} />
        </div>
      </div>

      <div className="space-y-2">
        {dayStats.map((day, idx) => {
          const hours = day.data?.hours || 0;
          const percentage = (hours / maxHours) * 100;
          const isWeekend = idx === 0 || idx === 6;
          const dateStr = day.data?.date 
            ? day.data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '';
          
          return (
            <div key={day.name} className="group">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex flex-col items-start w-20">
                  <span className={`text-xs font-medium ${
                    isWeekend ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {day.name}
                  </span>
                  <span className={`text-[9px] truncate w-full ${
                    dateStr ? 'text-slate-400' : 'text-slate-300'
                  }`}>
                    {dateStr || '\u00A0'}
                  </span>
                </div>
                <div className="flex-1 h-7 bg-slate-100 rounded-md overflow-hidden relative">
                  {hours > 0 && (
                    <div
                      className={`h-full transition-all duration-300 ${
                        percentage > 80 
                          ? 'bg-gradient-to-r from-green-400 to-green-500'
                          : percentage > 60
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                          : percentage > 40
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          : 'bg-gradient-to-r from-slate-300 to-slate-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-end px-2">
                    <span className="text-[11px] font-semibold text-slate-700 drop-shadow-sm">
                      {hours > 0 ? `${hours.toFixed(1)}h` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Total Last 7 Days</span>
          <span className="font-semibold text-slate-700">
            {dayStats.reduce((sum, day) => sum + (day.data?.hours || 0), 0).toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyHeatmap;
