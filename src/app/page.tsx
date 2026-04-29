"use client";

import { useEffect, useMemo, useState } from "react";
import guideDataJson from "@/data/guide-data.json";

type Resource = {
  id: string;
  title: string;
  url: string;
  domain: string;
  note: string;
  category: string;
  group: string;
  language: string;
  sectionId: string;
  sectionTitle: string;
  sourceLine: number;
};

type Section = {
  id: string;
  title: string;
  rawTitle: string;
  sourceLine: number;
  summary: string;
  resources: Resource[];
};

type GuideData = {
  source: {
    repository: string;
    rawReadme: string;
  };
  totals: {
    sections: number;
    resources: number;
    domains: number;
    categories: number;
  };
  categories: string[];
  sections: Section[];
};

type Stage = {
  id: string;
  title: string;
  text: string;
  tokens: string[];
  categories?: string[];
};

const guideData = guideDataJson as GuideData;
const sections = guideData.sections;
const resources = sections.flatMap((section) => section.resources);
const sectionById = new Map(sections.map((section) => [section.id, section]));
const PAGE_SIZE = 48;

const categoryLabels: Record<string, string> = {
  ambiente: "Ambiente",
  carreira: "Carreira",
  certificacao: "Certificacao",
  comunidade: "Comunidade",
  curso: "Curso",
  ferramenta: "Ferramenta",
  laboratorio: "Laboratorio",
  livro: "Livro",
  newsletter: "Newsletter",
  noticias: "Noticias",
  podcast: "Podcast",
  referencia: "Referencia",
  site: "Site",
  visual: "Visual",
};

const stages: Stage[] = [
  {
    id: "all",
    title: "Mapa completo",
    text: "Todas as secoes originais do guia.",
    tokens: [],
  },
  {
    id: "fundamentos",
    title: "Fundamentos",
    text: "Linux, redes, linguagens e base tecnica.",
    tokens: ["introducao", "redes", "linux", "python", "bash", "powershell", "docker", "c#", "c++", "mysql"],
    categories: ["ambiente"],
  },
  {
    id: "pratica",
    title: "Pratica guiada",
    text: "Laboratorios, CTFs e maquinas vulneraveis.",
    tokens: ["sites para estudar", "capture the flag", "maquinas virtuais", "bug bounty", "exploitation"],
    categories: ["laboratorio"],
  },
  {
    id: "web-api",
    title: "Web e API",
    text: "Aplicacoes, APIs, frameworks e ferramentas web.",
    tokens: ["hacking web", "api", "pentesting", "cheatsheets", "php", "java", "ruby"],
    categories: ["referencia"],
  },
  {
    id: "defesa",
    title: "Defesa e contexto",
    text: "Noticias, newsletters, comunidades e blue team.",
    tokens: ["noticias", "newsletter", "podcasts", "documentarios", "defensive", "blue team"],
    categories: ["noticias", "newsletter", "podcast", "comunidade"],
  },
  {
    id: "carreira",
    title: "Carreira",
    text: "Perfis, livros, palestras e certificacoes.",
    tokens: ["carreiras", "livros", "palestras", "certificacoes", "twitter", "instagram"],
    categories: ["carreira", "certificacao", "livro"],
  },
];

const stageIcons: Record<string, React.ReactNode> = {
  all: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 15 15" aria-hidden="true">
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="9" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  ),
  fundamentos: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 15 15" aria-hidden="true">
      <polyline points="2,3.5 6.5,7.5 2,11.5" />
      <line x1="8.5" y1="11.5" x2="13" y2="11.5" />
    </svg>
  ),
  pratica: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 15 15" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" />
      <circle cx="7.5" cy="7.5" r="2" />
    </svg>
  ),
  "web-api": (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 15 15" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" />
      <ellipse cx="7.5" cy="7.5" rx="2.5" ry="5.5" />
      <line x1="2" y1="7.5" x2="13" y2="7.5" />
    </svg>
  ),
  defesa: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 15 15" aria-hidden="true">
      <path d="M7.5 1.5L2 4v3.5c0 3 2.4 5.6 5.5 6.5 3.1-.9 5.5-3.5 5.5-6.5V4L7.5 1.5z" />
    </svg>
  ),
  carreira: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 15 15" aria-hidden="true">
      <path d="M5 4.5V3.5a1 1 0 011-1h3a1 1 0 011 1v1" />
      <rect x="1.5" y="4.5" width="12" height="8" rx="1" />
      <line x1="7.5" y1="7.5" x2="7.5" y2="9.5" />
    </svg>
  ),
};

