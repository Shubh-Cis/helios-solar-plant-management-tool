import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  FileText, 
  Layers, 
  Sparkles, 
  Sun, 
  Briefcase, 
  Menu, 
  X, 
  Activity,
  Award,
  ChevronDown,
  Globe,
  Database,
  Users,
  HelpCircle,
  UserCheck,
  Landmark
} from 'lucide-react';
import DashboardView from './components/DashboardView';
import ProjectDetailView from './components/ProjectDetailView';
import DocumentManagementView from './components/DocumentManagementView';
import RiskComplianceView from './components/RiskComplianceView';
import ExecutiveReportView from './components/ExecutiveReportView';
import UserManagementView from './components/UserManagementView';
import ErpCrmIntegrationView from './components/ErpCrmIntegrationView';
import ProjectAdministrationView from './components/ProjectAdministrationView';
import UserGuideModal from './components/UserGuideModal';
import AIChatbot from './components/AIChatbot';
import QuickStartView from './components/QuickStartView';
import FinancialAuditView from './components/FinancialAuditView';
import LoginView from './components/LoginView';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('helios_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'project-detail', 'risks', 'documents', 'reports', 'users', 'erp-crm'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProjectsSubmenu, setShowProjectsSubmenu] = useState(true);

  // Role-Based Access Control (RBAC) State
  const [userRole, setUserRole] = useState('Guest');
  const [assignedProjectId, setAssignedProjectId] = useState(null); // Set to project ID if restricted
  const [assignedProjectIds, setAssignedProjectIds] = useState([]);

  // Onboarding Walkthrough Guide State
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
      setAssignedProjectId(currentUser.projectId);

      // Parse multi-project IDs
      let ids = [];
      if (currentUser.assignedProjectIds) {
        ids = currentUser.assignedProjectIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      } else if (currentUser.projectId) {
        ids = [parseInt(currentUser.projectId)];
      }
      setAssignedProjectIds(ids);

      localStorage.setItem('helios_current_user', JSON.stringify(currentUser));
    } else {
      setUserRole('Guest');
      setAssignedProjectId(null);
      setAssignedProjectIds([]);
      localStorage.removeItem('helios_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    async function loadProjects() {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        // Filter projects list if user is a restricted Site Engineer
        if (currentUser.role === 'Site Engineer') {
          let ids = [];
          if (currentUser.assignedProjectIds) {
            ids = currentUser.assignedProjectIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          } else if (currentUser.projectId) {
            ids = [parseInt(currentUser.projectId)];
          }
          const filtered = data.projects.filter(p => ids.includes(p.id));
          setProjectsList(filtered);
          setAssignedProjectId(ids[0] || null);
        } else {
          setProjectsList(data.projects);
          setAssignedProjectId(null);
        }
      } catch (error) {
        console.error('Failed to load projects list:', error);
      }
    }
    loadProjects();
  }, [currentView, currentUser]);

  // Reset view to dashboard if current user does not have permission
  useEffect(() => {
    if (userRole === 'Site Engineer') {
      if (currentView === 'users' || currentView === 'erp-crm' || currentView === 'projects-admin') {
        setCurrentView('dashboard');
      }
    }
  }, [userRole, currentView]);

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
    setMobileMenuOpen(false);
  };

  const handleNavigateToView = (view) => {
    setCurrentView(view);
    setSelectedProjectId(null);
    setMobileMenuOpen(false);
  };

  // Nav Item helper
  const renderNavItem = (view, icon, label, requiredRoles = []) => {
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return null;
    }
    const isActive = currentView === view;
    return (
      <button
        onClick={() => handleNavigateToView(view)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
          isActive 
            ? 'bg-teal-600 text-white shadow-md shadow-teal-700/10' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
        }`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 text-slate-100 shrink-0 border-r border-slate-900">
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-teal-500 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
              <Sun className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-widest text-slate-50">HELIOS</h1>
              <p className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Renewables Platform</p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
          <div className="space-y-1">
            <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">📁 Portfolio Command</span>
            {renderNavItem('quickstart', <HelpCircle className="h-4.5 w-4.5 text-teal-400" />, 'Quick Start Guide')}
            {renderNavItem('dashboard', <LayoutDashboard className="h-4.5 w-4.5" />, 'Executive Portfolio')}
          </div>

          <div className="space-y-1 pt-2">
            <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">⚖️ Governance & Control</span>
            {renderNavItem('risks', <ShieldAlert className="h-4.5 w-4.5" />, 'Risk & Compliance')}
            {renderNavItem('documents', <FileText className="h-4.5 w-4.5" />, 'Document Manager')}
            {renderNavItem('reports', <Sparkles className="h-4.5 w-4.5 text-teal-400" />, 'AI Executive Reports')}
            {renderNavItem('financial-audit', <Landmark className="h-4.5 w-4.5" />, 'Financial Audit Ledger')}
          </div>

          {(userRole === 'Super Admin' || userRole === 'PMO Director') && (
            <div className="space-y-1 pt-2">
              <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">🔗 System Integration</span>
              {renderNavItem('erp-crm', <Database className="h-4.5 w-4.5" />, 'ERP & CRM Sync')}
            </div>
          )}

          {(userRole === 'Super Admin' || userRole === 'PMO Director') && (
            <div className="space-y-1 pt-2">
              <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">🛡️ Security & Config</span>
              {renderNavItem('users', <Users className="h-4.5 w-4.5" />, 'User Administration')}
              {renderNavItem('projects-admin', <Briefcase className="h-4.5 w-4.5" />, 'Project Administration')}
            </div>
          )}

          {/* Drilldown Submenu */}
          <div className="pt-4 border-t border-slate-900/40 mt-4 space-y-1">
            <button 
              onClick={() => setShowProjectsSubmenu(!showProjectsSubmenu)}
              className="w-full flex items-center justify-between px-4 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest hover:text-slate-300"
            >
              <span>Solar Projects</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showProjectsSubmenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showProjectsSubmenu && (
              <div className="space-y-1 pl-2">
                {projectsList.map((p) => {
                  const isProjectSelected = currentView === 'project-detail' && selectedProjectId === p.id;
                  
                  let statusIndicator = 'bg-emerald-500';
                  if (p.status === 'At Risk') statusIndicator = 'bg-amber-500';
                  if (p.status === 'Critical') statusIndicator = 'bg-rose-500';

                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProject(p.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                        isProjectSelected 
                          ? 'bg-slate-800 text-teal-400 font-bold' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
                      }`}
                    >
                      <span className="truncate pr-2">{p.name.split(' Solar')[0]}</span>
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusIndicator}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* User Guide Button in Sidebar */}
        <div className="px-4 py-2 border-t border-slate-900/45">
          <button
            onClick={() => setGuideOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-teal-700/80 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            <HelpCircle className="h-4 w-4 text-teal-400" />
            <span>Interactive Manual</span>
          </button>
        </div>

        {/* Footer Brand Info */}
        <div className="p-4 border-t border-slate-900/60 bg-slate-950/40 text-[10px] text-slate-500 space-y-1 font-medium">
          <div className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-teal-500" /> <span>EPC Developer Portal</span></div>
          <div className="flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-slate-500" /> <span>Republic of India</span></div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Helios Renewables Live Portfolio</span>
            </div>
          </div>

          {/* Quick Header Widget: Account details & Logout */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            {/* Display active restriction alert for Site Engineer */}
            {userRole === 'Site Engineer' && (
              <span className="hidden lg:inline-flex bg-rose-50 text-rose-700 px-2 py-1 rounded text-[10px] border border-rose-100 font-bold">
                Project Restricted View
              </span>
            )}
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 text-xs font-semibold">
                <div className={`h-2.5 w-2.5 rounded-full ${
                  userRole === 'Super Admin' 
                    ? 'bg-rose-500 animate-pulse' 
                    : userRole === 'PMO Director' 
                      ? 'bg-indigo-500' 
                      : 'bg-teal-500'
                }`}></div>
                <span className="hidden sm:inline font-bold">{currentUser?.name || 'User'}</span>
                <span className="text-slate-400 font-medium text-[10px] uppercase">({userRole})</span>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setCurrentUser(null);
                  setCurrentView('dashboard');
                }}
                className="px-3 py-1.5 bg-slate-950 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer select-none"
              >
                Logout
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
              <Activity className="h-3.5 w-3.5 text-teal-600" />
              <span>PGCIL Grid Connect Status: <strong className="text-emerald-600">98.2% Sync</strong></span>
            </div>
          </div>
        </header>

        {/* Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {currentView === 'quickstart' && (
              <QuickStartView onViewChange={handleNavigateToView} />
            )}

            {currentView === 'dashboard' && (
              <DashboardView 
                onSelectProject={handleSelectProject} 
                onViewChange={handleNavigateToView}
                userRole={userRole}
                assignedProjectId={assignedProjectId}
                assignedProjectIds={assignedProjectIds}
              />
            )}
            
            {currentView === 'project-detail' && (
              <ProjectDetailView 
                projectId={selectedProjectId} 
                onBack={() => handleNavigateToView('dashboard')}
                userRole={userRole}
              />
            )}

            {currentView === 'risks' && <RiskComplianceView userRole={userRole} />}
            
            {currentView === 'documents' && <DocumentManagementView userRole={userRole} />}
            
            {currentView === 'reports' && <ExecutiveReportView userRole={userRole} />}

            {currentView === 'financial-audit' && <FinancialAuditView />}

            {currentView === 'users' && <UserManagementView />}

            {currentView === 'erp-crm' && <ErpCrmIntegrationView />}

            {currentView === 'projects-admin' && <ProjectAdministrationView />}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <div className="relative w-64 bg-slate-950 text-slate-100 flex flex-col z-50 animate-slide-right">
            <div className="p-5 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-teal-500 animate-spin-slow" />
                <h1 className="font-extrabold text-sm tracking-wider">HELIOS</h1>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
              <div className="space-y-1">
                <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">📁 Portfolio Command</span>
                {renderNavItem('quickstart', <HelpCircle className="h-4.5 w-4.5 text-teal-400" />, 'Quick Start Guide')}
                {renderNavItem('dashboard', <LayoutDashboard className="h-4.5 w-4.5" />, 'Executive Portfolio')}
              </div>

              <div className="space-y-1 pt-2">
                <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">⚖️ Governance & Control</span>
                {renderNavItem('risks', <ShieldAlert className="h-4.5 w-4.5" />, 'Risk & Compliance')}
                {renderNavItem('documents', <FileText className="h-4.5 w-4.5" />, 'Document Manager')}
                {renderNavItem('reports', <Sparkles className="h-4.5 w-4.5 text-teal-400" />, 'AI Executive Reports')}
                {renderNavItem('financial-audit', <Landmark className="h-4.5 w-4.5" />, 'Financial Audit Ledger')}
              </div>

              {(userRole === 'Super Admin' || userRole === 'PMO Director') && (
                <div className="space-y-1 pt-2">
                  <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">🔗 System Integration</span>
                  {renderNavItem('erp-crm', <Database className="h-4.5 w-4.5" />, 'ERP & CRM Sync')}
                </div>
              )}

              {(userRole === 'Super Admin' || userRole === 'PMO Director') && (
                <div className="space-y-1 pt-2">
                  <span className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">🛡️ Security & Config</span>
                  {renderNavItem('users', <Users className="h-4.5 w-4.5" />, 'User Administration')}
                  {renderNavItem('projects-admin', <Briefcase className="h-4.5 w-4.5" />, 'Project Administration')}
                </div>
              )}
              
              {/* Project list mobile */}
              <div className="pt-4 border-t border-slate-900 mt-4 space-y-1 text-slate-400 text-[11px]">
                <p className="px-3 font-bold uppercase tracking-wider text-[10px] text-slate-500 mb-2">Solar Projects</p>
                {projectsList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="w-full text-left px-3 py-1.5 rounded hover:bg-slate-900 text-xs font-medium hover:text-white"
                  >
                    {p.name.split(' Solar')[0]}
                  </button>
                ))}
              </div>
            </nav>

            {/* Guide trigger mobile */}
            <div className="p-4 border-t border-slate-900">
              <button
                onClick={() => {
                  setGuideOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1 bg-slate-900 border border-slate-800 text-slate-300 py-1.5 rounded text-xs font-bold"
              >
                <HelpCircle className="h-4 w-4 text-teal-400" />
                <span>Walkthrough Manual</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough User Guide Modal */}
      <UserGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Floating AI Chatbot assistant panel */}
      <AIChatbot />
    </div>
  );
}

export default App;
