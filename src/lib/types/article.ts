// Types for the article feed. The feed itself lives outside the build
// (see src/lib/components/Articles.svelte header comment) as a JSON file
// fetched at runtime — this file just describes its shape.

export interface ArticleLink {
  url: string;
  /** Button text in the article window. Defaults to "Read Full Article" if omitted. */
  label?: string;
}

export interface Article {
  /** Unique slug, used as the Svelte #each key and the modal aria id. */
  id: string;
  title: string;
  /** Short teaser shown on the card. */
  excerpt: string;
  /** Full body shown in the article window. Paragraphs separated by a blank line. */
  content: string;
  /** Optional small tag, e.g. "Growth", "Case Study". */
  category?: string;
  /** ISO date string, e.g. "2026-06-15". */
  date?: string;
  /** Cover image. Falls back to a placeholder icon when omitted. */
  image?: string;
  /** Optional outbound link — rendered as a CTA (and on the image) inside the article window. */
  link?: ArticleLink;
}

export interface ArticlesFeed {
  articles: Article[];
  }
