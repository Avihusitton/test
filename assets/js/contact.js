/* =============================================================
   contact.js — Form Submission with mailto: fallback
   גיל סיטון — מטפלת רגשית
   ============================================================= */

/**
 * Webhook endpoint (Make.com Custom Webhook URL).
 * If left as the placeholder, the form falls back to mailto: so
 * submissions still reach the inbox.
 *
 * Example after deploy:
 *   const WEBHOOK_URL = 'https://hook.make.com/YOUR_WEBHOOK_ID';
 */
const WEBHOOK_URL = "https://hook.eu1.make.com/xac8wtpa12wjh2c3glfktolfowdvrbbw";
const MAILTO_TO = 'therapy@gilsitton.com';

const SUBJECT_LABELS = {
  'children': 'טיפול דיאדי ורגשי לילדים',
  'adults': 'טיפול רגשי למבוגרים',
  'zoom': 'טיפול בזום',
  'other': 'אחר'
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    const payload = collect(form);
    if (!validate(form, payload)) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn?.textContent || 'לתיאום פגישה ראשונה';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'שולח...';
    }

    const webhookConfigured = WEBHOOK_URL && WEBHOOK_URL !== "YOUR_MAKE_WEBHOOK_URL_HERE";

    let mode = 'mailto';
    let webhookOk = false;

    if (webhookConfigured) {
      try {
        console.log("🚀 Sending payload to Make.com:", payload);
        
        // Send payload according to webhook-contract.md
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log("✅ Webhook fetch succeeded:", response);
          webhookOk = true;
          mode = 'webhook';
        } else {
          console.error("❌ Webhook fetch returned non-ok status:", response.status, response.statusText);
        }
      } catch (err) {
        console.error("❌ Fetch failed details:", err);
        console.warn('Webhook submit failed — falling back to mailto:', err);
      }
    }

    // mailto fallback if webhook not configured OR failed
    if (!webhookOk) {
      try {
        window.location.href = buildMailto(payload);
      } catch (err) {
        console.error('mailto failed:', err);
      }
    }

    showSuccess(form, mode);
    form.reset();

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});

/* ─── data ─── */

function collect(form) {
  const subjectKey = form.querySelector('#contact-subject')?.value || '';
  const now = new Date();
  
  // Format DD.MM.YYYY
  const dateStr = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}`;
  // Format HH:MM
  const timeStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });

  return {
    site_source: "gil_therapy",
    name: form.querySelector('#contact-name')?.value.trim() || '',
    phone: form.querySelector('#contact-phone')?.value.trim() || '',
    email: form.querySelector('#contact-email')?.value.trim() || '',
    reason: SUBJECT_LABELS[subjectKey] || 'לא צוין',
    message: form.querySelector('#contact-message')?.value.trim() || '',
    date: dateStr,
    time: timeStr
  };
}

function validate(form, p) {
  let ok = true;
  if (!p.name) {
    showError('#contact-name', 'נא למלא שם מלא');
    ok = false;
  }
  if (!p.phone) {
    showError('#contact-phone', 'נא למלא מספר טלפון');
    ok = false;
  } else if (!/^[\d\-+\s]{7,15}$/.test(p.phone)) {
    showError('#contact-phone', 'מספר הטלפון אינו תקין');
    ok = false;
  }
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
    showError('#contact-email', 'כתובת האימייל אינה תקינה');
    ok = false;
  }
  return ok;
}

/* ─── mailto fallback ─── */

function buildMailto(p) {
  const subjectLine = `פנייה מהאתר — ${p.name}`;
  const lines = [
    `שם: ${p.name}`,
    `טלפון: ${p.phone}`
  ];
  if (p.email) lines.push(`אימייל: ${p.email}`);
  if (p.reason) lines.push(`סיבת הפנייה: ${p.reason}`);
  if (p.message) {
    lines.push('');
    lines.push('הודעה:');
    lines.push(p.message);
  }
  lines.push('');
  lines.push(`נשלח מהאתר בתאריך ${p.date} בשעה ${p.time}`);
  const body = lines.join('\n');
  return `mailto:${MAILTO_TO}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
}

/* ─── UI helpers ─── */

function showError(selector, message) {
  const input = document.querySelector(selector);
  if (!input) return;
  const group = input.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  const errEl = group.querySelector('.form-error');
  if (errEl) errEl.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll('.form-group.has-error').forEach(g => {
    g.classList.remove('has-error');
    const errEl = g.querySelector('.form-error');
    if (errEl) errEl.textContent = '';
  });
}

function showSuccess(form, mode) {
  const container = form.closest('.contact-form')?.parentElement || form.parentElement;
  const successEl = container?.querySelector('.form-success') || document.querySelector('.form-success');
  if (!successEl) return;

  const textEl = successEl.querySelector('.form-success__text');
  const key = mode === 'mailto' ? 'msgMailto' : 'msgWebhook';
  if (textEl && successEl.dataset[key]) {
    textEl.textContent = successEl.dataset[key];
  }

  successEl.classList.add('is-visible');
  successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => successEl.classList.remove('is-visible'), 10000);
}
