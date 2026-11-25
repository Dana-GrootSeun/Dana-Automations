// Hero "paste your channel link" box: opens the enquiry dialog with the link already filled in.
const pilotForm = document.getElementById('pilotForm');
const enquiry = document.getElementById('enquiry');
if (pilotForm && enquiry) {
  pilotForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const lead = document.getElementById('leadForm');
    const link = pilotForm.elements.channel.value.trim();
    lead.elements.service.value = 'Clipify';
    if (link && !lead.elements.details.value) lead.elements.details.value = `Channel: ${link}\nStreams per week: `;
    enquiry.showModal();
    lead.elements.name.focus();
  });
}

// Hero demo. One clock (seconds) drives everything, and captions follow each clip's own currentTime,
// so words always land on the frame where they were said. Paused / reduced motion = the finished frame.
const root = document.documentElement;
const motionToggle = document.getElementById('motionToggle');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const stage = document.querySelector('.stage');
if (stage) {
  const $ = (s) => stage.querySelector(s);
  const skim = $('#skim'), head = $('#scanhead'), tc = $('#tc'), typed = $('.typed span'), progress = $('.progress');
  const tcFinal = tc.textContent;
  const SCAN = 1.9, PLAY = 8.3, CLIP = 10, END = 19.6;
  // [seconds into the scan, position on the timeline]; flat parts are the holds on a found moment (stream-skim.mp4 matches)
  const KEYS = [[0, 0], [1.1, 0.267], [1.8, 0.267], [3, 0.573], [3.7, 0.573], [5, 0.908], [5.7, 0.908], [6, 1]];
  const HITS = [[1.1, 1.8], [3, 3.7], [5, 5.7]];
  const FIRST = 3460, SPAN = 15097; // the skim covers 0:57:40 to 5:09:17 of the stream
  const at = (t) => {
    for (let i = 1; i < KEYS.length; i += 1) {
      const [a, x] = KEYS[i - 1], [b, y] = KEYS[i];
      if (t <= b) return x + ((y - x) * Math.max(0, t - a)) / (b - a);
    }
    return 1;
  };
  const clock = (s) => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s) % 60).padStart(2, '0')}`;

  // "0.73 Oh,|1.53 oh,;2.59 Nami.|3.19 *SEC." : ; splits captions, | splits words, * highlights
  const phones = [...stage.querySelectorAll('.ph')].map((el) => {
    const kc = el.querySelector('.kc');
    const cues = kc.dataset.cues.split(';').map((g) => g.split('|').map((x) => {
      const [, s, hi, text] = x.match(/^([\d.]+) (\*?)(.+)$/);
      return { s: Number(s), hi: Boolean(hi), text };
    }));
    return { video: el.querySelector('.clip'), kc, bar: el.querySelector('.bar-prog i'), cues, finalNodes: [...kc.childNodes], shown: -2, el, mark: $(`.m${el.className.match(/ph(\d)/)[1]}`), hit: Number(kc.dataset.hit) };
  });
  const caption = (p, t) => {
    let g = -1;
    p.cues.forEach((c, i) => { if (t >= c[0].s) g = i; });
    if (g !== p.shown) {
      p.shown = g;
      p.kc.replaceChildren();
      if (g >= 0) p.cues[g].forEach((w) => {
        const s = document.createElement('span');
        s.className = w.hi ? 'w hi' : 'w';
        s.textContent = w.text;
        p.kc.append(s, ' ');
      });
    }
    // a caption clears 2.6s after its last word, like a real one; the last one stays
    if (g >= 0) {
      const last = p.cues[g][p.cues[g].length - 1].s;
      [...p.kc.children].forEach((s, i) => s.classList.toggle('on', t >= p.cues[g][i].s && (g === p.cues.length - 1 || t < last + 2.6)));
    }
  };

  const videos = [skim, ...phones.map((p) => p.video)];
  const play = (v) => v.play().catch(() => {});
  const STATES = ['st-aim', 'st-click', 'st-scan', 'st-hit', 'st-play', 'got1', 'got2', 'got3'];
  let t = 0, prev = 0, raf = 0, stall = 0, visible = !('IntersectionObserver' in window), skimOn = false, clipsOn = false;

  const draw = () => {
    const s = t - SCAN, scanning = s >= 0 && s < 6;
    const on = {
      'st-aim': t > 1.1 && t < 1.5, 'st-click': t >= 1.5 && t < 1.75, 'st-scan': scanning,
      'st-hit': HITS.some(([a, b]) => s >= a && s < b), 'st-play': t >= PLAY - 0.4,
      got1: s >= HITS[0][0] + 0.25, got2: s >= HITS[1][0] + 0.25, got3: s >= HITS[2][0] + 0.25,
    };
    STATES.forEach((k) => stage.classList.toggle(k, on[k]));
    typed.style.clipPath = `inset(0 ${100 - Math.min(1, t) * 100}% 0 0)`;
    const pos = at(s);
    head.style.transform = `translateX(${pos * 100}cqw)`;
    tc.textContent = clock(FIRST + pos * SPAN);
    progress.style.transform = `scaleX(${t / END})`;
    if (scanning && !skimOn) { skimOn = true; skim.currentTime = s; play(skim); }
    if (t >= PLAY && !clipsOn) { clipsOn = true; phones.forEach((p) => { p.video.currentTime = 0; play(p.video); }); }
    phones.forEach((p) => {
      const ct = clipsOn ? p.video.currentTime : 0;
      caption(p, ct);
      p.bar.style.transform = `scaleX(${Math.min(1, ct / CLIP)})`;
      // the reveal lights up its phone and the spot on the stream it came from
      const lit = clipsOn && ct >= p.hit && ct < p.hit + 1.6;
      p.el.classList.toggle('hit', lit);
      p.mark.classList.toggle('hit', lit);
    });
  };
  const rewind = () => {
    t = 0; skimOn = false; clipsOn = false;
    videos.forEach((v) => { v.pause(); v.currentTime = 0; });
  };
  const tick = (now) => {
    const dt = Math.min(0.1, (now - prev) / 1000);
    prev = now;
    // hold the clock while a video is still loading, so nothing runs ahead of the footage (6s at most)
    const waiting = (t >= SCAN && t < SCAN + 6 && skim.readyState < 2) || (t >= PLAY && t < PLAY + CLIP && phones.some((p) => p.video.readyState < 2));
    stall = waiting ? stall + dt : 0;
    if (!waiting || stall > 6) t += dt;
    if (t >= END) rewind();
    draw();
    raf = requestAnimationFrame(tick);
  };
  const finish = () => { // the finished frame: posters of the reveals with their key line
    stage.classList.remove('live', ...STATES);
    [typed, head, progress].forEach((e) => e.removeAttribute('style'));
    tc.textContent = tcFinal;
    videos.forEach((v) => v.load());
    phones.forEach((p) => { p.kc.replaceChildren(...p.finalNodes); p.bar.removeAttribute('style'); p.shown = -2; p.el.classList.remove('hit'); p.mark.classList.remove('hit'); });
  };
  const sync = () => {
    const off = reduce.matches || root.classList.contains('motion-off');
    const run = !off && visible && !document.hidden;
    if (run && !raf) {
      if (!stage.classList.contains('live')) {
        stage.classList.add('live');
        videos.forEach((v) => { v.preload = 'auto'; v.load(); });
        rewind();
      } else {
        if (skimOn && t < SCAN + 6 && !skim.ended) play(skim);
        if (clipsOn) phones.forEach((p) => { if (!p.video.ended) play(p.video); });
      }
      prev = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      videos.forEach((v) => v.pause());
    }
    if (off && stage.classList.contains('live')) finish();
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(stage);
  }
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
  motionToggle?.addEventListener('click', () => {
    const off = root.classList.toggle('motion-off');
    motionToggle.textContent = off ? 'Play animations' : 'Pause animations';
    sync();
  });
  sync();
}

// "Send on WhatsApp": opens WhatsApp with the form details already written, so no email is needed.
const waBtn = document.getElementById('sendWhatsApp');
waBtn?.addEventListener('click', () => {
  const f = document.getElementById('leadForm').elements;
  if (!f.name.reportValidity() || !f.details.reportValidity()) return;
  const lines = [
    "Hi Dana, I'd like to get started with Clipify.",
    '',
    `Name: ${f.name.value.trim()}`,
    `Plan / need: ${f.service.value.trim() || 'Clipify'}`,
    `Channel and schedule: ${f.details.value.trim()}`,
  ];
  if (f.email.value.trim()) lines.push(`Email: ${f.email.value.trim()}`);
  if (f.phone.value.trim()) lines.push(`My number: ${f.phone.value.trim()}`);
  window.open(`https://wa.me/27765606016?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
});

// "Send request" only posts name/email/service/details, so fold the number into the details.
// Capture phase: runs before main.js's submit handler reads the fields.
const leadForm = document.getElementById('leadForm');
leadForm?.addEventListener('submit', () => {
  const phone = leadForm.elements.phone.value.trim();
  const details = leadForm.elements.details;
  if (phone && !details.value.includes(phone)) details.value += `\nWhatsApp: ${phone}`;
}, true);
