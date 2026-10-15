import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Category landing panels: each row is [background image | heading + "Learn More" link].
 * Rows become full-width stacked panels that overlap the previous one; alternating
 * alignment and stacking order are driven by row index in CSS.
 * Photo panels (non-PNG) get a dark gradient overlay; PNG pattern panels keep their
 * transparent cut-outs, so later panels stack above earlier ones.
 * @param {Element} block
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  let index = 0;

  [...block.children].forEach((row) => {
    const pic = row.querySelector('picture');
    const img = pic && pic.querySelector('img');
    const hasText = row.textContent.trim().length > 0;
    if (!img && !hasText) return;

    const li = document.createElement('li');
    li.className = 'cards-landing-panel';
    li.style.setProperty('--cards-landing-index', index);

    const content = document.createElement('div');
    content.className = 'cards-landing-content';

    if (img) {
      const media = document.createElement('div');
      media.className = 'cards-landing-image';
      const src = img.getAttribute('src') || '';
      const isPattern = /\.png(\?|#|$)/i.test(src);
      li.classList.add(isPattern ? 'is-pattern' : 'is-photo');

      const eager = index === 0;
      const optimized = createOptimizedPicture(img.src, img.alt || '', eager, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]);
      const optImg = optimized.querySelector('img');
      if (eager) optImg.setAttribute('fetchpriority', 'high');
      if (img.width) optImg.width = img.width;
      if (img.height) optImg.height = img.height;
      media.append(optimized);
      li.append(media);
      (pic.closest('a') || pic).remove();
    } else {
      li.classList.add('no-image');
    }

    // gather all remaining cell content (authors may add or omit cells)
    [...row.children].forEach((cell) => {
      if (cell.textContent.trim()) content.append(...cell.childNodes);
    });

    // drop empty paragraphs left behind by the image cell
    content.querySelectorAll('p').forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector('img, picture')) p.remove();
    });

    const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add('cards-landing-title');

    // render CTA links as outlined buttons even when the author left them plain
    content.querySelectorAll('a[href]').forEach((a) => {
      if (heading && heading.contains(a)) return;
      if (a.querySelector('img, picture')) return;
      a.classList.add('button');
      a.title = a.title || a.textContent.trim();
      const p = a.closest('p');
      if (p && p.textContent.trim() === a.textContent.trim()) {
        p.classList.add('button-wrapper');
      }
    });

    if (content.childNodes.length) li.append(content);
    ol.append(li);
    index += 1;
  });

  block.replaceChildren(ol);
}
