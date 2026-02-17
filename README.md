# Campus Event Flow Platform

A full-stack campus event management platform where students can discover and register for events, organizers can run multi-round event workflows, and admins can approve events and monitor platform analytics.

This repository contains:
- Backend API: Express + MongoDB (`/controllers`, `/routes`, `/models`)
- Frontend App: React + Vite + MUI (`/view`)

## Project Overview

The system supports the complete lifecycle of campus events:
1. Student onboarding and authentication (email OTP and Google login)
2. Event creation and management (admin/global events, org events, solo organizer events)
3. Student registrations and per-round progress tracking
4. Organizer operations (attendance, qualification, round status updates)
5. Certificate template mapping, issuance, and public verification
6. Admin dashboard analytics and event approval workflow

## Main Features

- Role-based authentication for `Student` and `Admin`
- OTP verification for signup and password reset
- Google sign-in onboarding flow
- Public and protected routes in frontend with role checks
- Event creation with media upload (Cloudinary via Multer)
- Organization management with join codes
- Solo and organization-backed event workflows
- Multi-round participant tracking via `EventProgress`
- Certificate template preview and bulk issuance
- QR/verification-code based certificate verification endpoint
- Admin dashboard stats, event table, and status updates

## Tech Stack

Backend:
- Node.js, Express 5
- MongoDB + Mongoose
- JWT auth
- Multer + Cloudinary storage
- Brevo transactional email
- Axios integrations (Templated.io / API Template)

Frontend:
- React 19 + Vite
- React Router (HashRouter)
- MUI components and charts
- Axios service layer

## Repository Structure

```text
Campus/
  app.js
  main.js
  controllers/
  routes/
  models/
  middleware/
  utils/
  view/                 # React frontend
    src/
```

## Environment Variables

Backend (`.env` at repo root):

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port (default fallback in code: `4001`) |
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | JWT signing/verification secret |
| `FRONTEND_URL` | Allowed CORS origin and certificate verify URL base |
| `BREVO_API_KEY` | Brevo transactional email API key |
| `EMAIL_USER` | Sender email used by Brevo helpers |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config |
| `CLOUDINARY_API_KEY` | Cloudinary config |
| `CLOUDINARY_API_SECRET` | Cloudinary config |
| `TEMPLATED_API_KEY` | Templated.io render API key |
| `APITEMPLATE_KEY` | API Template PDF generation key |

Frontend (`view/.env`):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base backend URL, for example `http://localhost:4001/api` |

## Running Locally

1. Install backend dependencies:
   - `npm install`
2. Install frontend dependencies:
   - `cd view && npm install`
3. Start backend:
   - From root: `npm start`
4. Start frontend:
   - From `view`: `npm run dev`

## Frontend Route Map

