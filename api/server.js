import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import projectRoutes from './routes/projectRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';
import erpCrmRoutes from './routes/erpCrmRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Bulletproof dynamic multi-path resolution for React Vite build directory
const possibleDistPaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), '../dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, './dist'),
  '/app/dist',
  '/app/api/dist'
];

const distPath = fs.existsSync(path.resolve(process.cwd(), 'dist/index.html'))
  ? path.resolve(process.cwd(), 'dist')
  : (possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || possibleDistPaths[0]);

app.use(express.static(distPath));

// Wildcard catch-all for single-page client routing (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`Helios API Server is live on Railway, but index.html was not found. Looked in: ${possibleDistPaths.join(', ')}`);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node Express Server running on port ${PORT}. Serving static assets from: ${distPath}`);
});
