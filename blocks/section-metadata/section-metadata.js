/*
 * Section Metadata Block
 * Applies authored section metadata to the enclosing section, then removes itself.
 * `style` becomes section classes; any other key becomes a data attribute.
 */

import {
  readBlockConfig,
  toCamelCase,
  toClassName,
} from '../../scripts/aem.js';

export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;

  const meta = readBlockConfig(block);
  Object.entries(meta).forEach(([key, value]) => {
    if (key === 'style') {
      String(value)
        .split(',')
        .map((style) => toClassName(style.trim()))
        .filter(Boolean)
        .forEach((style) => section.classList.add(style));
    } else if (value) {
      section.dataset[toCamelCase(key)] = value;
    }
  });

  const wrapper = block.closest('.section-metadata-wrapper');
  (wrapper || block).remove();
}
