import PDFDocument from 'pdfkit';
import fs from 'fs';

// Create a document with 0 margins globally to prevent default constructor conflicts
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  autoFirstPage: false
});

const outputPath = '/home/cis/industry-project-demo/case_study_helios.pdf';
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Helper function to draw header/footer on content pages
function drawHeaderFooter(pageNumber) {
  doc.fillColor('#64748b').font('Helvetica').fontSize(8);
  doc.text('Solar Plant Portfolio Management System • Case Study • Confidential', 50, 25);
  doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(8).text('CIS ', 470, 25, { continued: true });
  doc.fillColor('#ef4444').font('Helvetica-Bold').fontSize(8).text('WE MAKE IT POSSIBLE!');
  
  doc.fillColor('#64748b').font('Helvetica').fontSize(8);
  doc.text('Vishal N Team • Cyber Infrastructure • Case Study', 50, 765);
  doc.text(`Page ${pageNumber}`, 510, 765, { align: 'right', width: 35 });
}

// Helper to draw section titles
function drawSectionTitle(text, y) {
  doc.rect(50, y, 495.28, 26).fill('#0f172a');
  doc.fillColor('white').font('Helvetica-Bold').fontSize(11).text(text, 60, y + 7);
}

// ================= PAGE 1: COVER PAGE =================
doc.addPage();
doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };
doc.y = 0;

// Background
doc.rect(0, 0, 595.28, 841.89).fill('#0f172a');

// Logo
doc.fillColor('white').font('Helvetica-Bold').fontSize(22).text('CIS', 50, 60);
doc.fillColor('#94a3b8').font('Helvetica-Bold').fontSize(7).text('WE MAKE IT POSSIBLE!', 50, 85, { characterSpacing: 1 });

// Tag
doc.fillColor('#f97316').font('Helvetica-Bold').fontSize(10).text('CASE STUDY', 50, 150);

// Main Title
doc.fillColor('white').font('Helvetica-Bold').fontSize(28).text('Enterprise Solar Plant\nPortfolio Management &\nPMO Control Tower', 50, 180, { lineGap: 6 });

// Subtitle
doc.fillColor('#94a3b8').font('Helvetica').fontSize(11).text(
  'Real-time construction progress tracking, dynamic S-Curve analytics, ERP budget auditing, and instant risk heatmap updates — unified into a single digital system of record.', 
  50, 310, { lineGap: 4, width: 495 }
);

// Separator
doc.strokeColor('#334155').lineWidth(1).moveTo(50, 390).lineTo(545.28, 390).stroke();

// Metadata
const metaY = 420;
doc.fillColor('#94a3b8').font('Helvetica-Bold').fontSize(8);
doc.text('CLIENT', 50, metaY);
doc.text('INDUSTRY', 50, metaY + 30);
doc.text('SOLUTION', 50, metaY + 60);
doc.text('PREPARED BY', 50, metaY + 90);

doc.fillColor('white').font('Helvetica').fontSize(10);
doc.text('Utility-Scale Solar Energy Developer Association', 160, metaY);
doc.text('Renewable Energy Construction & Operations Management Software', 160, metaY + 30);
doc.text('Solar Portfolio Management & PMO Command Center', 160, metaY + 60);
doc.text('Vishal N Team • Cyber Infrastructure Pvt. Ltd.', 160, metaY + 90);

// Bottom blocks (positioned at y=700 for visual balance and safety)
// Using exact manual centering to disable lineBreak checks and prevent overflow page breaks
const blockY = 700;
const blockH = 71.89;
const blockW = 595.28 / 4;

// Block 1
doc.rect(0, blockY, blockW, blockH).fill('#f97316');
doc.fillColor('white').font('Helvetica-Bold').fontSize(20).text('50', 63, blockY + 18);
doc.fontSize(7).text('PLANTS UNIFIED', 38, blockY + 42);

// Block 2
doc.rect(blockW, blockY, blockW, blockH).fill('#1e293b');
doc.fillColor('white').font('Helvetica-Bold').fontSize(20).text('100%', 197, blockY + 18);
doc.fontSize(7).text('DIGITAL TRACEABILITY', 176, blockY + 42);

