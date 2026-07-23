import React, { useState, useEffect } from 'react';
import { User, Shield, Mail, UserPlus, Folder, AlertCircle } from 'lucide-react';

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // New User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('helios123');
  const [role, setRole] = useState('Site Engineer');
  const [projectId, setProjectId] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [projSearch, setProjSearch] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const [usersRes, projRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/projects')
      ]);
      const usersData = await usersRes.json();
      const projData = await projRes.json();

      setUsers(usersData);
      setProjects(projData.projects);
    } catch (err) {
      console.error('Error fetching users data:', err);
    } finally {
      setLoading(false);
    }
  }

  const getAssignedProjectsLabel = (u) => {
    if (u.role !== 'Site Engineer') return 'All Projects';
    if (u.assignedProjectIds) {
      const ids = u.assignedProjectIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      const matchedNames = projects.filter(p => ids.includes(p.id)).map(p => p.name.split(' Solar')[0]);
      return matchedNames.length > 0 ? matchedNames.join(', ') : 'No Projects';
    }
    return u.projectName ? u.projectName.split(' Solar')[0] : 'No Projects';
  };

  const getAssignedProjects = (u) => {
    if (u.role !== 'Site Engineer') return [];
    if (u.assignedProjectIds) {
      const ids = u.assignedProjectIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      return projects.filter(p => ids.includes(p.id));
    }
    const matched = projects.filter(p => p.name === u.projectName);
    return matched;
  };

  const getEngineersForProject = (projectId) => {
    return users.filter(u => {
      if (u.role !== 'Site Engineer') return false;
      if (u.assignedProjectIds) {
        const ids = u.assignedProjectIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        return ids.includes(projectId);
      }
      return u.projectId === projectId;
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !role) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password: password || 'helios123',
          role,
          projectId: selectedProjectIds[0] || null,
          assignedProjectIds: selectedProjectIds.join(',')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const newUser = await response.json();
      setUsers(prev => [...prev, newUser]);
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('helios123');
      setSelectedProjectIds([]);
      setSuccessMsg(`User "${newUser.name}" successfully created with role ${newUser.role}.`);
    } catch (err) {
      console.error('Create user error:', err);
      setErrorMsg('Failed to create user. Make sure the email is unique.');
    }
  };

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
        <h1 className="text-2xl font-bold text-slate-950">User & Security Administration</h1>
        <p className="text-xs text-slate-500">
          Role-Based Access Control (RBAC). Super Admins can provision users, assign roles, and restrict visibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Provision Form */}
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2">
            <UserPlus className="h-4.5 w-4.5 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Provision User Profile</h3>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Email Address *</label>
              <input
                type="email"
                placeholder="e.g. khalid@helios.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Password *</label>
              <input
                type="text"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 block">Security Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-slate-900"
                required
              >
                <option value="Super Admin">Super Admin (All Access)</option>
                <option value="PMO Director">PMO Director (Read/Approve Access)</option>
                <option value="Site Engineer">Site Engineer (Restricted Access)</option>
              </select>
            </div>

            {role === 'Site Engineer' && (
              <div className="space-y-2 animate-fade-in">
                <label className="font-semibold text-slate-600 block">Assigned Project Focus (Select multiple if needed)</label>
                <div className="border border-slate-200 rounded p-2.5 bg-slate-50 max-h-36 overflow-y-auto space-y-1.5">
                  {projects.map(p => {
                    const isChecked = selectedProjectIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedProjectIds(selectedProjectIds.filter(id => id !== p.id));
                            } else {
                              setSelectedProjectIds([...selectedProjectIds, p.id]);
                            }
                          }}
                          className="rounded text-teal-650 focus:ring-teal-500 h-3.5 w-3.5"
                        />
                        <span>{p.name}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400">Site Engineers are restricted to viewing only their assigned projects.</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-teal-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Create Account
            </button>

            {successMsg && (
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded text-[10px] font-medium leading-relaxed flex items-start gap-1">
                <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-2 bg-rose-50 text-rose-800 rounded text-[10px] font-medium leading-relaxed flex items-start gap-1">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* User Directory */}
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden lg:col-span-2 flex flex-col h-[400px]">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Security Registry ({users.length} Users)</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {users.map(u => (
              <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between text-xs hover:bg-slate-50/55 transition-colors gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                      u.role === 'Super Admin' 
                        ? 'bg-rose-50 border-rose-100 text-rose-600' 
                        : u.role === 'PMO Director' 
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                          : 'bg-teal-50 border-teal-100 text-teal-600'
                    }`}>
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 truncate">{u.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate"><Mail className="h-3 w-3 shrink-0" /> {u.email}</p>
                    </div>
                  </div>

                  {/* Assigned Projects Badges Wrapping Nicely */}
                  {u.role === 'Site Engineer' && (
                    <div className="flex flex-wrap gap-1.5 pl-11">
                      {getAssignedProjects(u).map((p) => (
                        <span key={p.id} className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded text-[9.5px] font-medium truncate max-w-[200px]">
                          <Folder className="h-3 w-3 text-slate-400 shrink-0" />
                          {p.name.split(' Solar')[0]}
                        </span>
                      ))}
                      {getAssignedProjects(u).length === 0 && (
                        <span className="text-[9.5px] text-rose-500 font-semibold uppercase tracking-wider">⚠️ No Projects Assigned</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center md:flex-col items-start md:items-end justify-between md:justify-center shrink-0 gap-2 border-t md:border-0 border-slate-50 pt-2 md:pt-0">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold border uppercase ${
                    u.role === 'Super Admin' 
                      ? 'bg-rose-50 text-rose-700 border-rose-100' 
                      : u.role === 'PMO Director' 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                        : 'bg-teal-50 text-teal-700 border-teal-100'
                  }`}>
                    <Shield className="h-3 w-3" />
                    {u.role}
                  </span>

                  {u.role !== 'Site Engineer' && (
                    <div className="text-[9.5px] text-slate-400 font-medium flex items-center gap-0.5">
                      <Folder className="h-3 w-3 text-slate-300" />
                      <span>All Projects Access</span>
                    </div>
                  )}
                  {u.role === 'Site Engineer' && (
                    <div className="text-[9.5px] text-teal-600 font-bold bg-teal-50/50 px-1.5 py-0.5 rounded border border-teal-100/50">
                      {getAssignedProjects(u).length} Sites Managed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Assignment Registry */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col mt-6">
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-505">Solar Plant Assignment Registry</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Quick lookup of which Site Engineers are assigned to manage each solar plant.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search solar plant..."
              value={projSearch}
              onChange={(e) => setProjSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-slate-950 rounded-lg px-3 py-1 text-xs focus:outline-none placeholder:text-slate-400 transition-all font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/40">
                <th className="py-2.5 px-4">Solar Plant Name</th>
                <th className="py-2.5 px-4">Capacity</th>
                <th className="py-2.5 px-4">Location</th>
                <th className="py-2.5 px-4">Assigned Field Engineers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {projects
                .filter(p => p.name.toLowerCase().includes(projSearch.toLowerCase()))
                .map(p => {
                  const engineers = getEngineersForProject(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{p.capacityMw} MW</td>
                      <td className="py-3 px-4 text-slate-500">{p.location.split(',')[0]}</td>
                      <td className="py-3 px-4">
                        {engineers.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {engineers.map(e => (
                              <span 
                                key={e.id} 
                                className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 border border-teal-100 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                title={e.email}
                              >
                                <User className="h-2.5 w-2.5 text-teal-600" />
                                {e.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full px-2 py-0.5 text-[10px] font-bold">
                            ⚠️ Unassigned (Needs Manager)
                          </span>
                        )}
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
