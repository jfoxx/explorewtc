# Migration Plan: Explore WTC "Local" Page

> ⚠️ **The migration hasn't started.** Planning mode is still on, and it doesn't allow any changes, so asking again in this mode won't start it. **Switch to Execute mode** and send any message (for example, "start"). Phase 1 begins right away and runs through the checklist below.

**Source page:** https://www.explorewtc.com/en/local.html
**Target:** a Document Authoring (DA) site on Edge Delivery Services (`jfoxx/explorewtc`)
**Status:** ✅ Approved and ready to run. Nothing has been changed yet.

---

## Overview

This plan moves the single "Local" page from the Explore WTC site into Edge Delivery Services. The page gets analyzed, broken into sections and blocks, rebuilt with matching blocks, and imported as authorable content. Then it's checked against the original in the preview.

The project is a fresh boilerplate. It has the standard starter blocks (cards, columns, hero, header, footer, fragment) and no migrated content or import tools yet. So this first page also sets up the import tools that later pages from the same template can reuse.

---

## Assumptions

- This is an ordinary content page, not a product or shopping page, so the standard migration process applies.
- The project uses Document Authoring (DA), based on the project's content source.
- Scope is **this one page**. Header/nav and footer migration are separate optional follow-ups, listed at the end.
- Images stay pointed at the source site during migration. They aren't downloaded locally.
- I'll stop for your input only where the process needs a decision from you. Otherwise the phases run in order without pausing.

---

## Phases

### Phase 1: Project & Page Analysis
- Confirm the project type (DA) and which block library to use.
- Scrape the source page: content, metadata, images and screenshots.
- Find section boundaries and content sequences, and decide what should be default content and what should be a block.
- Name block variants, such as a hero banner, card grids of local places, and promo or columns sections.

### Phase 2: Block Mapping
- Match each identified variant to an existing block (cards, columns, hero) where it's at least about 80% similar, or flag it as a new custom block.
- Record the DOM selectors for each block variant in the page template mapping.

### Phase 3: Import Infrastructure
- Generate a block parser for each variant.
- Generate page transformers for cleanup (removing the site header, footer, cookie banners and tracking), section breaks, and any Dynamic Media/Scene7 image handling.
- Bundle these into one import script for the "Local" template.

### Phase 4: Block Development
- Create or extend the blocks needed for the identified variants, written defensively so they still work when authors leave out or add cells.
- Keep CSS scoped to each block, following the project rules.

### Phase 5: Content Import
- Run the bulk import for the "Local" page URL.
- Check that the generated page content exists and has the expected sections, blocks and metadata.

### Phase 6: Preview & Verification
- Check how the imported page renders in the preview: blocks decorate correctly, images load, nothing 404s.
- Compare structure and content against the original page and fix any gaps.

### Phase 7: Design Alignment (recommended)
- Pull design tokens (colors, fonts, spacing) from the source site into the global styles.
- Style each block to match the original, then do a visual comparison to check it.

---

## Checklist

- [ ] Confirm project type (DA) and block library source
- [ ] Scrape https://www.explorewtc.com/en/local.html (content, metadata, images, screenshots)
- [ ] Identify page sections and content sequences
- [ ] Decide what is default content and what is a block for each section
- [ ] Name block variants and check them against existing blocks for reuse
- [ ] Add block variant DOM selectors to the page template mapping
- [ ] Generate block parsers for each variant
- [ ] Generate page transformers (cleanup, sections, image handling)
- [ ] Bundle the import script for the "Local" template
- [ ] Build or extend the required blocks (JS + scoped CSS)
- [ ] Run the content import for the Local page
- [ ] Check that the imported page content and metadata are complete
- [ ] Check the page in the preview (blocks render, images load, no 404s)
- [ ] Compare the migrated page with the original and fix discrepancies
- [ ] (Recommended) Migrate global design tokens and block styling
- [ ] (Recommended) Run a visual comparison against the original page

---

## Optional Follow-ups (not in this plan's scope)

- **Header / navigation migration** from the source site
- **Footer migration** from the source site
- **Publishing to Document Authoring**, which needs the Adobe credentials permission turned on in Settings → LLM Permissions
- **Optional add-ons:** extra tooling is available for product/listing pages, HTML form conversion, and Figma design import. None of them looks necessary for this page. If you want one, say so and I'll turn it on.

---

## Deliverables

- Import tools for the "Local" page template, reusable for similar pages
- New or updated blocks for the page's content patterns
- The migrated "Local" page, authorable in Document Authoring
- A verification summary comparing the migrated page with the original

> **Next step:** Switch to **Execute mode** and send any message. Phase 1 starts right away.
