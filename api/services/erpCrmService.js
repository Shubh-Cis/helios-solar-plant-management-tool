import prisma from '../prisma.js';

export async function syncERP() {
  // Pick a project to sync
  const projects = await prisma.project.findMany();
  if (projects.length === 0) return null;

  // Let's pick a random project
  const project = projects[Math.floor(Math.random() * projects.length)];

  // Simulate an invoice sync: increase actual spend by a random amount between ₹15 Lakhs and ₹30 Lakhs (INR 1.5M to 3M)
  const increaseAmount = parseFloat((Math.random() * 1500000 + 1500000).toFixed(2));
  const newSpend = parseFloat(project.actualSpend) + increaseAmount;

  await prisma.project.update({
    where: { id: project.id },
    data: { actualSpend: newSpend }
  });

  // Create a document representing the ERP sync invoice
  const invoiceNum = Math.floor(Math.random() * 900000 + 100000);
  const docName = `SAP_Invoice_PO_${invoiceNum}_Sync.pdf`;
  
  const ocrText = `SIMULATED ERP OCR SCAN: SAP S/4HANA Accounts Payable module. 
Invoice Number: INV-${invoiceNum}. 
Purchase Order Reference: PO-${invoiceNum}.
Vendor: Larsen & Toubro / Tata Power. 
Invoice Total: INR ${increaseAmount.toLocaleString()}. 
Line item: Foundation piling execution and tracker framing wiring. 
Status: Automatically verified and approved by ERP gateway.`;

  const document = await prisma.document.create({
    data: {
      projectId: project.id,
      name: docName,
      type: 'Progress Report',
      comments: `ERP Auto-Sync: SAP Invoice posting verified.`,
      status: 'Approved',
      version: 'v1.0',
      ocrText,
      filePath: `/uploads/sap_sync_${Date.now()}.pdf`
    }
  });

  return {
    system: 'SAP S/4HANA (ERP)',
    activity: `Synced invoice PO-${invoiceNum} for ${project.name}. Increased actual spend by ₹${(increaseAmount/10000000).toFixed(2)} Cr (INR ${increaseAmount.toLocaleString()}).`,
    projectName: project.name,
    increaseAmount,
    documentId: document.id,
    timestamp: new Date()
  };
}

export async function syncCRM() {
  const projects = await prisma.project.findMany();
  if (projects.length === 0) return null;

  // Pick a project, let's pick one with open dependencies in RAID log
  const project = projects[Math.floor(Math.random() * projects.length)];

  // Find an open dependency in RAID log for this project, or create one
  let raidDependency = await prisma.raidLog.findFirst({
    where: {
      projectId: project.id,
      type: 'Dependency',
      status: 'Open'
    }
  });

  let activityText = '';
  
  if (raidDependency) {
    // Resolve the dependency simulating Salesforce CRM / Permitting Sync
    await prisma.raidLog.update({
      where: { id: raidDependency.id },
      data: {
        status: 'Resolved',
        resolution: `Salesforce Permitting Sync: Grid connection sync permits and environmental licenses cleared by ministerial signatory.`
      }
    });
    activityText = `CRM Grid Permitting Sync: Resolved dependency "${raidDependency.description.substring(0, 40)}..." for ${project.name}.`;
  } else {
    // Create a new synced assumption/dependency from Salesforce CRM client record
    const description = `Stakeholder Assumption: NTPC Limited client PPA tariff index adjustments finalized.`;
    const newLog = await prisma.raidLog.create({
      data: {
        projectId: project.id,
        type: 'Assumption',
        description,
        owner: 'Pooja Sharma (Grid Lead)',
        status: 'Closed',
        resolution: 'Salesforce CRM: Concession agreements executed by Power Ministry.'
      }
    });
    activityText = `CRM Client Relations Sync: Added closed assumption for ${project.name}: "${description}"`;
  }

  return {
    system: 'Salesforce Utility CRM',
    activity: activityText,
    projectName: project.name,
    timestamp: new Date()
  };
}
