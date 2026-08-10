# Assembles all Colonna Media pages with a shared header + footer.
import os

SITE = "https://colonnamedia.com"   # <-- set to your real domain (canonical, OG, sitemap)

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com" />'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />'
         '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />')

# Per-page SEO metadata. "path" is the canonical URL path relative to SITE.
META = {
  "index.html": {
    "path": "/",
    "title": "Colonna Media | Pittsburgh Marketing Consulting for Small Business",
    "desc": "Colonna Media helps Pittsburgh startups and small businesses grow with marketing strategy, lead generation, ad campaigns, automations, and content. Book a free consultation.",
    "crumb": None },
  "services.html": {
    "path": "/services.html",
    "title": "Marketing Services in Pittsburgh | Colonna Media",
    "desc": "Marketing strategy, lead generation, brand awareness, ad campaigns, automations, and content for Pittsburgh startups and small businesses. Book a free session.",
    "crumb": "Services" },
  "built.html": {
    "path": "/built.html",
    "title": "Our Work | Colonna Media, Pittsburgh Marketing & Content",
    "desc": "See brands, campaigns, content, and tools Colonna Media has built for small businesses in Pittsburgh and beyond.",
    "crumb": "Work" },
  "about.html": {
    "path": "/about.html",
    "title": "About Anthony Colonna | Colonna Media, Pittsburgh",
    "desc": "Meet Anthony Colonna and the Pittsburgh studio helping startups and small businesses grow with marketing strategy, content, and systems.",
    "crumb": "About" },
  "contact.html": {
    "path": "/contact.html",
    "title": "Contact & Book a Free Session | Colonna Media, Pittsburgh",
    "desc": "Book a free 30-minute marketing consultation with Colonna Media in Pittsburgh, or send a message. Serving clients locally and nationwide.",
    "crumb": "Contact" },
  "404.html": {
    "path": "/404.html",
    "title": "Page Not Found | Colonna Media",
    "desc": "Sorry, that page could not be found.",
    "crumb": None, "noindex": True },
}

def esc(t):
    return t.replace("&", "&amp;").replace('"', "&quot;")

def head(name):
    m = META[name]
    title, desc, url = esc(m["title"]), esc(m["desc"]), SITE + m["path"]
    robots = "noindex, follow" if m.get("noindex") else "index, follow"
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<script>document.documentElement.className += ' js';</script>
<title>{title}</title>
<meta name="description" content="{desc}" />
<meta name="robots" content="{robots}" />
<meta name="author" content="Colonna Media" />
<link rel="canonical" href="{url}" />
<meta name="theme-color" content="#221C3A" />

<!-- Local SEO / geo -->
<meta name="geo.region" content="US-PA" />
<meta name="geo.placename" content="Pittsburgh" />
<meta name="geo.position" content="40.4406;-79.9959" />
<meta name="ICBM" content="40.4406, -79.9959" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Colonna Media" />
<meta property="og:locale" content="en_US" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{desc}" />
<meta property="og:url" content="{url}" />
<meta property="og:image" content="{SITE}/assets/img/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Colonna Media — marketing consulting for startups and small business" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{desc}" />
<meta name="twitter:image" content="{SITE}/assets/img/og-image.jpg" />

<!-- Icons / manifest -->
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="assets/img/favicon.png" sizes="32x32" type="image/png" />
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png" />
<link rel="manifest" href="site.webmanifest" />

