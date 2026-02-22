(function(){
  const cfg = window.SITE_CONFIG || {};
  const qs = new URLSearchParams(location.search);
  const file = qs.get('file') || '';
  const title = qs.get('title') || 'Document';

  const titleEl = document.getElementById('docTitle');
  const frame = document.getElementById('pdfFrame');
  const openBtn = document.getElementById('openBtn');
  const dlBtn = document.getElementById('dlBtn');

  if(titleEl) titleEl.textContent = title;
  if(frame) frame.src = file;
  if(openBtn) openBtn.href = file;
  if(dlBtn){
    dlBtn.href = file;
    dlBtn.setAttribute('download','');
  }

  // Header bits + tabs
  const nameEl = document.getElementById('name');
  const titleLineEl = document.getElementById('titleLine');
  const avatar = document.getElementById('avatar');
  const msLink = document.getElementById('msLink');
  const resumeBtn = document.getElementById('resumeBtn');

  if(nameEl) nameEl.textContent = cfg.name || 'Research Portfolio';
  if(titleLineEl) titleLineEl.textContent = cfg.title || '';
  if(avatar) avatar.src = '../' + (cfg.avatar || 'assets/img/headshot.jpeg');
  if(msLink){
    if(cfg.morningstar_profile){ msLink.href = cfg.morningstar_profile; msLink.style.display=''; }
    else { msLink.style.display='none'; }
  }
  if(resumeBtn){
    const resume = (cfg.docs || []).find(d => (d.label || '').toLowerCase().includes('resume')) || (cfg.docs||[])[0];
    if(resume && resume.file){ resumeBtn.href = '../' + resume.file; resumeBtn.style.display=''; }
    else { resumeBtn.style.display='none'; }
  }

  const tabsHost = document.getElementById('tabs');
  if(tabsHost){
    tabsHost.innerHTML='';
    const make = (label, href)=>{ const a=document.createElement('a'); a.className='tab'; a.href=href; a.textContent=label; return a; };
    (cfg.research||[]).forEach(r=>{
      tabsHost.appendChild(make(r.tab_label || r.title || 'Research', '../index.html?doc='+encodeURIComponent(r.id)));
    });
    (cfg.extra_tabs||[]).forEach(t=>{
      tabsHost.appendChild(make(t.label || 'More', '../'+t.href));
    });
  }
})();
