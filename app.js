(() => {
  const data = window.GUIDE_DATA;
  if (!data) return;

  const sections = data.sections;
  const resources = sections.flatMap((section) => section.resources);
  const sectionById = new Map(sections.map((section) => [section.id, section]));

  const els = {
    metrics: document.querySelector("#metrics"),
    stageRail: document.querySelector("#stageRail"),
    sectionTabs: document.querySelector("#sectionTabs"),
    searchInput: document.querySelector("#searchInput"),
    categorySelect: document.querySelector("#categorySelect"),
    sortSelect: document.querySelector("#sortSelect"),
    savedOnly: document.querySelector("#savedOnly"),
    clearFilters: document.querySelector("#clearFilters"),
    filterSummary: document.querySelector("#filterSummary"),
    copyTrail: document.querySelector("#copyTrail"),
    featuredGrid: document.querySelector("#featuredGrid"),
    resultLine: document.querySelector("#resultLine"),
    resourceList: document.querySelector("#resourceList"),
    emptyState: document.querySelector("#emptyState"),
    loadMore: document.querySelector("#loadMore"),
    navItems: document.querySelectorAll(".nav-item"),
    views: document.querySelectorAll(".view"),
  };

  // Global View Switcher
  window.switchView = (viewId) => {
    els.views.forEach(v => v.classList.remove('active'));
    els.navItems.forEach(i => i.classList.remove('active'));
    
    document.getElementById(`view-${viewId}`).classList.add('active');
    document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
    
    // Auto-reset filters when switching to library from roadmap
    if (viewId === 'library' && state.stage !== 'all') {
      // Keep stage if we want, or reset. Let's keep it for context.
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryLabels = {
    ambiente: "Ambiente",
    carreira: "Carreira",
    certificacao: "Certificação",
    comunidade: "Comunidade",
    curso: "Curso",
    ferramenta: "Ferramenta",
    laboratorio: "Laboratório",
    livro: "Livro",
    newsletter: "Newsletter",
    noticias: "Notícias",
    podcast: "Podcast",
    referencia: "Referência",
    site: "Site",
    visual: "Visual",
  };

  const stages = [
    {
      id: "all",
      title: "Mapa completo",
      text: "Todas as seções originais do guia.",
      tokens: [],
    },
    {
      id: "fundamentos",
      title: "Fundamentos",
      text: "Linux, redes, linguagens e base técnica.",
      tokens: ["introducao", "redes", "linux", "python", "bash", "powershell", "docker", "c#", "c++", "mysql"],
      categories: ["ambiente"],
    },
    {
      id: "pratica",
      title: "Prática guiada",
      text: "Laboratórios, CTFs e máquinas vulneráveis.",
      tokens: ["sites para estudar", "capture the flag", "maquinas virtuais", "bug bounty", "exploitation"],
      categories: ["laboratorio"],
    },
    {
      id: "web-api",
      title: "Web e API",
      text: "Aplicações, APIs, frameworks e ferramentas web.",
      tokens: ["hacking web", "api", "pentesting", "cheatsheets", "php", "java", "ruby"],
      categories: ["referencia"],
    },
    {
      id: "defesa",
      title: "Defesa e contexto",
      text: "Notícias, newsletters, comunidades e blue team.",
      tokens: ["noticias", "newsletter", "podcasts", "documentarios", "defensive", "blue team"],
      categories: ["noticias", "newsletter", "podcast", "comunidade"],
    },
    {
      id: "carreira",
      title: "Carreira",
      text: "Perfis, livros, palestras e certificações.",
      tokens: ["carreiras", "livros", "palestras", "certificacoes", "twitter", "instagram"],
      categories: ["carreira", "certificacao", "livro"],
    },
  ];

  const featuredTargets = [
    {
      label: "TryHackMe",
      query: "tryhackme.com",
      reason: "Entrada prática com salas guiadas e progressão clara.",
    },
    {
      label: "Hack The Box",
      query: "hackthebox.com",
      reason: "Máquinas e desafios para aprofundar técnica.",
    },
    {
      label: "PortSwigger",
      query: "portswigger.net",
      reason: "Referência fundamental para segurança em aplicações web.",
    },
    {
      label: "Kali Linux",
      query: "kali.org",
      reason: "Distribuição padrão para testes de intrusão.",
    },
  ];

  const state = {
    section: "all",
    stage: "all",
    category: "all",
    query: "",
    sort: "curated",
    savedOnly: false,
    visibleLimit: 48,
  };

  const PAGE_SIZE = 48;
  const saved = readSet("painel-hacking:saved");
  const done = readSet("painel-hacking:done");

  renderCategoryOptions();
  bindEvents();
  renderAll();

  function readSet(key) {
    try {
      return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      return new Set();
    }
  }

  function writeSet(key, set) {
    try {
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch {
    }
  }

  function bindEvents() {
    els.navItems.forEach(item => {
      item.addEventListener("click", () => switchView(item.dataset.view));
    });

    els.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      resetVisibleLimit();
      renderAll();
    });

    els.categorySelect.addEventListener("change", (event) => {
      state.category = event.target.value;
      resetVisibleLimit();
      renderAll();
    });

    els.sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      resetVisibleLimit();
      renderAll();
    });

    els.savedOnly.addEventListener("click", () => {
      state.savedOnly = !state.savedOnly;
      els.savedOnly.classList.toggle("active", state.savedOnly);
      resetVisibleLimit();
      renderAll();
    });

    els.clearFilters.addEventListener("click", () => {
      state.section = "all";
      state.stage = "all";
      state.category = "all";
      state.query = "";
      state.sort = "curated";
      state.savedOnly = false;
      resetVisibleLimit();
      els.searchInput.value = "";
      els.categorySelect.value = "all";
      els.sortSelect.value = "curated";
      els.savedOnly.classList.remove("active");
      renderAll();
    });

    els.sectionTabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-section]");
      if (!button) return;
      state.section = button.dataset.section;
      resetVisibleLimit();
      renderAll();
    });

    els.stageRail.addEventListener("click", (event) => {
      const button = event.target.closest("[data-stage]");
      if (!button) return;
      state.stage = button.dataset.stage;
      resetVisibleLimit();
      renderAll();
      switchView('library');
    });

    els.resourceList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const target = button.dataset.id;
      const bucket = button.dataset.action === "save" ? saved : done;
      const key = button.dataset.action === "save" ? "painel-hacking:saved" : "painel-hacking:done";

      if (bucket.has(target)) {
        bucket.delete(target);
      } else {
        bucket.add(target);
      }

      writeSet(key, bucket);
      renderAll();
    });

    els.copyTrail.addEventListener("click", async () => {
      const list = getFilteredResources().slice(0, 80);
      const text = list.map((resource, index) => `${index + 1}. ${resource.title} - ${resource.url}`).join("\n");
      await copyText(text);
      pulseButton(els.copyTrail, "Copiado!");
    });

    els.loadMore.addEventListener("click", () => {
      state.visibleLimit += PAGE_SIZE;
      renderResources();
    });
  }

  function renderAll() {
    renderMetrics();
    renderStages();
    renderTabs();
    renderFilterSummary();
    renderFeatured();
    renderResources();
  }

  function renderCategoryOptions() {
    const categories = [...data.categories].sort((a, b) =>
      labelCategory(a).localeCompare(labelCategory(b), "pt-BR"),
    );
    els.categorySelect.innerHTML = [
      '<option value="all">Todos</option>',
      ...categories.map((category) => `<option value="${escapeAttr(category)}">${escapeHtml(labelCategory(category))}</option>`),
    ].join("");
  }

  function resetVisibleLimit() {
    state.visibleLimit = PAGE_SIZE;
  }

  function renderFilterSummary() {
    const chips = [];
    const selectedSection = sectionById.get(state.section);
    const selectedStage = stages.find((stage) => stage.id === state.stage);

    if (selectedStage && selectedStage.id !== "all") chips.push(selectedStage.title);
    if (selectedSection) chips.push(selectedSection.title);
    if (state.category !== "all") chips.push(labelCategory(state.category));
    if (state.savedOnly) chips.push("Salvos");
    if (state.query.trim()) chips.push(`Busca: ${state.query.trim()}`);

    els.filterSummary.innerHTML = chips.map((chip) => `<span class="filter-chip">${escapeHtml(chip)}</span>`).join("");
  }

  function renderMetrics() {
    const filtered = resources; // Showing total metrics in dashboard
    const completed = resources.filter((resource) => done.has(resource.id)).length;
    const progress = resources.length ? Math.round((completed / resources.length) * 100) : 0;
    const stats = [
      [data.totals.resources.toLocaleString("pt-BR"), "Recursos"],
      [data.totals.sections.toLocaleString("pt-BR"), "Seções"],
      [saved.size.toLocaleString("pt-BR"), "Salvos"],
      [`${progress}%`, "Concluído"],
    ];

    els.metrics.innerHTML = stats
      .map(([value, label]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`)
      .join("");
  }

  function renderStages() {
    els.stageRail.innerHTML = stages
      .map((stage) => {
        const count = resources.filter((resource) => matchesStage(resource, stage)).length;
        const active = stage.id === state.stage ? " is-active" : "";
        return `
          <button class="stage-button${active}" type="button" data-stage="${escapeAttr(stage.id)}">
            <strong>${escapeHtml(stage.title)}</strong>
            <span>${escapeHtml(stage.text)}</span>
            <small>${count.toLocaleString("pt-BR")} recursos disponíveis</small>
          </button>
        `;
      })
      .join("");
  }

  function renderTabs() {
    const allActive = state.section === "all" ? " is-active" : "";
    const tabs = [
      `
        <button class="tab-button${allActive}" type="button" data-section="all">
          <span>Tudo</span>
          <span>${resources.length.toLocaleString("pt-BR")}</span>
        </button>
      `,
      ...sections.map((section) => {
        const active = section.id === state.section ? " is-active" : "";
        return `
          <button class="tab-button${active}" type="button" data-section="${escapeAttr(section.id)}">
            <span>${escapeHtml(section.title)}</span>
            <span>${section.resources.length.toLocaleString("pt-BR")}</span>
          </button>
        `;
      }),
    ];

    els.sectionTabs.innerHTML = tabs.join("");
  }

  function renderFeatured() {
    const picks = featuredTargets
      .map((target) => {
        const found = findFeatured(target);
        return found ? { ...target, resource: found } : null;
      })
      .filter(Boolean);

    els.featuredGrid.innerHTML = picks
      .map(
        (pick) => `
          <article class="featured-card">
            <span class="badge" data-category="${escapeAttr(pick.resource.category)}">${escapeHtml(labelCategory(pick.resource.category))}</span>
            <strong>${escapeHtml(pick.label)}</strong>
            <p>${escapeHtml(pick.reason)}</p>
            <a href="${escapeAttr(safeUrl(pick.resource.url))}" target="_blank" rel="noreferrer">Acessar plataforma ↗</a>
          </article>
        `,
      )
      .join("");
  }

  function renderResources() {
    const list = getFilteredResources();
    const visibleList = list.slice(0, state.visibleLimit);
    const totalCount = list.length.toLocaleString("pt-BR");

    els.resultLine.textContent = `${visibleList.length} de ${totalCount} recursos`;
    els.emptyState.hidden = list.length > 0;
    els.resourceList.hidden = list.length === 0;
    els.resourceList.innerHTML = visibleList.map(renderResourceCard).join("");
    els.loadMore.hidden = state.visibleLimit >= list.length;
  }

  function renderResourceCard(resource) {
    const note = resource.note || resource.group || "";
    const shortNote = note.length > 140 ? `${note.slice(0, 137)}...` : note;
    const savedActive = saved.has(resource.id) ? " is-active" : "";
    const doneActive = done.has(resource.id) ? " is-active" : "";
    const doneState = done.has(resource.id) ? " is-done" : "";

    return `
      <article class="resource-card${doneState}" data-category="${escapeAttr(resource.category)}">
        <div class="card-meta">
          <span class="badge" data-category="${escapeAttr(resource.category)}">${escapeHtml(labelCategory(resource.category))}</span>
          <span class="section-chip">${escapeHtml(resource.sectionTitle)}</span>
        </div>
        <h3>
          <a href="${escapeAttr(safeUrl(resource.url))}" target="_blank" rel="noreferrer">${escapeHtml(resource.title)}</a>
        </h3>
        ${shortNote ? `<p class="note">${escapeHtml(shortNote)}</p>` : ""}
        <div class="domain-line">${escapeHtml(resource.domain || "link externo")}</div>
        <div class="card-actions">
          <button class="mini-button${savedActive}" type="button" data-action="save" data-id="${escapeAttr(resource.id)}">
            ★ Salvar
          </button>
          <button class="mini-button${doneActive}" type="button" data-action="done" data-id="${escapeAttr(resource.id)}">
            ✓ Feito
          </button>
          <a class="mini-button" href="${escapeAttr(safeUrl(resource.url))}" target="_blank" rel="noreferrer">
            ↗ Abrir
          </a>
        </div>
      </article>
    `;
  }

  function getFilteredResources() {
    const selectedSection = sectionById.get(state.section);
    const selectedStage = stages.find((stage) => stage.id === state.stage) || stages[0];
    const query = normalize(state.query);
    let list = selectedSection ? [...selectedSection.resources] : [...resources];

    list = list.filter((resource) => matchesStage(resource, selectedStage));

    if (state.category !== "all") {
      list = list.filter((resource) => resource.category === state.category);
    }

    if (state.savedOnly) {
      list = list.filter((resource) => saved.has(resource.id));
    }

    if (query) {
      list = list.filter((resource) =>
        normalize(
          `${resource.title} ${resource.note} ${resource.group} ${resource.sectionTitle} ${resource.domain} ${resource.url}`,
        ).includes(query),
      );
    }

    return sortResources(list);
  }

  function sortResources(list) {
    const sectionIndex = new Map(sections.map((section, index) => [section.id, index]));
    const sorts = {
      title: (a, b) => a.title.localeCompare(b.title, "pt-BR"),
      domain: (a, b) => a.domain.localeCompare(b.domain, "pt-BR") || a.title.localeCompare(b.title, "pt-BR"),
      section: (a, b) =>
        sectionIndex.get(a.sectionId) - sectionIndex.get(b.sectionId) || a.sourceLine - b.sourceLine,
      curated: (a, b) => scoreResource(b) - scoreResource(a) || a.sourceLine - b.sourceLine,
    };

    return list.sort(sorts[state.sort] || sorts.curated);
  }

  function scoreResource(resource) {
    const text = normalize(`${resource.title} ${resource.url} ${resource.domain}`);
    const priorities = ["tryhackme", "hackthebox", "portswigger", "overthewire", "root-me", "letsdefend", "owasp", "burp", "wireshark", "kali", "nmap", "metasploit", "linux", "python"];
    const index = priorities.findIndex((item) => text.includes(item));
    const priority = index >= 0 ? 100 - index * 4 : 0;
    const savedBoost = saved.has(resource.id) ? 18 : 0;
    return priority + savedBoost;
  }

  function matchesStage(resource, stage) {
    if (!stage || stage.id === "all") return true;
    if (stage.categories?.includes(resource.category)) return true;
    const text = normalize(`${resource.title} ${resource.sectionTitle} ${resource.category} ${resource.group} ${resource.note}`);
    return stage.tokens.some((token) => text.includes(normalize(token)));
  }

  function findFeatured(target) {
    const query = normalize(target.query);
    return resources.find((resource) => normalize(`${resource.title} ${resource.url} ${resource.domain}`).includes(query));
  }

  function labelCategory(category) {
    return categoryLabels[category] || category;
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => {
      const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return map[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
    } catch {
      return "#";
    }
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {}
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  function pulseButton(button, label) {
    const original = button.innerHTML;
    button.textContent = label;
    window.setTimeout(() => {
      button.innerHTML = original;
    }, 1200);
  }
})();