{FONTS}
<link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
<link rel="stylesheet" href="assets/styles.css" />
</head>
<body>'''

def jsonld(name):
    import json
    m = META[name]
    services = ["Marketing Strategy", "Lead Generation", "Brand Awareness",
                "Ad Campaigns", "Automations & Systems", "Content & Photography"]
    business = {
      "@type": ["ProfessionalService", "LocalBusiness"],
      "@id": SITE + "/#business",
      "name": "Colonna Media",
      "url": SITE + "/",
      "image": SITE + "/assets/img/og-image.jpg",
      "logo": SITE + "/assets/img/apple-touch-icon.png",
      "description": "Marketing consulting for startups and small businesses — strategy, lead generation, ad campaigns, automations, and content.",
      "email": "colonnamedia@gmail.com",
      "priceRange": "$$",
      "founder": {"@type": "Person", "name": "Anthony Colonna"},
      "address": {"@type": "PostalAddress", "addressLocality": "Pittsburgh", "addressRegion": "PA", "addressCountry": "US"},
      "geo": {"@type": "GeoCoordinates", "latitude": 40.4406, "longitude": -79.9959},
      "areaServed": [{"@type": "City", "name": "Pittsburgh"}, {"@type": "Country", "name": "United States"}],
      "knowsAbout": services,
      "hasOfferCatalog": {
        "@type": "OfferCatalog", "name": "Marketing Services",
        "itemListElement": [
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": sv}} for sv in services
        ]
      }
      # TODO: add "telephone" and "sameAs" (social profile URLs) when available.
    }
    website = {"@type": "WebSite", "@id": SITE + "/#website", "name": "Colonna Media",
               "url": SITE + "/", "inLanguage": "en-US", "publisher": {"@id": SITE + "/#business"}}
    graph = [business, website]
    if m.get("crumb"):
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": m["crumb"], "item": SITE + m["path"]},
        ]})
    if name == "index.html":
        graph.append({"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]})
    if name == "about.html":
        graph.append({"@type": "Person", "name": "Anthony Colonna",
                      "jobTitle": "Marketing Strategist & Photographer", "worksFor": {"@id": SITE + "/#business"}})
    data = {"@context": "https://schema.org", "@graph": graph}
    return '<script type="application/ld+json">' + json.dumps(data, separators=(",", ":")) + "</script>"


NAV = [("Home","index.html"),("Services","services.html"),("Work","built.html"),("About","about.html"),("Contact","contact.html")]

def header(active):
    links = "".join(
        f'<a href="{href}"{" class=\"active\"" if href==active else ""}>{label}</a>'
        for label,href in NAV)
    mlinks = "".join(f'<a href="{href}">{label}</a>' for label,href in NAV)
    brand = ('<a class="brand" href="index.html">'
             '<span class="colonnade"><i></i><i></i><i></i><i></i><i></i></span>'
             '<b>Colonna <span>Media</span></b></a>')
    return f'''<header>
  <div class="wrap">
    <div class="bar">
      {brand}
      <nav class="nav-links">{links}</nav>
      <a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-green nav-cta">Book free session</a>
      <button class="menu-toggle" aria-label="Menu" aria-expanded="false"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
    </div>
    <div class="mobile-menu" id="mobileMenu">{mlinks}<a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-green">Book free session</a></div>
  </div>
</header>'''

FOOTER = '''<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="brand" href="index.html"><span class="colonnade"><i></i><i></i><i></i><i></i><i></i></span><b>Colonna <span>Media</span></b></a>
        <p>Marketing consulting for startups and small businesses. Strategy, leads, and content that make your business grow — in Pittsburgh and nationwide.</p>
      </div>
      <div class="foot-cols">
        <div class="foot-col"><h4>Company</h4><a href="index.html">Home</a><a href="services.html">Services</a><a href="built.html">Work</a><a href="about.html">About</a></div>
        <div class="foot-col"><h4>Services</h4><a href="services.html">Strategy</a><a href="services.html">Lead Gen</a><a href="services.html">Campaigns</a><a href="services.html">Content</a></div>
        <div class="foot-col"><h4>Get started</h4><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener">Book free session</a><a href="contact.html">Contact</a><a href="mailto:colonnamedia@gmail.com">colonnamedia@gmail.com</a></div>
      </div>
    </div>
    <div class="foot-bottom"><span>&copy; 2026 Colonna Media</span><span>Pittsburgh, PA &middot; Nationwide</span></div>
  </div>
</footer>
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
<script>
(function(){var d=document;
  var h=d.querySelector('header');
  if(h){var f=function(){h.classList.toggle('scrolled',window.scrollY>30);};addEventListener('scroll',f,{passive:true});f();}
  var t=d.querySelector('.menu-toggle'),m=d.getElementById('mobileMenu');
  if(t&&m){t.addEventListener('click',function(){var o=m.classList.toggle('open');t.setAttribute('aria-expanded',o?'true':'false');});
    m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){m.classList.remove('open');});});}
  var els=d.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in');});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.12});
  els.forEach(function(e){io.observe(e);});
  addEventListener('load',function(){setTimeout(function(){els.forEach(function(e){if(e.getBoundingClientRect().top<innerHeight)e.classList.add('in');});},250);});
})();
</script>
<script src="assets/app.js"></script>
</body>
</html>'''

def page(name, active, body):
    html = head(name) + "\n" + header(active) + "\n" + body + "\n" + jsonld(name) + "\n" + FOOTER
    open(name, "w").write(html)
    print("wrote", name, len(html)//1024, "KB")

# ---------- shared snippets ----------
FINAL_CTA = '''<section class="final">
  <div class="wrap">
    <div class="final-card reveal">
      <div class="colb"><i style="height:40%;background:var(--blue)"></i><i style="height:70%;background:var(--yellow)"></i><i style="height:100%;background:var(--green)"></i><i style="height:60%;background:var(--blue)"></i><i style="height:80%;background:var(--yellow)"></i></div>
      <h2>Ready to grow your business?</h2>
      <p>Book your free 30-minute session and let's map the fastest path to more customers.</p>
      <a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-green btn-lg">Start my free session →</a>
    </div>
  </div>
