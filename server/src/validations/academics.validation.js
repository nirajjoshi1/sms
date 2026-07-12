const { z } = require('zod');

const promoteStudents = {
    body: z.object({
        fromClassId: z.string().uuid("Invalid Class ID").optional().nullable(),
        fromSectionId: z.string().uuid("Invalid Section ID").optional().nullable(),
        toClassId: z.string().uuid("Invalid Class ID"),
        toSectionId: z.string().uuid("Invalid Section ID"),
        studentIds: z.array(z.string().uuid("Invalid Student ID")).min(1, "At least one student must be selected")
    }).strict()
};

const createClass = {
    body: z.object({
        name: z.string().min(1, "Class name is required"),
        sectionIds: z.array(z.string().uuid("Invalid Section ID")).optional().default([])
    }).strict()
};

const createSection = {
    body: z.object({
        name: z.string().min(1, "Section name is required")
    }).strict()
};

const createSubject = {
    body: z.object({
        name: z.string().min(1, "Subject name is required"),
        type: z.enum(['Theory', 'Practical']),
        code: z.string().optional().nullable()
    }).strict()
};

const createSubjectGroup = {
    body: z.object({
        name: z.string().min(1, "Group name is required"),
        classId: z.string().uuid("Invalid Class ID"),
        sectionId: z.string().uuid("Invalid Section ID"),
        subjectIds: z.array(z.string().uuid("Invalid Subject ID")).min(1, "At least one subject must be selected"),
        description: z.string().optional().nullable()
    }).strict()
};

const assignClassTeacher = {
    body: z.object({
        classId: z.string().uuid("Invalid Class ID"),
        sectionId: z.string().uuid("Invalid Section ID"),
        staffId: z.string().uuid("Invalid Staff ID")
    }).strict()
};

const createTimetable = {
    body: z.object({
        classId: z.string().uuid("Invalid Class ID"),
        sectionId: z.string().uuid("Invalid Section ID"),
        subjectId: z.string().uuid("Invalid Subject ID"),
        staffId: z.string().uuid("Invalid Staff ID"),
        dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
        roomNo: z.string().optional().nullable()
    }).strict()
};

module.exports = {
    promoteStudents,
    createClass,
    createSection,
    createSubject,
    createSubjectGroup,
    assignClassTeacher,
    createTimetable
};
