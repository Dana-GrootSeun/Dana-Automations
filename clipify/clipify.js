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

// Pause/play for the looping animations (WCAG 2.2.2), and pause the hero loop while it's off-screen.
const motionToggle = document.getElementById('motionToggle');
motionToggle?.addEventListener('click', () => {
  const off = document.documentElement.classList.toggle('motion-off');
  motionToggle.textContent = off ? 'Play animations' : 'Pause animations';
});
const stage = document.querySelector('.stage');
if (stage && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => stage.classList.toggle('offscreen', !e.isIntersecting)).observe(stage);
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
