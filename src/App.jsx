import React, { useState, useCallback, useRef } from 'react';
import { Upload, Calendar, DollarSign, Clock, TrendingUp, FileText, Plus, Download, BarChart3, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EarningsTracker = () => {
  const [entries, setEntries] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [activeChart, setActiveChart] = useState('trends');
  const [activeBreakdown, setActiveBreakdown] = useState('weekly');
  const fileInputRef = useRef(null);

  // Helper function to get the Tuesday start of week for any date
  const getTuesdayWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day < 2 ? day + 5 : day - 2; // Tuesday = 2, adjust accordingly
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Helper function to parse duration string to hours
  const parseDurationToHours = (duration) => {
    if (!duration) return 0;
    
    // Handle formats like "1h 30m", "59m 56s", "2h 10m 0s", etc.
    const hourMatch = duration.match(/(\d+)h/);
    const minuteMatch = duration.match(/(\d+)m/);
    const secondMatch = duration.match(/(\d+)s/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    const seconds = secondMatch ? parseInt(secondMatch[1]) : 0;
    
    return hours + minutes / 60 + seconds / 3600;
  };

  // Helper function to parse payout amount
  const parsePayoutAmount = (payout) => {
    if (!payout) return 0;
    return parseFloat(payout.toString().replace(/[$,]/g, '')) || 0;
  };

  // Helper function to parse date
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr);
  };

  // Calculate weekly statistics
  const calculateWeeklyStats = (allEntries) => {
    const weekMap = new Map();
    
    allEntries.forEach(entry => {
      const date = parseDate(entry.workDate);
      if (!date || isNaN(date.getTime())) return;
      
      const weekStart = getTuesdayWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          weekStart: weekStart,
          weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
          totalHours: 0,
          totalEarnings: 0,
          entryCount: 0,
          projects: new Set(),
          payTypes: new Map()
        });
      }
      
      const weekData = weekMap.get(weekKey);
      const hours = parseDurationToHours(entry.duration);
      const earnings = parsePayoutAmount(entry.payout);
      
      weekData.totalHours += hours;
      weekData.totalEarnings += earnings;
      weekData.entryCount += 1;
      
      if (entry.projectName) {
        weekData.projects.add(entry.projectName);
      }
      
      if (entry.payType) {
        const currentCount = weekData.payTypes.get(entry.payType) || 0;
        weekData.payTypes.set(entry.payType, currentCount + 1);
      }
    });
    
    return Array.from(weekMap.values())
      .sort((a, b) => b.weekStart - a.weekStart)
      .map(week => ({
        ...week,
        projects: Array.from(week.projects),
        payTypes: Object.fromEntries(week.payTypes),
        avgHourlyRate: week.totalHours > 0 ? week.totalEarnings / week.totalHours : 0
      }));
  };

  // Parse CSV content
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const newEntries = [];
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length >= headers.length && values.some(v => v)) {
        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = values[index] || null;
        });
        
        // Only add entries with valid data
        if (entry.workDate || entry.itemID || entry.duration || entry.payout) {
          newEntries.push(entry);
        }
      }
    }
    
    return newEntries;
  };

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const newEntries = parseCSV(csvText);
        
        // Filter out entries that already exist (based on itemID and workDate)
        const existingKeys = new Set(
          entries.map(entry => `${entry.itemID}-${entry.workDate}`)
        );
        
        const uniqueNewEntries = newEntries.filter(entry => {
          const key = `${entry.itemID}-${entry.workDate}`;
          return !existingKeys.has(key) && (entry.itemID || entry.workDate);
        });
        
        const updatedEntries = [...entries, ...uniqueNewEntries];
        setEntries(updatedEntries);
        setWeeklyStats(calculateWeeklyStats(updatedEntries));
        
        setUploadStatus(`✅ Added ${uniqueNewEntries.length} new entries (${newEntries.length - uniqueNewEntries.length} duplicates skipped)`);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        setUploadStatus(`❌ Error parsing CSV: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  }, [entries]);

  // Load initial data
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const csvContent = await window.fs.readFile('Earnings_Report.csv', { encoding: 'utf8' });
        const initialEntries = parseCSV(csvContent);
        setEntries(initialEntries);
        setWeeklyStats(calculateWeeklyStats(initialEntries));
        setUploadStatus('✅ Initial data loaded successfully');
      } catch (error) {
        setUploadStatus('ℹ️ No initial data found. Upload a CSV to get started.');
      }
    };
    
    loadInitialData();
  }, []);

  // Export data as CSV
  const exportData = () => {
    if (weeklyStats.length === 0) {
      setUploadStatus('❌ No data to export. Please upload some earnings data first.');
      return;
    }

    const headers = [
      'Week Start',
      'Week End', 
      'Total Hours',
      'Hours Remaining/Extra',
      'Total Earnings',
      'Average Hourly Rate',
      'Entry Count',
      'Projects',
      'Pay Types'
    ];
    
    const csvRows = weeklyStats.map(week => {
      const hoursRemaining = (week.totalHours - 30).toFixed(1);
      const hoursRemainingText = week.totalHours >= 30 ? `+${hoursRemaining}` : hoursRemaining;
      
      return [
        week.weekStart.toISOString().split('T')[0],
        week.weekEnd.toISOString().split('T')[0],
        week.totalHours.toFixed(2),
        hoursRemainingText,
        week.totalEarnings.toFixed(2),
        week.avgHourlyRate.toFixed(2),
        week.entryCount,
        `"${week.projects.join('; ')}"`,
        `"${Object.entries(week.payTypes).map(([type, count]) => `${type}:${count}`).join('; ')}"`
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `weekly_earnings_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setUploadStatus(`✅ Weekly report exported successfully! (${weeklyStats.length} weeks)`);
    } else {
      setUploadStatus('❌ Export not supported in this browser. Please try a different browser.');
    }
  };

  // Calculate total stats
  const totalStats = {
    totalHours: weeklyStats.reduce((sum, week) => sum + week.totalHours, 0),
    totalEarnings: weeklyStats.reduce((sum, week) => sum + week.totalEarnings, 0),
    totalEntries: entries.length,
    avgWeeklyHours: weeklyStats.length > 0 ? weeklyStats.reduce((sum, week) => sum + week.totalHours, 0) / weeklyStats.length : 0,
    avgWeeklyEarnings: weeklyStats.length > 0 ? weeklyStats.reduce((sum, week) => sum + week.totalEarnings, 0) / weeklyStats.length : 0
  };

  // Prepare chart data
  const chartData = {
    trends: weeklyStats.slice().reverse().map(week => ({
      week: `${week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      hours: week.totalHours,
      earnings: week.totalEarnings,
      target: 30,
      surplus: week.totalHours - 30
    })),
    
    projects: (() => {
      const projectStats = {};
      entries.forEach(entry => {
        if (entry.projectName && entry.payout) {
          const project = entry.projectName;
          const earnings = parsePayoutAmount(entry.payout);
          const hours = parseDurationToHours(entry.duration);
          
          if (!projectStats[project]) {
            projectStats[project] = { name: project, earnings: 0, hours: 0, entries: 0 };
          }
          projectStats[project].earnings += earnings;
          projectStats[project].hours += hours;
          projectStats[project].entries += 1;
        }
      });
      
      return Object.values(projectStats)
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 8); // Top 8 projects
    })(),
    
    payTypes: (() => {
      const payTypeStats = {};
      entries.forEach(entry => {
        if (entry.payType && entry.payout) {
          const type = entry.payType;
          const earnings = parsePayoutAmount(entry.payout);
          
          if (!payTypeStats[type]) {
            payTypeStats[type] = { name: type, value: 0, count: 0 };
          }
          payTypeStats[type].value += earnings;
          payTypeStats[type].count += 1;
        }
      });
      
      return Object.values(payTypeStats);
    })(),
    
    daily: (() => {
      const dailyStats = {};
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      
      entries.forEach(entry => {
        const date = parseDate(entry.workDate);
        if (date && date >= last30Days && entry.payout) {
          const dateKey = date.toISOString().split('T')[0];
          const earnings = parsePayoutAmount(entry.payout);
          const hours = parseDurationToHours(entry.duration);
          
          if (!dailyStats[dateKey]) {
            dailyStats[dateKey] = { date: dateKey, hours: 0, earnings: 0 };
          }
          dailyStats[dateKey].hours += hours;
          dailyStats[dateKey].earnings += earnings;
        }
      });
      
      return Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date));
    })(),

    // Detailed daily breakdown for table
    dailyBreakdown: (() => {
      const dailyMap = new Map();
      
      entries.forEach(entry => {
        const date = parseDate(entry.workDate);
        if (!date || isNaN(date.getTime())) return;
        
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, {
            date: date,
            totalHours: 0,
            totalEarnings: 0,
            entryCount: 0,
            projects: new Set(),
            payTypes: new Map(),
            entries: []
          });
        }
        
        const dayData = dailyMap.get(dateKey);
        const hours = parseDurationToHours(entry.duration);
        const earnings = parsePayoutAmount(entry.payout);
        
        dayData.totalHours += hours;
        dayData.totalEarnings += earnings;
        dayData.entryCount += 1;
        dayData.entries.push(entry);
        
        if (entry.projectName) {
          dayData.projects.add(entry.projectName);
        }
        
        if (entry.payType) {
          const currentCount = dayData.payTypes.get(entry.payType) || 0;
          dayData.payTypes.set(entry.payType, currentCount + 1);
        }
      });
      
      return Array.from(dailyMap.values())
        .sort((a, b) => b.date - a.date)
        .map(day => ({
          ...day,
          projects: Array.from(day.projects),
          payTypes: Object.fromEntries(day.payTypes),
          avgHourlyRate: day.totalHours > 0 ? day.totalEarnings / day.totalHours : 0
        }));
    })()
  };

  // Calculate 4-week cycles (starting from 2nd week)
  const calculate4WeekCycles = () => {
    if (weeklyStats.length < 2) return [];
    
    const cycles = [];
    const sortedWeeks = weeklyStats.slice().reverse(); // Oldest first
    const today = new Date();
    
    // Start from the 2nd week (index 1)
    for (let i = 1; i < sortedWeeks.length; i += 4) {
      const cycleWeeks = sortedWeeks.slice(i, i + 4);
      if (cycleWeeks.length === 0) continue;
      
      const cycleStats = {
        cycleNumber: Math.floor((i - 1) / 4) + 1,
        startWeek: cycleWeeks[0].weekStart,
        endWeek: cycleWeeks[cycleWeeks.length - 1].weekEnd,
        weeks: cycleWeeks,
        totalHours: cycleWeeks.reduce((sum, week) => sum + week.totalHours, 0),
        totalEarnings: cycleWeeks.reduce((sum, week) => sum + week.totalEarnings, 0),
        weekCount: cycleWeeks.length,
        isComplete: cycleWeeks.length === 4
      };
      
      cycleStats.targetHours = cycleStats.weekCount * 30; // 30 hours per week
      cycleStats.hoursRemaining = cycleStats.targetHours - cycleStats.totalHours;
      cycleStats.progressPercentage = Math.min((cycleStats.totalHours / cycleStats.targetHours) * 100, 100);
      
      // Check if cycle is still active (end date is today or in the future)
      cycleStats.isActive = cycleStats.endWeek >= today;
      cycleStats.hasEnded = cycleStats.endWeek < today;
      
      cycles.push(cycleStats);
    }
    
    return cycles.reverse(); // Most recent first
  };

  const fourWeekCycles = calculate4WeekCycles();

  // Format date range for display
  const formatDateRange = (start, end) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Chart components
  const renderTrendsChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData.trends}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis yAxisId="hours" orientation="left" />
        <YAxis yAxisId="earnings" orientation="right" />
        <Tooltip />
        <Legend />
        <Line 
          yAxisId="hours" 
          type="monotone" 
          dataKey="hours" 
          stroke="#3B82F6" 
          strokeWidth={3} 
          name="Hours Worked"
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
        />
        <Line 
          yAxisId="hours" 
          type="monotone" 
          dataKey="target" 
          stroke="#EF4444" 
          strokeDasharray="5 5" 
          name="30h Target"
          dot={false}
        />
        <Line 
          yAxisId="earnings" 
          type="monotone" 
          dataKey="earnings" 
          stroke="#10B981" 
          strokeWidth={3} 
          name="Earnings ($)"
          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderProjectChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData.projects} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis yAxisId="earnings" orientation="left" />
        <YAxis yAxisId="hours" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="earnings" dataKey="earnings" fill="#3B82F6" name="Earnings ($)" />
        <Bar yAxisId="hours" dataKey="hours" fill="#10B981" name="Hours" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPayTypeChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsPieChart>
        <Pie
          data={chartData.payTypes}
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          label={({ name, value, percent }) => `${name}: $${value.toFixed(2)} (${(percent * 100).toFixed(1)}%)`}
        >
          {chartData.payTypes.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );

  const renderDailyChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData.daily}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis yAxisId="hours" orientation="left" />
        <YAxis yAxisId="earnings" orientation="right" />
        <Tooltip 
          labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        />
        <Legend />
        <Bar yAxisId="hours" dataKey="hours" fill="#F59E0B" name="Hours" />
        <Bar yAxisId="earnings" dataKey="earnings" fill="#8B5CF6" name="Earnings ($)" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Earnings Tracker</h1>
        <p className="text-gray-600">Track your weekly earnings with automatic CSV import and duplicate detection</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Upload className="mr-2" size={24} />
            Upload New Data
          </h2>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="mr-2" size={16} />
            Export Weekly Report
          </button>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Plus className="text-gray-400 mb-2" size={48} />
            <span className="text-lg font-medium text-gray-700">Upload CSV File</span>
            <span className="text-sm text-gray-500">Only new entries will be added automatically</span>
          </label>
        </div>
        
        {uploadStatus && (
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 sm:grid-cols-1 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">Total Entries</p>
              <p className="text-xl font-bold text-gray-900">{totalStats.totalEntries}</p>
            </div>
            <FileText className="text-blue-500 flex-shrink-0 ml-2" size={20} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">Total Hours</p>
              <p className="text-xl font-bold text-gray-900">{totalStats.totalHours.toFixed(1)}</p>
            </div>
            <Clock className="text-green-500 flex-shrink-0 ml-2" size={20} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">Total Earnings</p>
              <p className="text-xl font-bold text-gray-900">${totalStats.totalEarnings.toFixed(2)}</p>
            </div>
            <DollarSign className="text-purple-500 flex-shrink-0 ml-2" size={20} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">Avg Weekly Hours</p>
              <p className="text-xl font-bold text-gray-900">{totalStats.avgWeeklyHours.toFixed(1)}</p>
            </div>
            <BarChart3 className="text-orange-500 flex-shrink-0 ml-2" size={20} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">Avg Weekly Pay</p>
              <p className="text-xl font-bold text-gray-900">${totalStats.avgWeeklyEarnings.toFixed(2)}</p>
            </div>
            <TrendingUp className="text-red-500 flex-shrink-0 ml-2" size={20} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="mr-2" size={24} />
              Analytics Dashboard
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveChart('trends')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChart === 'trends' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📈 Trends
              </button>
              <button
                onClick={() => setActiveChart('projects')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChart === 'projects' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Projects
              </button>
              <button
                onClick={() => setActiveChart('payTypes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChart === 'payTypes' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🥧 Pay Types
              </button>
              <button
                onClick={() => setActiveChart('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChart === 'daily' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Daily (30d)
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {activeChart === 'trends' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Hours vs Earnings Trend</h3>
              <p className="text-sm text-gray-600 mb-4">Track your weekly performance against the 30-hour target</p>
              {renderTrendsChart()}
            </div>
          )}
          
          {activeChart === 'projects' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Performance</h3>
              <p className="text-sm text-gray-600 mb-4">Compare earnings and time spent across different projects</p>
              {renderProjectChart()}
            </div>
          )}
          
          {activeChart === 'payTypes' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Type Distribution</h3>
              <p className="text-sm text-gray-600 mb-4">Breakdown of earnings by payment type</p>
              {renderPayTypeChart()}
            </div>
          )}
          
          {activeChart === 'daily' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity (Last 30 Days)</h3>
              <p className="text-sm text-gray-600 mb-4">See your daily work patterns and earnings</p>
              {renderDailyChart()}
            </div>
          )}
        </div>
      </div>

      {/* 4-Week Cycle Tracker */}
      {fourWeekCycles.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="mr-2" size={24} />
              4-Week Cycle Progress
            </h2>
            <span className="text-sm text-gray-500">Target: 120 hours per 4-week cycle</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fourWeekCycles.map((cycle, index) => {
              // Smart responsive layout for odd numbers
              const isLastOdd = index === fourWeekCycles.length - 1 && fourWeekCycles.length % 2 === 1;
              
              return (
                <div 
                  key={index} 
                  className={`border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 ${
                    isLastOdd ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Cycle {cycle.cycleNumber}
                      {!cycle.isComplete && cycle.isActive && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          In Progress
                        </span>
                      )}
                      {!cycle.isComplete && !cycle.isActive && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Incomplete
                        </span>
                      )}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {cycle.weekCount} week{cycle.weekCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">
                      {cycle.startWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                      {cycle.endWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {cycle.totalHours.toFixed(1)}h / {cycle.targetHours}h
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          cycle.progressPercentage >= 100 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : cycle.progressPercentage >= 75 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                            : cycle.progressPercentage >= 50
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(cycle.progressPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-center mt-1">
                      <span className={`text-sm font-medium ${
                        cycle.progressPercentage >= 100 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {cycle.progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                      <p className="text-xs text-gray-600">Hours Status</p>
                      <p className={`text-sm font-bold ${
                        cycle.hoursRemaining <= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {cycle.hoursRemaining <= 0 ? '+' : ''}{(-cycle.hoursRemaining).toFixed(1)}h
                      </p>
                    </div>
                    
                    <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                      <p className="text-xs text-gray-600">Earnings</p>
                      <p className="text-sm font-bold text-gray-900">
                        ${cycle.totalEarnings.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Smart Achievement/Status Badges */}
                  <div className="mt-3 text-center">
                    {cycle.isComplete && cycle.progressPercentage >= 100 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🎉 Target Achieved!
                      </span>
                    )}
                    
                    {cycle.isComplete && cycle.hasEnded && cycle.progressPercentage < 100 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ⚠️ Target Missed
                      </span>
                    )}
                    
                    {cycle.isComplete && cycle.isActive && cycle.progressPercentage < 100 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        ⏰ Final push! {cycle.hoursRemaining.toFixed(1)}h to go!
                      </span>
                    )}
                    
                    {!cycle.isComplete && cycle.isActive && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🚀 {4 - cycle.weekCount} week{4 - cycle.weekCount !== 1 ? 's' : ''} remaining
                      </span>
                    )}
                    
                    {!cycle.isComplete && !cycle.isActive && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        📋 Cycle ended incomplete
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {fourWeekCycles.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No 4-week cycles yet</h3>
              <p className="text-gray-500">Complete at least 4 weeks of work (starting from week 2) to see cycle progress</p>
            </div>
          )}
        </div>
      )}

      {/* Weekly/Daily Breakdown Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="mr-2" size={24} />
              Detailed Breakdown
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveBreakdown('weekly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeBreakdown === 'weekly' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📅 Weekly (Tue-Mon)
              </button>
              <button
                onClick={() => setActiveBreakdown('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeBreakdown === 'daily' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📆 Daily
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {activeBreakdown === 'weekly' && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Remaining/Extra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Types</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weeklyStats.map((week, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDateRange(week.weekStart, week.weekEnd)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {week.totalHours.toFixed(1)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(() => {
                        const hoursRemaining = week.totalHours - 30;
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${week.totalEarnings.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${week.avgHourlyRate.toFixed(2)}/hr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {week.entryCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {week.projects.map((project, i) => (
                          <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {project}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Types</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.dailyBreakdown.map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.totalHours.toFixed(1)}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${day.totalEarnings.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${day.avgHourlyRate.toFixed(2)}/hr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.entryCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {day.projects.map((project, i) => (
                          <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {project}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
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
        
        {((activeBreakdown === 'weekly' && weeklyStats.length === 0) || 
          (activeBreakdown === 'daily' && chartData.dailyBreakdown.length === 0)) && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">Upload a CSV file to see your {activeBreakdown} breakdown</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsTracker;