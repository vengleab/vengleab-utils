# CLAUDE.md

## Commands

- `npm run dev` — start the development server on port 3001
- `npm run build` — produce a production build
- `npm start` — start the production server on port 3001
- `npm run typecheck` — check TypeScript
- `npm run lint` — run ESLint

## Architecture

TanStack Start provides server rendering and TanStack Router handles routing. Vite builds the application, and Nitro provides the production server and Vercel integration. The React application and its utility tools are written in TypeScript.

Tool components live in `pages/`. Each URL has a route wrapper under `src/routes/`; the root route provides the document, global stylesheet, fonts, and command palette. `components/Layout` provides the page layout and metadata. Navigation uses `constants/PageURL.ts` and `constants/Tools.ts`.

`src/subdomains.ts`, `src/router.tsx`, and `src/server.ts` preserve the tool-specific subdomains of `svl-labs.uk`. When adding a tool, create its route and update the menu, tool list, sidebar icon, and, if desired, subdomain mapping.

Tools operate primarily in the browser. Storage helpers in `utils/storage/` namespace local storage; browser-only APIs must not run during server rendering. Global styling uses Tailwind CSS v4, with CSS modules for individual components.
