import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import react from '@eslint-react/eslint-plugin';
import imports from 'eslint-plugin-import-x';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', '.output/**', '.vercel/**', '.tanstack/**', 'dist/**', 'src/routeTree.gen.ts'] },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { '@typescript-eslint': tsPlugin, 'import-x': imports, '@stylistic': stylistic, ...react.configs['recommended-typescript'].plugins },
    rules: {
      ...react.configs['recommended-typescript'].rules,
      ...imports.flatConfigs.recommended.rules,
      ...stylistic.configs.customize({ semi: true, quotes: 'single', arrowParens: true, jsx: true }).rules,
      // TypeScript checks undeclared names, including names used only as types.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-shadow': 'error',
      'import-x/no-unresolved': ['error', { ignore: ['^vite$', '^@vitejs/plugin-react$', '^@tailwindcss/vite$', '^@tanstack/react-start/', '^nitro/vite$'] }],
      'import-x/extensions': ['error', 'ignorePackages', { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' }],
    },
    settings: { 'import-x/resolver': { node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] } } },
  },
  { files: ['**/*.{js,cjs}'], languageOptions: { globals: { ...globals.node } } },
];