</section>'''

FAQ = [
  ("Do you work with businesses outside Pittsburgh?",
   "Yes. We consult on-site with businesses around Pittsburgh and work virtually with startups and small businesses nationwide."),
  ("What happens on the free 30-minute session?",
   "We learn about your business and goals, pinpoint what's holding growth back, and outline a clear next step — no pressure and no obligation."),
  ("What kind of businesses do you help?",
   "Mostly startups and small businesses — owners who want more leads, stronger branding, and marketing that actually runs. We help you start up, grow, or revamp."),
  ("How much does marketing consulting cost?",
   "Every business is different, so we tailor scope and pricing to your goals. The first 30-minute session is always free."),
  ("How soon can we get started?",
   "Often within a week or two of your free session, depending on the scope of what you need."),
]
FAQ_SECTION = ('<section class="block" style="background:var(--cream)"><div class="wrap">'
  '<div class="head reveal"><span class="eyebrow"><span class="dot"></span>FAQ</span>'
  '<h2>Questions? We\'ve got answers</h2>'
  '<p>A few things Pittsburgh business owners ask us before booking a session.</p></div>'
  '<div class="faq-wrap reveal">'
  + "".join('<details class="faq"><summary>%s</summary><p>%s</p></details>' % (q, a) for q, a in FAQ)
  + '</div></div></section>\n\n')

TICKER = '''<div class="ticker">
  <div class="row">
    <span>Marketing Strategy<i>&#9670;</i>Lead Generation<i>&#9670;</i>Brand Awareness<i>&#9670;</i>Ad Campaigns<i>&#9670;</i>Automations<i>&#9670;</i>Content &amp; Photography<i>&#9670;</i></span>
    <span>Marketing Strategy<i>&#9670;</i>Lead Generation<i>&#9670;</i>Brand Awareness<i>&#9670;</i>Ad Campaigns<i>&#9670;</i>Automations<i>&#9670;</i>Content &amp; Photography<i>&#9670;</i></span>
  </div>
</div>'''

# ---------- HOME ----------
home_body = '''<section class="hero" id="top">
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="wrap">
    <div class="hero-grid">
      <div>
        <span class="eyebrow"><span class="dot"></span>Marketing consulting &middot; Startups &amp; small business</span>
        <h1>
          Start strong.<br>
          Grow <span class="squiggle u-blue">smart<svg viewBox="0 0 120 12" preserveAspectRatio="none"><path d="M2 8 C 30 2, 60 12, 118 4" stroke="#2E9BEE" stroke-width="4" fill="none" stroke-linecap="round"/></svg></span>.<br>
          <span class="u-pink">Revamp</span> everything.
        </h1>
        <p class="lead">We're the marketing partner for startups and small businesses that want more customers — strategy, leads, and content that actually move the needle. First step is a free 30-minute session.</p>
        <div class="hero-cta">
          <a href="#start" class="btn btn-green btn-lg">Start my free session →</a>
          <a href="#paths" class="btn btn-outline btn-lg">How it works</a>
        </div>
        <div class="trust"><span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span>Trusted by 50+ local businesses</span></div>
      </div>
      <div class="hero-visual">
        <div class="badge"><span class="d"></span>Anthony &middot; your guide</div>
        <div class="photo-card"><img src="assets/img/anthony.jpg" alt="Anthony Colonna, Pittsburgh marketing consultant and photographer" width="800" height="1200" fetchpriority="high" decoding="async" /></div>
        <div class="hero-bars"><i></i><i></i><i></i><i></i></div>
      </div>
    </div>
  </div>
</section>

''' + TICKER + '''

<section class="block" id="paths">
  <div class="wrap">
    <div class="head reveal">
      <span class="colonnade"><i></i><i></i><i></i><i></i><i></i></span>
      <h2>Wherever your business is at</h2>
      <p>Just getting started, ready to grow, or stuck and needing a reset — we meet you there and build the plan from the ground up.</p>
    </div>
    <div class="paths">
      <div class="path p1 reveal"><span class="cap"></span><div class="ic">🚀</div><h3>Start it up</h3><p>Launching something new? We help you nail your offer, brand, and first customers so you start with momentum instead of guessing.</p><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="go">Start here →</a></div>
      <div class="path p2 reveal"><span class="cap"></span><div class="ic">📈</div><h3>Grow it bigger</h3><p>Already running? We build the campaigns, lead systems, and automations that turn steady into scaling — without the chaos.</p><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="go">Let's grow →</a></div>
      <div class="path p3 reveal"><span class="cap"></span><div class="ic">🔄</div><h3>Revamp &amp; reset</h3><p>Feeling stuck? We diagnose what's holding you back and rebuild the strategy to pull the business out of the hole.</p><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="go">Get unstuck →</a></div>
    </div>
  </div>
</section>

