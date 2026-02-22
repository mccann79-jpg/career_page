(function(){
  const cfg = window.SITE_CONFIG;
  const baseHref = document.querySelector('base')?.getAttribute('href') || './';

  const $ = (sel)=>document.querySelector(sel);

  function safeUrl(path){
    // With <base href="/career_page/">, relative paths resolve correctly.
    // This helper just returns the path as-is, but keeps a single place to adjust if needed.
    return path;
  }

  function setHeader(){
    $('#displayName').textContent = cfg.display_name || '';
    $('#subtitle').textContent = cfg.subtitle || '';

    const ms = $('#morningstarLink');
    if(cfg.morningstar_profile && !cfg.morningstar_profile.includes('PASTE_YOUR')){
      ms.href = cfg.morningstar_profile;
      ms.style.display = 'inline-flex';
    } else {
      ms.style.display = 'none';
    }

    const resumeBtn = $('#resumeDownload');
    resumeBtn.href = safeUrl(cfg.resume_pdf || 'assets/docs/resume.pdf');
  }

  function buildTabs(){
    const wrap = $('#tabs');
    wrap.innerHTML = '';
    cfg.tabs.forEach(tab=>{
      const b = document.createElement('button');
      b.className = 'tab';
      b.type = 'button';
      b.dataset.tabId = tab.id;
      b.textContent = tab.label;
      b.addEventListener('click', ()=>activateTab(tab.id, true));
      wrap.appendChild(b);
    });
  }

  function setActiveButton(tabId){
    document.querySelectorAll('.tab').forEach(el=>{
      el.classList.toggle('active', el.dataset.tabId === tabId);
    });
  }

  function activateTab(tabId, push){
    const tab = cfg.tabs.find(t=>t.id===tabId) || cfg.tabs[0];
    if(!tab) return;

    setActiveButton(tab.id);

    $('#viewerTitle').textContent = tab.title || tab.label || '';
    const meta = $('#viewerMeta');
    meta.textContent = tab.type === 'pdf' ? 'PDF' : '';
    meta.style.display = tab.type === 'pdf' ? 'block' : 'none';

    const iframe = $('#pdfFrame');
    const page = $('#pageContainer');

    const openNew = $('#openNewTab');
    const download = $('#downloadBtn');

    if(tab.type === 'pdf'){
      const file = safeUrl(tab.file);
      iframe.src = file;
      iframe.style.display = 'block';
      page.style.display = 'none';

      openNew.href = file;
      download.href = file;

      openNew.style.display = 'inline-flex';
      download.style.display = 'inline-flex';
    } else {
      iframe.removeAttribute('src');
      iframe.style.display = 'none';
      page.style.display = 'block';

      openNew.style.display = 'none';
      download.style.display = 'none';

      fetch(safeUrl(tab.file))
        .then(r=>r.text())
        .then(html=>{
          page.innerHTML = html;
        })
        .catch(()=>{
          page.innerHTML = '<div class="page"><h2>Content not found</h2><p>Make sure the file exists.</p></div>';
        });
    }

    if(push){
      const url = new URL(window.location.href);
      url.hash = `tab=${encodeURIComponent(tab.id)}`;
      history.pushState({tab: tab.id}, '', url.toString());
    }
  }

  function initialTab(){
    const hash = window.location.hash || '';
    const m = hash.match(/tab=([^&]+)/);
    const tabId = m ? decodeURIComponent(m[1]) : null;
    if(tabId && cfg.tabs.some(t=>t.id===tabId)) return tabId;
    return cfg.tabs[0]?.id;
  }

  window.addEventListener('popstate', (e)=>{
    const tabId = (e.state && e.state.tab) ? e.state.tab : initialTab();
    activateTab(tabId, false);
  });

  // init
  setHeader();
  buildTabs();
  activateTab(initialTab(), false);
})();
