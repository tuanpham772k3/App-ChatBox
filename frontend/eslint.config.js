import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{js,jsx}"],
        ignores: ["dist"],

        extends: [
            js.configs.recommended,
            reactHooks.configs["recommended-latest"],
            reactRefresh.configs.vite,
        ],

        plugins: {
            import: importPlugin,
        },

        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },

        settings: {
            "import/resolver": {
                alias: {
                    map: [["@", path.resolve("./src")]],
                    extensions: [".js", ".jsx"],
                },
            },
        },

        rules: {
            ...importPlugin.configs.recommended.rules,
            "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
            "import/no-unresolved": "error", // Báo lỗi nếu alias sai
            "import/order": [
                "warn",
                {
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                    pathGroups: [{ pattern: "@/**", group: "internal" }],
                    pathGroupsExcludedImportTypes: ["builtin"],
                    alphabetize: { order: "asc", caseInsensitive: true },
                },
            ],
        },
    },
]);
