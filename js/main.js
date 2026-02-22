/**
 * main.js
 * ───────
 * Reads SITE_CONFIG and wires up: identity block, tabs, PDF viewer,
 * web iframe viewer, inline HTML panels, and zoom controls.
 */

(function () {
  "use strict";

  const C = SITE_CONFIG;

  /* ── Identity ────────────────────────────────── */
  setText("displayName", C.displayName);
  setText("subtitle", C.subtitle);

  const msLink = document.getElementById("morningstarLink");
  if (msLink && C.morningstarLink) {
    msLink.href = C.morningstarLink;
  }

  const resumeBtn = document.getElementById("resumeDownload");
  if (resumeBtn) resumeBtn.href = C.resumePath;

  const coverBtn = document.getElementById("coverDownload");
  if (coverBtn) coverBtn.href = C.coverPath;

  /* ── Tabs ─────────────────────────────────────── */
  const tabsContainer = document.getElementById("tabs");
  const tabs = C.tabs;
  let activeIdx = C.defaultTab || 0;

  tabs.forEach((tab, i) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (i === activeIdx ? " active" : "");
    btn.type = "button";
    btn.textContent = tab.label;
    btn.setAttribute("data-idx", i);
    btn.addEventListener("click", () => activate(i));
    tabsContainer.appendChild(btn);
  });

  /* ── Sections ────────────────────────────────── */
  const pdfCard = document.getElementById("pdfCard");
  const webCard = document.getElementById("webCard");
  const htmlCard = document.getElementById("htmlCard");

  /* PDF elements */
  const pdfFrame = document.getElementById("pdfFrame");
  const pdfError = document.getElementById("pdfError");
  const viewerTitle = document.getElementById("viewerTitle");
  const viewerMeta = document.getElementById("viewerMeta");
  const openNewTab = document.getElementById("openNewTab");
  const downloadBtn = document.getElementById("downloadBtn");

  /* Web elements */
  const webFrame = document.getElementById("webFrame");
  const webBlocked = document.getElementById("webBlocked");
  const webTitle = document.getElementById("webTitle");
  const webOpenNewTab = document.getElementById("webOpenNewTab");

  /* HTML elements */
  const htmlPanel = document.getElementById("htmlPanel");

  /* ── Zoom ─────────────────────────────────────── */
  let zoomLevel = 1;
  const ZOOM_STEP = 0.15;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;

  document.getElementById("zoomIn").addEventListener("click", () => {
    zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
    applyZoom();
  });

  document.getElementById("zoomOut").addEventListener("click", () => {
    zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
    applyZoom();
  });

  document.getElementById("fitWidth").addEventListener("click", () => {
    zoomLevel = 1;
    applyZoom();
  });

  function applyZoom() {
    if (pdfFrame) {
      pdfFrame.style.transform = `scale(${zoomLevel})`;
      pdfFrame.style.transformOrigin = "top left";
      pdfFrame.style.width = `${100 / zoomLevel}%`;
      pdfFrame.style.height = `${100 / zoomLevel}%`;
    }
  }

  /* ── Activation ──────────────────────────────── */
  function activate(idx) {
    activeIdx = idx;
    const tab = tabs[idx];

    // Update tab buttons
    tabsContainer.querySelectorAll(".tab-btn").forEach((btn, i) => {
      btn.classList.toggle("active", i === idx);
    });

    // Hide all cards
    pdfCard.style.display = "none";
    webCard.style.display = "none";
    htmlCard.style.display = "none";

    // Reset zoom
    zoomLevel = 1;
    applyZoom();

    if (tab.type === "pdf") {
      showPDF(tab);
    } else if (tab.type === "web") {
      showWeb(tab);
    } else if (tab.type === "html") {
      showHTML(tab);
    }

    // Update URL hash
    history.replaceState(null, "", "#" + tab.id);
  }

  /* ── PDF Viewer ──────────────────────────────── */
  function showPDF(tab) {
    pdfCard.style.display = "";
    viewerTitle.textContent = tab.title || tab.label;
    viewerMeta.textContent = tab.meta || "";

    const src = tab.file;
    openNewTab.href = src;
    downloadBtn.href = src;

    pdfError.style.display = "none";
    pdfFrame.style.display = "";

    // Use browser native PDF viewer
    pdfFrame.src = src;

    pdfFrame.onerror = () => {
      pdfFrame.style.display = "none";
      pdfError.style.display = "";
      pdfError.innerHTML = `<p>PDF failed to load. <a href="${src}" target="_blank">Open directly</a>.</p>`;
    };
  }

  /* ── Web Viewer ──────────────────────────────── */
  function showWeb(tab) {
    webCard.style.display = "";
    webTitle.textContent = tab.title || tab.label;
    webOpenNewTab.href = tab.url;

    webBlocked.style.display = "none";
    webFrame.style.display = "";

    webFrame.src = tab.url;

    // Detect X-Frame-Options block (heuristic — onload still fires)
    webFrame.onerror = () => {
      webFrame.style.display = "none";
      webBlocked.style.display = "";
    };
  }

  /* ── HTML Panel ──────────────────────────────── */
  function showHTML(tab) {
    htmlCard.style.display = "";
    htmlPanel.innerHTML = tab.html || "";
  }

  /* ── Init from hash ──────────────────────────── */
  function initFromHash() {
    const hash = location.hash.replace("#", "");
    if (hash) {
      const idx = tabs.findIndex((t) => t.id === hash);
      if (idx >= 0) {
        activeIdx = idx;
      }
    }
    activate(activeIdx);
  }

  initFromHash();
  window.addEventListener("hashchange", initFromHash);

  /* ── Helpers ─────────────────────────────────── */
  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || "";
  }
})();
