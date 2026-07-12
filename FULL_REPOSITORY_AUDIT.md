# Full Repository Audit
**Project:** School Management System
**Generated:** 2026-07-12

This document provides a comprehensive inventory and classification of the `school-management-system` repository, specifically omitting `.git`, `node_modules`, `dist`, `build`, coverage, caches, generated Prisma client, and binary images.

## 1. Specifically Investigated Files & Anomalies

### `client/src/pages/hr${page}.jsx`
- **Classification**: Suspicious / Dead/duplicate
- **Purpose**: Literal file named `hr${page}.jsx` containing `TeachersRating` component. Created mistakenly during template generation.
- **Imported/used by**: Unused (shadowed by actual `TeachersRating.jsx`).
- **Current health**: Poor - Malformed filename.
- **Security concerns**: None directly, but pollutes build.
- **Functional concerns**: Unusable route placeholder.
- **Required change**: Delete the file entirely.
- **Change completed**: false
- **Test or verification covering it**: None.

### `update_width.js`
- **Classification**: Script
- **Purpose**: One-off Node.js script placed in the root directory to find and replace `maxWidth="max-w-[a-z0-9-]+"` with `maxWidth="max-w-md"` in all client modal components.
- **Imported/used by**: Developer CLI usage.
- **Current health**: Poor - Ad-hoc root script.
- **Security concerns**: Arbitrary file mutation if run incorrectly.
- **Functional concerns**: Not part of standard build pipeline.
- **Required change**: Move to a `scripts/` directory or delete if one-time use.
- **Change completed**: false
- **Test or verification covering it**: None.

### Empty Middleware Files (`server/src/middleware/auth.js`, `role.js`, `upload.js`)
- **Classification**: Dead/duplicate
- **Purpose**: 0-byte abandoned files. Active middleware actually lives in `*.middleware.js` (e.g., `auth.middleware.js`).
- **Imported/used by**: None.
- **Current health**: Broken (0 bytes).
- **Security concerns**: Confusion over which authorization middleware is actively protecting routes.
- **Functional concerns**: Clutters the middleware directory.
- **Required change**: Delete `auth.js`, `role.js`, and `upload.js`.
- **Change completed**: false
- **Test or verification covering it**: N/A.

### Duplicate Staff APIs (`server/src/routes/staff.routes.js` & `hr.routes.js`)
- **Classification**: Dead/duplicate
- **Purpose**: Staff management APIs are duplicated under `/api/v1/staff` and `/api/v1/hr/staff`.
- **Imported/used by**: Redundant client calls.
- **Current health**: Poor - Violates DRY, split logic.
- **Security concerns**: Inconsistent validation or role checks between endpoints.
- **Functional concerns**: Updating staff logic requires modifying two controllers.
- **Required change**: Deprecate `/api/v1/staff` in favor of `/api/v1/hr/staff` (or vice versa) and point all UI components to the unified route.
- **Change completed**: false
- **Test or verification covering it**: Postman / manual endpoints test.

### Duplicate Finance APIs (`server/src/routes/finance.routes.js`)
- **Classification**: Dead/duplicate
- **Purpose**: Legacy finance endpoints.
- **Imported/used by**: Deprecated, currently commented out in `app.js`.
- **Current health**: Dead code.
- **Security concerns**: If uncommented, could expose insecure legacy financial endpoints.
- **Functional concerns**: Redundant to the newer Income/Expense/Fees structure.
- **Required change**: Delete finance controllers and routes.
- **Change completed**: false
- **Test or verification covering it**: None.

### Legacy Settings APIs
- **Classification**: Legacy / Dead/duplicate
- **Purpose**: Older settings implementations before the unified `SystemSetting` model.
- **Imported/used by**: Potentially older client settings pages.
- **Current health**: Deprecated.
- **Security concerns**: May bypass new audit logging.
- **Functional concerns**: Duplicate configurations.
- **Required change**: Fully migrate to modern settings endpoints and delete legacy.
- **Change completed**: false
- **Test or verification covering it**: Settings test suite.

### Unused React/Vite Assets (`client/src/assets/react.svg`, `vite.svg`)
- **Classification**: Static asset
- **Purpose**: Default scaffolding graphics from Vite.
- **Imported/used by**: None.
- **Current health**: Bloat.
- **Security concerns**: None.
- **Functional concerns**: Unnecessary payload.
- **Required change**: Delete files.
- **Change completed**: false
- **Test or verification covering it**: N/A.

