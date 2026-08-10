/* Colonna Media — shared site script */
(function () {
  var CAL = 'https://calendly.com/colonnamedia/marketing-strategy?hide_event_type_details=1&hide_gdpr_banner=1';

  /* header scroll, mobile menu & reveal are handled by the inline bootstrap script in each page (robust even if this file fails to load). */


  /* open Calendly popup (with new-tab fallback) */
  function openCalendly() {
    if (window.Calendly && window.Calendly.initPopupWidget) {
      window.Calendly.initPopupWidget({ url: CAL });
    } else {
      window.open(CAL, '_blank', 'noopener');
    }
  }
  document.querySelectorAll('[data-calendly]').forEach(function (btn) {
    btn.addEventListener('click', function (ev) { ev.preventDefault(); openCalendly(); });
  });

  /* ---- consultation journey (homepage) ---- */
  var journey = document.getElementById('journey-card');
  if (journey) {
    var state = { step: 0, who: null, focus: [], timing: null, name: '', biz: '', email: '' };
    var steps = journey.querySelectorAll('.step');
    var bars = ['p0', 'p1', 'p2', 'p3'].map(function (id) { return document.getElementById(id); });
    var back = document.getElementById('back'), next = document.getElementById('next');
    var label = document.getElementById('prog-label'), title = document.getElementById('j-title');
    var titles = ['Tell us about your business', 'What matters most to you', 'Timing', 'Almost there'];

    function render() {
      steps.forEach(function (s) { s.classList.toggle('active', +s.dataset.step === state.step); });
      bars.forEach(function (b, i) { b.classList.toggle('on', i <= state.step); });
      label.textContent = 'Step ' + (state.step + 1) + ' of 4';
      title.textContent = titles[state.step];
      back.disabled = state.step === 0;
      next.textContent = state.step === 3 ? 'Book my free session →' : 'Continue →';
    }
    journey.querySelectorAll('[data-step="0"] .choice').forEach(function (c) {
      c.addEventListener('click', function () {
        journey.querySelectorAll('[data-step="0"] .choice').forEach(function (x) { x.classList.remove('sel'); });
        c.classList.add('sel'); state.who = c.dataset.val;
      });
    });
    journey.querySelectorAll('#focus-chips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        c.classList.toggle('sel');
        var v = c.dataset.val;
        var i = state.focus.indexOf(v);
        if (i > -1) state.focus.splice(i, 1); else state.focus.push(v);
      });
    });
    journey.querySelectorAll('#timing-chips .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        journey.querySelectorAll('#timing-chips .chip').forEach(function (x) { x.classList.remove('sel'); });
        c.classList.add('sel'); state.timing = c.dataset.val;
      });
    });
    function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
    function shake(el) { el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 280 }); }
    next.addEventListener('click', function () {
      if (state.step === 0 && !state.who) { shake(next); return; }
      if (state.step === 1 && state.focus.length === 0) { shake(next); return; }
      if (state.step === 3) {
        var nameF = document.getElementById('f-name').parentElement;
        var emailF = document.getElementById('f-email').parentElement;
        state.name = document.getElementById('f-name').value.trim();
        state.biz = document.getElementById('f-biz').value.trim();
        state.email = document.getElementById('f-email').value.trim();
        var ok = true;
        if (!state.name) { nameF.classList.add('err'); ok = false; } else nameF.classList.remove('err');
        if (!validEmail(state.email)) { emailF.classList.add('err'); ok = false; } else emailF.classList.remove('err');
        if (!ok) return;
        finish(); return;
      }
      if (state.step < 3) { state.step++; render(); }
    });
    back.addEventListener('click', function () { if (state.step > 0) { state.step--; render(); } });
    function finish() {
      journey.querySelector('.jbody').style.display = 'none';
      journey.querySelector('.prog').style.display = 'none';
      journey.querySelector('.prog-label').style.display = 'none';
      journey.querySelector('.jhead').style.display = 'none';
      var s = document.getElementById('success'); s.classList.add('on');
      document.getElementById('s-name').textContent = state.name;
      var recap = document.getElementById('recap'); recap.innerHTML = '';
      var tags = [state.who].concat(state.focus.length ? state.focus : ['We\u2019ll figure it out together']);
      tags.forEach(function (t) { var el = document.createElement('span'); el.textContent = t; recap.appendChild(el); });
      s.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    document.getElementById('cal-btn').addEventListener('click', function (ev) { ev.preventDefault(); openCalendly(); });
    render();
  }

  /* ---- contact form -> mailto ---- */
  var cform = document.getElementById('cform');
  if (cform) {
    cform.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var n = document.getElementById('cf-name').value.trim();
      var e = document.getElementById('cf-email').value.trim();
      var m = document.getElementById('cf-msg').value.trim();
      var subject = encodeURIComponent('New inquiry from ' + (n || 'website'));
      var body = encodeURIComponent('Name: ' + n + '\nEmail: ' + e + '\n\n' + m);
      window.location.href = 'mailto:colonnamedia@gmail.com?subject=' + subject + '&body=' + body;
    });
  }
})();
