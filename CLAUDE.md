# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SROI Reports DB App** is a public database and reporting platform for a Social Return on Investment (SROI) agency. The application is built with modern TypeScript-based tooling across the entire stack.

**Tech Stack:**
- **Frontend:** Next.js 16.1.6 with React 19.2.3 and TypeScript 5
- **Backend/Database:** Prisma ORM with PostgreSQL (Supabase)
- **File Storage:** Cloudflare R2
- **Styling:** Tailwind CSS 4
- **Package Manager:** Bun (with pnpm-lock.yaml as fallback)
- **Linting:** ESLint with Next.js and TypeScript configs

## Architecture

### Directory Structure

```
app/                    # Next.js App Router (RSC by default)
  layout.tsx           # Root layout
  page.tsx             # Home page
public/                # Static assets
```

**Path Aliases:**
- `@/*` maps to the project root for clean imports

### Application Pattern

The project uses Next.js App Router with React Server Components (RSC) as the default. Client components must be explicitly marked with `'use client'`.

### Database Schema

The application uses **Prisma** to manage PostgreSQL (Supabase) with a `Report` model representing SROI reports:

```prisma
model Report {
  id              String   @id @default(uuid())
  title           String
  abstract        String    // Short summary for listings
  summary         String    // Long summary for detail view
  thumbnail_url   String    // Thumbnail in R2
  file_url        String    // PDF in R2
  area            String    // Main filter category
  tags            String[]  // Array of keywords
  accredited      Boolean
  country         String
  publish_year    Int
  created_at      DateTime  @default(now())
}
```

**Key Architectural Considerations:**
- Prisma Client is generated to `app/generated/prisma`
- File uploads (PDFs, thumbnails) are stored in Cloudflare R2
- Database URL is set via `DATABASE_URL` environment variable
- Currently has one core model; expand as needed for related entities (authors, organizations, etc.)

## Common Commands

### Development
```bash
bun dev         # Start dev server (http://localhost:3000)
bun build       # Build for production
bun start       # Start production server
bun lint        # Run ESLint
```

### Database (Prisma)
```bash
bun prisma migrate dev --name <migration_name>   # Create and apply migration
bun prisma migrate deploy                        # Apply pending migrations (prod)
bun prisma generate                              # Regenerate Prisma Client
bun prisma studio                                # Open Prisma Studio GUI for data inspection
bun prisma db seed                               # Run seed script (if configured)
```

### Useful Patterns
- **API Routes:** Create under `app/api/[route]/route.ts` for server endpoints
- **Layouts:** Organize layout hierarchies in `app/` for nested page structures
- **Metadata:** Define page metadata using Next.js `Metadata` export in layout or page files

## Key Resources

- **Task Management:** https://www.notion.so/1345ef417c5547618aa9bad27b078b9c
- **Ideas Database:** https://www.notion.so/30076ed822ba8085a798cfff0835ee79

## Environment Setup

**Required Variables (.env):**
- `DATABASE_URL`: PostgreSQL connection string (Supabase)
- `CLOUDFARE_R2_TOKEN_VALUE`: Cloudflare R2 API token
- `CLOUDFARE_S3_ACCESS_KEY_ID`: R2 access key
- `CLOUDFARE_S3_SECRET_ACCESS_KEY_ID`: R2 secret key
- `CLOUDFARE_S3_ENDPOINT`: R2 endpoint URL

⚠️ **SECURITY:** Never commit `.env` to version control. Ensure it's in `.gitignore`. Use environment variables in CI/CD for sensitive values.

## Development Notes

- Use Bun as the primary package manager for consistency and speed
- Maintain TypeScript strict mode for type safety
- ESLint is configured with Next.js and TypeScript rules; ensure code passes before committing
- After modifying `prisma/schema.prisma`, run `bun prisma migrate dev` to create and apply migrations
- Prisma Client is type-safe; always import from `@prisma/client` or regenerated client location
- The project is early-stage; expect architecture to evolve as features are added
