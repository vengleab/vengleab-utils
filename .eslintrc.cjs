module.exports = {
  ignorePatterns: ['utils/qrcode.ts', 'src/routeTree.gen.ts'],
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:import/react',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-underscore-dangle': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/extensions': ['error', 'ignorePackages', { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' }],
    // The Node resolver does not understand Vite package export conditions.
    'import/no-unresolved': ['error', { ignore: ['^vite$', '^@vitejs/plugin-react$', '^@tailwindcss/vite$', '^@tanstack/react-start/', '^nitro/vite$'] }],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  env: {
    browser: true,
    node: true,
  },
};
