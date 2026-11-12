import { leadAttribution, submissionKey } from "./lead-attribution.js";
document.querySelectorAll(".ad-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector(".ad-form-status");
    const original = button.textContent;
    const value = (name) => form.elements[name]?.value?.trim() || "";
    button.disabled = true;
    button.textContent = "Sending…";
    status.textContent = "";
    status.className = "ad-form-status";
    try {
      const projectType = value("project_type");
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"),
          email: value("email"),
          business_name: value("business_name"),
          phone: value("phone"),
          website_url: value("website_url"),
          location: value("location"),
          timing: value("timing"),
          message: value("message"),
          project_type: projectType,
          attribution: leadAttribution(form.id, [value("service")]),
          submission_key: submissionKey(form),
          services: [value("service")],
          website: value("website"),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error("Send failed");
      const service = value("service");
      status.textContent =
        "Thanks. Your request was sent to Anthony; he will follow up directly.";
      status.classList.add("success");
      form.reset();
      delete form.dataset.submissionKey;
      button.textContent = "Request sent";
      if (typeof gtag === "function") {
        gtag("event", "generate_lead", { form_id: service + "_ad_page" });
        gtag("event", "conversion", {
          send_to: "AW-18441272783/LF1DCJqMnbEdEM_7vdlE",
        });
      }
    } catch (error) {
      status.textContent =
        "We could not send your request. Please email colonnamedia@gmail.com or try again.";
      status.classList.add("error");
      button.textContent = original;
      button.disabled = false;
    }
  });
});
