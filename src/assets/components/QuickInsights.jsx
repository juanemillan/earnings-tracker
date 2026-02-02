import React from 'react';
import { TrendingUp, Target, Award, Zap, DollarSign, Flame, Briefcase } from 'lucide-react';

const QuickInsights = ({ 
  weeklyStats, 
  dailyBreakdown, 
  goalHoursPerWeek,
  currentWeekHours,
  currentWeekEarnings,
  entries 
}) => {
  const insights = React.useMemo(() => {
    if (weeklyStats.length === 0) return [];

    const result = [];

    // 1. Best Week (by earnings)
    if (weeklyStats.length > 0) {
      const bestWeek = weeklyStats.reduce((max, week) => 
        week.totalEarnings > max.totalEarnings ? week : max
      , weeklyStats[0]);

      result.push({
        icon: DollarSign,
        color: 'text-green-600',
        bg: 'bg-green-50',
        label: 'Best Week',
        value: `$${bestWeek.totalEarnings.toFixed(0)}`,
        detail: `${bestWeek.totalHours.toFixed(1)}h`,
      });
    }

    // 2. Active Streak (consecutive weeks from most recent)
    if (weeklyStats.length > 0) {
      const sortedWeeks = [...weeklyStats].sort((a, b) => b.weekStart - a.weekStart);
      let streak = 0;
      
      // Start from most recent week and count backwards
      for (let i = 0; i < sortedWeeks.length - 1; i++) {
        const currentWeek = sortedWeeks[i];
        const nextWeek = sortedWeeks[i + 1];
        
        if (currentWeek.totalHours > 0) {
          streak = i + 1; // Count this week
          
          // Check if next week is consecutive (7 days apart)
          const weeksDiff = Math.abs(currentWeek.weekStart - nextWeek.weekStart) / (1000 * 60 * 60 * 24 * 7);
          
          if (weeksDiff > 1.5) { // More than 1.5 weeks apart = gap
            break;
          }
        } else {
          break;
        }
      }
      
      // Count the last week if we got through all of them
      if (streak === sortedWeeks.length - 1 && sortedWeeks[sortedWeeks.length - 1].totalHours > 0) {
        streak++;
      }

      if (streak > 0) {
        result.push({
          icon: Flame,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          label: 'Active Streak',
          value: `${streak} wk${streak > 1 ? 's' : ''}`,
          detail: 'Keep going!',
        });
      }
    }

    // 3. Top Project (by percentage) - skip if all Unknown
    if (entries && entries.length > 0) {
      const projectCounts = {};
      entries.forEach(entry => {
        const project = entry.projectName || 'Unknown';
        projectCounts[project] = (projectCounts[project] || 0) + 1;
      });

      const totalEntries = entries.length;
      const topProject = Object.entries(projectCounts)
        .map(([name, count]) => ({ name, count, percentage: (count / totalEntries) * 100 }))
        .sort((a, b) => b.count - a.count)[0];

      // Only show if not all entries are Unknown
      if (topProject && !(topProject.name === 'Unknown' && topProject.percentage === 100)) {
        result.push({
          icon: Briefcase,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          label: 'Top Project',
          value: topProject.name.length > 15 ? topProject.name.substring(0, 15) + '...' : topProject.name,
          detail: `${topProject.percentage.toFixed(0)}%`,
        });
      }
    }

    // 4. Best performing day
    if (dailyBreakdown.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStats = {};
      
      dailyBreakdown.forEach(day => {
        const dayOfWeek = day.date.getDay();
        const dayName = dayNames[dayOfWeek];
        if (!dayStats[dayName]) {
          dayStats[dayName] = { hours: 0, count: 0 };
        }
        dayStats[dayName].hours += day.totalHours;
        dayStats[dayName].count += 1;
      });

      const bestDay = Object.entries(dayStats)
        .map(([name, stats]) => ({ name, avgHours: stats.hours / stats.count }))
        .sort((a, b) => b.avgHours - a.avgHours)[0];

      if (bestDay) {
        result.push({
          icon: Award,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          label: 'Best Day',
          value: bestDay.name,
          detail: `${bestDay.avgHours.toFixed(1)}h avg`,
        });
      }
    }

    return result.slice(0, 6); // Max 6 insights
  }, [weeklyStats, dailyBreakdown, goalHoursPerWeek, currentWeekHours, entries]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Quick Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${insight.bg}`}>
                <Icon className={insight.color} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">{insight.label}</p>
                <p className="text-sm font-semibold text-slate-900 truncate">{insight.value}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 truncate">{insight.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickInsights;
