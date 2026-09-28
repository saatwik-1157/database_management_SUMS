# apps/web

The SUMS dashboard: a single static page with no build step.

- `index.html` — layout, portal switcher (Admin / Student / Faculty) and
  Showroom mode
- `app.js` — fetches every endpoint from `API_BASE` (`http://localhost:8000`)
  and renders the views and Chart.js charts
- `style.css` — styles

Chart.js, Font Awesome and the Inter font load from CDNs, so the page needs
internet access.

Serve this folder and open <http://localhost:3000>:

```bash
npm run web          # python -m http.server 3000 --directory apps/web
```

Run an API server on port 8000 alongside it. Use the FastAPI server
(`npm run api:python`): it is the only one that sends the CORS headers a page
on port 3000 needs.
