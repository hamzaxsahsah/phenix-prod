import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();

// Create a delivery man (protected: only SUPER_ADMIN)
router.post('/', authenticate, requireRole('SUPER_ADMIN'), async (req: any, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, role: 'DELIVERY_MAN' } as any });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

// List delivery men (open)
router.get('/', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ where: { role: 'DELIVERY_MAN' } as any, select: { id: true, email: true, role: true } });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});

export default router;