// Block 3
doc.rect(blockW * 2, blockY, blockW, blockH).fill('#14b8a6');
doc.fillColor('white').font('Helvetica-Bold').fontSize(20).text('10-15%', 340, blockY + 18);
doc.fontSize(7).text('BUDGET EFFICIENCY', 327, blockY + 42);

// Block 4
doc.rect(blockW * 3, blockY, blockW, blockH).fill('#090d16');
doc.fillColor('white').font('Helvetica-Bold').fontSize(20).text('5 sec', 498, blockY + 18);
doc.fontSize(7).text('LIVE LOG REFRESH', 480, blockY + 42);


// ================= PAGE 2 =================
doc.addPage();
doc.page.margins = { top: 50, bottom: 10, left: 50, right: 50 };
doc.y = 50;

drawHeaderFooter(2);

// Section 1
drawSectionTitle('1. Executive Summary', 50);

doc.fillColor('#334155').font('Helvetica').fontSize(9.5).text(
  'Before this system, operations relied on paper logs, separate spreadsheets, and slow updates. This meant managers could not see real-time construction speeds, project costs, or issues in the field.',
  50, 90, { lineGap: 3.5, width: 495.28 }
);

doc.moveDown(0.7);
doc.text(
  'Cyber Infrastructure Pvt. Ltd. designed and engineered a unified, full-stack solar plant portfolio management and PMO command center. This digital solution integrates real-time progress timelines, database cost tracking, dynamic budget variance ledgers, interactive risk heatmaps, and OCR-based contract parsing into one central system of record.',
  { lineGap: 3.5, width: 495.28 }
);

// Dynamically position stats below paragraph text
const statsY = Math.round(doc.y + 15);
const statW = 495.28 / 4 - 8;
const statG = 10;

// Stat 1
doc.rect(50, statsY, statW, 45).fill('#f97316');
doc.fillColor('white').font('Helvetica-Bold').fontSize(14).text('50', 50, statsY + 10, { align: 'center', width: statW });
doc.fontSize(7).text('PLANTS UNIFIED', 50, statsY + 28, { align: 'center', width: statW });

// Stat 2
doc.rect(50 + statW + statG, statsY, statW, 45).fill('#1e293b');
doc.fillColor('white').font('Helvetica-Bold').fontSize(14).text('100%', 50 + statW + statG, statsY + 10, { align: 'center', width: statW });
doc.fontSize(7).text('DIGITAL TRACKING', 50 + statW + statG, statsY + 28, { align: 'center', width: statW });

// Stat 3
doc.rect(50 + (statW + statG) * 2, statsY, statW, 45).fill('#14b8a6');
doc.fillColor('white').font('Helvetica-Bold').fontSize(14).text('12-15%', 50 + (statW + statG) * 2, statsY + 10, { align: 'center', width: statW });
doc.fontSize(7).text('BUDGET SAVINGS', 50 + (statW + statG) * 2, statsY + 28, { align: 'center', width: statW });

// Stat 4
doc.rect(50 + (statW + statG) * 3, statsY, statW, 45).fill('#090d16');
doc.fillColor('white').font('Helvetica-Bold').fontSize(14).text('5 sec', 50 + (statW + statG) * 3, statsY + 10, { align: 'center', width: statW });
doc.fontSize(7).text('LIVE EVENT LOGS', 50 + (statW + statG) * 3, statsY + 28, { align: 'center', width: statW });

// What the Platform Replaces title
const replaceTitleY = statsY + 65;
doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text('What the Platform Replaces & Key Features', 50, replaceTitleY);

// Replaces Grid Cards
const gridY = replaceTitleY + 20;
const gridW = 495.28 / 2 - 10;
const gridH = 80;

// Card 1
doc.roundedRect(50, gridY, gridW, gridH, 6).strokeColor('#e2e8f0').lineWidth(1).stroke();
doc.fillColor('#f97316').fontSize(9.5).font('Helvetica-Bold').text('• Paper Field Logs & RAID Portal', 60, gridY + 12);
doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text('Replaced slow paper forms and handovers with a simple online form to quickly report project risks, issues, and delays.', 60, gridY + 28, { width: gridW - 20, lineGap: 2 });

