import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Sun, LayoutDashboard, ShieldAlert, FileText, Sparkles, Database, Users, HelpCircle, Compass } from 'lucide-react';

export default function UserGuideModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const guideSteps = [
    {
      title: 'Welcome to Helios Renewables',
      icon: <Sun className="h-8 w-8 text-teal-500 animate-spin-slow" />,
      description: 'Helios Renewables is an AI-powered command center designed for Indian solar plant construction operations. It replaces scattered spreadsheets and static PDFs with a consolidated Single Source of Truth.',
      details: [
        'Centralized oversight over a 50-project (26.50 GW) portfolio.',
        'Combines operational progress, legal contracts, and RAID registers.',
        'Helps PMO directors make data-backed decisions proactively.'
      ]
    },
    {
      title: 'Executive Portfolio Dashboard',
      icon: <LayoutDashboard className="h-8 w-8 text-indigo-500" />,
      description: 'The landing page provides directors with immediate operational and financial health metrics across the entire portfolio.',
      details: [
        'KPI Cards: Live totals for budget, spend, cost variance, and open risks.',
        'Schedule S-Curve: Monthly planned progress vs cumulative actual progress.',
        'Interactive Risk Heatmap: Click any grid cell to view specific project risks, owners, and resolution plans.'
      ]
    },
    {
      title: 'RAID Log & AI Risk Prioritizer',
      icon: <ShieldAlert className="h-8 w-8 text-rose-500" />,
      description: 'The Risk & Compliance module houses the portfolio-wide register. To avoid parsing through hundreds of row items, we built AI prioritization.',
      details: [
        'Consolidated RAID (Risks, Assumptions, Issues, Dependencies) registry.',
        'AI Risk Prioritizer card: Claude evaluates open risks and highlights the top 3 items requiring immediate focus.',
        'Provides recommended executive actions to solve bottlenecks (e.g. soil piling changes).'
      ]
    },
    {
      title: 'Document Center & OCR Search',
      icon: <FileText className="h-8 w-8 text-teal-600" />,
      description: 'A digitized legal and compliance archive. Speeds up audits and reviews.',
      details: [
        'OCR Search Engine: Search terms inside document files. The engine scans uploaded files, extracting and indexing text content.',
        'PMO Sign-off: Approve/Reject workflows directly update status and comments.',
        'Version control: Automatically increments minor document versions upon audit.'
      ]
    },
    {
      title: 'AI chatbot PMO Assistant',
      icon: <Sparkles className="h-8 w-8 text-amber-500" />,
      description: 'A floating assistant located in the bottom-right corner, always accessible.',
      details: [
        'System prompt injects the entire active database into Claude 3.5 Sonnet.',
        'PMOs can ask complex questions (e.g., "Which contractor is managing Sudair?", "List delayed milestones").',
        'Includes pre-populated question chips for quick testing during client pitches.'
      ]
    },
    {
      title: 'Role-Based Access Control (RBAC)',
      icon: <Users className="h-8 w-8 text-sky-500" />,
      description: 'The system regulates dashboard features dynamically depending on who is logged in. Use the switcher in the header to demo roles.',
      details: [
        'Super Admin: Full platform access, including user provisioning dashboard.',
        'PMO Director: Full portfolio and financial overview, can run approvals, but cannot edit users.',
        'Site Engineer: Restricted to viewing only their assigned project. Financial charts and document approval sliders are hidden.'
      ]
    },
    {
      title: 'Enterprise ERP & CRM Sync',
      icon: <Database className="h-8 w-8 text-emerald-500" />,
      description: 'Integrates corporate data systems to eliminate manual copy-pasting of expenditures and permits.',
      details: [
        'SAP S/4HANA (ERP): Synced invoices automatically increase a project\'s actual spend in the PostgreSQL database, and generate verified OCR-scannable invoice documents in the Document Center.',
        'Salesforce CRM (CRM): Synced permits resolve open RAID dependencies (such as Power Ministry land or PGCIL grid connection clearances) directly in the database in real-time.',
        'Sync Audit Ledger: Displays a chronological list of middleware transactions, including system, status, activity, and elapsed time.'
      ]
    },
    {
      title: 'System Navigation Guide',
      icon: <Compass className="h-8 w-8 text-violet-500" />,
      description: 'Helios features several dedicated sidebar portals designed to streamline project management for users:',
      details: [
        'Executive Dashboard: Comprehensive portfolio financials, aggregate S-Curves, and interactive Risk Heatmaps.',
        'Master Gantt Schedule: Professional EPC Gantt chart with Critical Path, Baseline Variance, and WBS level 3 tracking.',
        'Project Details: View interactive Gantt charts, WBS checklists, and OCR-extracted document comments.',
        'ERP & CRM Hub: Manually trigger corporate integrations and monitor transaction sync ledgers.',
        'User Administration (Admin): Provisions new user credentials, emails, roles, and project-scopes.',
        'Project Administration (Admin): Registers new solar projects, sets budgets, and auto-generates construction milestones.',
        'Risk Register: Portfolio-wide RAID log with AI-powered priority risk cards.'
      ]
    }
  ];

  if (!isOpen) return null;

  const step = guideSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[490px]">
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Helios Walkthrough Manual</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {step.icon}
              <h2 className="text-base font-bold text-slate-900">{step.title}</h2>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {step.description}
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
              <strong className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Key Operational Details:</strong>
              <ul className="space-y-1.5">
                {step.details.map((d, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5 leading-normal">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5"></span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 shrink-0">
            <div className="flex gap-1">
              {guideSteps.map((_, i) => (
                <span 
                  key={i} 
                  className={`h-1.5 w-1.5 rounded-full transition-all ${i === currentStep ? 'w-4 bg-teal-600' : 'bg-slate-200'}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg text-slate-600 disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              
              {currentStep < guideSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Next <ArrowRight className="h-3 w-3 text-teal-400" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
