/* ============================================================
   Portfolio Script — Animations, Scroll-spy, Interactions
   ============================================================ */

function initCustomCursor() {
  const dot = $("#cursorDot");
  const trails = document.querySelectorAll(".cursor-trail");
  if (!dot) return;

  let mouseX = 0;
  let mouseY = 0;
  
  // Store positions for each trail segment
  const positions = Array.from({ length: trails.length + 1 }, () => ({ x: 0, y: 0 }));

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function animate() {
    // Update first position to mouse
    positions[0].x += (mouseX - positions[0].x) * 0.2;
    positions[0].y += (mouseY - positions[0].y) * 0.2;
    
    // Update each trail segment to follow the one before it
    for (let i = 0; i < trails.length; i++) {
        const prev = positions[i];
        const current = positions[i + 1];
        
        current.x += (prev.x - current.x) * 0.35;
        current.y += (prev.y - current.y) * 0.35;
        
        trails[i].style.left = `${current.x}px`;
        trails[i].style.top = `${current.y}px`;
    }
    
    requestAnimationFrame(animate);
  }
  animate();

  // Handle hover states
  const interactives = document.querySelectorAll("a, button, .glass, .chip, .tab-btn");
  interactives.forEach(el => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });
}

/**
 * Intercept navigation clicks for a cool section transition animation.
 */
function initSectionTransitions() {
  const overlay = $("#transitionOverlay");
  const text = $("#transitionText");
  const navLinks = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
  if (!overlay || !text || !navLinks.length) return;

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId === "#") return;
      
      const targetSection = $(targetId);
      if (!targetSection) return;

      e.preventDefault();

      // Set the transition text to the link name
      const linkText = link.textContent.trim();
      text.textContent = linkText;

      // Trigger the transition sweep
      overlay.classList.remove("animate");
      void overlay.offsetWidth; // Force reflow
      overlay.classList.add("animate");

      // Scroll to section halfway through the animation
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }, 500);
    });
  });
}

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

/* ============ PRELOADER ============ */

