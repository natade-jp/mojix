// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import jestPlugin from "eslint-plugin-jest";
import unicornPlugin from "eslint-plugin-unicorn";

export default [
	js.configs.recommended,

	{
		ignores: [
			"**/node_modules/**",
			"**/build/**",
			"**/out/**",
			"**/html/**",
			"**/docs/**",

			"**/*.md",
			"package.json",
			"package-lock.json"
		]
	},
	
	{
		files: ["**/*.js"],
		ignores: ["build/**", "dist/**", "coverage/**", "node_modules/**"],
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
			// ---- あなたの元ルール ----
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

			// ---- 16進数を大文字（unicorn v62 形式）----
			"unicorn/number-literal-case": ["error", { hexadecimalValue: "uppercase" }],

			// ---- Prettierっぽい整形（autofixされやすいやつ中心）----
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
			"func-call-spacing": ["error", "never"]

			// printWidth: 120 相当
			// "max-len": ["warn", { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }]
		}
	},

	// Jest globals（テストだけ）
	{
		files: ["**/*.{test,spec}.js", "**/__tests__/**/*.js"],
		languageOptions: {
			globals: {
				...globals.jest
			}
		}
	}
];
