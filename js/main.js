(function(){
  const cfg = window.SITE_CONFIG || {};
  const $ = (sel, root=document)=>root.querySelector(sel);

  function safeSetText(id, value){
    const el = document.getElementById(id);
    if(el && value) el.textContent = value;
  }
  function safeSetHref(id, href){
    const el = document.getElementById(id);
    if(!el) return;
    if(href){
      el.href = href;
      el.style.display = '';
    }else{
      el.style.display = 'none';
    }
  }

  function initHeader(){
    safeSetText('name', cfg.name || 'Research Portfolio');
    safeSetText('titleLine', cfg.title || '');
    safeSetHref('msLink', cfg.morningstar_profile || '');

    const avatar = document.getElementById('avatar');
    if(avatar && cfg.avatar){
      avatar.src = cfg.avatar;
    }

    safeSetHref('linkedinLink2', cfg.linkedin || '');
    safeSetHref('githubLink2', cfg.github || '');
  }

  function buildListItem(item){
    const { title, file } = item;
    const wrap = document.createElement('div');
    wrap.className = 'item';

    const left = document.createElement('div');
    left.className = 'item-left';

    const a = document.createElement('a');
    a.className = 'item-title';
    a.textContent = title;
    a.href = `pages/viewer.html?file=${encodeURIComponent(file)}&title=${encodeURIComponent(title)}`;
    left.appendChild(a);

    const right = document.createElement('div');
    right.className = 'item-right';

    const dl = document.createElement('a');
    dl.className = 'btn';
    dl.href = file;
    dl.setAttribute('download','');
    dl.textContent = 'Download';
    right.appendChild(dl);

    wrap.appendChild(left);
    wrap.appendChild(right);
    return wrap;
  }

  function renderList(hostId, items){
    const host = document.getElementById(hostId);
    if(!host) return;
    (items || []).filter(x => x && x.title && x.file)
      .forEach(item => host.appendChild(buildListItem(item)));
  }

  function initViewer(){
    const frame = document.getElementById('pdfFrame');
    if(!frame) return;

    const qs = new URLSearchParams(location.search);
    const file = qs.get('file') || '';
    const title = qs.get('title') || 'Document';

    const titleEl = document.getElementById('docTitle');
    if(titleEl) titleEl.textContent = title;

    const resolved = file.startsWith('/') ? file : `../${file}`;
    frame.src = resolved;

    const openBtn = document.getElementById('openBtn');
    if(openBtn) openBtn.href = resolved;

    const dlBtn = document.getElementById('downloadBtn');
    if(dlBtn){
      dlBtn.href = resolved;
      dlBtn.setAttribute('download','');
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    initHeader();
    renderList('researchList', cfg.research);
    renderList('docsList', cfg.docs);
    initViewer();
  });
})();