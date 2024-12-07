import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsLint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['*', '!src', '**/.next/', '**/node_modules/', '**/styled-system/'],
  },
  ...compat.extends('next'),
  {
    plugins: {
      '@typescript-eslint': tsLint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11Y,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 12,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },

        project: './tsconfig.json',
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...tsLint.configs.recommended.rules,
      ...jsxA11Y.configs.recommended.rules,
      ...prettier.configs.recommended.rules,

      'react-hooks/exhaustive-deps': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/__mocks__/**/*.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.*'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/naming-convention': 'off',
    },
  },
];
