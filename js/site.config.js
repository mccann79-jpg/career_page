/**
 * site.config.js
 * ──────────────
 * Central configuration for the research portfolio.
 * Edit this file to add/remove tabs, change personal info, etc.
 */

const SITE_CONFIG = {
  /* ── Identity ─────────────────────────────────── */
  displayName: "Brendan McCann, CFA",
  subtitle: "Manager Research | Data & Analytics | Tool Building",
  morningstarLink: "https://www.morningstar.com/", // replace with actual profile URL

  /* ── Resume / Cover Letter ────────────────────── */
  resumePath: "assets/docs/resume.pdf",
  coverPath: "assets/docs/cover-letter.pdf",

  /* ── Research Tabs ────────────────────────────── */
  // type: "pdf" | "web" | "html"
  //   pdf  → loads in the PDF iframe viewer
  //   web  → loads an external URL in an iframe (or shows "Open" fallback)
  //   html → renders inline HTML content in the page
  tabs: [
    {
      id: "newsletter",
      label: "Newsletter Article — What Makes an ETF Bad?",
      type: "pdf",
      file: "assets/docs/newsletter-article-etf.pdf",
      title: "Newsletter Article — What Makes an ETF Bad?",
      meta: "Morningstar Manager Research · 2024",
    },
    {
      id: "watchlist",
      label: "ETF Investor Newsletter Watchlist",
      type: "pdf",
      file: "assets/docs/etf-investor-newsletter-watchlist.pdf",
      title: "ETF Investor Newsletter Watchlist",
      meta: "Morningstar Manager Research",
    },
    {
      id: "web-article",
      label: "Web Article",
      type: "web",
      url: "https://www.morningstar.com/", // replace with actual article URL
      title: "Web Article",
    },
    {
      id: "media",
      label: "Media Citations",
      type: "html",
      title: "Media Citations",
      html: `
        <h2>Media Citations</h2>
        <p>A selection of citations and references in financial media.</p>
        <ul class="citations-list">
          <li>
            <strong>Example Publication</strong> — "Article Title Here"
            <span class="cite-date">Jan 2024</span>
          </li>
        </ul>
        <p class="muted">Add your media citations to <code>site.config.js</code>.</p>
      `,
    },
    {
      id: "tools",
      label: "Tools",
      type: "html",
      title: "Tools",
      html: `
        <h2>Tools &amp; Projects</h2>
        <p>Internal and public tools built for research workflows.</p>
        <ul class="tools-list">
          <li>
            <strong>Tool Name</strong> — Brief description of the tool.
            <a href="#" target="_blank" rel="noreferrer">View →</a>
          </li>
        </ul>
        <p class="muted">Add your tools to <code>site.config.js</code>.</p>
      `,
    },
    {
      id: "notes",
      label: "Notes",
      type: "html",
      title: "Notes",
      html: `
        <h2>Research Notes</h2>
        <p>Working notes, frameworks, and observations.</p>
        <p class="muted">Add your notes content to <code>site.config.js</code>.</p>
      `,
    },
  ],

  /* ── Default active tab (index into tabs[]) ───── */
  defaultTab: 0,
};
