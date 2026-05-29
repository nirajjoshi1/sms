const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seeding...');

    // ==========================================
    // Seed Super Admin
    // ==========================================
    const existingAdmin = await prisma.user.findUnique({
        where: { email: 'infocodewithniraj@gmail.com' }
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        const superAdmin = await prisma.user.create({
            data: {
                name: 'Niraj (Super Admin)',
                email: 'infocodewithniraj@gmail.com',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                isActive: true
            }
        });
        console.log(`✅ Super Admin created: ${superAdmin.email}`);
    } else {
        console.log(`⚠️  Super Admin already exists: ${existingAdmin.email}`);
    }

    // ==========================================
    // Seed Default Academic Session
    // ==========================================
    const existingSession = await prisma.academicSession.findFirst({
        where: { name: '2025-26' }
    });

    if (!existingSession) {
        await prisma.academicSession.create({
            data: {
                name: '2025-26',
                isCurrent: true,
                startDate: new Date('2025-04-01'),
                endDate: new Date('2026-03-31')
            }
        });
        console.log('✅ Default Academic Session created: 2025-26');
    } else {
        console.log('⚠️  Academic Session already exists: 2025-26');
    }

    // ==========================================
    // Seed Default Fee Reminder Settings
    // ==========================================
    const reminderCount = await prisma.feeReminder.count();
    if (reminderCount === 0) {
        await prisma.feeReminder.createMany({
            data: [
                { isActive: true,  reminderType: 'Before', days: 2 },
                { isActive: false, reminderType: 'Before', days: 5 },
                { isActive: false, reminderType: 'After',  days: 2 },
                { isActive: false, reminderType: 'After',  days: 5 }
            ]
        });
        console.log('✅ Default Fee Reminders seeded');
    } else {
        console.log('⚠️  Fee Reminders already exist');
    }

    console.log('\n🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
