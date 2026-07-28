import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import GanttChartView from './GanttChartView';

export default function PortfolioGanttView({ projects = [], onSelectProject, userRole }) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || null);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync selected project ID if projects list updates
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Fetch full project details for the selected project
  useEffect(() => {
    if (!selectedProjectId) return;
    async function loadProjectDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${selectedProjectId}`);
        const data = await res.json();
        setProjectData(data);
      } catch (err) {
        console.error('Failed to load project details for Gantt view:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjectDetails();
  }, [selectedProjectId]);

  const activeProject = projects.find(p => p.id === parseInt(selectedProjectId)) || projectData?.project;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              <span>Master Portfolio Engineering Schedule</span>
            </span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-50">
            Interactive EPC Solar Plant Gantt Schedule
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Multi-phase WBS project timeline with Critical Path Analysis, Baseline Variance Tracking, Task Dependencies, and real-time completion progress across the renewable energy portfolio.
          </p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3 shrink-0 min-w-[280px]">
          <Building2 className="h-5 w-5 text-teal-400 shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Active Plant Schedule
            </label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
              className="w-full bg-transparent text-xs font-extrabold text-slate-100 focus:outline-none cursor-pointer mt-0.5"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                  {p.name} ({p.capacityMw}MW - {p.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Gantt View Canvas */}
      {loading ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading WBS Work Packages & Gantt Schedule...</p>
        </div>
      ) : (
        <GanttChartView 
          project={projectData?.project || activeProject}
          milestones={projectData?.milestones || []}
          userRole={userRole}
          onUpdateMilestone={async (milestoneId, newStatus, newProgress) => {
            try {
              await fetch(`/api/projects/milestones/${milestoneId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, progress: newProgress })
              });
              // Reload
              const res = await fetch(`/api/projects/${selectedProjectId}`);
              const data = await res.json();
              setProjectData(data);
            } catch (err) {
              console.error('Failed to update milestone:', err);
            }
          }}
          onRefresh={async () => {
            if (selectedProjectId) {
              const res = await fetch(`/api/projects/${selectedProjectId}`);
              const data = await res.json();
              setProjectData(data);
            }
          }}
        />
      )}
    </div>
  );
}