<section class="block journey" id="start">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow green"><span class="dot"></span>Free 30-minute session</span>
      <h2>Let's map your next move</h2>
      <p>Answer a few quick questions and we'll tailor your free session to exactly what your business needs. Takes about 30 seconds.</p>
    </div>
    <div class="jcard reveal" id="journey-card">
      <div class="jhead"><h3 id="j-title">Tell us about your business</h3><span class="free">✓ Free · No obligation</span></div>
      <div class="prog"><i id="p0"></i><i id="p1"></i><i id="p2"></i><i id="p3"></i></div>
      <div class="prog-label" id="prog-label">Step 1 of 4</div>
      <div class="jbody">
        <div class="step active" data-step="0">
          <div class="qh">What best describes you right now?</div>
          <div class="qsub">This helps us point the conversation in the right direction.</div>
          <div class="choices">
            <button class="choice" data-val="Starting up"><span class="ci">🚀</span><b>Starting up</b><small>I'm launching a new business or idea</small></button>
            <button class="choice" data-val="Growing"><span class="ci">📈</span><b>Growing</b><small>I have a business and want more customers</small></button>
            <button class="choice" data-val="Revamping"><span class="ci">🔄</span><b>Revamping</b><small>I'm stuck and need a fresh strategy</small></button>
          </div>
        </div>
        <div class="step" data-step="1">
          <div class="qh">What do you want to focus on?</div>
          <div class="qsub">Pick as many as you like — no wrong answers.</div>
          <div class="chips" id="focus-chips">
            <button class="chip" data-val="More leads">More leads</button>
            <button class="chip" data-val="Brand awareness">Brand awareness</button>
            <button class="chip" data-val="Ad campaigns">Ad campaigns</button>
            <button class="chip" data-val="Automations & systems">Automations &amp; systems</button>
            <button class="chip" data-val="Content & photography">Content &amp; photography</button>
            <button class="chip" data-val="Not sure yet">Not sure yet — help me!</button>
          </div>
        </div>
        <div class="step" data-step="2">
          <div class="qh">How soon are you looking to start?</div>
          <div class="qsub">No pressure — this just helps us prep.</div>
          <div class="chips" id="timing-chips">
            <button class="chip" data-val="ASAP">As soon as possible</button>
            <button class="chip" data-val="Next month or two">In the next month or two</button>
            <button class="chip" data-val="Just exploring">Just exploring for now</button>
          </div>
        </div>
        <div class="step" data-step="3">
          <div class="qh">Where should we send the details?</div>
          <div class="qsub">We'll use this to confirm your free 30-minute session.</div>
          <div class="fields">
            <div class="field"><label>First name</label><input id="f-name" type="text" placeholder="Jordan" /><span class="msg">Please add your name</span></div>
            <div class="field"><label>Business name</label><input id="f-biz" type="text" placeholder="Your business" /></div>
            <div class="field full"><label>Email</label><input id="f-email" type="email" placeholder="you@business.com" /><span class="msg">Please add a valid email</span></div>
          </div>
        </div>
        <div class="jnav"><button class="link-btn" id="back" disabled>← Back</button><button class="btn btn-blue" id="next">Continue →</button></div>
      </div>
      <div class="success" id="success">
        <div class="tick">✓</div>
        <h3>You're all set, <span id="s-name">friend</span>!</h3>
        <p>Here's what we'll focus on in your free 30-minute session:</p>
        <div class="recap" id="recap"></div>
        <a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" target="_blank" rel="noopener" class="btn btn-green btn-lg" id="cal-btn">Pick your time →</a>
        <p style="margin-top:16px;font-size:13px">Prefer email? Email us at <b><a href="mailto:colonnamedia@gmail.com">colonnamedia@gmail.com</a></b></p>
      </div>
    </div>
  </div>
</section>

<section class="block services" id="services">
  <div class="wrap">
    <div class="head reveal">
      <span class="eyebrow"><span class="dot"></span>What we do</span>
      <h2>Everything to make your business grow</h2>
      <p>Consulting-led, results-focused, and built around your goals — pick a piece or let us handle the whole picture.</p>
    </div>
    <div class="pillars">
      <div class="pillar reveal"><span class="cap"></span><div class="pb"><div class="pi">🧭</div><h3>Marketing Strategy</h3><p>A clear plan for your offer, message, and customer journey — so every dollar you spend has a job to do.</p></div></div>
      <div class="pillar reveal"><span class="cap"></span><div class="pb"><div class="pi">🎯</div><h3>Lead Generation</h3><p>Dependable systems and funnels that bring in qualified leads ready to become paying customers.</p></div></div>
      <div class="pillar reveal"><span class="cap"></span><div class="pb"><div class="pi">📣</div><h3>Brand Awareness</h3><p>Get seen by the right people, locally or nationally, and become the obvious choice in your market.</p></div></div>
      <div class="pillar reveal"><span class="cap"></span><div class="pb"><div class="pi">🚀</div><h3>Ad Campaigns</h3><p>Meta &amp; Google campaigns — creative, setup, and strategy — engineered to bring in real inquiries.</p></div></div>
      <div class="pillar reveal"><span class="cap"></span><div class="pb"><div class="pi">⚙️</div><h3>Automations &amp; Systems</h3><p>Put follow-ups, booking, and busywork on autopilot so the business runs smoother on its own.</p></div></div>
      <div class="pillar reveal"><span class="cap"></span><div class="pb"><div class="pi">📸</div><h3>Content &amp; Photography</h3><p>Scroll-stopping photo, video, and content that makes a small business look like the big player.</p></div></div>
    </div>
    <div style="text-align:center;margin-top:40px" class="reveal"><a href="services.html" class="btn btn-outline btn-lg">See all services in detail →</a></div>
  </div>
