import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "source", "guiadecybersecurity.README.md");
const outputDir = path.join(root, "data");
const outputPath = path.join(outputDir, "guideData.js");

const source = readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");
const lines = source.split("\n");

function cleanText(value) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromHeading(value) {
  return cleanText(value.replace(/:[a-z0-9_+-]+:/gi, "")).replace(/^[-:.\s]+/, "");
}

function slugify(value, fallback) {
  const slug = titleFromHeading(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function normalizeUrl(url) {
  return url.replace(/[),.;\]]+$/g, "");
}

function labelFromUrl(url) {
  const domain = domainFromUrl(url);
  if (!domain) return "Link externo";

  const parts = new URL(url).pathname.split("/").filter(Boolean);
  if (domain.includes("youtube.com") && url.includes("playlist")) return "Playlist do YouTube";
  if (domain.includes("youtube.com") || domain.includes("youtu.be")) return "Video do YouTube";
  if (!parts.length) return domain;

  return `${domain}/${parts.slice(0, 2).join("/")}`;
}

function languageFromGroup(group) {
  if (!group) return "multilingue";
  const normalized = group.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("portugues")) return "pt";
  if (normalized.includes("ingles")) return "en";
  if (normalized.includes("espanhol")) return "es";
  if (normalized.includes("frances")) return "fr";
  if (normalized.includes("hindi")) return "hi";
  return "multilingue";
}

