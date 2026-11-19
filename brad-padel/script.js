window.BRAD_SITE_CONFIG = window.BRAD_SITE_CONFIG || {
  whatsappNumber: "27837047088"
};

const config = window.BRAD_SITE_CONFIG;
const whatsappNumber = String(config.whatsappNumber || "").replace(/\D/g, "");
const genericMessage = "Hi Brad, I'm interested in padel coaching at Lourensford. Could you help me choose a session?";

const playfulHeadings = [...document.querySelectorAll("h1, main h2:not(.sr-only)")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const playHeading = (heading) => {
  if (reduceMotion.matches) return;
  heading.classList.remove("is-playing");
  void heading.offsetWidth;
  heading.classList.add("is-playing");
  window.setTimeout(() => heading.classList.remove("is-playing"), 1250);
};

playfulHeadings.forEach((heading) => {
  const label = heading.textContent.trim();
  const words = label.split(/\s+/);
  heading.classList.add("play-heading");
  heading.setAttribute("aria-label", label);
  heading.textContent = "";

  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.className = "word";
    span.setAttribute("aria-hidden", "true");
    span.style.setProperty("--word-i", index);
    span.style.setProperty("--word-x", `${index % 2 === 0 ? -10 : 10}px`);
    span.style.setProperty("--word-return-x", `${index % 2 === 0 ? 2 : -2}px`);
    span.textContent = word;
    heading.append(span);
    if (index < words.length - 1) heading.append(document.createTextNode(" "));
  });

  heading.addEventListener("pointerdown", () => playHeading(heading));
});

const heroHeading = document.querySelector("h1.play-heading");
window.requestAnimationFrame(() => playHeading(heroHeading));

window.addEventListener("hashchange", () => {
  const target = document.querySelector(window.location.hash);
  const heading = target?.querySelector("h2.play-heading");
  if (heading) window.setTimeout(() => playHeading(heading), 180);
});

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
