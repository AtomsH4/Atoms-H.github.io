import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const entrySchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  pubDate: z.coerce.date(),
  tags: z.array(z.string().min(1)).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
}).strict();

const collections = {
  blog: defineCollection({
    loader: glob({ pattern: '**/*.(md|mdx)', base: './src/data/blog' }),
    schema: entrySchema,
  }),
  notes: defineCollection({
    loader: glob({ pattern: '**/*.(md|mdx)', base: './src/data/notes' }),
    schema: entrySchema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/data/projects' }),
    schema: entrySchema.extend({
      repository: z.string().url(),
      kind: z.enum(['own', 'fork']),
    }),
  }),
};

export { collections };
