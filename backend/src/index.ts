import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRouter from './routes/auth';
import deliveriesRouter from './routes/deliveries';
import deliverymenRouter from './routes/deliverymen';
import prisma from './prisma';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Use FRONTEND_URL or ALLOWED_ORIGINS (comma-separated) to restrict CORS in production
const allowedEnv = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '*';
const allowedList = typeof allowedEnv === 'string' ? allowedEnv.split(',').map(s => s.trim()).filter(Boolean) : ['*'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // allow all
    if (allowedList.length === 1 && allowedList[0] === '*') return callback(null, true);
    if (allowedList.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(bodyParser.json());

app.use('/auth', authRouter);
app.use('/deliveries', deliveriesRouter);
app.use('/deliverymen', deliverymenRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const server = app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
