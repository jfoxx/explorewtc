/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-quicklinks. Base: cards.
 * Source: https://www.explorewtc.com/en/local.html
 * Instance selector: .quick-links .wtc-quick-links__link-wrapper
 *
 * Output (2 columns), one row per quick link: [icon image | linked label]
 * The "PLAN YOUR VISIT" h2 lives outside the matched wrapper and stays default content.
 *
 * Iteration is keyed on the block-level .wtc-quick-links__link wrappers (not the
 * anchors), so html2md's inline-sibling merge cannot collapse items.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll(':scope > .wtc-quick-links__link')];
  if (!items.length) items = [...element.querySelectorAll('.wtc-quick-links__link')];
  if (!items.length) {
    // Fallback: anchors carrying the icon
    items = [...element.querySelectorAll('a.wtc-quick-links__icon-wrapper')].map((a) => a.parentElement);
  }

  const cells = [];
  items.forEach((item) => {
    const link = item.querySelector('a[href]');
    const img = item.querySelector('img.wtc-quick-links__icon, img');
    const labelEl = item.querySelector('.wtc-quick-links__link-text');
    const label = (labelEl ? labelEl.textContent : (link ? link.textContent : '')).trim();
    if (!img && !label) return;

    let textCell = '';
    if (label) {
      const p = document.createElement('p');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      textCell = p;
    }
    // Rebuild the icon as a plain <img>. The live icons are .svg files, and html2md's
    // convertIcons rule turns any <img src="*.svg"> into an :icon: shortcode (which
    // would need /icons/*.svg in the code repo). A query suffix keeps it a real image.
    let imgCell = '';
    if (img) {
      const newImg = document.createElement('img');
      let src = img.src || img.getAttribute('src') || '';
      if (/\.svg$/i.test(src)) src += '?format=svg';
      newImg.src = src;
      newImg.alt = img.getAttribute('alt') || label;
      imgCell = newImg;
    }
    cells.push([imgCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-quicklinks', cells });
  element.replaceWith(block);
}
