import React, { useState } from 'react';
import { Sparkles, Download, FileText, Loader2, ArrowRight, Printer } from 'lucide-react';

export default function ExecutiveReportView() {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    'Retrieving active portfolio database parameters...',
    'Analyzing budget vs actual spend variances...',
    'Synthesizing schedule S-curve progress ratios...',
    'Compiling RAID logs and geotechnical soil matrices...',
    'Formulating leadership strategic recommendation summary...',
    'Constructing report via Claude 3.5 Sonnet...'
  ];

  const generateReport = async () => {
    setLoading(true);
    setReport('');
    setLoadingStep(0);

    // Rotate through steps during loading for visual effect
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);

    try {
      const apiKey = localStorage.getItem('helios_api_key') || null;
      const response = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const data = await response.json();
      setReport(data.report);
    } catch (error) {
      console.error('Error generating report:', error);
      setReport('### Generation Error\nFailed to communicate with the AI report generator endpoint. Please verify backend is running.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const parseMarkdown = (md) => {
    if (!md) return '';
    let html = md;
    
    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-slate-900 mt-5 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-slate-950 border-b border-slate-100 pb-1 mt-7 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-slate-950 border-b border-slate-200 pb-2 mt-8 mb-4">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-950">$1</strong>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-5 list-disc text-xs text-slate-700 py-0.5 leading-relaxed">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-xs text-slate-700 py-0.5 leading-relaxed">$1</li>');
    
    // Parse tables
    const lines = html.split('\n');
    let inTable = false;
    let tableRows = [];
    let tableHtml = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|')) {
        inTable = true;
        const cells = trimmed.split('|')
          .map(c => c.trim())
          .filter((_, i, arr) => i > 0 && i < arr.length - 1);
        
        // Skip separator rows
        if (cells.every(c => c.startsWith('-'))) return;

        tableRows.push(cells);
      } else {
        if (inTable) {
          // Build table html
          tableHtml.push('<div class="overflow-x-auto my-4"><table class="w-full text-left text-xs border-collapse border border-slate-200">');
          tableRows.forEach((row, rIdx) => {
            const tag = rIdx === 0 ? 'th' : 'td';
            const cellClass = rIdx === 0 
              ? 'bg-slate-50 font-bold border border-slate-200 p-2 text-slate-900' 
              : 'border border-slate-200 p-2 text-slate-700';
            
            tableHtml.push('<tr>');
            row.forEach(cell => {
              // Convert ** inside tables
              const formattedCell = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              tableHtml.push(`<${tag} class="${cellClass}">${formattedCell}</${tag}>`);
            });
            tableHtml.push('</tr>');
          });
          tableHtml.push('</table></div>');
          
          tableRows = [];
          inTable = false;
        }
        tableHtml.push(line);
      }
    });

    if (inTable) {
      tableHtml.push('<div class="overflow-x-auto my-4"><table class="w-full text-left text-xs border-collapse border border-slate-200">');
      tableRows.forEach((row, rIdx) => {
        const tag = rIdx === 0 ? 'th' : 'td';
        const cellClass = rIdx === 0 
          ? 'bg-slate-50 font-bold border border-slate-200 p-2 text-slate-900' 
          : 'border border-slate-200 p-2 text-slate-700';
        
        tableHtml.push('<tr>');
        row.forEach(cell => {
          const formattedCell = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          tableHtml.push(`<${tag} class="${cellClass}">${formattedCell}</${tag}>`);
        });
        tableHtml.push('</tr>');
      });
      tableHtml.push('</table></div>');
    }

    html = tableHtml.join('\n');
    return html;
  };

  const handlePrint = () => {
    const printContent = document.getElementById('executive-report-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Helios Renewables - Weekly Portfolio Executive Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { font-size: 20px; font-weight: bold; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-top: 30px; color: #0f172a; }
            h2 { font-size: 15px; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 25px; color: #0f172a; }
            h3 { font-size: 12px; font-weight: bold; margin-top: 18px; color: #0f172a; }
            p, li { font-size: 11px; margin-bottom: 8px; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 10px; }
            th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
            strong { font-weight: 600; color: #0f172a; }
            .header-banner { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
            .logo { font-size: 16px; font-weight: 800; tracking: 0.05em; color: #0f172a; }
            .sublogo { font-size: 9px; font-weight: 600; tracking: 0.1em; color: #64748b; text-transform: uppercase; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="logo">HELIOS RENEWABLES</div>
            <div class="sublogo">AI Portfolio Intelligence Platform</div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 6px;">Report generated on ${new Date().toLocaleDateString()}</div>
          </div>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // Allow resource load before triggering dialog
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950">AI Executive Report Generator</h1>
        <p className="text-xs text-slate-500">
          Synthesize portfolio parameters, WBS timelines, cost exposures, and RAID registers into a structured executive summary report suitable for board presentations.
        </p>
      </div>

      {!report && !loading && (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm space-y-4 max-w-2xl mx-auto mt-8">
          <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mx-auto border border-teal-100 shadow-inner">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">Weekly Executive Portfolio Report</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Click the button below to query our AI model. Claude will analyze budget variances, geotechnical delays at Pavagada, custom tracker clearance lags at Mundra Port, and compile operational recommendations.
            </p>
          </div>
          <button
            onClick={generateReport}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-slate-950 text-white hover:bg-teal-700 text-xs font-bold rounded-xl transition-all shadow-md transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-4.5 w-4.5 text-teal-400" />
            Generate Weekly Executive Report
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm space-y-4 max-w-md mx-auto mt-8 flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">Generating Intelligence Report</h3>
            <p className="text-xs text-teal-600 font-bold transition-all animate-pulse">
              {steps[loadingStep]}
            </p>
          </div>
          <div className="w-48 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-teal-600 h-full transition-all duration-1000" 
              style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {report && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Actions Banner */}
          <div className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-slate-700" />
              Report generation complete (Claude 3.5 model).
            </span>
            <div className="flex gap-2">
              <button
                onClick={generateReport}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[10.5px] font-semibold rounded-lg text-slate-700 transition-all cursor-pointer"
              >
                Regenerate
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-teal-700 text-white text-[10.5px] font-semibold rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Export / Save PDF
              </button>
            </div>
          </div>

          {/* Paper Document Layout */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 md:p-12 min-h-[600px] border-t-[6px] border-t-slate-950">
            {/* Header Document */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-600 tracking-widest block">HELIOS RENEWABLES</span>
                <h1 className="text-xl font-bold text-slate-950">WEEKLY EXECUTIVE PORTFOLIO REPORT</h1>
                <p className="text-[10.5px] text-slate-400 font-semibold uppercase">Portfolio Development Operations & Risk Summary</p>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <div>Date: <strong className="text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
                <div>Status: <strong className="text-slate-700">Official Board Document</strong></div>
                <div>Version: <strong className="text-slate-700">v1.0 (AI-Generated)</strong></div>
              </div>
            </div>

            {/* Markdown rendered output */}
            <div 
              id="executive-report-content"
              className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(report) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