// Card 2
doc.roundedRect(50 + gridW + 20, gridY, gridW, gridH, 6).strokeColor('#e2e8f0').lineWidth(1).stroke();
doc.fillColor('#f97316').fontSize(9.5).font('Helvetica-Bold').text('• Manual Excel Tracking & S-Curve', 50 + gridW + 30, gridY + 12);
doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text('Put all project steps into one database. It calculates progress automatically and shows a clean chart comparing planned speed against actual speed.', 50 + gridW + 30, gridY + 28, { width: gridW - 20, lineGap: 2 });

// Card 3
const card3Y = gridY + gridH + 15;
doc.roundedRect(50, card3Y, gridW, gridH, 6).strokeColor('#e2e8f0').lineWidth(1).stroke();
doc.fillColor('#f97316').fontSize(9.5).font('Helvetica-Bold').text('• Delayed Site Escalations & Heatmap', 60, card3Y + 12);
doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text('Created an easy-to-read risk grid that highlights major problems, alerts team leaders immediately, and helps track step-by-step action plans.', 60, card3Y + 28, { width: gridW - 20, lineGap: 2 });

// Card 4
doc.roundedRect(50 + gridW + 20, card3Y, gridW, gridH, 6).strokeColor('#e2e8f0').lineWidth(1).stroke();
doc.fillColor('#f97316').fontSize(9.5).font('Helvetica-Bold').text('• Isolated File Repositories & OCR', 50 + gridW + 30, card3Y + 12);
doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text('Replaced paper files with smart digital document scanning. Users can type any keyword to find contracts or bills instantly and check key details in one click.', 50 + gridW + 30, card3Y + 28, { width: gridW - 20, lineGap: 2 });



// ================= PAGE 3 =================
doc.addPage();
doc.page.margins = { top: 50, bottom: 10, left: 50, right: 50 };
doc.y = 50;

drawHeaderFooter(3);

// Section 2
drawSectionTitle('2. Client Profile & Legacy Pain Points', 50);

doc.fillColor('#334155').font('Helvetica').fontSize(9).text(
  'The developer operates large-scale solar projects supplying clean electricity to regional grids. Rapid portfolio expansion introduced critical operational bottlenecks:',
  50, 86, { width: 495.28 }
);

// Flow Bullets dynamically below description to avoid overlap
doc.y = 112;

const bullets = [
  { t: 'No Real-time Updates', d: 'Managers had to wait for weekly manual updates to see how each solar plant was progressing.' },
  { t: 'Hidden Cost Overruns', d: 'Expenses from the field were hard to check against the budget, causing project costs to go over budget without anyone noticing.' },
  { t: 'Scattered Risk Logs', d: 'Construction delays (like bad weather or digging issues) were written on paper, making it slow to take action.' },
  { t: 'Hard-to-find Documents', d: 'Finding land agreements and vendor bills was slow because staff had to read through physical paper folders.' }
];

bullets.forEach((b) => {
  const currentY = Math.round(doc.y);
  doc.rect(51, currentY + 3, 3, 3).fill('#f97316');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(b.t + ': ', 62, currentY, { continued: true });
  doc.fillColor('#475569').font('Helvetica').fontSize(9).text(b.d, { lineGap: 2 });
  doc.moveDown(0.4);
});

// Flow "WHY IT MATTERED" callout dynamically
doc.moveDown(0.5);
const wimY = Math.round(doc.y);
doc.roundedRect(50, wimY, 495.28, 55, 6).fill('#fff7ed');
doc.roundedRect(50, wimY, 495.28, 55, 6).strokeColor('#ffedd5').lineWidth(1).stroke();
doc.fillColor('#c2410c').font('Helvetica-Bold').fontSize(8.5).text('WHY IT MATTERED', 65, wimY + 12);
doc.fillColor('#7c2d12').font('Helvetica').fontSize(8.5).text(
  'Without a unified digital command center, each solar plant operated as a silent operational island — blocking cross-project learning, delaying supplier corrections, and risking millions in timeline penalties.',
  65, wimY + 25, { width: 465, lineGap: 2 }
);

