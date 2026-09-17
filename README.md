# Healthcare Patient Intake

A patient records portal for a small clinic, built to demonstrate production-grade
backend architecture patterns — role-based access control, resource-level
authorization, append-only audit logging, and secure document storage — on a
Node/Express/Prisma stack.

This project implements security practices modeled on HIPAA safeguards (encryption
at rest/in transit, RBAC, audit logging). It is a personal portfolio project and is
not, and does not claim to be, HIPAA-compliant.

## Overview

Three roles share the system with clearly defined, tested authorization boundaries:

- **Patients** self-register and can view their own profile, clinical record, and
  documents.
- **Clinicians** manage patient records and upload documents on patients' behalf.
- **Administrators** manage user roles and review the audit trail.

Core capabilities:

- Role-based and resource-level (ownership-scoped) authorization
- Append-only security/business audit logging, distinct from application logs
- Secure document storage in S3-compatible object storage via presigned URLs,
  with asynchronous background processing before a document becomes available
- Structured application logging and request tracing

## Architecture

Two independently deployable services:

| Service | Responsibility |
|---|---|
| `web/` | Next.js (App Router) frontend. No direct database access; calls the API over HTTP. |
| `api/` | Express API. Owns authentication, authorization, business logic, audit logging, and file storage integration. |

The frontend and API communicate via an HttpOnly session cookie; the API enforces
CORS against a known origin rather than delegating cross-origin concerns to a proxy.

```
Next.js (App Router)      Express API              PostgreSQL (Prisma)
  UI / rendering    <-->    Auth / RBAC        <-->   Users, records,
  No DB access             Business logic             documents, audit events
                            Audit logging
                            File storage integration
                            Background job producer        Redis
                                  |                     BullMQ job queue
                                  v
                            S3-compatible object storage
                            (AWS S3 in production, MinIO locally)
```

## Tech stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express 5, TypeScript
- **Data**: PostgreSQL, Prisma ORM (`pg` driver adapter)
- **Validation**: Zod
- **Logging**: Pino
- **Background jobs**: BullMQ / Redis
- **Object storage**: S3-compatible (AWS S3 / MinIO)
- **Testing**: Vitest, Supertest

## Getting started

Prerequisites: Node.js 22+, Docker.

```powershell
docker compose up -d
```

```powershell
cd api
npm install
npx prisma migrate dev
npm run dev
```

Copy `api/.env.example` to `api/.env` and adjust values for your local setup.

## Project status

Actively in development. Current state: data model and local Postgres
infrastructure in place. Authentication, authorization middleware, the frontend,
background job processing, and object storage integration are in progress.