const featuredTargets = [
  {
    label: "TryHackMe",
    query: "tryhackme.com",
    reason: "Entrada pratica com salas guiadas e progresso claro.",
  },
  {
    label: "Hack The Box",
    query: "hackthebox.com",
    reason: "Laboratorios, maquinas e desafios para evoluir com contexto real.",
  },
  {
    label: "PortSwigger Academy",
    query: "portswigger.net",
    reason: "Referencia objetiva para seguranca web e testes de aplicacoes.",
  },
  {
    label: "Burp Suite",
    query: "burp suite",
    reason: "Ferramenta central para proxy, inspecao e validacao de aplicacoes.",
  },
  {
    label: "OWASP ZAP",
    query: "zap proxy",
    reason: "Proxy aberto para estudo, automacao e auditorias autorizadas.",
  },
  {
    label: "Nmap",
    query: "nmap",
    reason: "Base para descoberta, inventario e leitura de superficie.",
  },
];

export default function HomePage() {
  const [section, setSection] = useState("all");
  const [stage, setStage] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("curated");
  const [savedOnly, setSavedOnly] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [done, setDone] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setSaved(readSet("painel-hacking:saved"));
    setDone(readSet("painel-hacking:done"));
  }, []);

  const selectedSection = sectionById.get(section);
  const selectedStage = stages.find((item) => item.id === stage) ?? stages[0];
  const categories = useMemo(
    () =>
      [...guideData.categories].sort((a, b) =>
        labelCategory(a).localeCompare(labelCategory(b), "pt-BR"),
      ),
    [],
  );

  const filteredResources = useMemo(() => {
    const queryText = normalize(query);
    const base = selectedSection ? [...selectedSection.resources] : [...resources];

    let list = base.filter((resource) => matchesStage(resource, selectedStage));

    if (category !== "all") {
      list = list.filter((resource) => resource.category === category);
    }

    if (savedOnly) {
      list = list.filter((resource) => saved.has(resource.id));
    }

    if (queryText) {
      list = list.filter((resource) =>
        normalize(
          `${resource.title} ${resource.note} ${resource.group} ${resource.sectionTitle} ${resource.domain} ${resource.url}`,
        ).includes(queryText),
      );
    }

    return sortResources(list, sort, saved);
  }, [category, query, saved, savedOnly, selectedSection, selectedStage, sort]);

  const visibleResources = filteredResources.slice(0, visibleLimit);
  const visibleDomains = new Set(filteredResources.map((resource) => resource.domain).filter(Boolean)).size;
  const completedInFilter = filteredResources.filter((resource) => done.has(resource.id)).length;
  const progress = filteredResources.length ? Math.round((completedInFilter / filteredResources.length) * 100) : 0;
  const shouldShowFeatured =
    section === "all" && stage === "all" && category === "all" && !query && !savedOnly;
  const featuredResources = shouldShowFeatured ? getFeaturedResources() : [];

  const headerTitle = selectedSection
    ? selectedSection.title
    : selectedStage.id === "all"
      ? "Biblioteca completa"
      : selectedStage.title;
  const headerSummary = selectedSection
    ? selectedSection.summary ||
      `${selectedSection.resources.length.toLocaleString("pt-BR")} recursos preservados dessa secao do guia.`
    : "Todos os links externos extraidos do guia, com filtros para transformar a lista em uma trilha de estudo.";

  const activeChips = [
    selectedStage.id !== "all" ? selectedStage.title : "",
    selectedSection ? selectedSection.title : "",
    category !== "all" ? labelCategory(category) : "",
    savedOnly ? "Salvos" : "",
    query.trim() ? `Busca: ${query.trim()}` : "",
  ].filter(Boolean);

  function resetVisibleLimit() {
    setVisibleLimit(PAGE_SIZE);
  }

  function updateSection(value: string) {
    setSection(value);
    resetVisibleLimit();
  }

  function updateStage(value: string) {
    setStage(value);
    resetVisibleLimit();
  }

  function toggleSaved(id: string) {
    setSaved((current) => toggleStoredSet(current, id, "painel-hacking:saved"));
  }

  function toggleDone(id: string) {
    setDone((current) => toggleStoredSet(current, id, "painel-hacking:done"));
  }

  async function copyTrail() {
    const text = filteredResources
      .slice(0, 80)
      .map((resource, index) => `${index + 1}. ${resource.title} - ${resource.url}`)
      .join("\n");
    await copyText(text);
  }

  function clearFilters() {
    setSection("all");
    setStage("all");
    setCategory("all");
    setQuery("");
    setSort("curated");
    setSavedOnly(false);
    resetVisibleLimit();
  }

  return (
    <>
      <a className="skip-link" href="#resourceList">
        Pular para recursos
      </a>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Painel Hacking Etico">
          <span className="brand-mark" aria-hidden="true">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 16 16">
              <polyline points="2,4 7,8 2,12" />
              <line x1="9" y1="12" x2="14" y2="12" />
            </svg>
          </span>
          <span>
            <strong>Painel Hacking</strong>
            <small>Roadmap etico</small>
          </span>
        </a>

        <nav className="top-actions" aria-label="Acoes rapidas">
          <a className="ghost-link" href="#resourceList">
            Biblioteca
          </a>
          <a className="ghost-link" href={guideData.source.repository} target="_blank" rel="noreferrer">
            Fonte
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="heroTitle">
          <div className="hero-copy">
            <p className="eyebrow">Hacking etico com metodo</p>
            <h1 id="heroTitle">Aprenda seguranca ofensiva sem se perder em listas infinitas.</h1>
            <p>
              Um ambiente de estudo enxuto para explorar fundamentos, laboratorios, ferramentas,
              comunidades e certificacoes com foco e clareza.
            </p>
          </div>
        </section>

        <section className="control-band" aria-label="Filtros">
          <label className="search-box" htmlFor="searchInput">
            <span aria-hidden="true">/</span>
            <input
              id="searchInput"
              type="search"
              autoComplete="off"
              placeholder="Buscar por tema, site, ferramenta ou dominio"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetVisibleLimit();
              }}
            />
          </label>

          <label className="select-box" htmlFor="categorySelect">
            <span>Tipo</span>
            <select
              id="categorySelect"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                resetVisibleLimit();
              }}
            >
              <option value="all">Todos</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {labelCategory(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="select-box" htmlFor="sortSelect">
            <span>Ordem</span>
            <select
              id="sortSelect"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                resetVisibleLimit();
              }}
            >
              <option value="curated">Relevancia</option>
              <option value="title">A-Z</option>
              <option value="section">Secao original</option>
              <option value="domain">Dominio</option>
            </select>
          </label>

          <button
            className="text-button"
            type="button"
            aria-pressed={savedOnly}
            onClick={() => {
              setSavedOnly((current) => !current);
              resetVisibleLimit();
            }}
          >
            Salvos
          </button>

          <button className="text-button" type="button" onClick={clearFilters}>
            Limpar
          </button>

          <div className="filter-summary" aria-live="polite">
            <span className="summary-count">
              {Math.min(visibleLimit, filteredResources.length).toLocaleString("pt-BR")} de{" "}
              {filteredResources.length.toLocaleString("pt-BR")} recursos
            </span>
            {activeChips.map((chip) => (
              <span className="filter-chip" key={chip}>
                {chip}
              </span>
            ))}
          </div>
        </section>

        <section className="metrics" aria-label="Resumo do guia">
          <Metric value={guideData.totals.resources.toLocaleString("pt-BR")} label="links importados" />
          <Metric value={guideData.totals.sections.toLocaleString("pt-BR")} label="abas organizadas" />
          <Metric value={saved.size.toLocaleString("pt-BR")} label="salvos locais" />
          <Metric value={`${progress}%`} label="progresso no filtro" />
        </section>

        <section className="roadmap-band" aria-labelledby="stageTitle">
          <div>
            <p className="eyebrow">Trilha</p>
            <h2 id="stageTitle">Sequencia recomendada</h2>
          </div>
          <div className="stage-rail" role="list">
            {stages.map((item) => (
              <button
                className={`stage-button ${item.id === stage ? "is-active" : ""}`}
                type="button"
                key={item.id}
                onClick={() => updateStage(item.id)}
              >
                <span className="stage-icon">{stageIcons[item.id]}</span>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
                <small>
                  {resources.filter((resource) => matchesStage(resource, item)).length.toLocaleString("pt-BR")} links
                </small>
              </button>
            ))}
          </div>
        </section>

        <section className="workspace">
          <aside className="section-nav" aria-label="Abas do guia">
            <div className="nav-head">
              <span>Abas</span>
              <strong>{sections.length.toLocaleString("pt-BR")}</strong>
            </div>
            <nav className="tabs">
              <button
                className={`tab-button ${section === "all" ? "is-active" : ""}`}
                type="button"
                onClick={() => updateSection("all")}
              >
                <span>Biblioteca completa</span>
                <span>{resources.length.toLocaleString("pt-BR")}</span>
              </button>
              {sections.map((item) => (
                <button
                  className={`tab-button ${item.id === section ? "is-active" : ""}`}
                  type="button"
                  key={item.id}
                  onClick={() => updateSection(item.id)}
                >
                  <span>{item.title}</span>
                  <span>{item.resources.length.toLocaleString("pt-BR")}</span>
                </button>
              ))}
            </nav>
          </aside>

          <section className="workbench" aria-labelledby="activeTitle">
            <div className="workbench-head">
              <div>
                <p className="eyebrow">{selectedStage.id !== "all" ? selectedStage.title : "Todos os recursos"}</p>
                <h2 id="activeTitle">{headerTitle}</h2>
                <p id="activeSummary">{headerSummary}</p>
              </div>

              <div className="head-actions">
                <button className="text-button" type="button" onClick={copyTrail}>
                  Copiar trilha
                </button>
              </div>
            </div>

            {featuredResources.length > 0 && (
              <div className="featured-grid">
                {featuredResources.map((item) => (
                  <article className="featured-card" key={item.target.label}>
                    <span className="badge" data-category={item.resource.category}>
                      {labelCategory(item.resource.category)}
                    </span>
                    <strong>{item.target.label}</strong>
                    <p>{item.target.reason}</p>
                    <a href={safeUrl(item.resource.url)} target="_blank" rel="noreferrer">
                      Abrir recurso →
                    </a>
                  </article>
                ))}
              </div>
            )}

            <div className="result-line">
              {visibleResources.length.toLocaleString("pt-BR")} de{" "}
              {filteredResources.length.toLocaleString("pt-BR")} recursos em{" "}
              {visibleDomains.toLocaleString("pt-BR")} dominios
            </div>

            {filteredResources.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhum recurso nesse filtro.</strong>
                <span>Ajuste a busca, o tipo ou a aba selecionada.</span>
              </div>
            ) : (
              <div className="resource-grid" id="resourceList" aria-live="polite">
                {visibleResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isSaved={saved.has(resource.id)}
                    isDone={done.has(resource.id)}
                    onSave={() => toggleSaved(resource.id)}
                    onDone={() => toggleDone(resource.id)}
                  />
                ))}
              </div>
            )}

            {visibleLimit < filteredResources.length && (
              <button className="load-more" type="button" onClick={() => setVisibleLimit((value) => value + PAGE_SIZE)}>
                Carregar mais recursos
              </button>
            )}
          </section>
        </section>
      </main>

      <footer className="footer">
        <span>Dados extraidos do README publico do Guia de Cyber Security.</span>
        <a href={guideData.source.repository} target="_blank" rel="noreferrer">
          Abrir repositorio
        </a>
      </footer>
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ResourceCard({
  resource,
  isSaved,
  isDone,
  onSave,
  onDone,
}: {
  resource: Resource;
  isSaved: boolean;
  isDone: boolean;
  onSave: () => void;
  onDone: () => void;
}) {
  const note = resource.note || resource.group || "";
  const shortNote = note.length > 170 ? `${note.slice(0, 167)}...` : note;

  return (
    <article className={`resource-card ${isDone ? "is-done" : ""}`} data-category={resource.category}>
      <div className="card-meta">
        <span className="badge" data-category={resource.category}>
          {labelCategory(resource.category)}
        </span>
        <span className="section-chip" title={resource.sectionTitle}>
          {resource.sectionTitle}
        </span>
      </div>

      <h3>
        <a href={safeUrl(resource.url)} target="_blank" rel="noreferrer">
          {resource.title}
        </a>
      </h3>

      {shortNote && <p className="note">{shortNote}</p>}

      <div className="domain-line">{resource.domain || "link externo"}</div>

      <div className="card-actions">
        <button className={`mini-button ${isSaved ? "is-active" : ""}`} type="button" aria-pressed={isSaved} onClick={onSave}>
          Salvar
        </button>
        <button className={`mini-button ${isDone ? "is-active" : ""}`} type="button" aria-pressed={isDone} onClick={onDone}>
          Feito
        </button>
        <a className="mini-button" href={safeUrl(resource.url)} target="_blank" rel="noreferrer">
          Abrir
        </a>
      </div>
    </article>
  );
}

