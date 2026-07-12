const { z } = require('zod');

const takeAttendance = {
    body: z.object({
        date: z.string().min(1, "Date is required"),
        classId: z.string().uuid("Invalid Class ID"),
        sectionId: z.string().uuid("Invalid Section ID"),
        attendances: z.array(
            z.object({
                studentId: z.string().uuid("Invalid Student ID"),
                status: z.enum(['Present', 'Absent', 'Late', 'HalfDay']),
                note: z.string().optional().nullable()
            })
        ).min(1, "Attendance records cannot be empty")
    }).strict()
};

const createHomework = {
    body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        dueDate: z.string().min(1, "Due date is required"),
        classId: z.string().uuid("Invalid Class ID"),
        sectionId: z.string().uuid("Invalid Section ID"),
        subjectId: z.string().uuid("Invalid Subject ID"),
        attachmentUrl: z.string().optional().nullable()
    }).strict()
};

const updateHomework = {
    body: createHomework.body.partial()
};

const gradeSubmission = {
    body: z.object({
        marks: z.union([z.number(), z.string()]).optional().nullable(),
        remarks: z.string().optional().nullable()
    }).strict()
};

const enterMarks = {
    body: z.object({
        examName: z.string().min(1, "Exam name is required"),
        subjectId: z.string().uuid("Invalid Subject ID"),
        classId: z.string().uuid("Invalid Class ID"),
        sectionId: z.string().uuid("Invalid Section ID"),
        marks: z.array(
            z.object({
                studentId: z.string().uuid("Invalid Student ID"),
                marks: z.union([z.number(), z.string()]).optional().nullable(),
                maxMarks: z.union([z.number(), z.string()]).optional().nullable(),
                grade: z.string().optional().nullable(),
                remarks: z.string().optional().nullable()
            })
        ).min(1, "Marks records cannot be empty")
    }).strict()
};

module.exports = {
    takeAttendance,
    createHomework,
    updateHomework,
    gradeSubmission,
    enterMarks
};
