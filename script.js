const header = document.querySelector("[data-header]");
const main = document.querySelector("main");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");

const closeMenu = ({ restoreFocus = false } = {}) => {
  menu.classList.remove("is-open");
  header.classList.remove("is-menu-open");
  document.body.classList.remove("menu-open");
  main.inert = false;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Buka menu navigasi");

  if (restoreFocus) menuToggle.focus();
};

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    closeMenu();
    return;
  }

  menu.classList.add("is-open");
  header.classList.add("is-menu-open");
  document.body.classList.add("menu-open");
  main.inert = true;
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Tutup menu navigasi");
  menu.querySelector("a").focus();
});

menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("is-open")) {
    closeMenu({ restoreFocus: true });
  }
});

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