</section>

<section class="block guide">
  <div class="wrap">
    <div class="guide-grid">
      <div class="guide-photo reveal"><img src="assets/img/anthony.jpg" alt="Anthony Colonna, Pittsburgh marketing strategist, holding a camera" loading="lazy" decoding="async" /><span class="guide-tag">📷 Anthony Colonna</span></div>
      <div class="reveal">
        <span class="eyebrow green"><span class="dot"></span>Meet your guide</span>
        <h2>We don't just hand you a plan — we walk it with you.</h2>
        <p>Colonna Media is led by Anthony Colonna, a photographer and marketing strategist who helps small businesses look bigger and grow faster. From the first idea to the finished campaign, we guide you through every step and create the content that brings it to life.</p>
        <p>The name Colonna is Italian for <b>column</b> — and that's how we think about marketing: strong pillars, built to hold real growth.</p>
        <a href="about.html" class="btn btn-ink btn-lg" style="margin-top:12px">More about us →</a>
      </div>
    </div>
  </div>
</section>

<section class="block client">
  <div class="wrap">
    <div class="client-grid">
      <div class="client-photo reveal"><img src="assets/img/maura.jpg" alt="Maura, a Colonna Media client, working on her laptop" loading="lazy" decoding="async" /></div>
      <div class="reveal">
        <div class="quote-mark">&ldquo;</div>
        <blockquote>Working with Colonna Media gave our brand the clarity and momentum we'd been missing.</blockquote>
        <div class="cite">Maura<small>Business owner &amp; Colonna Media client</small></div>
        <span class="ph-note">Placeholder quote — swap in Maura's real words</span>
      </div>
    </div>
  </div>
</section>

<section class="block power">
  <div class="wrap">
    <div class="power-inner reveal">
      <img src="assets/img/nyc.jpg" alt="Bold brand photography by Colonna Media" width="1300" height="960" loading="lazy" decoding="async" />
      <div class="power-copy">
        <h2>Marketing with a <em>punch</em>.</h2>
        <p>Bold strategy, bold visuals, bold results. We help small businesses show up with the kind of energy that makes people stop and pay attention.</p>
        <a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-green btn-lg">Let's build yours →</a>
      </div>
    </div>
  </div>
</section>

<section class="block built" id="built">
  <div class="wrap">
    <div class="built-top reveal">
      <div><span class="eyebrow"><span class="dot"></span>Proof</span><h2>A few things we've built</h2><p>Brands, campaigns, and content we've created for local businesses. The full story lives on one page.</p></div>
      <a href="built.html" class="built-link">See everything we've built →</a>
    </div>
    <div class="built-grid reveal">
      <div class="bcard"><img src="https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/8e8ca9b37_IMG_3608.jpg" alt="Cardello project by Colonna Media" loading="lazy" decoding="async"><span>Cardello</span></div>
      <div class="bcard"><img src="https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/1878d50f9_IMG_3673.png" alt="Nemacolin project by Colonna Media" loading="lazy" decoding="async"><span>Nemacolin</span></div>
      <div class="bcard"><img src="https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/535ff1389_IMG_3667.png" alt="Jenni G project by Colonna Media" loading="lazy" decoding="async"><span>Jenni G</span></div>
      <div class="bcard"><img src="https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/86e44a60c_IMG_3678.png" alt="Fabus Fitness project by Colonna Media" loading="lazy" decoding="async"><span>Fabus Fitness</span></div>
      <div class="bcard"><img src="https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/0c8d64c6c_IMG_3672.png" alt="Book Buddies project by Colonna Media" loading="lazy" decoding="async"><span>Book Buddies</span></div>
    </div>
  </div>
</section>

''' + FINAL_CTA
home_body = home_body.replace(FINAL_CTA, FAQ_SECTION + FINAL_CTA)
page("index.html", "index.html", home_body)

# ---------- SERVICES ----------
services_body = '''<section class="page-header">
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="wrap"><div class="inner">
    <span class="eyebrow"><span class="dot"></span>What we do</span>
    <h1>Services that <span class="u-green">grow</span> your business</h1>
    <p>Everything is consulting-led and built around your goals. Start with strategy, or let us run the whole engine — leads, campaigns, automations, and content.</p>
    <div style="margin-top:26px"><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-green btn-lg">Book a free session →</a></div>
  </div></div>
