import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Event tiles: each row is [image | date paragraph + linked title].
 * The date and title overlay the bottom of a large photo; the title link is
 * stretched over the whole tile.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return;

    const li = document.createElement('li');
    const media = document.createElement('div');
    media.className = 'cards-event-card-image';
    const body = document.createElement('div');
    body.className = 'cards-event-card-body';

    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !media.children.length) {
        const img = pic.querySelector('img');
        media.append(img
          ? createOptimizedPicture(img.src, img.alt || '', false, [
            { media: '(min-width: 900px)', width: '1200' },
            { width: '750' },
          ])
          : pic);
        (pic.closest('a') || pic).remove();
      }
      if (cell.textContent.trim()) body.append(...cell.childNodes);
    });

    // undo auto-buttonization inside tiles
    body.querySelectorAll('.button').forEach((b) => b.classList.remove('button', 'primary', 'secondary', 'accent'));
    body.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));

    const link = body.querySelector('a[href]');
    const titleEl = link
      ? link.closest('h1, h2, h3, h4, h5, h6, p') || link
      : body.querySelector('h1, h2, h3, h4, h5, h6') || body.lastElementChild;
    if (titleEl) titleEl.classList.add('cards-event-card-title');
    [...body.children].forEach((child) => {
      if (child !== titleEl && !child.contains(titleEl)) child.classList.add('cards-event-card-date');
    });
    if (link) {
      link.classList.add('cards-event-card-link');
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

  block.classList.toggle('cards-event-single', ul.children.length === 1);
  block.replaceChildren(ul);
}
