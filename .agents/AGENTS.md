# Workspace Rules & Knowledge

## Sandbox Constraints & Node/npm Executions
- **The Issue**: Executing package installations (`npm install`) or run scripts (`npm run <command>`) fails because Node/npm tries to read files in the NVM installation path (`/Users/macbookpro/.nvm`) and temporary directories (`/var/folders`) that are outside the workspace and restricted by the sandboxed shell environment.
- **The Solution**: 
  1. For styling/highlighting libraries (like PrismJS, Monaco, etc.), load resources dynamically from public CDNs inside the React client-side lifecycle (`useEffect`) instead of installing them via npm.
  2. For parser/computation utilities, prefer implementing lightweight, custom pure-JS helpers (like `utils/cron.js`) to keep the workbench 100% self-contained and run-time independent.
  3. If npm CLI usage is absolutely necessary, request specific `read_file` permissions for the active Node version directory (e.g., `/Users/macbookpro/.nvm/versions/node/v22.22.2`), `write_file` for the npm cache directory (e.g., `/Users/macbookpro/.npm`), and use `unsandboxed` actions.
