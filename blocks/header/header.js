// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<Element|null>} container holding the nav sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  // resolve relative image paths against the fragment, not the current page
  container.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return container;
}

/**
 * Unwraps an element whose children should be promoted (e.g. a lone <p> around a link).
 * @param {Element} section the nav section
 * @returns {Element[]} the meaningful child nodes (links or images)
 */
function sectionItems(section) {
  return [...section.querySelectorAll(':scope > p, :scope > a, :scope > picture, :scope > img')]
    .map((el) => (el.tagName === 'P' && el.children.length === 1 ? el.firstElementChild : el))
    .filter((el) => el && (el.textContent.trim() || el.querySelector('img') || el.tagName === 'IMG'));
}

/**
 * Opens new-window behaviour for links pointing to another site.
 * @param {Element} root container to scan
 */
function decorateExternalLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.getAttribute('href'), window.location.href);
    if (url.origin !== window.location.origin && !url.hostname.endsWith('.aem.page') && !url.hostname.endsWith('.aem.live')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

/**
 * Builds a logo group (brand or partner logos) from a nav section.
 * @param {Element} section nav section
 * @param {string} className class for the group
 * @returns {Element} group element
 */
function buildLogoGroup(section, className) {
  const group = document.createElement('div');
  group.className = className;
  sectionItems(section).forEach((item) => {
    if (item.tagName === 'A' && !item.querySelector('img')) item.classList.add('nav-logo-text');
    else {
      item.classList.add('nav-logo-image');
      // text authored next to a logo image is an accessible label, not visible copy
      [...item.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
        .forEach((n) => {
          const label = document.createElement('span');
          label.className = 'nav-visually-hidden';
          label.textContent = n.textContent.trim();
          n.replaceWith(label);
        });
    }
    group.append(item);
  });
  return group;
}

/**
 * Sets the expanded state of a dropdown item.
 * @param {Element} item the li.nav-drop element
 * @param {boolean} expanded whether it should be open
 */
function setExpanded(item, expanded) {
  item.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  item.querySelectorAll(':scope > a, :scope > .nav-drop-trigger, :scope > .nav-drop-toggle')
    .forEach((el) => el.setAttribute('aria-expanded', expanded ? 'true' : 'false'));
}

/**
 * Collapses every dropdown in the menu, optionally except one.
 * @param {Element} menu the nav sections element
 * @param {Element} [except] dropdown to leave untouched
 */
function collapseAll(menu, except) {
  menu.querySelectorAll('.nav-drop').forEach((item) => {
    if (item !== except) setExpanded(item, false);
  });
}

/**
 * Builds the main menu with hover/focus dropdowns from the nav list section.
 * @param {Element} section nav section containing the list
 * @returns {Element} menu element
 */
function buildMenu(section) {
  const menu = document.createElement('div');
  menu.className = 'nav-sections';
  const list = section.querySelector(':scope > ul');
  if (!list) return menu;
  list.setAttribute('role', 'list');
  list.classList.add('nav-list');

  [...list.children].forEach((item, index) => {
    const subList = item.querySelector(':scope > ul');
    if (!subList) return;
    item.classList.add('nav-drop');
    subList.id = subList.id || `nav-drop-${index}`;
    subList.classList.add('nav-dropdown');
    const trigger = item.querySelector(':scope > a') || item.querySelector(':scope > p');
    if (trigger) {
      trigger.classList.add('nav-drop-trigger', 'nav-trigger');
      trigger.setAttribute('aria-controls', subList.id);
    }
    setExpanded(item, false);

    // mobile: the whole row (label + arrow) toggles its sub list, several can be open at once
    const toggleItem = () => setExpanded(item, item.getAttribute('aria-expanded') !== 'true');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-drop-toggle';
    toggle.setAttribute('aria-controls', subList.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', `${trigger ? trigger.textContent.trim() : 'Section'} submenu`);
    toggle.addEventListener('click', toggleItem);
    subList.before(toggle);
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        if (isDesktop.matches) return;
        e.preventDefault();
        toggleItem();
      });
    }

    // desktop: open on hover / keyboard focus, as on the source
    item.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      collapseAll(menu, item);
      setExpanded(item, true);
    });
    item.addEventListener('mouseleave', () => {
      if (isDesktop.matches) setExpanded(item, false);
    });
    item.addEventListener('focusin', () => {
      if (!isDesktop.matches) return;
      collapseAll(menu, item);
      setExpanded(item, true);
    });
    item.addEventListener('focusout', (e) => {
      if (isDesktop.matches && !item.contains(e.relatedTarget)) setExpanded(item, false);
    });
  });

  menu.append(list);
  return menu;
}

/**
 * Builds the search form from the tools section (a link for the results page + an icon).
 * @param {Element} section nav tools section
 * @returns {Element} tools element
 */
function buildTools(section) {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const link = section.querySelector('a[href]');
  const icon = section.querySelector('img');
  if (!link) {
    tools.append(...section.childNodes);
    return tools;
  }

  const label = link.textContent.trim() || 'Search';
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = link.getAttribute('href');
  form.method = 'get';

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'search';
  input.placeholder = label;
  input.setAttribute('aria-label', label);
  input.autocomplete = 'off';

  const page = document.createElement('input');
  page.type = 'hidden';
  page.name = 'currentPage';
  page.value = '1';

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'nav-search-submit';
  button.setAttribute('aria-label', label);
  if (icon) {
    icon.alt = '';
    button.append(icon);
  }

  form.append(input, page, button);
  tools.append(form);
  return tools;
}

/**
 * Opens or closes the mobile menu.
 * @param {Element} nav the nav element
 * @param {boolean} [force] explicit state
 */
function toggleMenu(nav, force) {
  const open = force !== undefined ? force : nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.children].filter((el) => el.tagName === 'DIV');
  const listSection = sections.find((s) => s.querySelector(':scope > ul'));
  const toolsSection = sections.filter((s) => s !== listSection).pop();
  const logoSections = sections.filter((s) => s !== listSection && s !== toolsSection);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  const brandBar = document.createElement('div');
  brandBar.className = 'nav-brand-bar';
  logoSections.forEach((s, i) => brandBar.append(buildLogoGroup(s, i === 0 ? 'nav-brand' : 'nav-partners')));

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav-menu-bar" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  brandBar.append(hamburger);

  const menuBar = document.createElement('div');
  menuBar.className = 'nav-menu-bar';
  menuBar.id = 'nav-menu-bar';
  const menu = listSection ? buildMenu(listSection) : null;
  if (menu) menuBar.append(menu);
  if (toolsSection) menuBar.append(buildTools(toolsSection));

  nav.append(brandBar, menuBar);
  decorateExternalLinks(nav);

  // close dropdowns / mobile menu on Escape
  nav.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-drop[aria-expanded="true"]');
    if (open) {
      setExpanded(open, false);
      open.querySelector('.nav-drop-trigger, .nav-drop-toggle')?.focus();
    } else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      nav.querySelector('.nav-hamburger button').focus();
    }
  });

  // reset state when crossing the desktop breakpoint
  toggleMenu(nav, false);
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    if (menu) collapseAll(menu);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
