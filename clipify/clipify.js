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
