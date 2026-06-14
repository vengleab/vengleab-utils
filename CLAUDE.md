# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server on port 3001
- `npm run build` — production build
- `npm run start` — start production server on port 3001 (run `build` first)
- `npm run lint` — run ESLint over the project
- `npm run lint:fix` — run ESLint with autofix

There is no test suite configured.

## Architecture

This is a Next.js (pages router) app collecting small standalone developer/finance utility tools ("DevTools Toolkit"). Each tool is a self-contained page under `pages/`.

### Adding a new tool/page

A new tool requires updates in three places, which together drive routing, sidebar nav, and the landing page grid:

1. **`pages/<tool-name>.jsx`** (or a folder with an `index.jsx`) — the tool's page component, wrapped in `Layout` from `components/Layout`.
2. **`constants/PageURL.js`** — add a `PAGE.<NAME>` route constant and a corresponding entry in `MENU_ITEMS` (key, display `name`, and `page`). `MENU_ITEMS` drives the sidebar.
3. **`constants/Tools.js`** — add an entry to the `TOOLS` array (id matching the `MENU_ITEMS` key, name, description, `lucide-react` icon, and Tailwind color/bg/border classes) for the landing page tool grid.
4. **`components/MySideBar/index.jsx`** — add the tool's id -> `lucide-react` icon mapping in `ICON_MAP` so the sidebar renders the right icon.

### Layout and navigation

- `components/Layout/index.jsx` wraps every page: sets `<Head>` metadata (title/description/OG/Twitter tags), renders `MySideBar` (hidden on the landing page `PAGE.INDEX`), and provides the scrollable main content area.
- `components/MySideBar/index.jsx` renders navigation from `MENU_ITEMS`, supports search/filter, collapse, and mobile overlay states, and highlights the active route via `useRouter().pathname`.

### Shared utilities/components

- `utils/` — shared helpers (`JWTUtils.js`, `base64.js`, `qrcode.js`, `storage/`).
- `components/DatePicker`, `components/InputMask`, `components/JsonViewer`, `components/table-converter` — reusable UI building blocks shared across tool pages.

### Styling

- Tailwind CSS v4 (via `@tailwindcss/postcss`), global styles in `styles/index.css`.
- ESLint config extends `airbnb-base`, `eslint:recommended`, and React plugin rules, parsed with `babel-eslint`.
