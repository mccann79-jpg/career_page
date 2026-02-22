# Research Portfolio (GitHub Pages)

This is a static site you can host on GitHub Pages.

## Quick start (local)
- Open the folder in VS Code
- Use any local server (recommended): VS Code extension "Live Server" or run:
  - `python -m http.server 8000`
  - then open http://localhost:8000

## Deploy on GitHub Pages
1. Create a new GitHub repo (or use an existing one).
2. Copy these files into the repo root.
3. Commit and push.
4. GitHub: **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` (root)
5. Wait for GitHub to publish your site.

## Updating PDFs
### Research PDFs
- Put research PDFs in `assets/pdfs/`
- Add or edit entries in `js/site.config.js` under `research`

### Resume / Cover Letter
Replace these files (keep the same filenames so links never change):
- `assets/docs/resume.pdf`
- `assets/docs/cover-letter.pdf`

## Notes
- The PDF viewer page is `pages/viewer.html?id=<id>` and pulls metadata from `js/site.config.js`.
