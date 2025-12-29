import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

dotenv.config();

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin already exists:', adminEmail);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const user = await prisma.user.create({ data: { email: adminEmail, passwordHash, role: 'SUPER_ADMIN' } as any });
  console.log('Created admin user:', user.email);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