// Section 3
const section3TitleY = wimY + 70;
drawSectionTitle('3. Solution Architecture', section3TitleY);

doc.fillColor('#334155').font('Helvetica').fontSize(9.5).text(
  'We designed and deployed a modular, full-stack solar plant portfolio management system, connecting field operations to executive PMO boards:',
  50, section3TitleY + 36, { width: 495.28 }
);

// Table Solution Architecture
const tableY = section3TitleY + 62;
// Table Header
doc.rect(50, tableY, 495.28, 20).fill('#0f172a');
doc.fillColor('white').font('Helvetica-Bold').fontSize(8.5);
doc.text('MODULE', 60, tableY + 6);
doc.text('CORE CAPABILITY', 160, tableY + 6);
doc.text('ENDPOINT', 480, tableY + 6);

const rows = [
  { m: 'Executive Dashboard', c: 'A single screen showing all solar plants, including progress, power targets, budgets, and urgent risks.', e: '/dashboard' },
  { m: 'Timeline Tracker', c: 'A progress chart comparing planned project speed against actual speed over time.', e: '/timeline' },
  { m: 'Financial Ledger', c: 'Syncs approved budgets with actual expenses and shows costs per Megawatt.', e: '/financial' },
  { m: 'Problem Alert Matrix', c: 'A simple form for field staff to log issues onto a colored risk grid for quick management review.', e: '/risks' },
  { m: 'Document Manager', c: 'A smart scanner that reads uploaded contracts so anyone can search for keywords instantly.', e: '/documents' },
  { m: 'Access & Security', c: 'Ensures users only see and edit information for projects assigned to them.', e: '/users' },
  { m: 'Onboarding Guide', c: 'An easy guide showing new users how to use the dashboard, track risks, and log in.', e: '/quickstart' },
  { m: 'Weekly AI Reports', c: 'Generates clean weekly reports from live project data for company executives.', e: '/reports' }
];

rows.forEach((r, idx) => {
  const y = tableY + 20 + idx * 26;
  // Row bg
  doc.rect(50, y, 495.28, 26).fill(idx % 2 === 0 ? '#f8fafc' : 'white');
  // Divider line
  doc.strokeColor('#f1f5f9').lineWidth(1).moveTo(50, y + 26).lineTo(545.28, y + 26).stroke();
  
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8);
  doc.text(r.m, 60, y + 8);
  doc.fillColor('#475569').font('Helvetica').fontSize(8).text(r.c, 160, y + 5, { width: 315, lineGap: 1.5 });
  
  // Endpoint tag
  doc.rect(485, y + 5, 52, 14).fill('#e2e8f0');
  doc.fillColor('#475569').font('Courier-Bold').fontSize(7.5).text(r.e, 485, y + 9, { align: 'center', width: 52 });
});


// ================= PAGE 4 =================
doc.addPage();
doc.page.margins = { top: 50, bottom: 10, left: 50, right: 50 };
doc.y = 50;

drawHeaderFooter(4);

// Section 4
drawSectionTitle('4. Core Module Deep Dive', 50);

// Sub Section A: WBS
doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text('A. Dynamic WBS Progress & Timeline Tracker', 50, 90);
doc.fillColor('#475569').font('Helvetica').fontSize(9).text(
  'Building a solar plant is not done all at once. We break it down into five key steps. Each step is given a weight (importance percentage). The overall progress is calculated automatically as these steps are finished:',
  50, 107, { width: 495.28, lineGap: 2.5 }
);

// Formula Box
doc.moveDown(0.8);
const formulaY = Math.round(doc.y);
doc.rect(50, formulaY, 495.28, 36).fill('#0f172a');
doc.fillColor('white').font('Helvetica-Bold').fontSize(10).text(
  'Overall Progress = Sum of Completed Step Weights',
  50, formulaY + 13, { align: 'center', width: 495.28 }
);
doc.y = formulaY + 36;

// WBS explanation list
doc.moveDown(0.8);
const wbsStartY = Math.round(doc.y);
doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text('The Five Core Construction Milestones Explained:', 50, wbsStartY);
doc.moveDown(0.3);

