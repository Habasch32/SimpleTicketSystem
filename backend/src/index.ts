import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { initDb } from './db';
import authRoutes from './routes/auth';
import ticketRoutes from './routes/tickets';
import commentRoutes from './routes/comments';
import labelRoutes from './routes/labels';
import userRoutes from './routes/users';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

initDb();

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets', commentRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/users', userRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
