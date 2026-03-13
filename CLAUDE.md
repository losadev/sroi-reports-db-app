# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SROI Reports DB App** is a public database and reporting platform for a Social Return on Investment (SROI) agency. Spanish-language UI.

**Tech Stack:**
- **Frontend:** Next.js 16.1.6 with React 19, TypeScript 5, Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI + CVA + lucide-react icons)
- **Backend/Database:** Prisma ORM with PostgreSQL (Supabase)
- **Auth:** Supabase Auth (email/password + planned Google OAuth)
- **File Storage:** Cloudflare R2 (via AWS S3 SDK)
- **State Management:** Zustand
- **Validation:** Zod
- **Package Manager:** Bun

## Common Commands

```bash
bun dev                                          # Dev server at localhost:3000
bun build                                        # Production build
bun lint                                         # ESLint
bun prisma migrate dev --name <migration_name>   # Create and apply migration
bun prisma generate                              # Regenerate Prisma Client
bun prisma studio                                # GUI for data inspection
```

## Architecture

### Directory Structure

```
app/
  layout.tsx              # Root layout (Navbar + content area)
  page.tsx                # Home page
  components/             # Shared UI components (navbar, report-card)
  api/reports/route.ts    # Reports REST endpoint (GET with search/filter)
  auth/confirm/route.ts   # Supabase email OTP verification endpoint
  register/page.tsx       # Registration form (client component)
  reports/
    layout.tsx
    page.tsx              # Reports listing with sidebar filters (client component)
  generated/prisma/       # Auto-generated Prisma Client (do not edit)
lib/
  utils.ts                # cn() helper (clsx + tailwind-merge)
  supabase/
    server.ts             # Server-side Supabase client (uses cookies)
    client.ts             # Browser-side Supabase client (singleton)
    proxy.ts              # Middleware session handler (updateSession)
utils/
  index.ts                # getEnvironmentVariable() for Supabase config
prisma/
  schema.prisma           # Database schema (Report + User models)
```

### Key Patterns

- **App Router with RSC by default.** Client components must use `'use client'`.
- **Path alias:** `@/*` maps to the project root.
- **Prisma Client** is generated to `app/generated/prisma`. Import from `@/app/generated/prisma/client`.
- **Supabase dual-client pattern:** `lib/supabase/server.ts` for server components/API routes (cookie-based), `lib/supabase/client.ts` for client components (singleton). Both use `getEnvironmentVariable()` from `@/utils`.
- **Auth middleware** in `lib/supabase/proxy.ts`: redirects unauthenticated users to `/register`, allows `/register` and `/auth` paths without auth.
- **Reports page** currently uses mock data with a commented-out API fetch (TODO: connect to real API).

### Database Models

- **Report:** SROI report with title, abstract, summary, file URLs (R2), area, tags, accreditation, country, year.
- **User:** Registration data linked to Supabase Auth (email, org_name, entity_type, preferences).

## Environment Variables

```
DATABASE_URL                           # PostgreSQL connection (Supabase)
NEXT_PUBLIC_SUPABASE_URL               # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   # Supabase anon/public key
CLOUDFARE_R2_TOKEN_VALUE               # R2 API token
CLOUDFARE_S3_ACCESS_KEY_ID             # R2 access key
CLOUDFARE_S3_SECRET_ACCESS_KEY_ID      # R2 secret key
CLOUDFARE_S3_ENDPOINT                  # R2 endpoint URL
```

## Key Resources

- **Task Management:** https://www.notion.so/1345ef417c5547618aa9bad27b078b9c
- **Ideas Database:** https://www.notion.so/30076ed822ba8085a798cfff0835ee79
