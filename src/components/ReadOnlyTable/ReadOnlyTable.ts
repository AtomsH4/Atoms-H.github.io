import type { Element } from 'hast';

// A build-time component: keep the original table and its rich content intact.
// Scrolling and keyboard interaction belong to the browser, with no client state.
export function createReadOnlyTable(label: string): Element {
  return {
    type: 'element',
    tagName: 'div',
    properties: {
      className: ['read-only-table'],
      role: 'region',
      tabIndex: 0,
      ariaLabel: label,
    },
    children: [],
  };
}
