import NTFile from "ntfile";

NTFile.exec('npx rollup -c "./scripts/rollup.config.js"');

const name = "mojix";
const input = "./src/mojix.js";

const srcCode = NTFile.loadTextFile(input);
const mmatchData = srcCode.match(/\/\*\*[\s\S]*?\*\//);

if (mmatchData !== null) {
	const fileList = [
		"./build/umd/" + name + ".min.js",
		"./build/cjs/" + name + ".min.js",
		"./build/esm/" + name + ".min.js"
	];
	const text = mmatchData[0].trim() + "\n";
	for (const fileurl of fileList) {
		NTFile.saveTextFile(fileurl, text + NTFile.loadTextFile(fileurl));
	}
}
