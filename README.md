## turbo-forge - Full-stack Bun + React Boilerplate

Monorepo boilerplate for building a modern full‑stack app with a Bun/Elysia backend and a React/Vite frontend.

### Project structure

- **Root**
  - `package.json` – workspace scripts and dev tooling
  - `turbo.json` – Turborepo task pipeline
- **apps**
  - `apps/frontend` – React 19 + Vite 7 SPA
  - `apps/server` – Bun + Elysia HTTP API and SPA host
- **packages**
  - `packages/shared` – shared utilities/types between frontend and server

### Tech stack

- **Runtime & tooling**
  - **Bun** (`bun@1.3.4`) as package manager and server runtime
  - **TypeScript 5.9** for type checking
  - **Turborepo** for orchestrating workspace tasks
  - **Biome** + **sort-package-json** + **Prettier** for formatting
- **Backend**
  - **Elysia** as the HTTP framework
  - **@elysiajs/static**, **@elysiajs/cors**
  - **Zod** for validation
- **Frontend**
  - **React 19** + **React DOM**
  - **Vite 7** as dev server and bundler
  - **Tailwind CSS 4**, **@base-ui/react**, **shadcn/ui**, **lucide-react**, **sonner**

### Root commands

All commands are run from the repository root:

- **Install dependencies**

  ```bash
  bun ci
  ```

- **Develop (frontend + server via Turborepo)**

  ```bash
  bun dev
  ```

- **Build everything**

  ```bash
  bun compile
  # runs: compile:frontend, then compile:server
  ```

- **Start production server** (after `bun compile`)

  ```bash
  bun start
  ```

- **Type-check all packages**

  ```bash
  bun check-types
  ```

- **Format all packages**

  ```bash
  bun format
  ```

### App-level commands

- **Frontend (`apps/frontend`)**
  - `bun dev` – start Vite dev server (default port `3000`)
  - `bun compile:frontend` – type-check and build the SPA
  - `bun check-types` – TypeScript check only
  - `bun format` – format code and sort `package.json`

- **Server (`apps/server`)**
  - `bun dev` – run Elysia server in watch mode from `src/index.ts`
  - `bun compile:server` – build server code and copy frontend assets into `dist/html`
  - `bun start` – run compiled Bun server from `dist/index.js`
  - `bun check-types` – TypeScript check only
  - `bun format` – format code and sort `package.json`

### Development workflow

- **Local development**
  - Run `bun ci` once.
  - In one terminal, run `bun dev` from the repo root.
  - Frontend is served by Vite; backend runs via Elysia; the server also serves the built SPA in production.

- **Before committing**
  - Run `bun check-types` to ensure types are clean.
  - Run `bun format` to apply formatting and keep `package.json` files sorted.

- **Production build & run**
  - `bun compile` – builds frontend and backend, wiring SPA assets into `apps/server/dist/html`.
  - `bun start` – starts the compiled Bun server that serves both API and SPA.
