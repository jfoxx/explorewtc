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

  // tools/importer/import-local.js
  var import_local_exports = {};
  __export(import_local_exports, {
    default: () => import_local_default
  });

  // tools/importer/parsers/hero-video.js
  var DEFAULT_ORIGIN = "https://www.explorewtc.com";
  function resolveOrigin(document2, params) {
    const candidates = [params && params.originalURL, document2 && document2.baseURI];
    for (const c of candidates) {
      try {
        const u = new URL(c);
        if (/^https?:$/.test(u.protocol) && !/localhost|127\.0\.0\.1/.test(u.hostname)) return u.origin;
      } catch (e) {
      }
    }
    return DEFAULT_ORIGIN;
  }
  function parse(element, { document: document2, params }) {
    const source = element.querySelector("video source[src], video[src]");
    const rawSrc = source ? source.getAttribute("src") : null;
    const poster = element.querySelector(
      "img.landing-hero__video-player-mobile-image, .landing-hero__video-player img, img"
    );
    const heading = element.querySelector("h1, .landing-hero__title, h2");
    const copy = element.querySelector(".landing-hero__copy");
    const ctas = [...element.querySelectorAll(".landing-hero__link a[href], a.wtc-button")].filter((a, i, arr) => arr.indexOf(a) === i);
    if (!heading && !rawSrc && !poster) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const mediaCell = [];
    if (rawSrc) {
      let href = rawSrc;
      try {
        href = new URL(rawSrc, resolveOrigin(document2, params)).href;
      } catch (e) {
      }
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = href;
      p.append(a);
      mediaCell.push(p);
    }
    if (poster) mediaCell.push(poster);
    if (mediaCell.length) cells.push([mediaCell]);
    const contentCell = [];
    if (heading) {
      if (heading.tagName !== "H1") {
        const h1 = document2.createElement("h1");
        h1.textContent = heading.textContent.trim();
        contentCell.push(h1);
      } else {
        contentCell.push(heading);
      }
    }
    if (copy && copy.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = copy.textContent.trim();
      contentCell.push(p);
    }
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      p.append(a);
      contentCell.push(p);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-quicklinks.js
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .wtc-quick-links__link")];
    if (!items.length) items = [...element.querySelectorAll(".wtc-quick-links__link")];
    if (!items.length) {
      items = [...element.querySelectorAll("a.wtc-quick-links__icon-wrapper")].map((a) => a.parentElement);
    }
    const cells = [];
    items.forEach((item) => {
      const link = item.querySelector("a[href]");
      const img = item.querySelector("img.wtc-quick-links__icon, img");
      const labelEl = item.querySelector(".wtc-quick-links__link-text");
      const label = (labelEl ? labelEl.textContent : link ? link.textContent : "").trim();
      if (!img && !label) return;
      let textCell = "";
      if (label) {
        const p = document2.createElement("p");
        if (link) {
          const a = document2.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = label;
          p.append(a);
        } else {
          p.textContent = label;
        }
        textCell = p;
      }
      let imgCell = "";
      if (img) {
        const newImg = document2.createElement("img");
        let src = img.src || img.getAttribute("src") || "";
        if (/\.svg$/i.test(src)) src += "?format=svg";
        newImg.src = src;
        newImg.alt = img.getAttribute("alt") || label;
        imgCell = newImg;
      }
      cells.push([imgCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-quicklinks", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-newsletter.js
  function parse3(element, { document: document2 }) {
    const title = element.querySelector(".wtc-newsletter__title, .wtc-newsletter__title-container h2, h2");
    const copyEl = element.querySelector(".wtc-newsletter__copy, .wtc-newsletter__copy-container p");
    const ctas = [...element.querySelectorAll(".wtc-newsletter__button-container a[href]")];
    if (!ctas.length) {
      const fallback = element.querySelector("a.wtc-button[href]");
      if (fallback) ctas.push(fallback);
    }
    let img = element.querySelector(".wtc-newsletter__image-container img") || element.querySelector("img");
    if (!img) {
      const bgHost = element.querySelector('.wtc-newsletter__image-container, [style*="background-image"]');
      const style = bgHost ? bgHost.getAttribute("style") || "" : "";
      const m = style.match(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (m) {
        img = document2.createElement("img");
        img.src = m[1];
        img.alt = "";
      }
    }
    if (!title && !copyEl && !img) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (title) {
      const h2 = document2.createElement("h2");
      h2.textContent = title.textContent.trim();
      textCell.push(h2);
    }
    if (copyEl && copyEl !== title && copyEl.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = copyEl.textContent.trim();
      textCell.push(p);
    }
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      p.append(link);
      textCell.push(p);
    });
    const cells = [[textCell, img || ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-newsletter", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-explore.js
  var TILE_SELECTOR = ".card-hover";
  function isDetached(el) {
    return !el.parentNode || typeof el.isConnected === "boolean" && !el.isConnected;
  }
  function collectTiles(element) {
    const scope = element.closest(".wtc-section--header-light-blue-title") || element.closest(".section") || element.parentElement;
    const tiles = scope ? [...scope.querySelectorAll(TILE_SELECTOR)] : [];
    return tiles.length ? tiles : [element];
  }
  function toRowOrder(tiles) {
    const groups = [];
    const keyOf = (tile) => tile.closest(".wtc-layout") || tile.parentElement;
    tiles.forEach((tile) => {
      const key = keyOf(tile);
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, items: [] };
        groups.push(group);
      }
      group.items.push(tile);
    });
    if (groups.length < 2) return tiles;
    const ordered = [];
    const max = Math.max(...groups.map((g) => g.items.length));
    for (let i = 0; i < max; i += 1) {
      groups.forEach((g) => {
        if (g.items[i]) ordered.push(g.items[i]);
      });
    }
    return ordered;
  }
  function buildRow(tile, document2) {
    const card = tile.querySelector(".wtc-card-hover") || tile;
    const linkEl = card.querySelector("a.wtc-card-hover__link[href]") || card.querySelector("a[href]");
    const img = card.querySelector(".wtc-card-hover__image img") || card.querySelector("img");
    const titleEl = card.querySelector(".wtc-card-hover__bottom-title, .wtc-card-hover__bottom");
    const descEl = card.querySelector(".wtc-card-hover__description");
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
    const desc = descEl ? descEl.textContent.replace(/\s+/g, " ").trim() : "";
    if (!img && !title && !desc) return null;
    const textCell = [];
    if (title) {
      const h3 = document2.createElement("h3");
      if (linkEl) {
        const a = document2.createElement("a");
        a.href = linkEl.getAttribute("href");
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      textCell.push(h3);
    }
    if (desc) {
      const p = document2.createElement("p");
      p.textContent = desc;
      textCell.push(p);
    }
    return [img || "", textCell.length ? textCell : ""];
  }
  function parse4(element, { document: document2 }) {
    if (isDetached(element)) return;
    const tiles = collectTiles(element);
    const cells = toRowOrder(tiles).map((tile) => buildRow(tile, document2)).filter(Boolean);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-explore", cells });
    tiles.forEach((tile) => {
      if (tile !== element && !isDetached(tile)) tile.remove();
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-event.js
  function buildRow2(card, document2) {
    const link = card.querySelector("a.card-hero__descriptionlink[href]") || card.querySelector("a[href]");
    const img = card.querySelector(".card-hero__image img") || card.querySelector("img");
    const dateEl = card.querySelector(".card-hero__bottom-description");
    const titleEl = card.querySelector(".card-hero__bottom-title");
    const date = dateEl ? dateEl.textContent.replace(/\s+/g, " ").trim() : "";
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
    if (!img && !date && !title) return null;
    const textCell = [];
    if (date) {
      const p = document2.createElement("p");
      p.textContent = date;
      textCell.push(p);
    }
    if (title) {
      const h3 = document2.createElement("h3");
      if (link) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      textCell.push(h3);
    }
    return [img || "", textCell.length ? textCell : ""];
  }
  function parse5(element, { document: document2 }) {
    let cards = [...element.querySelectorAll(":scope .card-hero__wrapper")];
    if (!cards.length) cards = element.matches(".card-hero") ? [element] : [...element.querySelectorAll(".card-hero")];
    if (!cards.length) cards = [element];
    const cells = cards.map((card) => buildRow2(card, document2)).filter(Boolean);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-event", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-featured.js
  function parse6(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".cmp-carousel__item:not(.slick-cloned)")];
    if (!slides.length) slides = [...element.querySelectorAll(".wtc-card-hover, .card-hover")].filter((el) => !el.parentElement.closest(".wtc-card-hover, .card-hover"));
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    slides.forEach((slide) => {
      const link = slide.querySelector("a.wtc-card-hover__link[href]") || slide.querySelector("a[href]");
      const img = slide.querySelector(".wtc-card-hover__image img") || slide.querySelector("img");
      const eyebrowEl = slide.querySelector(".wtc-card-hover__bottom-subtitle");
      const titleEl = slide.querySelector(".wtc-card-hover__bottom-title");
      const eyebrow = eyebrowEl ? eyebrowEl.textContent.replace(/\s+/g, " ").trim() : "";
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (!img && !title) return;
      if (img && !img.getAttribute("alt")) {
        const holder = img.closest("[data-title]");
        const altText = img.getAttribute("title") || holder && holder.getAttribute("data-title") || "";
        if (altText) img.setAttribute("alt", altText);
      }
      const key = `${link ? link.getAttribute("href") : ""}|${title}`;
      if (seen.has(key)) return;
      seen.add(key);
      const textCell = [];
      if (eyebrow) {
        const p = document2.createElement("p");
        p.textContent = eyebrow;
        textCell.push(p);
      }
      if (title) {
        const h3 = document2.createElement("h3");
        if (link) {
          const a = document2.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        textCell.push(h3);
      }
      cells.push([img || "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-social.js
  var DEFAULT_PROFILE = "https://www.instagram.com/explorewtc/";
  function profileUrlFrom(element) {
    const candidates = [];
    element.querySelectorAll('iframe[src*="instagram.com"], iframe.instagram-media').forEach((f) => candidates.push(f.getAttribute("src")));
    element.querySelectorAll("[data-instgrm-permalink]").forEach((b) => candidates.push(b.getAttribute("data-instgrm-permalink")));
    element.querySelectorAll('a[href*="instagram.com"]').forEach((a) => candidates.push(a.getAttribute("href")));
    for (const raw of candidates) {
      if (!raw) continue;
      try {
        const url = new URL(raw, "https://www.instagram.com");
        if (!/(^|\.)instagram\.com$/i.test(url.hostname)) continue;
        const path = url.pathname.replace(/\/embed\/?.*$/i, "/").replace(/\/?$/, "/");
        if (path === "/") continue;
        return `https://www.instagram.com${path}`;
      } catch (e) {
      }
    }
    return null;
  }
  function parse7(element, { document: document2 }) {
    const profileUrl = profileUrlFrom(element) || (element.querySelector(".instagram-media") ? DEFAULT_PROFILE : null);
    const sibling = element.nextElementSibling;
    const imageHost = sibling && (sibling.matches("div.image, .wtc-image--top-margin") || sibling.querySelector("img")) ? sibling : null;
    const img = imageHost ? imageHost.querySelector("img") : null;
    if (img && !img.getAttribute("alt")) {
      const holder = img.closest("[data-title]");
      const altText = img.getAttribute("title") || holder && holder.getAttribute("data-title") || "";
      if (altText) img.setAttribute("alt", altText);
    }
    if (!profileUrl && !img) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let linkCell = "";
    if (profileUrl) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = profileUrl;
      a.textContent = profileUrl;
      p.append(a);
      linkCell = p;
    }
    const cells = [[linkCell, img || ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-social", cells });
    if (imageHost && img) imageHost.remove();
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
        "#goog-gt-tt"
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

  // tools/importer/import-local.js
  var parsers = {
    "hero-video": parse,
    "cards-quicklinks": parse2,
    "columns-newsletter": parse3,
    "cards-explore": parse4,
    "cards-event": parse5,
    "carousel-featured": parse6,
    "columns-social": parse7
  };
  var PAGE_TEMPLATE = {
    name: "local",
    description: "Explore WTC local landing page: video hero, quick links, newsletter promo, attraction tiles, upcoming events, featured articles carousel and social promo",
    urls: [
      "https://www.explorewtc.com/en/local.html"
    ],
    blocks: [
      { name: "hero-video", instances: [".landing-hero"] },
      { name: "cards-quicklinks", instances: [".quick-links .wtc-quick-links__link-wrapper"] },
      { name: "columns-newsletter", instances: [".newsletter:not(.aem-GridColumn--default--hide)"] },
      { name: "cards-explore", instances: [".wtc-section--header-light-blue-title .card-hover"] },
      { name: "cards-event", instances: [".wtc-upcoming-events__desktop .card-hero"] },
      { name: "carousel-featured", instances: [".carousel-dynamic"] },
      { name: "columns-social", instances: [".wtc-body__content-wrapper > .aem-Grid > div.html:has(.instagram-media)"] }
    ],
    sections: [
      {
        id: "1",
        name: "Hero",
        selector: [".landing-hero"],
        style: null,
        blocks: ["hero-video"],
        defaultContent: []
      },
      {
        id: "2",
        name: "Plan Your Visit quick links",
        selector: [".section.wtc-section--white-title"],
        style: "light-blue",
        blocks: ["cards-quicklinks"],
        defaultContent: [".wtc-quick-links__title"]
      },
      {
        id: "3",
        name: "Newsletter signup",
        selector: [".newsletter:not(.aem-GridColumn--default--hide)"],
        style: "dark-blue",
        blocks: ["columns-newsletter"],
        defaultContent: []
      },
      {
        id: "4",
        name: "Come Explore",
        selector: [".section.wtc-section--header-light-blue-title"],
        style: "dark",
        blocks: ["cards-explore"],
        defaultContent: [
          ".wtc-section--header-light-blue-title .cmp-title__text",
          ".wtc-section--header-light-blue-title .wtc-button"
        ]
      },
      {
        id: "5",
        name: "Upcoming Events",
        selector: [".section:has(.wtc-upcoming-events)"],
        style: "light-blue",
        blocks: ["cards-event"],
        defaultContent: [
          ".wtc-upcoming-events__desktop .cmp-title__text",
          ".wtc-upcoming-events__desktop .wtc-button"
        ]
      },
      {
        id: "6",
        name: "Featured articles carousel",
        selector: [".section.wtc-section--container-no-vertical-padding"],
        style: "light-blue",
        blocks: ["carousel-featured"],
        defaultContent: [".wtc-section--container-no-vertical-padding .cmp-title__text"]
      },
      {
        id: "7",
        name: "Social / Share your photos",
        selector: [
          ".wtc-body__content-wrapper > .aem-Grid > div.html:has(.instagram-media)",
          ".wtc-body__content-wrapper > .aem-Grid > div.html:has(iframe[src*='instagram.com'])"
        ],
        style: "dark",
        blocks: ["columns-social"],
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
  var import_local_default = {
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
  return __toCommonJS(import_local_exports);
})();