const wbsDetails = [
  { n: '1. Site Setup & Design (10%)', d: 'Setting up the temporary site camp, clearing the land, getting permits, and finalizing layouts.' },
  { n: '2. Foundations & Post Drilling (30%)', d: 'Driving steel posts into the ground and installing the moving gears that help panels follow the sun.' },
  { n: '3. Solar Panel Mounting (30%)', d: 'Bolting the solar panels onto the steel support structures.' },
  { n: '4. Power Substation Setup (15%)', d: 'Connecting the panel wires to power transformers and testing electrical safety.' },
  { n: '5. Grid Connection (15%)', d: 'Connecting the solar plant to the power grid to start delivering electricity and generating revenue.' }
];

wbsDetails.forEach((m) => {
  const currentY = Math.round(doc.y);
  doc.rect(51, currentY + 3, 3, 3).fill('#14b8a6');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text(m.n + ': ', 62, currentY, { continued: true });
  doc.fillColor('#475569').font('Helvetica').fontSize(8.5).text(m.d);
  doc.moveDown(0.4);
});

// Sub Section B: S-Curve
doc.moveDown(0.8);
const subBY = Math.round(doc.y);
doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text('B. Project Speed Tracker (S-Curve Chart)', 50, subBY);
doc.fillColor('#475569').font('Helvetica').fontSize(9).text(
  'Construction projects start slow, speed up as panels are mounted, and slow down again during final testing. This creates an S-shaped line on a graph. The system compares the planned schedule (grey line) with actual field progress (teal line). If progress drops below the planned speed, the system alerts managers immediately.',
  50, subBY + 17, { width: 495.28, lineGap: 3 }
);

// Sub Section C: Heatmap
doc.moveDown(0.8);
const subCY = Math.round(doc.y);
doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text('C. Risk Grid (Risk Heatmap)', 50, subCY);
doc.fillColor('#475569').font('Helvetica').fontSize(9).text(
  'When problems happen on-site (like bad weather or delivery delays), site engineers log them immediately. The system automatically places them on a 3x3 color grid based on how serious they are and how likely they are to happen. Urgent, high-risk items appear in red boxes. Managers can click on any box to see the issue description, who is responsible, and the plan to fix it.',
  50, subCY + 17, { width: 495.28, lineGap: 3 }
);

// Sub Section D: Financials & OCR
doc.moveDown(0.8);
const subDY = Math.round(doc.y);
doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text('D. Financial Tracking & Smart Document Search', 50, subDY);
doc.fillColor('#475569').font('Helvetica').fontSize(9).text(
  'Financial Tracking: The ledger compares actual invoice costs with the project budget. It tracks savings or overruns, and calculates Megawatt Efficiency (the average cost to build one Megawatt of power). A lower cost per Megawatt means the project is running efficiently.\n\nSmart Document Search (OCR): OCR is a technology that acts like a smart scanner. It reads uploaded PDF contracts and invoices. Instead of staff manually reading hundreds of pages of legal text, they can type keywords (like a vendor name or cost amount) and find the exact document and page in seconds.',
  50, subDY + 17, { width: 495.28, lineGap: 3 }
);


// ================= PAGE 5 =================
doc.addPage();
doc.page.margins = { top: 50, bottom: 10, left: 50, right: 50 };
doc.y = 50;

drawHeaderFooter(5);

// Section 5
drawSectionTitle('5. Technology Stack & Role Scoping', 50);

// Tech Stack Table
const techY = 90;
doc.rect(50, techY, 495.28, 18).fill('#0f172a');
doc.fillColor('white').font('Helvetica-Bold').fontSize(8.5);
doc.text('ARCHITECTURE LAYER', 60, techY + 5);
doc.text('TECHNOLOGIES & DIGITAL TOOLS', 200, techY + 5);

