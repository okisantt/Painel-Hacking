import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const inputPath = path.join(root, "data", "guideData.js");
const outputDir = path.join(root, "src", "data");
const outputPath = path.join(outputDir, "guide-data.json");

const context = { window: {} };
vm.runInNewContext(readFileSync(inputPath, "utf8"), context);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(context.window.GUIDE_DATA, null, 2)}\n`, "utf8");

console.log(`Exported ${context.window.GUIDE_DATA.totals.resources} resources to ${outputPath}`);
