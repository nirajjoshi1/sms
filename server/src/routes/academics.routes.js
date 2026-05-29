const express = require('express');
const router = express.Router();
const academicsController = require('../controllers/academics.controller');
const { verifyJWT, authorizeRoles } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyJWT);

// Class routes
router.route('/classes')
    .get(academicsController.getClasses)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.createClass);

router.route('/classes/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.updateClass)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteClass);

// Section routes
router.route('/sections')
    .get(academicsController.getSections)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.createSection);

router.route('/sections/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.updateSection)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteSection);

// Subject routes
router.route('/subjects')
    .get(academicsController.getSubjects)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), academicsController.createSubject);

router.route('/subjects/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.updateSubject)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteSubject);

// Subject Group routes
router.route('/subject-groups')
    .get(academicsController.getSubjectGroups)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.createSubjectGroup);

router.route('/subject-groups/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.updateSubjectGroup)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteSubjectGroup);

// Class Teacher routes
router.route('/class-teachers')
    .get(academicsController.getClassTeachers)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.assignClassTeacher);

router.route('/class-teachers/:id')
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.removeClassTeacher);

// Timetable routes
router.route('/timetable')
    .get(academicsController.getTimetables)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.createTimetable);

router.route('/timetable/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.updateTimetable)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), academicsController.deleteTimetable);

// Student Promotion
router.post('/promote-students',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    academicsController.promoteStudents);

module.exports = router;
