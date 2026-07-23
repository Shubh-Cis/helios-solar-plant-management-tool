import prisma from '../prisma.js';

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    include: {
      project: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    projectId: u.projectId,
    assignedProjectIds: u.assignedProjectIds,
    projectName: u.project ? u.project.name : 'All Projects'
  }));
}

export async function createUser({ name, email, password, role, projectId, assignedProjectIds }) {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: password || 'helios123',
      role,
      projectId: projectId ? parseInt(projectId) : null,
      assignedProjectIds: assignedProjectIds || null
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
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    projectId: user.projectId,
    assignedProjectIds: user.assignedProjectIds,
    projectName: user.project ? user.project.name : 'All Projects'
  };
}

export async function authenticateUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      project: {
        select: {
          name: true
        }
      }
    }
  });

  if (!user || user.password !== password) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    projectId: user.projectId,
    assignedProjectIds: user.assignedProjectIds,
    projectName: user.project ? user.project.name : 'All Projects'
  };
}
