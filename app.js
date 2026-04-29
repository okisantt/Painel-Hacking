(() => {
  const data = window.GUIDE_DATA;
  if (!data) return;

  const sections = data.sections;
  const resources = sections.flatMap((section) => section.resources);
  const sectionById = new Map(sections.map((section) => [section.id, section]));

  /* ----------------------------------------------------------
     Inline SVG icons (lucide-style)
     ---------------------------------------------------------- */
  const icons = {
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 17-6.2 3.6 1.6-7-5.4-4.7 7-.6L12 2l3 6.3 7 .6-5.4 4.7 1.6 7Z"/></svg>',
    starFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="m12 17-6.2 3.6 1.6-7-5.4-4.7 7-.6L12 2l3 6.3 7 .6-5.4 4.7 1.6 7Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 17 9 5 9-5"/><path d="m3 12 9 5 9-5"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 8-5 4 5 4"/><path d="m15 8 5 4-5 4"/></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 3 3-3 3"/><path d="M12 17h6"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>',
    server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><circle cx="7" cy="7.5" r="0.5" fill="currentColor"/><circle cx="7" cy="16.5" r="0.5" fill="currentColor"/></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v3M7.5 17 11 11M16.5 17 13 11"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4Z"/></svg>',
    bug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="6" width="8" height="14" rx="4"/><path d="M8 12H4M20 12h-4M9 6V4M15 6V4M7 9 4 8M17 9l3-1M7 15l-3 1M17 15l3 1"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V4h13l-2 4 2 4H4"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    rss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5" fill="currentColor"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="8" r="2.5"/><path d="M16 14a5 5 0 0 1 5 5"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
    bookOpen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 0 1 2-2h5v18H5a2 2 0 0 1-2-2Z"/><path d="M21 5a2 2 0 0 0-2-2h-5v18h5a2 2 0 0 0 2-2Z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.7a2 2 0 0 1 3.4 0l8 14A2 2 0 0 1 20 21H4a2 2 0 0 1-1.7-3Z"/><path d="M12 9v5"/><circle cx="12" cy="17.5" r="0.5" fill="currentColor"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 22l7.1-7.1 1.7-1.7a5 5 0 0 0 0-7.1Z"/></svg>',
    languages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h12"/><path d="M9 4v4M11 16l4-8 4 8M12 14h6"/><path d="M5 14a8 8 0 0 0 6-6"/></svg>',
    cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15a6 6 0 0 1 7 0"/><circle cx="12" cy="18.5" r="0.5" fill="currentColor"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 4 14 8-14 8Z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13"/><path d="M12 8c-2 0-4-1-4-3s2-2 3-1l1 4 1-4c1-1 3 0 3 1s-2 3-4 3Z"/></svg>',
  };

  /* ----------------------------------------------------------
     Map section keywords/emoji → icon
     ---------------------------------------------------------- */
  function iconForSection(section) {
    const raw = (section.rawTitle || section.title || '').toLowerCase();
    const map = [
      ['fonte', icons.heart],
      ['carreira', icons.briefcase],
      ['doaç', icons.gift],
      ['e-book', icons.bookOpen],
      ['ebook', icons.bookOpen],
      ['aviso', icons.alert],
      ['traduç', icons.languages],
      ['introduç', icons.sparkles],
      ['linux', icons.terminal],
      ['windows', icons.server],
      ['mac', icons.cpu],
      ['rede', icons.network],
      ['network', icons.network],
      ['hardware', icons.cpu],
      ['python', icons.code],
      ['bash', icons.terminal],
      ['powershell', icons.terminal],
      ['c#', icons.code],
      ['c++', icons.code],
      ['php', icons.code],
      ['java', icons.code],
      ['ruby', icons.code],
      ['mysql', icons.server],
      ['docker', icons.cpu],
      ['ferramenta', icons.layers],
      ['hacking web', icons.bug],
      ['web', icons.globe],
      ['api', icons.code],
      ['cheatsheet', icons.bookOpen],
      ['ctf', icons.flag],
      ['capture the flag', icons.flag],
      ['máquina', icons.server],
      ['maquina', icons.server],
      ['site', icons.globe],
      ['bug bounty', icons.bug],
      ['exploit', icons.bug],
      ['pentest', icons.shield],
      ['offensive', icons.shield],
      ['defensive', icons.shield],
      ['blue team', icons.shield],
      ['red team', icons.shield],
      ['osint', icons.eye],
      ['forensic', icons.eye],
      ['malware', icons.bug],
      ['cripto', icons.lock],
      ['crypt', icons.lock],
      ['notícia', icons.rss],
      ['noticia', icons.rss],
      ['newsletter', icons.rss],
      ['podcast', icons.mic],
      ['document', icons.play],
      ['vídeo', icons.play],
      ['video', icons.play],
      ['canal', icons.play],
      ['twitter', icons.users],
      ['instagram', icons.users],
      ['discord', icons.users],
      ['comunidade', icons.users],
      ['palestra', icons.users],
      ['certifica', icons.award],
      ['livro', icons.bookOpen],
      ['lab', icons.target],
      ['wifi', icons.wifi],
      ['mobile', icons.cpu],
      ['android', icons.cpu],
      ['ios', icons.cpu],
    ];
    for (const [needle, svg] of map) {
      if (raw.includes(needle)) return svg;
    }
    return icons.folder;
  }

  /* ----------------------------------------------------------
     Element refs
     ---------------------------------------------------------- */
  const els = {
    metrics: document.querySelector('#metrics'),
    stageRail: document.querySelector('#stageRail'),
    sectionTabs: document.querySelector('#sectionTabs'),
    searchInput: document.querySelector('#searchInput'),
    searchClear: document.querySelector('#searchClear'),
    categorySelect: document.querySelector('#categorySelect'),
    sortSelect: document.querySelector('#sortSelect'),
    savedOnly: document.querySelector('#savedOnly'),
    clearFilters: document.querySelector('#clearFilters'),
    filterSummary: document.querySelector('#filterSummary'),
    copyTrail: document.querySelector('#copyTrail'),
    featuredGrid: document.querySelector('#featuredGrid'),
    resultLine: document.querySelector('#resultLine'),
    resourceList: document.querySelector('#resourceList'),
    emptyState: document.querySelector('#emptyState'),
    emptyClear: document.querySelector('#emptyClear'),
    loadMore: document.querySelector('#loadMore'),
    filterToggle: document.querySelector('#filterToggle'),
    filterPanel: document.querySelector('#filterPanel'),
    filterCount: document.querySelector('#filterCount'),
    topbarSaved: document.querySelector('#topbarSaved'),
    toast: document.querySelector('#toast'),
    toastText: document.querySelector('#toastText'),
    navItems: document.querySelectorAll('[data-view]'),
    views: document.querySelectorAll('.view'),
  };

  /* ----------------------------------------------------------
     Static data
     ---------------------------------------------------------- */
  const categoryLabels = {
    ambiente: 'Ambiente',
    carreira: 'Carreira',
    certificacao: 'Certificação',
    comunidade: 'Comunidade',
    curso: 'Curso',
    ferramenta: 'Ferramenta',
    laboratorio: 'Laboratório',
    livro: 'Livro',
    newsletter: 'Newsletter',
    noticias: 'Notícias',
    podcast: 'Podcast',
    referencia: 'Referência',
    site: 'Site',
    visual: 'Visual',
  };

  const stages = [
    {
      id: 'all',
      title: 'Mapa completo',
      text: 'Todas as seções originais do guia.',
      tokens: [],
    },
    {
      id: 'fundamentos',
      title: 'Fundamentos',
      text: 'Linux, redes, linguagens e base técnica.',
      tokens: ['introducao', 'redes', 'linux', 'python', 'bash', 'powershell', 'docker', 'c#', 'c++', 'mysql'],
      categories: ['ambiente'],
    },
    {
      id: 'pratica',
      title: 'Prática guiada',
      text: 'Laboratórios, CTFs e máquinas vulneráveis.',
      tokens: ['sites para estudar', 'capture the flag', 'maquinas virtuais', 'bug bounty', 'exploitation'],
      categories: ['laboratorio'],
    },
    {
      id: 'web-api',
      title: 'Web e API',
      text: 'Aplicações, APIs, frameworks e ferramentas web.',
      tokens: ['hacking web', 'api', 'pentesting', 'cheatsheets', 'php', 'java', 'ruby'],
      categories: ['referencia'],
    },
    {
      id: 'defesa',
      title: 'Defesa e contexto',
      text: 'Notícias, newsletters, comunidades e blue team.',
      tokens: ['noticias', 'newsletter', 'podcasts', 'documentarios', 'defensive', 'blue team'],
      categories: ['noticias', 'newsletter', 'podcast', 'comunidade'],
    },
    {
      id: 'carreira',
      title: 'Carreira',
      text: 'Perfis, livros, palestras e certificações.',
      tokens: ['carreiras', 'livros', 'palestras', 'certificacoes', 'twitter', 'instagram'],
      categories: ['carreira', 'certificacao', 'livro'],
    },
  ];

  const featuredTargets = [
    { label: 'TryHackMe', query: 'tryhackme.com', reason: 'Entrada prática com salas guiadas e progressão clara.' },
    { label: 'Hack The Box', query: 'hackthebox.com', reason: 'Máquinas e desafios para aprofundar técnica.' },
    { label: 'PortSwigger', query: 'portswigger.net', reason: 'Referência fundamental para segurança em aplicações web.' },
    { label: 'Kali Linux', query: 'kali.org', reason: 'Distribuição padrão para testes de intrusão.' },
  ];

  const metricIcons = {
    Recursos: icons.layers,
    Seções: icons.book,
    Salvos: icons.bookmark,
    Concluído: icons.target,
  };

  /* ----------------------------------------------------------
     State + persistence
     ---------------------------------------------------------- */
  const state = {
    section: 'all',
    stage: 'all',
    category: 'all',
    query: '',
    sort: 'curated',
    savedOnly: false,
    visibleLimit: 48,
  };

  const PAGE_SIZE = 48;
  const saved = readSet('painel-hacking:saved');
  const done = readSet('painel-hacking:done');

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  renderCategoryOptions();
  bindEvents();
  renderAll();

  function readSet(key) {
    try {
      return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
    } catch {
      return new Set();
    }
  }

  function writeSet(key, set) {
    try {
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch {}
  }

  /* ----------------------------------------------------------
     View switcher (sidebar + bottom nav + topbar)
     ---------------------------------------------------------- */
  window.switchView = (viewId) => {
    const target = document.getElementById(`view-${viewId}`);
    if (!target) return;

    els.views.forEach((v) => v.classList.remove('is-active'));
    target.classList.add('is-active');

    document.querySelectorAll('[data-view]').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.view === viewId);
    });

    // close filter panel when leaving library
    if (viewId !== 'library') {
      closeFilterPanel();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ----------------------------------------------------------
     Events
     ---------------------------------------------------------- */
  function bindEvents() {
    // Any element with [data-view] (sidebar nav, bottom nav, topbar brand, hero buttons, "Ver todos")
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-view]');
      if (!target) return;
      event.preventDefault();
      switchView(target.dataset.view);
    });

    // Search
    els.searchInput.addEventListener('input', (event) => {
      state.query = event.target.value;
      els.searchClear.hidden = !state.query;
      resetVisibleLimit();
      renderAll();
    });

    els.searchClear.addEventListener('click', () => {
      state.query = '';
      els.searchInput.value = '';
      els.searchClear.hidden = true;
      els.searchInput.focus();
      resetVisibleLimit();
      renderAll();
    });

    // Selects
    els.categorySelect.addEventListener('change', (event) => {
      state.category = event.target.value;
      resetVisibleLimit();
      renderAll();
    });

    els.sortSelect.addEventListener('change', (event) => {
      state.sort = event.target.value;
      resetVisibleLimit();
      renderResources();
    });

    // Saved toggle
    const toggleSavedOnly = () => {
      state.savedOnly = !state.savedOnly;
      els.savedOnly.setAttribute('aria-pressed', String(state.savedOnly));
      if (els.topbarSaved) {
        els.topbarSaved.classList.toggle('is-active', state.savedOnly);
      }
      resetVisibleLimit();
      renderAll();
    };
    els.savedOnly.addEventListener('click', toggleSavedOnly);

    // Topbar saved button (mobile shortcut: jumps to library + toggles saved-only)
    if (els.topbarSaved) {
      els.topbarSaved.addEventListener('click', () => {
        switchView('library');
        if (!state.savedOnly) toggleSavedOnly();
      });
    }

    // Clear filters (also resets section tab + UI)
    const clearAll = () => {
      state.section = 'all';
      state.stage = 'all';
      state.category = 'all';
      state.query = '';
      state.sort = 'curated';
      state.savedOnly = false;
      resetVisibleLimit();
      els.searchInput.value = '';
      els.searchClear.hidden = true;
      els.categorySelect.value = 'all';
      els.sortSelect.value = 'curated';
      els.savedOnly.setAttribute('aria-pressed', 'false');
      if (els.topbarSaved) els.topbarSaved.classList.remove('is-active');
      renderAll();
    };
    els.clearFilters.addEventListener('click', clearAll);
    if (els.emptyClear) els.emptyClear.addEventListener('click', clearAll);

    // Filter panel toggle
    els.filterToggle.addEventListener('click', () => {
      const isOpen = els.filterToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeFilterPanel();
      else openFilterPanel();
    });

    // Section tabs
    els.sectionTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-section]');
      if (!button) return;
      state.section = button.dataset.section;
      resetVisibleLimit();
      renderAll();
      // scroll active tab into view (mobile)
      requestAnimationFrame(() => {
        const active = els.sectionTabs.querySelector('.tab-button.is-active');
        if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });

    // Stage clicks (jump to library)
    els.stageRail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage]');
      if (!button) return;
      state.stage = button.dataset.stage;
      state.section = 'all';
      resetVisibleLimit();
      renderAll();
      switchView('library');
    });

    // Card actions (save/done)
    els.resourceList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const id = button.dataset.id;
      const isSave = button.dataset.action === 'save';
      const bucket = isSave ? saved : done;
      const key = isSave ? 'painel-hacking:saved' : 'painel-hacking:done';

      if (bucket.has(id)) bucket.delete(id);
      else bucket.add(id);

      writeSet(key, bucket);
      // Render only what changed to keep it snappy
      renderMetrics();
      renderResources();
    });

    // Copy trail
    els.copyTrail.addEventListener('click', async () => {
      const list = getFilteredResources().slice(0, 80);
      const text = list.map((resource, index) => `${index + 1}. ${resource.title} - ${resource.url}`).join('\n');
      await copyText(text);
      showToast(`${list.length} recursos copiados`);
    });

    // Load more
    els.loadMore.addEventListener('click', () => {
      state.visibleLimit += PAGE_SIZE;
      renderResources();
    });

    // Close filter panel with ESC
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && els.filterToggle.getAttribute('aria-expanded') === 'true') {
        closeFilterPanel();
      }
    });

    // Tab scroll arrows
    const tabsPrev = document.querySelector('#tabsPrev');
    const tabsNext = document.querySelector('#tabsNext');
    const scrollTabs = (dir) => {
      if (!els.sectionTabs) return;
      const step = Math.max(els.sectionTabs.clientWidth * 0.6, 200);
      els.sectionTabs.scrollBy({ left: dir * step, behavior: 'smooth' });
    };
    if (tabsPrev) tabsPrev.addEventListener('click', () => scrollTabs(-1));
    if (tabsNext) tabsNext.addEventListener('click', () => scrollTabs(1));

    // Update overflow state on tab scroll/resize
    if (els.sectionTabs) {
      els.sectionTabs.addEventListener('scroll', updateTabsOverflow, { passive: true });
    }
    window.addEventListener('resize', updateTabsOverflow);

    // Mouse wheel → horizontal scroll on the tabs row (UX nicety)
    if (els.sectionTabs) {
      els.sectionTabs.addEventListener('wheel', (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.preventDefault();
          els.sectionTabs.scrollLeft += event.deltaY;
        }
      }, { passive: false });
    }
  }

  function openFilterPanel() {
    els.filterPanel.hidden = false;
    els.filterToggle.setAttribute('aria-expanded', 'true');
  }

  function closeFilterPanel() {
    els.filterPanel.hidden = true;
    els.filterToggle.setAttribute('aria-expanded', 'false');
  }

  /* ----------------------------------------------------------
     Render orchestration
     ---------------------------------------------------------- */
  function renderAll() {
    renderMetrics();
    renderStages();
    renderTabs();
    renderFilterSummary();
    renderFilterCount();
    renderFeatured();
    renderResources();
  }

  function renderCategoryOptions() {
    const categories = [...data.categories].sort((a, b) =>
      labelCategory(a).localeCompare(labelCategory(b), 'pt-BR'),
    );
    els.categorySelect.innerHTML = [
      '<option value="all">Todos os tipos</option>',
      ...categories.map(
        (category) =>
          `<option value="${escapeAttr(category)}">${escapeHtml(labelCategory(category))}</option>`,
      ),
    ].join('');
  }

  function resetVisibleLimit() {
    state.visibleLimit = PAGE_SIZE;
  }

  function renderFilterSummary() {
    const chips = [];
    const selectedSection = sectionById.get(state.section);
    const selectedStage = stages.find((stage) => stage.id === state.stage);

    if (selectedStage && selectedStage.id !== 'all') chips.push(selectedStage.title);
    if (selectedSection) chips.push(selectedSection.title);
    if (state.category !== 'all') chips.push(labelCategory(state.category));
    if (state.savedOnly) chips.push('Salvos');
    if (state.query.trim()) chips.push(`"${state.query.trim()}"`);

    els.filterSummary.innerHTML = chips
      .map((chip) => `<span class="filter-chip">${escapeHtml(chip)}</span>`)
      .join('');
  }

  function renderFilterCount() {
    let count = 0;
    if (state.category !== 'all') count++;
    if (state.savedOnly) count++;
    if (state.query.trim()) count++;
    if (state.sort !== 'curated') count++;

    if (count > 0) {
      els.filterCount.hidden = false;
      els.filterCount.textContent = String(count);
    } else {
      els.filterCount.hidden = true;
    }
  }

  function renderMetrics() {
    const completed = resources.filter((resource) => done.has(resource.id)).length;
    const progress = resources.length ? Math.round((completed / resources.length) * 100) : 0;

    const stats = [
      [data.totals.resources.toLocaleString('pt-BR'), 'Recursos'],
      [data.totals.sections.toLocaleString('pt-BR'), 'Seções'],
      [saved.size.toLocaleString('pt-BR'), 'Salvos'],
      [`${progress}%`, 'Concluído'],
    ];

    els.metrics.innerHTML = stats
      .map(
        ([value, label]) => `
          <div class="metric">
            <span class="metric-value">${escapeHtml(value)}</span>
            <span class="metric-label">${escapeHtml(label)}</span>
            <span class="metric-icon" aria-hidden="true">${metricIcons[label] || ''}</span>
          </div>
        `,
      )
      .join('');
  }

  function renderStages() {
    els.stageRail.innerHTML = stages
      .map((stage, index) => {
        const count = resources.filter((resource) => matchesStage(resource, stage)).length;
        const active = stage.id === state.stage ? ' is-active' : '';
        const indexLabel = String(index).padStart(2, '0');
        return `
          <button class="stage-button${active}" type="button" data-stage="${escapeAttr(stage.id)}" role="listitem">
            <span class="stage-index">${indexLabel}</span>
            <span class="stage-title">${escapeHtml(stage.title)}</span>
            <span class="stage-text">${escapeHtml(stage.text)}</span>
            <span class="stage-meta">
              ${icons.arrowRight}
              <span>${count.toLocaleString('pt-BR')} recursos</span>
            </span>
          </button>
        `;
      })
      .join('');
  }

  function renderTabs() {
    const allActive = state.section === 'all' ? ' is-active' : '';
    const tabs = [
      `
        <button class="tab-button${allActive}" type="button" data-section="all">
          <span class="tab-icon" aria-hidden="true">${icons.grid}</span>
          <span>Tudo</span>
          <span class="tab-count">${resources.length.toLocaleString('pt-BR')}</span>
        </button>
      `,
      ...sections.map((section) => {
        const active = section.id === state.section ? ' is-active' : '';
        const icon = iconForSection(section);
        return `
          <button class="tab-button${active}" type="button" data-section="${escapeAttr(section.id)}">
            <span class="tab-icon" aria-hidden="true">${icon}</span>
            <span>${escapeHtml(section.title)}</span>
            <span class="tab-count">${section.resources.length.toLocaleString('pt-BR')}</span>
          </button>
        `;
      }),
    ];

    els.sectionTabs.innerHTML = tabs.join('');
    requestAnimationFrame(updateTabsOverflow);
  }

  function updateTabsOverflow() {
    const wrap = document.querySelector('.section-tabs');
    if (!wrap || !els.sectionTabs) return;
    const el = els.sectionTabs;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const hasOverflow = maxScroll > 4;
    const atStart = el.scrollLeft <= 2;
    const atEnd = el.scrollLeft >= maxScroll - 2;

    wrap.dataset.overflowStart = String(hasOverflow && !atStart);
    wrap.dataset.overflowEnd = String(hasOverflow && !atEnd);

    const prev = document.querySelector('#tabsPrev');
    const next = document.querySelector('#tabsNext');
    if (prev) prev.hidden = !hasOverflow;
    if (next) next.hidden = !hasOverflow;
    if (prev) prev.disabled = atStart;
    if (next) next.disabled = atEnd;
    if (prev) prev.style.opacity = atStart ? '0.4' : '1';
    if (next) next.style.opacity = atEnd ? '0.4' : '1';
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
          <a class="featured-card" href="${escapeAttr(safeUrl(pick.resource.url))}" target="_blank" rel="noreferrer">
            <span class="badge" data-category="${escapeAttr(pick.resource.category)}">${escapeHtml(labelCategory(pick.resource.category))}</span>
            <strong>${escapeHtml(pick.label)}</strong>
            <p>${escapeHtml(pick.reason)}</p>
            <span class="featured-card-link">
              <span>Acessar plataforma</span>
              ${icons.external}
            </span>
          </a>
        `,
      )
      .join('');
  }

  function renderResources() {
    const list = getFilteredResources();
    const visibleList = list.slice(0, state.visibleLimit);
    const totalCount = list.length.toLocaleString('pt-BR');

    els.resultLine.textContent = `${visibleList.length.toLocaleString('pt-BR')} de ${totalCount} ${list.length === 1 ? 'recurso' : 'recursos'}`;
    els.emptyState.hidden = list.length > 0;
    els.resourceList.hidden = list.length === 0;
    els.resourceList.innerHTML = visibleList.map(renderResourceCard).join('');
    els.loadMore.hidden = state.visibleLimit >= list.length;
  }

  function renderResourceCard(resource, index) {
    const note = resource.note || resource.group || '';
    const shortNote = note.length > 160 ? `${note.slice(0, 157)}...` : note;
    const isSaved = saved.has(resource.id);
    const isDone = done.has(resource.id);

    return `
      <article class="resource-card${isDone ? ' is-done' : ''}" data-category="${escapeAttr(resource.category)}" style="--card-index:${Math.min(index, 24)}">
        <div class="card-meta">
          <span class="badge" data-category="${escapeAttr(resource.category)}">${escapeHtml(labelCategory(resource.category))}</span>
          <span class="section-chip" title="${escapeAttr(resource.sectionTitle)}">${escapeHtml(resource.sectionTitle)}</span>
        </div>
        <h3>
          <a href="${escapeAttr(safeUrl(resource.url))}" target="_blank" rel="noreferrer">${escapeHtml(resource.title)}</a>
        </h3>
        ${shortNote ? `<p class="note">${escapeHtml(shortNote)}</p>` : ''}
        <div class="domain-line">
          ${icons.globe}
          <span>${escapeHtml(resource.domain || 'link externo')}</span>
        </div>
        <div class="card-actions">
          <button class="mini-button${isSaved ? ' is-active' : ''}" type="button" data-action="save" data-id="${escapeAttr(resource.id)}" aria-pressed="${isSaved}" title="${isSaved ? 'Remover dos salvos' : 'Salvar'}">
            ${isSaved ? icons.starFill : icons.star}
            <span>Salvar</span>
          </button>
          <button class="mini-button${isDone ? ' is-active' : ''}" type="button" data-action="done" data-id="${escapeAttr(resource.id)}" aria-pressed="${isDone}" title="${isDone ? 'Marcar como pendente' : 'Marcar como feito'}">
            ${icons.check}
            <span>Feito</span>
          </button>
          <a class="mini-button" href="${escapeAttr(safeUrl(resource.url))}" target="_blank" rel="noreferrer" title="Abrir em nova aba">
            ${icons.external}
            <span>Abrir</span>
          </a>
        </div>
      </article>
    `;
  }

  /* ----------------------------------------------------------
     Filtering + sorting
     ---------------------------------------------------------- */
  function getFilteredResources() {
    const selectedSection = sectionById.get(state.section);
    const selectedStage = stages.find((stage) => stage.id === state.stage) || stages[0];
    const query = normalize(state.query);
    let list = selectedSection ? [...selectedSection.resources] : [...resources];

    list = list.filter((resource) => matchesStage(resource, selectedStage));

    if (state.category !== 'all') {
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
      title: (a, b) => a.title.localeCompare(b.title, 'pt-BR'),
      domain: (a, b) =>
        a.domain.localeCompare(b.domain, 'pt-BR') || a.title.localeCompare(b.title, 'pt-BR'),
      section: (a, b) =>
        sectionIndex.get(a.sectionId) - sectionIndex.get(b.sectionId) || a.sourceLine - b.sourceLine,
      curated: (a, b) => scoreResource(b) - scoreResource(a) || a.sourceLine - b.sourceLine,
    };

    return list.sort(sorts[state.sort] || sorts.curated);
  }

  function scoreResource(resource) {
    const text = normalize(`${resource.title} ${resource.url} ${resource.domain}`);
    const priorities = [
      'tryhackme', 'hackthebox', 'portswigger', 'overthewire', 'root-me', 'letsdefend',
      'owasp', 'burp', 'wireshark', 'kali', 'nmap', 'metasploit', 'linux', 'python',
    ];
    const index = priorities.findIndex((item) => text.includes(item));
    const priority = index >= 0 ? 100 - index * 4 : 0;
    const savedBoost = saved.has(resource.id) ? 18 : 0;
    return priority + savedBoost;
  }

  function matchesStage(resource, stage) {
    if (!stage || stage.id === 'all') return true;
    if (stage.categories?.includes(resource.category)) return true;
    const text = normalize(
      `${resource.title} ${resource.sectionTitle} ${resource.category} ${resource.group} ${resource.note}`,
    );
    return stage.tokens.some((token) => text.includes(normalize(token)));
  }

  function findFeatured(target) {
    const query = normalize(target.query);
    return resources.find((resource) =>
      normalize(`${resource.title} ${resource.url} ${resource.domain}`).includes(query),
    );
  }

  /* ----------------------------------------------------------
     Helpers
     ---------------------------------------------------------- */
  function labelCategory(category) {
    return categoryLabels[category] || category;
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return map[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
    } catch {
      return '#';
    }
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {}
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }

  let toastTimer;
  function showToast(message) {
    if (!els.toast || !els.toastText) return;
    els.toastText.textContent = message;
    els.toast.hidden = false;
    requestAnimationFrame(() => els.toast.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove('is-visible');
      setTimeout(() => (els.toast.hidden = true), 240);
    }, 1800);
  }
})();
