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
            "no-console": "warn",
            "react/prop-types": "off",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react-hooks/exhaustive-deps": "off",
            "jsx-a11y/click-events-have-key-events": "warn",
            "jsx-a11y/interactive-supports-focus": "warn",
            "prettier/prettier": "warn",
            "no-unused-vars": "off",
            "unused-imports/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "warn",

            "@typescript-eslint/no-unused-vars": ["warn", {
                args: "after-used",
                ignoreRestSiblings: false,
                argsIgnorePattern: "^_.*?$",
            }],

            "import/order": ["warn", {
                groups: [
                    "type",
                    "builtin", 
                    "object",
                    "external",
                    "internal",
                    "parent",
                    "sibling", 
                    "index"
                ],

                pathGroups: [{
                    pattern: "~/**",
                    group: "external", 
                    position: "after",
                }],

                "newlines-between": "always",
            }],

            "react/self-closing-comp": "warn",

            "react/jsx-sort-props": ["warn", {
                callbacksLast: true,
                shorthandFirst: true,
                noSortAlphabetically: false,
                reservedFirst: true,
            }],

            "padding-line-between-statements": ["warn", {
                blankLine: "always",
                prev: "*",
                next: "return",
            }, {
                blankLine: "always",
                prev: ["const", "let", "var"],
                next: "*",
            }, {
                blankLine: "any",
                prev: ["const", "let", "var"],
                next: ["const", "let", "var"],
            }],
        },
    },
];