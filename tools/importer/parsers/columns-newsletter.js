/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-newsletter. Base: columns.
 * Source: https://www.explorewtc.com/en/local.html
 * Instance selector: .newsletter:not(.aem-GridColumn--default--hide)
 *
 * Output (2 columns, 1 row): [h2 title, paragraph copy, Subscribe link | image]
 * Source marks the copy up as an <h2>; it is converted to a paragraph.
 */
export default function parse(element, { document }) {
  const title = element.querySelector('.wtc-newsletter__title, .wtc-newsletter__title-container h2, h2');
  const copyEl = element.querySelector('.wtc-newsletter__copy, .wtc-newsletter__copy-container p');
  const ctas = [...element.querySelectorAll('.wtc-newsletter__button-container a[href]')];
  if (!ctas.length) {
    const fallback = element.querySelector('a.wtc-button[href]');
    if (fallback) ctas.push(fallback);
  }
  // Image: the live page renders it as a CSS background-image on
  // .wtc-newsletter__image-container; the scraped snapshot has an <img>.
  let img = element.querySelector('.wtc-newsletter__image-container img')
    || element.querySelector('img');
  if (!img) {
    const bgHost = element.querySelector('.wtc-newsletter__image-container, [style*="background-image"]');
    const style = bgHost ? (bgHost.getAttribute('style') || '') : '';
    const m = style.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (m) {
      img = document.createElement('img');
      img.src = m[1];
      img.alt = '';
    }
  }

  if (!title && !copyEl && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const textCell = [];
  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title.textContent.trim();
    textCell.push(h2);
  }
  if (copyEl && copyEl !== title && copyEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = copyEl.textContent.trim();
    textCell.push(p);
  }
  ctas.forEach((a) => {
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    p.append(link);
    textCell.push(p);
  });

  const cells = [[textCell, img || '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-newsletter', cells });
  element.replaceWith(block);
}
