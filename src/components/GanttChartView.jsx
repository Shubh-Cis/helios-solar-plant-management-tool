import React, { useState, useMemo, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Plus, 
  Layers, 
  Zap, 
  ShieldAlert, 
  Edit3, 
  Info,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Sliders,
  Check
} from 'lucide-react';

export default function GanttChartView({ project, milestones = [], userRole, onUpdateMilestone, onRefresh }) {
  // View options & state
  const [timeScale, setTimeScale] = useState('Month'); // 'Day', 'Week', 'Month', 'Quarter'
  const [viewMode, setViewMode] = useState('gantt'); // 'gantt', 'baseline', 'critical'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [showDependencies, setShowDependencies] = useState(true);
  const [showBaselines, setShowBaselines] = useState(true);
  const [collapsedPhases, setCollapsedPhases] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Form state for editing task
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState('In Progress');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Generate full EPC Solar Plant WBS tasks from project & DB milestones
  const allTasks = useMemo(() => {
    const projStart = project?.startDate ? new Date(project.startDate) : new Date('2025-01-10');
    const projEnd = project?.endDate ? new Date(project.endDate) : new Date('2026-12-31');
    const isProjectCompleted = (project?.percentComplete || 0) >= 85;
    const isCritical = project?.status === 'Critical';
    const isAtRisk = project?.status === 'At Risk';

    // Base EPC solar template generator helper
    const addDays = (date, days) => {
      const d = new Date(date);
      d.setDate(d.getDate() + days);
      return d;
    };

    // Construct detailed EPC tasks matching real-world utility-scale solar projects
    const rawEpcTasks = [
      // Phase 1: Site Land & Regulatory Clearances
      {
        id: 'epc-1',
        dbMilestoneId: milestones.find(m => m.name.includes('Land') || m.name.includes('Mobilization'))?.id,
        wbs: '1.1',
        name: 'Land Lease, Topographical & Geotechnical Survey',
        phase: 'Phase 1: Permitting & Land Clearances',
        startDate: projStart,
        dueDate: addDays(projStart, 35),
        baselineStartDate: projStart,
        baselineEndDate: addDays(projStart, 30),
        progress: 100,
        status: 'Completed',
        isCritical: true,
        isMilestone: false,
        dependencies: [],
        weight: 5,
        assignee: 'Civil Lead & Revenue Dept',
        contractor: 'Geotech Solutions Ltd'
      },
      {
        id: 'epc-2',
        dbMilestoneId: milestones.find(m => m.name.includes('Clearance') || m.name.includes('Design'))?.id,
        wbs: '1.2',
        name: 'PGCIL Grid Interconnection & Environmental Clearances',
        phase: 'Phase 1: Permitting & Land Clearances',
        startDate: addDays(projStart, 15),
        dueDate: addDays(projStart, 65),
        baselineStartDate: addDays(projStart, 15),
        baselineEndDate: addDays(projStart, 60),
        progress: 100,
        status: 'Completed',
        isCritical: true,
        isMilestone: true,
        dependencies: ['epc-1'],
        weight: 10,
        assignee: 'Regulatory & Grid Sync Team',
        contractor: 'PGCIL Consultants'
      },

      // Phase 2: Engineering & Procurement
      {
        id: 'epc-3',
        wbs: '2.1',
        name: 'Bifacial Solar PV Module Procurement & Port Logistics',
        phase: 'Phase 2: Detailed EPC Engineering & Procurement',
        startDate: addDays(projStart, 40),
        dueDate: addDays(projStart, 140),
        baselineStartDate: addDays(projStart, 40),
        baselineEndDate: addDays(projStart, 120),
        progress: isProjectCompleted ? 100 : (isCritical ? 55 : 85),
        status: isProjectCompleted ? 'Completed' : (isCritical ? 'Delayed' : 'In Progress'),
        isCritical: true,
        isMilestone: false,
        dependencies: ['epc-2'],
        weight: 25,
        assignee: 'Global Supply Chain Lead',
        contractor: project?.contractor || 'Tier 1 PV OEM'
      },
      {
        id: 'epc-4',
        wbs: '2.2',
        name: 'Single-Axis Tracker & Inverter Station Orders',
        phase: 'Phase 2: Detailed EPC Engineering & Procurement',
        startDate: addDays(projStart, 50),
        dueDate: addDays(projStart, 150),
        baselineStartDate: addDays(projStart, 50),
        baselineEndDate: addDays(projStart, 140),
        progress: isProjectCompleted ? 100 : 70,
        status: isProjectCompleted ? 'Completed' : 'In Progress',
        isCritical: false,
        isMilestone: false,
        dependencies: ['epc-2'],
        weight: 15,
        assignee: 'Procurement Specialist',
        contractor: 'NextTracker & Sungrow'
      },

      // Phase 3: Civil & Structural Construction
      {
        id: 'epc-5',
        dbMilestoneId: milestones.find(m => m.name.includes('Piling') || m.name.includes('Tracker'))?.id,
        wbs: '3.1',
        name: 'Site Grading, Internal Roads & Piling Foundation',
        phase: 'Phase 3: Civil Foundations & Mechanical Works',
        startDate: addDays(projStart, 100),
        dueDate: addDays(projStart, 230),
        baselineStartDate: addDays(projStart, 100),
        baselineEndDate: addDays(projStart, 210),
        progress: milestones.find(m => m.name.includes('Piling'))?.progress || (isProjectCompleted ? 100 : 60),
        status: milestones.find(m => m.name.includes('Piling'))?.status || (isProjectCompleted ? 'Completed' : 'In Progress'),
        isCritical: true,
        isMilestone: false,
        dependencies: ['epc-3', 'epc-4'],
        weight: 20,
        assignee: 'Site Infrastructure Lead',
        contractor: project?.contractor || 'L&T Civil Infra'
      },
      {
        id: 'epc-6',
        dbMilestoneId: milestones.find(m => m.name.includes('Mounting') || m.name.includes('PV Module'))?.id,
        wbs: '3.2',
        name: 'Tracker Structure Assembly & Solar PV Module Mounting',
        phase: 'Phase 3: Civil Foundations & Mechanical Works',
        startDate: addDays(projStart, 180),
        dueDate: addDays(projStart, 340),
        baselineStartDate: addDays(projStart, 170),
        baselineEndDate: addDays(projStart, 320),
        progress: milestones.find(m => m.name.includes('Mounting'))?.progress || (isProjectCompleted ? 100 : 45),
        status: milestones.find(m => m.name.includes('Mounting'))?.status || (isProjectCompleted ? 'Completed' : (isAtRisk ? 'Delayed' : 'In Progress')),
        isCritical: true,
        isMilestone: true,
        dependencies: ['epc-5'],
        weight: 20,
        assignee: 'Site Mechanical Engineer',
        contractor: project?.contractor || 'Tata Power EPC'
      },

      // Phase 4: Electrical & Substation Infrastructure
      {
        id: 'epc-7',
        wbs: '4.1',
        name: 'DC/AC Underground Trenching & String Combiner Cabling',
        phase: 'Phase 4: Electrical Infrastructure & SCADA',
        startDate: addDays(projStart, 220),
        dueDate: addDays(projStart, 390),
        baselineStartDate: addDays(projStart, 210),
        baselineEndDate: addDays(projStart, 370),
        progress: isProjectCompleted ? 100 : 35,
        status: isProjectCompleted ? 'Completed' : 'In Progress',
        isCritical: false,
        isMilestone: false,
        dependencies: ['epc-6'],
        weight: 10,
        assignee: 'Electrical Lead',
        contractor: 'Sterling & Wilson'
      },
      {
        id: 'epc-8',
        dbMilestoneId: milestones.find(m => m.name.includes('Substation') || m.name.includes('Energization'))?.id,
        wbs: '4.2',
        name: 'Pooling Substation (220kV) & SCADA Control Room Build',
        phase: 'Phase 4: Electrical Infrastructure & SCADA',
        startDate: addDays(projStart, 260),
        dueDate: addDays(projStart, 440),
        baselineStartDate: addDays(projStart, 250),
        baselineEndDate: addDays(projStart, 420),
        progress: milestones.find(m => m.name.includes('Substation'))?.progress || (isProjectCompleted ? 100 : 20),
        status: milestones.find(m => m.name.includes('Substation'))?.status || (isProjectCompleted ? 'Completed' : 'Pending'),
        isCritical: true,
        isMilestone: true,
        dependencies: ['epc-7'],
        weight: 15,
        assignee: 'High Voltage Engineer',
        contractor: 'ABB / Siemens India'
      },

      // Phase 5: Commissioning & COD
      {
        id: 'epc-9',
        wbs: '5.1',
        name: 'Cold Testing, Protection Relay Setup & Pre-commissioning',
        phase: 'Phase 5: Grid Commissioning & COD',
        startDate: addDays(projStart, 420),
        dueDate: addDays(projStart, 490),
        baselineStartDate: addDays(projStart, 410),
        baselineEndDate: addDays(projStart, 480),
        progress: isProjectCompleted ? 100 : 0,
        status: isProjectCompleted ? 'Completed' : 'Pending',
        isCritical: true,
        isMilestone: false,
        dependencies: ['epc-8'],
        weight: 5,
        assignee: 'Testing & Commissioning Engineer',
        contractor: 'Helios Audit Team'
      },
      {
        id: 'epc-10',
        dbMilestoneId: milestones.find(m => m.name.includes('Commercial') || m.name.includes('COD'))?.id,
        wbs: '5.2',
        name: 'Commercial Operation Date (COD) & PGCIL Grid Sync',
        phase: 'Phase 5: Grid Commissioning & COD',
        startDate: addDays(projStart, 480),
        dueDate: projEnd,
        baselineStartDate: addDays(projStart, 470),
        baselineEndDate: projEnd,
        progress: milestones.find(m => m.name.includes('COD'))?.progress || (isProjectCompleted ? 100 : 0),
        status: milestones.find(m => m.name.includes('COD'))?.status || (isProjectCompleted ? 'Completed' : (isCritical ? 'Delayed' : 'Pending')),
        isCritical: true,
        isMilestone: true,
        dependencies: ['epc-9'],
        weight: 10,
        assignee: 'Project Director & PGCIL',
        contractor: 'Helios Operations'
      }
    ];

    return rawEpcTasks;
  }, [project, milestones]);

  // Unique phases
  const phases = useMemo(() => {
    const set = new Set();
    allTasks.forEach(t => set.add(t.phase));
    return Array.from(set);
  }, [allTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.wbs.includes(searchQuery) ||
                            task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPhase = phaseFilter === 'All' || task.phase === phaseFilter;
      return matchesSearch && matchesStatus && matchesPhase;
    });
  }, [allTasks, searchQuery, statusFilter, phaseFilter]);

  // Compute Timeline overall date bounds (min & max)
  const timelineBounds = useMemo(() => {
    if (allTasks.length === 0) {
      const now = new Date();
      return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear() + 1, 11, 31) };
    }

    let min = new Date(allTasks[0].startDate);
    let max = new Date(allTasks[0].dueDate);

    allTasks.forEach(t => {
      const s = new Date(t.startDate);
      const e = new Date(t.dueDate);
      const bs = new Date(t.baselineStartDate);
      const be = new Date(t.baselineEndDate);

      if (s < min) min = s;
      if (bs < min) min = bs;
      if (e > max) max = e;
      if (be > max) max = be;
    });

    // Add padding (15 days before start, 15 days after end)
    const paddedMin = new Date(min);
    paddedMin.setDate(paddedMin.getDate() - 15);
    const paddedMax = new Date(max);
    paddedMax.setDate(paddedMax.getDate() + 20);

    return { start: paddedMin, end: paddedMax };
  }, [allTasks]);

  // Total days span
  const totalSpanDays = useMemo(() => {
    const diff = timelineBounds.end.getTime() - timelineBounds.start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  }, [timelineBounds]);

  // Generate Timeline Header Columns based on timeScale
  const headerColumns = useMemo(() => {
    const cols = [];
    const curr = new Date(timelineBounds.start);

    if (timeScale === 'Month' || timeScale === 'Quarter') {
      while (curr <= timelineBounds.end) {
        const monthYear = curr.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        const year = curr.getFullYear();
        const monthIndex = curr.getMonth();

        // Calculate days in this month
        const nextMonth = new Date(year, monthIndex + 1, 1);
        const monthEnd = nextMonth > timelineBounds.end ? timelineBounds.end : nextMonth;
        const monthStart = curr < timelineBounds.start ? timelineBounds.start : new Date(year, monthIndex, 1);
        
        const daysInCol = Math.max(1, Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 3600 * 24)));
        const pctWidth = (daysInCol / totalSpanDays) * 100;

        cols.push({
          label: monthYear,
          subLabel: `Q${Math.floor(monthIndex / 3) + 1}`,
          widthPct: pctWidth,
          date: new Date(curr)
        });

        // Advance to next month
        curr.setMonth(curr.getMonth() + 1);
        curr.setDate(1);
      }
    } else if (timeScale === 'Week') {
      while (curr <= timelineBounds.end) {
        const weekLabel = `W${getWeekNumber(curr)}`;
        const monthLabel = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const nextWeek = new Date(curr);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const daysInCol = Math.min(7, Math.ceil((nextWeek.getTime() - curr.getTime()) / (1000 * 3600 * 24)));
        const pctWidth = (daysInCol / totalSpanDays) * 100;

        cols.push({
          label: weekLabel,
          subLabel: monthLabel,
          widthPct: pctWidth,
          date: new Date(curr)
        });

        curr.setDate(curr.getDate() + 7);
      }
    } else {
      // Days
      while (curr <= timelineBounds.end) {
        const dayLabel = curr.getDate().toString();
        const subLabel = curr.toLocaleDateString('en-US', { weekday: 'narrow' });
        const pctWidth = (1 / totalSpanDays) * 100;

        cols.push({
          label: dayLabel,
          subLabel,
          widthPct: pctWidth,
          date: new Date(curr)
        });

        curr.setDate(curr.getDate() + 1);
      }
    }

    return cols;
  }, [timelineBounds, totalSpanDays, timeScale]);

  // Helper week number
  function getWeekNumber(d) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  // Calculate Today position %
  const todayPct = useMemo(() => {
    const today = new Date();
    if (today < timelineBounds.start || today > timelineBounds.end) return null;
    const diff = today.getTime() - timelineBounds.start.getTime();
    return (diff / (1000 * 3600 * 24 * totalSpanDays)) * 100;
  }, [timelineBounds, totalSpanDays]);

  // Compute Task Bar position (% left, % width)
  const getTaskBarCoords = (startDate, endDate) => {
    const s = new Date(startDate);
    const e = new Date(endDate);

    const startDiff = s.getTime() - timelineBounds.start.getTime();
    const durationDiff = e.getTime() - s.getTime();

    const leftPct = Math.max(0, (startDiff / (1000 * 3600 * 24 * totalSpanDays)) * 100);
    const widthPct = Math.max(0.8, (durationDiff / (1000 * 3600 * 24 * totalSpanDays)) * 100);

    return { leftPct, widthPct };
  };

  // Group tasks by phase for accordion rendering
  const tasksByPhase = useMemo(() => {
    const map = {};
    phases.forEach(p => {
      map[p] = filteredTasks.filter(t => t.phase === p);
    });
    return map;
  }, [phases, filteredTasks]);

  // Handle accordion toggle
  const togglePhase = (phase) => {
    setCollapsedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  // Handle edit task modal open
  const openEditModal = (task) => {
    setSelectedTask(task);
    setEditingTask(task);
    setEditProgress(task.progress || 0);
    setEditStatus(task.status);
    setEditStartDate(new Date(task.startDate).toISOString().split('T')[0]);
    setEditEndDate(new Date(task.dueDate).toISOString().split('T')[0]);
  };

  // Handle saving edit task
  const handleSaveEdit = async () => {
    if (!editingTask) return;
    setSavingEdit(true);
    try {
      if (editingTask.dbMilestoneId && onUpdateMilestone) {
        await onUpdateMilestone(editingTask.dbMilestoneId, editStatus, editProgress);
      }
      // Trigger parent refresh if provided
      if (onRefresh) onRefresh();
      
      // Update local task state simulation
      editingTask.progress = parseInt(editProgress);
      editingTask.status = editStatus;
      editingTask.startDate = new Date(editStartDate);
      editingTask.dueDate = new Date(editEndDate);

      setEditingTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Export Gantt Schedule to CSV
  const handleExportCSV = () => {
    let csv = 'WBS Code,Task Name,Phase,Start Date,Target Due Date,Baseline Start,Baseline End,Duration (Days),Progress (%),Status,Is Critical,Assignee,Contractor\n';
    
    allTasks.forEach(t => {
      const duration = Math.ceil((new Date(t.dueDate) - new Date(t.startDate)) / (1000 * 3600 * 24));
      csv += `"${t.wbs}","${t.name.replace(/"/g, '""')}","${t.phase}","${new Date(t.startDate).toLocaleDateString('en-IN')}","${new Date(t.dueDate).toLocaleDateString('en-IN')}","${new Date(t.baselineStartDate).toLocaleDateString('en-IN')}","${new Date(t.baselineEndDate).toLocaleDateString('en-IN')}","${duration}","${t.progress}","${t.status}","${t.isCritical ? 'Yes' : 'No'}","${t.assignee}","${t.contractor}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project?.name?.replace(/[^a-z0-9]/gi, '_') || 'Helios_Solar_Plant'}_Gantt_Schedule.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Color generator based on task status
  const getStatusStyle = (status, isCritical, viewModeActive) => {
    if (viewModeActive === 'critical' && isCritical) {
      return {
        bar: 'bg-gradient-to-r from-amber-500 to-rose-600 border-rose-400 shadow-md shadow-rose-900/20 text-white',
        badge: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
        fill: 'bg-rose-700/40'
      };
    }

    switch (status) {
      case 'Completed':
        return {
          bar: 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-sm',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
          fill: 'bg-emerald-700/50'
        };
      case 'In Progress':
        return {
          bar: 'bg-gradient-to-r from-indigo-500 to-blue-600 border-indigo-400 text-white shadow-sm',
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
          fill: 'bg-indigo-700/50'
        };
      case 'Delayed':
        return {
          bar: 'bg-gradient-to-r from-rose-500 to-pink-600 border-rose-400 text-white shadow-sm',
          badge: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
          fill: 'bg-rose-700/50'
        };
      default: // 'Pending' or 'Not Started'
        return {
          bar: 'bg-gradient-to-r from-slate-400 to-slate-500 border-slate-300 text-slate-900 shadow-sm',
          badge: 'bg-slate-100 text-slate-600 border-slate-200 font-medium',
          fill: 'bg-slate-600/40'
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden text-slate-900">
      
      {/* Top Header & Filter Controls Bar */}
      <div className="p-5 border-b border-slate-200 bg-slate-900 text-white space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                EPC Construction Master Schedule
              </span>
              <span className="text-slate-400 text-xs font-semibold">| WBS Level 3 Gantt Chart</span>
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
              <span>{project?.name || 'Solar Power Plant'} Gantt Timeline</span>
              <span className="text-xs font-normal text-slate-400">({allTasks.length} Work Packages)</span>
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'gantt' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Gantt Timeline
              </button>
              <button
                onClick={() => setViewMode('baseline')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'baseline' ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Baseline Variance
              </button>
              <button
                onClick={() => setViewMode('critical')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'critical' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Critical Path</span>
              </button>
            </div>

            {/* Scale Selector */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              {['Week', 'Month', 'Quarter'].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setTimeScale(scale)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] transition-all ${
                    timeScale === scale ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {scale}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-400 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Export Schedule as CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Schedule</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search WBS task or engineer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 focus:border-teal-500 text-slate-200 placeholder-slate-400 text-xs pl-8 pr-3 py-1.5 rounded-xl focus:outline-none"
              />
            </div>

            {/* Phase Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Phase:</span>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
              >
                <option value="All">All EPC Phases</option>
                {phases.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-4 text-slate-300 text-[11px] font-semibold">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showBaselines}
                onChange={(e) => setShowBaselines(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-0"
              />
              <span>Planned Baseline</span>
            </label>
            
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDependencies}
                onChange={(e) => setShowDependencies(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-0"
              />
              <span>Dependencies</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Gantt Split Canvas */}
      <div className="flex flex-col lg:flex-row overflow-x-auto min-h-[500px]">
        
        {/* Left Column: WBS Task List Sidebar */}
        <div className="w-full lg:w-96 shrink-0 border-r border-slate-200 bg-slate-50/70 select-none">
          {/* Header */}
          <div className="p-3 bg-slate-100 border-b border-slate-200 font-extrabold text-xs text-slate-700 flex items-center justify-between">
            <span>WBS CODE & WORK PACKAGE</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">PROGRESS / STATUS</span>
          </div>

          {/* Task Accordion List */}
          <div className="divide-y divide-slate-200/80">
            {phases.map((phaseName) => {
              const phaseTasks = tasksByPhase[phaseName] || [];
              if (phaseTasks.length === 0 && searchQuery) return null;
              
              const isCollapsed = collapsedPhases[phaseName];
              const phaseProgress = Math.round(
                phaseTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / Math.max(1, phaseTasks.length)
              );

              return (
                <div key={phaseName} className="bg-white">
                  {/* Phase Summary Header */}
                  <div
                    onClick={() => togglePhase(phaseName)}
                    className="p-3 bg-slate-100/90 hover:bg-slate-200/60 transition-colors flex items-center justify-between cursor-pointer border-l-4 border-teal-500"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                      )}
                      <span className="text-xs font-extrabold text-slate-800 truncate">{phaseName}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500">{phaseProgress}%</span>
                      <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full" style={{ width: `${phaseProgress}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Phase Sub-tasks */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-100">
                      {phaseTasks.map((t) => {
                        const style = getStatusStyle(t.status, t.isCritical, viewMode);
                        const isHovered = hoveredTask?.id === t.id;

                        return (
                          <div
                            key={t.id}
                            onMouseEnter={() => setHoveredTask(t)}
                            onMouseLeave={() => setHoveredTask(null)}
                            onClick={() => openEditModal(t)}
                            className={`p-3 pl-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer border-l-2 ${
                              isHovered ? 'bg-teal-50/60 border-teal-500' : 'border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden pr-2">
                              <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{t.wbs}</span>
                              {t.isMilestone && <span className="text-amber-500 text-xs shrink-0" title="EPC Milestone">◆</span>}
                              <div className="truncate">
                                <p className={`text-xs font-semibold truncate ${t.isCritical && viewMode === 'critical' ? 'text-rose-700 font-extrabold' : 'text-slate-800'}`}>
                                  {t.name}
                                </p>
                                <p className="text-[9.5px] text-slate-400 truncate">Assigned: {t.assignee}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${style.badge}`}>
                                {t.progress}%
                              </span>
                              {(userRole === 'Site Engineer' || userRole === 'Super Admin') && (
                                <Edit3 className="h-3 w-3 text-slate-400 hover:text-teal-600 transition-colors" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Gantt Grid & Bars Timeline */}
        <div className="flex-1 min-w-[650px] relative overflow-x-auto bg-white select-none">
          
          {/* Header Row: Timeline Columns */}
          <div className="sticky top-0 z-20 flex bg-slate-100 border-b border-slate-200 text-slate-700 text-xs font-extrabold">
            {headerColumns.map((col, idx) => (
              <div
                key={idx}
                style={{ width: `${col.widthPct}%` }}
                className="py-2.5 px-1 text-center border-r border-slate-200/80 truncate shrink-0"
              >
                <div className="text-[11px] font-bold">{col.label}</div>
                <div className="text-[9px] font-normal text-slate-400 uppercase">{col.subLabel}</div>
              </div>
            ))}
          </div>

          {/* Grid Rows Container */}
          <div className="relative">
            
            {/* Red/Teal Today Vertical Line Marker */}
            {todayPct !== null && (
              <div
                style={{ left: `${todayPct}%` }}
                className="absolute top-0 bottom-0 z-30 w-0.5 bg-teal-500 pointer-events-none flex flex-col items-center"
              >
                <span className="bg-teal-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow -translate-y-2 uppercase tracking-wider">
                  TODAY
                </span>
              </div>
            )}

            {/* Vertical Column Background Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {headerColumns.map((col, idx) => (
                <div
                  key={idx}
                  style={{ width: `${col.widthPct}%` }}
                  className="h-full border-r border-slate-100 shrink-0"
                />
              ))}
            </div>

            {/* Task Rows */}
            <div className="relative divide-y divide-slate-100 z-10">
              {phases.map((phaseName) => {
                const phaseTasks = tasksByPhase[phaseName] || [];
                if (phaseTasks.length === 0 && searchQuery) return null;
                const isCollapsed = collapsedPhases[phaseName];

                return (
                  <React.Fragment key={phaseName}>
                    {/* Phase Summary Row Bar */}
                    <div className="h-[45px] bg-slate-50/80 border-b border-slate-200 relative flex items-center">
                      {/* Aggregate Phase Bar */}
                      {(() => {
                        if (phaseTasks.length === 0) return null;
                        let minStart = phaseTasks[0].startDate;
                        let maxEnd = phaseTasks[0].dueDate;
                        phaseTasks.forEach(t => {
                          if (new Date(t.startDate) < new Date(minStart)) minStart = t.startDate;
                          if (new Date(t.dueDate) > new Date(maxEnd)) maxEnd = t.dueDate;
                        });
                        const coords = getTaskBarCoords(minStart, maxEnd);
                        const phaseAvgProgress = Math.round(
                          phaseTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / phaseTasks.length
                        );

                        return (
                          <div
                            style={{ left: `${coords.leftPct}%`, width: `${coords.widthPct}%` }}
                            className="absolute h-5 bg-slate-700/80 rounded-md border border-slate-600 flex items-center px-2 text-[10px] text-white font-bold overflow-hidden shadow-sm"
                          >
                            <div className="bg-teal-500/40 h-full absolute left-0 top-0 bottom-0" style={{ width: `${phaseAvgProgress}%` }} />
                            <span className="relative z-10 truncate">{phaseName} ({phaseAvgProgress}%)</span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Subtask Rows */}
                    {!isCollapsed && phaseTasks.map((t) => {
                      const coords = getTaskBarCoords(t.startDate, t.dueDate);
                      const baseCoords = getTaskBarCoords(t.baselineStartDate, t.baselineEndDate);
                      const style = getStatusStyle(t.status, t.isCritical, viewMode);
                      const isHovered = hoveredTask?.id === t.id;

                      const durationDays = Math.max(1, Math.ceil((new Date(t.dueDate) - new Date(t.startDate)) / (1000 * 3600 * 24)));
                      const baselineVarianceDays = Math.round((new Date(t.dueDate) - new Date(t.baselineEndDate)) / (1000 * 3600 * 24));

                      return (
                        <div
                          key={t.id}
                          onMouseEnter={(e) => {
                            setHoveredTask(t);
                            setTooltipPos({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseMove={(e) => {
                            setTooltipPos({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseLeave={() => setHoveredTask(null)}
                          onClick={() => openEditModal(t)}
                          className={`h-[48px] relative flex items-center hover:bg-slate-50/50 transition-colors cursor-pointer ${
                            isHovered ? 'bg-teal-50/30' : ''
                          }`}
                        >
                          {/* Baseline Ghost Shadow Bar (if enabled) */}
                          {showBaselines && (
                            <div
                              style={{ left: `${baseCoords.leftPct}%`, width: `${baseCoords.widthPct}%` }}
                              className="absolute h-2 bottom-1 rounded bg-slate-300 border border-slate-400/60 opacity-60 pointer-events-none"
                              title={`Planned Baseline: ${new Date(t.baselineStartDate).toLocaleDateString()} to ${new Date(t.baselineEndDate).toLocaleDateString()}`}
                            />
                          )}

                          {/* Task Bar */}
                          <div
                            style={{ left: `${coords.leftPct}%`, width: `${coords.widthPct}%` }}
                            className={`absolute h-7 rounded-lg border flex items-center px-2 text-xs transition-all ${style.bar} ${
                              t.isCritical && viewMode === 'critical' ? 'ring-2 ring-rose-500 animate-pulse' : ''
                            }`}
                          >
                            {/* Inner Progress Fill Bar */}
                            <div
                              className={`absolute left-0 top-0 bottom-0 rounded-l-lg ${style.fill}`}
                              style={{ width: `${t.progress}%` }}
                            />

                            {/* Milestone Marker Icon or Label */}
                            <div className="relative z-10 flex items-center justify-between w-full overflow-hidden text-[10px] font-bold text-white drop-shadow-sm gap-1">
                              <span className="truncate">
                                {t.isMilestone && '◆ '}
                                {t.name}
                              </span>

                              <span className="shrink-0 bg-black/20 px-1 py-0.2 rounded text-[9px]">
                                {t.progress}%
                              </span>
                            </div>
                          </div>

                          {/* Delay / Early Variance Badge Flag next to bar */}
                          {baselineVarianceDays !== 0 && (
                            <div
                              style={{ left: `${coords.leftPct + coords.widthPct + 0.5}%` }}
                              className={`absolute text-[9px] font-extrabold px-1.5 py-0.5 rounded border pointer-events-none ${
                                baselineVarianceDays > 0 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {baselineVarianceDays > 0 ? `+${baselineVarianceDays}d delay` : `${baselineVarianceDays}d early`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Schedule Summary KPIs */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 text-white flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Completed: <strong>{allTasks.filter(t => t.status === 'Completed').length}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <span>In Progress: <strong>{allTasks.filter(t => t.status === 'In Progress').length}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>Delayed Work Packages: <strong>{allTasks.filter(t => t.status === 'Delayed').length}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Critical Path Tasks: <strong>{allTasks.filter(t => t.isCritical).length}</strong></span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Target COD: <strong className="text-teal-400 font-bold">{new Date(project?.endDate || '2026-12-31').toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: '2-digit' })}</strong>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredTask && (
        <div
          style={{
            top: `${tooltipPos.y + 15}px`,
            left: `${Math.min(window.innerWidth - 320, tooltipPos.x + 15)}px`
          }}
          className="fixed z-50 w-72 bg-slate-950 text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl pointer-events-none text-xs space-y-2 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono font-bold text-teal-400">{hoveredTask.wbs}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
              hoveredTask.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              hoveredTask.status === 'In Progress' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
              hoveredTask.status === 'Delayed' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300'
            }`}>
              {hoveredTask.status}
            </span>
          </div>

          <h4 className="font-extrabold text-slate-100 text-xs">{hoveredTask.name}</h4>
          <p className="text-[10px] text-slate-400">{hoveredTask.phase}</p>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
            <div>
              <span className="text-slate-500 block">Start Date:</span>
              <strong className="text-slate-200">{new Date(hoveredTask.startDate).toLocaleDateString('en-IN')}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Target Completion:</span>
              <strong className="text-slate-200">{new Date(hoveredTask.dueDate).toLocaleDateString('en-IN')}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Lead Contractor:</span>
              <strong className="text-teal-300 truncate block">{hoveredTask.contractor}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Work Progress:</span>
              <strong className="text-emerald-400 font-bold">{hoveredTask.progress}% Complete</strong>
            </div>
          </div>
        </div>
      )}

      {/* Task Edit Modal (for authorised users) */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4.5 w-4.5 text-teal-400" />
                <h3 className="font-bold text-sm">Update Work Package Schedule</h3>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono font-extrabold text-teal-600 block">{editingTask.wbs}</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{editingTask.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{editingTask.phase}</p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between font-bold">
                  <label className="text-slate-700">Completion Progress (%):</label>
                  <span className="text-teal-600 font-extrabold text-sm">{editProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setEditProgress(val);
                    if (val === 100) setEditStatus('Completed');
                    else if (val > 0 && editStatus === 'Pending') setEditStatus('In Progress');
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Execution Status:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 font-semibold text-slate-800 text-xs rounded-xl p-2.5 focus:outline-none focus:border-teal-600"
                >
                  <option value="Pending">Pending / Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed / Critical Slip</option>
                </select>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date:</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Due Date:</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/20"
              >
                {savingEdit ? 'Saving...' : 'Update Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
