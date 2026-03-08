# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SROI Reports DB App** is a public database and reporting platform for a Social Return on Investment (SROI) agency. The application is built with modern TypeScript-based tooling across the entire stack.

**Tech Stack:**
- **Frontend:** Next.js 16.1.6 with React 19.2.3 and TypeScript 5
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

**Key Architectural Considerations:**
- Database integration is not yet implemented; plan for API routes or server actions as needed
- Currently bootstrapped with minimal pages; expand under `app/` following Next.js conventions
- All components are TypeScript-first; maintain strict type checking

## Common Commands

### Development
```bash
bun dev         # Start dev server (http://localhost:3000)
bun build       # Build for production
bun start       # Start production server
bun lint        # Run ESLint
```

### Useful Patterns
- **API Routes:** Create under `app/api/[route]/route.ts` for server endpoints
- **Layouts:** Organize layout hierarchies in `app/` for nested page structures
- **Metadata:** Define page metadata using Next.js `Metadata` export in layout or page files

## Key Resources

- **Task Management:** https://www.notion.so/1345ef417c5547618aa9bad27b078b9c
- **Ideas Database:** https://www.notion.so/30076ed822ba8085a798cfff0835ee79

## Development Notes

- Use Bun as the primary package manager for consistency and speed
- Maintain TypeScript strict mode for type safety
- ESLint is configured with Next.js and TypeScript rules; ensure code passes before committing
- The project is early-stage; expect architecture to evolve as features are added
