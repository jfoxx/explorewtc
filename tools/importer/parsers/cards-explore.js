/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-explore. Base: cards.
 * Source: https://www.explorewtc.com/en/local.html
 * Instance selector: .wtc-section--header-light-blue-title .card-hover
 *
 * The selector matches 6 separate tile elements (no shared container). They sit
 * in three column wrappers (.wtc-layout), listed column by column in the DOM:
 *   col1: Memorial, Liberty Park | col2: Observatory, Shopping | col3: Oculus, PAC NYC
 * On-screen row order is Memorial, Observatory, Oculus, Liberty Park, Shopping, PAC NYC,
 * so tiles are interleaved across columns.
 *
 * Behaviour:
 *  - Called on the first tile of the group: builds ONE cards-explore block with every
 *    tile, replaces this tile with it and removes the other tiles.
 *  - Called on a tile already consumed (detached): does nothing.
 *  - Only .card-hover tiles are removed; the sibling "See All Things To Do" button
 *    (default content) and the section heading are left intact.
 *
 * Output (2 columns), one row per tile: [image | h3 linked title + description paragraph]
 * Iteration is keyed on the block-level .card-hover / .wtc-card-hover wrappers, never on
 * the a.wtc-card-hover__link anchors.
 */
const TILE_SELECTOR = '.card-hover';

function isDetached(el) {
  return !el.parentNode || (typeof el.isConnected === 'boolean' && !el.isConnected);
}

function collectTiles(element) {
  const scope = element.closest('.wtc-section--header-light-blue-title')
    || element.closest('.section')
    || element.parentElement;
  const tiles = scope ? [...scope.querySelectorAll(TILE_SELECTOR)] : [];
  return tiles.length ? tiles : [element];
}

// Interleave tiles column by column -> on-screen row order.
function toRowOrder(tiles) {
  const groups = [];
  const keyOf = (tile) => tile.closest('.wtc-layout') || tile.parentElement;
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

function buildRow(tile, document) {
  const card = tile.querySelector('.wtc-card-hover') || tile;
  const linkEl = card.querySelector('a.wtc-card-hover__link[href]') || card.querySelector('a[href]');
  const img = card.querySelector('.wtc-card-hover__image img') || card.querySelector('img');
  const titleEl = card.querySelector('.wtc-card-hover__bottom-title, .wtc-card-hover__bottom');
  const descEl = card.querySelector('.wtc-card-hover__description');

  const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
  const desc = descEl ? descEl.textContent.replace(/\s+/g, ' ').trim() : '';
  if (!img && !title && !desc) return null;

  const textCell = [];
  if (title) {
    const h3 = document.createElement('h3');
    if (linkEl) {
      const a = document.createElement('a');
      a.href = linkEl.getAttribute('href');
      a.textContent = title;
      h3.append(a);
    } else {
      h3.textContent = title;
    }
    textCell.push(h3);
  }
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc;
    textCell.push(p);
  }
  return [img || '', textCell.length ? textCell : ''];
}

export default function parse(element, { document }) {
  // Already consumed by the parse call on the first tile.
  if (isDetached(element)) return;

  // In document order the first tile is always reached first, so this call builds
  // the whole block; if ever called out of order on a still-attached tile, it
  // builds from here rather than dropping content.
  const tiles = collectTiles(element);

  const cells = toRowOrder(tiles)
    .map((tile) => buildRow(tile, document))
    .filter(Boolean);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-explore', cells });

  // Remove the other tiles (only the tile elements - never their column wrappers,
  // which may also hold the "See All Things To Do" button).
  tiles.forEach((tile) => {
    if (tile !== element && !isDetached(tile)) tile.remove();
  });
  element.replaceWith(block);
}
