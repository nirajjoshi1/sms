const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database reset and seeding...');

    // Delete in dependency order
    const deleteOrder = [
        'examMark',
        'homeworkSubmission',
        'homework',
        'studentAttendance',
        'notification',
        'timetable',
        'teacherRating',
        'subjectGroup',
        'student',
        'staffAttendance',
        'payroll',
        'offlineBankPayment',
        'leaveRequest',
        'income',
        'expense',
        'classTeacher',
        'subject',
        'class',
        'section',
        'staff',
        'user',
        'systemSetting',
        'smsSetting',
        'emailSetting',
        'paymentSetting',
        'printSetting',
        'notificationSetting',
        'generalSetting',
        'feePayment',
        'feeMaster',
        'feeGroup',
        'feeType',
        'feeDiscount',
        'incomeHead',
        'expenseHead',
        'disableReason',
        'designation',
        'department',
        'cmsPage',
        'certificateTemplate',
        'idCardTemplate',
        'category',
        'house',
        'academicSession',
        'event',
        'gallery',
        'news',
        'menu',
        'bannerImage',
        'mediaFile',
        'leaveType',
        'backup',
        'school'
    ];

    for (const model of deleteOrder) {
        try {
            if (prisma[model]) {
                await prisma[model].deleteMany();
                console.log(`🧹 Cleared all records from: ${model}`);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to clear ${model}:`, error.message);
        }
    }

    console.log('✅ Database dropped successfully! Seeding new multi-tenant data...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // ==========================================
    // 1. Seed Super Admin
    // ==========================================
    const superAdmin = await prisma.user.create({
        data: {
            name: 'Super Admin',
            email: 'infocodewithniraj@gmail.com',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true
        }
    });
    console.log(`👑 Super Admin created: ${superAdmin.email}`);

    // ==========================================
    // 2. School 1: Horizon International School
    // ==========================================
    const school1 = await prisma.school.create({
        data: {
            name: 'Horizon International School',
            address: 'New York, USA',
            phone: '+1-555-0199',
            email: 'info@horizon.edu'
        }
    });
    console.log(`🏫 School 1 created: ${school1.name}`);

    // Admin user for School 1
    const admin1 = await prisma.user.create({
        data: {
            name: 'Horizon Admin',
            email: 'horizon.admin@school.com',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            schoolId: school1.id
        }
    });
    console.log(`👤 School 1 Admin created: ${admin1.email}`);

    // Academic session for School 1
    const session1 = await prisma.academicSession.create({
        data: {
            name: '2025-2026',
            isCurrent: true,
            startDate: new Date('2025-08-01'),
            endDate: new Date('2026-06-30'),
            schoolId: school1.id
        }
    });

    // Default settings for School 1
    await prisma.generalSetting.create({
        data: {
            schoolName: school1.name,
            schoolCode: 'HORIZON',
            address: school1.address,
            phone: school1.phone,
            email: school1.email,
            currency: 'USD',
            currencySymbol: '$',
            schoolId: school1.id
        }
    });

    await prisma.notificationSetting.create({
        data: {
            emailNotifications: true,
            schoolId: school1.id
        }
    });

    await prisma.paymentSetting.create({
        data: {
            cashEnabled: true,
            bankTransferEnabled: true,
            schoolId: school1.id
        }
    });

    // Class & Section for School 1
    const sec1 = await prisma.section.create({
        data: {
            name: 'A',
            schoolId: school1.id
        }
    });

    const cls1 = await prisma.class.create({
        data: {
            name: 'Grade 10',
            schoolId: school1.id,
            Section: { connect: { id: sec1.id } }
        }
    });

    // Subjects for School 1
    const subMath1 = await prisma.subject.create({
        data: {
            name: 'Algebra',
            type: 'Theory',
            code: 'MATH-101',
            schoolId: school1.id
        }
    });

    const subSci1 = await prisma.subject.create({
        data: {
            name: 'Physics',
            type: 'Theory',
            code: 'PHYS-101',
            schoolId: school1.id
        }
    });

    // Teacher for School 1
    const teacher1 = await prisma.staff.create({
        data: {
            staffId: 'HOR-T01',
            firstName: 'John',
            lastName: 'Doe',
            gender: 'Male',
            dob: new Date('1980-04-12'),
            email: 'john.doe@horizon.edu',
            role: 'TEACHER',
            dateOfJoining: new Date('2022-09-01'),
            schoolId: school1.id
        }
    });

    await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john.doe@horizon.edu',
            password: hashedPassword,
            role: 'TEACHER',
            isActive: true,
            staffId: teacher1.id,
            schoolId: school1.id
        }
    });

    // Class Teacher Assignment for School 1
    await prisma.classTeacher.create({
        data: {
            classId: cls1.id,
            sectionId: sec1.id,
            staffId: teacher1.id,
            schoolId: school1.id
        }
    });

    // Students for School 1
    const student1A = await prisma.student.create({
        data: {
            admissionNo: 'HOR-S001',
            rollNumber: '1',
            firstName: 'Alice',
            lastName: 'Vance',
            gender: 'Female',
            dob: new Date('2011-03-15'),
            guardianName: 'Robert Vance',
            guardianPhone: '555-0100',
            classId: cls1.id,
            sectionId: sec1.id,
            schoolId: school1.id,
            updatedAt: new Date()
        }
    });

    const student1B = await prisma.student.create({
        data: {
            admissionNo: 'HOR-S002',
            rollNumber: '2',
            firstName: 'Bob',
            lastName: 'Miller',
            gender: 'Male',
            dob: new Date('2010-12-05'),
            guardianName: 'Gary Miller',
            guardianPhone: '555-0101',
            classId: cls1.id,
            sectionId: sec1.id,
            schoolId: school1.id,
            updatedAt: new Date()
        }
    });

    // Attendance logs for School 1
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.studentAttendance.createMany({
        data: [
            { date: today, status: 'Present', studentId: student1A.id, classId: cls1.id, sectionId: sec1.id, schoolId: school1.id },
            { date: today, status: 'Absent', studentId: student1B.id, classId: cls1.id, sectionId: sec1.id, schoolId: school1.id }
        ]
    });

    // Exam marks for School 1
    await prisma.examMark.createMany({
        data: [
            { examName: 'Midterm', marks: 88, maxMarks: 100, studentId: student1A.id, subjectId: subMath1.id, classId: cls1.id, sectionId: sec1.id, teacherId: teacher1.id, schoolId: school1.id },
            { examName: 'Midterm', marks: 74, maxMarks: 100, studentId: student1B.id, subjectId: subMath1.id, classId: cls1.id, sectionId: sec1.id, teacherId: teacher1.id, schoolId: school1.id }
        ]
    });

    // Fee Groups & Payments for School 1
    const fg1 = await prisma.feeGroup.create({
        data: { name: 'Tuition Fee Group', schoolId: school1.id }
    });
    const ft1 = await prisma.feeType.create({
        data: { name: 'Monthly Tuition', code: 'TUIT', schoolId: school1.id }
    });
    await prisma.feePayment.create({
        data: {
            receiptNumber: 'REC-HOR-001',
            paymentDate: new Date(),
            amount: 250,
            netAmount: 250,
            paymentMethod: 'Cash',
            studentId: student1A.id,
            feeGroupId: fg1.id,
            feeTypeId: ft1.id,
            schoolId: school1.id
        }
    });

    // Notifications for School 1
    await prisma.notification.create({
        data: {
            title: 'Welcome to Horizon School!',
            message: 'Your Horizon dashboard is set up.',
            type: 'info',
            schoolId: school1.id
        }
    });

    console.log('✅ School 1 seeded successfully!');

    // ==========================================
    // 3. School 2: Summit Academy
    // ==========================================
    const school2 = await prisma.school.create({
        data: {
            name: 'Summit Academy',
            address: 'London, UK',
            phone: '+44-20-7946-0958',
            email: 'info@summitacademy.org'
        }
    });
    console.log(`🏫 School 2 created: ${school2.name}`);

    // Admin user for School 2
    const admin2 = await prisma.user.create({
        data: {
            name: 'Summit Admin',
            email: 'summit.admin@school.com',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
            schoolId: school2.id
        }
    });
    console.log(`👤 School 2 Admin created: ${admin2.email}`);

    // Academic session for School 2
    const session2 = await prisma.academicSession.create({
        data: {
            name: '2025-2026',
            isCurrent: true,
            startDate: new Date('2025-09-01'),
            endDate: new Date('2026-07-15'),
            schoolId: school2.id
        }
    });

    // Default settings for School 2
    await prisma.generalSetting.create({
        data: {
            schoolName: school2.name,
            schoolCode: 'SUMMIT',
            address: school2.address,
            phone: school2.phone,
            email: school2.email,
            currency: 'GBP',
            currencySymbol: '£',
            schoolId: school2.id
        }
    });

    await prisma.notificationSetting.create({
        data: {
            emailNotifications: true,
            schoolId: school2.id
        }
    });

    await prisma.paymentSetting.create({
        data: {
            cashEnabled: true,
            bankTransferEnabled: true,
            schoolId: school2.id
        }
    });

    // Class & Section for School 2
    const sec2 = await prisma.section.create({
        data: {
            name: 'Science',
            schoolId: school2.id
        }
    });

    const cls2 = await prisma.class.create({
        data: {
            name: 'Class XI',
            schoolId: school2.id,
            Section: { connect: { id: sec2.id } }
        }
    });

    // Subjects for School 2
    const subMath2 = await prisma.subject.create({
        data: {
            name: 'Calculus',
            type: 'Theory',
            code: 'CALC-201',
            schoolId: school2.id
        }
    });

    const subSci2 = await prisma.subject.create({
        data: {
            name: 'Chemistry',
            type: 'Practical',
            code: 'CHEM-201',
            schoolId: school2.id
        }
    });

    // Teacher for School 2
    const teacher2 = await prisma.staff.create({
        data: {
            staffId: 'SUM-T01',
            firstName: 'Sarah',
            lastName: 'Connor',
            gender: 'Female',
            dob: new Date('1985-11-23'),
            email: 'sarah.connor@summit.org',
            role: 'TEACHER',
            dateOfJoining: new Date('2023-01-10'),
            schoolId: school2.id
        }
    });

    await prisma.user.create({
        data: {
            name: 'Sarah Connor',
            email: 'sarah.connor@summit.org',
            password: hashedPassword,
            role: 'TEACHER',
            isActive: true,
            staffId: teacher2.id,
            schoolId: school2.id
        }
    });

    // Class Teacher Assignment for School 2
    await prisma.classTeacher.create({
        data: {
            classId: cls2.id,
            sectionId: sec2.id,
            staffId: teacher2.id,
            schoolId: school2.id
        }
    });

    // Students for School 2
    const student2A = await prisma.student.create({
        data: {
            admissionNo: 'SUM-S001',
            rollNumber: '101',
            firstName: 'Charlie',
            lastName: 'Brown',
            gender: 'Male',
            dob: new Date('2009-10-30'),
            guardianName: 'Sally Brown',
            guardianPhone: '555-0200',
            classId: cls2.id,
            sectionId: sec2.id,
            schoolId: school2.id,
            updatedAt: new Date()
        }
    });

    const student2B = await prisma.student.create({
        data: {
            admissionNo: 'SUM-S002',
            rollNumber: '102',
            firstName: 'Diana',
            lastName: 'Prince',
            gender: 'Female',
            dob: new Date('2009-08-21'),
            guardianName: 'Hippolyta Prince',
            guardianPhone: '555-0201',
            classId: cls2.id,
            sectionId: sec2.id,
            schoolId: school2.id,
            updatedAt: new Date()
        }
    });

    // Attendance logs for School 2
    await prisma.studentAttendance.createMany({
        data: [
            { date: today, status: 'Present', studentId: student2A.id, classId: cls2.id, sectionId: sec2.id, schoolId: school2.id },
            { date: today, status: 'Present', studentId: student2B.id, classId: cls2.id, sectionId: sec2.id, schoolId: school2.id }
        ]
    });

    // Exam marks for School 2
    await prisma.examMark.createMany({
        data: [
            { examName: 'Midterm', marks: 95, maxMarks: 100, studentId: student2A.id, subjectId: subMath2.id, classId: cls2.id, sectionId: sec2.id, teacherId: teacher2.id, schoolId: school2.id },
            { examName: 'Midterm', marks: 99, maxMarks: 100, studentId: student2B.id, subjectId: subMath2.id, classId: cls2.id, sectionId: sec2.id, teacherId: teacher2.id, schoolId: school2.id }
        ]
    });

    // Fee Groups & Payments for School 2
    const fg2 = await prisma.feeGroup.create({
        data: { name: 'Academy Fees Group', schoolId: school2.id }
    });
    const ft2 = await prisma.feeType.create({
        data: { name: 'Tuition Fee Type', code: 'ACAD', schoolId: school2.id }
    });
    await prisma.feePayment.create({
        data: {
            receiptNumber: 'REC-SUM-001',
            paymentDate: new Date(),
            amount: 500,
            netAmount: 500,
            paymentMethod: 'Bank Transfer',
            studentId: student2A.id,
            feeGroupId: fg2.id,
            feeTypeId: ft2.id,
            schoolId: school2.id
        }
    });

    // Notifications for School 2
    await prisma.notification.create({
        data: {
            title: 'Welcome to Summit Academy!',
            message: 'Your Summit dashboard is ready.',
            type: 'info',
            schoolId: school2.id
        }
    });

    console.log('✅ School 2 seeded successfully!');
    console.log('\n🎉 DB Seeded successfully! All schools fully isolated and configured with distinct test data.');
}

main()
    .catch((e) => {
        console.error('❌ Database Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