function initPreloader() {
  const preloader = $("#preloader");
  const preloaderText = $("#preloaderText");
  const preloaderPercent = $("#preloaderPercent");
  if (!preloader || !preloaderText || !preloaderPercent) return;

  const greetings = [
    "Welcome",    // 0-20%
    "Namaste",    // 21-40%
    "Hello",      // 41-60%
    "Hola",       // 61-80%
    "Bonjour",    // 81-100%
  ];

  let count = 0;
  let greetingIndex = 0;
  
  // Start the loading bar animation visually
  setTimeout(() => {
    preloader.classList.add("preloader--active");
  }, 100);

  const counterInterval = setInterval(() => {
    count++;
    preloaderPercent.textContent = `${count}%`;
    
    // Update greeting based on percentage brackets
    const newIndex = Math.min(Math.floor(count / 20.01), greetings.length - 1);
    if (newIndex !== greetingIndex) {
        greetingIndex = newIndex;
        preloaderText.classList.remove("active");
        setTimeout(() => {
            preloaderText.textContent = greetings[greetingIndex];
            preloaderText.classList.add("active");
        }, 200);
    }

    if (count >= 100) {
      clearInterval(counterInterval);
      setTimeout(finishPreloader, 500);
    }
  }, 35); // Approx 3.5 seconds total

  // Initial show
  preloaderText.classList.add("active");

  function finishPreloader() {
    preloader.classList.add("preloader--hidden");
    setTimeout(() => {
      preloader.remove();
      // Trigger hero animations only after preloader is gone
      document.body.classList.add("loaded");
      animateHeroTitle();
      animateHeroSubtitle();
    }, 800);
  }
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


/* ============ SCROLL-REACTIVE BACKGROUND ============ */

function initDynamicBackground() {
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  if (!sections.length) return;

  const rootStyle = document.documentElement.style;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const paletteBySection = {
    home: ["rgba(139, 92, 246, 0.35)", "rgba(6, 214, 160, 0.25)", "rgba(244, 114, 182, 0.20)", "rgba(59, 130, 246, 0.20)"],
    about: ["rgba(99, 102, 241, 0.35)", "rgba(45, 212, 191, 0.25)", "rgba(168, 85, 247, 0.20)", "rgba(56, 189, 248, 0.20)"],
    skills: ["rgba(6, 214, 160, 0.35)", "rgba(20, 184, 166, 0.25)", "rgba(139, 92, 246, 0.20)", "rgba(59, 130, 246, 0.20)"],
    projects: ["rgba(244, 114, 182, 0.35)", "rgba(99, 102, 241, 0.25)", "rgba(6, 214, 160, 0.20)", "rgba(251, 146, 60, 0.20)"],
    certifications: ["rgba(59, 130, 246, 0.35)", "rgba(6, 214, 160, 0.25)", "rgba(217, 70, 239, 0.20)", "rgba(139, 92, 246, 0.20)"],
    internship: ["rgba(245, 158, 11, 0.35)", "rgba(6, 182, 212, 0.25)", "rgba(139, 92, 246, 0.20)", "rgba(244, 114, 182, 0.20)"],
    achievements: ["rgba(16, 185, 129, 0.35)", "rgba(96, 165, 250, 0.25)", "rgba(139, 92, 246, 0.20)", "rgba(244, 114, 182, 0.20)"],
    contact: ["rgba(139, 92, 246, 0.35)", "rgba(34, 197, 94, 0.25)", "rgba(59, 130, 246, 0.20)", "rgba(251, 146, 60, 0.20)"],
  };

  function applyPalette(id) {
    const colors = paletteBySection[id] || paletteBySection.home;
    rootStyle.setProperty("--bg-dyn-1", colors[0]);
    rootStyle.setProperty("--bg-dyn-2", colors[1]);
    rootStyle.setProperty("--bg-dyn-3", colors[2]);
    rootStyle.setProperty("--bg-dyn-4", colors[3]);
  }

  let currentSectionId = "home";
  applyPalette(currentSectionId);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.45) {
          const id = entry.target.getAttribute("id") || "home";
          if (id !== currentSectionId) {
            currentSectionId = id;
            applyPalette(currentSectionId);
          }
        }
      });
    },
    { threshold: [0.45, 0.6], rootMargin: "-15% 0px -35% 0px" }
  );

  sections.forEach((section) => observer.observe(section));

  if (prefersReduced) return;

  // Small scroll interpolation to keep color transitions fluid between sections.
  const maxScroll = () => Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  let rafId = 0;
  function onScroll() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      const progress = Math.min(window.scrollY / maxScroll(), 1);
      rootStyle.setProperty("--bg-dyn-4", `rgba(59, 130, 246, ${0.05 + progress * 0.08})`);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
}



/* ============ PROJECT TABS ============ */
function initProjectTabs() {
  const tabsNav = $(".tabs-nav");
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const indicator = $(".tab-indicator");

  if (!tabsNav || !tabBtns.length || !indicator) return;

  function updateIndicator(btn) {
    indicator.style.width = `${btn.offsetWidth}px`;
    indicator.style.left = `${btn.offsetLeft}px`;
  }

  // Initial indicator position
  const activeBtn = tabsNav.querySelector(".tab-btn.is-active");
  if (activeBtn) updateIndicator(activeBtn);

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");

      // Update buttons
      tabBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      // Update indicator
      updateIndicator(btn);

      // Update panels
      tabPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === targetTab);
      });
    });
  });

  // Handle resize for indicator
  window.addEventListener("resize", () => {
    const currentActive = tabsNav.querySelector(".tab-btn.is-active");
    if (currentActive) updateIndicator(currentActive);
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
  // Start preloader (Hero animations will be triggered after preloader finishes)
  initPreloader();
  
  // Custom Modern Cursor
  initCustomCursor();

  // Cool section transitions
  initSectionTransitions();

  // Text animations for sections (run first so elements are ready for reveal)
  initSectionTitleAnimations();

  // Core features
  initMobileNav();
  initScrollSpy();
  initScrollReveal();
  initContactForm();
  initProjectTabs();
  initToasts();
  initYear();
  initDynamicBackground();
});

