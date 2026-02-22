(function(){
  const cfg = window.SITE_CONFIG || {};
  const $ = (sel)=>document.querySelector(sel);

  // Native PDF embed state (works reliably on GitHub Pages + localhost)
  const state = {
    activeId: null,
    zoomPct: 125,      // default slightly zoomed-in
    fit: true
  };

  function setHeader(){
    const dn = $('#displayName');
    const st = $('#subtitle');
    if (dn) dn.textContent = cfg.display_name || '';
    if (st) st.textContent = cfg.subtitle || '';

    // Morningstar link
    const ms = $('#morningstarLink');
    const url = (cfg.morningstar_profile || '').trim();
    if (!ms) return;
    if (!url || url.includes('PASTE_YOUR')) {
      ms.style.display = 'none';
    } else {
      ms.href = url;
      ms.style.display = 'inline-flex';
    }

    // Resume/Cover
    const res = $('#resumeDownload');
    if (res && cfg.resume_pdf) res.href = cfg.resume_pdf;
    const cov = $('#coverDownload');
    if (cov && cfg.cover_pdf) cov.href = cfg.cover_pdf;
  }

  function buildTabs(){
    const tabsEl = $('#tabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = '';

    (cfg.tabs || []).forEach((t)=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab';
      b.textContent = t.label || t.title || t.id;
      b.addEventListener('click', ()=>activateTab(t.id));
      tabsEl.appendChild(b);
    });
  }

  function setActiveTabUI(id){
    const buttons = Array.from(document.querySelectorAll('.tab'));
    const tabs = cfg.tabs || [];
    buttons.forEach((btn, i)=>{
      const t = tabs[i];
      if (!t) return;
      btn.classList.toggle('active', t.id === id);
    });
  }

  function showOnly(which){
    const pdfCard = $('#pdfCard');
    const webCard = $('#webCard');
    const htmlCard = $('#htmlCard');

    if (pdfCard) pdfCard.style.display = which === 'pdf' ? 'block' : 'none';
    if (webCard) webCard.style.display = which === 'web' ? 'block' : 'none';
    if (htmlCard) htmlCard.style.display = which === 'html' ? 'block' : 'none';
  }

  function setPdfError(msg){
    const err = $('#pdfError');
    const frame = $('#pdfFrame');
    if (err) {
      err.style.display = 'block';
      err.innerHTML = `<p>${msg}</p>`;
    }
    if (frame) frame.style.display = 'none';
  }

  function clearPdfError(){
    const err = $('#pdfError');
    const frame = $('#pdfFrame');
    if (err) {
      err.style.display = 'none';
      err.innerHTML = '';
    }
    if (frame) frame.style.display = 'block';
  }

  function buildPdfEmbedUrl(file){
    // Chrome/Edge/Firefox generally support #zoom= and #page= anchors.
    // Fit mode uses "page-width"; otherwise use percentage.
    const zoom = state.fit ? 'page-width' : String(state.zoomPct);
    return `${file}#page=1&zoom=${encodeURIComponent(zoom)}`;
  }

  function renderPdf(file){
    clearPdfError();

    const title = $('#viewerTitle');
    const meta = $('#viewerMeta');
    const frame = $('#pdfFrame');
    if (!frame) {
      setPdfError('PDF viewer could not initialize.');
      return;
    }

    if (meta) meta.textContent = 'PDF';
    frame.style.background = '#ffffff';
    frame.src = buildPdfEmbedUrl(file);

    // Best-effort: if the file 404s, the iframe will show an error page; we keep Open button available.
  }

  function renderWeb(url, title){
    const frame = $('#webFrame');
    const blocked = $('#webBlocked');
    const wt = $('#webTitle');
    const open = $('#webOpenNewTab');

    if (wt) wt.textContent = title || 'Web';
    if (open) open.href = url;

    if (!frame || !blocked) return;

    blocked.style.display = 'none';
    frame.style.display = 'block';

    let loaded = false;
    const timer = setTimeout(()=>{
      if (!loaded) {
        // Many sites block embedding; show fallback message.
        blocked.style.display = 'block';
        frame.style.display = 'none';
      }
    }, 1400);

    frame.onload = ()=>{
      loaded = true;
      clearTimeout(timer);
    };

    frame.src = url;
  }

  async function activateTab(id){
    const tab = (cfg.tabs || []).find(t => t.id === id) || (cfg.tabs || [])[0];
    if (!tab) return;

    state.activeId = tab.id;
    setActiveTabUI(tab.id);

    // PDF path
    if (tab.type === 'pdf'){
      showOnly('pdf');
      const title = $('#viewerTitle');
      if (title) title.textContent = tab.title || tab.label || '';

      const open = $('#openNewTab');
      const dl = $('#downloadBtn');
      if (open) open.href = tab.file;
      if (dl) {
        dl.href = tab.file;
        dl.setAttribute('download','');
      }

      renderPdf(tab.file);
      return;
    }

    // Web embed
    if (tab.type === 'web'){
      showOnly('web');
      renderWeb(tab.url, tab.title || tab.label || 'Web');
      return;
    }

    // Internal page (open inside iframe-like via fetch)
    if (tab.type === 'page'){
      showOnly('html');
      const panel = $('#htmlPanel');
      if (!panel) return;
      panel.innerHTML = '<p>Loading…</p>';
      try{
        const res = await fetch(tab.page, { cache: 'no-store' });
        panel.innerHTML = await res.text();
      }catch(e){
        panel.innerHTML = '<p>Could not load this page.</p>';
      }
      return;
    }

    // Raw HTML
    showOnly('html');
    const panel = $('#htmlPanel');
    if (panel) panel.innerHTML = tab.html || '<p></p>';
  }

  function hookControls(){
    const zoomIn = $('#zoomIn');
    const zoomOut = $('#zoomOut');
    const fit = $('#fitWidth');

    zoomIn?.addEventListener('click', ()=>{
      const tab = (cfg.tabs || []).find(t => t.id === state.activeId);
      if (tab?.type !== 'pdf') return;
      state.fit = false;
      state.zoomPct = Math.min(state.zoomPct + 10, 200);
      renderPdf(tab.file);
    });

    zoomOut?.addEventListener('click', ()=>{
      const tab = (cfg.tabs || []).find(t => t.id === state.activeId);
      if (tab?.type !== 'pdf') return;
      state.fit = false;
      state.zoomPct = Math.max(state.zoomPct - 10, 80);
      renderPdf(tab.file);
    });

    fit?.addEventListener('click', ()=>{
      const tab = (cfg.tabs || []).find(t => t.id === state.activeId);
      if (tab?.type !== 'pdf') return;
      state.fit = true;
      renderPdf(tab.file);
    });
  }

  function init(){
    setHeader();
    buildTabs();
    hookControls();
    const first = (cfg.tabs || [])[0];
    if (first) activateTab(first.id);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
