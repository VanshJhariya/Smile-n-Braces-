(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const anim = document.documentElement.classList.contains('anim');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const PHONE = 'tel:+916266604028';

  /* ---------- Treatment finder ---------- */
  const CONCERNS = [
    { chip: 'Crooked or gapped teeth', title: 'Braces or Invisalign',
      line: 'Metal or self-ligating braces, or clear aligners. Dr. Jain is a USA-certified Invisalign provider.',
      steps: ['A consultation and a digital 3D scan of your teeth', 'A plan designed around the smile you want', 'Regular check-ins until your teeth are set'],
      tech: 'iTero 3D scanner' },
    { chip: 'A missing tooth', title: 'Dental implant and fixed zirconia tooth',
      line: 'A fixed replacement that is built to look and feel like your own tooth.',
      steps: ['An examination and X-ray to plan placement', 'The implant is placed', 'A fixed zirconia tooth is fitted on top'],
      tech: 'Dental OPG machine' },
    { chip: 'Tooth pain', title: 'Root canal treatment',
      line: 'Treats an infected tooth so you can keep it, and takes the pain away. Extractions are done when a tooth cannot be saved.',
      steps: ['An examination and X-ray to find the cause', 'The infected tooth is treated', 'A crown, if needed, to protect it'],
      tech: 'Dental OPG machine' },
    { chip: 'Yellow or dull teeth', title: 'Cleaning, whitening and smile designing',
      line: 'From a professional polish to a complete aesthetic plan.',
      steps: ['Professional cleaning and polishing', 'Whitening if you want a brighter shade', 'Smile designing or tooth jewellery as extras'],
      tech: 'Aesthetic dentistry' },
    { chip: 'Bleeding or swollen gums', title: 'Gum therapy and laser gum treatment',
      line: 'Healthy gums hold your teeth in place. Treat them early.',
      steps: ['A check of your gums and bone', 'Deep cleaning, or laser treatment where suitable', 'Guidance to keep your gums healthy at home'],
      tech: 'Dental laser' },
    { chip: "My child's teeth", title: 'Pediatric dental care',
      line: 'Dentistry for children, from first check-ups to treatment.',
      steps: ['A calm first visit to meet the dentist', 'A check-up and cleaning', 'Treatment only where it is needed'],
      tech: 'Pediatric dentistry' }
  ];
  const chips = $('#chips'), res = $('#res');
  CONCERNS.forEach((c, i) => {
    const b = document.createElement('button');
    b.textContent = c.chip; b.setAttribute('aria-pressed', i === 0);
    b.onclick = () => { $$('button', chips).forEach(x => x.setAttribute('aria-pressed', x === b)); show(i, true); };
    chips.appendChild(b);
  });
  function show(i, animate) {
    const c = CONCERNS[i];
    res.innerHTML =
      '<h3>' + c.title + '</h3><p>' + c.line + '</p><ol>' + c.steps.map(s => '<li>' + s + '</li>').join('') +
      '</ol><span class="tag">' + c.tech + '</span><span class="tag">First consultation ₹200</span><br><a class="ask" href="' + PHONE + '">Ask about this, call 62666 04028</a>';
    [...res.children].forEach((el, k) => el.style.setProperty('--k', k));
    $$('li', res).forEach((el, k) => el.style.setProperty('--k', k));
    if (animate) { res.classList.remove('swap'); void res.offsetWidth; res.classList.add('swap'); }
  }
  show(0, false);

  /* ---------- Opening hours (India time) ---------- */
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const HRS = [[11, 21], [11, 21], [11, 21], [11, 21], [11, 21], [11, 21], [11, 16.5]];
  const T0 = 10, T1 = 22;
  const pct = h => (Math.min(Math.max(h, T0), T1) - T0) / (T1 - T0) * 100;
  const fmt = h => { const hh = Math.floor(h), mm = Math.round((h % 1) * 60); return ((hh + 11) % 12 + 1) + ':' + String(mm).padStart(2, '0') + (hh >= 12 ? ' pm' : ' am'); };
  const week = $('#week');
  week.innerHTML = DAYS.map((d, i) =>
    '<div class="day" data-i="' + i + '"><span>' + d + '</span><div class="track"><div class="fill" style="left:' + pct(HRS[i][0]) + '%;width:' + (pct(HRS[i][1]) - pct(HRS[i][0])) + '%"></div></div><span>' + fmt(HRS[i][0]).replace(' am', '') + ' to ' + fmt(HRS[i][1]) + '</span></div>').join('');

  function nowIST() {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const wd = p.find(x => x.type === 'weekday').value.slice(0, 3);
    return { d: DAYS.indexOf(wd), h: +p.find(x => x.type === 'hour').value % 24 + +p.find(x => x.type === 'minute').value / 60 };
  }
  function status() {
    const { d, h } = nowIST(), [o, c] = HRS[d], open = h >= o && h < c;
    let text;
    if (open) text = 'Open now, until ' + fmt(c);
    else if (h < o) text = 'Closed. Opens today at ' + fmt(o);
    else { const n = (d + 1) % 7; text = 'Closed. Opens ' + (n === 0 && d === 6 ? 'Monday' : 'tomorrow') + ' at ' + fmt(HRS[n][0]); }
    ['h', 'v'].forEach(k => { $('#' + k + 'd').className = 'dot' + (open ? ' on' : ''); $('#' + k + 's').textContent = text; });
    $$('.day', week).forEach(r => {
      const today = +r.dataset.i === d; r.classList.toggle('today', today);
      const old = $('.mark', r); if (old) old.remove();
      if (today) { const m = document.createElement('div'); m.className = 'mark'; m.style.left = 'calc(' + pct(h) + '% - 1.5px)'; $('.track', r).appendChild(m); }
    });
  }
  status(); setInterval(status, 60000);

  /* ---------- Count-up numbers ---------- */
  function count(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    if (!anim) { el.textContent = to.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1400;
    (function step(now) {
      const k = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Scroll reveals ---------- */
  $$('[data-stagger]').forEach(p => [...p.children].forEach((c, i) => { c.setAttribute('data-reveal', ''); c.style.setProperty('--d', i); }));
  $$('#gal figure').forEach((f, i) => f.style.setProperty('--d', i % 4));
  const targets = $$('[data-reveal], #gal figure');
  const reveal = t => { t.classList.add('in'); $$('[data-count]', t).forEach(count); };
  if (anim && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(t => io.observe(t));
    setTimeout(() => targets.forEach(t => { if (!t.classList.contains('in') && t.getBoundingClientRect().top < innerHeight * 1.3) reveal(t); }), 3500);
  } else targets.forEach(reveal);

  /* ---------- Progress bar, nav, parallax ---------- */
  const bar = $('#bar'), progress = $('#progress'), par = $$('[data-par]');
  let last = scrollY, queued = false;
  function onScroll() {
    if (queued) return; queued = true;
    requestAnimationFrame(() => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      bar.classList.toggle('solid', y > 20);
      bar.classList.toggle('hide', y > last && y > 240);
      last = y;
      if (anim) par.forEach(el => {
        const r = el.getBoundingClientRect();
        const off = (r.top + r.height / 2 - innerHeight / 2) * -parseFloat(el.dataset.par);
        el.style.setProperty('--py', Math.max(-40, Math.min(40, off)).toFixed(1) + 'px');
      });
      queued = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Magnetic buttons (mouse only) ---------- */
  if (anim && finePointer) $$('.mag').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.22 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.3 + 'px)';
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();
