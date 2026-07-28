import prisma from './prisma.js';

async function seedData() {
  try {
    const existingCount = await prisma.project.count();
    if (existingCount > 0) {
      console.log(`Database already populated with ${existingCount} projects. Skipping seed.`);
      return;
    }
    console.log('Cleaning existing database records via Prisma...');
    
    // Clear in reverse dependency order
    await prisma.user.deleteMany();
    await prisma.document.deleteMany();
    await prisma.raidLog.deleteMany();
    await prisma.sCurveData.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    
    console.log('Existing records deleted successfully.');

    // 1. Define 50 Projects dynamically with real Indian locations & contractors
    console.log('Generating 50 solar projects...');
    const indianLocations = [
      { location: 'Jodhpur, Rajasthan, India', name: 'Bhadla Solar Park' },
      { location: 'Kutch, Gujarat, India', name: 'Khavda Renewable Energy Park' },
      { location: 'Tumakuru, Karnataka, India', name: 'Pavagada Solar Park' },
      { location: 'Rewa, Madhya Pradesh, India', name: 'Rewa Ultra Mega Solar' },
      { location: 'Patan, Gujarat, India', name: 'Charanka Solar Park' },
      { location: 'Ramanathapuram, Tamil Nadu, India', name: 'Kamuthi Solar Sanctuary' },
      { location: 'Jaisalmer, Rajasthan, India', name: 'Nokh Solar Park' },
      { location: 'Kurnool, Andhra Pradesh, India', name: 'Kurnool Ultra Mega Solar' },
      { location: 'Anantapur, Andhra Pradesh, India', name: 'Ananthapuram Solar Complex' },
      { location: 'Banaskantha, Gujarat, India', name: 'Raghanesda Solar Park' }
    ];

    const contractors = [
      'Tata Power Solar',
      'Larsen & Toubro (L&T)',
      'Sterling & Wilson Solar',
      'Mahindra Susten',
      'Adani Green Energy',
      'BHEL Solar',
      'Avaada Energy',
      'Azure Power',
      'Greenko Group',
      'Welspun Energy'
    ];

    const projectsData = [];
    for (let i = 1; i <= 50; i++) {
      const locTemplate = indianLocations[(i - 1) % indianLocations.length];
      const contractor = contractors[(i - 1) % contractors.length];
      
      const phase = Math.ceil(i / indianLocations.length);
      // capacityMw between 150MW and 1250MW
      const capacityMw = 150 + ((i * 37) % 11) * 100;
      // Budget: approx ₹6 Crores per MW (60,000,000 INR)
      const budget = capacityMw * 6000000.00;
      
      // Distribute statuses: On Track (75%), At Risk (15%), Critical (10%)
      let status = 'On Track';
      if (i % 10 === 0) {
        status = 'Critical';
      } else if (i % 6 === 0) {
        status = 'At Risk';
      }

      let percentComplete = 85;
      let actualSpend = budget * 0.95;
      if (status === 'Critical') {
        percentComplete = 40 + (i % 5); // 40% to 44%
        actualSpend = budget * (1.11 + (i % 6) * 0.01); // 1.11x to 1.16x
      } else if (status === 'At Risk') {
        percentComplete = 65 + (i % 6); // 65% to 70%
        actualSpend = budget * (1.03 + (i % 5) * 0.01); // 1.03x to 1.07x
      } else {
        // "On Track" projects: split into under budget, exactly on budget, or slightly over budget
        percentComplete = 80 + (i % 8); // 80% to 87%
        const progressFactor = percentComplete / 100;
        
        if (i % 10 < 8) {
          // Group A: Under Budget (Efficient) - Spend is 4% to 6% less than progress (80% share)
          const spendFactor = progressFactor - (0.04 + (i % 3) * 0.01);
          actualSpend = budget * spendFactor;
        } else if (i % 10 === 8) {
          // Group B: Exactly On Budget - Spend matches progress (10% share)
          actualSpend = budget * progressFactor;
        } else {
          // Group C: Slightly Over Budget - Spend is 3% to 5% higher than progress (10% share)
          const spendFactor = progressFactor + (0.03 + (i % 3) * 0.01);
          actualSpend = budget * spendFactor;
        }
      }

      projectsData.push({
        name: `${locTemplate.name} Phase ${phase}`,
        location: locTemplate.location,
        capacityMw,
        budget,
        actualSpend,
        percentComplete,
        startDate: new Date('2025-01-10'),
        endDate: new Date('2026-12-31'),
        status,
        contractor,
        description: `${capacityMw}MW grid-interactive solar power development inside the ${locTemplate.name} under execution phase ${phase}. Developed in cooperation with local Power Grid pooling substations. EPC lead contractor: ${contractor}.`
      });
    }

    // Insert Projects
    const createdProjects = [];
    for (const pData of projectsData) {
      const p = await prisma.project.create({ data: pData });
      createdProjects.push(p);
    }

    console.log(`${createdProjects.length} projects successfully seeded. Generating WBS timeline & logs...`);

    // 2. Loop through each project to seed milestones, S-curves, and RAID logs dynamically
    for (const p of createdProjects) {
      const isCompleted = p.percentComplete >= 80;
      
      // A. Milestones
      await prisma.milestone.createMany({
        data: [
          { projectId: p.id, name: 'Site Mobilization & Engineering Design', dueDate: new Date('2025-02-15'), actualDate: new Date('2025-02-12'), status: 'Completed', weight: 10, progress: 100 },
          { projectId: p.id, name: 'Piling & Tracker Installation', dueDate: new Date('2025-08-30'), actualDate: isCompleted ? new Date('2025-08-25') : null, status: isCompleted ? 'Completed' : 'In Progress', weight: 30, progress: isCompleted ? 100 : 50 },
          { projectId: p.id, name: 'PV Module Mounting', dueDate: new Date('2026-03-15'), actualDate: p.percentComplete >= 90 ? new Date('2026-03-20') : null, status: p.percentComplete >= 90 ? 'Completed' : (p.percentComplete >= 50 ? 'In Progress' : 'Not Started'), weight: 30, progress: p.percentComplete >= 90 ? 100 : (p.percentComplete >= 50 ? 50 : 0) },
          { projectId: p.id, name: 'Substation Energization', dueDate: new Date('2026-06-30'), actualDate: p.percentComplete >= 95 ? new Date('2026-07-02') : null, status: p.percentComplete >= 95 ? 'Completed' : 'Pending', weight: 15, progress: p.percentComplete >= 95 ? 100 : 0 },
          { projectId: p.id, name: 'Commercial Operation Date (COD)', dueDate: p.endDate, status: p.status === 'On Track' ? 'In Progress' : (p.status === 'Critical' ? 'Delayed' : 'Not Started'), weight: 15, progress: p.status === 'On Track' ? 50 : (p.status === 'Critical' ? 30 : 0) }
        ]
      });

      // B. S-curve progress data points
      const currentProgress = p.percentComplete;
      const startProgress = Math.max(0, currentProgress - 35);
      await prisma.sCurveData.createMany({
        data: [
          { projectId: p.id, month: '2026-01', plannedProgress: startProgress + 5, actualProgress: startProgress + 6 },
          { projectId: p.id, month: '2026-04', plannedProgress: startProgress + 15, actualProgress: startProgress + 14 },
          { projectId: p.id, month: '2026-07', plannedProgress: currentProgress, actualProgress: currentProgress },
          { projectId: p.id, month: '2026-10', plannedProgress: Math.min(100, currentProgress + 10) }
        ]
      });

      // C. RAID log
      if (p.status === 'Critical') {
        await prisma.raidLog.create({
          data: {
            projectId: p.id,
            type: 'Issue',
            description: `Piling Foundation: Poor soil bearing capacity at ${p.name} requiring reinforced concrete piles.`,
            severity: 'High',
            likelihood: 'High',
            owner: 'Anil Kulkarni (Civil Lead)',
            status: 'Open',
            resolution: 'Re-engineering foundation structures. Swapping driven steel piles for cast-in-place concrete.'
          }
        });
      } else if (p.status === 'At Risk') {
        await prisma.raidLog.create({
          data: {
            projectId: p.id,
            type: 'Risk',
            description: `Supply Chain Bottlenecks: Custom PV trackers delayed at port due to customs inspections for ${p.name}.`,
            severity: 'High',
            likelihood: 'Medium',
            owner: 'Vikram Malhotra (Logistics)',
            status: 'Open',
            resolution: 'Coordinating weekly updates with import brokers and logistics providers.'
          }
        });
      } else {
        await prisma.raidLog.create({
          data: {
            projectId: p.id,
            type: 'Assumption',
            description: `PGCIL Grid Sync: Assuming grid connection slots are finalized on schedule for ${p.name}.`,
            severity: 'Low',
            likelihood: 'Low',
            owner: 'Pooja Sharma (Grid Lead)',
            status: 'Closed',
            resolution: 'Formal grid allocation contract executed.'
          }
        });
      }
    }

    console.log('Milestones, S-curves, and RAID logs dynamically generated.');

    // 3. Seed Document archives for subset
    console.log('Seeding mock document files...');
    await prisma.document.createMany({
      data: [
        {
          projectId: createdProjects[0].id,
          name: 'Bhadla_Solar_Substation_Energization_Certificate.pdf',
          type: 'Progress Report',
          uploadDate: new Date('2026-06-30'),
          status: 'Approved',
          version: 'v1.0',
          ocrText: 'HELIOS RENEWABLES - BHADLA SOLAR PARK PROGRESS REPORT. Substation civil works are 100% complete and energization test was completed on June 29, 2026, with PGCIL presence. PV module mounting is 98% done. Inverter installations are ongoing. Grid coordination managed by Priya Patel. Site manager Arjun Nair confirms safety protocols met.',
          comments: 'Substation energization approved by grid inspector.',
          filePath: '/uploads/mock_1721151600000_Bhadla_Solar_Substation_Energization_Certificate.pdf'
        },
        {
          projectId: createdProjects[0].id,
          name: 'Change_Order_04_GridSync_PGCIL_Requirements.pdf',
          type: 'Change Order',
          uploadDate: new Date('2026-05-10'),
          status: 'Approved',
          version: 'v1.1',
          ocrText: 'CHANGE ORDER NO. 04: GRID SYNCHRONIZATION AND TELEMETRY UPGRADE. Power Grid Corporation of India (PGCIL) updated grid code requirements for real-time telemetry.',
          comments: 'Necessary compliance update. PGCIL mandated.',
          filePath: '/uploads/mock_1721151600000_Change_Order_04_GridSync_PGCIL_Requirements.pdf'
        },
        {
          projectId: createdProjects[1].id,
          name: 'Mundra_Port_Customs_Logistics_Delays_CO.pdf',
          type: 'Change Order',
          uploadDate: new Date('2026-06-15'),
          status: 'Under Review',
          version: 'v1.0',
          ocrText: 'REQUEST FOR SCHEDULE EXTENSION AND LOGISTICAL COST SHIFT. Project: Khavda Renewable Energy Park. Contractor L&T submits request for 30-day schedule extension for the tracker framing milestone and USD 3,200,000 in additional logistics costs. Due to global shipping disruptions, 340 containers of tracker gears were diverted to Mundra Port, causing customs clearance bottlenecks.',
          comments: 'Awaiting shipping manifest verification.',
          filePath: '/uploads/mock_1721151600000_Mundra_Port_Customs_Logistics_Delays_CO.pdf'
        },
        {
          projectId: createdProjects[2].id,
          name: 'Pavagada_Soil_Compaction_Geotech_Issue.pdf',
          type: 'Progress Report',
          uploadDate: new Date('2026-05-20'),
          status: 'Approved',
          version: 'v1.0',
          ocrText: 'GEOTECHNICAL SURVEY ANALYSIS & FOUNDATION REMEDIATION REPORT - PAVAGADA SOLAR PARK. Investigation of the central and eastern sectors reveals clayey soil conditions. Standard steel driven piles are showing signs of structural displacement. Recommended action by Anil Kulkarni: Shift to epoxy-coated cast-in-situ concrete bored piles. Cost impact: estimated USD 20,000,000.',
          comments: 'Critical soil report. Approved foundation design change.',
          filePath: '/uploads/mock_1721151600000_Pavagada_Soil_Compaction_Geotech_Issue.pdf'
        }
      ]
    });

    console.log('Seeding users...');
    const engineers = [
      { name: 'Arjun Nair', email: 'arjun@helios.in', role: 'Site Engineer', projectIndices: [] },
      { name: 'Priya Patel', email: 'priya@helios.in', role: 'Site Engineer', projectIndices: [] },
      { name: 'Amit Sharma', email: 'amit@helios.in', role: 'Site Engineer', projectIndices: [] },
      { name: 'Sneha Reddy', email: 'sneha@helios.in', role: 'Site Engineer', projectIndices: [] },
      { name: 'Vikram Singh', email: 'vikram@helios.in', role: 'Site Engineer', projectIndices: [] }
    ];

    // Assign project IDs evenly among site engineers
    for (let i = 0; i < createdProjects.length; i++) {
      const engIndex = i % 5;
      engineers[engIndex].projectIndices.push(createdProjects[i].id);
    }

    const userData = [
      { name: 'Dr. Aditya Prasad', email: 'aditya@helios.in', role: 'Super Admin' },
      { name: 'Rajesh Mehta', email: 'rajesh@helios.in', role: 'PMO Director' }
    ];

    for (const eng of engineers) {
      userData.push({
        name: eng.name,
        email: eng.email,
        role: eng.role,
        projectId: eng.projectIndices[0] || null,
        assignedProjectIds: eng.projectIndices.join(',')
      });
    }

    for (const u of userData) {
      await prisma.user.create({ data: u });
    }

    console.log('Database seeded via Prisma successfully.');
  } catch (error) {
    console.error('Error seeding database via Prisma:', error);
    throw error;
  }
}

// If run directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedData };
