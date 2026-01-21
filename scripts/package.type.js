import NTFile from "ntfile";

NTFile.exec("npx tsc -p ./scripts/tsconfig.json");

const targets = ["cjs", "umd", "esm"];
const src = "./build/type/mojix.d.ts";

for (const target of targets) {
	NTFile.copy(src, `./build/${target}/mojix.min.d.ts`);
}
