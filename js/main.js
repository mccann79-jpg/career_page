(function(){
  const cfg = window.SITE_CONFIG || {};
  const $ = (sel, root=document)=>root.querySelector(sel);

  function setText(id, value){
    const el = document.getElementById(id);
    if(el) el.textContent = value || '';
  }
  function setHref(id, href){
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
    setText('name', cfg.name || 'Research Portfolio');
    setText('titleLine', cfg.title || '');
    setHref('msLink', cfg.morningstar_profile || '');

    const avatar = document.getElementById('avatar');
    if(avatar){
      avatar.src = cfg.avatar || 'assets/img/headshot.jpeg';
      avatar.alt = (cfg.name || 'Headshot');
    }

    // Resume download button
    const resumeBtn = document.getElementById('resumeBtn');
    if(resumeBtn){
      // find resume doc
      const resume = (cfg.docs || []).find(d => (d.label || '').toLowerCase().includes('resume')) || (cfg.docs||[])[0];
      if(resume && resume.file){
        resumeBtn.href = resume.file;
        resumeBtn.style.display = '';
      }else{
        resumeBtn.style.display = 'none';
      }
    }

    buildTabs();
  }

  function buildTabs(){
    const host = document.getElementById('tabs');
    if(!host) return;
    host.innerHTML = '';

    const currentDoc = new URLSearchParams(location.search).get('doc') || '';

    const makeTab = (label, href, active=false)=>{
      const a = document.createElement('a');
      a.className = 'tab' + (active ? ' active' : '');
      a.href = href;
      a.textContent = label;
      return a;
    };

    (cfg.research || []).forEach(r => {
      if(!r || !r.id) return;
      const label = r.tab_label || r.title || 'Research';
      const href = `index.html?doc=${encodeURIComponent(r.id)}`;
      host.appendChild(makeTab(label, href, r.id === currentDoc || (!currentDoc && (cfg.research||[])[0]?.id===r.id)));
    });

    (cfg.extra_tabs || []).forEach(t=>{
      if(!t || !t.href) return;
      host.appendChild(makeTab(t.label || 'More', t.href, false));
    });
  }

  function getDocById(id){
    return (cfg.research || []).find(r => r.id === id);
  }

  function initViewer(){
    const frame = document.getElementById('pdfFrame');
    if(!frame) return;

    const qs = new URLSearchParams(location.search);
    const docId = qs.get('doc') || '';
    let doc = docId ? getDocById(docId) : null;
    if(!doc){
      doc = (cfg.research || [])[0] || null;
    }
    if(!doc) return;

    // title
    const titleEl = document.getElementById('docTitle');
    if(titleEl) titleEl.textContent = doc.title || 'Document';

    // iframe src
    const file = doc.file;
    frame.src = file;

    // open + download buttons
    const openBtn = document.getElementById('openBtn');
    const dlBtn = document.getElementById('dlBtn');
    if(openBtn) openBtn.href = file;
    if(dlBtn){
      dlBtn.href = file;
      dlBtn.setAttribute('download','');
    }

    // set active tab
    buildTabs();
  }

  function initDocs(){
    const host = document.getElementById('docsList');
    if(!host) return;
    host.innerHTML = '';

    (cfg.docs || []).filter(d => d && d.label && d.file).forEach(d=>{
      const row = document.createElement('div');
      row.className = 'docrow';

      const left = document.createElement('div');
      left.className = 'docleft';
      left.textContent = d.label;

      const right = document.createElement('div');
      right.className = 'docright';

      const view = document.createElement('a');
      view.className = 'btn';
      view.href = `pages/doc-viewer.html?file=${encodeURIComponent(d.file)}&title=${encodeURIComponent(d.label)}`;
      view.textContent = 'View';

      const dl = document.createElement('a');
      dl.className = 'btn btn-primary';
      dl.href = d.file;
      dl.setAttribute('download','');
      dl.textContent = 'Download';

      right.appendChild(view);
      right.appendChild(dl);

      row.appendChild(left);
      row.appendChild(right);
      host.appendChild(row);
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initHeader();
    initViewer();
    initDocs();
  });
})();
