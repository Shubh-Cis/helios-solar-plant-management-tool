import React, { useState } from 'react';
import { Sun, Mail, Lock, AlertCircle, Loader2, ArrowRight, Shield, Sparkles } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const demoAccounts = [
    { name: 'Dr. Aditya Prasad', email: 'aditya@helios.in', role: 'Super Admin', desc: 'Manage users, projects, and portfolio.' },
    { name: 'Rajesh Mehta', email: 'rajesh@helios.in', role: 'PMO Director', desc: 'View S-curves, approve logs, and audit budgets.' },
    { name: 'Arjun Nair', email: 'arjun@helios.in', role: 'Site Engineer', desc: 'Restricted view to Bhadla Solar Park Phase 1 WBS.' },
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const user = await response.json();
      onLoginSuccess(user);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Invalid email or password. Use helios123 as the password.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (acc) => {
    setEmail(acc.email);
    setPassword('helios123'); // Default seeded password
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 z-10 items-stretch">
        
        {/* Left Side: Brand Promo */}
        <div className="md:col-span-5 flex flex-col justify-between p-6 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-teal-500 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
                <Sun className="h-6 w-6 animate-spin-slow" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-widest text-slate-50">HELIOS</h1>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">Renewables Platform</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-6 text-xs leading-relaxed text-slate-400">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-teal-400" />
                Enterprise Solar PMO Command
              </h2>
              <p>
                Helios integrates baseline budgets, schedule S-Curves, and document clearance audits with live SAP ERP and Salesforce CRM hooks.
              </p>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-[11px] font-medium mt-4">
                <span className="text-teal-400 font-bold block mb-1">🌍 Indian Solar Parks Portfolio</span>
                Oversight over 50 utility-scale solar parks generating 26.50 GW across Rajasthan, Gujarat, and Andhra Pradesh.
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-6">
            <span>Helios Renewables Enterprise Portal • v2.0 (Stable)</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 flex flex-col justify-between gap-6">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col justify-between flex-1 relative overflow-hidden">
            {/* Header */}
            <div>
              <h2 className="text-lg font-bold text-white">Log in to Helios</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your credential tokens to authenticate with the PMO server.</p>
            </div>

            {/* Login Inputs */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 py-6">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@helios.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#090d1f] border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#090d1f] border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-[11px] flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Authorizing credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Selector */}
            <div className="border-t border-slate-900 pt-4 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Demo Mode Quick-Fill:</span>
              <div className="grid grid-cols-3 gap-2.5">
                {demoAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => fillCredentials(acc)}
                    className="bg-slate-900/60 border border-slate-850 hover:border-teal-500/60 hover:bg-slate-900 p-2 rounded-lg text-left transition-all cursor-pointer group text-[10px] font-medium"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold truncate block w-20">{acc.name.split(' ')[1]}</span>
                      <Shield className={`h-3 w-3 ${acc.role === 'Super Admin' ? 'text-rose-400' : acc.role === 'PMO Director' ? 'text-indigo-400' : 'text-teal-400'}`} />
                    </div>
                    <span className="text-[8.5px] text-slate-500 font-semibold block mt-0.5 truncate">{acc.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
