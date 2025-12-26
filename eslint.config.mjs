import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import jsx_a11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    {
        ignores: [
            "node_modules/**",
            ".next/**", 
            "out/**",
            "dist/**",
            ".now/*",
            "*.css",
            ".changeset",
            "esm/*",
            "public/*",
            "tests/*",
            "scripts/*",
            "*.config.js",
            ".DS_Store",
            "coverage",
            "build"
        ],
    },
    ...compat.extends(
        "next/core-web-vitals", 
        "plugin:react/recommended", 
        "plugin:prettier/recommended",
        "plugin:jsx-a11y/recommended"
    ),
    {
        plugins: {
            react,
            "unused-imports": unusedImports,
            import: importPlugin,
            "@typescript-eslint": typescriptEslint,
            "jsx-a11y": jsx_a11y,
            prettier,
            "react-hooks": reactHooks,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 12,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        settings: {
            react: {
                version: "detect",
            },
        },

        rules: {
            "no-console": "off",
            "react/prop-types": "off",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react-hooks/exhaustive-deps": "off",
            "jsx-a11y/click-events-have-key-events": "off",
            "jsx-a11y/interactive-supports-focus": "off",
            "prettier/prettier": "off",
            "no-unused-vars": "off",
            "unused-imports/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "import/order": "off",
            "react/self-closing-comp": "off",
            "react/jsx-sort-props": "off",
            "padding-line-between-statements": "off",
        },
    },
];