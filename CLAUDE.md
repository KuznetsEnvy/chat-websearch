# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

When implementing new functionality, avoid creating new icons, and search for the most applicable icon from `components/icons.tsx`  

```bash
# Install dependencies
pnpm install

# Start development server with Turbo
pnpm dev

# Build the application (runs database migration first)
pnpm build

# Start production server
pnpm start
```

### Database

```bash
# Run database migrations
pnpm db:migrate

# Generate migrations from schema changes
pnpm db:generate

# View database via web UI
pnpm db:studio

# Push schema changes to the database
pnpm db:push

# Pull schema from the database
pnpm db:pull

# Check database schema changes
pnpm db:check

# Apply pending migrations
pnpm db:up
```

### Code Quality

```bash
# Run linting
pnpm lint

# Run linting with automatic fixes
pnpm lint:fix

# Format code
pnpm format
```

### Testing

```bash
# Run Playwright tests
pnpm test
```

## Environment Setup

This project requires several environment variables to function properly:

1. `AUTH_SECRET` - Secret for NextAuth.js authentication
2. `OPENAI_API_KEY` - API key for OpenAI services
3. `POSTGRES_URL` - URL for PostgreSQL database

## Architecture

### Application Structure

- **App Router**: Utilizes Next.js App Router with routes divided into authentication `(auth)` and chat `(chat)` route groups
- **API Routes**: Organized by feature within the app directory (`/app/**/api/`)
- **Components**: Shared UI components in `/components` with shadcn/ui primitives in `/components/ui`
- **Lib**: Core utilities and services organized by domain

### Chat System

- Built on Vercel's AI SDK with custom providers
- `myProvider` configures different language and image models
- Supports multiple chat models with reasoning capabilities
- Includes web search integration via Perplexity
- Uses streaming for real-time responses

### Authentication

- Built on NextAuth with JWT strategy
- Supports both guest and registered users
- Entitlement system restricts features based on user type
- Session data includes user type and available models

### Storage

- PostgreSQL with Drizzle ORM for structured data
- Vercel Blob for file storage (images, etc.)
- Redis for caching (optional)

### AI Features

- Multiple model providers (xAI, OpenAI) 
- Model selection UI for users to choose capabilities
- Reasoning engine for advanced responses
- Supports both text and multimodal inputs
- Artifact system for creating and editing documents, code, images, etc.

### Testing

- Playwright for E2E testing
- Custom test fixtures for authentication and chat functionality
- Mock responses for AI services in tests
