import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Cpu, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  FileText,
  Plus,
  Download
} from 'lucide-react';

export default function ProjectDetailView({ projectId, onBack, userRole }) {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  // Site Manager RAID insertion Form State
  const [newRaidType, setNewRaidType] = useState('Risk');
  const [newRaidDesc, setNewRaidDesc] = useState('');
  const [newRaidSeverity, setNewRaidSeverity] = useState('Medium');
  const [newRaidLikelihood, setNewRaidLikelihood] = useState('Medium');
  const [newRaidOwner, setNewRaidOwner] = useState('');
  const [newRaidStatus, setNewRaidStatus] = useState('Open');
  const [newRaidResolution, setNewRaidResolution] = useState('');
  const [addingRaid, setAddingRaid] = useState(false);
  const [raidError, setRaidError] = useState('');

  const handleDownload = (doc) => {
    const content = `HELIOS RENEWABLES PORTAL - DOCUMENT AUDIT FILE
===================================================
Document Name: ${doc.name}
Linked Project: ${projectData?.name || 'Helios Installation'}
Type: ${doc.type}
Version: ${doc.version}
Status: ${doc.status}
Comments: ${doc.comments || 'N/A'}
Date: ${new Date(doc.uploadDate || doc.upload_date || Date.now()).toLocaleString('en-IN')}

---------------------------------------------------
OCR EXTRACTED TEXT CONTENT:
---------------------------------------------------
${doc.ocrText || doc.ocr_text || 'No OCR text available.'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name.replace('.pdf', '') + '_audit_export.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMilestoneStatusChange = async (milestoneId, newStatus) => {
    let progressVal = 0;
    if (newStatus === 'Completed') progressVal = 100;
    else if (newStatus === 'In Progress') progressVal = 50;
    else if (newStatus === 'Delayed') progressVal = 30;

    try {
      const response = await fetch(`/api/projects/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, progress: progressVal })
      });
      if (!response.ok) throw new Error('Failed to update status');
      
      const updatedMilestone = await response.json();
      
      // Update local state and dynamically recalculate overall project completion percentage
      setProjectData(prev => {
        if (!prev) return prev;
        const updatedMilestones = prev.milestones.map(m => m.id === milestoneId ? { ...m, status: updatedMilestone.status, actualDate: updatedMilestone.actualDate, progress: updatedMilestone.progress } : m);
        
        const weightedSum = updatedMilestones.reduce((sum, m) => sum + ((m.progress || 0) * m.weight), 0);
        const totalWeight = updatedMilestones.reduce((sum, m) => sum + m.weight, 0);
        const newPercent = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
        
        return {
          ...prev,
          project: {
            ...prev.project,
            percentComplete: newPercent
          },
          milestones: updatedMilestones
        };
      });
    } catch (err) {
      console.error('Milestone update error:', err);
    }
  };

  const handleMilestoneProgressChange = async (milestoneId, currentStatus, newProgress) => {
    const progressVal = Math.min(100, Math.max(0, parseInt(newProgress) || 0));
    
    // Automatically adjust status based on progress changes
    let statusVal = currentStatus;
    if (progressVal === 100) {
      statusVal = 'Completed';
    } else if (progressVal === 0) {
      statusVal = 'Pending';
    } else if (currentStatus === 'Completed' || currentStatus === 'Pending') {
      statusVal = 'In Progress';
    }

    try {
      const response = await fetch(`/api/projects/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusVal, progress: progressVal })
      });
      if (!response.ok) throw new Error('Failed to update progress');
      
      const updatedMilestone = await response.json();
      
      // Update local state and dynamically recalculate overall project completion percentage
      setProjectData(prev => {
        if (!prev) return prev;
        const updatedMilestones = prev.milestones.map(m => m.id === milestoneId ? { ...m, status: updatedMilestone.status, actualDate: updatedMilestone.actualDate, progress: updatedMilestone.progress } : m);
        
        const weightedSum = updatedMilestones.reduce((sum, m) => sum + ((m.progress || 0) * m.weight), 0);
        const totalWeight = updatedMilestones.reduce((sum, m) => sum + m.weight, 0);
        const newPercent = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
        
        return {
          ...prev,
          project: {
            ...prev.project,
            percentComplete: newPercent
          },
          milestones: updatedMilestones
        };
      });
    } catch (err) {
      console.error('Milestone progress update error:', err);
    }
  };

  const handleAddRaidEntry = async (e) => {
    e.preventDefault();
    if (!newRaidDesc.trim() || !newRaidOwner.trim()) {
      setRaidError('Description and owner are required.');
      return;
    }
    setRaidError('');
    setAddingRaid(true);

    try {
      const response = await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          type: newRaidType,
          description: newRaidDesc,
          severity: newRaidType === 'Risk' || newRaidType === 'Issue' ? newRaidSeverity : null,
          likelihood: newRaidType === 'Risk' || newRaidType === 'Issue' ? newRaidLikelihood : null,
          owner: newRaidOwner,
          status: newRaidStatus,
          resolution: newRaidResolution || null
        })
      });

      if (!response.ok) throw new Error('Failed to add RAID entry');
      
      const newRaid = await response.json();
      
      // Update local state
      setProjectData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          raidLog: [...prev.raidLog, newRaid]
        };
      });

      // Reset form
      setNewRaidDesc('');
      setNewRaidOwner('');
      setNewRaidResolution('');
    } catch (err) {
      console.error('Add RAID error:', err);
      setRaidError('Failed to add entry to registry.');
    } finally {
      setAddingRaid(false);
    }
  };

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        setProjectData(data);
      } catch (error) {
        console.error('Error fetching project detail:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!projectData || !projectData.project) {
    return (
      <div className="text-center p-8 bg-white border border-slate-100 rounded-xl shadow-sm">
        <p className="text-slate-500 font-medium">Project not found.</p>
        <button onClick={onBack} className="mt-4 px-3 py-1.5 bg-slate-950 text-white rounded text-xs">Go Back</button>
      </div>
    );
  }

  const { project, milestones, sCurve, raidLog, documents } = projectData;

  const formatCurrency = (val) => {
    const croreVal = parseFloat(val) / 10000000;
    return `₹${croreVal.toFixed(2)} Cr`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'On Track': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'At Risk': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Critical': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Generate budget category breakdown (static calculation based on project budget)
  const totalBudget = parseFloat(project.budget);
  const totalSpend = parseFloat(project.actualSpend);
  
  // Dynamic Milestone Progress calculations
  const getMilestoneProgress = (name) => {
    const m = milestones.find(item => item.name === name);
    return m ? (m.progress || 0) : 0;
  };

  const pmoProgress = getMilestoneProgress('Site Mobilization & Engineering Design');
  const civilProgress = getMilestoneProgress('Piling & Tracker Installation');
  const pvProgress = getMilestoneProgress('PV Module Mounting');
  
  // Electrical Substation & Grid Sync is the average of Substation Energization and COD
  const subProgress = getMilestoneProgress('Substation Energization');
  const codProgress = getMilestoneProgress('Commercial Operation Date (COD)');
  const electricalProgress = Math.round((subProgress + codProgress) / 2);

  // Read category weights from localStorage, falling back to defaults if not set
  const storedWeights = localStorage.getItem('helios_epc_weights');
  const weights = storedWeights ? JSON.parse(storedWeights) : { pv: 0.50, civil: 0.25, electrical: 0.15, pmo: 0.10 };

  const budgetBreakdown = [
    { name: 'PV Modules & Solar Array Equipment', pct: weights.pv, color: 'bg-slate-950', progress: pvProgress },
    { name: 'Civil Engineering & Piling Erection', pct: weights.civil, color: 'bg-teal-600', progress: civilProgress },
    { name: 'Electrical Substation & Grid Sync', pct: weights.electrical, color: 'bg-indigo-600', progress: electricalProgress },
    { name: 'PMO, Engineering Design & Licensing', pct: weights.pmo, color: 'bg-amber-500', progress: pmoProgress }
  ];

  // Calculate Earned Value Metrics dynamically
  const progressPercent = (project.percentComplete || 0) / 100;
  const ev = totalBudget * progressPercent;
  const ac = totalSpend;
  
  // CPI
  const cpiVal = ac > 0 ? parseFloat((ev / ac).toFixed(2)) : 1.0;
  let cpiColor = 'text-emerald-600';
  let cpiBadge = '🟢 Cost Efficient';
  
  if (cpiVal < 0.95) {
    cpiColor = 'text-rose-600';
    cpiBadge = '🔴 Cost Overrun';
  } else if (cpiVal < 1.0) {
    cpiColor = 'text-amber-600';
    cpiBadge = '🟡 Minor Overrun';
  }

  // SPI
  // Get planned progress for current month (July 2026) from sCurve if exists, otherwise default to 85%
  const currentMonthCurve = sCurve && sCurve.find(s => s.month === '2026-07');
  const plannedProgressPct = currentMonthCurve ? parseFloat(currentMonthCurve.plannedProgress) / 100 : 0.85;
  const spiVal = plannedProgressPct > 0 ? parseFloat((progressPercent / plannedProgressPct).toFixed(2)) : 1.0;
  
  let spiColor = 'text-emerald-600';
  let spiBadge = '🟢 On Schedule';
  
  if (spiVal < 0.92) {
    spiColor = 'text-rose-600';
    spiBadge = '🔴 Significant Delay';
  } else if (spiVal < 1.0) {
    spiColor = 'text-amber-600';
    spiBadge = '🟡 Minor Schedule Lag';
  }

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <button 
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Portfolio
      </button>

      {/* Project Banner Header */}
      <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-950">{project.name}</h1>
            <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadgeClass(project.status)}`}>
              {project.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {project.location}</span>
            <span className="flex items-center gap-1"><Cpu className="h-3.5 w-3.5 text-slate-400" /> {project.capacityMw} MW Capacity</span>
            <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-slate-400" /> Contractor: {project.contractor}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{project.description}</p>
        </div>

        {/* Overall Completion Rate */}
        <div className="flex items-center gap-4 shrink-0 bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project Progress</span>
            <h3 className="text-2xl font-bold text-slate-950 mt-0.5">{project.percentComplete}%</h3>
            <p className="text-[10px] text-slate-500">Target completion: {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="stroke-slate-200 fill-none" strokeWidth="4"></circle>
              <circle cx="28" cy="28" r="24" className="stroke-teal-600 fill-none" strokeWidth="4" strokeDasharray="150.7" strokeDashoffset={150.7 - (150.7 * project.percentComplete) / 100}></circle>
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-800">{project.percentComplete}%</span>
          </div>
        </div>
      </div>

      {/* Financials & Budget Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards Mini */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between h-auto gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Project Financial Allocation</h3>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Total Budget</span>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(totalBudget)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Actual Spend</span>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(totalSpend)}</p>
              </div>
            </div>
            
            {/* Variance */}
            <div className="border-t border-slate-50 mt-4 pt-3">
              <span className="text-[10px] text-slate-400 font-medium">Variance Exposure</span>
              <p className={`text-sm font-bold mt-0.5 ${totalBudget - totalSpend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totalBudget - totalSpend >= 0 ? '+' : ''}{formatCurrency(totalBudget - totalSpend)}
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div className="bg-teal-600 h-full" style={{ width: `${Math.min(100, (totalSpend / totalBudget) * 100)}%` }}></div>
          </div>
        </div>

        {/* Budget Categories breakdown */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Budget Breakdown by Phase Category</h3>
            <div className="space-y-3 mt-4">
              {budgetBreakdown.map((b, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600">{b.name}</span>
                    <span className="text-slate-900 font-semibold">{formatCurrency(totalBudget * b.pct)} ({b.progress}% complete)</span>
                  </div>
                  <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                    <div className={`${b.color} h-full`} style={{ width: `${b.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Earned Value Metrics */}
      <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Earned Value PMO KPI</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">SPI (Schedule Index)</span>
            <p className={`text-lg font-extrabold mt-1 ${spiColor}`}>{spiVal.toFixed(2)}</p>
            <span className="text-[9px] font-bold block mt-1">{spiBadge}</span>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">CPI (Cost Performance)</span>
            <p className={`text-lg font-extrabold mt-1 ${cpiColor}`}>{cpiVal.toFixed(2)}</p>
            <span className="text-[9px] font-bold block mt-1">{cpiBadge}</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          SPI measures timing efficiency (Target: &ge; 1.0). CPI measures spending efficiency (Target: &ge; 1.0). Currently spending is {cpiVal >= 1.0 ? 'highly optimized' : 'showing variance due to site execution costs'}.
        </p>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-slate-950 text-slate-950 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            WBS Timeline & Milestones
          </button>
          <button
            onClick={() => setActiveTab('raid')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'raid'
                ? 'border-slate-950 text-slate-950 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            RAID Log ({raidLog.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'documents'
                ? 'border-slate-950 text-slate-950 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Linked Documents ({documents.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab 1: WBS Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Project WBS Milestones</h3>
              
              <div className="relative pl-6 border-l border-slate-200 ml-3 space-y-8 py-2">
                {milestones.map((m) => {
                  const targetDateVal = new Date(m.dueDate || m.due_date || Date.now());
                  const isDelayed = targetDateVal < new Date() && m.status !== 'Completed';
                  const computedStatus = isDelayed ? 'Delayed' : m.status;

                  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                  let icon = <Clock className="h-4.5 w-4.5 text-slate-400" />;
                  
                  if (computedStatus === 'Completed') {
                    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    icon = <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />;
                  } else if (computedStatus === 'Delayed') {
                    badgeColor = 'bg-rose-50 text-rose-700 border-rose-100';
                    icon = <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />;
                  } else if (computedStatus === 'In Progress') {
                    badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                    icon = <Activity className="h-4.5 w-4.5 text-indigo-600" />;
                  }

                  return (
                    <div key={m.id} className="relative flex items-start gap-4">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[35px] bg-white rounded-full p-1 border border-slate-200">
                        {icon}
                      </span>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-xs font-semibold text-slate-900">{m.name}</h4>
                          <div className="flex items-center gap-3">
                            {/* Milestone Progress Manage Input */}
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-bold">Progress:</span>
                              {userRole === 'Site Engineer' || userRole === 'Super Admin' ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={m.progress || 0}
                                  onChange={(e) => handleMilestoneProgressChange(m.id, m.status, e.target.value)}
                                  className="w-12 border border-slate-200 focus:border-slate-950 rounded px-1 py-0.5 text-[10px] font-extrabold bg-slate-50 focus:bg-white text-center focus:outline-none"
                                />
                              ) : (
                                <span className="text-[10px] text-slate-700 font-extrabold">{m.progress || 0}</span>
                              )}
                              <span className="text-[10px] text-slate-400 font-bold">%</span>
                            </div>

                            {userRole === 'Site Engineer' || userRole === 'Super Admin' ? (
                              <select
                                value={computedStatus}
                                onChange={(e) => handleMilestoneStatusChange(m.id, e.target.value)}
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border focus:outline-none cursor-pointer bg-white ${badgeColor}`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Delayed">Delayed</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${badgeColor}`}>
                                {m.status}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400">
                          <span>Target Date: {new Date(m.dueDate || m.due_date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          {(m.actualDate || m.actual_date) && (
                            <span className="text-slate-500 font-medium">Actual Date: {new Date(m.actualDate || m.actual_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          )}
                          <span>Task Weight: {m.weight}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: RAID Log */}
          {activeTab === 'raid' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">RAID Log Register</h3>
              {raidLog.length === 0 ? (
                <p className="text-xs text-slate-400">No RAID entries recorded for this project.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                        <th className="py-2">Type</th>
                        <th className="py-2">Description</th>
                        <th className="py-2">Risk Exposure</th>
                        <th className="py-2">Owner</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {raidLog.map((r) => {
                        let typeColor = 'bg-slate-50 text-slate-700';
                        if (r.type === 'Risk') typeColor = 'bg-rose-50 text-rose-700 border-rose-100';
                        if (r.type === 'Dependency') typeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                        if (r.type === 'Issue') typeColor = 'bg-amber-50 text-amber-700 border-amber-100';
                        if (r.type === 'Assumption') typeColor = 'bg-teal-50 text-teal-700 border-teal-100';

                        return (
                          <tr key={r.id} className="border-b border-slate-50 align-top">
                            <td className="py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${typeColor}`}>
                                {r.type}
                              </span>
                            </td>
                            <td className="py-3 pr-4 max-w-sm">
                              <p className="font-semibold text-slate-800">{r.description}</p>
                              {r.resolution && (
                                <p className="text-[10px] text-slate-400 mt-1"><span className="font-bold text-slate-500">Action:</span> {r.resolution}</p>
                              )}
                            </td>
                            <td className="py-3 font-medium">
                              {r.severity && r.likelihood ? (
                                <div className="text-[10px] space-y-0.5">
                                  <div>Sev: <span className={`font-bold ${r.severity === 'High' ? 'text-rose-600' : 'text-slate-600'}`}>{r.severity}</span></div>
                                  <div>Like: <span className="text-slate-600 font-semibold">{r.likelihood}</span></div>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 text-slate-500 font-medium text-[11px]">{r.owner}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                r.status === 'Open' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Site Manager RAID log insertion form */}
              {(userRole === 'Site Engineer' || userRole === 'Super Admin') && (
                <form onSubmit={handleAddRaidEntry} className="border-t border-slate-150 pt-4 mt-6 space-y-4 text-xs">
                  <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <span className="font-bold text-slate-900 text-xs">Log Site Event (Risk / Issue / Dependency / Assumption)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">Log Type *</label>
                      <select
                        value={newRaidType}
                        onChange={(e) => setNewRaidType(e.target.value)}
                        className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900 font-medium"
                        required
                      >
                        <option value="Risk">Risk (Potential Threat)</option>
                        <option value="Issue">Issue (Active Blocker)</option>
                        <option value="Dependency">Dependency (External Gate)</option>
                        <option value="Assumption">Assumption (Planning Factor)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 block">Owner / Contact *</label>
                      <input
                        type="text"
                        placeholder="Name (e.g. Arjun Nair)"
                        value={newRaidOwner}
                        onChange={(e) => setNewRaidOwner(e.target.value)}
                        className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900 font-medium"
                        required
                      />
                    </div>

                    {(newRaidType === 'Risk' || newRaidType === 'Issue') && (
                      <>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-600 block">Severity</label>
                          <select
                            value={newRaidSeverity}
                            onChange={(e) => setNewRaidSeverity(e.target.value)}
                            className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900 font-medium"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-600 block">Likelihood</label>
                          <select
                            value={newRaidLikelihood}
                            onChange={(e) => setNewRaidLikelihood(e.target.value)}
                            className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900 font-medium"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 block">Description *</label>
                    <textarea
                      placeholder="Details of the risk, active site blocker, or external project dependency..."
                      value={newRaidDesc}
                      onChange={(e) => setNewRaidDesc(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900 h-16 resize-none font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 block">Mitigation Action / Resolution (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Synced contract approvals or deployed temporary pumps."
                      value={newRaidResolution}
                      onChange={(e) => setNewRaidResolution(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900 font-medium"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={addingRaid}
                      className="px-4 py-2 bg-slate-950 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:bg-slate-300"
                    >
                      {addingRaid ? 'Adding to RAID Log...' : 'Add Log Entry'}
                    </button>
                  </div>

                  {raidError && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1">{raidError}</p>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Tab 3: Linked Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Project Linked Files</h3>
                <button
                  onClick={() => {
                    // Navigate to document view
                    onBack(); // We will navigate using state
                  }}
                  className="flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 font-bold border border-teal-200 rounded px-2 py-1 transition-all"
                >
                  <Plus className="h-3 w-3" /> Manage Docs
                </button>
              </div>

              {documents.length === 0 ? (
                <p className="text-xs text-slate-400">No documents linked to this project.</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((d) => {
                    let docStatusColor = 'bg-slate-50 text-slate-700 border-slate-200';
                    if (d.status === 'Approved') docStatusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    if (d.status === 'Under Review') docStatusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                    if (d.status === 'Rejected') docStatusColor = 'bg-rose-50 text-rose-700 border-rose-100';

                    return (
                      <div 
                        key={d.id} 
                        className="flex items-start justify-between border border-slate-100 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 bg-slate-100 rounded flex items-center justify-center text-slate-600 shrink-0">
                            <FileText className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-900">{d.name}</h4>
                            <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                              <span>Type: {d.type}</span>
                              <span>Uploaded: {new Date(d.uploadDate || d.upload_date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              <span>Version: {d.version}</span>
                            </div>
                            {d.comments && (
                              <p className="text-[10px] text-slate-400 italic mt-1.5">Comment: "{d.comments}"</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDownload(d)}
                            className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all cursor-pointer"
                            title="Download Document Log"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${docStatusColor}`}>
                            {d.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
