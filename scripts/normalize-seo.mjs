import fs from 'node:fs';

// One-time, repeatable cleanup of the public www URL across static pages.
const pages = fs.readdirSync('.').filter(name => name.endsWith('.html'));
for (const name of pages) {
  let html = fs.readFileSync(name, 'utf8');
  html = html.replaceAll('https://colonnamedia.com', 'https://www.colonnamedia.com');
  html = html.replaceAll('https://www.colonnamedia.com/built.html', 'https://www.colonnamedia.com/work');
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (block, raw) => {
    const data = JSON.parse(raw);
    for (const node of data['@graph'] ?? [data]) {
      if (node['@type'] === 'BreadcrumbList') {
        for (const crumb of node.itemListElement ?? []) {
          if (typeof crumb.item === 'string') crumb.item = crumb.item.replace(/\.html$/, '');
        }
      }
    }
    // FAQ markup was copied to pages with different questions. Keep it only where
    // every question is actually visible to visitors on this page.
    if (Array.isArray(data['@graph'])) {
      data['@graph'] = data['@graph'].filter(node => node['@type'] !== 'FAQPage' ||
        node.mainEntity?.every(question => html.includes(`<summary>${question.name}</summary>`)));
    }
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  });
  fs.writeFileSync(name, html);
}
for (const name of ['sitemap.xml', 'public/sitemap.xml', 'public/robots.txt']) {
  const content = fs.readFileSync(name, 'utf8');
  fs.writeFileSync(name, content.replaceAll('https://colonnamedia.com', 'https://www.colonnamedia.com'));
}
