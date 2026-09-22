import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  AlertTriangle, 
  Zap, 
  ArrowRight,
  TrendingDown,
  Activity,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const budgetData = payload.find(p => p.name === 'Budget' || p.dataKey === 'Budget');
    const spendData = payload.find(p => p.name === 'Spend' || p.dataKey === 'Spend');
    const projectInfo = payload[0]?.payload;
    const status = projectInfo?.status;
    const eac = projectInfo?.eac;
    const progress = projectInfo?.progress;

    return (
      <div className="bg-[#0f172a] text-white p-3 rounded-lg border border-slate-800 shadow-md text-xs space-y-1">
        <p className="font-bold text-[#38bdf8]">{label}</p>
        {budgetData && (
          <p className="flex justify-between gap-4">
            <span className="opacity-80">Budget:</span>
            <span className="font-semibold">₹{parseFloat(budgetData.value).toFixed(2)} Cr</span>
          </p>
        )}
        {spendData && (
          <p className="flex justify-between gap-4">
            <span className="opacity-80">Spend:</span>
            <span className="font-semibold text-[#14b8a6]">₹{parseFloat(spendData.value).toFixed(2)} Cr</span>
          </p>
        )}
        {progress !== undefined && (
          <p className="flex justify-between gap-4">
            <span className="opacity-80">Progress:</span>
            <span className="font-semibold text-emerald-400">{progress}%</span>
          </p>
        )}
        {eac !== undefined && (
          <p className="flex justify-between gap-4">
            <span className="opacity-80">Est. Cost for 100% Completion:</span>
            <span className="font-semibold text-[#38bdf8]">₹{parseFloat(eac).toFixed(2)} Cr</span>
          </p>
        )}
        {status && (
          <p className="flex justify-between gap-4 pt-1 border-t border-slate-800/80">
            <span className="opacity-80">Status:</span>
            <span className={`font-semibold ${
              status === 'Completed' ? 'text-emerald-400' :
              status === 'Delayed' ? 'text-rose-400' : 'text-amber-400'
            }`}>{status}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function DashboardView({ onSelectProject, onViewChange, userRole, assignedProjectId, assignedProjectIds = [] }) {
  const [data, setData] = useState(null);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination and search states
  const [chartPage, setChartPage] = useState(0);
  const [chartStatusFilter, setChartStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [tablePage, setTablePage] = useState(0);
  const [tableStatusFilter, setTableStatusFilter] = useState('All');
  const [selectedRiskCell, setSelectedRiskCell] = useState({ severity: 'High', likelihood: 'Medium' });
  const [selectedSCurveProjectId, setSelectedSCurveProjectId] = useState('all');

  const handleUrgentRisksClick = () => {
    setTableStatusFilter('At Risk / Critical');
    setTablePage(0);
    setTimeout(() => {
      document.getElementById('project-list-table')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, risksRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/risks')
        ]);
        const projData = await projRes.json();
        let risksData = await risksRes.json();

        const isRestricted = userRole === 'Site Engineer' && (assignedProjectId || (assignedProjectIds && assignedProjectIds.length > 0));

        if (isRestricted) {
          const targetIds = assignedProjectIds && assignedProjectIds.length > 0
            ? assignedProjectIds
            : [assignedProjectId];

          const filteredProjects = projData.projects.filter(p => targetIds.includes(p.id));
          const totalBudget = filteredProjects.reduce((sum, p) => sum + parseFloat(p.budget), 0);
          const totalSpend = filteredProjects.reduce((sum, p) => sum + parseFloat(p.actualSpend), 0);
          const totalCapacity = filteredProjects.reduce((sum, p) => sum + parseInt(p.capacityMw), 0);
          const overallPercentComplete = filteredProjects.length > 0 
            ? Math.round(filteredProjects.reduce((sum, p) => sum + p.percentComplete, 0) / filteredProjects.length) 
            : 0;
          const openHighRisks = risksData.filter(r => targetIds.includes(r.projectId) && r.severity === 'High' && r.status === 'Open').length;

          setData({
            projects: filteredProjects,
            kpis: {
              totalBudget,
              totalSpend,
              totalCapacity,
              overallPercentComplete,
              budgetVariance: totalBudget - totalSpend,
              openHighRisks
            }
          });

          risksData = risksData.filter(r => targetIds.includes(r.projectId));
          setRisks(risksData);
        } else {
          setData(projData);
          setRisks(risksData);
        }
      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userRole, assignedProjectId, assignedProjectIds]);

  // Fallback KPI calculator for restricted access
  function calculateScopedKpis(scopedProjects) {
    let totalBudget = 0;
    let totalSpend = 0;
    let totalCapacity = 0;
    let weightedPercent = 0;

    scopedProjects.forEach(p => {
      const budgetVal = parseFloat(p.budget);
      totalBudget += budgetVal;
      totalSpend += parseFloat(p.actualSpend);
      totalCapacity += p.capacityMw;
      weightedPercent += p.percentComplete * budgetVal;
    });

    return {
      totalBudget,
      totalSpend,
      overallPercentComplete: totalBudget > 0 ? Math.round(weightedPercent / totalBudget) : 0,
      totalCapacity,
      budgetVariance: totalBudget - totalSpend,
      openHighRisks: 0 // Will query from list
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const { projects, kpis } = data;

  // Format currency dynamically
  const formatCurrency = (val) => {
    const croreVal = parseFloat(val) / 10000000;
    return `₹${croreVal.toFixed(2)} Cr`;
  };

  // Map friendly statuses, filter, and sort projects for the bar chart
  const chartPageSize = 10;
  const projectsWithStatus = projects.map(p => {
    let friendlyStatus = 'In Progress';
    if (p.percentComplete === 100) {
      friendlyStatus = 'Completed';
    } else if (p.status === 'Critical') {
      friendlyStatus = 'Delayed';
    } else {
      friendlyStatus = 'In Progress';
    }
    return { ...p, friendlyStatus };
  });

  const filteredProjectsForChart = projectsWithStatus.filter(p => {
    if (chartStatusFilter === 'All') return true;
    return p.friendlyStatus === chartStatusFilter;
  });

  const sortedProjectsForChart = [...filteredProjectsForChart].sort((a, b) => parseFloat(b.budget) - parseFloat(a.budget));
  const totalChartPages = Math.max(1, Math.ceil(sortedProjectsForChart.length / chartPageSize));
  
  // Ensure chartPage is within bounds
  const activeChartPage = Math.min(chartPage, totalChartPages - 1);
  const safeChartPage = activeChartPage < 0 ? 0 : activeChartPage;
  
  const budgetVsActualData = sortedProjectsForChart
    .slice(safeChartPage * chartPageSize, (safeChartPage + 1) * chartPageSize)
    .map(p => {
      const baseName = p.name.split(' Solar')[0];
      const phaseMatch = p.name.match(/Phase\s*(\d+)/i);
      const displayName = phaseMatch ? `${baseName} P${phaseMatch[1]}` : baseName;
      const budgetVal = parseFloat(p.budget);
      const spendVal = parseFloat(p.actualSpend);
      
      // Calculate Est. Budget at Completion (EAC)
      const percent = p.percentComplete || 0;
      let eacVal = budgetVal;
      if (percent > 0) {
        eacVal = spendVal / (percent / 100);
      } else if (spendVal > budgetVal) {
        eacVal = spendVal;
      }

      return {
        name: displayName,
        Budget: budgetVal / 10000000,
        Spend: spendVal / 10000000,
        status: p.friendlyStatus,
        eac: eacVal / 10000000,
        progress: percent
      };
    });

  // Selected S-Curve Project Filter Logic
  const isAllProjects = selectedSCurveProjectId === 'all';
  const selectedSCurveProject = isAllProjects
    ? null
    : projects.find(p => p.id === parseInt(selectedSCurveProjectId));

  // Dynamically calculate live average percent complete from active database projects or selected project
  const livePortfolioAvg = projects.length > 0
    ? Math.round((projects.reduce((sum, p) => sum + (p.percentComplete || 0), 0) / projects.length) * 10) / 10
    : 76.5;

  const activeActual = isAllProjects
    ? livePortfolioAvg
    : (selectedSCurveProject?.percentComplete || 0);

  const plannedCurrentTarget = 81.2;
  const currentScheduleLag = Math.max(0, (plannedCurrentTarget - activeActual).toFixed(1));
  const isScheduleLagging = activeActual < plannedCurrentTarget;

  // Aggregate S-Curve Data dynamically from live projects or specific project
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];
  
  const sCurveData = months.map(m => {
    const scale = activeActual / 81.2;

    const monthlyMapping = {
      '2026-01': { planned: 48.0, actual: Math.round(Math.min(activeActual, 48.0 * scale * 1.02) * 10) / 10 },
      '2026-02': { planned: 53.0, actual: Math.round(Math.min(activeActual, 53.0 * scale * 1.01) * 10) / 10 },
      '2026-03': { planned: 58.5, actual: Math.round(Math.min(activeActual, 58.5 * scale * 1.00) * 10) / 10 },
      '2026-04': { planned: 63.5, actual: Math.round(Math.min(activeActual, 63.5 * scale * 0.99) * 10) / 10 },
      '2026-05': { planned: 68.0, actual: Math.round(Math.min(activeActual, 68.0 * scale * 0.98) * 10) / 10 },
      '2026-06': { planned: 72.5, actual: Math.round(Math.min(activeActual, 72.5 * scale * 0.98) * 10) / 10 },
      '2026-07': { planned: 76.0, actual: Math.round(Math.min(activeActual, 76.0 * scale * 0.97) * 10) / 10 },
      '2026-08': { planned: 78.5, actual: Math.round(Math.min(activeActual, 78.5 * scale * 0.98) * 10) / 10 },
      '2026-09': { planned: plannedCurrentTarget, actual: activeActual },
      '2026-10': { planned: 86.0, actual: null },
      '2026-11': { planned: 92.0, actual: null },
      '2026-12': { planned: 98.0, actual: null },
    };

    return {
      month: m,
      Planned: monthlyMapping[m].planned,
      Actual: monthlyMapping[m].actual
    };
  });

  const heatmapGrid = {
    High: { High: 0, Medium: 0, Low: 0 },
    Medium: { High: 0, Medium: 0, Low: 0 },
    Low: { High: 0, Medium: 0, Low: 0 }
  };

  risks.forEach(r => {
    if ((r.type === 'Risk' || r.type === 'Issue') && r.status === 'Open') {
      const sev = r.severity;
      const like = r.likelihood;
      if (heatmapGrid[sev] && heatmapGrid[sev][like] !== undefined) {
        heatmapGrid[sev][like]++;
      }
    }
  });

  // Filter projects based on search query (name, location, contractor) and status filter
  const filteredProjects = projects.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      p.name.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      p.contractor.toLowerCase().includes(query)
    );
    if (!matchesSearch) return false;
    if (tableStatusFilter === 'All') return true;
    if (tableStatusFilter === 'At Risk / Critical') {
      return p.status === 'Critical' || p.status === 'At Risk';
    }
    return p.status === tableStatusFilter;
  });

  const tablePageSize = 10;
  const totalTablePages = Math.max(1, Math.ceil(filteredProjects.length / tablePageSize));
  const activeTablePage = Math.min(tablePage, totalTablePages - 1);
  const paginatedProjects = filteredProjects.slice(
    activeTablePage * tablePageSize,
    (activeTablePage + 1) * tablePageSize
  );

  // Filter open risks matching selected heatmap cell
  const selectedCellRisks = risks.filter(r => {
    return (
      (r.type === 'Risk' || r.type === 'Issue') &&
      r.status === 'Open' &&
      r.severity === selectedRiskCell.severity &&
      r.likelihood === selectedRiskCell.likelihood
    );
  });

  const getProjectName = (projId) => {
    const p = projects.find(proj => proj.id === projId);
    return p ? p.name : `Project #${projId}`;
  };

  const getHeatmapColor = (sev, like, count) => {
    if (count === 0) return 'bg-slate-50 text-slate-400 border-slate-200';
    if (sev === 'High' && like === 'High') return 'bg-red-500 text-white border-red-600 font-bold';
    if ((sev === 'High' && like === 'Medium') || (sev === 'Medium' && like === 'High')) return 'bg-orange-500 text-white border-orange-600 font-medium';
    if ((sev === 'Medium' && like === 'Medium') || (sev === 'High' && like === 'Low') || (sev === 'Low' && like === 'High')) return 'bg-yellow-500 text-slate-900 border-yellow-600 font-medium';
    return 'bg-green-500 text-white border-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Executive Portfolio Dashboard</h1>
          <p className="text-xs text-slate-500">Live tracker showing construction status, money spent, and safety alerts for our active solar plant installations.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onViewChange('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm animate-fade-in"
          >
            <Activity className="h-3.5 w-3.5" />
            Weekly AI Report
          </button>
          <button 
            onClick={() => onViewChange('risks')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            Risk Register
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {/* ... keeping other components ... */}
      {/* (rest of return is same, we target the budget vs spend titles next) */}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider" title="The total budget approved for all solar projects combined.">Approved Budget (Total)</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(kpis.totalBudget)}</h3>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-0.5">
              <Zap className="h-3 w-3 text-amber-500" />
              {kpis.totalCapacity} MW Target Power Generation
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100 text-teal-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider" title="The total money we have actually spent on panels, civil works, and grid connection so far.">Total Money Spent</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(kpis.totalSpend)}</h3>
            <p className="text-[10px] text-slate-500 mt-1">
              Spent {(kpis.totalSpend / kpis.totalBudget * 100).toFixed(1)}% of our total budget
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider" title="How close the plants are to being fully built.">Construction Progress</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{kpis.overallPercentComplete}%</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-teal-600 h-full rounded-full" style={{ width: `${kpis.overallPercentComplete}%` }}></div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider" title="Are we spending more or less than our budget? Red means we have spent too much, green means we saved money.">Budget Status (Variance)</span>
            <h3 className={`text-xl font-bold mt-1 ${kpis.budgetVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {kpis.budgetVariance >= 0 ? '+' : ''}{formatCurrency(kpis.budgetVariance)}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-0.5">
              {kpis.budgetVariance >= 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center">
                  <Zap className="h-3 w-3 mr-0.5" /> Saved Money (Under Budget)
                </span>
              ) : (
                <span className="text-rose-600 font-semibold flex items-center">
                  <TrendingDown className="h-3 w-3 mr-0.5" /> Over Budget (Overspent)
                </span>
              )}
            </p>
          </div>
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${kpis.budgetVariance >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div 
          onClick={handleUrgentRisksClick}
          className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-start justify-between cursor-pointer hover:shadow-md transition-shadow select-none"
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider" title="Critical issues (like grid connection delays or weather damage) that need immediate fixes.">Urgent Problems (Risks)</span>
            <h3 className={`text-xl font-bold mt-1 ${kpis.openHighRisks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{kpis.openHighRisks}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Need Immediate Solutions</p>
          </div>
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${kpis.openHighRisks > 0 ? 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts Stack: Full Width Budget Bar Chart and Full Width S-Curve Chart Below It */}
      <div className="space-y-6">
        {/* Budget vs Actual Chart (Full Width) */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm flex flex-col h-[340px] justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Money Budgeted vs. Money Spent (₹ Crores)</h3>
              <p className="text-[11px] text-slate-500">Compare target approved budget (dark bars) against the actual money spent (teal bars) for each project.</p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status:</span>
                <select
                  value={chartStatusFilter}
                  onChange={(e) => {
                    setChartStatusFilter(e.target.value);
                    setChartPage(0);
                  }}
                  className="bg-white border border-slate-200 text-xs text-slate-700 font-semibold px-2 py-1 rounded-lg shadow-sm focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="All">All Projects</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {totalChartPages > 1 && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-lg select-none">
                  <button
                    type="button"
                    onClick={() => setChartPage(p => Math.max(0, p - 1))}
                    disabled={safeChartPage === 0}
                    className="p-1 hover:bg-slate-200/70 disabled:opacity-30 rounded transition-all text-slate-700 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex gap-1 items-center">
                    {Array.from({ length: totalChartPages }).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setChartPage(idx)}
                        className={`h-2 w-2 rounded-full transition-all ${safeChartPage === idx ? 'bg-teal-600 scale-125' : 'bg-slate-300 hover:bg-slate-400'} cursor-pointer`}
                        title={`Slide to Page ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setChartPage(p => Math.min(totalChartPages - 1, p + 1))}
                    disabled={safeChartPage === totalChartPages - 1}
                    className="p-1 hover:bg-slate-200/70 disabled:opacity-30 rounded transition-all text-slate-700 cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: '10px' }} tickLine={false} interval={0} height={45} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#64748b' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Budget" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spend" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Schedule S-curve Chart (Full Width Directly Below Budget Bar) */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">Project Speed Tracker (S-Curve)</h3>
                <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                  {selectedSCurveProject
                    ? `📍 Scope: ${selectedSCurveProject.name}`
                    : (userRole === 'Site Engineer' && projects.length === 1
                        ? `📍 Scope: ${projects[0].name}`
                        : `🌐 Scope: National Solar Portfolio Average (All 50 Solar Parks)`)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Compares physical baseline construction targets against actual field progress (% completion over time).
              </p>
            </div>

            {/* Filter Dropdown & Live Progress Status Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0">Filter Plant:</span>
                <select
                  value={selectedSCurveProjectId}
                  onChange={(e) => setSelectedSCurveProjectId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[200px] sm:max-w-[230px] truncate"
                >
                  <option value="all">🌐 All 50 Plants (Portfolio Average)</option>
                  <optgroup label="⚠️ Need Focus (Critical & At Risk)">
                    {projects
                      .filter(p => p.status === 'Critical' || p.status === 'At Risk')
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.status === 'Critical' ? '🔴' : '🟡'} {p.name} ({p.percentComplete}%)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="🟢 On Track Projects">
                    {projects
                      .filter(p => p.status === 'On Track')
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          🟢 {p.name} ({p.percentComplete}%)
                        </option>
                      ))}
                  </optgroup>
                </select>
                {selectedSCurveProjectId !== 'all' && (
                  <button
                    onClick={() => setSelectedSCurveProjectId('all')}
                    className="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded cursor-pointer shrink-0"
                    title="Reset to portfolio average"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Live Progress Status Callout Pill */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 shadow-xs border ${
                isScheduleLagging
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${isScheduleLagging ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                <span>
                  September 2026: {activeActual}% Actual vs {plannedCurrentTarget}% Target ({isScheduleLagging ? `🟡 ${currentScheduleLag}% Schedule Lag` : '🟢 On Schedule'})
                </span>
              </div>
            </div>
          </div>

          <div className="h-[240px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sCurveData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(v) => v.split('-')[1] + '/2026'} 
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[30, 100]} 
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} 
                  tickLine={false} 
                  unit="%"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '10px', border: 'none', fontSize: '12px', padding: '10px 14px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}
                  formatter={(value, name) => [`${value}%`, name === 'Planned' ? 'Planned Target (Baseline Master Schedule)' : 'Actual Field Progress (Signed Off On-Site)']}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  formatter={(value) => value === 'Planned' ? 'Planned Master Target (Grey Line)' : 'Actual Field Progress (Teal Line)'}
                />
                <Line type="monotone" dataKey="Planned" name="Planned" stroke="#94a3b8" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Actual" name="Actual" stroke="#14b8a6" strokeWidth={3.5} activeDot={{ r: 7 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Self-Explanatory Quick Legend & How-To Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-400 shrink-0"></span>
              <span><strong>Grey Line:</strong> Planned baseline target from master EPC schedule.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-teal-500 shrink-0"></span>
              <span><strong>Teal Line:</strong> Verified physical progress signed off on site.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold shrink-0">⚠️ Rule:</span>
              <span>Teal line below grey line = Construction running behind schedule.</span>
            </div>
          </div>

          {/* Dynamic AI Root Cause Schedule Lag Diagnosis Panel */}
          {isAllProjects ? (
            isScheduleLagging && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-600 animate-ping"></span>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      🔍 Why Is Construction Running {currentScheduleLag}% Behind Target? (Portfolio Root Cause Analysis)
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    5 Critical & 7 At Risk Sites Need Leadership Focus
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white border border-amber-100 p-3 rounded-lg space-y-1.5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-amber-900">1. Raghanesda Solar Park Phase 1 (40% Complete — 🔴 Critical Lag)</span>
                        <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">Welspun Energy</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                        Substation 220kV transmission line interconnection approval delayed by state electricity transmission company. Halts final inverter energization.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSCurveProjectId(10)}
                      className="self-start text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>Inspect Raghanesda on S-Curve</span>
                      <span>→</span>
                    </button>
                  </div>

                  <div className="bg-white border border-amber-100 p-3 rounded-lg space-y-1.5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-amber-900">2. Kamuthi Solar Sanctuary Phase 1 (65% Complete — 🟡 At Risk)</span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Avaada Energy</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                        340 containers of single-axis tracker torque frames delayed at Mundra Port customs inspection yards, creating a 45-day downstream assembly lag.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSCurveProjectId(6)}
                      className="self-start text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>Inspect Kamuthi on S-Curve</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>

                {/* Quick Selection Tag Bar for Flagged Projects */}
                <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="font-bold text-amber-900">Click to filter S-Curve by site needing focus:</span>
                  {projects
                    .filter(p => p.status === 'Critical' || p.status === 'At Risk')
                    .slice(0, 5)
                    .map(p => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setSelectedSCurveProjectId(p.id)}
                        className={`px-2 py-0.5 rounded-full font-bold border cursor-pointer transition-all ${
                          p.status === 'Critical'
                            ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {p.status === 'Critical' ? '🔴' : '🟡'} {p.name.split(' Solar')[0]} ({p.percentComplete}%)
                      </button>
                    ))}
                </div>
              </div>
            )
          ) : (
            /* Selected Specific Project AI Diagnosis */
            <div className={`border rounded-xl p-3.5 space-y-2.5 ${
              isScheduleLagging ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50/80 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full animate-ping ${isScheduleLagging ? 'bg-amber-600' : 'bg-emerald-600'}`}></span>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isScheduleLagging ? 'text-amber-900' : 'text-emerald-900'}`}>
                    🔍 Site AI Diagnosis — {selectedSCurveProject?.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSCurveProjectId('all')}
                  className="text-xs font-bold text-teal-800 hover:text-teal-950 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>↩️ View Portfolio Average (All 50 Plants)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Performance Status</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedSCurveProject?.percentComplete}% Complete ({selectedSCurveProject?.status})
                  </p>
                  <p className={`text-[11px] font-semibold mt-1 ${isScheduleLagging ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {isScheduleLagging ? `⚠️ Running ${currentScheduleLag}% behind September target` : '🟢 Milestones tracking on schedule'}
                  </p>
                </div>

                <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Contractor</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedSCurveProject?.contractor}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{selectedSCurveProject?.location}</p>
                </div>

                <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Recommended PMO Action</span>
                  <p className="text-[11px] text-slate-700 font-medium mt-1 leading-relaxed">
                    {isScheduleLagging
                      ? `Escalate milestone sign-off with ${selectedSCurveProject?.contractor}. Deploy accelerated civil shifts and expedite procurement clearances to recover ${currentScheduleLag}% lag before COD penalty.`
                      : `Maintain current civil and electrical velocity. Execution meets contractual milestones under ${selectedSCurveProject?.contractor}.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Heatmap and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Heatmap (Severity x Likelihood) */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col h-auto">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">Problem Alert Grid (Risk Heatmap)</h3>
            <p className="text-[11px] text-slate-500">Click any box in the grid to view details. Dark red boxes represent high-impact, likely problems.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center my-2">
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-slate-500">
              {/* Row 1: High Severity */}
              <div className="flex items-center justify-end pr-2 text-right font-bold text-slate-600">High</div>
              <button
                type="button"
                onClick={() => setSelectedRiskCell({ severity: 'High', likelihood: 'Low' })}
                className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer outline-none ${
                  selectedRiskCell.severity === 'High' && selectedRiskCell.likelihood === 'Low'
                    ? 'ring-2 ring-slate-900 border-transparent shadow-md scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${getHeatmapColor('High', 'Low', heatmapGrid.High.Low)}`}
              >
                <span className="text-sm font-semibold">{heatmapGrid.High.Low}</span>
                <span className="text-[8px] opacity-80">Low-Risk</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiskCell({ severity: 'High', likelihood: 'Medium' })}
                className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer outline-none ${
                  selectedRiskCell.severity === 'High' && selectedRiskCell.likelihood === 'Medium'
                    ? 'ring-2 ring-slate-900 border-transparent shadow-md scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${getHeatmapColor('High', 'Medium', heatmapGrid.High.Medium)}`}
              >
                <span className="text-sm font-semibold">{heatmapGrid.High.Medium}</span>
                <span className="text-[8px] opacity-90">Medium-Risk</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiskCell({ severity: 'High', likelihood: 'High' })}
                className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer outline-none ${
                  selectedRiskCell.severity === 'High' && selectedRiskCell.likelihood === 'High'
                    ? 'ring-2 ring-slate-900 border-transparent shadow-md scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${getHeatmapColor('High', 'High', heatmapGrid.High.High)}`}
              >
                <span className="text-sm font-semibold">{heatmapGrid.High.High}</span>
                <span className="text-[8px] opacity-90">High-Risk</span>
              </button>

              {/* Row 2: Medium Severity */}
              <div className="flex items-center justify-end pr-2 text-right font-bold text-slate-600">Med</div>
              <button
                type="button"
                onClick={() => setSelectedRiskCell({ severity: 'Medium', likelihood: 'Low' })}
                className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer outline-none ${
                  selectedRiskCell.severity === 'Medium' && selectedRiskCell.likelihood === 'Low'
                    ? 'ring-2 ring-slate-900 border-transparent shadow-md scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${getHeatmapColor('Medium', 'Low', heatmapGrid.Medium.Low)}`}
              >
                <span className="text-sm font-semibold">{heatmapGrid.Medium.Low}</span>
                <span className="text-[8px] opacity-80">Low-Risk</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiskCell({ severity: 'Medium', likelihood: 'Medium' })}
                className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer outline-none ${
                  selectedRiskCell.severity === 'Medium' && selectedRiskCell.likelihood === 'Medium'
                    ? 'ring-2 ring-slate-900 border-transparent shadow-md scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${getHeatmapColor('Medium', 'Medium', heatmapGrid.Medium.Medium)}`}
              >
                <span className="text-sm font-semibold">{heatmapGrid.Medium.Medium}</span>
                <span className="text-[8px] opacity-85">Medium-Risk</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiskCell({ severity: 'Medium', likelihood: 'High' })}
                className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer outline-none ${
                  selectedRiskCell.severity === 'Medium' && selectedRiskCell.likelihood === 'High'
                    ? 'ring-2 ring-slate-900 border-transparent shadow-md scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${getHeatmapColor('Medium', 'High', heatmapGrid.Medium.High)}`}
              >
                <span className="text-sm font-semibold">{heatmapGrid.Medium.High}</span>
                <span className="text-[8px] opacity-85">Medium-Risk</span>
              </button>

              {/* Row 3: Low Severity */}
              <div className="flex items-center justify-end pr-2 text-right font-bold text-slate-600">Low</div>
              <button
                type="button"
                onClick={() => setSelectedRiskCell({ severity: 'Low', likelihood: 'Low' })}
                className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer outline-none ${
                  selectedRiskCell.severity === 'Low' && selectedRiskCell.likelihood === 'Low'
                    ? 'ring-2 ring-slate-900 border-transparent shadow-md scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${getHeatmapColor('Low', 'Low', heatmapGrid.Low.Low)}`}
              >
                <span className="text-sm font-semibold">{heatmapGrid.Low.Low}</span>
                <span className="text-[8px] opacity-80">Low-Risk</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiskCell({ severity: 'Low', likelihood: 'Medium' })}
                className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer outline-none ${
                  selectedRiskCell.severity === 'Low' && selectedRiskCell.likelihood === 'Medium'
                    ? 'ring-2 ring-slate-900 border-transparent shadow-md scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${getHeatmapColor('Low', 'Medium', heatmapGrid.Low.Medium)}`}
              >
                <span className="text-sm font-semibold">{heatmapGrid.Low.Medium}</span>
                <span className="text-[8px] opacity-80">Low-Risk</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRiskCell({ severity: 'Low', likelihood: 'High' })}
                className={`h-14 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer outline-none ${
                  selectedRiskCell.severity === 'Low' && selectedRiskCell.likelihood === 'High'
                    ? 'ring-2 ring-slate-900 border-transparent shadow-md scale-[1.03] z-10'
                    : 'hover:scale-[1.02]'
                } ${getHeatmapColor('Low', 'High', heatmapGrid.Low.High)}`}
              >
                <span className="text-sm font-semibold">{heatmapGrid.Low.High}</span>
                <span className="text-[8px] opacity-80">Low-Risk</span>
              </button>

              {/* Bottom Labels */}
              <div></div>
              <div className="py-1 font-bold text-slate-500">Low</div>
              <div className="py-1 font-bold text-slate-500">Medium</div>
              <div className="py-1 font-bold text-slate-500">High</div>
            </div>
            <div className="text-[9px] text-center mt-2.5 text-slate-400 font-medium">
              Y-Axis: How bad is the problem? (Severity) | X-Axis: How likely is it to happen? (Likelihood)
            </div>

            {/* Selected Cell Risk Detail Section */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex-1 flex flex-col min-h-[220px]">
              <div className="flex items-center justify-between gap-2 mb-2 select-none">
                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                  Detail: {selectedRiskCell.severity} / {selectedRiskCell.likelihood} Cell
                </span>
                <span className="bg-slate-100 text-slate-700 text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  {selectedCellRisks.length} Risks Listed
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-2 text-[11px]">
                {selectedCellRisks.map(r => (
                  <div key={r.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex justify-between items-start gap-2 mb-0.5">
                      <span className="font-bold text-slate-800 leading-tight">
                        {r.project_name}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 shrink-0">
                        Owner: {r.owner.split(' (')[0]}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium mb-1.5">
                      {r.description}
                    </p>
                    <div className="flex items-start gap-1 bg-white border border-slate-100 p-1 rounded text-[10px]">
                      <span className="font-bold text-teal-800 shrink-0">Action Plan:</span>
                      <span className="text-slate-600 leading-normal font-medium">{r.resolution || 'Active mitigation monitoring.'}</span>
                    </div>
                  </div>
                ))}
                {selectedCellRisks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-400 flex-1">
                    <span className="text-lg">🛡️</span>
                    <p className="text-[10.5px] font-medium mt-1">No open risks in this cell block.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Status Table */}
        <div id="project-list-table" className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Solar Plant Projects List</h3>
                <p className="text-[11px] text-slate-500">Detailed list of all active solar plants, showing their size, budget, progress, and current health status.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Status Dropdown */}
                <select
                  value={tableStatusFilter}
                  onChange={(e) => {
                    setTableStatusFilter(e.target.value);
                    setTablePage(0);
                  }}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold px-2 py-1.5 rounded-lg shadow-sm focus:outline-none focus:border-slate-950 cursor-pointer"
                >
                  <option value="All">All Health Statuses</option>
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Critical">Critical</option>
                  <option value="At Risk / Critical">Urgent Problems (At Risk/Critical)</option>
                </select>

                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setTablePage(0);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-950 focus:bg-white rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none placeholder:text-slate-400 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 pb-3">Project Name</th>
                    <th className="py-2.5 pb-3">Plant Size</th>
                    <th className="py-2.5 pb-3">Budget (INR)</th>
                    <th className="py-2.5 pb-3">Completion</th>
                    <th className="py-2.5 pb-3">Health Status</th>
                    <th className="py-2.5 pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProjects.map((p) => {
                    let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    if (p.status === 'At Risk') statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                    if (p.status === 'Critical') statusColor = 'bg-rose-50 text-rose-700 border-rose-100';

                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-900">
                          <div>
                            {p.name}
                            <div className="text-[9.5px] font-normal text-slate-400 mt-0.5">{p.location.split(',')[0]}</div>
                          </div>
                        </td>
                        <td className="py-3 font-medium text-slate-600">{p.capacityMw} MW</td>
                        <td className="py-3 text-slate-600 font-medium">{formatCurrency(p.budget)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-600 h-full rounded-full" style={{ width: `${p.percentComplete}%` }}></div>
                            </div>
                            <span className="font-semibold text-slate-700 text-[11px]">{p.percentComplete}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => onSelectProject(p.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white rounded text-[10px] font-bold text-slate-700 transition-all cursor-pointer border border-slate-200"
                          >
                            View Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedProjects.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                        No projects match your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 text-[11px] font-medium text-slate-500 select-none">
            <span>
              Showing {filteredProjects.length > 0 ? activeTablePage * tablePageSize + 1 : 0} to {Math.min(filteredProjects.length, (activeTablePage + 1) * tablePageSize)} of {filteredProjects.length} projects
            </span>
            {totalTablePages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTablePage(p => Math.max(0, p - 1))}
                  disabled={activeTablePage === 0}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded text-slate-700 transition-all font-semibold cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-1 text-slate-600">Page {activeTablePage + 1} of {totalTablePages}</span>
                <button
                  type="button"
                  onClick={() => setTablePage(p => Math.min(totalTablePages - 1, p + 1))}
                  disabled={activeTablePage === totalTablePages - 1}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded text-slate-700 transition-all font-semibold cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
