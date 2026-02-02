import React, { useState, useCallback, useRef } from 'react';
import { Upload, Calendar, DollarSign, Clock, TrendingUp, FileText, Plus, Download, BarChart3, Activity, Sparkles, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HeaderHero } from '/src/assets/components/HeaderHero.jsx';
import { UploadCard } from '/src/assets/components/UploadCard.jsx';
import { MetricTiles } from '/src/assets/components/MetricTiles.jsx';
import { AnalyticsControls } from '/src/assets/components/AnalyticsControl.jsx';
import ChartCard from '/src/assets/components/ChartCard';
import SectionCard from '/src/assets/components/SectionCard.jsx';
import Header from '/src/assets/components/Header.jsx';
import Sidebar from '/src/assets/components/Sidebar.jsx';
import TwoColumnLayout from '/src/assets/components/TwoColumnLayout.jsx';
import { CycleTracker } from '/src/assets/components/CycleTracker.jsx';
import { BreakdownTable } from '/src/assets/components/BreakdownTable.jsx';
import { GlobalOverview } from '/src/assets/components/GlobalOverview.jsx';
import { CurrentWeekProgress } from '/src/assets/components/CurrentWeekProgress.jsx';
import WeeklyHeatmap from '/src/assets/components/WeeklyHeatmap.jsx';
import QuickInsights from '/src/assets/components/QuickInsights.jsx';
import { EmptyState } from '/src/assets/components/EmptyState.jsx';

// Loading Overlay Component
const LoadingOverlay = () => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/40 backdrop-blur-md">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 border border-slate-200 animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Processing Data</h3>
          <p className="text-sm text-slate-600">Analyzing your earnings...</p>
        </div>
      </div>
    </div>
  </div>
);

