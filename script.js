/* ============================================================
   Portfolio Script — Animations, Scroll-spy, Interactions
   ============================================================ */

const CERTS_KEY = "ayush_portfolio_certs_v1";

function $(sel) {
  return document.querySelector(sel);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(msg, ms = 2500) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("show"), ms);
}

/* ============ MOBILE NAV ============ */

function initMobileNav() {
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  if (!toggle || !links) return;

  function setOpen(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest("#navLinks") || t.closest("#navToggle")) return;
    setOpen(false);
  });
}

/* ============ SCROLL SPY — Active nav link ============ */

function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll("#navLinks a");
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
  );
  sections.forEach((s) => obs.observe(s));
}

/* ============ TEXT ANIMATIONS ============ */

/**
 * Split the hero title into individual animated <span> letters.
 * Preserves child elements like <span class="text-grad">.
 */
function animateHeroTitle() {
  const el = document.querySelector('.hero__title[data-animate="letters"]');
  if (!el) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // Walk through child nodes
  const fragment = document.createDocumentFragment();
  let letterIndex = 0;

  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Split text into letters
      const text = node.textContent || "";
      for (const char of text) {
        const span = document.createElement("span");
        span.className = "letter";
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.animationDelay = `${0.3 + letterIndex * 0.045}s`;
        fragment.appendChild(span);
        letterIndex++;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Clone element and split its text into letters
      const wrapper = node.cloneNode(false);
      const innerText = node.textContent || "";
      for (const char of innerText) {
        const span = document.createElement("span");
        span.className = "letter";
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.animationDelay = `${0.3 + letterIndex * 0.045}s`;
        wrapper.appendChild(span);
        letterIndex++;
      }
      fragment.appendChild(wrapper);
    }
  });

  el.innerHTML = "";
  el.appendChild(fragment);
}

/**
 * Split the hero subtitle into word spans for staggered fade-in.
 */
function animateHeroSubtitle() {
  const el = document.querySelector('.hero__subtitle[data-animate="words"]');
  if (!el) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const text = el.textContent || "";
  const words = text.trim().split(/\s+/);

  el.innerHTML = words
    .map((word, i) => {
      const delay = 1.2 + i * 0.04; // start after title finishes
      return `<span class="word" style="animation-delay:${delay}s">${word}</span>`;
    })
    .join(" ");
}

/**
 * Animate section titles: letter-by-letter reveal on scroll.
 */
function initSectionTitleAnimations() {
  const titles = document.querySelectorAll('.section__title[data-animate="letters"]');
  if (!titles.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  titles.forEach((el) => {
    const text = el.textContent || "";
    el.innerHTML = "";

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.className = "letter";
      span.textContent = text[i] === " " ? "\u00A0" : text[i];
      span.style.transitionDelay = `${i * 0.035}s`;
      el.appendChild(span);
    }
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".letter").forEach((l) => l.classList.add("visible"));
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -80px 0px", threshold: 0.1 }
  );

  titles.forEach((t) => obs.observe(t));
}

/* ============ SCROLL REVEAL — Glass cards, timeline, tags ============ */

function initScrollReveal() {
  const items = document.querySelectorAll(
    ".glass, .timeline__item, .project, .chip, .contact-item"
  );
  if (!items.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  items.forEach((el) => el.classList.add("reveal-hidden"));

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const parent = entry.target.parentElement;
          const siblings = parent ? Array.from(parent.children) : [];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 70, 350);

          setTimeout(() => entry.target.classList.add("revealed"), delay);
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -50px 0px", threshold: 0.05 }
  );

  items.forEach((el) => obs.observe(el));
}

/* ============ CURSOR GLOW (desktop only) ============ */

function initCursorGlow() {
  if (window.matchMedia("(hover: none)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const glow = document.createElement("div");
  glow.setAttribute("aria-hidden", "true");
  Object.assign(glow.style, {
    position: "fixed",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)",
    pointerEvents: "none",
    zIndex: "0",
    transform: "translate(-50%, -50%)",
    transition: "left .12s ease, top .12s ease, opacity .3s ease",
    opacity: "0",
  });
  document.body.appendChild(glow);

  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
    glow.style.opacity = "1";
  });
  document.addEventListener("mouseleave", () => (glow.style.opacity = "0"));
}

/* ============ CERTIFICATIONS ============ */

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function loadSavedCerts() {
  try {
    const raw = localStorage.getItem(CERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) =>
        x &&
        typeof x.id === "string" &&
        typeof x.name === "string" &&
        typeof x.type === "string" &&
        typeof x.size === "number" &&
        typeof x.dataUrl === "string" &&
        typeof x.addedAt === "number"
    );
  } catch { return []; }
}

function saveCerts(certs) {
  localStorage.setItem(CERTS_KEY, JSON.stringify(certs));
}

function isImageType(type) {
  return type.startsWith("image/");
}

