import react from "@eslint-react/eslint-plugin";
import js from "@eslint/js";
import * as tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
import reactRefresh from 'eslint-plugin-react-refresh'
import unusedImports from 'eslint-plugin-unused-imports'

/**
 * ESLint configuration.
 * @see https://eslint.org/docs/latest/use/configure/
 */
export default defineConfig(
    {
        ignores: [
            "dist",
            "node_modules",
            "supabase",
            "src/web/ui/components/shadcn/**/*",
        ],
    },

    // Base configs for all files
    js.configs.recommended,
    ...ts.configs.recommended,

    // // Node.js environment (servers, scripts, config files)
    // {
    //     files: [
    //         "src/api/**/*",
    //     ],
    //     languageOptions: {
    //         globals: { ...globals.node },
    //     },
    // },

    // React environment (frontend apps, email templates)
    {
        ...react.configs["recommended-typescript"],
        files: [
            "**/*.{ts,tsx}",
        ],
        plugins: {
            ...react.configs["recommended-typescript"].plugins,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            security: security,
            "unused-imports": unusedImports,
        },
        rules: {
            ...react.configs["recommended-typescript"].rules,
            "@eslint-react/dom/no-missing-iframe-sandbox": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@eslint-react/no-forward-ref": "off",
            "react-hooks/exhaustive-deps": "off",

            "react-hooks/rules-of-hooks": "error",
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                jsxImportSource: "react",
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
        },
    },

    // Prettier must be last to override any formatting rules
    prettierConfig,
);