</section>

''' + TICKER + '''

<section class="block services">
  <div class="wrap">
    <div class="svc-list">
      <div class="svc reveal"><div class="svc-ic">🧭</div><div><h3>Marketing Strategy</h3><p>We audit where you are and build a clear, practical plan — positioning, offer, messaging, and the customer journey that ties it all together.</p><ul><li>Brand &amp; offer clarity</li><li>Customer journey map</li><li>90-day growth plan</li></ul></div><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-outline svc-cta">Start →</a></div>
      <div class="svc reveal"><div class="svc-ic">🎯</div><div><h3>Lead Generation</h3><p>Turn attention into inquiries with funnels, offers, and outreach designed to bring in qualified leads you can actually close.</p><ul><li>Lead funnels</li><li>Landing pages</li><li>Follow-up sequences</li></ul></div><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-outline svc-cta">Start →</a></div>
      <div class="svc reveal"><div class="svc-ic">📣</div><div><h3>Brand Awareness</h3><p>Get seen by the right people. Content and positioning that make you the obvious choice in your market — locally or nationally.</p><ul><li>Content strategy</li><li>Social presence</li><li>Local visibility</li></ul></div><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-outline svc-cta">Start →</a></div>
      <div class="svc reveal"><div class="svc-ic">🚀</div><div><h3>Ad Campaigns</h3><p>Conversion-focused Meta &amp; Google campaigns — creative, setup, targeting, and optimization built to bring in real inquiries.</p><ul><li>Creative &amp; copy</li><li>Campaign setup</li><li>Ongoing optimization</li></ul></div><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-outline svc-cta">Start →</a></div>
      <div class="svc reveal"><div class="svc-ic">⚙️</div><div><h3>Automations &amp; Systems</h3><p>Put the follow-ups, booking, and busywork on autopilot so nothing slips and the business runs smoother on its own.</p><ul><li>CRM &amp; booking setup</li><li>Email/SMS automation</li><li>Workflow cleanup</li></ul></div><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-outline svc-cta">Start →</a></div>
      <div class="svc reveal"><div class="svc-ic">📸</div><div><h3>Content &amp; Photography</h3><p>Scroll-stopping photo, video, and branded content that makes a small business look like the big player in the room.</p><ul><li>Brand photography</li><li>Video &amp; reels</li><li>Campaign content</li></ul></div><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-outline svc-cta">Start →</a></div>
    </div>
  </div>
</section>

<section class="block" style="background:var(--cream)">
  <div class="wrap">
    <div class="head reveal"><span class="eyebrow green"><span class="dot"></span>How we work</span><h2>Simple, clear, built on pillars</h2><p>No jargon, no guesswork — just a straight path from where you are to steady growth.</p></div>
    <div class="process">
      <div class="pstep reveal"><div class="pnum">1</div><h3>Consult</h3><p>A free 30-minute session to understand your business, goals, and what's in the way.</p></div>
      <div class="pstep reveal"><div class="pnum">2</div><h3>Strategy</h3><p>We map the plan — the offer, the message, and the growth levers that fit you.</p></div>
      <div class="pstep reveal"><div class="pnum">3</div><h3>Build</h3><p>Campaigns, content, funnels, and automations — we create and launch it with you.</p></div>
      <div class="pstep reveal"><div class="pnum">4</div><h3>Grow</h3><p>We measure, refine, and scale what's working so the results keep compounding.</p></div>
    </div>
  </div>
</section>

