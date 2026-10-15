/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-things-to-do.js
  var import_things_to_do_exports = {};
  __export(import_things_to_do_exports, {
    default: () => import_things_to_do_default
  });

  // tools/importer/parsers/cards-landing.js
  var SITE_ORIGIN = "https://www.explorewtc.com/";
  function cssUnescape(str) {
    return str.replace(/\\([0-9a-fA-F]{1,6})[ \t\n\r\f]?/g, (m, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/\\(.)/g, "$1");
  }
  function extractUrl(value) {
    if (!value || value === "none") return "";
    const m = value.match(/url\(\s*(['"]?)(.*?)\1\s*\)/i);
    return m ? cssUnescape(m[2]).trim() : "";
  }
  function getBaseUrl(document2) {
    var _a, _b;
    const candidates = [
      (_a = document2.querySelector('link[rel="canonical"]')) == null ? void 0 : _a.getAttribute("href"),
      (_b = document2.querySelector('meta[property="og:url"]')) == null ? void 0 : _b.getAttribute("content"),
      document2.baseURI
    ];
    const found = candidates.find((c) => c && /^https?:\/\//i.test(c) && !/localhost|127\.0\.0\.1/i.test(c));
    return found || SITE_ORIGIN;
  }
  function getBackgroundUrl(el, document2) {
    var _a, _b;
    if (!el) return "";
    let url = extractUrl(((_a = (el.getAttribute("style") || "").match(/background(?:-image)?\s*:[^;]*/i)) == null ? void 0 : _a[0]) || "");
    if (!url && el.style) url = extractUrl(el.style.backgroundImage || el.style.background || "");
    if (!url) {
      try {
        const view = document2.defaultView || (typeof window !== "undefined" ? window : null);
        if (view && view.getComputedStyle) url = extractUrl(view.getComputedStyle(el).backgroundImage);
      } catch (e) {
      }
    }
    if (!url) url = el.getAttribute("data-src") || el.getAttribute("data-background") || ((_b = el.querySelector("img")) == null ? void 0 : _b.getAttribute("src")) || "";
    if (!url) return "";
    try {
      return new URL(url, getBaseUrl(document2)).href;
    } catch (e) {
      return url;
    }
  }
  function parse(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope li.wtc-page-landing__item")];
    if (!items.length) items = [...element.querySelectorAll(".wtc-page-landing__item, :scope > ol > li, :scope > ul > li")];
    const cells = [];
    items.forEach((item) => {
      const imageEl = item.querySelector(".wtc-page-landing__item-image") || item.querySelector('[style*="background"]');
      const headingEl = item.querySelector(".wtc-page-landing__title") || item.querySelector("h1, h2, h3, h4");
      const linkEl = item.querySelector(".wtc-button--internal-link a[href]") || item.querySelector("a.wtc-button[href]") || item.querySelector("a[href]");
      let title = "";
      if (headingEl) {
        const parts = [...headingEl.querySelectorAll(":scope > span")];
        title = (parts.length ? parts.map((s) => s.textContent).join(" ") : headingEl.textContent).replace(/\s+/g, " ").trim();
      }
      const src = getBackgroundUrl(imageEl, document2);
      let imageCell = "";
      if (src) {
        const img = document2.createElement("img");
        img.src = src;
        img.alt = title;
        imageCell = img;
      } else {
        const inlineImg = item.querySelector("img");
        if (inlineImg) imageCell = inlineImg;
      }
      const textCell = [];
      if (title) {
        const h2 = document2.createElement("h2");
        h2.textContent = title;
        textCell.push(h2);
      }
      if (linkEl) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.setAttribute("href", linkEl.getAttribute("href"));
        a.textContent = linkEl.textContent.replace(/\s+/g, " ").trim() || "Learn More";
        p.append(a);
        textCell.push(p);
      }
      if (!imageCell && !textCell.length) return;
      cells.push([imageCell, textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-landing", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/explorewtc-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var GOOGLE_TRANSLATE_SELECTORS = [
    "#google_translate_element",
    ".goog-te-gadget",
    ".skiptranslate",
    ".goog-te-banner-frame",
    '[class^="VIpgJd-"]',
    '[class*=" VIpgJd-"]',
    "#goog-gt-tt",
    'img[src*="gstatic.com"][src*="translate"]'
  ];
  var EMPTY_BG_RE = /background-image\s*:\s*url\(\s*(?:''|""|)\s*\)\s*;?/gi;
  function removeGoogleTranslate(element) {
    WebImporter.DOMUtils.remove(element, GOOGLE_TRANSLATE_SELECTORS);
  }
  function stripTitleSuffix(document2) {
    const titleEl = document2 && document2.querySelector("title");
    if (!titleEl) return;
    const title = titleEl.textContent.replace(/[\n\t]/g, "").trim();
    const stripped = title.replace(/\s+\|\s+[^|]+$/, "").trim();
    if (stripped && stripped !== title) titleEl.textContent = stripped;
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      stripTitleSuffix(payload && payload.document || element.ownerDocument);
      removeGoogleTranslate(element);
      element.querySelectorAll('[style*="background-image"]').forEach((el) => {
        const style = el.getAttribute("style") || "";
        if (EMPTY_BG_RE.test(style)) {
          EMPTY_BG_RE.lastIndex = 0;
          el.setAttribute("style", style.replace(EMPTY_BG_RE, ""));
          el.style.backgroundImage = "none";
        }
        EMPTY_BG_RE.lastIndex = 0;
      });
      WebImporter.DOMUtils.remove(element, [
        // Hidden authored content: hidden 9/11 "Share Your Story" card (div.card-wide-2)
        // and hidden newsletter promo (div.newsletter.aem-GridColumn--default--hide)
        ".aem-GridColumn--default--hide",
        // Mobile duplicate of Upcoming Events (desktop version is the authored one)
        ".wtc-upcoming-events__mobile",
        // Slick carousel clone slides (div.cmp-carousel__item.slick-cloned)
        ".slick-cloned",
        // Landing hero helper element (empty properties container)
        "#landing-hero-properties",
        // Alert bar (contains only commented-out events placeholder)
        ".wtc-body__alert-wrapper",
        // Qualtrics website feedback container
        "#ZN_2Ph8MmvH8oDDXqT",
        // IE browser message
        ".ie-browser-message",
        // Google Translate tooltip/voting widget injected at body end
        "#goog-gt-tt",
        // Breadcrumb ("Home > Things to Do") is generated from the page hierarchy, not authored
        "div.breadcrumb",
        ".wtc-breadcrumb"
      ]);
      element.querySelectorAll("div.block > div.wtc-block").forEach((spacer) => {
        if (!spacer.textContent.trim() && !spacer.querySelector("img, picture, video, iframe, a")) {
          spacer.parentElement.remove();
        }
      });
      element.querySelectorAll("div.html > div.wtc-html").forEach((embed) => {
        if (!embed.textContent.trim() && !embed.querySelector("*")) {
          embed.parentElement.remove();
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      removeGoogleTranslate(element);
      element.querySelectorAll("a.wtc-button").forEach((a) => {
        if (a.closest("table") || a.closest("strong, em")) return;
        const strong = document.createElement("strong");
        a.replaceWith(strong);
        strong.append(a);
      });
      element.querySelectorAll("img").forEach((img) => {
        if (!(img.getAttribute("src") || "").trim()) {
          const wrapper = img.closest("picture") || img;
          const p = wrapper.parentElement;
          wrapper.remove();
          if (p && p.tagName === "P" && !p.textContent.trim() && !p.children.length) p.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        // Global header / navigation wrapper
        ".wtc-body__nav-wrapper",
        // Footer (footer.wtc-footer inside div.wtc-body__footer-wrapper, incl. #google_translate_element)
        ".wtc-body__footer-wrapper",
        "footer.wtc-footer",
        // Leftover non-authorable elements
        "link",
        "noscript",
        "iframe"
      ]);
    }
  }

  // tools/importer/transformers/explorewtc-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-things-to-do.js
  var parsers = {
    "cards-landing": parse
  };
  var PAGE_TEMPLATE = {
    name: "things-to-do",
    description: "Explore WTC Things To Do landing page: six stacked full-width category panels (image background, heading, Learn More link)",
    urls: [
      "https://www.explorewtc.com/en/local/things-to-do.html"
    ],
    blocks: [
      { name: "cards-landing", instances: [".wtc-page-landing"] }
    ],
    sections: [
      {
        id: "1",
        name: "Things to Do landing panels",
        selector: [".section.wtc-section--content-full-width", ".wtc-body__content-wrapper > .aem-Grid > .section"],
        style: null,
        blocks: ["cards-landing"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_things_to_do_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_things_to_do_exports);
})();
