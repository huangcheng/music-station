// eslint-disable-next-line unicorn/import-style
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import unicorn from 'eslint-plugin-unicorn';
import { recommended } from '@cspell/eslint-plugin/configs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/generated/**',
    ],
  },
  //...compat.extends('next/core-web-vitals', 'next/typescript'),
  unicorn.configs.recommended,
  // jsdoc.configs['flat/recommended-typescript-error'],
  recommended,
  ...compat.config({
    extends: [
      'next',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      'plugin:import/typescript',
      'plugin:import/react',
    ],
    plugins: ['prettier', 'import'],
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'unicorn/no-abusive-eslint-disable': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
    },
  }),
];

export default eslintConfig;