''' + FINAL_CTA
page("services.html", "services.html", services_body)

# ---------- BUILT ----------
GAL = [
  ("8e8ca9b37_IMG_3608.jpg","Cardello Lighting","Branding"),
  ("68e52102f_IMG_3658.jpg","Violin Performance","Event"),
  ("f875a32dc_IMG_3663.jpg","Studio Portrait","Portrait"),
  ("9093b13b1_IMG_3664.jpg","Book Club Campaign","Content"),
  ("aa9b81bbd_IMG_3674.png","Cardello Showroom","Commercial"),
  ("1878d50f9_IMG_3673.png","Nemacolin Resort","Luxury"),
  ("535ff1389_IMG_3667.png","Jenni G Jewelry","Product"),
  ("86e44a60c_IMG_3678.png","Justin Fabus Fitness","Lifestyle"),
  ("b702f5e94_IMG_3680.png","Overthrow New York","Editorial"),
  ("26d2d043d_IMG_3675.png","Lucid Juice","Campaign"),
  ("0c8d64c6c_IMG_3672.png","Burgh Book Buddies","Community"),
  ("56733b31f_IMG_3671.png","Revitalize, or Die.","Strategy"),
]
base = "https://media.base44.com/images/public/user_68e7dc262584ab859e1a0096/"
gal_html = "".join(
  f'<div class="g"><img src="{base}{fn}" alt="{t}" loading="lazy"><div class="cap"><b>{t}</b><span>{tag}</span></div></div>'
  for fn,t,tag in GAL)

tools_html = '''<div class="tool"><div class="t-ic">🌐</div><div><h3>Fireworks Website Builder</h3><p>Lead-generating web pages for local businesses.</p></div><a class="t-go" href="https://fireworks-websitebuilder.com" target="_blank" rel="noopener">Open →</a></div>
<div class="tool"><div class="t-ic">🔍</div><div><h3>SEO Auditor</h3><p>Local SEO visibility checks and strategy.</p></div><a class="t-go" href="https://seo-auditor-pro-copy-7436d8be.base44.app" target="_blank" rel="noopener">Open →</a></div>
<div class="tool"><div class="t-ic">✍️</div><div><h3>Content AI</h3><p>AI-powered content generation for campaigns.</p></div><a class="t-go" href="https://fire-works-content-ai.base44.app" target="_blank" rel="noopener">Open →</a></div>
<div class="tool"><div class="t-ic">🗺️</div><div><h3>Customer Journey Mapper</h3><p>Map and optimize your marketing blueprint.</p></div><a class="t-go" href="https://marketing-blueprint-build.base44.app" target="_blank" rel="noopener">Open →</a></div>'''

built_body = f'''<section class="page-header">
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="wrap"><div class="inner">
    <span class="eyebrow"><span class="dot"></span>Our work</span>
    <h1>Things we've <span class="u-pink">built</span> &amp; created</h1>
    <p>Brands, campaigns, content, and tools we've made for real businesses — a lot of it right here in Pittsburgh. Here's a look.</p>
    <div style="margin-top:26px"><a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-green btn-lg">Start your project →</a></div>
  </div></div>
</section>

<section class="block">
  <div class="wrap">
    <div class="gallery reveal">{gal_html}</div>
  </div>
</section>

<section class="block" style="background:var(--cream)">
  <div class="wrap">
    <div class="head reveal"><span class="eyebrow green"><span class="dot"></span>Tools we've built</span><h2>Products &amp; tools from our studio</h2><p>Beyond client work, we build tools that help businesses grow on their own.</p></div>
    <div class="tools reveal">{tools_html}</div>
  </div>
</section>

{FINAL_CTA}'''
page("built.html", "built.html", built_body)

# ---------- ABOUT ----------
about_body = '''<section class="page-header">
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="wrap"><div class="inner">
    <span class="eyebrow"><span class="dot"></span>About us</span>
    <h1>Big marketing, <span class="u-blue">built on pillars</span></h1>
    <p>Colonna Media is a Pittsburgh marketing studio helping startups and small businesses grow with strategy, content, and systems that actually work.</p>
  </div></div>
</section>

<section class="block guide" style="background:#fff">
  <div class="wrap">
    <div class="guide-grid">
      <div class="guide-photo reveal"><img src="assets/img/anthony.jpg" alt="Anthony Colonna, founder of Colonna Media in Pittsburgh" loading="lazy" decoding="async" /><span class="guide-tag">📷 Anthony Colonna</span></div>
      <div class="reveal">
        <span class="eyebrow green"><span class="dot"></span>Meet the founder</span>
        <h2>Hi, I'm Anthony.</h2>
        <p>I started Colonna Media to give small businesses the kind of marketing usually reserved for big budgets — sharp strategy paired with content that actually looks the part. As a photographer and marketing strategist, I don't just hand over a plan; I guide you through it and help create the work that brings it to life.</p>
        <p>My last name, Colonna, is Italian for <b>column</b>. That idea runs through everything we do: we build marketing on strong pillars — clear strategy, real content, and systems designed to hold steady growth.</p>
        <a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" class="btn btn-green btn-lg" style="margin-top:12px">Book a session with me →</a>
      </div>
    </div>
  </div>
</section>

<section class="block" style="background:var(--blue-soft)">
  <div class="wrap">
    <div class="head reveal"><span class="eyebrow"><span class="dot"></span>Why us</span><h2>What makes Colonna different</h2><p>We're a growth partner that happens to be really good at making things look great.</p></div>
    <div class="values">
      <div class="value reveal"><div class="v-ic">🎨</div><h3>Creative + strategic</h3><p>We pair artistic craft with data-driven thinking, so the work looks great and performs.</p></div>
      <div class="value reveal"><div class="v-ic">🤝</div><h3>Personal &amp; hands-on</h3><p>Boutique attention — no cookie-cutter templates, no getting passed to a junior.</p></div>
      <div class="value reveal"><div class="v-ic">📍</div><h3>Local &amp; national</h3><p>On-site in Pittsburgh, and virtual consulting for businesses anywhere in the country.</p></div>
      <div class="value reveal"><div class="v-ic">⚡</div><h3>Built to convert</h3><p>From a photo to a funnel, everything we make points toward more customers.</p></div>
      <div class="value reveal"><div class="v-ic">🧱</div><h3>Solid foundations</h3><p>Strategy first, so what we build holds up and keeps working over time.</p></div>
      <div class="value reveal"><div class="v-ic">🚀</div><h3>Growth-obsessed</h3><p>We measure what matters and double down on what moves your business forward.</p></div>
    </div>
  </div>
