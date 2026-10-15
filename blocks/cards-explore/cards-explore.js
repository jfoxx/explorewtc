import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Attraction tiles: each row is [image | linked title + description].
 * The image fills the tile, the title overlays its bottom edge and the
 * description is revealed on hover/focus. The first link in the body is
 * stretched over the whole tile.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return;

    const li = document.createElement('li');
    const media = document.createElement('div');
    media.className = 'cards-explore-card-image';
    const body = document.createElement('div');
    body.className = 'cards-explore-card-body';

    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !media.children.length) {
        const img = pic.querySelector('img');
        media.append(img
          ? createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }])
          : pic);
        (pic.closest('a') || pic).remove();
      }
      if (cell.textContent.trim()) body.append(...cell.childNodes);
    });

    // first heading/strong/first paragraph acts as the title; the rest is the description
    const titleEl = body.querySelector('h1, h2, h3, h4, h5, h6')
      || body.firstElementChild;
    if (titleEl) titleEl.classList.add('cards-explore-card-title');
    [...body.children].forEach((child) => {
      if (child !== titleEl) child.classList.add('cards-explore-card-desc');
    });

    // undo auto-buttonization inside tiles
    body.querySelectorAll('.button').forEach((b) => b.classList.remove('button', 'primary', 'secondary', 'accent'));
    body.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));

    const link = (titleEl && titleEl.querySelector('a[href]')) || body.querySelector('a[href]');
    if (link) {
      link.classList.add('cards-explore-card-link');
      li.classList.add('is-linked');
    }

    // the title already names the tile; an alt repeating it is announced twice
    const tileImg = media.querySelector('img');
    if (tileImg && titleEl
      && tileImg.alt.trim().toLowerCase() === titleEl.textContent.trim().toLowerCase()) {
      tileImg.alt = '';
    }

    if (media.children.length) li.append(media);
    else li.classList.add('no-image');
    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
