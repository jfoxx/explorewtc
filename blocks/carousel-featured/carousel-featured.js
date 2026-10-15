import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Featured articles carousel: each row is a slide [image | eyebrow + linked title].
 * Multiple slides are visible per view (1 / 2 / 3 depending on viewport);
 * prev/next arrows step one slide and wrap, dots jump to a slide.
 */

let carouselId = 0;

function getSlides(block) {
  return [...block.querySelectorAll('.carousel-featured-slide')];
}

function slideStep(track) {
  const first = track.querySelector('.carousel-featured-slide');
  if (!first) return track.clientWidth;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  return first.getBoundingClientRect().width + gap;
}

function maxIndex(track, count) {
  const step = slideStep(track);
  const visible = Math.max(1, Math.round((track.clientWidth + 1) / step));
  return Math.max(0, count - visible);
}

function scrollToIndex(block, index) {
  const track = block.querySelector('.carousel-featured-slides');
  const slides = getSlides(block);
  if (!track || !slides.length) return;
  const last = maxIndex(track, slides.length);
  let target = index;
  if (target < 0) target = last;
  if (target > last) target = 0;
  track.scrollTo({ left: slides[target].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
}

function updateState(block) {
  const track = block.querySelector('.carousel-featured-slides');
  const slides = getSlides(block);
  if (!track || !slides.length) return;
  const step = slideStep(track);
  const active = Math.min(slides.length - 1, Math.round(track.scrollLeft / step));
  const visible = Math.max(1, Math.round((track.clientWidth + 1) / step));
  block.dataset.activeSlide = active;

  slides.forEach((slide, idx) => {
    const inView = idx >= active && idx < active + visible;
    slide.setAttribute('aria-hidden', String(!inView));
    slide.querySelectorAll('a, button').forEach((el) => {
      if (inView) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });

  block.querySelectorAll('.carousel-featured-indicator button').forEach((btn, idx) => {
    if (idx === active) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
}

function createSlide(row, idx, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-featured-slide';
  slide.id = `carousel-featured-${id}-slide-${idx}`;
  slide.dataset.slideIndex = idx;

  const media = document.createElement('div');
  media.className = 'carousel-featured-slide-image';
  const content = document.createElement('div');
  content.className = 'carousel-featured-slide-content';

  [...row.children].forEach((cell) => {
    const pic = cell.querySelector('picture');
    if (pic && !media.children.length) {
      const img = pic.querySelector('img');
      media.append(img
        ? createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }])
        : pic);
      (pic.closest('a') || pic).remove();
    }
    if (cell.textContent.trim()) content.append(...cell.childNodes);
  });

  // undo auto-buttonization inside slides
  content.querySelectorAll('.button').forEach((b) => b.classList.remove('button', 'primary', 'secondary', 'accent'));
  content.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));

  const link = content.querySelector('a[href]');
  const titleEl = link
    ? link.closest('h1, h2, h3, h4, h5, h6, p') || link
    : content.querySelector('h1, h2, h3, h4, h5, h6') || content.lastElementChild;
  if (titleEl) titleEl.classList.add('carousel-featured-slide-title');
  [...content.children].forEach((child) => {
    if (child !== titleEl && !child.contains(titleEl)) child.classList.add('carousel-featured-slide-eyebrow');
  });
  if (link) link.classList.add('carousel-featured-slide-link');

  // the title already names the slide; an alt repeating it is announced twice
  const slideImg = media.querySelector('img');
  if (slideImg && titleEl
    && slideImg.alt.trim().toLowerCase() === titleEl.textContent.trim().toLowerCase()) {
    slideImg.alt = '';
  }

  if (media.children.length) slide.append(media);
  else slide.classList.add('no-image');
  slide.append(content);
  return slide;
}

export default function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  block.id = block.id || `carousel-featured-${id}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = [...block.children]
    .filter((row) => row.textContent.trim() || row.querySelector('picture, img'));

  const container = document.createElement('div');
  container.className = 'carousel-featured-slides-container';
  const track = document.createElement('ul');
  track.className = 'carousel-featured-slides';
  track.id = `carousel-featured-${id}-slides`;
  track.setAttribute('tabindex', '0');
  track.setAttribute('aria-label', 'Slides');
  rows.forEach((row, idx) => track.append(createSlide(row, idx, id)));
  container.append(track);

  const multi = rows.length > 1;
  const parts = [container];

  if (multi) {
    const nav = document.createElement('div');
    nav.className = 'carousel-featured-navigation-buttons';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'slide-prev';
    prev.setAttribute('aria-label', 'Previous slide');
    prev.setAttribute('aria-controls', track.id);
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'slide-next';
    next.setAttribute('aria-label', 'Next slide');
    next.setAttribute('aria-controls', track.id);
    nav.append(prev, next);
    container.append(nav);

    const indicatorsNav = document.createElement('nav');
    indicatorsNav.setAttribute('aria-label', 'Carousel slide controls');
    const indicators = document.createElement('ol');
    indicators.className = 'carousel-featured-indicators';
    rows.forEach((_, idx) => {
      const li = document.createElement('li');
      li.className = 'carousel-featured-indicator';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Show slide ${idx + 1} of ${rows.length}`);
      btn.addEventListener('click', () => scrollToIndex(block, idx));
      li.append(btn);
      indicators.append(li);
    });
    indicatorsNav.append(indicators);
    parts.push(indicatorsNav);

    prev.addEventListener('click', () => scrollToIndex(block, parseInt(block.dataset.activeSlide || '0', 10) - 1));
    next.addEventListener('click', () => scrollToIndex(block, parseInt(block.dataset.activeSlide || '0', 10) + 1));
  } else {
    block.classList.add('carousel-featured-single');
  }

  block.replaceChildren(...parts);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateState(block);
      ticking = false;
    });
  };
  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToIndex(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToIndex(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
    }
  });
  requestAnimationFrame(() => updateState(block));
}
