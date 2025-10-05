import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

const tsParser = tseslint.parser;

export default defineConfig([
	// Global configuration
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},

	// Base configs
	js.configs.recommended,
	...tseslint.configs.recommended,
	astro.configs.recommended,
	astro.configs["jsx-a11y-recommended"],

	// React setup
	{
		files: ["**/*.{ts,tsx,jsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
				sourceType: "module",
				ecmaVersion: "latest",
				project: "./tsconfig.json",
			},
		},
		plugins: {
			react,
			"react-hooks": reactHooks,
		},
		rules: {
			"react/jsx-uses-react": "off",
			"react/react-in-jsx-scope": "off",
			"react-hooks/rules-of-hooks": "error", // 👈 Now matches the plugin key
			"react-hooks/exhaustive-deps": "warn",
		},
		settings: {
			react: {
				version: "detect",
			},
		},
	},

	// Astro setup
	{
		files: ["**/*.astro"],
		languageOptions: {
			parser: astro.parser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: [".astro"],
				sourceType: "module",
				ecmaVersion: "latest",
				project: "./tsconfig.json",
			},
		},
		rules: {
			"no-undef": "off", // Astro provides globals (e.g. ImageMetadata)
			"@typescript-eslint/no-explicit-any": "off",
		},
	},

	// Prettier setup (disable rules conflicting with Prettier)
	prettier,

	// Ignore patterns
	{
		ignores: ["dist/**", "**/*.d.ts", ".github/"],
	},
]);
