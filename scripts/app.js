/* ==========================================================================
   BOOK WEBSITE APP
   File: scripts/app.js
   ========================================================================== */
(function () {
  "use strict";

  // ----------------------------
  // Utilities
  // ----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function normalizePath(href) {
    try {
      const u = new URL(href, document.baseURI);
      let p = u.pathname;
      if (p.startsWith("/")) p = p.slice(1);
      p = p.replace(/\/{2,}/g, "/").replace(/(^\.\/)/, "");
      if (p.endsWith("/")) p += "index.html";
      return p;
    } catch {
      return href.replace(/^\.\//, "").replace(/^\//, "");
    }
  }
  function sameDoc(a, b) {
    const na = normalizePath(a), nb = normalizePath(b);
    const aRoot = na.endsWith("/index.html") ? na : na + (na.endsWith("/") ? "index.html" : "");
    const bRoot = nb.endsWith("/index.html") ? nb : nb + (nb.endsWith("/") ? "index.html" : "");
    return na === nb || aRoot === bRoot;
  }

  // ----------------------------
  // Active nav highlighting
  // ----------------------------
  function setActiveNav() {
    const nav = $(".app-nav");
    if (!nav) return;
    const links = $all("a[href]", nav);
    if (!links.length) return;

    const here = normalizePath(location.href);
    links.forEach(a => a.removeAttribute("aria-current"));
    let active = links.find(a => sameDoc(a.href, here));
    if (!active) active = links.find(a => /index\.html$/i.test(normalizePath(a.href)));
    if (active) active.setAttribute("aria-current", "page");
  }

  // ----------------------------
  // Mobile menu toggle
  // ----------------------------
  function setupMobileMenu() {
    const toggle = $(".js-nav-toggle");
    const menu = $(".app-nav .menu");
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    }
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
  }

  // ----------------------------
  // <details> helpers for Mastery
  // ----------------------------
  function setupDetailsControls() {
    const blocks = $all(".mastery");
    blocks.forEach(block => {
      const details = $all("details", block);
      if (details.length < 2) return;

      const ctrl = document.createElement("div");
      Object.assign(ctrl.style, {display:"flex",gap:"8px",margin:"8px 0 12px"});

      const mkBtn = (label, fn) => {
        const b = document.createElement("button");
        b.className = "btn"; b.type = "button"; b.textContent = label;
        b.addEventListener("click", fn); return b;
      };
      ctrl.append(
        mkBtn("Expand all answers", () => details.forEach(d => d.open = true)),
        mkBtn("Collapse all", () => details.forEach(d => d.open = false))
      );
      block.prepend(ctrl);
    });
  }

  // ----------------------------
  // Smooth in-page anchors
  // ----------------------------
  function setupSmoothAnchors() {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", `#${id}`);
      target.focus({ preventScroll: true });
    });
  }

  // ----------------------------
  // Keyboard focus ring helper
  // ----------------------------
  function setupFocusRings() {
    function onFirstTab(e) {
      if (e.key === "Tab") {
        document.documentElement.classList.add("user-is-tabbing");
        window.removeEventListener("keydown", onFirstTab);
      }
    }
    window.addEventListener("keydown", onFirstTab);
  }

  // ----------------------------
  // External link hardening
  // ----------------------------
  function hardenExternalLinks() {
    $all('a[target="_blank"]').forEach(a => {
      const rel = (a.getAttribute('rel') || '').trim();
      if (!/\bnoopener\b/i.test(rel)) {
        a.setAttribute('rel', (rel ? rel + ' ' : '') + 'noopener');
      }
    });
  }

  // ----------------------------
  // TOC active section highlighting
  // ----------------------------
  function setupTocActive() {
    const toc = $(".toc-list");
    if (!toc) return;
    const tocLinks = $all("a[href^='#'], a[href*='#']", toc);
    if (!tocLinks.length) return;

    // Map section id -> link
    const map = new Map();
    tocLinks.forEach(a => {
      const href = a.getAttribute("href");
      const id = href.includes("#") ? href.split("#").pop() : href.slice(1);
      if (id) map.set(id, a);
    });

    const sections = $all("main h2[id], main h3[id]");
    if (!sections.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = map.get(id);
        if (!link) return;
        if (entry.isIntersecting) {
          // Remove existing
          tocLinks.forEach(l => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: [0, 1] });

    sections.forEach(s => io.observe(s));
  }

  // ----------------------------
  // Init
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    setupMobileMenu();
    setupDetailsControls();
    setupSmoothAnchors();
    setupFocusRings();
    hardenExternalLinks();
    setupTocActive();
  });

  // Optional API
  window.BookBuilder = { refreshActiveNav: setActiveNav };
})();





