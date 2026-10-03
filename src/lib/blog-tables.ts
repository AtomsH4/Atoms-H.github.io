import type { SatteriProcessorOptions } from '@astrojs/markdown-satteri';
import { createReadOnlyTable } from '../components/ReadOnlyTable/ReadOnlyTable';

type TablePlugin = NonNullable<SatteriProcessorOptions['hastPlugins']>[number];

export function blogTables({ fileURL }: { fileURL?: URL }): TablePlugin {
  // Keep Astro's existing processor; only opt blog content into this component.
  if (!fileURL || !/\/src\/data\/blog\/.*\.mdx?$/.test(fileURL.pathname)) return;

  let tableIndex = 0;
  return {
    name: 'blog-read-only-tables',
    element: [
      {
        filter: ['table'],
        visit(node, context) {
          const parent = context.parent(node);
          if (parent?.type === 'element' && parent.properties.className?.includes('read-only-table')) return;
          tableIndex += 1;
          context.wrapNode(node, createReadOnlyTable(`表格 ${tableIndex}，可左右滚动`));
        },
      },
      {
        filter: ['th'],
        visit(node, context) {
          const row = context.parent(node);
          const section = row && context.parent(row);
          if (section?.type === 'element' && section.tagName === 'thead' && !node.properties.scope) {
            context.setProperty(node, 'scope', 'col');
          }
        },
      },
    ],
  };
}
