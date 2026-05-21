// contact.js — Contact form & newsletter

async function submitContact() {
  const name = document.getElementById("f-name")?.value.trim();
  const email = document.getElementById("f-email")?.value.trim();
  const subject = document.getElementById("f-subject")?.value.trim();
  const message = document.getElementById("f-message")?.value.trim();
  const msgEl = document.getElementById("form-msg");
  const btn = document.getElementById("form-submit-btn");

  msgEl.className = "form-msg";
  if (!name || !email || !message) {
    msgEl.textContent = "Please fill in name, email and message.";
    msgEl.className = "form-msg error";
    return;
  }
  btn.disabled = true;
  btn.textContent = "Sending…";
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });
    const data = await res.json();
    msgEl.textContent = data.message;
    msgEl.className = "form-msg " + (data.success ? "success" : "error");
    if (data.success)
      ["f-name", "f-email", "f-subject", "f-message"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
  } catch {
    msgEl.textContent = "Could not send message.";
    msgEl.className = "form-msg error";
  }
  btn.disabled = false;
  btn.textContent = "Send Message";
}

async function subscribeNewsletter() {
  const email = document.getElementById("nl-email")?.value.trim();
  const msg = document.getElementById("nl-msg");
  if (!email) {
    msg.textContent = "Please enter your email.";
    msg.style.color = "#e07070";
    return;
  }
  try {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    msg.textContent = data.message;
    msg.style.color = data.success ? "var(--gold)" : "#e07070";
    if (data.success) {
      const el = document.getElementById("nl-email");
      if (el) el.value = "";
    }
  } catch {
    msg.textContent = "Could not subscribe.";
    msg.style.color = "#e07070";
  }
}

window.submitContact = submitContact;
window.subscribeNewsletter = subscribeNewsletter;
