const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const password = 'Demo@12345';

const studentNames = [
  ['Aayush', 'Bohara', 'Male'], ['Anisha', 'Joshi', 'Female'], ['Bibek', 'Chand', 'Male'],
  ['Prakriti', 'Bista', 'Female'], ['Rohan', 'Awasthi', 'Male'], ['Sneha', 'Thapa', 'Female'],
  ['Kiran', 'Dhami', 'Male'], ['Nisha', 'Karki', 'Female'], ['Sagar', 'Rawal', 'Male'], ['Isha', 'Panta', 'Female'],
];

async function reset() {
  await prisma.user.deleteMany({ where: { role: { not: 'SUPER_ADMIN' } } });
  await prisma.school.deleteMany(); // tenant relations cascade
  await Promise.all([
    prisma.schoolRequest.deleteMany(), prisma.backup.deleteMany(),
    prisma.notification.deleteMany({ where: { schoolId: null } }),
    prisma.auditLog.deleteMany({ where: { schoolId: null } }),
  ]);
}

async function main() {
  console.log('Resetting tenant data while preserving SUPER_ADMIN...');
  await reset();
  const hash = await bcrypt.hash(password, 10);

  const school = await prisma.school.create({ data: {
    name: 'Morning Glory Secondary School', address: 'Mahendranagar, Kanchanpur, Nepal',
    phone: '+977-99-521000', email: 'info@morningglory.edu.np',
  }});
  const sid = school.id;
  const admin = await prisma.user.create({ data: { name: 'Demo School Admin', email: 'admin@morningglory.edu.np', password: hash, role: 'ADMIN', schoolId: sid } });
  await prisma.academicSession.create({ data: { name: '2082/83', isCurrent: true, startDate: new Date('2025-04-14'), endDate: new Date('2026-04-13'), schoolId: sid } });

  const [academic, administration] = await Promise.all([
    prisma.department.create({ data: { name: 'Academic', schoolId: sid } }),
    prisma.department.create({ data: { name: 'Administration', schoolId: sid } }),
  ]);
  const [teacherDesignation, adminDesignation] = await Promise.all([
    prisma.designation.create({ data: { name: 'Teacher', schoolId: sid } }),
    prisma.designation.create({ data: { name: 'Administrative Staff', schoolId: sid } }),
  ]);
  const [category, house] = await Promise.all([
    prisma.category.create({ data: { name: 'General', schoolId: sid } }),
    prisma.house.create({ data: { name: 'Sagarmatha House', description: 'Student house', schoolId: sid } }),
  ]);
  await prisma.disableReason.create({ data: { reason: 'Transferred to another school', schoolId: sid } });

  const sectionNames = ['A', 'B', 'Science'];
  const classNames = ['Grade 8', 'Grade 9', 'Grade 10'];
  const sections = [];
  const classes = [];
  for (let i = 0; i < 3; i++) {
    const section = await prisma.section.create({ data: { name: sectionNames[i], schoolId: sid } });
    sections.push(section);
    classes.push(await prisma.class.create({ data: { name: classNames[i], schoolId: sid, Section: { connect: { id: section.id } } } }));
  }

  const subjectData = [
    ['English', 'Theory', 'ENG'], ['Mathematics', 'Theory', 'MATH'],
    ['Science', 'Theory + Practical', 'SCI'], ['Social Studies', 'Theory', 'SOC'],
    ['Computer Science', 'Theory + Practical', 'COMP'],
  ];
  const subjects = [];
  for (const [name, type, code] of subjectData) subjects.push(await prisma.subject.create({ data: { name, type, code, schoolId: sid } }));

  const staffData = [
    ['MGS-T001','Aarav','Sharma','Male','1990-05-12','aarav.teacher@morningglory.edu.np','TEACHER',academic.id,teacherDesignation.id],
    ['MGS-T002','Sita','Bhatta','Female','1992-08-21','sita.teacher@morningglory.edu.np','TEACHER',academic.id,teacherDesignation.id],
    ['MGS-T003','Ramesh','Joshi','Male','1988-11-04','ramesh.teacher@morningglory.edu.np','TEACHER',academic.id,teacherDesignation.id],
    ['MGS-S004','Anita','Chand','Female','1991-02-17','accounts@morningglory.edu.np','ACCOUNTANT',administration.id,adminDesignation.id],
    ['MGS-S005','Bikash','Pant','Male','1995-09-09','reception@morningglory.edu.np','RECEPTIONIST',administration.id,adminDesignation.id],
  ];
  const staff = [];
  for (const [staffId, firstName, lastName, gender, dob, email, role, departmentId, designationId] of staffData) {
    const member = await prisma.staff.create({ data: { staffId, firstName, lastName, gender, dob: new Date(dob), email, role, departmentId, designationId, dateOfJoining: new Date('2022-04-15'), schoolId: sid } });
    staff.push(member);
    await prisma.user.create({ data: { name: `${firstName} ${lastName}`, email, password: hash, role, staffId: member.id, schoolId: sid } });
  }
  const teachers = staff.slice(0, 3);

  for (let i = 0; i < 3; i++) {
    await prisma.classTeacher.create({ data: { classId: classes[i].id, sectionId: sections[i].id, staffId: teachers[i].id, schoolId: sid } });
    await prisma.subjectGroup.create({ data: { name: `${classes[i].name} Core`, description: 'Five core subjects', classId: classes[i].id, sectionId: sections[i].id, schoolId: sid, Subject: { connect: subjects.map(({ id }) => ({ id })) } } });
  }

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const group = i < 3 ? 0 : i < 6 ? 1 : 2;
    const [firstName, lastName, gender] = studentNames[i];
    students.push(await prisma.student.create({ data: {
      admissionNo: `MGS-${String(i + 1).padStart(3, '0')}`, rollNumber: String(i - (group === 0 ? 0 : group === 1 ? 3 : 6) + 1),
      firstName, lastName, gender, dob: new Date(2009 + group, (i * 2) % 12, 10 + i), admissionDate: new Date(),
      classId: classes[group].id, sectionId: sections[group].id, categoryId: category.id, houseId: house.id,
      guardianName: `Demo Guardian ${i + 1}`, guardianRelation: 'Father', guardianPhone: `98100000${String(i + 1).padStart(2, '0')}`,
      schoolId: sid, updatedAt: new Date(),
    }}));
  }

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const slots = [['09:00','09:45'],['09:45','10:30'],['10:45','11:30'],['11:30','12:15'],['13:00','13:45']];
  for (let c = 0; c < 3; c++) for (const dayOfWeek of days) for (let p = 0; p < 5; p++) {
    await prisma.timetable.create({ data: { dayOfWeek, startTime: slots[p][0], endTime: slots[p][1], roomNo: `Room-${c + 1}`, classId: classes[c].id, sectionId: sections[c].id, subjectId: subjects[p].id, staffId: teachers[p % 3].id, schoolId: sid } });
  }
  await prisma.studentAttendance.createMany({ data: students.map((x,i) => ({ date: new Date(new Date().setHours(0,0,0,0)), status: i === 4 ? 'Absent' : i === 7 ? 'Late' : 'Present', studentId: x.id, classId: x.classId, sectionId: x.sectionId, schoolId: sid })) });
  await prisma.staffAttendance.createMany({ data: staff.map(x => ({ date: new Date(new Date().setHours(0,0,0,0)), status: 'Present', staffId: x.id, schoolId: sid })) });

  const homework = [];
  for (let i=0;i<3;i++) homework.push(await prisma.homework.create({ data: { title: `${classes[i].name} Weekly Assignment`, description: 'Complete the assigned exercises', dueDate: new Date(Date.now()+7*86400000), classId: classes[i].id, sectionId: sections[i].id, subjectId: subjects[i].id, staffId: teachers[i].id, schoolId: sid } }));
  for (let i=0;i<3;i++) await prisma.homeworkSubmission.create({ data: { homeworkId: homework[i].id, studentId: students[i*3].id, status: 'Checked', marks: 8, remarks: 'Good work', schoolId: sid } });
  for (const student of students) for (let j=0;j<2;j++) await prisma.examMark.create({ data: { examName: 'First Terminal', marks: 65+((students.indexOf(student)*3+j*5)%25), maxMarks: 100, grade: 'B', remarks: 'Seeded result', studentId: student.id, subjectId: subjects[j].id, classId: student.classId, sectionId: student.sectionId, teacherId: teachers[j].id, schoolId: sid } });
  for (let i=0;i<3;i++) await prisma.teacherRating.create({ data: { rating: 5-i%2, comment: 'Excellent teaching', staffId: teachers[i].id, studentId: students[i].id, schoolId: sid } });

  const leaveType = await prisma.leaveType.create({ data: { name: 'Casual Leave', schoolId: sid } });
  await prisma.leaveRequest.create({ data: { applyDate: new Date(), fromDate: new Date(Date.now()+10*86400000), toDate: new Date(Date.now()+11*86400000), reason: 'Family work', leaveTypeId: leaveType.id, staffId: teachers[1].id, schoolId: sid } });
  await prisma.payroll.createMany({ data: staff.map(x => ({ month: 'July', year: 2026, status: 'Generated', netSalary: x.role === 'TEACHER' ? 42000 : 32000, staffId: x.id, schoolId: sid })) });

  const feeGroup = await prisma.feeGroup.create({ data: { name: 'Academic Fees', schoolId: sid } });
  const feeType = await prisma.feeType.create({ data: { name: 'Monthly Tuition', code: 'TUIT', schoolId: sid } });
  await prisma.feeMaster.create({ data: { dueDate: new Date(Date.now()+15*86400000), amount: 2500, fineType: 'Fixed', fixAmount: 100, feeGroupId: feeGroup.id, feeTypeId: feeType.id, schoolId: sid } });
  await prisma.feeDiscount.create({ data: { name: 'Merit Scholarship', code: 'MERIT10', discountType: 'Percentage', percentage: 10, usageLimit: 20, expiryDate: new Date(Date.now()+180*86400000), schoolId: sid } });
  await prisma.feeReminder.create({ data: { isActive: true, reminderType: 'Before Due Date', days: 3, schoolId: sid } });
  for (let i=0;i<3;i++) await prisma.feePayment.create({ data: { receiptNumber: `MGS-REC-00${i+1}`, paymentDate: new Date(), amount: 2500, netAmount: 2500, paymentMethod: 'Cash', studentId: students[i].id, feeGroupId: feeGroup.id, feeTypeId: feeType.id, schoolId: sid } });
  await prisma.offlineBankPayment.create({ data: { requestId: 'BANK-001', paymentDate: new Date(), submitDate: new Date(), amount: 2500, studentId: students[3].id, schoolId: sid } });

  const incomeHead = await prisma.incomeHead.create({ data: { name: 'Donations', schoolId: sid } });
  const expenseHead = await prisma.expenseHead.create({ data: { name: 'Utilities', schoolId: sid } });
  await prisma.income.create({ data: { name: 'Community Donation', invoiceNumber: 'INC-001', date: new Date(), amount: 50000, incomeHeadId: incomeHead.id, schoolId: sid } });
  await prisma.expense.create({ data: { name: 'Electricity Bill', invoiceNumber: 'EXP-001', date: new Date(), amount: 12000, expenseHeadId: expenseHead.id, schoolId: sid } });

  await Promise.all([
    prisma.generalSetting.create({ data: { schoolName: school.name, schoolCode: 'MGSS', address: school.address, city: 'Mahendranagar', state: 'Sudurpashchim', country: 'Nepal', phone: school.phone, email: school.email, currency: 'NPR', currencySymbol: 'Rs.', timezone: 'Asia/Kathmandu', schoolId: sid } }),
    prisma.notificationSetting.create({ data: { schoolId: sid } }), prisma.smsSetting.create({ data: { schoolId: sid } }),
    prisma.emailSetting.create({ data: { fromEmail: 'noreply@morningglory.edu.np', fromName: school.name, schoolId: sid } }),
    prisma.paymentSetting.create({ data: { cashEnabled: true, bankTransferEnabled: true, bankName: 'Global IME Bank', accountNumber: '00123456789', accountName: school.name, schoolId: sid } }),
    prisma.printSetting.create({ data: { headerText: school.name, footerText: 'Generated by Gradex SMS', schoolId: sid } }),
  ]);
  await prisma.systemSetting.createMany({ data: [{ key:'attendance_lock_time',value:'10:30',schoolId:sid },{ key:'default_exam',value:'First Terminal',schoolId:sid }] });

  await Promise.all([
    prisma.event.create({ data: { title: 'Annual Sports Day', description: 'Inter-house sports competition', eventDate: new Date(Date.now()+30*86400000), location: 'School Ground', imageUrls: [], schoolId: sid } }),
    prisma.gallery.create({ data: { title: 'Campus Life', imageUrls: [], category: 'Campus', schoolId: sid } }),
    prisma.news.create({ data: { title: 'New Academic Session Begins', content: 'Welcome to academic session 2082/83.', author: 'School Administration', imageUrls: [], schoolId: sid } }),
    prisma.mediaFile.create({ data: { fileName: 'academic-calendar.pdf', fileUrl: 'https://example.com/academic-calendar.pdf', fileType: 'document', schoolId: sid } }),
    prisma.cmsPage.create({ data: { title: 'About Our School', slug: 'about-us', content: 'Quality education in Kanchanpur.', schoolId: sid } }),
    prisma.bannerImage.create({ data: { title: 'Admissions Open', imageUrls: [], linkUrl: '/admissions', schoolId: sid } }),
    prisma.certificateTemplate.create({ data: { name: 'Character Certificate', bodyText: 'This is to certify that [student_name] studied at Morning Glory.', studentPhoto: true, schoolId: sid } }),
    prisma.idCardTemplate.create({ data: { title: 'Student ID Card', schoolName: school.name, schoolAddress: school.address, showRollNo: true, schoolId: sid } }),
  ]);
  await prisma.menu.createMany({ data: [{title:'Home',url:'/',order:1,schoolId:sid},{title:'About',url:'/about-us',order:2,schoolId:sid}] });
  await prisma.notification.create({ data: { title: 'Demo school ready', message: 'All demo modules have been seeded.', type: 'success', userId: admin.id, schoolId: sid } });
  await prisma.schoolRequest.create({ data: { schoolName:'Farwest Model School',schoolCode:'FWMS',contactName:'Demo Contact',contactEmail:'contact@farwest.demo',contactPhone:'9800000099',status:'Pending' } });
  await prisma.backup.create({ data: { filename:'demo-backup-placeholder.sql',filePath:'/backups/demo-backup-placeholder.sql',fileSize:0 } });
  await prisma.auditLog.create({ data: { userId:admin.id,userEmail:admin.email,action:'SEED',resource:'DATABASE',details:{students:10,staff:5,classes:3},schoolId:sid } });

  console.log('Complete demo seed created. Password for demo accounts:', password);
}

main().catch(e => { console.error(e); process.exitCode=1; }).finally(async()=>{ await prisma.$disconnect(); await pool.end(); });
