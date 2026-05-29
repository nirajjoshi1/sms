require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing database connection...');
    const count = await prisma.student.count();
    console.log('✅ Total students in database:', count);

    if (count > 0) {
      const students = await prisma.student.findMany({ take: 1 });
      console.log('\n📋 Sample student fields:', Object.keys(students[0]));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