| Path | Component/Page | Access |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/login` | `Login` | Public |
| `/signup` | `SignUp` | Public |
| `/admin-login` | `AdminLogin` | Public |
| `/verify/:code` | `VerifyCertificate` | Public |
| `/student/*` | `StudentDashboard` with nested student pages | Student only |
| `/admin/*` | `Dashboard` with nested admin pages | Admin only |

Key student nested paths:
- `/student/discover`
- `/student/calendar`
- `/student/achievements`
- `/student/registrations`
- `/student/event/:eventId`
- `/student/profile`
- `/student/organize`
- `/student/organize/org/:orgId`
- `/student/organize/event/:eventId`

Key admin nested paths:
- `/admin/home`
- `/admin/calendar`
- `/admin/profile`
- `/admin/data`

## Backend API Summary (Mount Paths)

Base URL prefix in server: `/api`

| Path | Router |
|---|---|
| `/api/auth` | `routes/auth.routes.js` |
| `/api/events` | `routes/event.routes.js` |
| `/api/student` | `routes/student.routes.js` |
| `/api/orgs` | `routes/organization.routes.js` |
| `/api/users` | `routes/user.routes.js` |
| `/api/certificates` | `routes/certificate.routes.js` |
| `/api/dashboard` | `routes/dashboard.routes.js` |

## API Details By Router

### 1) Auth Router (`/api/auth`)

| Method | Path | Function | What this function does |
|---|---|---|---|
| `POST` | `/send-otp` | `sendOtp` | Validates email, blocks already-registered emails, creates OTP record, sends verification email. |
| `POST` | `/verify-otp` | `verifyOtp` | Verifies OTP for email and marks OTP record as verified. |
| `POST` | `/register` | `registerStudent` | Creates a new student account only if OTP verification is complete; hashes password. |
| `POST` | `/login` | `loginStudent` | Validates student credentials and returns JWT + user payload. |
| `POST` | `/register-admin` | `registerAdmin` | Creates an admin account with hashed password. |
| `POST` | `/login-admin` | `loginAdmin` | Authenticates admin role and returns JWT + admin payload. |
| `POST` | `/forgot-password` | `sendForgotPasswordOtp` | Sends password reset OTP to existing user email. |
| `POST` | `/reset-password-otp` | `verifyPasswordResetOtp` | Verifies reset OTP and marks OTP session as verified for password reset. |
| `POST` | `/reset-password` | `resetPassword` | Resets account password after verified OTP session. |
| `POST` | `/google` | `google` | Logs in existing Google user or auto-registers a new student from Google profile data. |
| `GET` | `/profile` | `protect + inline handler` | Returns authenticated user from JWT-protected request context. |

### 2) Event Router (`/api/events`)

| Method | Path | Function | What this function does |
|---|---|---|---|
| `GET` | `/list` | `getAllEvents` | Fetches all events sorted by start date. |
| `POST` | `/create` | `createEvent` | Creates event, parses multipart `rounds`, stores poster upload URL. |
| `PUT` | `/update/:id` | `updateEvent` | Updates event fields, supports poster replacement or retained URL. |
| `PUT` | `/:eventId/certificate-config` | `saveCertificateConfig` | Enables and stores event-level certificate template configuration. |

### 3) Student Router (`/api/student`)

| Method | Path | Function | What this function does |
|---|---|---|---|
| `GET` | `/events` | `getStudentEvents` | Returns all available events for student discovery view. |
| `GET` | `/events/:eventId` | `getEventDetails` | Returns details for a single event by ID. |
| `POST` | `/events/:eventId/register` | `registerForEvent` | Registers student to event, enforces seat/full checks, creates initial `EventProgress`. |
| `GET` | `/registrations/:userId` | `getMyRegistrations` | Returns user registration list with computed status and latest score. |
| `GET` | `/` | `getAllStudents` | Returns all users with role `Student` (password excluded). |
| `PATCH` | `/:id/verify` | `toggleStudentVerification` | Toggles student `isVerified` status. |
| `DELETE` | `/:id` | `deleteStudent` | Deletes student account by ID. |

### 4) Organization Router (`/api/orgs`)

| Method | Path | Function | What this function does |
|---|---|---|---|
| `POST` | `/create` | `createOrganization` | Creates organization, generates join code, adds creator as org admin member. |
| `POST` | `/join` | `joinOrganization` | Adds user to organization using join code if not already a member. |
| `GET` | `/my-orgs/:userId` | `getUserOrganizations` | Returns organization list where user has memberships. |
| `POST` | `/events/solo/create` | `createSoloEvent` | Creates a non-organization event assigned to a specific organizer. |
| `GET` | `/events/solo/:userId` | `getSoloEvents` | Returns solo events assigned to given organizer user ID. |
| `GET` | `/:orgId` | `getOrganizationById` | Returns organization metadata by organization ID. |
| `GET` | `/:orgId/members` | `getOrganizationMembers` | Returns organization member list with user profile fields and role. |
| `GET` | `/:orgId/events` | `getOrganizationEvents` | Returns events tied to one organization. |
| `POST` | `/:orgId/events` | `createOrganizationEvent` | Creates event under an organization after validating membership. |
| `GET` | `/events/:eventId/participants` | `getEventParticipants` | Returns registered students plus derived per-round participation status. |
| `PUT` | `/events/:eventId/attendance` | `markAttendance` | Updates round attendance in both `EventProgress` and `Event.rounds[].attendance`. |
| `PUT` | `/events/:eventId/qualify` | `qualifyStudent` | Moves a student to next round and marks previous round as qualified. |
| `PUT` | `/events/:eventId/rounds/:roundNumber/status` | `updateRoundStatus` | Sets event round status (for example Live or Complete). |

### 5) User Router (`/api/users`)

| Method | Path | Function | What this function does |
|---|---|---|---|
| `GET` | `/:userId` | `getUserProfile` | Returns user profile by ID without password. |
| `PUT` | `/:userId` | `updateUserProfile` | Updates base profile and role-specific profile fields (student/admin). |

### 6) Certificate Router (`/api/certificates`)

| Method | Path | Function | What this function does |
|---|---|---|---|
| `POST` | `/template/:eventId` | `createTemplateMapping` | Maps a certificate template to event and target round/tag. |
| `GET` | `/templates/:eventId` | `getEventTemplates` | Lists all configured template mappings for an event. |
| `DELETE` | `/template/:templateId` | `deleteTemplateMapping` | Deletes a template mapping by ID. |
| `POST` | `/preview` | `previewTemplate` | Renders preview certificate using dummy data and template ID. |
| `GET` | `/verify/:code` | `verifyCertificate` | Public endpoint to validate certificate by verification code. |
| `POST` | `/issue/:eventId` | `issueCertificates` | Bulk issues or upgrades certificates based on highest attended round. |
| `GET` | `/my-certificates` | `getMyCertificates` | Returns authenticated user certificates with event/template details. |

### 7) Dashboard Router (`/api/dashboard`)

| Method | Path | Function | What this function does |
|---|---|---|---|
| `GET` | `/stats` | `getDashboardStats` | Returns admin dashboard KPI cards and 7-day trend data. |
| `GET` | `/events` | `getEventsTable` | Returns flattened event list for admin datagrid table. |
| `PUT` | `/event-status/:id` | `updateEventStatus` | Updates event workflow status (Draft/Pending/Approved/Rejected/Completed). |

## Core Data Models

| Model | Responsibility |
|---|---|
| `User` | Stores students/admins, role, profile, verification status |
| `Otp` | Stores OTP sessions for verification and password reset |
| `Organization` | Organization entity with admin and join code |
| `OrganizationMember` | Membership link table (`organizationId`, `userId`, role) |
| `Event` | Event metadata, registrations, organizers, rounds, certificate config |
| `EventProgress` | Per-student progress and round history in each event |
| `CertificateTemplate` | Round-to-template mapping for certificate issuance |
| `IssuedCertificate` | Generated certificate record with verification code and PDF URL |

## Auth and Security Notes

- JWT middleware: `middleware/auth.middleware.js`
- Protected endpoints require header: `Authorization: Bearer <token>`
- Token payload includes `id`, `role`, and `email`
- Current code protects many student/certificate routes, but not all admin-like actions are guarded at router level. For production, add role middleware for admin-only operations.

## Integration Notes

- File uploads for events use Cloudinary storage config in `utils/upload.js`
- Email OTP and reset flows use Brevo API in `utils/email.utils.js`
- Certificate preview and issuance use external render providers
- Frontend uses HashRouter, so generated verify links use `#/verify/:code`

## Suggested Next Improvements

1. Add centralized role-based middleware (`adminOnly`, `studentOnly`) and apply to sensitive routes.
2. Add request validation (Joi/Zod/express-validator) for all payloads.
3. Add OpenAPI/Swagger generation from route definitions.
4. Add backend test coverage (unit + integration for controllers).
5. Normalize API response format across controllers.
