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