function getFeaturedResources() {
  return featuredTargets
    .map((target) => {
      const query = normalize(target.query);
      const resource = resources.find((item) => normalize(`${item.title} ${item.url} ${item.domain}`).includes(query));
      return resource ? { target, resource } : null;
    })
    .filter((item): item is { target: (typeof featuredTargets)[number]; resource: Resource } => Boolean(item));
}

function labelCategory(category: string) {
  return categoryLabels[category] || category;
}

function matchesStage(resource: Resource, stageItem: Stage) {
  if (stageItem.id === "all") return true;
  if (stageItem.categories?.includes(resource.category)) return true;
  const text = normalize(`${resource.title} ${resource.sectionTitle} ${resource.category} ${resource.group} ${resource.note}`);
  return stageItem.tokens.some((token) => text.includes(normalize(token)));
}

function sortResources(list: Resource[], sort: string, saved: Set<string>) {
  const sectionIndex = new Map(sections.map((item, index) => [item.id, index]));
  const sorted = [...list];

  const sorts: Record<string, (a: Resource, b: Resource) => number> = {
    title: (a, b) => a.title.localeCompare(b.title, "pt-BR"),
    domain: (a, b) => a.domain.localeCompare(b.domain, "pt-BR") || a.title.localeCompare(b.title, "pt-BR"),
    section: (a, b) => (sectionIndex.get(a.sectionId) ?? 0) - (sectionIndex.get(b.sectionId) ?? 0) || a.sourceLine - b.sourceLine,
    curated: (a, b) => scoreResource(b, saved) - scoreResource(a, saved) || a.sourceLine - b.sourceLine,
  };

  return sorted.sort(sorts[sort] || sorts.curated);
}

function scoreResource(resource: Resource, saved: Set<string>) {
  const text = normalize(`${resource.title} ${resource.url} ${resource.domain}`);
  const priorities = [
    "tryhackme",
    "hackthebox",
    "portswigger",
    "overthewire",
    "root-me",
    "letsdefend",
    "owasp",
    "burp",
    "wireshark",
    "kali",
    "nmap",
    "metasploit",
    "linux",
    "python",
  ];
  const index = priorities.findIndex((item) => text.includes(item));
  const priority = index >= 0 ? 100 - index * 4 : 0;
  const savedBoost = saved.has(resource.id) ? 18 : 0;
  const categoryBoost = ["laboratorio", "ferramenta", "curso", "referencia"].includes(resource.category) ? 8 : 0;
  return priority + savedBoost + categoryBoost;
}

function readSet(key: string) {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set<string>();
  }
}

function toggleStoredSet(current: Set<string>, id: string, key: string) {
  const next = new Set(current);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  try {
    localStorage.setItem(key, JSON.stringify([...next]));
  } catch {
    return next;
  }
  return next;
}

function normalize(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fallback below.
    }
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}
