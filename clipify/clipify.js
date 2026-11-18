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

// A typical night: one stage open at a time.
const stages = document.querySelector('[data-stages]');
if (stages) {
  stages.querySelectorAll('.st-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      stages.querySelectorAll('.st').forEach((st) => {
        const open = st === btn.closest('.st');
        st.classList.toggle('is-open', open);
        st.querySelector('.st-btn').setAttribute('aria-expanded', String(open));
      });
      const body = document.getElementById(btn.getAttribute('aria-controls'));
      if (body) body.setAttribute('tabindex', '-1'), body.focus({ preventScroll: true });
    });
  });
}

// Framed for your setup: the active stream type swaps the preview frame.
const kinds = document.querySelectorAll('.kind');
const frames = document.querySelectorAll('.kf');
const setKind = (kind) => {
  kinds.forEach((k) => {
    const on = k.dataset.kind === kind;
    k.classList.toggle('is-on', on);
    k.querySelector('button').setAttribute('aria-expanded', String(on));
  });
  frames.forEach((f) => f.classList.toggle('is-on', f.dataset.kind === kind));
};
kinds.forEach((k) => {
  const btn = k.querySelector('button');
  btn.addEventListener('click', () => setKind(k.dataset.kind));
  btn.addEventListener('focus', () => setKind(k.dataset.kind));
  btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setKind(k.dataset.kind); });
});
if (kinds.length && 'IntersectionObserver' in window) {
  // The row crossing the middle of the screen becomes active as you scroll (phones especially).
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setKind(e.target.dataset.kind); });
  }, { rootMargin: '-48% 0px -48% 0px' });
  kinds.forEach((k) => io.observe(k));
}
