import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

/**
 * 公開用ファイルの設定データを作成
 * @param {string} banner - バナー
 * @param {string} moduleName - ライブラリ名
 * @param {string} input_name - 入力となるES6のライブラリのトップファイル名
 * @param {string} output_name - 出力するファイル名
 * @param {string} format - umd, cjs, esm
 * @param {boolean} isUglify - コードを最小化させるか否か
 */
const createData = function (banner, moduleName, input_name, output_name, format, isUglify) {
	const data = {};
	data.output = {};
	if (format === "umd" || format === "iife") {
		data.output.name = moduleName;
	}
	data.output.file = output_name;
	data.output.format = format;
	data.input = input_name;
	/**
	 * @type {import("rollup").Plugin[]}
	 */
	data.plugins = [];

	data.plugins.push(resolve()); // node_modules を解決
	data.plugins.push(commonjs()); // CommonJS を解決

	if (isUglify) {
		data.output.banner = banner;
		data.plugins.push(terser({
			format: {
				comments: /^!/
			}
		}));
	}

	return data;
};

const banner = `/*!
 * Mojix
 * AUTHOR: natade (https://twitter.com/natadea, https://github.com/natade-jp/)
 * LICENSE: MIT https://opensource.org/licenses/MIT
 */`;
const name = "mojix";
const input = "./src/mojix.js";
const data = [];

data.push(createData(banner, name, input, "./dist/umd/" + name + ".js", "umd", false));
data.push(createData(banner, name, input, "./dist/umd/" + name + ".min.js", "umd", true));
data.push(createData(banner, name, input, "./dist/cjs/" + name + ".js", "cjs", false));
data.push(createData(banner, name, input, "./dist/esm/" + name + ".js", "esm", false));

const types = {
	input: "./tmp/types/mojix.d.ts",
	output: {
		file: "./dist/types/mojix.d.ts",
		format: "es"
	},
	plugins: [dts()]
};

data.push(types);

export default data;
