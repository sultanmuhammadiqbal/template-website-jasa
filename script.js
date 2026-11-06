const header = document.querySelector('[data-header]');
const main = document.querySelector('main');
const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const skipLink = document.querySelector('.skip-link');
const mobileQuery = window.matchMedia('(max-width: 760px)');

const focusable = () => [menuToggle, ...menu.querySelectorAll('a')];

function closeMenu({ restoreFocus = false } = {}) {
  const wasOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menu.classList.remove('is-open');
  header.classList.remove('is-menu-open');
  document.body.classList.remove('menu-open');
  main.inert = false;
  skipLink.inert = false;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
  menu.inert = mobileQuery.matches;
  if (restoreFocus && wasOpen) menuToggle.focus();
}

function openMenu() {
  menu.inert = false;
  menu.classList.add('is-open');
  header.classList.add('is-menu-open');
  document.body.classList.add('menu-open');
  main.inert = true;
  skipLink.inert = true;
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Tutup menu navigasi');
  menu.querySelector('a').focus();
}

menuToggle.addEventListener('click', () => {
  if (menuToggle.getAttribute('aria-expanded') === 'true') closeMenu({ restoreFocus: true });
  else openMenu();
});

menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeMenu({ restoreFocus: true });
  } else if (event.key === 'Tab') {
    const items = focusable();
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

const syncViewport = () => {
  if (!mobileQuery.matches) closeMenu({ restoreFocus: false });
  else if (menuToggle.getAttribute('aria-expanded') !== 'true') menu.inert = true;
};
mobileQuery.addEventListener('change', syncViewport);
syncViewport();

const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
