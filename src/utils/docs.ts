import type { MarkdownInstance } from 'astro';

export interface DocFrontmatter {
  title: string;
  description?: string;
  order?: number;
}

export interface DocEntry {
  slug: string;
  frontmatter: DocFrontmatter;
  Content: MarkdownInstance<DocFrontmatter>['Content'];
  headings: { depth: number; slug: string; text: string }[];
}

export async function getAllDocs(): Promise<DocEntry[]> {
  const docs = import.meta.glob<MarkdownInstance<DocFrontmatter>>(
    '../content/docs/**/*.md',
    { eager: true }
  );

  return Object.entries(docs).map(([path, doc]) => {
    // Extract slug from path: ../content/docs/guide/what-is-ime.md -> guide/what-is-ime
    const slug = path
      .replace('../content/docs/', '')
      .replace('.md', '');

    return {
      slug,
      frontmatter: doc.frontmatter,
      Content: doc.Content,
      headings: doc.getHeadings(),
    };
  });
}

export async function getDocBySlug(slug: string): Promise<DocEntry | undefined> {
  const docs = await getAllDocs();
  return docs.find((doc) => doc.slug === slug);
}
