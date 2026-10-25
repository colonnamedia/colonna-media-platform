import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import handler from '../api/send-email.js';
assert(fs.existsSync('work.html'),'Work page entry must exist');
assert(fs.readFileSync('vite.config.js','utf8').includes("work: resolve(rootDir, 'work.html')"),'Work build entry must emit work.html');
const routeConfig=JSON.parse(fs.readFileSync('vercel.json','utf8'));
assert(!routeConfig.rewrites?.some(r=>r.source==='/work'),'Work should resolve directly');
const pages=fs.readdirSync('.').filter(p=>p.endsWith('.html'));
const published=pages.filter(p=>!['404.html','built.html'].includes(p));
const sitemap=fs.readFileSync('public/sitemap.xml','utf8');
assert.equal(sitemap,fs.readFileSync('sitemap.xml','utf8'),'sitemap copies must match');
assert(fs.readFileSync('public/robots.txt','utf8').includes('Sitemap: https://www.colonnamedia.com/sitemap.xml'));
for(const p of published){const path=p==='index.html'?'/':'/'+p.replace(/\.html$/,'');const url='https://www.colonnamedia.com'+path;const html=fs.readFileSync(p,'utf8');assert(html.includes(`rel="canonical" href="${url}"`),p+' canonical mismatch');assert(sitemap.includes(`<loc>${url}</loc>`),p+' absent from sitemap');}
for(const p of pages){const h=fs.readFileSync(p,'utf8');assert(!/calendly/i.test(h),p+' retains Calendly');const ids=[...h.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,p+' duplicate IDs');for(const m of h.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){if(m[1].includes('application/ld+json'))JSON.parse(m[2]);else if(!m[1].includes('src='))new vm.Script(m[2]);}for(const m of h.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),p+' missing anchor '+m[1]);}
const contact=fs.readFileSync('contact.html','utf8');assert.equal((contact.match(/type="checkbox"/g)||[]).length,8);assert(contact.includes('name="website_url"'));assert(contact.includes('name="website"'));
process.env.RESEND_API_KEY='mock-test-key';let sent;
globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');sent=JSON.parse(options.body);return {ok:true,json:async()=>({id:'mock'})}};
async function request(body,method='POST'){const res={code:0,setHeader(){},status(n){this.code=n;return this},json(data){this.data=data;return this}};await handler({body,method},res);return res;}
let res=await request({name:'Test <owner>',email:'test@example.com',business_name:'Example & Co',services:['social-media','google-ads'],message:'<script>unsafe</script>',location:'Pittsburgh',phone:'555',website_url:'example.com',timing:'Planning ahead'});assert.equal(res.code,200);assert(sent.html.includes('Social Media Management, Google Ads Setup'));assert(sent.html.includes('&lt;script&gt;'));assert(!sent.html.includes('<script>'));assert.equal(sent.reply_to,'test@example.com');assert(sent.html.includes('Pittsburgh'));
sent=null;res=await request({name:'Bot',email:'b@example.com',website:'filled'});assert.equal(res.code,200);assert.equal(sent,null);
assert.equal((await request('{bad')).code,400);assert.equal((await request({services:['unknown']})).code,400);assert.equal((await request({},'GET')).code,405);
console.log('PASS: '+pages.length+' pages, script/JSON syntax, anchors, eight service choices, inquiry payload, escaping, honeypot, and invalid requests. Email transport mocked; no messages sent.');
