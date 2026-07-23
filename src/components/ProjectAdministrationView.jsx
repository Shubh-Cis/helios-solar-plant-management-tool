import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Calendar, ShieldCheck, MapPin, DollarSign, Layers, PlusCircle, AlertCircle, Search } from 'lucide-react';

export default function ProjectAdministrationView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacityMw, setCapacityMw] = useState('');
  const [budget, setBudget] = useState('');
  const [actualSpend, setActualSpend] = useState('');
  const [percentComplete, setPercentComplete] = useState('0');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [status, setStatus] = useState('On Track');
  const [contractor, setContractor] = useState('');
  const [description, setDescription] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Global EPC Weight Settings
  const [pvWeight, setPvWeight] = useState(50);
  const [civilWeight, setCivilWeight] = useState(25);
  const [elecWeight, setElecWeight] = useState(15);
  const [pmoWeight, setPmoWeight] = useState(10);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('helios_epc_weights');
    if (stored) {
      const w = JSON.parse(stored);
      setPvWeight(Math.round(w.pv * 100));
      setCivilWeight(Math.round(w.civil * 100));
      setElecWeight(Math.round(w.electrical * 100));
      setPmoWeight(Math.round(w.pmo * 100));
    }
  }, []);

  const handleSaveWeights = (e) => {
    e.preventDefault();
    const total = parseFloat(pvWeight) + parseFloat(civilWeight) + parseFloat(elecWeight) + parseFloat(pmoWeight);
    if (total !== 100) {
      alert(`Error: The sum of weights must equal 100%. Currently it is ${total}%.`);
      return;
    }
    const weightsObj = {
      pv: pvWeight / 100,
      civil: civilWeight / 100,
      electrical: elecWeight / 100,
      pmo: pmoWeight / 100
    };
    localStorage.setItem('helios_epc_weights', JSON.stringify(weightsObj));
    setSettingsSuccess('Global EPC weights updated successfully!');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatINR = (val) => {
    const croreVal = parseFloat(val) / 10000000;
    return `₹${croreVal.toFixed(2)} Cr`;
  };

  const handleResetForm = () => {
    setName('');
    setLocation('');
    setCapacityMw('');
    setBudget('');
    setActualSpend('');
    setPercentComplete('0');
    setStartDate('2026-01-01');
    setEndDate('2026-12-31');
    setStatus('On Track');
    setContractor('');
    setDescription('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEditClick = (p) => {
    setIsEditing(true);
    setEditingId(p.id);
    setName(p.name);
    setLocation(p.location);
    setCapacityMw(p.capacityMw.toString());
    setBudget(p.budget.toString());
    setActualSpend(p.actualSpend.toString());
    setPercentComplete(p.percentComplete.toString());
    setStartDate(p.startDate.split('T')[0]);
    setEndDate(p.endDate.split('T')[0]);
    setStatus(p.status);
    setContractor(p.contractor);
    setDescription(p.description || '');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !location.trim() || !capacityMw || !budget || !actualSpend || !contractor) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      location,
      capacityMw: parseInt(capacityMw),
      budget: parseFloat(budget),
      actualSpend: parseFloat(actualSpend),
      percentComplete: parseInt(percentComplete),
      startDate,
      endDate,
      status,
      contractor,
      description
    };

    try {
      let response;
      if (isEditing) {
        response = await fetch(`/api/projects/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error('Project save failed');
      }

      const savedProject = await response.json();
      setSuccessMsg(isEditing ? `Project "${name}" successfully updated.` : `Project "${name}" successfully added to registry.`);
      handleResetForm();
      fetchProjects();
    } catch (err) {
      console.error('Save project error:', err);
      setErrorMsg('Failed to save project. Ensure inputs are in correct numeric format.');
    }
  };

  const handleDeleteClick = async (id, projectName) => {
    if (!window.confirm(`Are you absolutely sure you want to delete project "${projectName}"? This will delete all its milestones, S-curves, risks, and document reviews from the database.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Deletion failed');
      }

      setSuccessMsg(`Project "${projectName}" successfully deleted.`);
      fetchProjects();
    } catch (err) {
      console.error('Delete project error:', err);
      setErrorMsg('Failed to delete project.');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contractor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const activePage = Math.min(page, totalPages - 1);
  const paginatedProjects = filteredProjects.slice(activePage * pageSize, (activePage + 1) * pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Solar Projects Administration</h1>
        <p className="text-xs text-slate-500">
          Provision, modify, and audit solar project development entities. Changes dynamically rebuild executive progress metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Form Panel */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Plus className="h-4.5 w-4.5 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {isEditing ? 'Modify Project Parameters' : 'Add New Solar Project'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Project Name *</label>
              <input
                type="text"
                placeholder="e.g. Khavda Renewable Park Phase 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Location (State, India) *</label>
              <input
                type="text"
                placeholder="e.g. Kutch, Gujarat, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Capacity (MW) *</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={capacityMw}
                  onChange={(e) => setCapacityMw(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Execution Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                  required
                >
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Baseline Budget (INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 420000000 (42 Crore)"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                  required
                />
                <span className="text-[9px] text-slate-400 mt-1 block">INR Value (1 Crore = 10,000,000)</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Actual Spend (INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 410000000"
                  value={actualSpend}
                  onChange={(e) => setActualSpend(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Completion % *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={percentComplete}
                  onChange={(e) => setPercentComplete(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">EPC Contractor *</label>
                <input
                  type="text"
                  placeholder="e.g. Tata Power Solar"
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Target End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Project Description</label>
              <textarea
                placeholder="PV specification, WBS notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900 h-16 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-slate-950 hover:bg-teal-700 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer"
              >
                {isEditing ? 'Update Project' : 'Provision Project'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {successMsg && (
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded text-[10px] font-medium flex items-start gap-1">
                <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-2 bg-rose-50 text-rose-800 rounded text-[10px] font-medium flex items-start gap-1">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* Global EPC Category Weights Settings Card */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm space-y-4 lg:col-span-1 mt-6">
          <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <Layers className="h-4.5 w-4.5 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Global EPC Budget Allocation</h3>
          </div>

          <form onSubmit={handleSaveWeights} className="space-y-3 text-xs">
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Configure how the total project budget is split across cost centers. Sum must equal exactly 100%.
            </p>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">PV Modules & Array (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={pvWeight}
                onChange={(e) => setPvWeight(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-950 font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Civil & Piling (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={civilWeight}
                onChange={(e) => setCivilWeight(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-950 font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Electrical Grid Sync (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={elecWeight}
                onChange={(e) => setElecWeight(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-950 font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">PMO & Licensing (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={pmoWeight}
                onChange={(e) => setPmoWeight(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-950 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-teal-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              Update Global Weights
            </button>

            {settingsSuccess && (
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded text-[10px] font-semibold text-center uppercase tracking-wide">
                {settingsSuccess}
              </div>
            )}
          </form>
        </div>

        {/* Directory List */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden lg:col-span-2 flex flex-col h-[600px] justify-between">
          <div>
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Solar Projects Registry ({filteredProjects.length})</h3>
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, state..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-1 text-[11px] focus:outline-none focus:border-slate-900 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
              {paginatedProjects.map((p) => {
                let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (p.status === 'At Risk') statusBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                if (p.status === 'Critical') statusBadge = 'bg-rose-50 text-rose-700 border-rose-100';

                return (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-xs">
                    <div className="space-y-1 pr-4 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{p.name}</h4>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9.5px] font-bold border ${statusBadge}`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-[10px] font-medium">
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {p.location}</span>
                        <span className="flex items-center gap-0.5"><Layers className="h-3 w-3" /> {p.capacityMw} MW</span>
                        <span className="flex items-center gap-0.5"><DollarSign className="h-3 w-3" /> Budget: {formatINR(p.budget)}</span>
                        <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> Target: {p.endDate.split('T')[0]}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditClick(p)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white rounded transition-colors text-slate-700 cursor-pointer"
                        title="Edit Parameters"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(p.id, p.name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded transition-colors text-rose-700 cursor-pointer border border-rose-100 hover:border-transparent"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {paginatedProjects.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-medium text-xs">
                  No projects match your search criteria.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50 text-[11px] font-medium text-slate-500 select-none shrink-0">
            <span>
              Showing {filteredProjects.length > 0 ? activePage * pageSize + 1 : 0} to {Math.min(filteredProjects.length, (activePage + 1) * pageSize)} of {filteredProjects.length} entries
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={activePage === 0}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded text-slate-700 transition-all font-semibold cursor-pointer"
                >
                  Prev
                </button>
                <span className="px-1 text-slate-600">Page {activePage + 1} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={activePage === totalPages - 1}
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
