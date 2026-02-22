(function () {
  const cfg = window.SITE_CONFIG || {};
  const $ = (sel) => document.querySelector(sel);

  // State for native PDF viewer zoom
  const state = {
    activeId: null,
    pdfUrl: null,
    pdfZoom: 125,      // percent
    pdfFit: true       // fit width mode
  };

  function setHeader() {
    const dn = $('#displayName');
    const st = $('#subtitle');
    if (dn) dn.textContent = cfg.display_name || '';
    if (st) st.textContent = cfg.subtitle || '';

    // Morningstar link
    const ms = $('#morningstarLink');
    const msUrl = (cfg.morningstar_profile || '').trim();
    if (ms) {
      if (!msUrl || msUrl.includes('PASTE_YOUR')) {
        ms.style.display = 'none';
      } else {
        ms.href = msUrl;
        ms.style.display = 'inline-flex';
      }
    }

    // Resume / Cover
    const res = $('#resumeDownload');
    if (res && cfg.resume_pdf) res.href = cfg.resume_pdf;
    const cov = $('#coverDownload');
    if (cov && cfg.cover_pdf) cov.href = cfg.cover_pdf;
  }

  function buildTabs() {
    const tabsEl = $('#tabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = '';

    (cfg.tabs || []).forEach((t) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab';
      b.textContent = t.label || t.title || t.id;
      b.addEventListener('click', () => activateTab(t.id));
      tabsEl.appendChild(b);
    });
  }

  function setActiveTabUI(id) {
    const buttons = Array.from(document.querySelectorAll('.tab'));
    const tabs = cfg.tabs || [];
    buttons.forEach((btn, i) => {
      const t = tabs[i];
      if (!t) return;
      btn.classList.toggle('active', t.id === id);
    });
  }

  function showOnly(which) {
    const pdf = $('#pdfCard');
    const web = $('#webCard');
    const html = $('#htmlCard');
    if (pdf) pdf.style.display = which === 'pdf' ? '' : 'none';
    if (web) web.style.display = which === 'web' ? '' : 'none';
    if (html) html.style.display = which === 'html' ? '' : 'none';
  }

  function setPdfActions(url) {
    const open = $('#openNewTab');
    const dl = $('#downloadBtn');
    if (open) open.href = url;
    if (dl) dl.href = url;
    if (dl) dl.style.display = 'inline-flex';
  }

  function setWebActions(url) {
    const open = $('#webOpenNewTab');
    if (open) open.href = url;

    // In PDF header, hide Download for web
    const dl = $('#downloadBtn');
    if (dl) dl.style.display = 'none';
  }

  function setTitles(kind, tab) {
    if (kind === 'pdf') {
      const t = $('#viewerTitle');
      const d = $('#viewerDesc');
      const m = $('#viewerMeta');
      if (t) t.textContent = tab.title || tab.label || '';
      if (d) d.textContent = tab.desc || '';
      if (m) m.textContent = 'PDF';
    } else if (kind === 'web') {
      const t = $('#webTitle');
      const d = $('#webDesc');
      if (t) t.textContent = tab.title || tab.label || '';
      if (d) d.textContent = tab.desc || '';
    } else {
      const panel = $('#htmlPanel');
      // title/desc not shown for internal html, keep it minimal
      if (panel) panel.scrollTop = 0;
    }
  }

  // ---------- PDF (native browser viewer) ----------
  function buildPdfSrc(url) {
    const base = url.split('#')[0];
    if (state.pdfFit) {
      // FitH + page-width gives a nicely zoomed-in, centered feel in most browsers
      return `${base}#view=FitH&zoom=page-width`;
    }
    return `${base}#zoom=${state.pdfZoom}`;
  }

  function loadPdf(url) {
    state.pdfUrl = url;
    const frame = $('#pdfFrame');
    const err = $('#pdfError');
    if (err) err.style.display = 'none';

    if (frame) {
      frame.src = buildPdfSrc(url);
      frame.style.display = '';
    }
    setPdfActions(url);
  }

  function zoomIn() {
    state.pdfFit = false;
    state.pdfZoom = Math.min(250, state.pdfZoom + 10);
    if (state.pdfUrl) loadPdf(state.pdfUrl);
  }

  function zoomOut() {
    state.pdfFit = false;
    state.pdfZoom = Math.max(60, state.pdfZoom - 10);
    if (state.pdfUrl) loadPdf(state.pdfUrl);
  }

  function fitWidth() {
    state.pdfFit = true;
    if (state.pdfUrl) loadPdf(state.pdfUrl);
  }

  // ---------- Web ----------
  function showWebPreview(tab) {
    const preview = $('#webPreview');
    if (!preview) return;

    const pt = $('#webPreviewTitle');
    const pd = $('#webPreviewDesc');
    const ob = $('#webOpenBtn');

    if (pt) pt.textContent = tab.title || tab.label || 'Web';
    if (pd) pd.textContent = tab.desc || '';
    if (ob) ob.href = tab.url || '#';

    preview.style.display = '';
  }

  function hideWebPreview() {
    const preview = $('#webPreview');
    if (preview) preview.style.display = 'none';
  }

  function renderWeb(tab) {
    const frame = $('#webFrame');
    const blocked = $('#webBlocked');

    hideWebPreview();
    showWebPreview(tab);

    if (blocked) blocked.style.display = 'none';
    if (frame) {
      frame.src = tab.url;
      frame.style.display = '';
    }

    // We can't reliably detect X-Frame-Options / CSP blocks cross-origin.
    // If it is blocked, browsers typically show an error/blank frame.
    // We always keep the preview + Open button visible, so the tab never feels empty.
    // (Optional heuristic: after 1.5s, show "blocked" message as well.)
    window.setTimeout(() => {
      if (blocked) blocked.style.display = '';
    }, 1500);
  }

  // ---------- Internal pages ----------
  async function renderPage(tab) {
    const panel = $('#htmlPanel');
    if (!panel) return;

    panel.innerHTML = '<p class="small">Loading…</p>';
    try {
      const res = await fetch(tab.page, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      panel.innerHTML = html;
    } catch (e) {
      panel.innerHTML = `
        <p>Could not load this page.</p>
        <p class="small">${String(e)}</p>
      `;
    }
  }

  function activateTab(id) {
    const tab = (cfg.tabs || []).find((t) => t.id === id) || (cfg.tabs || [])[0];
    if (!tab) return;

    state.activeId = tab.id;
    setActiveTabUI(tab.id);

    if (tab.type === 'pdf') {
      showOnly('pdf');
      setTitles('pdf', tab);
      loadPdf(tab.file);
    } else if (tab.type === 'web') {
      showOnly('web');
      setTitles('web', tab);
      setWebActions(tab.url);
      renderWeb(tab);
    } else if (tab.type === 'page') {
      showOnly('html');
      renderPage(tab);
    } else {
      // unknown type -> do nothing
    }
  }

  function wireControls() {
    const zi = $('#zoomIn');
    const zo = $('#zoomOut');
    const fw = $('#fitWidth');

    if (zi) zi.addEventListener('click', zoomIn);
    if (zo) zo.addEventListener('click', zoomOut);
    if (fw) fw.addEventListener('click', fitWidth);
  }

  function init() {
    setHeader();
    buildTabs();
    wireControls();

    // default tab: first in config
    if ((cfg.tabs || []).length) activateTab(cfg.tabs[0].id);
  }

  document.addEventListener('DOMContentLoaded', init);
})();