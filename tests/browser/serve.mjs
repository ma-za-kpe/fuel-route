// Frozen static server for the browser check (owner-owned). It serves a built
// site as GitHub Pages does: `/` and `/dir/` serve their index.html, a path
// without an extension serves its .html page, anything else is 404. With a
// base path (`/<repository>/` on Pages, T-0504) only paths under it are the
// site, and the bare `/<repository>` redirects to it. Yard Crew's local CI
// serves the site with this same file, so local CI and Actions agree.
// Usage: node tests/browser/serve.mjs [folder] [port] [base path]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const [root = '/site', port = '8000', base = '/'] = process.argv.slice(2);
const types = {
  '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.js': 'text/javascript',
  '.json': 'application/json', '.txt': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};
createServer(async (req, res) => {
  let path;
  try {
    path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  } catch {
    res.writeHead(400); res.end();
    return;
  }
  if (path + '/' === base) {
    res.writeHead(301, { location: base }); res.end();
    return;
  }
  if (!path.startsWith(base)) {
    res.writeHead(404); res.end();
    return;
  }
  const inside = '/' + path.slice(base.length);
  const file = inside.endsWith('/') ? inside + 'index.html' : inside;
  // As Pages does: a path without an extension serves its .html page.
  for (const tried of extname(file) ? [file] : [file, file + '.html']) {
    try {
      const body = await readFile(join(root, tried));
      res.writeHead(200, { 'content-type': types[extname(tried)] || 'text/html' });
      res.end(body);
      return;
    } catch { /* the next candidate, then 404 */ }
  }
  res.writeHead(404); res.end();
}).listen(Number(port), '127.0.0.1');