function renderCerts(certs) {
  const list = $("#certList");
  const count = $("#certCount");
  if (!list || !count) return;

  count.textContent = String(certs.length);
  if (certs.length === 0) {
    list.innerHTML =
      '<div class="muted small">No certificates saved yet. Upload and click "Save to Browser".</div>';
    return;
  }

  list.innerHTML = certs
    .slice()
    .sort((a, b) => b.addedAt - a.addedAt)
    .map((c) => {
      const thumb = isImageType(c.type)
        ? `<img alt="" src="${c.dataUrl}" />`
        : `<div class="muted" style="font-weight:900;">PDF</div>`;
      const safeName = escapeHtml(c.name);
      const safeType = escapeHtml(c.type);
      const added = new Date(c.addedAt).toLocaleDateString();
      return `
        <div class="cert" data-id="${c.id}">
          <div class="cert__thumb">${thumb}</div>
          <div class="cert__meta">
            <div class="cert__name" title="${safeName}">${safeName}</div>
            <div class="cert__sub">${safeType} • ${formatBytes(c.size)} • ${added}</div>
          </div>
          <div class="cert__actions">
            <button class="icon-btn" type="button" data-action="open" aria-label="Open certificate">↗</button>
            <button class="icon-btn" type="button" data-action="remove" aria-label="Remove certificate">✕</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function initCertifications() {
  const input = $("#certInput");
  const saveBtn = $("#saveCertsBtn");
  const clearBtn = $("#clearCertsBtn");
  if (!input || !saveBtn || !clearBtn) return;

  let saved = loadSavedCerts();
  renderCerts(saved);

  $("#certList")?.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const btn = t.closest("button");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const row = btn.closest(".cert");
    const id = row?.getAttribute("data-id");
    if (!id || !action) return;

    const cert = saved.find((c) => c.id === id);
    if (!cert) return;

    if (action === "open") {
      const win = window.open();
      if (!win) { toast("Popup blocked — allow popups to preview."); return; }
      win.document.title = cert.name;
      if (isImageType(cert.type)) {
        win.document.body.style.margin = "0";
        win.document.body.innerHTML = `<img src="${cert.dataUrl}" alt="" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`;
      } else {
        win.location.href = cert.dataUrl;
      }
    }

    if (action === "remove") {
      saved = saved.filter((c) => c.id !== id);
      saveCerts(saved);
      renderCerts(saved);
      toast("Removed certificate");
    }
  });

  saveBtn.addEventListener("click", async () => {
    const files = Array.from(input.files || []);
    if (files.length === 0) { toast("Choose certificate files first"); return; }

    const newItems = [];
    for (const f of files) {
      if (f.size > 6 * 1024 * 1024) { toast(`Skipped "${f.name}" (max 6MB)`); continue; }
      try {
        const dataUrl = await fileToDataUrl(f);
        newItems.push({
          id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`,
          name: f.name,
          type: f.type || "application/octet-stream",
          size: f.size,
          dataUrl,
          addedAt: Date.now(),
        });
      } catch { toast(`Failed to read "${f.name}"`); }
    }

    if (newItems.length === 0) return;
    saved = [...newItems, ...saved].slice(0, 24);
    saveCerts(saved);
    renderCerts(saved);
    input.value = "";
    toast("Certificates saved ✓");
  });

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(CERTS_KEY);
    saved = [];
    renderCerts(saved);
    toast("Cleared saved certificates");
  });
}

/* ============ CONTACT FORM ============ */

function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = /** @type {HTMLInputElement|null} */ ($("#name"))?.value?.trim() || "";
    const email = /** @type {HTMLInputElement|null} */ ($("#email"))?.value?.trim() || "";
    const message = /** @type {HTMLTextAreaElement|null} */ ($("#message"))?.value?.trim() || "";

    const subject = encodeURIComponent(`Portfolio Contact — ${name || "Visitor"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`);
    window.location.href = `mailto:ayushtripathi9821@gmail.com?subject=${subject}&body=${body}`;
    toast("Opening your email app…");
  });
}

/* ============ TOASTS & YEAR ============ */

function initToasts() {
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const el = t.closest("[data-toast]");
    if (!el) return;
    const msg = el.getAttribute("data-toast");
    if (msg) toast(msg);
  });
}

function initYear() {
  const y = $("#year");
  if (y) y.textContent = `© ${new Date().getFullYear()}`;
}

/* ============ INIT ============ */

document.addEventListener("DOMContentLoaded", () => {
  // Text animations (run first so elements are ready for reveal)
  animateHeroTitle();
  animateHeroSubtitle();
  initSectionTitleAnimations();

  // Core features
  initMobileNav();
  initScrollSpy();
  initScrollReveal();
  initCertifications();
  initContactForm();
  initToasts();
  initYear();
  initCursorGlow();
});
