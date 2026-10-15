import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Newsletter split: [heading + text + CTA | image].
 * Cells whose only content is a picture become the media column; everything
 * else is treated as text. Works with either cell order and with extra rows.
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-newsletter-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-newsletter-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const isImageOnly = pic && !col.textContent.trim();
      if (isImageOnly) {
        col.classList.add('columns-newsletter-img-col');
        const img = pic.querySelector('img');
        if (img) {
          const optimized = createOptimizedPicture(img.src, img.alt || '', false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ]);
          const optimizedImg = optimized.querySelector('img');
          if (optimizedImg) optimizedImg.decoding = 'async';
          // drop a wrapping <p> added by decorateMain so the image fills the column
          const wrapper = pic.parentElement;
          (wrapper !== col && wrapper.tagName === 'P' ? wrapper : pic).replaceWith(optimized);
        }
      } else if (!col.textContent.trim() && !col.children.length) {
        col.classList.add('columns-newsletter-empty');
      } else {
        col.classList.add('columns-newsletter-text-col');
        // the sign-up CTA is always a button, even when authored as a plain link
        col.querySelectorAll('p > a[href]:only-child').forEach((a) => {
          const p = a.parentElement;
          if (p.textContent.trim() !== a.textContent.trim() || a.querySelector('img')) return;
          a.classList.add('button');
          p.classList.add('button-wrapper');
        });
      }
    });
    if (row.querySelector('.columns-newsletter-img-col')) row.classList.add('has-image');
  });
}
