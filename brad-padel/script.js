window.BRAD_SITE_CONFIG = window.BRAD_SITE_CONFIG || {
  whatsappNumber: "27837047088"
};

const config = window.BRAD_SITE_CONFIG;
const whatsappNumber = String(config.whatsappNumber || "").replace(/\D/g, "");
const genericMessage = "Hi Brad, I'm interested in padel coaching at Lourensford. Could you help me choose a session?";

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(genericMessage)}`;
  link.target = "_blank";
  link.rel = "noopener";
});

const bookingForm = document.querySelector("[data-booking-form]");
const formStatus = document.querySelector("[data-form-status]");

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedDays = [...bookingForm.querySelectorAll('input[name="days"]:checked')].map((input) => input.value);

  if (!selectedDays.length) {
    formStatus.textContent = "Please choose at least one preferred day.";
    bookingForm.querySelector("[data-day-fieldset]")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  if (!bookingForm.reportValidity()) return;
  const data = new FormData(bookingForm);
  const childAge = String(data.get("childAge") || "").trim();
  const request = [
    "Hi Brad, I'd like to enquire about a padel coaching session.",
    "",
    `Name: ${data.get("name")}`,
    `Preferred days: ${selectedDays.join(", ")}`,
    `Preferred time of day: ${data.get("timeOfDay")}`,
    `Session: ${data.get("session")}`,
    ...(childAge ? [`Child's age: ${childAge}`] : []),
    `Playing level: ${data.get("level")}`,
    `Focus: ${data.get("focus") || "Not supplied"}`,
    "Venue: Virgin Active Padel Club Lourensford",
    "",
    "Please let me know which session time could work."
  ].join("\n");

  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(request)}`, "_blank", "noopener");
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
