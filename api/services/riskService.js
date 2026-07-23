import prisma from '../prisma.js';

export async function getAllRisks() {
  const risks = await prisma.raidLog.findMany({
    include: {
      project: {
        select: {
          name: true,
        },
      },
    },
  });

  // Map to flat structure and sort by severity
  const mappedRisks = risks.map((r) => ({
    id: r.id,
    project_id: r.projectId,
    project_name: r.project.name,
    type: r.type,
    description: r.description,
    severity: r.severity,
    likelihood: r.likelihood,
    owner: r.owner,
    status: r.status,
    resolution: r.resolution,
  }));

  // Custom sort: High -> Medium -> Low
  const severityOrder = { High: 1, Medium: 2, Low: 3 };
  mappedRisks.sort((a, b) => {
    const aOrder = severityOrder[a.severity] || 4;
    const bOrder = severityOrder[b.severity] || 4;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return b.id - a.id;
  });

  return mappedRisks;
}

export async function createRaidEntry(data) {
  const { projectId, type, description, severity, likelihood, owner, status, resolution } = data;
  const newRaid = await prisma.raidLog.create({
    data: {
      projectId: parseInt(projectId),
      type,
      description,
      severity: severity || null,
      likelihood: likelihood || null,
      owner,
      status,
      resolution: resolution || null
    },
    include: {
      project: {
        select: {
          name: true
        }
      }
    }
  });

  return {
    id: newRaid.id,
    project_id: newRaid.projectId,
    project_name: newRaid.project.name,
    type: newRaid.type,
    description: newRaid.description,
    severity: newRaid.severity,
    likelihood: newRaid.likelihood,
    owner: newRaid.owner,
    status: newRaid.status,
    resolution: newRaid.resolution
  };
}
