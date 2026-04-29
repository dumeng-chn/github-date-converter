import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default defineConfig([
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.greasemonkey,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-console': 'off',
        },
    },
    {
        ignores: ['dist/', 'dist-dev/', 'dist-greasyfork/', 'node_modules/'],
    },
]);
