import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Sparkles, 
  User, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  Link,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function RiskComplianceView() {
  const [risks, setRisks] = useState([]);
  const [topRisks, setTopRisks] = useState([]);
  const [loadingRisks, setLoadingRisks] = useState(true);
  const [loadingAI, setLoadingAI] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    fetchRisks();
    fetchTopRisks();
  }, []);

  async function fetchRisks() {
    try {
      const response = await fetch('/api/risks');
      const data = await response.json();
      setRisks(data);
    } catch (error) {
      console.error('Error fetching risks register:', error);
    } finally {
      setLoadingRisks(false);
    }
  }

  async function fetchTopRisks() {
    try {
      const apiKey = localStorage.getItem('helios_api_key') || null;
      const response = await fetch('/api/ai/top-risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      const data = await response.json();
      setTopRisks(data);
    } catch (error) {
      console.error('Error fetching top risks:', error);
    } finally {
      setLoadingAI(false);
    }
  }

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'High': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Low': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Risk': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Dependency': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Issue': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Assumption': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Filter logic
  const filteredRisks = risks.filter(r => {
    const matchesSearch = r.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || r.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || r.severity === severityFilter;

    return matchesSearch && matchesType && matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Risk & Compliance Dashboard</h1>
        <p className="text-xs text-slate-500">
          Portfolio-wide RAID register tracking active risks, scheduling issues, grid dependencies, and environmental assumptions.
        </p>
      </div>

      {/* AI Intelligence Top 3 Section */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="flex items-center gap-2 mb-4">
          <div className="bg-teal-500/20 text-teal-400 p-1.5 rounded-lg border border-teal-500/30">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white uppercase">AI Risk Intelligence</h2>
            <p className="text-[10px] text-slate-400">Weekly critical focus areas identified by Claude 3.5 Sonnet analyzing active registers.</p>
          </div>
        </div>

        {loadingAI ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <span className="text-xs font-semibold">Running risk prioritization vectors...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRisks.map((tr, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all duration-300 relative group"
              >
                {/* Severity Badge */}
                <div className="absolute top-4 right-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded text-[8.5px] font-bold">
                  {tr.severity} Severity
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold text-teal-400 tracking-wider block">
                    {tr.projectName}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-teal-400 transition-colors">
                      {tr.title}
                    </h4>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {tr.description}
                  </p>
                </div>

                {/* Owner and action item */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-[10px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User className="h-3.5 w-3.5" />
                    <span>Owner: <strong className="text-slate-200">{tr.owner}</strong></span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-850 rounded p-2 text-slate-300 leading-relaxed">
                    <strong className="text-teal-400 block font-bold text-[8.5px] uppercase tracking-wider mb-0.5">Recommended Action:</strong>
                    {tr.actionItem}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Register Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Portfolio Risk Register</h3>
        
        {/* Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Search by risk description, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-900 bg-slate-50 focus:bg-white transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none text-xs"
          >
            <option value="All">All Types</option>
            <option value="Risk">Risks</option>
            <option value="Issue">Issues</option>
            <option value="Dependency">Dependencies</option>
            <option value="Assumption">Assumptions</option>
          </select>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none text-xs"
          >
            <option value="All">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Mitigated">Mitigated</option>
            <option value="Closed">Closed</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Table list */}
        {loadingRisks ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-950" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5">Project</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5">Description & Action Plan</th>
                  <th className="py-2.5">Severity</th>
                  <th className="py-2.5">Owner</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors align-top">
                    <td className="py-3 pr-2 font-semibold text-slate-900 w-36">
                      {r.project_name.split(' Solar')[0]}
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border ${getTypeBadgeClass(r.type)}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 max-w-md">
                      <p className="font-semibold text-slate-800 leading-normal">{r.description}</p>
                      {r.resolution && (
                        <div className="bg-slate-50 border border-slate-100 rounded p-2 text-[10.5px] text-slate-500 mt-1.5 leading-normal">
                          <strong className="text-slate-600 block">Mitigation / Status Notes:</strong>
                          {r.resolution}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      {r.severity ? (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getSeverityBadgeClass(r.severity)}`}>
                          {r.severity}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">-</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500 font-medium text-[11px] w-24">
                      {r.owner.split(' ')[0]} {r.owner.split(' ')[1] || ''}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        r.status === 'Open' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-100 font-bold' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredRisks.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                      No risks matched your selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
