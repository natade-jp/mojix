// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import jestPlugin from "eslint-plugin-jest";
import unicornPlugin from "eslint-plugin-unicorn";
import jsoncPlugin from "eslint-plugin-jsonc";
import * as jsoncParser from "jsonc-eslint-parser";

export default [
	// ---- ESLint recommended ----
	js.configs.recommended,

	// ---- Global ignore ----
	{
		ignores: [
			"**/node_modules/**",
			"**/build/**",
			"**/dist/**",
			"**/out/**",
			"**/html/**",
			"**/docs/**",

			"**/*.md",
			"package-lock.json"
		]
	},

	// ---- JSON ----
	{
		files: ["**/*.json"],
		languageOptions: {
			parser: jsoncParser
		},
		plugins: {
			jsonc: jsoncPlugin
		},
		rules: {
			"jsonc/indent": ["error", "tab"],
			"jsonc/quotes": ["error", "double"],
			"jsonc/comma-dangle": ["error", "never"],
			"jsonc/object-curly-spacing": ["error", "always"],
			"jsonc/array-bracket-spacing": ["error", "never"],

			// 強制整形寄り
			"jsonc/object-curly-newline": ["error", { multiline: true, consistent: true }]
		}
	},

	// ---- JS ----
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			jest: jestPlugin,
			unicorn: unicornPlugin
		},
		rules: {
			indent: ["error", "tab", { SwitchCase: 1 }],
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "double", { avoidEscape: true }],
			semi: ["error", "always"],
			"comma-dangle": ["error", "never"],

			"no-constant-condition": 1,
			"no-unused-vars": 1,
			"no-console": 1,
			"no-var": 2,
			"prefer-const": 2,

			// 16進数は大文字
			"unicorn/number-literal-case": ["error", { hexadecimalValue: "uppercase" }],

			// Prettier 寄り（autofix重視）
			"quote-props": ["error", "as-needed"],
			"object-curly-spacing": ["error", "always"],
			"array-bracket-spacing": ["error", "never"],
			"computed-property-spacing": ["error", "never"],
			"comma-spacing": ["error", { before: false, after: true }],
			"key-spacing": ["error", { beforeColon: false, afterColon: true }],
			"keyword-spacing": ["error", { before: true, after: true }],
			"space-infix-ops": "error",
			"space-before-blocks": ["error", "always"],
			"block-spacing": ["error", "always"],
			"space-in-parens": ["error", "never"],
			"func-call-spacing": ["error", "never"],

			"no-trailing-spaces": "error",
			"eol-last": ["error", "always"],
			"no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
			"padded-blocks": ["error", "never"],

			"comma-style": ["error", "last"],
			"brace-style": ["error", "1tbs", { allowSingleLine: true }],
			curly: ["error", "all"],
			"semi-spacing": ["error", { before: false, after: true }],
			"space-unary-ops": ["error", { words: true, nonwords: false }],

			"object-curly-newline": ["error", { multiline: true, consistent: true }],
			"object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
			"function-paren-newline": ["error", "multiline-arguments"],
			"operator-linebreak": ["error", "before"],

			"unicorn/prefer-string-slice": "error",
			"unicorn/prefer-includes": "error",
			"unicorn/no-useless-undefined": "error"
			
			// printWidth: 120 相当
			// "max-len": ["warn", { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }]
		}
	},

	// ---- Jest（テスト専用）----
	{
		files: ["**/*.{test,spec}.js", "**/__tests__/**/*.js"],
		languageOptions: {
			globals: {
				...globals.jest
			}
		}
	}
];
