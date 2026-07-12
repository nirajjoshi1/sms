import { describe, it, expect, vi } from 'vitest';
import { validateIdParam } from '../middleware/validation';
import { ROLE_PERMISSIONS, PERMISSIONS } from '../config/permissions';
import studentValidation from '../validations/student.validation';
import feesValidation from '../validations/fees.validation';
import academicsValidation from '../validations/academics.validation';

describe('UUID validateIdParam middleware validations', () => {
    it('Next should be called for valid UUID', () => {
        const req = { params: { id: '123e4567-e89b-12d3-a456-426614174000' } };
        const res = {};
        const next = vi.fn();

        validateIdParam('id')(req, res, next);
        expect(next).toHaveBeenCalledOnce();
        expect(next.mock.calls[0][0]).toBeUndefined(); // no error
    });

    it('An error should be passed for invalid UUID', () => {
        const req = { params: { id: 'invalid-uuid-format' } };
        const res = {};
        const next = vi.fn();

        validateIdParam('id')(req, res, next);
        expect(next).toHaveBeenCalledOnce();
        expect(next.mock.calls[0][0]).toBeDefined();
        expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
});

describe('RBAC Permissions Matrices Mappings', () => {
    it('ADMIN should have expected permissions', () => {
        const adminPerms = ROLE_PERMISSIONS['ADMIN'];
        expect(adminPerms).toContain(PERMISSIONS.STUDENTS_CREATE);
        expect(adminPerms).toContain(PERMISSIONS.FEES_COLLECT);
    });

    it('RECEPTIONIST should have expected permissions', () => {
        const receptionistPerms = ROLE_PERMISSIONS['RECEPTIONIST'];
        expect(receptionistPerms).toContain(PERMISSIONS.FEES_COLLECT);
        expect(receptionistPerms).not.toContain(PERMISSIONS.BACKUPS_MANAGE);
    });

    it('ACCOUNTANT should have expected permissions', () => {
        const accountantPerms = ROLE_PERMISSIONS['ACCOUNTANT'];
        expect(accountantPerms).toContain(PERMISSIONS.FEES_COLLECT);
        expect(accountantPerms).not.toContain(PERMISSIONS.STUDENTS_CREATE);
    });
});

describe('Zod Student Admission Input Schema Checks', () => {
    const validData = {
        firstName: 'John',
        gender: 'Male',
        dob: '2015-05-15',
        classId: '123e4567-e89b-12d3-a456-426614174000',
        sectionId: '123e4567-e89b-12d3-a456-426614174000',
        guardianName: 'Bob Smith',
        guardianPhone: '1234567890'
    };

    it('Should validate valid admission payload', () => {
        const parseResult = studentValidation.admitStudent.body.safeParse(validData);
        expect(parseResult.success).toBe(true);
    });

    it('Should fail validation when guardianName is missing', () => {
        const invalidData = { ...validData };
        delete invalidData.guardianName;
        const parseResult = studentValidation.admitStudent.body.safeParse(invalidData);
        expect(parseResult.success).toBe(false);
    });
});

describe('Zod Fee Collection Input Schema Checks', () => {
    const validPayment = {
        studentId: '123e4567-e89b-12d3-a456-426614174000',
        feeGroupId: '123e4567-e89b-12d3-a456-426614174000',
        feeTypeId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 150.50,
        paymentMethod: 'Cash'
    };

    it('Should validate valid fee payment payload', () => {
        const parseResult = feesValidation.collectFee.body.safeParse(validPayment);
        expect(parseResult.success).toBe(true);
    });

    it('Should fail validation on negative fee amount', () => {
        const invalidPayment = { ...validPayment, amount: -50 };
        const parseResult = feesValidation.collectFee.body.safeParse(invalidPayment);
        expect(parseResult.success).toBe(false);
    });
});

describe('Zod Student Promotion Schema Checks', () => {
    const validPromotion = {
        toClassId: '123e4567-e89b-12d3-a456-426614174000',
        toSectionId: '123e4567-e89b-12d3-a456-426614174000',
        studentIds: ['123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440000']
    };

    it('Should validate valid promotion payload', () => {
        const parseResult = academicsValidation.promoteStudents.body.safeParse(validPromotion);
        expect(parseResult.success).toBe(true);
    });

    it('Should fail validation on empty studentIds list', () => {
        const invalidPromotion = { ...validPromotion, studentIds: [] };
        const parseResult = academicsValidation.promoteStudents.body.safeParse(invalidPromotion);
        expect(parseResult.success).toBe(false);
    });
});
