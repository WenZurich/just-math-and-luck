# jml-quote-proxy (backup quote relay)

Free Cloudflare Worker the site falls back to when `r.jina.ai` fails.

- GET only, `?url=<encoded upstream>`.
- Allowlist: `query1/query2.finance.yahoo.com`, `mis.twse.com.tw`. Anything else → 403.
- CORS only for `https://wenzurich.github.io` (and localhost dev ports).
- 15 s edge cache. No secrets.

Deploy: `npx wrangler login` (or `CLOUDFLARE_API_TOKEN` with Workers Scripts:Edit), then
`npx wrangler deploy` here, and set `QUOTE_PROXY_URL` in `src/relay.js`.