### Debug Scripts & Seed/Test Scripts (`server/src/tests/run_tests.js`, `prisma.config.ts`)
- **Classification**: Script / Test
- **Purpose**: Custom automated assertion-based test suite and DB config.
- **Imported/used by**: `npm run test`
- **Current health**: Good.
- **Security concerns**: Ensure test data doesn't leak into production DB.
- **Functional concerns**: Custom test runner instead of Jest/Mocha.
- **Required change**: Standardize testing framework eventually.
- **Change completed**: false
- **Test or verification covering it**: Self-testing.

## 2. Root and Nested Package / Configuration Files

### `package.json` (Root)
- **Classification**: Configuration
- **Purpose**: Root workspace config, manages concurrent scripts (client + server).
- **Imported/used by**: NPM/Render.
- **Current health**: Good.
- **Security concerns**: None.
- **Functional concerns**: None.
- **Required change**: None.
- **Change completed**: false
- **Test or verification covering it**: Build pipeline.

### `client/package.json` & `server/package.json`
- **Classification**: Configuration
- **Purpose**: Frontend and backend specific dependencies.
- **Imported/used by**: Build process.
- **Current health**: Good.
- **Security concerns**: Requires regular dependency audits (`npm audit`).
- **Functional concerns**: None.
- **Required change**: None.
- **Change completed**: false
- **Test or verification covering it**: Build process.

### `render.yaml` / `vercel.json` / `Dockerfile` / `Procfile`
- **Classification**: Deployment
- **Purpose**: Deployment configuration for Render, Vercel, Docker, and Heroku-style services.
- **Imported/used by**: PaaS platforms during deployment.
- **Current health**: Good.
- **Security concerns**: Hardcoded secrets must be avoided.
- **Functional concerns**: Fragmented deployment targets (Vercel vs Render vs Docker).
- **Required change**: Consolidate to a single source of truth for deployment.
- **Change completed**: false
- **Test or verification covering it**: CI/CD pipeline.

### `client/vite.config.js`
- **Classification**: Configuration
- **Purpose**: Vite build settings.
- **Imported/used by**: Vite bundler.
- **Current health**: Has ESLint warnings (`__dirname` not defined in module format).
- **Security concerns**: None.
- **Functional concerns**: Linting failures on build.
- **Required change**: Fix `__dirname` usage or switch to CommonJS/ESM standard.
- **Change completed**: false
- **Test or verification covering it**: Frontend build.

## 3. General Source Inventory

### `client/src/components/*`
- **Classification**: Active source
- **Purpose**: Reusable React UI components (auth, common, landing, layout, schools, shared, ui).
- **Imported/used by**: Client pages.
- **Current health**: Good.
- **Security concerns**: XSS prevention in rendering.
- **Functional concerns**: None.
- **Required change**: None.
- **Change completed**: false
- **Test or verification covering it**: UI E2E tests.

### `client/src/pages/*`
- **Classification**: Active source
- **Purpose**: Route-specific view pages (academics, auth, certificates, dashboard, expenses, fees, hr, income, reports, settings, staff, students, teacher).
- **Imported/used by**: React Router.
- **Current health**: Good, aside from `hr${page}.jsx`.
- **Security concerns**: Route protection (verified).
- **Functional concerns**: None.
- **Required change**: Implement placeholder features (reports).
- **Change completed**: false
- **Test or verification covering it**: Route integration tests.

### `server/src/controllers/*` & `server/src/routes/*`
- **Classification**: Active source
- **Purpose**: Backend logic and Express API endpoints.
- **Imported/used by**: Express App.
- **Current health**: Good, minus identified duplicates.
- **Security concerns**: UUID validation requires fixing (parseInt used on UUIDs).
- **Functional concerns**: None.
- **Required change**: Fix `validateIdParam` middleware.
- **Change completed**: false
- **Test or verification covering it**: Backend test suite.

### `server/prisma/schema.prisma`
- **Classification**: Configuration / Active source
- **Purpose**: Database schema definition.
- **Imported/used by**: Prisma Client.
- **Current health**: Excellent (Validates cleanly).
- **Security concerns**: None.
- **Functional concerns**: None.
- **Required change**: None.
- **Change completed**: false
- **Test or verification covering it**: Prisma validate.

### `IMPLEMENTATION_AUDIT.md`
- **Classification**: Documentation
- **Purpose**: Prior baseline audit documentation.
- **Imported/used by**: Developers.
- **Current health**: Good.
- **Security concerns**: None.
- **Functional concerns**: None.
- **Required change**: Keep updated.
- **Change completed**: false
- **Test or verification covering it**: N/A.
