import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import ticketRoutes from './routes/ticketRoutes';
import aiRoutes from './routes/aiRoutes';
import { verifyToken } from './middleware/auth';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://aether-desk-6m30up6r0-anikets-projects-7989eb9b.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tickets', verifyToken, ticketRoutes);
app.use('/ai', verifyToken, aiRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));