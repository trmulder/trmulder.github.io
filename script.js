
// ------------ Config: personalize these -----------
const SITE = {
  name: 'Twan Mulder',
  email: 'twan.mulder9@icloud.com',
  github: 'trmulder',
  linkedin: 'trmulder',
  cv: 'CV - Twan Mulder.pdf',
};
const PROJECTS = {
  'project-one': {
    title: 'Project One',
    description: 'A concise overview of the project. Summarize the problem you tackled, your methodology, and the measurable impact for stakeholders.',
    pdf: SITE.cv,
  },
  'project-two': {
    title: 'Project Two',
    description: 'Detail the business or research challenge, highlight the core techniques you used, and mention any performance improvements or adoption metrics.',
    pdf: SITE.cv,
  },
  'open-source-library': {
    title: 'Open-source Library',
    description: 'Explain the motivation behind the library, the ecosystem it supports, and how other developers use it today.',
    pdf: SITE.cv,
  },
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

function setupProjectModals() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;
  const titleEl = document.getElementById('projectModalTitle');
  const descriptionEl = document.getElementById('projectModalDescription');
  const pdfEl = document.getElementById('projectModalPdf');
  const closeBtn = modal.querySelector('[data-close-modal]');
  const triggers = document.querySelectorAll('.project-view');
  let lastFocus = null;

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus) {
      lastFocus.focus({ preventScroll: true });
      lastFocus = null;
    }
  };

  const openModal = id => {
    const project = PROJECTS[id];
    if (!project) return;
    titleEl.textContent = project.title;
    descriptionEl.textContent = project.description;
    const hasPdf = Boolean(project.pdf);
    if (hasPdf) {
      pdfEl.href = project.pdf;
      pdfEl.removeAttribute('aria-disabled');
      pdfEl.classList.remove('is-hidden');
      pdfEl.setAttribute('aria-label', `Open ${project.title} PDF`);
    } else {
      pdfEl.removeAttribute('href');
      pdfEl.setAttribute('aria-disabled', 'true');
      pdfEl.classList.add('is-hidden');
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    lastFocus = document.activeElement;
    (hasPdf ? pdfEl : closeBtn)?.focus({ preventScroll: true });
  };

  triggers.forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.projectId));
  });

  closeBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  personalize();
  setupMenu();
  setupDarkMode();
  initIcons();
  setupProjectModals();
  loadRepos();
});
