(function(){
  const cfg = window.SITE_CONFIG || {};
  const $ = (sel, root=document)=>root.querySelector(sel);
  const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));


  function applyTheme(mode){
    const root = document.documentElement;
    if(mode === 'light' || mode === 'dark'){
      root.setAttribute('data-theme', mode);
    }else{
      root.removeAttribute('data-theme'); // system
    }
  }

  function initTheme(){
    const key = 'theme';
    const saved = (localStorage.getItem(key) || 'system').toLowerCase();
    const select = document.getElementById('themeSelect');
    applyTheme(saved);
    if(select){
      select.value = (saved === 'light' || saved === 'dark') ? saved : 'system';
      select.addEventListener('change', ()=>{
        const v = (select.value || 'system').toLowerCase();
        localStorage.setItem(key, v);
        applyTheme(v);
      });
    }
  }

  initTheme();

  function initBrand(){
    const nameEl = document.getElementById('name');
    const titleEl = document.getElementById('titleLine');
    const msLink = document.getElementById('msLink');
    if(nameEl && cfg.name) nameEl.textContent = cfg.name;
    if(titleEl && cfg.title) titleEl.textContent = cfg.title;
    if(msLink){
      const url = (cfg.morningstar_profile || '').trim();
      if(url){
        msLink.href = url;
      }else{
        msLink.style.display = 'none';
      }
    }
  }

  initBrand();


  function setActiveNav(){
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.nav a').forEach(a=>{
      const href = (a.getAttribute('href') || '').toLowerCase();
      a.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
    });
  }

  function safeText(s){ return (s ?? '').toString(); }

  function renderHome(){
    const list = $('#researchList');
    if(!list) return;
    list.innerHTML = '';
    (cfg.research || []).forEach(item=>{
      const el = document.createElement('div');
      el.className='item';
      const viewHref = `pages/viewer.html?id=${encodeURIComponent(item.id)}`;
      const dlHref = item.file;
      el.innerHTML = `
        <div class="top">
          <div>
            <a class="title titleLink" href="${viewHref}">${safeText(item.title)}</a>
            <div class="meta">${safeText(item.type)} • ${safeText(item.date)}</div>
          </div>
          <div class="kbd">PDF</div>
        </div>
        <div class="notice" style="margin-top:10px">${safeText(item.summary)}</div>
        <div class="actions">
          <a class="btn" href="${dlHref}" download>Download</a>
        </div>
      `;
      list.appendChild(el);
    });
  }

  function renderDocs(){
    const docs = $('#docsList');
    if(!docs) return;
    docs.innerHTML='';
    (cfg.docs || []).forEach(d=>{
      const el = document.createElement('div');
      el.className='item';
      el.innerHTML = `
        <div class="top">
          <div>
            <div class="title">${safeText(d.label)}</div>
            <div class="meta">PDF</div>
          </div>
          <div class="kbd">DOC</div>
        </div>
        <div class="actions">
          <a class="btn primary" href="${safeText(d.file)}" target="_blank" rel="noopener">View</a>
          <a class="btn" href="${safeText(d.file)}" download>Download</a>
        </div>
        <div class="notice" style="margin-top:10px">
          To update, replace <code class="inline">${safeText(d.file)}</code> with your new file (keep the same filename).
        </div>
      `;
      docs.appendChild(el);
    });
  }

  function renderViewer(){
    const frame = $('#pdfFrame');
    const title = $('#docTitle');
    const meta = $('#docMeta');
    const dl = $('#downloadBtn');
    const open = $('#openBtn');

    if(!frame) return;

    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    const item = (cfg.research || []).find(x=>x.id===id) || null;
    if(!item){
      title.textContent = 'Document not found';
      meta.textContent = 'Check the link from the home page.';
      frame.remove();
      return;
    }

    title.textContent = item.title || 'Document';
    meta.textContent = `${item.type || 'PDF'} • ${item.date || ''}`;
    const src = item.file || '';
    // #view=FitH keeps it nicely framed in most PDF viewers
    frame.src = `${src}#view=FitH`;
    if(dl){ dl.href = src; dl.setAttribute('download',''); }
    if(open){ open.href = src; }
  }

  function fillProfile(){
    const nameEl = $('#name');
    const titleEl = $('#titleLine');
    const emailEl = $('#emailLink');
    const locEl = $('#location');
    if(nameEl) nameEl.textContent = cfg.name || 'Your Name';
    if(titleEl) titleEl.textContent = cfg.title || '';
    if(locEl) locEl.textContent = cfg.location || '';
    if(emailEl){
      const email = cfg.email || '';
      emailEl.textContent = email;
      emailEl.href = email ? `mailto:${email}` : '#';
    }
    const gh = $('#githubLink');
    const li = $('#linkedinLink');
    if(gh && cfg.github){ gh.href = cfg.github; }
    if(li && cfg.linkedin){ li.href = cfg.linkedin; }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    setActiveNav();
    fillProfile();
    renderHome();
    renderDocs();
    renderViewer();
  });
})();
