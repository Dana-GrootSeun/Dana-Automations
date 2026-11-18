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
