import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import projectRoutes from './routes/projectRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';
import erpCrmRoutes from './routes/erpCrmRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6001;

app.use(cors());
app.use(express.json());

// API route registrations
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/erp-crm', erpCrmRoutes);

// Serves built client in production
const distPath = '/home/cis/industry-project-demo/dist';
app.use(express.static(distPath));

// Wildcard catch-all for single-page routing
app.use((req, res) => {
  res.sendFile(distPath + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Node Express Server running on port ${PORT}`);
});