</section>

<section class="block client" style="background:#fff">
  <div class="wrap">
    <div class="client-grid">
      <div class="client-photo reveal"><img src="assets/img/maura.jpg" alt="Maura, a Colonna Media client, working on her laptop" loading="lazy" decoding="async" /></div>
      <div class="reveal">
        <div class="quote-mark">&ldquo;</div>
        <blockquote>Working with Colonna Media gave our brand the clarity and momentum we'd been missing.</blockquote>
        <div class="cite">Maura<small>Business owner &amp; Colonna Media client</small></div>
        <span class="ph-note">Placeholder quote — swap in Maura's real words</span>
      </div>
    </div>
  </div>
</section>

''' + FINAL_CTA
page("about.html", "about.html", about_body)

# ---------- CONTACT ----------
contact_body = '''<section class="page-header" style="padding-bottom:40px">
  <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
  <div class="wrap"><div class="inner">
    <span class="eyebrow green"><span class="dot"></span>Free 30-minute session</span>
    <h1>Let's <span class="u-green">talk</span></h1>
    <p>Pick a time that works for you and we'll talk through your business, your goals, and the fastest path to more customers. No pressure, no obligation.</p>
  </div></div>
</section>

<section class="block" style="padding-top:20px" id="book">
  <div class="wrap">
    <div class="contact-grid">
      <div class="contact-info reveal">
        <h3>Get in touch</h3>
        <div class="contact-item"><div class="ci">✉️</div><div><b>Email</b><a href="mailto:colonnamedia@gmail.com">colonnamedia@gmail.com</a></div></div>
        <div class="contact-item"><div class="ci">📍</div><div><b>Based in</b><span>Pittsburgh, PA — serving clients nationwide</span></div></div>
        <div class="contact-item"><div class="ci">💻</div><div><b>Consulting</b><span>On-site locally &amp; virtual anywhere in the US</span></div></div>
        <form class="cform" id="cform">
          <div class="field"><input id="cf-name" type="text" placeholder="Your name" required></div>
          <div class="field"><input id="cf-email" type="email" placeholder="Your email" required></div>
          <div class="field"><textarea id="cf-msg" placeholder="Tell us a bit about your business..."></textarea></div>
          <button type="submit" class="btn btn-green btn-lg">Send message →</button>
        </form>
      </div>
      <div class="reveal">
        <div class="cal-embed">
          <div class="calendly-inline-widget" data-url="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&hide_gdpr_banner=1" style="min-width:320px;height:680px;"></div>
        </div>
        <p style="text-align:center;color:var(--muted);font-size:13px;margin-top:14px">Trouble seeing the calendar? <a href="https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&amp;hide_gdpr_banner=1" data-calendly target="_blank" rel="noopener" style="color:var(--blue);font-weight:600">Open the scheduler →</a></p>
      </div>
    </div>
  </div>
</section>'''
page("contact.html", "contact.html", contact_body)

# ---------- 404 ----------
nf_body = '''<section class="nf">
  <div>
    <span class="colonnade" style="height:40px"><i></i><i></i><i></i><i></i><i></i></span>
    <h1>404</h1>
    <p>Looks like this page moved or never existed. Let's get you back on track.</p>
    <a href="index.html" class="btn btn-green btn-lg">Back to home →</a>
  </div>
</section>'''
page("404.html", "", nf_body)

print("\nAll pages built.")


# ---------- SEO / deploy files ----------
import json as _json
_LASTMOD = "2026-08-09"
_urls = [(SITE + mm["path"], "1.0" if nn == "index.html" else "0.7")
         for nn, mm in META.items() if not mm.get("noindex")]
_sm = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for _u, _p in _urls:
    _sm.append(f'  <url><loc>{_u}</loc><lastmod>{_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>{_p}</priority></url>')
_sm.append('</urlset>')
open("sitemap.xml", "w").write("\n".join(_sm) + "\n")

open("robots.txt", "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")

_manifest = {
  "name": "Colonna Media",
  "short_name": "Colonna",
  "description": "Marketing consulting for startups and small businesses in Pittsburgh and nationwide.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FBF9F5",
  "theme_color": "#221C3A",
  "icons": [
    {"src": "/assets/img/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/assets/img/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "/assets/img/apple-touch-icon.png", "sizes": "180x180", "type": "image/png", "purpose": "any maskable"}
  ]
}
open("site.webmanifest", "w").write(_json.dumps(_manifest, indent=2) + "\n")
print("wrote sitemap.xml, robots.txt, site.webmanifest")
