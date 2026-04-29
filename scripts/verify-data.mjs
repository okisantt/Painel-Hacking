import { readFileSync } from "node:fs";
import vm from "node:vm";

const markdown = readFileSync("source/guiadecybersecurity.README.md", "utf8");
const context = { window: {} };
vm.runInNewContext(`${readFileSync("data/guideData.js", "utf8")};`, context);

const dataUrls = new Set(
  context.window.GUIDE_DATA.sections.flatMap((section) =>
    section.resources.map((resource) => resource.url),
  ),
);

const rawUrls = [...markdown.matchAll(/https?:\/\/[^\s\]<>"]+/g)].map((match) =>
  match[0].replace(/\)-$/g, "").replace(/[),.;\]]+$/g, ""),
);

const missing = [...new Set(rawUrls.filter((url) => !dataUrls.has(url)))];

console.log({
  rawUnique: new Set(rawUrls).size,
  dataUnique: dataUrls.size,
  missing: missing.length,
});

if (missing.length > 0) {
  console.log(missing.slice(0, 30).join("\n"));
}
