/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-social. Base: columns.
 * Source: https://www.explorewtc.com/en/local.html
 * Instance selector: .wtc-body__content-wrapper > .aem-Grid > div.html:has(.instagram-media)
 *
 * Output (2 columns, 1 row): [Instagram profile link | promo image]
 *  - The matched element is the top-level div.html holding the Instagram embed
 *    (iframe.instagram-media, or the pre-render blockquote.instagram-media). The
 *    profile URL is derived from the embed (e.g. https://www.instagram.com/explorewtc/).
 *  - The promo image lives in the immediately following sibling
 *    div.image.wtc-image--top-margin; that sibling is consumed and removed.
 */
const DEFAULT_PROFILE = 'https://www.instagram.com/explorewtc/';

function profileUrlFrom(element) {
  const candidates = [];
  element.querySelectorAll('iframe[src*="instagram.com"], iframe.instagram-media').forEach((f) => candidates.push(f.getAttribute('src')));
  element.querySelectorAll('[data-instgrm-permalink]').forEach((b) => candidates.push(b.getAttribute('data-instgrm-permalink')));
  element.querySelectorAll('a[href*="instagram.com"]').forEach((a) => candidates.push(a.getAttribute('href')));

  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const url = new URL(raw, 'https://www.instagram.com');
      if (!/(^|\.)instagram\.com$/i.test(url.hostname)) continue;
      // /explorewtc/embed/ -> /explorewtc/ ; /p/{id}/embed -> /p/{id}/
      const path = url.pathname.replace(/\/embed\/?.*$/i, '/').replace(/\/?$/, '/');
      if (path === '/') continue;
      return `https://www.instagram.com${path}`;
    } catch (e) { /* ignore */ }
  }
  return null;
}

export default function parse(element, { document }) {
  const profileUrl = profileUrlFrom(element)
    || (element.querySelector('.instagram-media') ? DEFAULT_PROFILE : null);

  // Promo image from the immediately-following sibling image component.
  const sibling = element.nextElementSibling;
  const imageHost = sibling && (sibling.matches('div.image, .wtc-image--top-margin') || sibling.querySelector('img'))
    ? sibling
    : null;
  const img = imageHost ? imageHost.querySelector('img') : null;
  if (img && !img.getAttribute('alt')) {
    const holder = img.closest('[data-title]');
    const altText = img.getAttribute('title') || (holder && holder.getAttribute('data-title')) || '';
    if (altText) img.setAttribute('alt', altText);
  }

  if (!profileUrl && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  let linkCell = '';
  if (profileUrl) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = profileUrl;
    a.textContent = profileUrl;
    p.append(a);
    linkCell = p;
  }

  const cells = [[linkCell, img || '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-social', cells });

  if (imageHost && img) imageHost.remove();
  element.replaceWith(block);
}
