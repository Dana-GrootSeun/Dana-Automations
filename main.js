// Marks JS as available so .reveal content is only hidden when it can be revealed again.
document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  reveals.forEach((el) => io.observe(el));
}

// Hero orb video: hold the still frame for people who prefer reduced motion.
const heroOrb = document.getElementById('heroOrb');
if (heroOrb && reducedMotion.matches) {
  heroOrb.removeAttribute('autoplay');
  heroOrb.pause();
}

// Hero: gentle pointer parallax (mouse only, off for reduced motion).
const heroVisual = document.getElementById('heroVisual');
if (heroVisual) {
  let frame;
  heroVisual.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = heroVisual.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - 0.5;
      const y = (event.clientY - r.top) / r.height - 0.5;
      heroVisual.style.setProperty('--pointer-x', `${x * 14}px`);
      heroVisual.style.setProperty('--pointer-y', `${y * 9}px`);
      heroVisual.style.setProperty('--tilt-x', `${y * -2.2}deg`);
      heroVisual.style.setProperty('--tilt-y', `${x * 2.8}deg`);
    });
  });
  heroVisual.addEventListener('pointerleave', () => {
    ['--pointer-x', '--pointer-y'].forEach((p) => heroVisual.style.setProperty(p, '0px'));
    ['--tilt-x', '--tilt-y'].forEach((p) => heroVisual.style.setProperty(p, '0deg'));
  });
}

// Automation cards: number each step so they light up one after another
document.querySelectorAll('.pipeflow').forEach((flow) => {
  flow.querySelectorAll('.node').forEach((node, i) => node.style.setProperty('--i', i));
});

// Marquee: duplicate items for a seamless loop; the copy is hidden from screen readers
const marquee = document.getElementById('marquee');
if (marquee) {
  const copy = document.createElement('div');
  copy.className = 'marquee-copy';
  copy.setAttribute('aria-hidden', 'true');
  copy.innerHTML = marquee.innerHTML;
  copy.style.display = 'contents';
  marquee.appendChild(copy);
}

// FAQ: one open at a time, state exposed via aria-expanded
document.querySelectorAll('.qa button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.qa button[aria-expanded="true"]').forEach((b) => {
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls')).hidden = true;
    });
    if (!open) {
      btn.setAttribute('aria-expanded', 'true');
      document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
    }
  });
});

// Enquiry dialog — native <dialog> handles focus trapping and Escape
const dialog = document.getElementById('enquiry');
const form = document.getElementById('leadForm');
const statusEl = document.getElementById('dialogStatus');
const serviceInput = form.elements.service;
let lastTrigger = null;

const setStatus = (msg, kind = '') => { statusEl.textContent = msg; statusEl.className = `dialog-status ${kind}`; };

document.querySelectorAll('[data-enquiry]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    lastTrigger = trigger;
    serviceInput.value = trigger.dataset.enquiry || '';
    setStatus('');
    dialog.showModal();
    form.elements.name.focus();
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }); // backdrop click
dialog.addEventListener('close', () => { if (lastTrigger) lastTrigger.focus(); });

const LEAD_ENDPOINT = 'https://kcgfunowuvfovknqkmuc.supabase.co/functions/v1/submit-lead';
const fields = () => ({
  name: form.elements.name.value.trim(),
  email: form.elements.email.value.trim(),
  service: serviceInput.value.trim() || 'Automation project',
  details: form.elements.details.value.trim(),
  company: form.elements.company.value.trim(), // honeypot
});

// Native validation (required / type=email / minlength) runs before this fires, so Enter submits too.
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  setStatus('Sending…');
  try {
    const res = await fetch(LEAD_ENDPOINT, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(fields()),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      setStatus("Got it — I'll reply within 24 hours. Thanks!", 'ok');
      form.reset();
    } else {
      setStatus(data.error || 'Something went wrong — try “Email me instead”.', 'err');
    }
  } catch {
    setStatus('Network issue — please use “Email me instead”.', 'err');
  } finally {
    btn.disabled = false;
  }
});

// "Email me instead": open the visitor's own mail provider, prefilled (plain mailto opens nothing without a mail app)
const chooser = document.getElementById('emailChooser');
const TO = 'dana.automates@gmail.com';
function composeUrls(f) {
  const subject = `Automation enquiry: ${f.service}`;
  const body = `Hi Dana,\n\nName: ${f.name || 'Not provided'}\nProject: ${f.service}\n\n${f.details || 'I would like to discuss a project.'}`;
  const t = encodeURIComponent(TO), s = encodeURIComponent(subject), b = encodeURIComponent(body);
  return {
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${t}&su=${s}&body=${b}`,
    outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${t}&subject=${s}&body=${b}`,
    yahoo: `https://compose.mail.yahoo.com/?to=${t}&subject=${s}&body=${b}`,
    default: `mailto:${TO}?subject=${s}&body=${b}`,
  };
}
document.getElementById('openEmail').addEventListener('click', (event) => {
  chooser.hidden = !chooser.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!chooser.hidden));
});
chooser.querySelectorAll('[data-provider]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const url = composeUrls(fields())[btn.dataset.provider];
    if (btn.dataset.provider === 'default') window.location.href = url;
    else window.open(url, '_blank', 'noopener');
  });
});
