import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, TrendingDown, Search, ArrowRightLeft, FileCheck } from 'lucide-react';

export default function FinancialAuditView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        setProjects(data.projects);
      } catch (err) {
        console.error('Failed to fetch projects for finance ledger:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const formatCurrency = (val) => {
    const croreVal = parseFloat(val) / 10000000;
    return `₹${croreVal.toFixed(2)} Cr`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // Calculate portfolio totals
  const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget), 0);
  const totalSpend = projects.reduce((sum, p) => sum + parseFloat(p.actualSpend), 0);
  const totalCapacity = projects.reduce((sum, p) => sum + p.capacityMw, 0);
  const netVariance = totalBudget - totalSpend;

  // Capacity cost efficiency index (Total Budget / MW capacity)
  // e.g. how much Cr or SAR does it cost to build 1 MW of solar
  const avgCostPerMw = totalCapacity > 0 ? totalBudget / totalCapacity : 0;

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Financial & Expense Audit Ledger</h1>
        <p className="text-xs text-slate-500">
          Portfolio-wide financial oversight. Review contractor disbursements, baseline budgets, and variances.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Baseline Budget Allocation</span>
          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(totalBudget)}</p>
          <span className="text-[10px] text-slate-400 block font-medium">Total approved program capital</span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Actual Spend to Date</span>
          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(totalSpend)}</p>
          <span className="text-[10px] text-slate-400 block font-medium">Synced from SAP ERP invoices</span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Portfolio Cost Variance</span>
          <p className={`text-xl font-extrabold ${netVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netVariance >= 0 ? '+' : ''}{formatCurrency(netVariance)}
          </p>
          <span className="text-[10px] text-slate-400 block font-medium">
            {netVariance >= 0 ? '🟢 Under Budget' : '🔴 Budget Overrun'}
          </span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Avg Cost per MW</span>
          <p className="text-xl font-extrabold text-teal-600">{formatCurrency(avgCostPerMw)}</p>
          <span className="text-[10px] text-slate-400 block font-medium">EPC construction cost efficiency metric</span>
        </div>
      </div>

      {/* Ledger Table Card */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Table Search Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Installation Expense Directory</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search project, state, contractor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-slate-900 font-medium"
            />
          </div>
        </div>

        {/* Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3 pl-4">Project Name</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Baseline Budget</th>
                <th className="p-3">Actual Spend</th>
                <th className="p-3">Variance</th>
                <th className="p-3">Contractor</th>
                <th className="p-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProjects.map((p) => {
                const budgetNum = parseFloat(p.budget);
                const spendNum = parseFloat(p.actualSpend);
                const diff = budgetNum - spendNum;

                let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (p.status === 'At Risk') statusBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                if (p.status === 'Critical') statusBadge = 'bg-rose-50 text-rose-700 border-rose-100';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/45 transition-colors font-medium">
                    <td className="p-3 pl-4 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 text-slate-600">{p.capacityMw} MW</td>
                    <td className="p-3 text-slate-800">{formatCurrency(p.budget)}</td>
                    <td className="p-3 text-slate-800">{formatCurrency(p.actualSpend)}</td>
                    <td className={`p-3 font-semibold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                    </td>
                    <td className="p-3 text-slate-500">{p.contractor}</td>
                    <td className="p-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${statusBadge}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
