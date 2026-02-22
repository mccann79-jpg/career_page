# Research Portfolio — Brendan McCann, CFA

A clean, config-driven static site for showcasing selected research, tools, and media citations.

## Structure

```
career_page/
├── index.html                  # Main page (rarely needs editing)
├── css/
│   └── styles.css              # All styles
├── js/
│   ├── site.config.js          # ⭐ Edit this to update content
│   └── main.js                 # App logic (tabs, viewers, zoom)
├── assets/
│   ├── img/
│   │   ├── headshot.jpeg       # Your headshot photo
│   │   └── favicon-512.png     # Favicon
│   └── docs/
│       ├── resume.pdf          # Your resume
│       ├── cover-letter.pdf    # Your cover letter
│       └── *.pdf               # Research PDFs
└── README.md
```

## Quick Start

1. **Add your files** to `assets/img/` and `assets/docs/`
2. **Edit `js/site.config.js`** to update your name, subtitle, tabs, and links
3. **Serve locally** — open with VS Code Live Server, or:
   ```bash
   npx serve .
   ```
4. **Deploy** — push to GitHub and enable GitHub Pages (set source to root of `main` branch)

## Configuration

All content is driven by `js/site.config.js`. Each tab entry supports three types:

| Type   | Fields                                      | Description                  |
|--------|---------------------------------------------|------------------------------|
| `pdf`  | `file`, `title`, `meta`                     | Embedded PDF viewer          |
| `web`  | `url`, `title`                              | Embedded web iframe          |
| `html` | `html`, `title`                             | Inline HTML content          |

### Adding a new research piece

```js
{
  id: "my-research",
  label: "My New Paper",        // Tab label
  type: "pdf",
  file: "assets/docs/paper.pdf",
  title: "My New Paper",        // Viewer header
  meta: "Journal Name · 2024",
}
```

## GitHub Pages

The `<base>` tag in `index.html` auto-detects localhost vs GitHub Pages:

- **Localhost**: base = `/`
- **GitHub Pages**: base = `/career_page/`

If your repo name differs from `career_page`, update the base path in `index.html`.

## License

Personal use. Content © Brendan McCann.
