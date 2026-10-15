/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import cardsQuicklinksParser from './parsers/cards-quicklinks.js';
import columnsNewsletterParser from './parsers/columns-newsletter.js';
import cardsExploreParser from './parsers/cards-explore.js';
import cardsEventParser from './parsers/cards-event.js';
import carouselFeaturedParser from './parsers/carousel-featured.js';
import columnsSocialParser from './parsers/columns-social.js';

// TRANSFORMER IMPORTS
import explorewtcCleanupTransformer from './transformers/explorewtc-cleanup.js';
import explorewtcSectionsTransformer from './transformers/explorewtc-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'cards-quicklinks': cardsQuicklinksParser,
  'columns-newsletter': columnsNewsletterParser,
  'cards-explore': cardsExploreParser,
  'cards-event': cardsEventParser,
  'carousel-featured': carouselFeaturedParser,
  'columns-social': columnsSocialParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'local',
  description: 'Explore WTC local landing page: video hero, quick links, newsletter promo, attraction tiles, upcoming events, featured articles carousel and social promo',
  urls: [
    'https://www.explorewtc.com/en/local.html',
  ],
  blocks: [
    { name: 'hero-video', instances: ['.landing-hero'] },
    { name: 'cards-quicklinks', instances: ['.quick-links .wtc-quick-links__link-wrapper'] },
    { name: 'columns-newsletter', instances: ['.newsletter:not(.aem-GridColumn--default--hide)'] },
    { name: 'cards-explore', instances: ['.wtc-section--header-light-blue-title .card-hover'] },
    { name: 'cards-event', instances: ['.wtc-upcoming-events__desktop .card-hero'] },
    { name: 'carousel-featured', instances: ['.carousel-dynamic'] },
    { name: 'columns-social', instances: ['.wtc-body__content-wrapper > .aem-Grid > div.html:has(.instagram-media)'] },
  ],
  sections: [
    {
      id: '1',
      name: 'Hero',
      selector: ['.landing-hero'],
      style: null,
      blocks: ['hero-video'],
      defaultContent: [],
    },
    {
      id: '2',
      name: 'Plan Your Visit quick links',
      selector: ['.section.wtc-section--white-title'],
      style: 'light-blue',
      blocks: ['cards-quicklinks'],
      defaultContent: ['.wtc-quick-links__title'],
    },
    {
      id: '3',
      name: 'Newsletter signup',
      selector: ['.newsletter:not(.aem-GridColumn--default--hide)'],
      style: 'dark-blue',
      blocks: ['columns-newsletter'],
      defaultContent: [],
    },
    {
      id: '4',
      name: 'Come Explore',
      selector: ['.section.wtc-section--header-light-blue-title'],
      style: 'dark',
      blocks: ['cards-explore'],
      defaultContent: [
        '.wtc-section--header-light-blue-title .cmp-title__text',
        '.wtc-section--header-light-blue-title .wtc-button',
      ],
    },
    {
      id: '5',
      name: 'Upcoming Events',
      selector: ['.section:has(.wtc-upcoming-events)'],
      style: 'light-blue',
      blocks: ['cards-event'],
      defaultContent: [
        '.wtc-upcoming-events__desktop .cmp-title__text',
        '.wtc-upcoming-events__desktop .wtc-button',
      ],
    },
    {
      id: '6',
      name: 'Featured articles carousel',
      selector: ['.section.wtc-section--container-no-vertical-padding'],
      style: 'light-blue',
      blocks: ['carousel-featured'],
      defaultContent: ['.wtc-section--container-no-vertical-padding .cmp-title__text'],
    },
    {
      id: '7',
      name: 'Social / Share your photos',
      selector: [
        '.wtc-body__content-wrapper > .aem-Grid > div.html:has(.instagram-media)',
        ".wtc-body__content-wrapper > .aem-Grid > div.html:has(iframe[src*='instagram.com'])",
      ],
      style: 'dark',
      blocks: ['columns-social'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  explorewtcCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [explorewtcSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`);
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform: cleanup + section break markers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already consumed by an earlier parser,
    //    e.g. the cards-explore tiles 2-6 that tile 1's parse folds into one block)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform: final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized document path (root maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
