/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video. Base: hero.
 * Source: https://www.explorewtc.com/en/local.html
 * Instance selector: .landing-hero
 *
 * Output (1 column):
 *   Row 1: background video link (absolute mp4 URL) + poster image
 *   Row 2: h1 title + optional copy + "Learn More" CTA link
 */
const DEFAULT_ORIGIN = 'https://www.explorewtc.com';

function resolveOrigin(document, params) {
  const candidates = [params && params.originalURL, document && document.baseURI];
  for (const c of candidates) {
    try {
      const u = new URL(c);
      if (/^https?:$/.test(u.protocol) && !/localhost|127\.0\.0\.1/.test(u.hostname)) return u.origin;
    } catch (e) { /* ignore */ }
  }
  return DEFAULT_ORIGIN;
}

export default function parse(element, { document, params }) {
  // Video source: <video><source src="/content/dam/...mp4"></video>
  const source = element.querySelector('video source[src], video[src]');
  const rawSrc = source ? source.getAttribute('src') : null;

  // Poster image: mobile fallback image shown instead of the video
  const poster = element.querySelector(
    'img.landing-hero__video-player-mobile-image, .landing-hero__video-player img, img',
  );

  const heading = element.querySelector('h1, .landing-hero__title, h2');
  const copy = element.querySelector('.landing-hero__copy');
  const ctas = [...element.querySelectorAll('.landing-hero__link a[href], a.wtc-button')]
    .filter((a, i, arr) => arr.indexOf(a) === i);

  if (!heading && !rawSrc && !poster) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: background media (video link + poster)
  const mediaCell = [];
  if (rawSrc) {
    let href = rawSrc;
    try {
      href = new URL(rawSrc, resolveOrigin(document, params)).href;
    } catch (e) { /* keep raw */ }
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = href;
    p.append(a);
    mediaCell.push(p);
  }
  if (poster) mediaCell.push(poster);
  if (mediaCell.length) cells.push([mediaCell]);

  // Row 2: content
  const contentCell = [];
  if (heading) {
    if (heading.tagName !== 'H1') {
      const h1 = document.createElement('h1');
      h1.textContent = heading.textContent.trim();
      contentCell.push(h1);
    } else {
      contentCell.push(heading);
    }
  }
  if (copy && copy.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = copy.textContent.trim();
    contentCell.push(p);
  }
  ctas.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    contentCell.push(p);
  });
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
