// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import jestPlugin from "eslint-plugin-jest";
import unicornPlugin from "eslint-plugin-unicorn";
import prettierConfig from "eslint-config-prettier";

export default [
	// eslint:recommended 相当（旧 "extends": ["eslint:recommended"]）
	js.configs.recommended,

	// あなたのプロジェクト設定（旧 .eslintrc.json の本体）
	{
	files: ["**/*.js"],
	ignores: [
		// 必要に応じて追加
		"build/**",
		"dist/**",
		"coverage/**",
		"node_modules/**"
	],
	languageOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
		globals: {
		// 旧 env: browser / node 相当
		...globals.browser,
		...globals.node
		}
	},
	plugins: {
		// flat config では「名前: プラグイン本体」
		jest: jestPlugin,
		unicorn: unicornPlugin
	},
	rules: {
		// ---- 旧 rules を移植 ----
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

		// ---- 追加：16進数リテラルを大文字にする ----
		"unicorn/number-literal-case": ["error", { hexadecimal: "uppercase" }]
	}
	},

	// 旧 "extends": ["prettier"] 相当
	// Prettier と競合する ESLint の整形系ルールを無効化
	prettierConfig,

	// 旧 env: "jest/globals": true 相当
	// テストファイルのみ Jest globals を有効化
	{
	files: ["**/*.{test,spec}.js", "**/__tests__/**/*.js"],
	languageOptions: {
		globals: {
		...globals.jest
		}
	}
	}
];