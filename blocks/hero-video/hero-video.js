import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_PATTERN = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

function isVideoLink(a) {
  try {
    return VIDEO_PATTERN.test(new URL(a.href, window.location.href).pathname);
  } catch {
    return false;
  }
}

/**
 * Removes an element and any now-empty ancestors up to (but excluding) the stop element.
 */
function removeUpTo(el, stop) {
  let node = el;
  while (node && node !== stop) {
    const parent = node.parentElement;
    node.remove();
    if (!parent || parent === stop || parent.textContent.trim() || parent.querySelector('picture, img, video')) break;
    node = parent;
  }
}

function buildVideo(src, poster) {
  const video = document.createElement('video');
  video.className = 'hero-video-video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.preload = 'none';
  if (poster) video.poster = poster;

  const source = document.createElement('source');
  source.dataset.src = src;
  const ext = (src.split('?')[0].split('.').pop() || 'mp4').toLowerCase();
  source.type = `video/${ext === 'mov' ? 'quicktime' : ext}`;
  video.append(source);
  return video;
}

/**
 * Adds a pause/play control (WCAG 2.2.2: looping motion must be stoppable) and
 * pauses the video while the hero is scrolled out of view.
 */
function addVideoControls(block, video) {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'hero-video-toggle';
  let userPaused = false;
  const update = () => {
    toggle.classList.toggle('is-paused', userPaused);
    toggle.setAttribute('aria-label', userPaused ? 'Play background video' : 'Pause background video');
  };
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    if (userPaused) video.pause();
    else video.play().catch(() => { /* autoplay blocked */ });
    update();
  });
  update();
  block.append(toggle);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (userPaused) return;
      if (entry.isIntersecting) video.play().catch(() => { /* autoplay blocked */ });
      else video.pause();
    }).observe(block);
  }
}

function startVideo(video, mediaWrap) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  // the video is only shown on wider viewports (poster image on mobile)
  const desktop = window.matchMedia('(width >= 768px)');
  const load = () => {
    if (!desktop.matches) {
      desktop.addEventListener('change', load, { once: true });
      return;
    }
    const source = video.querySelector('source');
    if (!source || !source.dataset.src) return;
    source.src = source.dataset.src;
    delete source.dataset.src;
    video.load();
    video.addEventListener('canplay', () => {
      mediaWrap.classList.add('is-playing');
      addVideoControls(mediaWrap.closest('.hero-video'), video);
    }, { once: true });
    video.play().catch(() => { /* autoplay blocked: poster stays visible */ });
  };
  // defer the video so the poster image stays the LCP element
  if (document.readyState === 'complete') setTimeout(load, 0);
  else window.addEventListener('load', () => setTimeout(load, 0), { once: true });
}

export default function decorate(block) {
  const videoLink = [...block.querySelectorAll('a[href]')].find(isVideoLink);
  const picture = block.querySelector('picture');
  const img = picture ? picture.querySelector('img') : null;

  const media = document.createElement('div');
  media.className = 'hero-video-media';

  if (picture) {
    const optimized = createOptimizedPicture(img.src, img.alt || '', true, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    const optimizedImg = optimized.querySelector('img');
    if (optimizedImg) optimizedImg.setAttribute('fetchpriority', 'high');
    removeUpTo(picture, block);
    media.append(optimized);
  }

  let video = null;
  if (videoLink) {
    const src = videoLink.href;
    removeUpTo(videoLink.closest('p') || videoLink, block);
    video = buildVideo(src, img ? img.src : '');
    media.append(video);
  }

  if (!picture && !videoLink) block.classList.add('no-media');

  const content = document.createElement('div');
  content.className = 'hero-video-content';
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.textContent.trim() || cell.querySelector('picture, img')) {
        content.append(...cell.childNodes);
      }
    });
  });

  // the hero CTA is always a button, even when authored as a plain link
  content.querySelectorAll('p > a[href]:only-child').forEach((a) => {
    const p = a.parentElement;
    if (p.textContent.trim() !== a.textContent.trim() || a.querySelector('img')) return;
    a.classList.add('button');
    p.classList.add('button-wrapper');
  });

  block.replaceChildren(media, content);
  if (video) startVideo(video, media);
}
