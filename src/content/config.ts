import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    coverImage: z.string(),
    heroImage: z.string().optional(),
    images: z.array(z.string()).optional().default([]),
    externalLink: z.string().optional(),
    embedUrl: z.string().optional(),
    showOnHomepage: z.boolean().default(true),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
