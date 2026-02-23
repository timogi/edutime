# EduTime Monorepo

Monorepo containing the EduTime web application and mobile app, powered by npm workspaces.

## Structure

```
apps/
  web/          Next.js web application (@edutime/web)
  mobile/       Expo React Native mobile app (@edutime/mobile)
packages/
  shared/       Shared TypeScript types and utilities (@edutime/shared)
```

## Prerequisites

- Node.js >= 20
- npm (comes with Node.js)
- [EAS CLI](https://docs.expo.dev/build/introduction/) for mobile builds: `npm install -g eas-cli`

## Getting Started

### Install all dependencies

```bash
npm install
```

This installs dependencies for all workspaces (web, mobile, shared) and applies patches automatically.

### Install a package in a specific workspace

```bash
# Add a package to the web app
npm install <package-name> -w @edutime/web

# Add a package to the mobile app
npm install <package-name> -w @edutime/mobile

# Add a package to the shared library
npm install <package-name> -w @edutime/shared
```

## Development

### Web App (Next.js)

```bash
npm run dev:web
```

Starts the Next.js dev server.

### Mobile App (Expo)

```bash
# Start Expo dev server
npm run dev:mobile

# Start directly on iOS simulator
npm run dev:mobile:ios

# Start directly on Android emulator
npm run dev:mobile:android
```

## Building

### Web App

```bash
npm run build:web
```

### Mobile App (EAS Build)

```bash
# Build for iOS
npm run build:mobile:ios

# Build for Android
npm run build:mobile:android

# Build for both platforms
npm run build:mobile:all
```

EAS build profiles (development, preview, production) are configured in `apps/mobile/eas.json`. To specify a profile, run eas directly:

```bash
cd apps/mobile
eas build --platform ios --profile preview
```

## Linting & Type Checking

```bash
# Lint all workspaces
npm run lint

# Type check all workspaces
npm run typecheck
```

## Shared Package

The `@edutime/shared` package (`packages/shared/`) contains shared TypeScript types used by both apps. Import from it like this:

```ts
import { UserData, Category, TimeRecord } from '@edutime/shared'
```

Both apps have path aliases configured so TypeScript resolves the source directly -- no build step needed for the shared package during development.

### Update Database Types

To regenerate the Supabase database types, run from `apps/web/`:

```bash
npx supabase gen types typescript --project-id "byxozdvpisjlxfsajmwv" --schema public,billing,license,legal > ./packages/shared/src/database.types.ts
```
