import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  FileText, 
  Check, 
  X, 
  Eye, 
  Clock, 
  FolderPlus, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  Download
} from 'lucide-react';

export default function DocumentManagementView({ userRole }) {
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload form state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Contract');
  const [docComment, setDocComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  // Active document selection for detail view
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Approval workflow form state
  const [approvalComment, setApprovalComment] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const handleDownload = (doc) => {
    const content = `HELIOS RENEWABLES PORTAL - DOCUMENT AUDIT FILE
===================================================
Document Name: ${doc.name}
Linked Project: ${doc.projectName}
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

  useEffect(() => {
    fetchInitialData();
  }, [userRole]); // Refetch/sync when role changes

  async function fetchInitialData() {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.projects);

      let allDocs = [];
      for (const p of data.projects) {
        const pRes = await fetch(`/api/projects/${p.id}`);
        const pData = await pRes.json();
        const docsWithProjectName = pData.documents.map(d => ({
          ...d,
          projectName: p.name
        }));
        allDocs = [...allDocs, ...docsWithProjectName];
      }
      allDocs.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
      setDocuments(allDocs);
      
      if (allDocs.length > 0) {
        setSelectedDoc(allDocs[0]);
      }
    } catch (error) {
      console.error('Error fetching document view data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Handle Document Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !docName.trim() || !docType) {
      setUploadMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          name: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
          type: docType,
          comments: docComment
        }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const newDoc = await response.json();
      const project = projects.find(p => p.id === parseInt(selectedProjectId));
      
      const newDocDecorated = {
        ...newDoc,
        projectName: project ? project.name : 'Unknown Project'
      };

      setDocuments(prev => [newDocDecorated, ...prev]);
      setSelectedDoc(newDocDecorated);
      
      setDocName('');
      setDocComment('');
      setUploadMessage({ type: 'success', text: `Document "${newDoc.name}" uploaded successfully! Simulated OCR text generated.` });
    } catch (error) {
      console.error('Error uploading:', error);
      setUploadMessage({ type: 'error', text: 'Error uploading document to backend server.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Approval Workflow (Approve or Reject)
  const handleApprovalWorkflow = async (status) => {
    if (!selectedDoc) return;
    
    setSubmittingApproval(true);
    try {
      const response = await fetch(`/api/documents/${selectedDoc.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          comments: approvalComment || `${status} by PMO`
        }),
      });

      if (!response.ok) {
        throw new Error('Approval workflow submission failed');
      }

      const updatedDoc = await response.json();
      const updatedDocDecorated = {
        ...updatedDoc,
        projectName: selectedDoc.projectName
      };

      setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDocDecorated : d));
      setSelectedDoc(updatedDocDecorated);
      setApprovalComment('');
    } catch (error) {
      console.error('Workflow error:', error);
    } finally {
      setSubmittingApproval(false);
    }
  };

  // Filter documents by OCR search and search query
  const filteredDocuments = documents.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.projectName.toLowerCase().includes(q) ||
      (d.ocr_text && d.ocr_text.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Document Management & OCR Search</h1>
        <p className="text-xs text-slate-500">
          A smart library to store, inspect, and search all your solar plant paperwork.
        </p>
      </div>

      {/* Quick Explanation Banner */}
      <div className="bg-teal-50/60 border border-teal-100/80 p-4 rounded-xl flex items-start gap-3 shadow-sm">
        <div className="p-2 bg-white border border-teal-100 rounded-lg text-teal-650 shrink-0">
          <FileCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-slate-900 text-[12.5px]">What is this page for?</h4>
          <p className="text-slate-600 leading-relaxed">
            This page acts as a <strong>smart digital filing cabinet</strong> for all your solar plant paperwork (such as builder agreements, progress cards, and invoices).
          </p>
          <h4 className="font-bold text-slate-900 text-[12.5px] pt-1.5">What is the "OCR Scan" for?</h4>
          <p className="text-slate-600 leading-relaxed">
            When you upload any document, the system automatically reads all the text inside the file (using <strong>OCR - Optical Character Recognition</strong>). This allows you to find any document instantly by searching for keywords, prices, vendors, or items mentioned inside the files, without needing to open them one by one!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: OCR Search & Upload Form */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Search Box */}
          <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Document Repository</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search file names or OCR text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-900 bg-slate-50 focus:bg-white transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            {searchQuery && (
              <p className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-1 rounded">
                Found {filteredDocuments.length} matching files
              </p>
            )}
          </div>

          {/* Upload Box */}
          <div className="bg-white border border-slate-100 p-4.5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Upload className="h-4.5 w-4.5 text-teal-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Upload New Project Document</h3>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              {/* File Dropzone Selector */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Select File from Computer *</label>
                <div className="border-2 border-dashed border-teal-200 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 p-3.5 rounded-xl text-center transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDocName(e.target.files[0].name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                    <div className="p-2 bg-white rounded-full border border-teal-200 text-teal-600 group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-[11.5px] font-bold text-slate-800">
                      {docName ? `Selected: ${docName}` : 'Click or Drag & Drop File Here'}
                    </span>
                    <span className="text-[10px] text-slate-400">Supports PDF, DOCX, PNG, JPG (Auto-OCR Scanned)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Link to Project *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none focus:border-teal-600"
                  required
                >
                  <option value="">Select Target Project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Document Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Substation_Inspection_Report.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none focus:border-teal-600 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Document Type *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-2 bg-slate-50 focus:outline-none focus:border-teal-600"
                  required
                >
                  <option value="Contract">EPC Contract / Builder Agreement</option>
                  <option value="Progress Report">Progress Report</option>
                  <option value="Change Order">Change Order / Variation</option>
                  <option value="Invoice">Invoice / SAP PO Bill</option>
                  <option value="Permit">Grid Permit / Licensing</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Comment / Upload Note</label>
                <textarea
                  placeholder="Enter review comments for PMO sign-off..."
                  value={docComment}
                  onChange={(e) => setDocComment(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:border-teal-600 h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Uploading & Running AI OCR...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload & Scan File</span>
                  </>
                )}
              </button>
            </form>

            {uploadMessage && (
              <div className={`p-2.5 rounded text-[10px] leading-relaxed flex items-start gap-1 ${
                uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{uploadMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Document List & Selected Document Details */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Document list */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col h-[520px]">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">File Directory ({filteredDocuments.length})</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {filteredDocuments.map(d => {
                const isSelected = selectedDoc && selectedDoc.id === d.id;
                let statusColor = 'bg-slate-50 text-slate-600 border-slate-100';
                if (d.status === 'Approved') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (d.status === 'Under Review') statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                if (d.status === 'Rejected') statusColor = 'bg-rose-50 text-rose-700 border-rose-100';

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDoc(d)}
                    className={`p-3 flex items-start justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-900/5 hover:bg-slate-900/5' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <FileText className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                      <div className="space-y-0.5">
                        <h4 className={`text-xs font-semibold ${isSelected ? 'text-slate-950 font-bold' : 'text-slate-800'}`}>{d.name}</h4>
                        <p className="text-[10px] text-slate-400">{d.projectName.split(' Solar')[0]}</p>
                        <div className="flex gap-2 text-[9px] text-slate-400">
                          <span>{d.type}</span>
                          <span>•</span>
                          <span>{d.version}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${statusColor}`}>
                        {d.status}
                      </span>
                      <ChevronRight className="h-3 w-3 text-slate-300" />
                    </div>
                  </div>
                );
              })}

              {filteredDocuments.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No matching files found.
                </div>
              )}
            </div>
          </div>

          {/* Document detail & OCR viewer */}
          {selectedDoc && (
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-3 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                    <FileText className="h-3 w-3" />
                    <span>Document Details</span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-950 mt-1">{selectedDoc.name}</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Linked project: <span className="font-semibold">{selectedDoc.projectName}</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(selectedDoc)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-teal-700 text-white rounded text-[10px] font-bold transition-all cursor-pointer shadow-sm select-none"
                  title="Download File Log"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>
              </div>

              {/* Status & Version */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Approval Status</span>
                  <span className={`inline-flex items-center gap-1 font-bold mt-1 text-[11px] ${
                    selectedDoc.status === 'Approved' ? 'text-emerald-700' : selectedDoc.status === 'Rejected' ? 'text-rose-700' : 'text-amber-700'
                  }`}>
                    <FileCheck className="h-3.5 w-3.5" />
                    {selectedDoc.status}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">File Version</span>
                  <span className="font-semibold text-slate-800 block mt-1">{selectedDoc.version}</span>
                </div>
              </div>

              {/* Approval workflow action */}
              {selectedDoc.status === 'Under Review' && (
                userRole === 'Site Engineer' ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Approval Actions Locked</span>
                    <p className="text-[10px] text-slate-400 mt-1">PMO Director permissions required to sign off or reject compliance files.</p>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border border-amber-100/60 rounded-lg p-3 space-y-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">PMO Approval Workflow</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Approval comments..."
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprovalWorkflow('Approved')}
                        disabled={submittingApproval}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3 w-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleApprovalWorkflow('Rejected')}
                        disabled={submittingApproval}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 rounded text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  </div>
                )
              )}

              {/* OCR Text Output */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated OCR Text Output</span>
                <div className="bg-slate-950 text-slate-300 font-mono text-[9px] p-3 rounded-lg border border-slate-850 h-52 overflow-y-auto leading-relaxed whitespace-pre-line select-all">
                  {selectedDoc.ocrText || selectedDoc.ocr_text || 'No OCR text available.'}
                </div>
              </div>

              {/* Comments history */}
              {selectedDoc.comments && (
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sign-off Comments</span>
                  <p className="text-xs text-slate-600 italic mt-1 bg-slate-50 p-2 rounded">
                    "{selectedDoc.comments}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
