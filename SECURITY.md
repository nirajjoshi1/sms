# Security Architecture

This document details the security mechanisms implemented in the School Management System, focusing on multi-tenancy, IDOR protections, and data validation.

## 1. Multi-Tenancy Architecture

The system is designed as a multi-tenant SaaS application, where each school operates in complete isolation from others, despite sharing the same underlying database structure.

- **Data Isolation:** Every relevant model in the database schema (e.g., `Student`, `Staff`, `FeePayment`, `Attendance`) includes a `schoolId` foreign key.
- **Tenant Context Identification:** The authenticated user's `schoolId` is extracted from their JWT token and attached to the request context (`req.user.schoolId`).
- **Query Scoping:** All database queries automatically scope to the user's `schoolId`. A user from `School A` cannot query, read, update, or delete records belonging to `School B`, because all database operations strictly filter by `schoolId: req.user.schoolId`.

## 2. Insecure Direct Object Reference (IDOR) Protections

To prevent unauthorized access to objects belonging to other users or tenants, we implement strict IDOR protections:

- **Ownership Verification:** Whenever a user requests an object by its ID (e.g., `GET /api/v1/students/:id`), the backend not only looks up the object by `id` but simultaneously ensures that the object's `schoolId` matches the authenticated user's `schoolId`.
- **Consistent Enforcement:** This validation occurs across all CRUD operations (Create, Read, Update, Delete) to ensure that users cannot bypass authorization checks by modifying request payloads or URL parameters.
- **Role-Based Filtering:** Certain roles may only access a subset of data within their own school (e.g., a teacher viewing their own students' marks).

## 3. Zod Validations

We utilize **Zod**, a TypeScript-first schema declaration and validation library, to enforce strict data integrity and type safety at the API boundary:

- **Input Sanitization and Validation:** All incoming request bodies, queries, and parameters are validated against predefined Zod schemas before reaching the controller logic.
- **Type Coercion:** Zod automatically coerces types where appropriate (e.g., converting a string `"123"` to a number `123` when a number is expected), preventing type-related runtime errors.
- **Detailed Error Reporting:** If validation fails, Zod provides detailed, structured error messages pinpointing exactly which fields are missing or incorrectly formatted, which are then formatted and returned to the client in a consistent API response structure.
- **Defense in Depth:** This validation layer acts as the first line of defense against malformed data, injection attacks, and unexpected application states.

## 4. General Security Measures

- **Authentication:** Secure JWT-based authentication with expiration and secure HTTP-only cookies (where applicable).
- **Password Hashing:** Passwords are hashed using `bcrypt` with an appropriate work factor (salt rounds).
- **Rate Limiting:** `express-rate-limit` is used to protect against brute-force attacks on authentication endpoints and general API endpoints.
- **Security Headers:** `helmet` is configured to set various HTTP headers for enhanced security (e.g., XSS protection, preventing clickjacking).
- **CORS:** Cross-Origin Resource Sharing is strictly configured to only allow requests from whitelisted client origins.
