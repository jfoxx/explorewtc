import { createOptimizedPicture } from '../../scripts/aem.js';

function isSvg(src) {
  try {
    return new URL(src, window.location.href).pathname.toLowerCase().endsWith('.svg');
  } catch {
    return false;
  }
}

/**
 * Icon quick links: each row is [icon image | linked label].
 * Rows render as compact icon-over-label tiles; when a row carries a single
 * link the whole tile becomes that link.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length || (!row.textContent.trim() && !row.querySelector('picture, img'))) return;

    const li = document.createElement('li');
    const icon = document.createElement('div');
    icon.className = 'cards-quicklinks-icon';
    const body = document.createElement('div');
    body.className = 'cards-quicklinks-body';

    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !icon.querySelector('picture, img')) {
        const img = pic.querySelector('img');
        let iconEl = pic;
        if (img && isSvg(img.src)) {
          // SVG icons (e.g. `pin.svg?format=svg`) are vector: keep the original
          // src incl. its query and skip raster/webp renditions
          iconEl = img;
          img.loading = 'lazy';
        } else if (img) {
          iconEl = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]);
        }
        // drop a link that only wraps the icon; the tile link replaces it
        const wrapLink = pic.closest('a');
        icon.append(iconEl);
        if (wrapLink) wrapLink.remove();
        else if (iconEl !== pic) pic.remove();
      }
      if (cell.textContent.trim()) body.append(...cell.childNodes);
    });

    const links = [...body.querySelectorAll('a[href]')];
    if (links.length === 1) {
      const a = document.createElement('a');
      a.className = 'cards-quicklinks-link';
      // keep the authored (possibly relative) href rather than the resolved URL
      a.href = links[0].getAttribute('href');
      if (links[0].target) a.target = links[0].target;
      if (links[0].title) a.title = links[0].title;
      // unwrap the inner link so there are no nested anchors
      links[0].replaceWith(...links[0].childNodes);
      body.querySelectorAll('.button').forEach((b) => b.classList.remove('button', 'primary', 'secondary', 'accent'));
      body.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
      // the label already names the link; an alt repeating it is announced twice
      const iconImg = icon.querySelector('img');
      if (iconImg && iconImg.alt.trim() === body.textContent.trim()) iconImg.alt = '';
      if (icon.children.length) a.append(icon);
      a.append(body);
      li.append(a);
    } else {
      if (icon.children.length) li.append(icon);
      li.append(body);
    }
    ul.append(li);
  });

  block.replaceChildren(ul);
}
