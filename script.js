/* ============================================================
   The Warcry Tribe — script.js
   ============================================================ */

/* ─── 1. Scroll-based active nav link (works on rules.html) ─── */
(function () {
  const links = Array.from(document.querySelectorAll('.sidebar a[href^="#"]'));
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const OFFSET = 150;

  const onScroll = () => {
    const scrollPos = window.scrollY + OFFSET;
    let currentIndex = 0;

    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= scrollPos) {
        currentIndex = i;
      } else {
        break;
      }
    }

    links.forEach(a => a.classList.remove('active'));
    links[currentIndex].classList.add('active');
  };

  let ticking = false;
  const scheduleUpdate = () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  onScroll();
})();

/* ─── 2. Page fade-out transitions ─── */
function initPageTransitions() {
  document.querySelectorAll('.fade-link').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href.startsWith('#') || this.target === '_blank') return;

      e.preventDefault();
      document.body.classList.add('fade-out');

      const navigate = () => {
        document.body.removeEventListener('animationend', navigate);
        window.location.href = href;
      };
      document.body.addEventListener('animationend', navigate);
    });
  });
}

/* ─── 3. Raid progress bars (with Raider.io API + fallback) ─── */
function initRaidBars() {
  const bars = document.querySelectorAll('.raid-progress');
  if (!bars.length) return;

  const TOTAL_BOSSES = {
    'manaforge-omega': 8,
    'liberation-of-undermine': 8,
    'nerubar-palace': 8
  };

  function renderBars(progressData) {
    bars.forEach(bar => {
      const fill = bar.querySelector('.progress-fill');
      const text = bar.querySelector('.progress-text');
      if (!fill || !text) return;

      const slug = bar.dataset.raidSlug;
      const difficulty = bar.dataset.difficulty;
      const fallbackProgress = parseInt(bar.dataset.progress, 10) || 0;
      const fallbackLabel = bar.dataset.label || '';

      let percent = fallbackProgress;
      let label = fallbackLabel;

      if (progressData && slug && difficulty && progressData[slug]) {
        const raidData = progressData[slug];
        const totalBosses = TOTAL_BOSSES[slug] || 8;

        if (difficulty === 'mythic' && typeof raidData.mythic_bosses_killed === 'number') {
          const killed = raidData.mythic_bosses_killed;
          percent = Math.round((killed / totalBosses) * 100);
          label = `${killed}/${totalBosses} M`;
        } else if (difficulty === 'heroic' && typeof raidData.heroic_bosses_killed === 'number') {
          const killed = raidData.heroic_bosses_killed;
          percent = Math.round((killed / totalBosses) * 100);
          label = `${killed}/${totalBosses} HC`;
        }
      }

      text.textContent = label;
      setTimeout(() => { fill.style.width = percent + '%'; }, 100);
    });
  }

  // Try Raider.io API first; fall back to HTML data attributes on error
  fetch(
    'https://raider.io/api/v1/guilds/profile?region=eu&realm=burning-legion&name=The%20Warcry%20Tribe&fields=raid_progression',
    { signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined }
  )
    .then(res => {
      if (!res.ok) throw new Error('Raider.io response not ok');
      return res.json();
    })
    .then(data => {
      const progression = data.raid_progression || {};
      renderBars(progression);
    })
    .catch(() => {
      // API failed — use fallback values from HTML data attributes
      renderBars(null);
    });
}

/* ─── 4. Recruitment grid (fetch + DOM API builder) ─── */
function initRecruitmentGrid() {
  const grid = document.getElementById('recruitmentGrid');
  if (!grid) return;

  // Show loading state
  const loading = document.createElement('p');
  loading.className = 'recruitment-loading';
  loading.textContent = 'Ładowanie...';
  grid.appendChild(loading);

  fetch('recruitment.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      grid.removeChild(loading);
      grid.removeAttribute('aria-busy');
      buildGrid(data, grid);
    })
    .catch(err => {
      console.error('Błąd ładowania recruitment.json:', err);
      loading.className = 'recruitment-error';
      loading.textContent = 'Nie udało się załadować danych rekrutacji. Odśwież stronę.';
      grid.removeAttribute('aria-busy');
    });
}

const ALLOWED_ROLES = new Set(['tank', 'healer', 'dps']);

function buildGrid(data, grid) {
  data.forEach(cls => {
    // Sanitize class name for CSS: only alphanumeric, dash, underscore
    const safeCls = cls.class.replace(/[^a-zA-Z0-9\-_]/g, '').toLowerCase();

    const classBlock = document.createElement('div');
    classBlock.className = `class-block ${safeCls}`;

    const classTitle = document.createElement('div');
    classTitle.className = 'class-title';
    classTitle.textContent = cls.class; // CSS handles text-transform: uppercase
    classBlock.appendChild(classTitle);

    const specGrid = document.createElement('div');
    specGrid.className = 'spec-grid';

    cls.specs.forEach(spec => {
      const state = spec.spots === 0 ? 'closed' : spec.priority;

      const card = document.createElement('div');
      card.className = `spec-card ${state}`;

      // Role icon (validated against allowlist)
      const roleIcon = document.createElement('div');
      const safeRole = ALLOWED_ROLES.has(spec.role) ? spec.role : 'dps';
      roleIcon.className = `role-icon ${safeRole}`;
      card.appendChild(roleIcon);

      // Spec icon image (validate path is relative)
      const img = document.createElement('img');
      const safeSrc = /^[^/\\]/.test(spec.icon) && !spec.icon.startsWith('data:')
        ? spec.icon
        : '';
      img.setAttribute('src', safeSrc);
      img.setAttribute('alt', spec.name);
      img.loading = 'lazy';
      card.appendChild(img);

      // Spec info
      const specInfo = document.createElement('div');
      specInfo.className = 'spec-info';

      const specName = document.createElement('span');
      specName.className = 'spec-name';
      specName.textContent = spec.name;
      specInfo.appendChild(specName);

      card.appendChild(specInfo);

      // Priority badge
      const badge = document.createElement('span');
      badge.className = 'priority';
      badge.textContent = state.toUpperCase();
      card.appendChild(badge);

      specGrid.appendChild(card);
    });

    classBlock.appendChild(specGrid);
    grid.appendChild(classBlock);
  });
}

/* ─── 5. IntersectionObserver scroll animations ─── */
function initScrollAnimations() {
  if (!window.IntersectionObserver) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.section-card').forEach(card => {
    observer.observe(card);
  });
}

/* ─── Bootstrap ─── */
document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initRaidBars();
  initRecruitmentGrid();
  initScrollAnimations();
});
