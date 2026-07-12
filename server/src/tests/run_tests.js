const assert = require('assert');

const { validateIdParam } = require('../middleware/validation');
const { ROLE_PERMISSIONS, PERMISSIONS } = require('../config/permissions');
const studentValidation = require('../validations/student.validation');
const feesValidation = require('../validations/fees.validation');
const academicsValidation = require('../validations/academics.validation');

console.log("🚀 Starting Automated Test Suite...");

// Helpers
const runTest = (name, fn) => {
    try {
        fn();
        console.log(`✅ Passed: ${name}`);
    } catch (err) {
        console.error(`❌ Failed: ${name}`);
        console.error(err);
        process.exit(1);
    }
};

// -------------------------------------------------------------
// Test 1: UUID Validation Middleware (validateIdParam)
// -------------------------------------------------------------
runTest("UUID validateIdParam middleware validations", () => {
    // Mock req, res, next
    let nextCalled = false;
    let errorPassed = null;
    const req = { params: { id: "123e4567-e89b-12d3-a456-426614174000" } };
    const res = {};
    const next = (err) => {
        nextCalled = true;
        errorPassed = err;
    };

    validateIdParam('id')(req, res, next);
    assert.strictEqual(nextCalled, true, "Next should be called for valid UUID");
    assert.strictEqual(errorPassed, undefined, "No error should be passed for valid UUID");

    // Invalid UUID test
    let nextCalledInvalid = false;
    let errorPassedInvalid = null;
    const reqInvalid = { params: { id: "invalid-uuid-format" } };
    const nextInvalid = (err) => {
        nextCalledInvalid = true;
        errorPassedInvalid = err;
    };

    validateIdParam('id')(reqInvalid, res, nextInvalid);
    assert.strictEqual(nextCalledInvalid, true, "Next should be called for invalid UUID");
    assert.ok(errorPassedInvalid, "An error should be passed for invalid UUID");
    assert.strictEqual(errorPassedInvalid.statusCode, 400, "Should return 400 status for invalid UUID");
});

// -------------------------------------------------------------
// Test 2: RBAC Matrix Mappings
// -------------------------------------------------------------
runTest("RBAC Permissions Matrices Mappings", () => {
    const adminPerms = ROLE_PERMISSIONS['ADMIN'];
    assert.ok(adminPerms.includes(PERMISSIONS.STUDENT_CREATE), "ADMIN should have STUDENT_CREATE permission");
    assert.ok(adminPerms.includes(PERMISSIONS.FEE_COLLECT), "ADMIN should have FEE_COLLECT permission");

    const receptionistPerms = ROLE_PERMISSIONS['RECEPTIONIST'];
    assert.ok(receptionistPerms.includes(PERMISSIONS.FEE_COLLECT), "RECEPTIONIST should have FEE_COLLECT permission");
    assert.strictEqual(receptionistPerms.includes(PERMISSIONS.BACKUP_MANAGE), false, "RECEPTIONIST should NOT have BACKUP_MANAGE permission");

    const accountantPerms = ROLE_PERMISSIONS['ACCOUNTANT'];
    assert.ok(accountantPerms.includes(PERMISSIONS.FEE_COLLECT), "ACCOUNTANT should have FEE_COLLECT");
    assert.strictEqual(accountantPerms.includes(PERMISSIONS.STUDENT_CREATE), false, "ACCOUNTANT should NOT have STUDENT_CREATE");
});

// -------------------------------------------------------------
// Test 3: Zod Schemas Validation (Student Admission)
// -------------------------------------------------------------
runTest("Zod Student Admission Input Schema Checks", () => {
    const validData = {
        firstName: "John",
        gender: "Male",
        dob: "2015-05-15",
        classId: "123e4567-e89b-12d3-a456-426614174000",
        sectionId: "123e4567-e89b-12d3-a456-426614174000",
        guardianName: "Bob Smith",
        guardianPhone: "1234567890"
    };

    const parseResult = studentValidation.admitStudent.body.safeParse(validData);
    assert.strictEqual(parseResult.success, true, "Should validate valid admission payload");

    // Invalid payload test (missing guardianName)
    const invalidData = { ...validData };
    delete invalidData.guardianName;

    const parseResultInvalid = studentValidation.admitStudent.body.safeParse(invalidData);
    assert.strictEqual(parseResultInvalid.success, false, "Should fail validation when guardianName is missing");
});

// -------------------------------------------------------------
// Test 4: Zod Schemas Validation (Fee Collection)
// -------------------------------------------------------------
runTest("Zod Fee Collection Input Schema Checks", () => {
    const validPayment = {
        studentId: "123e4567-e89b-12d3-a456-426614174000",
        feeGroupId: "123e4567-e89b-12d3-a456-426614174000",
        feeTypeId: "123e4567-e89b-12d3-a456-426614174000",
        amount: 150.50,
        paymentMethod: "Cash"
    };

    const parseResult = feesValidation.collectFee.body.safeParse(validPayment);
    assert.strictEqual(parseResult.success, true, "Should validate valid fee payment payload");

    // Invalid payload (negative amount)
    const invalidPayment = { ...validPayment, amount: -50 };
    const parseResultInvalid = feesValidation.collectFee.body.safeParse(invalidPayment);
    assert.strictEqual(parseResultInvalid.success, false, "Should fail validation on negative fee amount");
});

// -------------------------------------------------------------
// Test 5: Zod Student Promotion Schema
// -------------------------------------------------------------
runTest("Zod Student Promotion Schema Checks", () => {
    const validPromotion = {
        toClassId: "123e4567-e89b-12d3-a456-426614174000",
        toSectionId: "123e4567-e89b-12d3-a456-426614174000",
        studentIds: ["123e4567-e89b-12d3-a456-426614174000", "550e8400-e29b-41d4-a716-446655440000"]
    };

    const parseResult = academicsValidation.promoteStudents.body.safeParse(validPromotion);
    assert.strictEqual(parseResult.success, true, "Should validate valid promotion payload");

    // Invalid payload (empty studentIds array)
    const invalidPromotion = { ...validPromotion, studentIds: [] };
    const parseResultInvalid = academicsValidation.promoteStudents.body.safeParse(invalidPromotion);
    assert.strictEqual(parseResultInvalid.success, false, "Should fail validation on empty studentIds list");
});

console.log("\n🎉 All 5 Test Cases Passed Successfully!");
process.exit(0);
