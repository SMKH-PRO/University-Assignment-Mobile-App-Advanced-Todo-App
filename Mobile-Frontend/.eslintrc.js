module.exports = {
  root: true,
  extends: [
    '@react-native',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jest/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native', 'jest'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    'jest/globals': true,
    'react-native/react-native': true,
  },
  rules: {
    // Override rules here
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'space-in-parens': ['error', 'never'],
    'react/prop-types': 'error',
    'eqeqeq': ['warn', 'always'],
    '@typescript-eslint/no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true,
    }],
    '@typescript-eslint/no-shadow': 'warn',
    'react/no-unstable-nested-components': ['warn', { allowAsProps: false }],

    // Explicitly disable the problematic rule
    '@typescript-eslint/func-call-spacing': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  // This fixes the "Property 'userReducer' does not exist on type 'PersistPartial'" errors
  ignorePatterns: ['node_modules/', 'ios/', 'android/', '**/*.d.ts'],
};
