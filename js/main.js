(function(){
  const cfg = window.SITE_CONFIG || {};
  const $ = (sel)=>document.querySelector(sel);

  // PDF.js worker
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js";
  }

  const state = {
    activeId: null,
    pdfDoc: null,
    scale: 1.15,
    fitWidth: true
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

  function clearPdf(){
    state.pdfDoc = null;
    const pages = $('#pdfPages');
    if (pages) pages.innerHTML = '';
  }

  function setPdfError(msg){
    const err = $('#pdfError');
    const shell = $('#pdfShell');
    if (!err || !shell) return;
    err.style.display = 'block';
    shell.style.display = 'none';
    err.innerHTML = `<p>${msg}</p>`;
  }

  function clearPdfError(){
    const err = $('#pdfError');
    const shell = $('#pdfShell');
    if (!err || !shell) return;
    err.style.display = 'none';
    shell.style.display = 'block';
    err.innerHTML = '';
  }

  async function renderPdf(url){
    clearPdf();
    clearPdfError();

    const meta = $('#viewerMeta');
    if (meta) meta.textContent = 'Loading…';

    if (!window.pdfjsLib){
      setPdfError('PDF engine failed to load. Refresh the page.');
      return;
    }

    try{
      const loadingTask = pdfjsLib.getDocument({ url });
      state.pdfDoc = await loadingTask.promise;

      // Fit width scale based on first page
      if (state.fitWidth){
        const first = await state.pdfDoc.getPage(1);
        const vp1 = first.getViewport({ scale: 1 });
        const pagesEl = $('#pdfPages');
        const available = Math.max(320, (pagesEl?.clientWidth || 800) - 24);
        const fitScale = available / vp1.width;
        state.scale = Math.min(Math.max(fitScale, 1.0), 2.25); // slightly zoomed-in
      }

      if (meta) {
        meta.textContent = `${state.pdfDoc.numPages} page${state.pdfDoc.numPages === 1 ? '' : 's'} • PDF`;
      }

      const pagesEl = $('#pdfPages');
      if (!pagesEl) return;

      for (let pageNum = 1; pageNum <= state.pdfDoc.numPages; pageNum++){
        const page = await state.pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: state.scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-page';
        wrapper.style.width = `${Math.floor(viewport.width)}px`;
        wrapper.appendChild(canvas);
        pagesEl.appendChild(wrapper);

        await page.render({ canvasContext: ctx, viewport }).promise;
      }
    }catch(err){
      console.error(err);
      if (meta) meta.textContent = 'Could not load PDF.';
      setPdfError('Could not load this PDF. Try “Open”.');
    }
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

      await renderPdf(tab.file);
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

    zoomIn?.addEventListener('click', async ()=>{
      if (!state.pdfDoc) return;
      state.fitWidth = false;
      state.scale = Math.min(state.scale + 0.12, 2.75);
      const tab = (cfg.tabs || []).find(t => t.id === state.activeId);
      if (tab?.type === 'pdf') await renderPdf(tab.file);
    });

    zoomOut?.addEventListener('click', async ()=>{
      if (!state.pdfDoc) return;
      state.fitWidth = false;
      state.scale = Math.max(state.scale - 0.12, 0.65);
      const tab = (cfg.tabs || []).find(t => t.id === state.activeId);
      if (tab?.type === 'pdf') await renderPdf(tab.file);
    });

    fit?.addEventListener('click', async ()=>{
      const tab = (cfg.tabs || []).find(t => t.id === state.activeId);
      if (tab?.type !== 'pdf') return;
      state.fitWidth = true;
      await renderPdf(tab.file);
    });

    window.addEventListener('resize', ()=>{
      if (!state.fitWidth) return;
      const tab = (cfg.tabs || []).find(t => t.id === state.activeId);
      if (tab?.type !== 'pdf') return;
      clearTimeout(window.__pdfResizeTimer);
      window.__pdfResizeTimer = setTimeout(()=>renderPdf(tab.file), 150);
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
