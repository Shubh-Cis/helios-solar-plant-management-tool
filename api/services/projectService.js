import prisma from '../prisma.js';

export async function getAllProjects() {
  const projects = await prisma.project.findMany({
    orderBy: {
      percentComplete: 'desc',
    },
  });

  // Calculate aggregate KPIs
  let totalBudget = 0;
  let totalSpend = 0;
  let weightedCompleteSum = 0;
  let totalCapacity = 0;

  projects.forEach((p) => {
    const budgetNum = parseFloat(p.budget);
    totalBudget += budgetNum;
    totalSpend += parseFloat(p.actualSpend);
    totalCapacity += p.capacityMw;
    weightedCompleteSum += p.percentComplete * budgetNum;
  });

  const overallPercentComplete = totalBudget > 0 ? Math.round(weightedCompleteSum / totalBudget) : 0;
  const budgetVariance = totalBudget - totalSpend;

  // Get open high risks count
  const openHighRisksCount = await prisma.raidLog.count({
    where: {
      type: 'Risk',
      severity: 'High',
      NOT: {
        status: {
          in: ['Closed', 'Mitigated'],
        },
      },
    },
  });

  return {
    projects,
    kpis: {
      totalBudget,
      totalSpend,
      overallPercentComplete,
      totalCapacity,
      budgetVariance,
      openHighRisks: openHighRisksCount,
    },
  };
}

export async function getProjectById(id) {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) return null;

  const milestones = await prisma.milestone.findMany({
    where: { projectId: id },
    orderBy: { dueDate: 'asc' },
  });

  const sCurve = await prisma.sCurveData.findMany({
    where: { projectId: id },
    orderBy: { month: 'asc' },
  });

  const raidLog = await prisma.raidLog.findMany({
    where: { projectId: id },
    orderBy: { id: 'asc' },
  });

  const documents = await prisma.document.findMany({
    where: { projectId: id },
    orderBy: { uploadDate: 'desc' },
  });

  return {
    project,
    milestones,
    sCurve,
    raidLog,
    documents,
  };
}

export async function createProject(data) {
  const { name, location, capacityMw, budget, actualSpend, percentComplete, startDate, endDate, status, contractor, description } = data;
  
  const project = await prisma.project.create({
    data: {
      name,
      location,
      capacityMw: parseInt(capacityMw),
      budget: budget.toString(),
      actualSpend: actualSpend.toString(),
      percentComplete: parseInt(percentComplete),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      contractor,
      description
    }
  });

  // Create default milestones for the project schedule
  await prisma.milestone.createMany({
    data: [
      { projectId: project.id, name: 'Land Acquisition & Clearances', dueDate: new Date(startDate), actualDate: new Date(startDate), status: 'Completed', weight: 10 },
      { projectId: project.id, name: 'Engineering & Procurement of PV Modules', dueDate: new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 2)), actualDate: null, status: 'Pending', weight: 40 },
      { projectId: project.id, name: 'Substation & Civil Foundation Piling', dueDate: new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 4)), actualDate: null, status: 'Pending', weight: 25 },
      { projectId: project.id, name: 'Grid Interconnection & Synchronization', dueDate: new Date(endDate), actualDate: null, status: 'Pending', weight: 25 }
    ]
  });

  // Create default S-curve progress data points
  await prisma.sCurveData.createMany({
    data: [
      { projectId: project.id, month: '2026-01', plannedProgress: 10.0, actualProgress: 10.0 },
      { projectId: project.id, month: '2026-02', plannedProgress: 25.0, actualProgress: 22.0 },
      { projectId: project.id, month: '2026-03', plannedProgress: 45.0, actualProgress: null },
      { projectId: project.id, month: '2026-04', plannedProgress: 70.0, actualProgress: null },
      { projectId: project.id, month: '2026-05', plannedProgress: 90.0, actualProgress: null },
      { projectId: project.id, month: '2026-06', plannedProgress: 100.0, actualProgress: null }
    ]
  });

  // Create a default RAID log risk entry
  await prisma.raidLog.create({
    data: {
      projectId: project.id,
      type: 'Risk',
      description: 'Initial risk: Supply chain logistics delay for structural steel and solar PV trackers.',
      severity: 'Medium',
      likelihood: 'Medium',
      owner: 'Tariq Al-Hazmi',
      status: 'Open'
    }
  });

  return project;
}

export async function updateProject(id, data) {
  const { name, location, capacityMw, budget, actualSpend, percentComplete, startDate, endDate, status, contractor, description } = data;
  
  const project = await prisma.project.update({
    where: { id },
    data: {
      name,
      location,
      capacityMw: capacityMw ? parseInt(capacityMw) : undefined,
      budget: budget ? budget.toString() : undefined,
      actualSpend: actualSpend ? actualSpend.toString() : undefined,
      percentComplete: percentComplete !== undefined ? parseInt(percentComplete) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
      contractor,
      description
    }
  });
  return project;
}

export async function deleteProject(id) {
  // Clear related items first because of database foreign key constraints
  await prisma.milestone.deleteMany({ where: { projectId: id } });
  await prisma.sCurveData.deleteMany({ where: { projectId: id } });
  await prisma.raidLog.deleteMany({ where: { projectId: id } });
  await prisma.document.deleteMany({ where: { projectId: id } });
  await prisma.user.deleteMany({ where: { projectId: id } });

  const project = await prisma.project.delete({
    where: { id: id }
  });
  return project;
}

export async function updateMilestone(id, data) {
  const { status, actualDate, progress } = data;
  
  // If status is changed, set progress defaults, else use user input progress
  let updatedProgress = progress !== undefined ? parseInt(progress) : 0;
  if (progress === undefined) {
    if (status === 'Completed') updatedProgress = 100;
    else if (status === 'In Progress') updatedProgress = 50;
    else if (status === 'Delayed') updatedProgress = 30;
    else updatedProgress = 0;
  }

  const milestone = await prisma.milestone.update({
    where: { id },
    data: {
      status,
      actualDate: actualDate ? new Date(actualDate) : (status === 'Completed' ? new Date() : null),
      progress: updatedProgress
    }
  });

  // Recalculate project completion percentage dynamically using weighted progress averages
  const allMilestones = await prisma.milestone.findMany({
    where: { projectId: milestone.projectId }
  });

  const weightedProgressSum = allMilestones.reduce((sum, m) => sum + ((m.progress || 0) * m.weight), 0);
  const totalWeight = allMilestones.reduce((sum, m) => sum + m.weight, 0);
  const calculatedPercent = totalWeight > 0 ? Math.round(weightedProgressSum / totalWeight) : 0;

  await prisma.project.update({
    where: { id: milestone.projectId },
    data: { percentComplete: calculatedPercent }
  });

  return milestone;
}
