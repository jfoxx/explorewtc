/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<Element|null>} container holding the footer sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
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
 * Turns text authored next to an image inside a link into a screen-reader-only label.
 * @param {Element} root container to scan
 */
function decorateImageLinks(root) {
  root.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    if (!img) return;
    const textNodes = [...a.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    // image-only links with an authored label (e.g. logos): keep the label for assistive tech
    if (img.alt && textNodes.length) {
      textNodes.forEach((n) => {
        const label = document.createElement('span');
        label.className = 'footer-visually-hidden';
        label.textContent = n.textContent.trim();
        n.replaceWith(label);
      });
    }
  });
}

/**
 * Opens links pointing to another site in a new tab.
 * @param {Element} root container to scan
 */
function decorateExternalLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.getAttribute('href'), window.location.href);
    const own = url.origin === window.location.origin
      || url.hostname.endsWith('.aem.page') || url.hostname.endsWith('.aem.live');
    if (!own) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

/**
 * Classifies a fragment section by the content it holds.
 * @param {Element} section top-level section
 * @returns {string} section role
 */
function sectionRole(section) {
  if (section.querySelector(':scope > h2, :scope > h3, :scope > h4')) return 'columns';
  const lists = [...section.querySelectorAll(':scope > ul')];
  const iconList = lists.find((ul) => [...ul.querySelectorAll('a')].every((a) => a.querySelector('img') && !a.textContent.trim()));
  if (iconList) return 'social';
  if (lists.length) return 'links';
  return 'brand';
}

/**
 * Brand section: logo link + copyright text.
 * @param {Element} section fragment section
 */
function decorateBrand(section) {
  section.querySelectorAll(':scope > p').forEach((p) => {
    if (p.querySelector('img')) p.classList.add('footer-logo');
    else p.classList.add('footer-copyright');
  });
}

/**
 * Links section: address, bordered link list and a horizontal row of legal links.
 * @param {Element} section fragment section
 */
function decorateLinks(section) {
  const address = section.querySelector(':scope > p');
  if (address) address.classList.add('footer-address');
  const lists = [...section.querySelectorAll(':scope > ul')];
  if (lists[0]) lists[0].classList.add('footer-link-list');
  lists.slice(1).forEach((ul) => ul.classList.add('footer-legal-links'));
  section.querySelectorAll('a img').forEach((img) => img.classList.add('footer-link-icon'));
}

/**
 * Loads the Google Translate widget into the given container (keeps the link as a fallback).
 * @param {Element} holder paragraph holding the translate link
 */
function decorateTranslate(holder) {
  const widget = document.createElement('div');
  widget.className = 'footer-translate';
  widget.id = 'google_translate_element';
  holder.replaceWith(widget);
  widget.append(holder);
  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) return;
    holder.remove();
    // eslint-disable-next-line no-new
    new window.google.translate.TranslateElement({ pageLanguage: document.documentElement.lang || 'en' }, widget.id);
  };
  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.head.append(script);
}

/**
 * Social section: "follow" label + icon links, call-to-action button, translate widget.
 * @param {Element} section fragment section
 */
function decorateSocial(section) {
  const label = section.querySelector(':scope > p:not(:has(a))');
  const icons = [...section.querySelectorAll(':scope > ul')]
    .find((ul) => [...ul.querySelectorAll('a')].every((a) => a.querySelector('img')));
  if (label || icons) {
    const follow = document.createElement('div');
    follow.className = 'footer-follow';
    if (label) {
      label.classList.add('footer-follow-label');
      follow.append(label);
    }
    if (icons) {
      icons.classList.add('footer-social-icons');
      follow.append(icons);
    }
    section.prepend(follow);
  }
  section.querySelectorAll(':scope > p > strong > a, :scope > p > em > a').forEach((a) => {
    const p = a.closest('p');
    a.classList.add('footer-cta');
    p.classList.add('footer-cta-wrapper');
    p.replaceChildren(a);
  });
  const translate = [...section.querySelectorAll(':scope > p')]
    .find((p) => p.querySelector('a[href*="translate.google."]'));
  if (translate) decorateTranslate(translate);
}

/**
 * Column section: content before the first heading is a lead column, then one column per heading.
 * @param {Element} section fragment section
 */
function decorateColumns(section) {
  const columns = [];
  let current = document.createElement('div');
  current.className = 'footer-column footer-column-lead';
  [...section.children].forEach((el) => {
    if (/^H[2-6]$/.test(el.tagName)) {
      columns.push(current);
      current = document.createElement('div');
      current.className = 'footer-column';
      el.classList.add('footer-column-title');
    }
    current.append(el);
  });
  columns.push(current);
  const lead = columns[0];
  lead.querySelectorAll(':scope > ul').forEach((ul) => ul.classList.add('footer-quick-links'));
  section.replaceChildren(...columns.filter((c) => c.children.length));
}

/**
 * Back-to-top control, fixed to the bottom-right corner as on the source.
 * @returns {Element} button
 */
function buildBackToTop() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'footer-back-to-top';
  button.setAttribute('aria-label', 'Back to Top');
  button.addEventListener('click', () => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  });
  // hidden near the top of the page, shown once the visitor has scrolled
  const update = () => button.classList.toggle('is-visible', window.scrollY > 200);
  window.addEventListener('scroll', update, { passive: true });
  update();
  return button;
}

const DECORATORS = {
  brand: decorateBrand,
  links: decorateLinks,
  social: decorateSocial,
  columns: decorateColumns,
};

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const footer = document.createElement('div');
  footer.className = 'footer-content';
  const main = document.createElement('div');
  main.className = 'footer-main';

  [...fragment.children].filter((el) => el.tagName === 'DIV').forEach((section) => {
    const role = sectionRole(section);
    section.classList.add('footer-section', `footer-${role}`);
    decorateImageLinks(section);
    DECORATORS[role](section);
    if (role === 'columns') footer.append(section);
    else main.append(section);
  });

  footer.prepend(main);
  decorateExternalLinks(footer);
  block.append(footer, buildBackToTop());
}
