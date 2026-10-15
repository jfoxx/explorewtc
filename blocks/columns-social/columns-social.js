import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Social promo split: [Instagram link | promo image].
 * A cell holding an Instagram profile/post link is decorated into a lazily
 * loaded Instagram embed (iframe injected when the cell nears the viewport).
 * The original link stays as a fallback until the embed loads.
 */

function getInstagramEmbedUrl(href) {
  try {
    const url = new URL(href, window.location.href);
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return null;
    const path = url.pathname.replace(/\/+$/, '');
    if (!path) return null;
    const clean = path.replace(/\/embed$/i, '');
    return `https://www.instagram.com${clean}/embed/`;
  } catch {
    return null;
  }
}

/**
 * Authors usually paste the bare profile URL (link text === href). Turn that
 * into a readable "@handle on Instagram" label; keep authored text otherwise.
 */
function fallbackLabel(link) {
  const text = link.textContent.trim();
  const isBareUrl = !text || text.replace(/\/+$/, '') === link.href.replace(/\/+$/, '');
  if (!isBareUrl) return text;
  try {
    const [handle, ...rest] = new URL(link.href).pathname.split('/').filter(Boolean);
    if (handle && !rest.length && !['p', 'reel', 'tv'].includes(handle)) return `@${handle} on Instagram`;
  } catch { /* fall through */ }
  return 'View on Instagram';
}

function buildEmbed(col, link, embedUrl) {
  const embed = document.createElement('div');
  embed.className = 'columns-social-embed';

  const fallback = document.createElement('p');
  fallback.className = 'columns-social-embed-fallback';
  const a = document.createElement('a');
  a.href = link.href;
  a.textContent = fallbackLabel(link);
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  fallback.append(a);
  embed.append(fallback);

  // remove the authored link (and its now-empty paragraph)
  const p = link.closest('p');
  if (p && p.textContent.trim() === link.textContent.trim()) p.remove();
  else link.remove();
  col.prepend(embed);

  const load = () => {
    if (embed.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = 'Instagram feed';
    iframe.loading = 'lazy';
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('allow', 'encrypted-media');
    iframe.setAttribute('scrolling', 'no');
    iframe.addEventListener('load', () => embed.classList.add('is-loaded'), { once: true });
    // Instagram reports its rendered content height via postMessage
    // ({ type: 'MEASURE', details: { height } }), as consumed by its embed.js.
    window.addEventListener('message', (e) => {
      if (e.origin !== 'https://www.instagram.com' || e.source !== iframe.contentWindow) return;
      let { data } = e;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { return; }
      }
      const height = Number(data?.details?.height);
      if (data?.type === 'MEASURE' && Number.isFinite(height) && height >= 0) {
        iframe.style.height = `${Math.ceil(height)}px`;
        embed.classList.toggle('has-content', height > 0);
      }
    });
    embed.append(iframe);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        load();
      }
    }, { rootMargin: '200px' });
    observer.observe(embed);
  } else {
    load();
  }
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-social-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-social-row');
    [...row.children].forEach((col) => {
      const igLink = [...col.querySelectorAll('a[href]')]
        .find((a) => getInstagramEmbedUrl(a.href));
      const pic = col.querySelector('picture');

      if (igLink) {
        col.classList.add('columns-social-embed-col');
        buildEmbed(col, igLink, getInstagramEmbedUrl(igLink.href));
      } else if (pic && !col.textContent.trim()) {
        col.classList.add('columns-social-img-col');
      } else if (!col.textContent.trim() && !col.children.length) {
        col.classList.add('columns-social-empty');
      } else {
        col.classList.add('columns-social-text-col');
      }

      col.querySelectorAll('picture').forEach((p) => {
        const img = p.querySelector('img');
        if (img) {
          p.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
        }
      });
    });
  });
}
