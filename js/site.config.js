// Edit this file to update tabs, links, and labels.
// - PDFs: type: "pdf", file: "assets/pdfs/your-file.pdf"
// - Web links: type: "web", url: "https://..."
// - Internal pages: type: "html", html: "<p>...</p>" (or link to /pages)

window.SITE_CONFIG = {
  display_name: "Brendan McCann, CFA",
  subtitle: "Manager Research | Data & Analytics | Tool Building",

  // Put your Morningstar profile URL here (or leave blank to hide button)
  morningstar_profile: "",

  // Replace these files anytime (keep the same filenames)
  resume_pdf: "assets/docs/resume.pdf",
  cover_pdf: "assets/docs/cover-letter.pdf",

  tabs: [
    {
      id: "newsletter-etf-bad",
      label: "Newsletter Article — What Makes an ETF Bad?",
      title: "Newsletter Article — What Makes an ETF Bad?",
      desc: "Framework for spotting ETFs with hidden costs, weak structure, and poor outcomes.",
      type: "pdf",
      file: "assets/pdfs/what-makes-an-etf-bad.pdf"
    },
    {
      id: "newsletter-watchlist",
      label: "ETF Investor Newsletter Watchlist",
      title: "ETF Investor Newsletter Watchlist",
      desc: "Watchlist and themes—what to monitor and why it matters for investors.",
      type: "pdf",
      file: "assets/pdfs/etf-investor-newsletter-watchlist.pdf"
    },

    // Web tabs
    {
      id: "web-article",
      label: "Web Article",
      title: "Web Article",
      desc: "Morningstar article on early leaders in the active ETF race and what’s driving results.",
      type: "web",
      url: "https://www.morningstar.com/funds/big-winners-active-etf-race-so-far"
    },
    {
      id: "media-citations",
      label: "Media Citations",
      title: "Media Citations",
      desc: "CNBC piece on positioning for a pullback—defensives, quality, and portfolio considerations.",
      type: "web",
      url: "https://www.cnbc.com/2025/10/07/sp-500-where-to-invest-in-case-of-a-pullback.html"
    },

    // Optional placeholders (edit or remove)
    {
      id: "tools",
      label: "Tools",
      title: "Tools",
      desc: "Brief notes on tools and dashboards I've built to support research workflows.",
      type: "page",
      page: "pages/tools.html"
    },
    {
      id: "notes",
      label: "Notes",
      title: "Notes",
      desc: "Short notes and observations from ongoing research and market themes.",
      type: "page",
      page: "pages/notes.html"
    }
  ]
};
