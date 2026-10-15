/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-event. Base: cards.
 * Source: https://www.explorewtc.com/en/local.html
 * Instance selector: .wtc-upcoming-events__desktop .card-hero
 *
 * Output (2 columns), one row per event card:
 *   [image | date paragraph ("Through November 2026") + h3 linked title]
 * The section title and "See All Events" button sit outside the card (default content).
 *
 * Handles both a single matched .card-hero and a container holding several
 * (.card-hero__wrapper is the block-level iteration key, not the anchor).
 */
function buildRow(card, document) {
  const link = card.querySelector('a.card-hero__descriptionlink[href]') || card.querySelector('a[href]');
  const img = card.querySelector('.card-hero__image img') || card.querySelector('img');
  const dateEl = card.querySelector('.card-hero__bottom-description');
  const titleEl = card.querySelector('.card-hero__bottom-title');

  const date = dateEl ? dateEl.textContent.replace(/\s+/g, ' ').trim() : '';
  const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
  if (!img && !date && !title) return null;

  const textCell = [];
  if (date) {
    const p = document.createElement('p');
    p.textContent = date;
    textCell.push(p);
  }
  if (title) {
    const h3 = document.createElement('h3');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = title;
      h3.append(a);
    } else {
      h3.textContent = title;
    }
    textCell.push(h3);
  }
  return [img || '', textCell.length ? textCell : ''];
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll(':scope .card-hero__wrapper')];
  if (!cards.length) cards = element.matches('.card-hero') ? [element] : [...element.querySelectorAll('.card-hero')];
  if (!cards.length) cards = [element];

  const cells = cards.map((card) => buildRow(card, document)).filter(Boolean);
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-event', cells });
  element.replaceWith(block);
}
