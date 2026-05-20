# CloudExamLab — Wiki Index

This wiki is the single source of truth for understanding the platform: how it works, why decisions were made, and what's being built. Use it as context when asking questions about the codebase.

---

## Platform (How the product works)

| File | What it covers |
|------|---------------|
| [platform/overview.md](platform/overview.md) | What CloudExamLab is, who it's for, what it does |
| [platform/user-flow.md](platform/user-flow.md) | End-to-end user journey from landing to completing an exam |
| [platform/authentication.md](platform/authentication.md) | Signup, login, magic link, session management, password reset |
| [platform/subscription-payment.md](platform/subscription-payment.md) | Subscription plans, PayPal flow, enrollment, access control |
| [platform/exam-flow.md](platform/exam-flow.md) | Starting, taking, submitting, and reviewing an exam |
| [platform/admin-flow.md](platform/admin-flow.md) | Admin panel: managing exam types, question sets, and questions |
| [platform/access-control.md](platform/access-control.md) | Who can access what and why |

## Technical (How it's built)

| File | What it covers |
|------|---------------|
| [technical/architecture.md](technical/architecture.md) | Tech stack, folder structure, design patterns |
| [technical/database-schema.md](technical/database-schema.md) | All 13 tables, their fields, relationships, and RLS policies |
| [technical/edge-functions.md](technical/edge-functions.md) | 4 Supabase Edge Functions: purpose, inputs, outputs, secrets |
| [technical/state-management.md](technical/state-management.md) | 5 Zustand stores: what each manages and key actions |
| [technical/offline-sync.md](technical/offline-sync.md) | Offline-first strategy: IndexedDB, SyncService, service worker |
| [technical/environment-setup.md](technical/environment-setup.md) | All env vars, external services, and how to switch Supabase projects |

## Content (Theory & study material foundation)

| File | What it covers |
|------|---------------|
| *(add articles here as they are created)* | |

---

## Quick orientation

- **Frontend:** React + Vite + Zustand (no Redux), hosted statically
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **Payments:** PayPal subscriptions
- **Current exam:** AWS Developer Associate (DVA-C02)
- **Access model:** Free samples always accessible; paid sets require active subscription
