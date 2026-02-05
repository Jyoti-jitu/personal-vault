import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import personalInfoRoutes from './routes/personalInfoRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow env var for production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
    next();
});

// Routes
app.use('/', authRoutes); // /register, /login, /me
app.use('/cards', cardRoutes);
app.use('/albums', albumRoutes);
app.use('/images', imageRoutes);
app.use('/document-folders', folderRoutes);
app.use('/documents', documentRoutes);
app.use('/personal-information', personalInfoRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Personal Vault API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
