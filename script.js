
// ------------ Config: personalize these -----------
const SITE = {
  name: 'Twan Mulder',
  email: 'twan.mulder9@icloud.com',
  github: 'trmulder',
  linkedin: 'trmulder',
  cv: 'CV - Twan Mulder.pdf',
};
// --------------------------------------------------

function setYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}

function personalize() {
  document.getElementById('brandName').textContent = SITE.name;
  document.getElementById('heroName').textContent = SITE.name;
  document.getElementById('footerName').textContent = SITE.name;
  document.getElementById('contactBtn').href = `mailto:${SITE.email}`;
  document.getElementById('contactBtnMobile').href = `mailto:${SITE.email}`;
  document.getElementById('emailMe').href = `mailto:${SITE.email}`;
  document.getElementById('mailLink').href = `mailto:${SITE.email}`;
  document.getElementById('ghLink').href = `https://github.com/${SITE.github}`;
  document.getElementById('liLink').href = `https://linkedin.com/in/${SITE.linkedin}`;
  document.getElementById('connectLI').href = `https://linkedin.com/in/${SITE.linkedin}`;
  document.getElementById('cvLink').href = SITE.cv;
}

function setupMenu() {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  const links = menu.querySelectorAll('a.mobile-link');
  btn.addEventListener('click', () => {
    const open = menu.style.display === 'block';
    menu.style.display = open ? 'none' : 'block';
    btn.innerHTML = open ? '<i data-lucide="menu"></i>' : '<i data-lucide="x"></i>';
    lucide.createIcons();
  });
  links.forEach(a => a.addEventListener('click', () => {
    menu.style.display = 'none';
    btn.innerHTML = '<i data-lucide="menu"></i>';
    lucide.createIcons();
  }));
}

function setupDarkMode() {
  const btn = document.getElementById('themeBtn');
  const btnM = document.getElementById('themeBtnMobile');
  const root = document.documentElement;
  const update = () => {
    const isDark = root.classList.toggle('dark');
    const icon = isDark ? 'sun' : 'moon';
    btn.innerHTML = `<i data-lucide="${icon}"></i>`;
    btnM.innerHTML = `<i data-lucide="${icon}"></i>`;
    lucide.createIcons();
    localStorage.setItem('prefers-dark', isDark ? '1' : '0');
  };
  const saved = localStorage.getItem('prefers-dark');
  if (saved === '1') root.classList.add('dark');
  btn.addEventListener('click', update);
  btnM.addEventListener('click', update);
}

function setupScrollSpy() {
  const sections = Array.from(document.querySelectorAll('section[id]')).filter(section => section.id !== 'home');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const mobileLinks = document.querySelectorAll('.mobile-link[href^="#"]');
  const linkMap = new Map();

  const registerLink = link => {
    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;
    if (!linkMap.has(targetId)) linkMap.set(targetId, []);
    linkMap.get(targetId).push(link);
  };

  navLinks.forEach(registerLink);
  mobileLinks.forEach(registerLink);

  const setActive = id => {
    linkMap.forEach((links, key) => {
      links.forEach(link => link.classList.toggle('active', key === id));
    });
  };

  const updateActiveLink = () => {
    const navOffset = (nav?.offsetHeight || 0) + 16;
    const scrollPosition = window.scrollY + navOffset;
    let activeId = null;

    for (const section of sections) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < bottom) {
        activeId = section.id;
        break;
      }
    }

    setActive(activeId);
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('load', updateActiveLink);
  updateActiveLink();
}

function downloadBibTeX(text, title) {
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (title || 'citation').toLowerCase().replace(/[^a-z0-9]+/g,'-') + '.bib';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to download BibTeX', e);
  }
}

// GitHub repos (sorted by stars, then updated)
async function loadRepos() {
  const user = SITE.github;
  const status = document.getElementById('repoStatus');
  const grid = document.getElementById('repos');
  if (!user) { status.textContent = 'Set your GitHub handle in script.js'; return; }
  status.textContent = 'Loading repositories…';
  try {
    const resp = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`);
    if (!resp.ok) throw new Error('GitHub API ' + resp.status);
    const data = await resp.json();
    const repos = data
      .filter(r => !r.fork)
      .sort((a,b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
      .slice(0, 12);
    grid.innerHTML = repos.map(r => `
      <a class="card" href="${r.html_url}" target="_blank" rel="noreferrer">
        <div class="card-head">
          <h3 class="h3">${r.name}</h3>
        </div>
        ${r.description ? `<p class="muted">${r.description}</p>` : ''}
        <div class="repo-meta small muted">
          <span>★ ${r.stargazers_count}</span>
          ${r.language ? `<span>${r.language}</span>` : ''}
          <span>${new Date(r.updated_at).toLocaleDateString()}</span>
        </div>
      </a>
    `).join('');
    status.textContent = repos.length ? '' : 'No repositories found.';
  } catch (e) {
    status.textContent = 'Failed to load GitHub repos: ' + e.message;
  }
}

function initIcons() { lucide.createIcons(); }

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  personalize();
  setupMenu();
  setupDarkMode();
  setupScrollSpy();
  initIcons();
  loadRepos();
});
