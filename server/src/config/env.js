const { z } = require('zod');

const envSchema = z.object({
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
    PORT: z.string().transform((val) => parseInt(val, 10)).default("5000"),
    JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters long"),
    CLIENT_URL: z.string().default("http://localhost:5173"),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}

module.exports = parsed.data;
