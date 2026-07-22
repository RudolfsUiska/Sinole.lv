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
    posters: z.array(z.string()).optional().default([]),
    externalLink: z.string().optional(),
    embedUrl: z.string().optional(),
    showOnHomepage: z.boolean().default(true),
    draft: z.boolean().default(false),
  }),
});

const about = defineCollection({
  type: 'content',
  schema: z.object({
    introHeading: z.string(),
    mapHeading: z.string(),
    mapEmbedUrl: z.string(),
  }),
});

const contact = defineCollection({
  type: 'content',
  schema: z.object({
    heading: z.string(),
    email: z.string(),
  }),
});

export const collections = { projects, about, contact };
