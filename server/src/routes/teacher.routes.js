const express = require('express');
const router = express.Router();
const tc = require('../controllers/teacher.controller');
const { authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');

router.use(requireSchoolContext);
router.use(authorizeRoles('TEACHER'));

// Profile & Dashboard
router.get('/profile', tc.getMyProfile);
router.get('/dashboard', tc.getDashboardStats);
router.get('/schedule', tc.getMySchedule);
router.get('/classes', tc.getMyClasses);
router.get('/students', tc.getStudents);

// Attendance
router.post('/attendance', tc.takeAttendance);
router.get('/attendance', tc.getAttendance);
router.get('/attendance/report', tc.getAttendanceReport);

// Homework
router.get('/homework', tc.getHomework);
router.post('/homework', tc.createHomework);
router.put('/homework/:id', tc.updateHomework);
router.delete('/homework/:id', tc.deleteHomework);
router.get('/homework/:id/submissions', tc.getHomeworkSubmissions);
router.put('/homework/submissions/:id/grade', tc.gradeSubmission);

// Exam Marks
router.post('/marks', tc.enterMarks);
router.get('/marks', tc.getMarks);

// Class Teacher Exclusive
router.get('/class-overview', tc.getClassOverview);

module.exports = router;
