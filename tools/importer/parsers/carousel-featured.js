/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-featured. Base: carousel.
 * Source: https://www.explorewtc.com/en/local.html
 * Instance selector: .carousel-dynamic
 *
 * Output (2 columns), one row per real slide (5 on the source page):
 *   [image | eyebrow paragraph ("Blog Article") + h3 linked title]
 *
 * Slick clones (.slick-cloned) are skipped; slides are additionally de-duplicated by
 * link + title in case clones arrive without the clone class. Iteration is keyed on
 * the block-level .cmp-carousel__item wrappers, not the inner anchors. Navigation
 * buttons / dots are ignored.
 */
export default function parse(element, { document }) {
  let slides = [...element.querySelectorAll('.cmp-carousel__item:not(.slick-cloned)')];
  if (!slides.length) slides = [...element.querySelectorAll('.wtc-card-hover, .card-hover')]
    .filter((el) => !el.parentElement.closest('.wtc-card-hover, .card-hover'));

  const seen = new Set();
  const cells = [];
  slides.forEach((slide) => {
    const link = slide.querySelector('a.wtc-card-hover__link[href]') || slide.querySelector('a[href]');
    const img = slide.querySelector('.wtc-card-hover__image img') || slide.querySelector('img');
    const eyebrowEl = slide.querySelector('.wtc-card-hover__bottom-subtitle');
    const titleEl = slide.querySelector('.wtc-card-hover__bottom-title');
    const eyebrow = eyebrowEl ? eyebrowEl.textContent.replace(/\s+/g, ' ').trim() : '';
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!img && !title) return;
    // Some slide images carry their description only in title / data-title.
    if (img && !img.getAttribute('alt')) {
      const holder = img.closest('[data-title]');
      const altText = img.getAttribute('title') || (holder && holder.getAttribute('data-title')) || '';
      if (altText) img.setAttribute('alt', altText);
    }

    const key = `${link ? link.getAttribute('href') : ''}|${title}`;
    if (seen.has(key)) return;
    seen.add(key);

    const textCell = [];
    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow;
      textCell.push(p);
    }
    if (title) {
      const h3 = document.createElement('h3');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      textCell.push(h3);
    }
    cells.push([img || '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-featured', cells });
  element.replaceWith(block);
}