const EarningsTracker = () => {
  // Detect user's timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const [entries, setEntries] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [activeChart, setActiveChart] = useState('trends');
  const [activeBreakdown, setActiveBreakdown] = useState('weekly');
  const [timeRange, setTimeRange] = useState('3m'); // NUEVO: rango seleccionado
  const [timeGoalHours, setTimeGoalHours] = useState(30);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // default 10
  const [cyclePage, setCyclePage] = useState(1);
  const [viewMode, setViewMode] = useState('original'); // Toggle between 'original' and 'new'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('upload'); // Active section in new UI
  const [showLoading, setShowLoading] = useState(false); // Loading overlay state
  const [dataLoaded, setDataLoaded] = useState(false); // Track if data has been loaded (for mobile initial screen)
  const [isProcessing, setIsProcessing] = useState(false); // Prevent double processing
  const fileInputRef = useRef(null);
  
  // Force original view on mobile
  React.useEffect(() => {
    if (isMobile()) {
      setViewMode('original');
    }
  }, []);

  // label for header chips: "All time" or the actual range
  const timeRangeLabel = timeRange === 'ALL' ? 'All time' : timeRange;

  const isMobile = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;

  React.useEffect(() => {
    try {
      setTimeRange(isMobile() ? '1m' : '3m');
    } catch {}
  }, []);

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

  // Helper function to format hours/earnings
  const fmtH2 = (n) => {
    if (n == null || isNaN(n)) return '0';
    const v = Math.round(Number(n) * 100) / 100;
    return Number.isInteger(v) ? String(v) : String(v);
  };

  // Helper function to parse date in user's timezone
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Parse the date string and ensure it's interpreted in user's timezone
    const date = new Date(dateStr);
    // If the date string doesn't include time, it's parsed as UTC midnight
    // We need to adjust it to the user's timezone
    if (dateStr.indexOf('T') === -1 && dateStr.indexOf(' ') === -1) {
      // Date-only string (e.g., "2024-01-15"), adjust to local timezone
      const offset = date.getTimezoneOffset();
      date.setMinutes(date.getMinutes() + offset);
    }
    return date;
  };

  // Helper to get since date based on selected range
  const getSinceDateForRange = (range) => {
    const now = new Date();
    if (range === 'ALL') return new Date(0); // hastebin epoch
    const since = new Date(now);
    if (range === '1m') since.setMonth(since.getMonth() - 1);
    if (range === '3m') since.setMonth(since.getMonth() - 3);
    if (range === '6m') since.setMonth(since.getMonth() - 6);
    if (range === '1Y') since.setFullYear(since.getFullYear() - 1);
    return since;
  };

  const pickDefaultRange = (allEntries) => {
    // Si hay muy poco rango de fechas (< ~75 días), forzamos 1m
    const dates = (allEntries || [])
      .map(e => parseDate(e.workDate))
      .filter(d => d && !isNaN(d));
    if (dates.length === 0) return isMobile() ? '1m' : '3m';

    const minD = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxD = new Date(Math.max(...dates.map(d => d.getTime())));
    const spanDays = (maxD - minD) / (1000 * 60 * 60 * 24);

    if (spanDays < 75) return '1m';            // pocas entradas → 1m
    return isMobile() ? '1m' : '3m';           // si no, depende del dispositivo
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
    if (!csvText) return [];
    const lines = csvText
      .trim()
      .split('\n')
      .map(l => l.replace(/\r/g, ''))
      .filter(l => l.trim() !== '');
    if (lines.length === 0) return [];

    // Read headers and build a normalized header->canonical key map
    const rawHeaders = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const nameMap = {
      workdate: 'workDate',
      date: 'workDate',

      itemid: 'itemID',
      id: 'itemID',

      projectname: 'projectName',
      project: 'projectName',

      duration: 'duration',
      time: 'duration',

      rate: 'rateApplied',
      rateapplied: 'rateApplied',

      payout: 'payout',
      payable: 'payout',
      amount: 'payout',

      paytype: 'payType',
      type: 'payType',

      status: 'status',
    };

    const headerMap = rawHeaders.map(h => nameMap[normalize(h)] || h);

    const newEntries = [];

    // Parse each CSV row (basic CSV parsing that respects quoted fields)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
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

      if (values.length >= 1 && values.some(v => v)) {
        const entry = {};
        headerMap.forEach((mappedKey, idx) => {
          // Use canonical key if known, otherwise keep original header name
          entry[mappedKey] = values[idx] ?? null;
        });

        // Ensure commonly used canonical keys exist for downstream code
        const hasUsefulData = entry.workDate || entry.itemID || entry.duration || entry.payout || entry['Work Date'];

        const payoutVal = parsePayoutAmount(entry.payout);
        const isNegativePayout = Number.isFinite(payoutVal) && payoutVal < 0;

        if (hasUsefulData && !isNegativePayout) {
          newEntries.push(entry);
        }
      }
    }
    return newEntries;
  };

  const processCsvFiles = (files) => {
    const processId = Math.random().toString(36).substring(7);
    console.log(`🔄 [${processId}] processCsvFiles called with:`, files?.length, 'files');
    console.log(`🔒 [${processId}] isProcessing state:`, isProcessing);
    
    // Prevent double processing
    if (isProcessing) {
      console.warn(`⏸️ [${processId}] Already processing, ignoring...`);
      return;
    }
    
    try {
      const file = files?.[0];
      if (!file) {
        setUploadStatus('❌ No file selected');
        return;
      }

      console.log(`📁 [${processId}] Processing file:`, file.name, file.size, 'bytes');

      // Mark as processing and show loading overlay
      setIsProcessing(true);
      setShowLoading(true);

      const reader = new FileReader();

      reader.onload = (e) => {
        console.log(`📖 [${processId}] File loaded, starting parse...`);
        try {
          // 1) Normaliza BOM/saltos
          let csvText = e.target.result || '';
          if (csvText.charCodeAt(0) === 0xfeff) csvText = csvText.slice(1);
          csvText = csvText.replace(/\r\n/g, '\n').trim();

          // 2) Parse
          const parsedEntries = parseCSV(csvText);
          console.log(`📊 [${processId}] CSV Parsed:`, parsedEntries.length, 'entries');
          
          // Calculate total earnings from CSV for debugging
          const csvTotalEarnings = parsedEntries.reduce((sum, entry) => {
            return sum + parsePayoutAmount(entry.payout);
          }, 0);
          console.log(`💰 [${processId}] Total Earnings in CSV:`, csvTotalEarnings.toFixed(2));

          // 3) Load all entries (no duplicate checking - each row is unique)
          console.log(`📋 [${processId}] Loading all entries from CSV...`);
          
          // Filter to only entries with positive payable amounts
          const validEntries = parsedEntries.filter(en => {
            const amount = parsePayoutAmount(en.payout);
            return amount > 0; // Only positive amounts
          });
          
          console.log(`✅ [${processId}] Loaded entries:`, validEntries.length);
          console.log(`🗑️ [${processId}] Filtered out:`, parsedEntries.length - validEntries.length, 'entries (negative/zero amounts)');
          
          // Calculate total earnings
          const totalEarnings = validEntries.reduce((sum, entry) => {
            return sum + parsePayoutAmount(entry.payout);
          }, 0);
          console.log(`💰 [${processId}] Total Earnings loaded:`, totalEarnings.toFixed(2));
          
          setUploadStatus(`✅ Loaded ${validEntries.length} entries`);
          setEntries(validEntries);
          
          // 4) Update weeklyStats immediately
          setTimeout(() => {
            try {
              const calculatedStats = calculateWeeklyStats(validEntries);
              setWeeklyStats(calculatedStats);
              
              // Set default time range if first load
              if (!dataLoaded && validEntries.length > 0) {
                setTimeRange(pickDefaultRange(validEntries));
                setDataLoaded(true);
              }
              
              // Hide loading after minimum 1.5 seconds
              setTimeout(() => {
                setShowLoading(false);
                setIsProcessing(false);
                console.log(`✨ [${processId}] Processing complete!`);
              }, 1500);
            } catch (err) {
              console.error(`❌ [${processId}] calculateWeeklyStats error:`, err);
              setUploadStatus(`❌ Stats error: ${err.message}`);
              setShowLoading(false);
              setIsProcessing(false);
            }
          }, 0);

        } catch (err) {
          console.error(`❌ [${processId}] processCsvFiles parse error:`, err);
          setUploadStatus(`❌ Error parsing CSV: ${err.message}`);
          setShowLoading(false);
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        console.error(`❌ [${processId}] Error reading file`);
        setUploadStatus('❌ Error reading file');
        setShowLoading(false);
        setIsProcessing(false);
      };

      reader.readAsText(file, 'utf-8');
    } catch (err) {
      console.error(`❌ [${processId}] processCsvFiles fatal:`, err);
      setUploadStatus(`❌ Unexpected error: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = useCallback((event) => {
    processCsvFiles(event.target.files);
  }, [entries]);


  // Load initial data
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        const csvContent = await window.fs.readFile('Earnings_Report.csv', { encoding: 'utf8' });
        const initialEntries = parseCSV(csvContent);
        const initialWeekly = calculateWeeklyStats(initialEntries);
        setEntries(initialEntries);
        setWeeklyStats(initialWeekly);
        setUploadStatus('✅ Initial data loaded successfully');
        // NUEVO: rango por defecto en carga inicial
        setTimeRange(pickDefaultRange(initialEntries));
      } catch (error) {
        setUploadStatus('ℹ️ No initial data found. Upload a CSV to get started.');
      }
    };
    loadInitialData();
  }, []);

  // Export data as CSV
  const exportData = () => {
    console.log('📤 Export button clicked');
    console.log('📊 Weekly stats available:', weeklyStats.length);
    
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
      const hoursRemaining = (week.totalHours - timeGoalHours).toFixed(1);
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

  // 1) Rango seleccionado
  const sinceDate = getSinceDateForRange(timeRange);

  // 2) Filtrados base (por rango)
  const filteredEntriesForDaily = React.useMemo(() => {
    return entries.filter(e => {
      const d = parseDate(e.workDate);
      return d && !isNaN(d) && d >= sinceDate;
    });
  }, [entries, sinceDate]);

  const filteredWeeklyForTrends = React.useMemo(() => {
    return weeklyStats.filter(week => week.weekEnd >= sinceDate);
  }, [weeklyStats, sinceDate]);

  // 3) Contadores/derivados del rango
  const entriesInRange = filteredEntriesForDaily.length;

  const totalsInRange = React.useMemo(() => {
    return filteredWeeklyForTrends.reduce(
      (acc, w) => {
        acc.hours += w.totalHours;
        acc.earnings += w.totalEarnings;
        return acc;
      },
      { hours: 0, earnings: 0 }
    );
  }, [filteredWeeklyForTrends]);

  const totalEarningsInRange = totalsInRange.earnings;
  
  const avgRateInRange = totalsInRange.hours > 0
  ? (totalsInRange.earnings / totalsInRange.hours)
  : 0;
  
  const earningsGoalPreview = timeGoalHours * avgRateInRange;
  const earningsGoal = earningsGoalPreview; // mismo valor, nombre corto si lo usas
  
  // 4) Total stats globales (opcionales)
  const totalStats = React.useMemo(() => {
    const weeks = weeklyStats.length || 1;
    const totalHours = weeklyStats.reduce((s, w) => s + w.totalHours, 0);
    const totalEarnings = weeklyStats.reduce((s, w) => s + w.totalEarnings, 0);
    return {
      totalHours,
      totalEarnings,
      totalEntries: entries.length,
      avgWeeklyHours: totalHours / weeks,
      avgWeeklyEarnings: totalEarnings / weeks,
    };
  }, [weeklyStats, entries.length]);
  
  const totalEarningsAllTime = totalStats.totalEarnings;
  
  // Calculate averages for the filtered range
  const weeks = filteredWeeklyForTrends.length || 1;
  const weeklyAvgHours = filteredWeeklyForTrends.reduce((a,w)=>a+w.totalHours,0) / weeks;
  const weeklyAvgEarnings = filteredWeeklyForTrends.reduce((a,w)=>a+w.totalEarnings,0) / weeks;
  const avgRate = (weeklyAvgHours > 0) ? (weeklyAvgEarnings / weeklyAvgHours) : 0;
  
  // Calculate current week stats
  const currentWeekStats = React.useMemo(() => {
    // Get current date/time in user's timezone
    const now = new Date();
    const today = new Date(now.toLocaleString('en-US', { timeZone: userTimeZone }));
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    const currentWeek = weeklyStats.find(week => 
      week.weekStart <= today && week.weekEnd >= today
    );
    
    if (!currentWeek) {
      return {
        hours: 0,
        earnings: 0,
        start: null,
        end: null,
        daysRemaining: 0
      };
    }
    
    const daysRemaining = Math.max(0, Math.ceil((currentWeek.weekEnd - today) / (1000 * 60 * 60 * 24)));
    
    return {
      hours: currentWeek.totalHours,
      earnings: currentWeek.totalEarnings,
      start: currentWeek.weekStart,
      end: currentWeek.weekEnd,
      daysRemaining
    };
  }, [weeklyStats]);
  
  // 5) Handlers (tal cual)
  const onChangeRange = setTimeRange;        // (r) => setTimeRange(r)
  const onChangeChart = setActiveChart;      // (k) => setActiveChart(k)
  const onChangeTimeGoal = setTimeGoalHours; // (h) => setTimeGoalHours(h)


  // 1) Build dailyBreakdown (OUTSIDE chartData, before you use it)
  const dailyBreakdown = (() => {
    const dailyMap = new Map();

    filteredEntriesForDaily.forEach(entry => {
      const date = parseDate(entry.workDate);
      if (!date || isNaN(date.getTime())) return;

      const dateKey = date.toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date,
          totalHours: 0,
          totalEarnings: 0,
          entryCount: 0,
          projects: new Set(),
          payTypes: new Map(),
          entries: [],
        });
      }

      const dayData = dailyMap.get(dateKey);
      const hours = parseDurationToHours(entry.duration);
      const earnings = parsePayoutAmount(entry.payout);

      dayData.totalHours += hours;
      dayData.totalEarnings += earnings;
      dayData.entryCount += 1;
      dayData.entries.push(entry);
      if (entry.projectName) dayData.projects.add(entry.projectName);
      if (entry.payType) {
        const curr = dayData.payTypes.get(entry.payType) || 0;
        dayData.payTypes.set(entry.payType, curr + 1);
      }
    });

    return Array.from(dailyMap.values())
      .sort((a, b) => b.date - a.date) // newest first for the table
      .map(day => ({
        ...day,
        projects: Array.from(day.projects),
        payTypes: Object.fromEntries(day.payTypes),
        avgHourlyRate: day.totalHours > 0 ? day.totalEarnings / day.totalHours : 0,
        dateLabel: day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
  })();

  // 2) Now build chartData (you can reuse dailyBreakdown)
  const chartData = {
    trends: filteredWeeklyForTrends.slice().reverse().map(week => ({
      week: week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      hours: week.totalHours,
      earnings: week.totalEarnings,
      target: timeGoalHours,
      earningsTarget: earningsGoal,
      surplus: week.totalHours - timeGoalHours,
    })),

    projects: (() => {
      const projectStats = {};
      filteredEntriesForDaily.forEach(entry => {
        if (!entry.projectName || !entry.payout) return;
        const project = entry.projectName;
        const earnings = parsePayoutAmount(entry.payout);
        const hours = parseDurationToHours(entry.duration);
        if (!projectStats[project]) {
          projectStats[project] = { name: project, earnings: 0, hours: 0, entries: 0 };
        }
        projectStats[project].earnings += earnings;
        projectStats[project].hours += hours;
        projectStats[project].entries += 1;
      });
      return Object.values(projectStats)
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 8);
    })(),

    payTypes: (() => {
      const payTypeStats = {};
      filteredEntriesForDaily.forEach(entry => {
        if (!entry.payType || !entry.payout) return;
        const type = entry.payType;
        const earnings = parsePayoutAmount(entry.payout);
        if (!payTypeStats[type]) {
          payTypeStats[type] = { name: type, value: 0, count: 0 };
        }
        payTypeStats[type].value += earnings;
        payTypeStats[type].count += 1;
      });
      return Object.values(payTypeStats);
    })(),

    // For the chart: older → newer on X axis
    daily: dailyBreakdown
      .slice()
      .sort((a, b) => a.date - b.date)
      .map(d => ({
        dateLabel: d.dateLabel,
        hours: d.totalHours,
        earnings: d.totalEarnings,
      })),

    // For the table/cards
    dailyBreakdown,
  };

  // Datos base según pestaña activa
  const rawList = activeBreakdown === 'weekly' ? weeklyStats : chartData.dailyBreakdown;

  // Total de páginas y límites
  const totalPages = Math.max(1, Math.ceil(rawList.length / pageSize));
  const currPage = Math.min(page, totalPages);
  const startIdx = (currPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;

  // Slices paginados para pintar en tabla/cards
  const pagedWeekly = activeBreakdown === 'weekly' ? weeklyStats.slice(startIdx, endIdx) : [];
  const pagedDaily  = activeBreakdown === 'daily'  ? chartData.dailyBreakdown.slice(startIdx, endIdx) : [];

  const getVisiblePages = () => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currPage === 1) return [1, 2, 3];
    if (currPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [currPage - 1, currPage, currPage + 1];
  };
  const visiblePages = getVisiblePages();


  // Calculate 4-week cycles (starting from 2nd week) — sin filtro (histórico)
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
      cycleStats.targetHours = cycleStats.weekCount * timeGoalHours;
      cycleStats.hoursRemaining = cycleStats.targetHours - cycleStats.totalHours;
      cycleStats.progressPercentage = Math.min((cycleStats.totalHours / cycleStats.targetHours) * 100, 100);
      // Check if cycle is still active (end date is today or in the future)
      cycleStats.isActive = cycleStats.endWeek >= today;
      cycleStats.hasEnded = cycleStats.endWeek < today;
      cycles.push(cycleStats);
    }
    return cycles.reverse(); // Most recent first
  };

  const fourWeekCycles = React.useMemo(() => calculate4WeekCycles(), [weeklyStats, timeGoalHours]);

  // ===== PAGINACIÓN DE CICLOS (colocar DESPUÉS de fourWeekCycles) =====
  const cyclePageSize = 4; // fijo a 6
  const cycleCount = fourWeekCycles?.length ?? 0;
  const cycleTotalPages = Math.max(1, Math.ceil(cycleCount / cyclePageSize));

  // Evita loops: solo corrige la página si quedó fuera de rango
  React.useEffect(() => {
    if (cyclePage < 1) setCyclePage(1);
    else if (cyclePage > cycleTotalPages) setCyclePage(cycleTotalPages);
    // depende de cycleTotalPages, que ya es un número estable
  }, [cycleTotalPages]); // <- NO uses fourWeekCycles.length directo en deps

  const cycleCurrPage = Math.min(Math.max(1, cyclePage), cycleTotalPages);
  const cycleStartIdx = (cycleCurrPage - 1) * cyclePageSize;
  const cycleEndIdx   = cycleStartIdx + cyclePageSize;
  const cyclesPaged   = fourWeekCycles.slice(cycleStartIdx, cycleEndIdx);

  // Botones 1-2-3 centrados
  const cycleVisiblePages = React.useMemo(() => {
    if (cycleTotalPages <= 3) return Array.from({ length: cycleTotalPages }, (_, i) => i + 1);
    if (cycleCurrPage === 1) return [1, 2, 3];
    if (cycleCurrPage === cycleTotalPages) return [cycleTotalPages - 2, cycleTotalPages - 1, cycleTotalPages];
    return [cycleCurrPage - 1, cycleCurrPage, cycleCurrPage + 1];
  }, [cycleCurrPage, cycleTotalPages]);

  // Format date range for display
  const formatDateRange = (start, end) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  // ---- Outlier-ish palette ----
  const BRAND = {
    indigo:  '#4F46E5',
    violet:  '#8B5CF6',
    mint:    '#22D3EE',
    green:   '#22C55E',
    slate:   '#0F172A',
    red:     '#EF4444',
    grid:    '#E5E7EB',
  };

  const COLORS = [
    '#4F46E5', '#22C55E', '#8B5CF6', '#06B6D4',
    '#A78BFA', '#22D3EE', '#EAB308', '#64748B'
  ];

  // Chart components
  const renderTrendsChart = () => (
    <ChartCard
      title={`Weekly Hours vs Earnings Trend (${timeRange === 'ALL' ? 'All time' : timeRange})`}
      subtitle={`Track your weekly performance against the ${timeGoalHours}-hour target`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData.trends} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid stroke={BRAND.grid} strokeDasharray="3 3" />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#475569' }} />
          <YAxis yAxisId="hours" tick={{ fontSize: 12, fill: '#475569' }} />
          <YAxis yAxisId="earnings" orientation="right" tick={{ fontSize: 12, fill: '#475569' }} />
          <Tooltip
            wrapperStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
            contentStyle={{ borderRadius: 12, boxShadow: 'none' }}
            labelStyle={{ color: '#0F172A', fontWeight: 600 }}
            formatter={(value, name) => {
              const isHours = name.includes('hours') || (name.includes('target') && !name.includes('earnings'));
              return isHours ? [`${fmtH2(value)}h`, name] : [`$${Number(value).toFixed(2)}`, name];
            }}
          />
          <Legend
            wrapperStyle={{ width: '100%', paddingTop: 8 }}
            content={(props) => (
              <ResponsiveLegend
                {...props}
                labelMap={{
                  hours: 'Hours Worked',
                  earnings: 'Earnings ($)',
                  target: `${timeGoalHours}h Target`,
                  earningsTarget: 'Earnings Target ($)',
                }}
              />
            )}
          />
          <Line yAxisId="hours"   type="monotone" dataKey="hours"          stroke={BRAND.indigo} strokeWidth={3} dot={{ fill: BRAND.indigo, r: 4 }} />
          <Line yAxisId="hours"   type="monotone" dataKey="target"         stroke={BRAND.red}    strokeDasharray="5 5" dot={false} isAnimationActive={false} />
          <Line yAxisId="earnings"type="monotone" dataKey="earnings"       stroke={BRAND.green}  strokeWidth={3} dot={{ fill: BRAND.green,  r: 4 }} />
          <Line yAxisId="earnings"type="monotone" dataKey="earningsTarget" stroke={BRAND.violet} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  const renderProjectChart = () => (
    <ChartCard
      title={`Project Performance (${timeRange === 'ALL' ? 'All time' : timeRange})`}
      subtitle="Compare earnings and hours per project"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData.projects} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid stroke={BRAND.grid} strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} interval={0} angle={0} height={40} />
          <YAxis yAxisId="earnings" tick={{ fontSize: 12, fill: '#475569' }} />
          <YAxis yAxisId="hours" orientation="right" tick={{ fontSize: 12, fill: '#475569' }} />
          <Tooltip
            wrapperStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
            contentStyle={{ borderRadius: 12, boxShadow: 'none' }}
            labelStyle={{ color: '#0F172A', fontWeight: 600 }}
            formatter={(value, name) => (name === 'Hours' ? [`${fmtH2(value)}h`, name] : [`$${Number(value).toFixed(2)}`, name])}
          />
          <Legend
            wrapperStyle={{ width: '100%', paddingTop: 8 }}
            content={(props) => (
              <ResponsiveLegend {...props} labelMap={{ earnings: 'Earnings ($)', hours: 'Hours' }} />
            )}
          />
          <Bar yAxisId="earnings" dataKey="earnings" name="Earnings ($)" fill={BRAND.indigo} radius={[6,6,0,0]} />
          <Bar yAxisId="hours"    dataKey="hours"    name="Hours"        fill={BRAND.green}  radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  const renderPayTypeChart = () => (
    <ChartCard
      title={`Payment Type Distribution (${timeRange === 'ALL' ? 'All time' : timeRange})`}
      subtitle="Breakdown of earnings by payment type"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            wrapperStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
            contentStyle={{ borderRadius: 12, boxShadow: 'none' }}
            labelStyle={{ color: '#0F172A', fontWeight: 600 }}
            formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
          />
          <Legend
            wrapperStyle={{ width: '100%', paddingTop: 8 }}
            content={(props) => <ResponsiveLegend {...props} />}
          />
          <Pie
            data={chartData.payTypes}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
          >
            {chartData.payTypes.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  const renderDailyChart = () => (
    <ChartCard
      title={`Daily Activity (${timeRange === 'ALL' ? 'All time' : timeRange})`}
      subtitle="Hours and earnings by day"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData.daily} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid stroke={BRAND.grid} strokeDasharray="3 3" />
          <XAxis dataKey="dateLabel" tick={{ fontSize: 12, fill: '#475569' }} />
          <YAxis yAxisId="hours" tick={{ fontSize: 12, fill: '#475569' }} />
          <YAxis yAxisId="earnings" orientation="right" tick={{ fontSize: 12, fill: '#475569' }} />
          <Tooltip
            wrapperStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
            contentStyle={{ borderRadius: 12, boxShadow: 'none' }}
            labelStyle={{ color: '#0F172A', fontWeight: 600 }}
            labelFormatter={(d) => d}
            formatter={(value, name) => (name === 'Hours' ? [`${fmtH2(value)}h`, name] : [`$${Number(value).toFixed(2)}`, name])}
          />
          <Legend
            wrapperStyle={{ width: '100%', paddingTop: 8 }}
            content={(props) => (
              <ResponsiveLegend {...props} labelMap={{ hours: 'Hours', earnings: 'Earnings ($)' }} />
            )}
          />
          <Bar yAxisId="hours"    dataKey="hours"    name="Hours"        fill={BRAND.indigo} radius={[6,6,0,0]} />
          <Bar yAxisId="earnings" dataKey="earnings" name="Earnings ($)" fill={BRAND.green}  radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  const ResponsiveLegend = ({ payload, labelMap = {} }) => {
    if (!payload) return null;
    return (
      <div className="px-3 pb-2 pt-3">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4 items-center justify-center">
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center text-xs sm:text-sm text-slate-700 justify-left px-6">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2 shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="truncate">
                {labelMap[entry.dataKey] ?? entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RANGE_OPTIONS = ['1m', '3m', '6m', '1Y', 'ALL'];

  // Check if we have data to show content
  const hasData = entries.length > 0 && weeklyStats.length > 0;

  return (
    <div className={`bg-slate-50 ${
      viewMode === 'new' 
        ? 'h-screen overflow-hidden flex flex-col' 
        : 'min-h-screen'
    }`}>
    
      {/* Loading Overlay */}
      {showLoading && <LoadingOverlay />}
      
      {/* Glassmorphic Header with Toggle */}
      <Header 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        githubUrl="https://github.com/juanemillan/earnings-tracker"
      />

      {/* Original View */}
      {viewMode === 'original' && (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">

      <div className='grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 sm:gap-6 items-stretch mb-6 sm:mb-8'>
        {/* Header / Hero Section */}
        <div className="h-full min-w-0 animate-fade-in">
        <HeaderHero
          title="Outlier Earnings Tracker"
          subtitle="Track your weekly earnings with automatic CSV import, duplicate detection, and flexible goals."
          githubUrl="https://github.com/juanemillan/earnings-tracker"
          author="Juane (pilots-coder624)"
          viewMode={viewMode}
          hasData={hasData}
          timeGoalHours={timeGoalHours}
          onChangeTimeGoal={onChangeTimeGoal}
          avgRate={avgRateInRange}
        />
        </div>

        {/* Upload Section */}
        <div id="upload" className="h-full min-w-0 animate-fade-in animate-delay-100">
        <UploadCard
          onExport={exportData}
          onFilesSelected={processCsvFiles}
          status={uploadStatus}
          hasData={hasData}
        />
        </div>
      </div>

      {/* Show content only when data is loaded */}
      {hasData ? (
        <>
      {/* Summary Stats */}
      <div id="metrics" className="animate-fade-in animate-delay-200">
      <MetricTiles
        timeRangeLabel={timeRangeLabel}
        weeklyAvgHours={weeklyAvgHours}
        weeklyAvgEarnings={weeklyAvgEarnings}
        avgRate={avgRate}
        goalHoursPerWeek={timeGoalHours}
        totalEarningsRange={totalEarningsInRange}
        totalEarningsAllTime={totalEarningsAllTime}
        viewMode={viewMode}
      />
      </div>

      {/* Charts Section */}
      <div id="charts" className="bg-white rounded-2xl shadow-md mb-6 animate-fade-in animate-delay-300">

        <AnalyticsControls
          timeRange={timeRange}
          onChangeRange={onChangeRange}
          activeChart={activeChart}
          onChangeChart={onChangeChart}
          timeGoalHours={timeGoalHours}
          onChangeTimeGoal={onChangeTimeGoal}
          earningsGoalPreview={earningsGoalPreview}
          entriesInRange={entriesInRange}
        />
        
        <div>
          {activeChart === 'trends' && (
            <div className="h-full w-full">
              {renderTrendsChart()}
            </div>
          )}
          
          {activeChart === 'projects' && (
            <div className="h-full w-full">
              {renderProjectChart()}
            </div>
          )}
          
          {activeChart === 'payTypes' && (
            <div className="h-full w-full">
              {renderPayTypeChart()}
            </div>
          )}
          
          {activeChart === 'daily' && (
            <div className="h-full w-full">
              {renderDailyChart()}
            </div>
          )}
        </div>
      </div>

      {/* 4-Week Cycle Tracker */}
      <div id="cycles" className="animate-fade-in animate-delay-400">
      <SectionCard
        className="mb-6 rounded-b-2xl shadow-lg"
        title="4-Week Cycle Progress"
        subtitle={`Target: ${fmtH2(timeGoalHours * 4)} hours per 4-week cycle`}
        right={
          /* Paginación ciclos (solo si hay más de una página) */
          cycleTotalPages > 1 && (
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
          )
        }
      >
        {/* Empty state */}
        {cyclesPaged.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            No 4-week cycles yet — complete at least 4 weeks to see progress
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cyclesPaged.map((cycle, index) => {
              const isLastOdd = index === cyclesPaged.length - 1 && cyclesPaged.length % 2 === 1;
              const pct = Math.min(cycle.progressPercentage ?? 0, 100);
              return (
                <div
                  key={`${cycle.cycleNumber}-${index}`}
                  className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white`}
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
                          {fmtH2(-cycle.hoursRemaining)}h
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

                  {/* Make last odd item span two cols on md+ */}
                  {isLastOdd && <div className="hidden md:block md:col-span-2" />}
                </div>
              );
            })}
          </div>
        )}

        {/* page indicator */}
        {cycleTotalPages > 1 && (
          <div className="mt-4 text-center text-xs text-slate-500">
            Page {cycleCurrPage} of {cycleTotalPages}
          </div>
        )}
      </SectionCard>
      </div>



      {/* Weekly/Daily Breakdown Section */}
      <div id="breakdown" className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in animate-delay-400">
        <SectionCard
          title="Detailed Breakdown"
          subtitle={activeBreakdown === 'weekly' ? 'Weekly totals (current range)' : 'Daily totals (current range)'}
          right={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Weekly/Daily toggle (your existing buttons) */}
              <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setActiveBreakdown('weekly')}
                  className={`px-3 py-1.5 text-sm font-medium ${activeBreakdown === 'weekly' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setActiveBreakdown('daily')}
                  className={`px-3 py-1.5 text-sm font-medium ${activeBreakdown === 'daily' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  Daily
                </button>
              </div>

              {/* Pagination controls you already built */}
            </div>
          }
        >
          {/* TABLE (desktop) */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              {activeBreakdown === 'weekly' && (
                <table className="min-w-[980px] w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr className="border-b border-slate-200">
                      {/* your same headers */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedWeekly.map((week, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        {/* your same cells */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeBreakdown === 'daily' && (
                <table className="min-w-[980px] w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr className="border-b border-slate-200">
                      {/* your same headers */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedDaily.map((day, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        {/* your same cells */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Pagination row (desktop & mobile) */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-2 py-1 rounded-md text-sm border bg-slate-50 text-slate-700 hover:bg-white"
            >
              ‹
            </button>
            {visiblePages.map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-md text-sm font-medium border ${
                  p === currPage ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-2 py-1 rounded-md text-sm border bg-slate-50 text-slate-700 hover:bg-white"
            >
              ›
            </button>

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
          </div>
        </SectionCard>
        
        <div className="hidden sm:block">
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

        <div className="sm:hidden space-y-3 p-4 rounded-b-2xl">
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

        
        {((activeBreakdown === 'weekly' && weeklyStats.length === 0) || 
          (activeBreakdown === 'daily' && chartData.dailyBreakdown.length === 0)) && (
          <div className="text-center py-12 rounded-b-2xl shadow-lg">
            <Calendar className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No data available</h3>
            <p className="text-slate-500">Upload a CSV file to see your {activeBreakdown} breakdown</p>
          </div>
        )}
      </div>
      </>
      ) : (
        // No data loaded yet - show empty state
        <div className="max-w-2xl mx-auto mt-12 text-center px-4">
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <Upload className="text-indigo-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Data Yet</h3>
            <p className="text-slate-600 mb-6">
              Upload a CSV file from your Outlier Earnings tab to get started with tracking your earnings and analytics.
            </p>
          </div>
        </div>
      )}
      </div>
      )}

      {/* New UI View */}
      {viewMode === 'new' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {hasData && (
            <Sidebar 
              isCollapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              onExport={exportData}
              onFilesSelected={processCsvFiles}
              uploadStatus={uploadStatus}
              viewMode={viewMode}
              hasData={hasData}
            />
          )}
          
          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden p-6 animate-fade-in justify-center bg-gradient-to-tr from-indigo-50 via-violet-50 to-cyan-50">
            
            {!hasData && (
              <EmptyState
                onFilesSelected={processCsvFiles}
                uploadStatus={uploadStatus}
                githubUrl="https://github.com/juanemillan/earnings-tracker"
                author="Juane (pilots-coder624)"
              />
            )}

            {/* Upload Section */}
            {activeSection === 'upload' && (
              <div className='animate-fade-in'>
              <TwoColumnLayout
                leftContent={(
                  <div className="space-y-4">
                    {hasData && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <CurrentWeekProgress
                          currentWeekHours={currentWeekStats.hours}
                          currentWeekEarnings={currentWeekStats.earnings}
                          goalHoursPerWeek={timeGoalHours}
                          daysRemainingInWeek={currentWeekStats.daysRemaining}
                          currentWeekStart={currentWeekStats.start}
                          currentWeekEnd={currentWeekStats.end}
                        />
                        <QuickInsights
                          weeklyStats={weeklyStats}
                          dailyBreakdown={dailyBreakdown}
                          goalHoursPerWeek={timeGoalHours}
                          currentWeekHours={currentWeekStats.hours}
                          currentWeekEarnings={currentWeekStats.earnings}
                          entries={entries}
                        />
                      </div>
                    )}
                    {hasData && (
                      <WeeklyHeatmap dailyBreakdown={dailyBreakdown} />
                    )}
                  </div>
                )}
                rightContent={(
                  hasData && (
                    <div className="flex flex-col justify-between h-full space-y-4">
                      <GlobalOverview
                        totalEarningsAllTime={totalEarningsAllTime}
                        totalHoursAllTime={totalStats.totalHours}
                        totalWeeks={weeklyStats.length}
                        avgWeeklyEarnings={totalStats.avgWeeklyEarnings}
                        avgWeeklyHours={totalStats.avgWeeklyHours}
                        totalEntries={entries.length}
                        timeGoalHours={timeGoalHours}
                        onChangeTimeGoal={onChangeTimeGoal}
                        avgRate={avgRateInRange}
                      />
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Current Range ({timeRangeLabel})</h4>
                        <MetricTiles
                          timeRangeLabel={timeRangeLabel}
                          weeklyAvgHours={weeklyAvgHours}
                          weeklyAvgEarnings={weeklyAvgEarnings}
                          avgRate={avgRate}
                          goalHoursPerWeek={timeGoalHours}
                          totalEarningsRange={totalEarningsInRange}
                          totalEarningsAllTime={totalEarningsAllTime}
                          showTotalEarnings={false}
                          viewMode={viewMode}
                        />
                      </div>
                    </div>
                  )
            )}
              />
              </div>
            )}

            {/* Charts Section */}
            {activeSection === 'charts' && (
              <div className="h-full overflow-y-auto custom-scrollbar animate-fade-in flex flex-col justify-center">
                <div className="rounded-2xl p-6">
                  <AnalyticsControls
                    timeRange={timeRange}
                    onChangeRange={onChangeRange}
                    activeChart={activeChart}
                    onChangeChart={onChangeChart}
                    timeGoalHours={timeGoalHours}
                    onChangeTimeGoal={onChangeTimeGoal}
                    earningsGoalPreview={earningsGoalPreview}
                    entriesInRange={entriesInRange}
                  />
                  
                  <div className="mt-0">
                    {activeChart === 'trends' && (
                      <div className="h-full w-full">
                        {renderTrendsChart()}
                      </div>
                    )}
                    
                    {activeChart === 'projects' && (
                      <div className="h-full w-full">
                        {renderProjectChart()}
                      </div>
                    )}
                    
                    {activeChart === 'payTypes' && (
                      <div className="h-full w-full">
                        {renderPayTypeChart()}
                      </div>
                    )}
                    
                    {activeChart === 'daily' && (
                      <div className="h-full w-full">
                        {renderDailyChart()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4-Week Cycles Section */}
            {activeSection === 'cycles' && (
              <div className='animate-fade-in'>
              <CycleTracker
                cycles={fourWeekCycles}
                timeGoalHours={timeGoalHours}
                cyclePage={cyclePage}
                setCyclePage={setCyclePage}
                fmtH2={fmtH2}
              />
              </div>
            )}

            {/* Breakdown Section */}
            {activeSection === 'breakdown' && (
              <div className='animate-fade-in'>
              <BreakdownTable
                activeBreakdown={activeBreakdown}
                setActiveBreakdown={setActiveBreakdown}
                weeklyStatsInRange={filteredWeeklyForTrends}
                dailyStatsInRange={dailyBreakdown}
                timeGoalHours={timeGoalHours}
                page={page}
                setPage={setPage}
                pageSize={9}
                setPageSize={() => {}}
                formatDateRange={formatDateRange}
                showRowSelector={false}
              />
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsTracker;
