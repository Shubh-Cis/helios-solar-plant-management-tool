import React from 'react';
import { HelpCircle, Shield, FileText, Sparkles, Database, Sun, ArrowRight, UserCheck, CheckCircle } from 'lucide-react';

export default function QuickStartView({ onViewChange }) {
  const steps = [
    {
      icon: <Sun className="h-6 w-6 text-amber-500" />,
      title: "1. Monitor Solar Portfolio",
      desc: "Go to the Executive Portfolio screen. Here, you get a bird's-eye view of all 50 solar plants, their capacities, and completion rates.",
      actionLabel: "View Dashboard",
      targetView: "dashboard"
    },
    {
      icon: <Shield className="h-6 w-6 text-rose-500" />,
      title: "2. Log & Remediate Risks",
      desc: "Check the Risk Heatmap. Field engineers log site events here (clayey soil delay, custom issues), updating the executive team instantly.",
      actionLabel: "View Risk Register",
      targetView: "risks"
    },
    {
      icon: <FileText className="h-6 w-6 text-indigo-500" />,
      title: "3. Upload Contracts (OCR)",
      desc: "Upload contract PDF documents in the Document Manager. Helios automatically scans and extracts the text, making it searchable by AI.",
      actionLabel: "View Documents",
      targetView: "documents"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-teal-500" />,
      title: "4. Generate Board Reports",
      desc: "Use the AI Executive Reports panel to compile live budgets, schedule S-Curves, and critical risks into a board-ready executive report.",
      actionLabel: "Generate Report",
      targetView: "reports"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-teal-950 border border-slate-800 p-6 rounded-2xl text-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="space-y-2.5 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Onboarding Manual
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Helios Renewables Command Center</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Welcome! Helios is a program management platform connecting engineering site logs, document approvals, and ERP financial budgets into a single view. Follow the steps below to learn the workflows.
          </p>
        </div>
        <div className="shrink-0 z-10 bg-teal-500/10 p-3.5 rounded-xl border border-teal-500/20 text-teal-400">
          <HelpCircle className="h-10 w-10 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Walkthrough Steps */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Guided Walkthrough Steps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                    {step.icon}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                <button
                  onClick={() => onViewChange(step.targetView)}
                  className="mt-4 flex items-center gap-1 text-[10px] text-teal-600 hover:text-teal-700 font-bold tracking-wide uppercase transition-all cursor-pointer group"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Demo System Roles */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Security Roles Overview</h3>
          <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-4">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Helios uses **Role-Based Access Control (RBAC)**. Test different user roles to see restricted dashboard permissions:
            </p>
            
            <div className="space-y-3">
              <div className="flex gap-3 text-xs border-b border-slate-50 pb-3">
                <UserCheck className="h-5 w-5 text-rose-500 shrink-0" />
                <div>
                  <h5 className="font-bold text-slate-900">Super Admin (Aditya)</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Full access: Provision projects, register user logins, edit configurations.</p>
                </div>
              </div>

              <div className="flex gap-3 text-xs border-b border-slate-50 pb-3">
                <UserCheck className="h-5 w-5 text-indigo-500 shrink-0" />
                <div>
                  <h5 className="font-bold text-slate-900">PMO Director (Rajesh)</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Management access: Audit S-curves, generate AI executive board reports, approve permits.</p>
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <UserCheck className="h-5 w-5 text-teal-500 shrink-0" />
                <div>
                  <h5 className="font-bold text-slate-900">Site Engineer (Arjun)</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Restricted access: Can only view and log events/milestones on their assigned solar park.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2 text-[10px] font-semibold text-slate-600">
              <CheckCircle className="h-4.5 w-4.5 text-teal-600 shrink-0 mt-0.5" />
              <span>Multi-Currency SAR switch is available in the top bar to format budgets in Riyals.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