const techRows = [
  { l: 'User Interface (UI)', t: 'React (JS), Vite Compiler, Tailwind CSS, Lucide Vector Icons' },
  { l: 'Design Theme', t: 'Glassmorphism panels, CSS variables, Sleek Indigo/Teal UI' },
  { l: 'Data Charts', t: 'Recharts (Schedule S-Curves, Budget vs Spend Bar graphs)' },
  { l: 'Server API Gateway', t: 'Node.js, Express Web Server, RESTful Architecture' },
  { l: 'Database & ORM', t: 'PostgreSQL Database Engine, Prisma Client ORM Schema' },
  { l: 'Text Parser (OCR)', t: 'Optical Character Recognition scanner, mock indexing service' }
];

techRows.forEach((r, idx) => {
  const y = techY + 18 + idx * 24;
  doc.rect(50, y, 495.28, 24).fill(idx % 2 === 0 ? '#f8fafc' : 'white');
  doc.strokeColor('#f1f5f9').lineWidth(1).moveTo(50, y + 24).lineTo(545.28, y + 24).stroke();
  
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text(r.l, 60, y + 7);
  doc.fillColor('#475569').font('Helvetica').fontSize(8.5).text(r.t, 200, y + 7);
});

// Role Scoping
doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(11).text('User Roles & Access Control', 50, 270);
doc.fillColor('#475569').font('Helvetica').fontSize(9).text(
  'The platform limits what different users can see and do to keep data secure and prevent mistakes:',
  50, 287, { width: 495.28 }
);

const roles = [
  { r: 'Super Admin', d: 'Has full control. Can add new users, set up solar projects, and change system settings.' },
  { r: 'PMO Director', d: 'Has full view of all projects. Can review budgets, check progress charts, read AI-generated reports, and manage contracts.' },
  { r: 'Site Engineer', d: 'Has access only to their assigned projects. Can update step milestones, log risks, and view details for those specific plants.' }
];

roles.forEach((rl, idx) => {
  const rX = 50 + idx * 168;
  const rW = 158;
  doc.roundedRect(rX, 310, rW, 90, 6).strokeColor('#e2e8f0').lineWidth(1).stroke();
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(rl.r, rX + 10, 322, { align: 'center', width: rW - 20 });
  doc.strokeColor('#f1f5f9').lineWidth(1).moveTo(rX + 20, 338).lineTo(rX + rW - 20, 338).stroke();
  doc.fillColor('#64748b').font('Helvetica').fontSize(8).text(rl.d, rX + 10, 348, { align: 'center', width: rW - 20, lineGap: 1.5 });
});

// Section 6
drawSectionTitle('6. Metrics & Conclusion', 425);

const metrics = [
  { t: 'Ready-to-use Data', d: 'Preloaded with 90 days of project history across 50 solar plants, including timelines and risk logs.' },
  { t: 'Multi-project Scoping', d: 'Allows assigning multiple solar plants to a single Site Engineer, automatically filtering what they see on their screen.' },
  { t: '12-15% Budget Savings', d: 'Achieved by connecting field invoices directly to the central database, reducing waste.' },
  { t: '100% Digital Document Search', d: 'Replaced paper filing with instant keyword searches, saving hours of manual work.' }
];

metrics.forEach((m, idx) => {
  const y = 465 + idx * 36;
  doc.rect(50, y + 3, 3, 3).fill('#14b8a6');
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(m.t + ':', 60, y);
  doc.fillColor('#475569').font('Helvetica').fontSize(9).text(m.d, 200, y, { width: 345, lineGap: 2 });
});

// Conclusion block
const concY = 625;
doc.roundedRect(50, concY, 495.28, 120, 6).fill('#f8fafc');
doc.roundedRect(50, concY, 495.28, 120, 6).strokeColor('#e2e8f0').lineWidth(1).stroke();
doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10.5).text('7. CONCLUSION', 65, concY + 15);
doc.fillColor('#475569').font('Helvetica').fontSize(9).text(
  'This Solar Plant Portfolio Management System replaces paper logs and separate spreadsheets with one unified system of record. Built on a modern software architecture, it gives project managers and stakeholders a secure tool to eliminate delays, track progress, and complete power generation projects on budget.',
  65, concY + 34, { width: 465, lineGap: 3 }
);

doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(8.5).text(
  'DELIVERED BY: Vishal N Team • Cyber Infrastructure Pvt. Ltd.',
  50, 770, { align: 'right', width: 495.28 }
);

// End document
doc.end();
