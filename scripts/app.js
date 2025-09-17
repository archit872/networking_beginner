/* =========================================================
   Book Builder App Script
   Files: /scripts/app.js
   Responsibilities:
   - Highlight current nav link (aria-current)
   - Toggle mobile nav
   - Progressive enhancement for <details> (quiz/answers)
   ========================================================= */

(function () {
  const bySel = (s, root = document) => root.querySelector(s);
  const bySelAll = (s, root = document) => Array.from(root.querySelectorAll(s));

  document.addEventListener('DOMContentLoaded', () => {
    highlightCurrentNav();
    setupNavToggle();
    enhanceDetails();
  });

  /* ---------------------------------------------------------
     Highlight the current nav item based on URL
     - Works with GitHub Pages and <base> usage
     - Uses endsWith checks for robustness
     --------------------------------------------------------- */
  function highlightCurrentNav() {
    const nav = bySel('.app-nav');
    if (!nav) return;

    const links = bySelAll('.app-nav .menu a', nav);
    if (!links.length) return;

    // Normalize path considering <base>
    const href = (l) => (l.getAttribute('href') || '').trim();
    const current = currentLogicalPath();

    links.forEach(a => {
      const h = href(a);
      const isMatch =
        (current === 'index.html' && h.endsWith('index.html')) ||
        (current.startsWith('chapters/ch') && h.endsWith('chapters/' + current.split('/').pop())) ||
        (current === 'chapters/appendix.html' && h.endsWith('chapters/appendix.html')) ||
        (current === 'chapters/glossary.html' && h.endsWith('chapters/glossary.html'));

      if (isMatch) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  // Derive a stable "logical path" independent of host and repo folder.
  function currentLogicalPath() {
    // Respect <base>; if we're inside /chapters/, we still want relative mapping.
    // Prefer document.location.pathname but fall back to document.baseURI parsing.
    const url = new URL(document.URL);
    // Try to detect if file name is present; default to index.html
    let seg = url.pathname.split('/').filter(Boolean);
    // If served from GitHub Pages repo subpath, last segment is the file.
    let file = seg.pop() || '';
    if (!file || file.endsWith('/')) file = 'index.html';
    if (!file.includes('.html')) file += '.html';

    // If path includes "chapters" earlier, reconstruct.
    const chaptersIdx = seg.lastIndexOf('chapters');
    if (chaptersIdx !== -1) {
      return 'chapters/' + file;
    }
    return file; // e.g., index.html
  }

  /* ---------------------------------------------------------
     Mobile nav toggle (no reflow of nav content)
     - Only sets a data attribute on .app-nav
     --------------------------------------------------------- */
  function setupNavToggle() {
    const nav = bySel('.app-nav');
    if (!nav) return;
    const toggle = bySel('.app-nav .nav-toggle', nav);
    const menu = bySel('.app-nav .menu', nav);
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });

    // Close menu when a link is clicked (mobile UX)
    bySelAll('a', menu).forEach(a => {
      a.addEventListener('click', () => {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------
     Enhance <details> used in practice/mastery sections
     - Adds ARIA labels
     - Allows "Expand all / Collapse all" if buttons present
     --------------------------------------------------------- */
  function enhanceDetails() {
    const groups = bySelAll('.practice, .mastery');
    groups.forEach(group => {
      const details = bySelAll('details', group);
      details.forEach((d, i) => {
        const sum = bySel('summary', d);
        if (sum) {
          sum.setAttribute('role', 'button');
          sum.setAttribute('aria-controls', `qa-${i}`);
        }
        d.setAttribute('id', `qa-${i}`);
      });

      // Optional group controls (if author adds buttons with data-action)
      const expandAllBtn = bySel('[data-action="expand-all"]', group);
      const collapseAllBtn = bySel('[data-action="collapse-all"]', group);
      if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => details.forEach(d => d.open = true));
      }
      if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => details.forEach(d => d.open = false));
      }
    });
  }

})();
