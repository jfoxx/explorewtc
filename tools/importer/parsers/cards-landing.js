/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-landing. Base: cards.
 * Source: https://www.explorewtc.com/en/local/things-to-do.html
 * Instance selector: .wtc-page-landing
 * Generated: 2026-10-15
 *
 * Source structure (validated against source.html + live page):
 *   div.wtc-page-landing > ol.wtc-page-landing__list-container > li.wtc-page-landing__item (x6)
 *     div.wtc-page-landing__item-image   - image is a CSS background-image (inline style), no <img>
 *     div.wtc-page-landing__content
 *       h2.wtc-page-landing__title       - may hold <span class="text-break"> fragments
 *       div.wtc-button--internal-link > a.wtc-button  ("Learn More")
 *
 * Output (2 columns), one row per panel, in source order:
 *   [ <img src=absolute bg url alt=heading> | h2 heading + <p><a>Learn More</a></p> ]
 *
 * Iteration is keyed on the block-level li items (iterationSafe), never on anchors.
 */

const SITE_ORIGIN = 'https://www.explorewtc.com/';

// Decode CSS escapes such as "\2f content" -> "/content" (hex escape eats one trailing space).
function cssUnescape(str) {
  return str
    .replace(/\\([0-9a-fA-F]{1,6})[ \t\n\r\f]?/g, (m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\(.)/g, '$1');
}

function extractUrl(value) {
  if (!value || value === 'none') return '';
  const m = value.match(/url\(\s*(['"]?)(.*?)\1\s*\)/i);
  return m ? cssUnescape(m[2]).trim() : '';
}

function getBaseUrl(document) {
  const candidates = [
    document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
    document.baseURI,
  ];
  const found = candidates.find((c) => c && /^https?:\/\//i.test(c) && !/localhost|127\.0\.0\.1/i.test(c));
  return found || SITE_ORIGIN;
}

function getBackgroundUrl(el, document) {
  if (!el) return '';
  // 1. Raw inline style attribute (works in every DOM, decodes CSS escapes ourselves)
  let url = extractUrl((el.getAttribute('style') || '').match(/background(?:-image)?\s*:[^;]*/i)?.[0] || '');
  // 2. CSSOM inline style
  if (!url && el.style) url = extractUrl(el.style.backgroundImage || el.style.background || '');
  // 3. Computed style (stylesheet-driven backgrounds)
  if (!url) {
    try {
      const view = document.defaultView || (typeof window !== 'undefined' ? window : null);
      if (view && view.getComputedStyle) url = extractUrl(view.getComputedStyle(el).backgroundImage);
    } catch (e) { /* not available in this context */ }
  }
  // 4. Data attribute / nested img fallbacks
  if (!url) url = el.getAttribute('data-src') || el.getAttribute('data-background') || el.querySelector('img')?.getAttribute('src') || '';
  if (!url) return '';
  try {
    return new URL(url, getBaseUrl(document)).href;
  } catch (e) {
    return url;
  }
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope li.wtc-page-landing__item')];
  if (!items.length) items = [...element.querySelectorAll('.wtc-page-landing__item, :scope > ol > li, :scope > ul > li')];

  const cells = [];
  items.forEach((item) => {
    const imageEl = item.querySelector('.wtc-page-landing__item-image') || item.querySelector('[style*="background"]');
    const headingEl = item.querySelector('.wtc-page-landing__title') || item.querySelector('h1, h2, h3, h4');
    const linkEl = item.querySelector('.wtc-button--internal-link a[href]') || item.querySelector('a.wtc-button[href]') || item.querySelector('a[href]');

    // Heading may be split into <span class="text-break"> pieces with no whitespace between them.
    let title = '';
    if (headingEl) {
      const parts = [...headingEl.querySelectorAll(':scope > span')];
      title = (parts.length ? parts.map((s) => s.textContent).join(' ') : headingEl.textContent)
        .replace(/\s+/g, ' ').trim();
    }
    const src = getBackgroundUrl(imageEl, document);

    let imageCell = '';
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = title;
      imageCell = img;
    } else {
      const inlineImg = item.querySelector('img');
      if (inlineImg) imageCell = inlineImg;
    }

    const textCell = [];
    if (title) {
      const h2 = document.createElement('h2');
      h2.textContent = title;
      textCell.push(h2);
    }
    if (linkEl) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', linkEl.getAttribute('href'));
      a.textContent = linkEl.textContent.replace(/\s+/g, ' ').trim() || 'Learn More';
      p.append(a);
      textCell.push(p);
    }

    if (!imageCell && !textCell.length) return;
    cells.push([imageCell, textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-landing', cells });
  element.replaceWith(block);
}
