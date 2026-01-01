import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'bekmuhammad.devoloper@gmail.com';
  const username = 'admin';
  const fullName = 'Bekmuhammad';
  const password = '20062601';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      // Update existing user to admin
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'ADMIN',
          fullName,
          email,
          username,
          password: await bcrypt.hash(password, 10),
        },
      });
      console.log('✅ Mavjud foydalanuvchi admin qilindi:');
      console.log(`   ID: ${updated.id}`);
      console.log(`   Email: ${updated.email}`);
      console.log(`   Username: @${updated.username}`);
      console.log(`   Role: ${updated.role}`);
    } else {
      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: {
          email,
          username,
          fullName,
          password: await bcrypt.hash(password, 10),
          role: 'ADMIN',
        },
      });
      console.log('✅ Yangi admin yaratildi:');
      console.log(`   ID: ${newAdmin.id}`);
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Username: @${newAdmin.username}`);
      console.log(`   Ism: ${newAdmin.fullName}`);
      console.log(`   Role: ${newAdmin.role}`);
    }

    console.log('\n🔐 Kirish ma\'lumotlari:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
