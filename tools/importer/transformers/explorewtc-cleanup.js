/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: explorewtc site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (explorewtc.com/en/local.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Google Translate artifacts. On the live DOM the gadget sits in the footer
// (#google_translate_element) but Google also injects body-level nodes
// (#goog-gt-tt tooltip, div.VIpgJd-ZVi9od-aZ2wEe-wOHMyf spinner whose CSS
// background is gstatic translate_24dp.png) that live outside footer.wtc-footer.
const GOOGLE_TRANSLATE_SELECTORS = [
  '#google_translate_element',
  '.goog-te-gadget',
  '.skiptranslate',
  '.goog-te-banner-frame',
  '[class^="VIpgJd-"]',
  '[class*=" VIpgJd-"]',
  '#goog-gt-tt',
  'img[src*="gstatic.com"][src*="translate"]',
];

const EMPTY_BG_RE = /background-image\s*:\s*url\(\s*(?:''|""|)\s*\)\s*;?/gi;

function removeGoogleTranslate(element) {
  WebImporter.DOMUtils.remove(element, GOOGLE_TRANSLATE_SELECTORS);
}

// Source titles carry a site-name suffix ("The World Trade Center | World Trade Center").
// Drop the last " | ..." segment so the page Title is clean; createMetadata then sees
// Title === og:title and no longer emits a redundant og:title row.
function stripTitleSuffix(document) {
  const titleEl = document && document.querySelector('title');
  if (!titleEl) return;
  const title = titleEl.textContent.replace(/[\n\t]/g, '').trim();
  const stripped = title.replace(/\s+\|\s+[^|]+$/, '').trim();
  if (stripped && stripped !== title) titleEl.textContent = stripped;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    stripTitleSuffix((payload && payload.document) || element.ownerDocument);
    removeGoogleTranslate(element);

    // section.wtc-section carries inline `background-image: url();` (empty) on
    // the live DOM (sections 2, 4, 5, 6). WebImporter.rules.transformBackgroundImages
    // turns that into a stray <img src="">. Strip only the empty declaration;
    // the section element itself holds authorable content.
    element.querySelectorAll('[style*="background-image"]').forEach((el) => {
      const style = el.getAttribute('style') || '';
      if (EMPTY_BG_RE.test(style)) {
        EMPTY_BG_RE.lastIndex = 0;
        el.setAttribute('style', style.replace(EMPTY_BG_RE, ''));
        el.style.backgroundImage = 'none';
      }
      EMPTY_BG_RE.lastIndex = 0;
    });

    // Elements that would confuse block parsing - remove before parsers run.
    WebImporter.DOMUtils.remove(element, [
      // Hidden authored content: hidden 9/11 "Share Your Story" card (div.card-wide-2)
      // and hidden newsletter promo (div.newsletter.aem-GridColumn--default--hide)
      '.aem-GridColumn--default--hide',
      // Mobile duplicate of Upcoming Events (desktop version is the authored one)
      '.wtc-upcoming-events__mobile',
      // Slick carousel clone slides (div.cmp-carousel__item.slick-cloned)
      '.slick-cloned',
      // Landing hero helper element (empty properties container)
      '#landing-hero-properties',
      // Alert bar (contains only commented-out events placeholder)
      '.wtc-body__alert-wrapper',
      // Qualtrics website feedback container
      '#ZN_2Ph8MmvH8oDDXqT',
      // IE browser message
      '.ie-browser-message',
      // Google Translate tooltip/voting widget injected at body end
      '#goog-gt-tt',
    ]);

    // Empty spacer blocks: div.block > div.wtc-block (no content)
    element.querySelectorAll('div.block > div.wtc-block').forEach((spacer) => {
      if (!spacer.textContent.trim() && !spacer.querySelector('img, picture, video, iframe, a')) {
        spacer.parentElement.remove();
      }
    });

    // Empty HTML embed containers: div.html > div.wtc-html (no content)
    element.querySelectorAll('div.html > div.wtc-html').forEach((embed) => {
      if (!embed.textContent.trim() && !embed.querySelector('*')) {
        embed.parentElement.remove();
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Translate nodes can be injected late; sweep again anywhere in the body.
    removeGoogleTranslate(element);

    // Source CTA links (a.wtc-button) in default content are styled as buttons.
    // EDS buttonizes only bold/italic links, so author them as bold (primary).
    // Links inside block tables are left to the block's own decoration.
    element.querySelectorAll('a.wtc-button').forEach((a) => {
      if (a.closest('table') || a.closest('strong, em')) return;
      const strong = document.createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
    });
    // Any empty-src images left over (never real block images).
    element.querySelectorAll('img').forEach((img) => {
      if (!(img.getAttribute('src') || '').trim()) {
        const wrapper = img.closest('picture') || img;
        const p = wrapper.parentElement;
        wrapper.remove();
        if (p && p.tagName === 'P' && !p.textContent.trim() && !p.children.length) p.remove();
      }
    });

    // Global chrome - header/nav and footer are migrated separately.
    WebImporter.DOMUtils.remove(element, [
      // Global header / navigation wrapper
      '.wtc-body__nav-wrapper',
      // Footer (footer.wtc-footer inside div.wtc-body__footer-wrapper, incl. #google_translate_element)
      '.wtc-body__footer-wrapper',
      'footer.wtc-footer',
      // Leftover non-authorable elements
      'link',
      'noscript',
      'iframe',
    ]);
  }
}
