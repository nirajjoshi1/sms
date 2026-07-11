const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { asyncLocalStorage } = require('../utils/als');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prismaBase = new PrismaClient({ adapter });

// Apply Multi-Tenant Extension globally
const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const user = asyncLocalStorage.getStore();
        
        // Skip models that don't need tenant isolation, or if no user context, or SUPER_ADMIN
        const skipModels = ['School', 'User', 'Backup', 'SystemSetting'];
        
        if (
            skipModels.includes(model) || 
            !user || 
            user.role === 'SUPER_ADMIN' ||
            !user.schoolId
        ) {
            return query(args);
        }

        // Initialize args if undefined
        args = args || {};

        const methodsWithWhere = ['findFirst', 'findMany', 'count', 'aggregate', 'groupBy'];
        
        // Handle read operations
        if (methodsWithWhere.includes(operation)) {
            args.where = { ...args.where, schoolId: user.schoolId };
        }
        
        // Handle findUnique (convert to findFirst to allow non-unique filtering by schoolId)
        if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
            const newOperation = operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
            args.where = { ...args.where, schoolId: user.schoolId };
            return prismaBase[model][newOperation](args);
        }
        
        // Handle create operations
        if (operation === 'create') {
            args.data = { ...args.data, schoolId: user.schoolId };
        }

        if (operation === 'createMany') {
            if (Array.isArray(args.data)) {
                args.data = args.data.map(d => ({ ...d, schoolId: user.schoolId }));
            } else {
                args.data.schoolId = user.schoolId;
            }
        }
        
        // Handle updates and deletes (requires extra check since we can't easily alter unique where)
        const modifyOperations = ['update', 'delete'];
        if (modifyOperations.includes(operation)) {
            // Ensure the record actually belongs to the school before mutating
            const record = await prismaBase[model].findFirst({
                where: { ...args.where, schoolId: user.schoolId }
            });
            
            if (!record) {
                throw new Error("Access Denied: Record not found or belongs to another tenant.");
            }
            // Proceed with original mutation
        }

        const modifyManyOperations = ['updateMany', 'deleteMany'];
        if (modifyManyOperations.includes(operation)) {
            args.where = { ...args.where, schoolId: user.schoolId };
        }

        return query(args);
      }
    }
  }
});

module.exports = prisma;
module.exports.prismaBase = prismaBase;
