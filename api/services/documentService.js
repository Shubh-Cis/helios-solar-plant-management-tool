import prisma from '../prisma.js';

export async function createDocument({ projectId, name, type, comments }) {
  // Generate simulated OCR text
  const ocrText = `SIMULATED OCR SCAN OF UPLOADED DOCUMENT: ${name}. 
Document Type: ${type}.
Project Reference ID: PRJ-${projectId}. 
Upload Timestamp: ${new Date().toISOString()}.
This document outlines project parameter details. Under section 3.2, all electrical and mechanical specifications have been verified against Central Electricity Authority (CEA) of India Grid Code version 5.0. All equipment warranties are secured for 10 years including module performance guarantees of 25 years. The field engineering leads have marked this as compliant. Awaiting final corporate signatory approval.`;

  const document = await prisma.document.create({
    data: {
      projectId: parseInt(projectId),
      name: name.endsWith('.pdf') ? name : `${name}.pdf`,
      type,
      comments: comments || 'Uploaded for review',
      status: 'Under Review',
      ocrText,
      filePath: `/uploads/mock_${Date.now()}_${name}`,
    },
  });

  return document;
}

export async function updateDocumentStatus(id, { status, comments }) {
  const currentDoc = await prisma.document.findUnique({
    where: { id },
  });

  if (!currentDoc) return null;

  // Bump minor version (v1.0 -> v1.1)
  const currentVersion = currentDoc.version;
  const parts = currentVersion.replace('v', '').split('.');
  const nextMinor = parseInt(parts[1] || 0) + 1;
  const nextVersion = `v${parts[0]}.${nextMinor}`;

  const updatedDoc = await prisma.document.update({
    where: { id },
    data: {
      status,
      comments: comments || '',
      version: nextVersion,
    },
  });

  return updatedDoc;
}
