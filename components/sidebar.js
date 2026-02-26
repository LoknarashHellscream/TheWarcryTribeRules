/* ============================================================
   sidebar.js — Shared sidebar component
   Injects the correct sidebar based on the current page.
   Usage: <div id="sidebar-mount"></div> in HTML body,
          <script src="components/sidebar.js" defer></script> in <head>
   ============================================================ */

(function () {
  const mount = document.getElementById('sidebar-mount');
  if (!mount) return;

  const path = window.location.pathname;
  const isRules = path.includes('rules.html');

  const logoHTML = `
    <div class="sidebar-top">
      <img src="images/guild-logo.png" alt="Logo gildii" class="sidebar-logo">
    </div>`;

  const indexNav = `
    <ul class="sidebar-nav">
      <li><a href="index.html" class="nav-link ${!isRules ? 'active' : 'fade-link'}">Strona główna</a></li>
      <li><a href="rules.html" class="nav-link fade-link">Regulamin</a></li>
    </ul>`;

  const rulesNav = `
    <ul class="sidebar-nav">
      <li><a href="index.html" class="nav-link fade-link">← Strona główna</a></li>
      <li><a href="#intro" class="nav-link">Wprowadzenie</a></li>
      <li><a href="#ranks" class="nav-link">Rangi</a></li>
      <li><a href="#general" class="nav-link">Ogólne</a></li>
      <li><a href="#raidgroup" class="nav-link">Grupa Raidowa</a></li>
      <li><a href="#boe" class="nav-link">Dystrybucja BoE</a></li>
      <li><a href="#channels" class="nav-link">Kanały Discord</a></li>
      <li><a href="#contact" class="nav-link">Kontakt</a></li>
    </ul>`;

  const nav = document.createElement('nav');
  nav.className = 'sidebar';
  nav.setAttribute('aria-label', 'Nawigacja główna');
  // Content is hardcoded in this file — no user data, safe to use innerHTML
  nav.innerHTML = logoHTML + (isRules ? rulesNav : indexNav);

  mount.replaceWith(nav);
})();