function classifyResource(sectionTitle, title, url, note, isImage) {
  const haystack = `${sectionTitle} ${title} ${note} ${url}`.toLowerCase();
  const domain = domainFromUrl(url);

  if (isImage || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return "visual";
  if (haystack.includes("certifica")) return "certificacao";
  if (haystack.includes("livro") || haystack.includes("book")) return "livro";
  if (haystack.includes("twitter") || haystack.includes("instagram") || haystack.includes("reddit") || haystack.includes("discord")) return "comunidade";
  if (haystack.includes("newsletter")) return "newsletter";
  if (haystack.includes("noticia") || haystack.includes("news") || haystack.includes("magazine") || haystack.includes("bleepingcomputer") || haystack.includes("hacker news")) return "noticias";
  if (haystack.includes("podcast")) return "podcast";
  if (haystack.includes("youtube") || domain.includes("youtube.com") || domain.includes("youtu.be") || haystack.includes("curso") || haystack.includes("academy")) return "curso";
  if (haystack.includes("capture the flag") || haystack.includes("ctf") || haystack.includes("hack the box") || haystack.includes("tryhackme") || haystack.includes("root-me") || haystack.includes("overthewire")) return "laboratorio";
  if (haystack.includes("ferramenta") || haystack.includes("framework") || haystack.includes("pentest") || haystack.includes("hacking web") || haystack.includes("mobile") || haystack.includes("hardware hacking")) return "ferramenta";
  if (haystack.includes("linux") || haystack.includes("maquinas virtuais") || haystack.includes("virtual")) return "ambiente";
  if (haystack.includes("carreira") || haystack.includes("career") || haystack.includes("job")) return "carreira";
  if (haystack.includes("cheatsheet") || haystack.includes("cheat sheet")) return "referencia";
  return "site";
}

function extractMarkdownLinks(line) {
  const matches = [];
  const pattern = /(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
  let match;

  while ((match = pattern.exec(line)) !== null) {
    matches.push({
      raw: match[0],
      index: match.index,
      title: cleanText(match[2]) || labelFromUrl(match[3]),
      url: normalizeUrl(match[3]),
      isImage: Boolean(match[1]),
    });
  }

  return matches;
}

function extractHtmlLinks(line) {
  const matches = [];
  const pattern = /<a\s+[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let match;

  while ((match = pattern.exec(line)) !== null) {
    matches.push({
      raw: match[0],
      index: match.index,
      title: labelFromUrl(match[1]),
      url: normalizeUrl(match[1]),
      isImage: false,
    });
  }

  return matches;
}

function extractLooseUrls(line) {
  const matches = [];
  const pattern = /https?:\/\/[^\s<>"'\])]+/g;
  let match;

  while ((match = pattern.exec(line)) !== null) {
    const url = normalizeUrl(match[0]);
    matches.push({
      raw: match[0],
      index: match.index,
      title: labelFromUrl(url),
      url,
      isImage: /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url) || domainFromUrl(url) === "img.shields.io",
      loose: true,
    });
  }

  return matches;
}

const sections = [
  {
    id: "1-fonte-e-comunidade",
    title: "Fonte e comunidade",
    rawTitle: "Fonte e comunidade",
    sourceLine: 1,
    summary: "",
    resources: [],
    _lines: [],
  },
];
let current = sections[0];

lines.forEach((line, index) => {
  const heading = line.match(/^##\s+(.+)$/);
  if (heading) {
    const title = titleFromHeading(heading[1]);
    current = {
      id: `${sections.length + 1}-${slugify(title, `secao-${sections.length + 1}`)}`,
      title,
      rawTitle: heading[1],
      sourceLine: index + 1,
      summary: "",
      resources: [],
    };
    sections.push(current);
    return;
  }

  if (!current) return;

  current._lines ??= [];
  current._lines.push({ text: line, number: index + 1 });
});

let resourceCounter = 0;

for (const section of sections) {
  let group = "";
  const summaryLines = [];
  const seenAtLine = new Set();

  for (const item of section._lines) {
    const line = item.text;
    const trimmed = line.trim();
    const mdLinks = extractMarkdownLinks(line);
    const htmlLinks = extractHtmlLinks(line);
    const looseLinks = extractLooseUrls(line);
    const allLinks = [...mdLinks, ...htmlLinks, ...looseLinks].filter((link) => {
      const key = link.url;
      if (seenAtLine.has(key)) return false;
      seenAtLine.add(key);
      return true;
    });

    if (trimmed.startsWith(">") && allLinks.length === 0) {
      const text = cleanText(trimmed.replace(/^>\s*/, ""));
      if (text.length > 0 && text.length <= 110) group = text;
      if (summaryLines.length < 3 && text.length > 0 && text.length <= 260) summaryLines.push(text);
    } else if (summaryLines.length < 2 && allLinks.length === 0) {
      const text = cleanText(trimmed);
      if (text.length > 30 && text.length <= 240) summaryLines.push(text);
    }

    for (const link of allLinks) {
      const noteStart = link.index + link.raw.length;
      const note = cleanText(line.slice(noteStart).replace(/^[\s:;,-]+/, ""));
      const title = link.title || labelFromUrl(link.url);
      const category = classifyResource(section.title, title, link.url, note, link.isImage);

      section.resources.push({
        id: `r${++resourceCounter}`,
        title,
        url: link.url,
        domain: domainFromUrl(link.url),
        note,
        category,
        group,
        language: languageFromGroup(group),
        sectionId: section.id,
        sectionTitle: section.title,
        sourceLine: item.number,
      });
    }
  }

  section.summary = summaryLines.join(" ");
  delete section._lines;
}

const resources = sections.flatMap((section) => section.resources);
const categories = [...new Set(resources.map((resource) => resource.category))].sort();
const domains = [...new Set(resources.map((resource) => resource.domain).filter(Boolean))].sort();
const visibleSections = sections.filter((section) => section.resources.length > 0);

const data = {
  generatedAt: new Date().toISOString(),
  source: {
    repository: "https://github.com/arthurspk/guiadecybersecurity",
    rawReadme: "https://raw.githubusercontent.com/arthurspk/guiadecybersecurity/main/README.md",
  },
  totals: {
    sections: visibleSections.length,
    resources: resources.length,
    domains: domains.length,
    categories: categories.length,
  },
  categories,
  sections: visibleSections,
};

mkdirSync(outputDir, { recursive: true });
writeFileSync(
  outputPath,
  `window.GUIDE_DATA = ${JSON.stringify(data, null, 2)};\n`,
  "utf8",
);

console.log(`Generated ${resources.length} resources in ${visibleSections.length} sections.`);
console.log(`Output: ${outputPath}`);
