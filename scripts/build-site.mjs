import { renderSite } from './render-site.mjs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const rawURL = (process.env.SITE_URL || '').trim();
const wantsIndexing = process.env.ENABLE_INDEXING === 'true';

let siteURL = null;
if (rawURL) {
  const parsed = new URL(rawURL);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/' || !parsed.hostname.includes('.')) {
    throw new Error('SITE_URL must be a public HTTPS origin, e.g. https://studio.example.org');
  }
  siteURL = parsed.origin;
}
if (wantsIndexing && !siteURL) {
  throw new Error('ENABLE_INDEXING=true requires SITE_URL for canonical and sharing metadata');
}

const config = JSON.parse(await readFile(join(root, 'config/site.json'),'utf8'));
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const path of ['styles.css', 'script.js']) {
  await cp(join(root, path), join(dist, path));
}
for (const path of ['assets', 'config', 'configurator']) {
  await cp(join(root, path), join(dist, path), { recursive: true });
}
// The editor imports the same renderer and validator used during production builds.
await mkdir(join(dist, 'scripts'), { recursive:true });
for(const file of ['render-site.mjs','validate-site.mjs']) await cp(join(root,'scripts',file),join(dist,'scripts',file));
let html = await readFile(join(root, 'index.html'), 'utf8');
let css = await readFile(join(root, 'styles.css'), 'utf8');
({ html, css } = renderSite(html, css, config));
await writeFile(join(dist, 'styles.css'), css);
const safeXML = str => String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const brandMark = config.brand.mark.trim().slice(0,4);
await writeFile(join(dist, 'assets/favicon.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="9" fill="' + config.theme.dark + '"/><text x="32" y="39" fill="' + config.theme.accent + '" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="21">' + safeXML(brandMark) + '</text></svg>\n');
await writeFile(join(dist, 'config/contact.js'), 'window.RUANG_REKA_CONTACT = Object.freeze(' + JSON.stringify({
  whatsapp: config.contact.whatsapp,
  email: config.contact.email,
  labels: {activeNote:config.labels.contactActiveNote,activeDemo:config.labels.contactActiveDemo,inactiveNote:config.labels.contactInactiveNote}
}) + ');\n');
const meta = [];
if (siteURL) {
  const absoluteHero = siteURL + '/' + config.brand.heroImage;
  const escapeAttr = str => str.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  meta.push('<link rel="canonical" href="' + escapeAttr(siteURL + '/') + '" />');
  meta.push('<meta property="og:url" content="' + escapeAttr(siteURL + '/') + '" />');
  meta.push('<meta property="og:image" content="' + escapeAttr(absoluteHero) + '" />');
  meta.push('<meta name="twitter:image" content="' + escapeAttr(absoluteHero) + '" />');
}
if (wantsIndexing) {
  html = html.replace('<meta name="robots" content="noindex, nofollow" />', '<meta name="robots" content="index, follow" />');
}
html = html.replace('  </head>', meta.map(line => '    ' + line).join('\n') + (meta.length ? '\n' : '') + '  </head>');
await writeFile(join(dist, 'index.html'), html);
console.log('Built dist/ (' + (siteURL || 'unconfigured demo URL') + '; indexing ' + (wantsIndexing ? 'enabled' : 'disabled') + ')');
