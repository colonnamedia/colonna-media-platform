import fs from 'node:fs';
const clients=JSON.parse(fs.readFileSync('assets/clients.json','utf8'));
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const safe=value=>{if(!/^(https:\/\/|\/?assets\/)/.test(value))throw Error('Client image must be HTTPS or a local asset');return esc(value);};
const html=clients.map(c=>'<article class="client-entry"><img src="'+safe(c.image)+'" alt="Project photography for '+esc(c.name)+'" loading="lazy" decoding="async"><div>'+(c.logo?'<img class="client-logo" src="'+safe(c.logo)+'" alt="'+esc(c.name)+' logo">':'')+'<h2>'+esc(c.name)+'</h2></div></article>').join('');
const page=fs.readFileSync('clients.html','utf8');
if(!page.includes('<!-- CLIENTS:START -->')||!page.includes('<!-- CLIENTS:END -->'))throw Error('Client markers missing');
fs.writeFileSync('clients.html',page.replace(/<!-- CLIENTS:START -->[\s\S]*?<!-- CLIENTS:END -->/,'<!-- CLIENTS:START -->'+html+'<!-- CLIENTS:END -->'));
console.log('Rendered '+clients.length+' client entries');
