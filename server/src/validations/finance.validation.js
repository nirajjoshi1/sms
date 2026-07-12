const { z } = require('zod');

const createHead = {
    body: z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional().nullable()
    }).strict()
};

const createTransaction = (headIdField) => ({
    body: z.object({
        [headIdField]: z.string().uuid(`Invalid Head ID`),
        name: z.string().min(1, "Name/Title is required"),
        invoiceNumber: z.string().optional().nullable(),
        date: z.string().min(1, "Date is required"),
        amount: z.number().positive("Amount must be a positive number"),
        description: z.string().optional().nullable()
    }).strict()
});

module.exports = {
    createIncomeHead: createHead,
    createExpenseHead: createHead,
    createIncome: createTransaction('incomeHeadId'),
    createExpense: createTransaction('expenseHeadId')
};
