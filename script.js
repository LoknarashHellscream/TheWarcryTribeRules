(function () {
  const links = Array.from(document.querySelectorAll('.sidebar a[href^="#"]'));
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

  if (!links.length || !sections.length) return;

  const onScroll = () => {
    const scrollPos = window.scrollY + 250;
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

  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', onScroll);
  onScroll();
})();

window.addEventListener('DOMContentLoaded', () => {
  const raidBars = document.querySelectorAll('.raid-progress');
  raidBars.forEach(bar => {
    const progress = bar.dataset.progress;
    const fill = bar.querySelector('.progress-fill');
    const text = bar.querySelector('.progress-text');
    setTimeout(() => {
      fill.style.width = progress + '%';
    }, 100);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("recruitment.json")
    .then(res => res.json())
    .then(data => buildGrid(data))
    .catch(err => console.error("Błąd ładowania recruitment.json:", err));
});

function buildGrid(data) {
  const grid = document.getElementById("recruitmentGrid");

  data.forEach(cls => {
    const safeCls = cls.class.replace(/\s+/g, "");

    const classBlock = document.createElement("div");
    classBlock.className = `class-block ${safeCls}`;
    classBlock.innerHTML = `
      <div class="class-title">${cls.class.toUpperCase()}</div>
      <div class="spec-grid"></div>
    `;

    const specGrid = classBlock.querySelector(".spec-grid");

    cls.specs.forEach(spec => {
      const state = spec.spots === 0 ? "closed" : spec.priority;
      const card = document.createElement("div");
      card.className = `spec-card ${state}`;
      card.innerHTML = `
        <div class="role-icon ${spec.role}"></div>
        <img src="${spec.icon}" alt="${spec.name}">
        <div class="spec-info">
          <span class="spec-name">${spec.name}</span>
        </div>
        <span class="priority">${state.toUpperCase()}</span>
      `;
      specGrid.appendChild(card);
    });

    grid.appendChild(classBlock);
  });

}
