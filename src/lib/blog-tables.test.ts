// @vitest-environment node
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import config from '../../astro.config.mjs';

const markdown = `
## 状态归属

| 状态 | 说明 | 来源 |
| :--- | :---: | ---: |
| **active** | \`deletedAt\` 为空 | [源码](https://example.com/source) |
| trashed | 已归档 | 保留数据 |
`;

async function render(content = markdown, filePath = 'src/data/blog/example.md') {
  const configuredProcessor = config.markdown?.processor;
  if (!configuredProcessor) throw new Error('博客表格需要注册 Markdown processor');
  const processor = await configuredProcessor.createRenderer({
    syntaxHighlight: false,
  });
  const result = await processor.render(content, {
    fileURL: pathToFileURL(resolve(filePath)),
  });
  return new JSDOM(result.code).window.document.body;
}

describe('博客 Markdown 表格组件', () => {
  it('构建时为每张表生成带名称和键盘焦点的独立滚动容器', async () => {
    const root = await render(`${markdown}\n${markdown}`);
    const regions = root.querySelectorAll('.read-only-table');
    expect(regions).toHaveLength(2);
    for (const [index, region] of [...regions].entries()) {
      expect(region).toHaveAttribute('role', 'region');
      expect(region).toHaveAttribute('tabindex', '0');
      expect(region).toHaveAttribute('aria-label', `表格 ${index + 1}，可左右滚动`);
      expect(region.querySelector(':scope > table')).not.toBeNull();
    }
    expect(root.querySelectorAll('.read-only-table .read-only-table')).toHaveLength(0);
  });

  it('保留原生表头、列对齐、富文本、链接和只读语义', async () => {
    const root = await render();
    const table = root.querySelector('.read-only-table > table');
    expect(table).not.toBeNull();
    expect(table!.querySelectorAll('thead th')).toHaveLength(3);
    expect(table!.querySelectorAll('thead th[scope="col"]')).toHaveLength(3);
    expect(table!.querySelector('thead th:nth-child(2)')).toHaveStyle({ textAlign: 'center' });
    expect(table!.querySelector('tbody td:nth-child(3)')).toHaveStyle({ textAlign: 'right' });
    expect(table!.querySelector('strong')).toHaveTextContent('active');
    expect(table!.querySelector('code')).toHaveTextContent('deletedAt');
    expect(table!.querySelector('a')).toHaveAttribute('href', 'https://example.com/source');
    expect(table!.querySelectorAll('input, button, select, textarea, [contenteditable]')).toHaveLength(0);
  });

  it('处理引用中的 Markdown 表格，但不改写代码块中的示例', async () => {
    const quote = markdown.trim().split('\n').map(line => `> ${line}`).join('\n');
    const root = await render(`${quote}\n\n\`\`\`md\n${markdown}\n\`\`\``);
    expect(root.querySelectorAll('blockquote .read-only-table')).toHaveLength(1);
    expect(root.querySelector('pre code')).toHaveTextContent('| 状态 | 说明 | 来源 |');
    expect(root.querySelectorAll('.read-only-table')).toHaveLength(1);
  });

  it.each(['src/data/notes/example.md', 'src/data/projects/example.md'])('不改变博客之外的内容：%s', async filePath => {
    const root = await render(markdown, filePath);
    expect(root.querySelectorAll('.read-only-table')).toHaveLength(0);
    expect(root.querySelectorAll('table')).toHaveLength(1);
  });

  it('没有表格的文章不生成额外容器', async () => {
    const root = await render('## 正文\n\n普通段落。');
    expect(root.querySelectorAll('.read-only-table')).toHaveLength(0);
    expect(root.querySelector('p')).toHaveTextContent('普通段落。');
  });
});
