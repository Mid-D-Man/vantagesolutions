// Types for the article feed. The feed itself lives outside the build
// (see src/lib/components/Articles.svelte header comment) as a JSON file
// fetched at runtime — this file just describes its shape.
//
// Schema: categories own articles. A category has an id/name/description
// and a list of articles. Adding a new category is just adding a new
// object to the `categories` array in content/articles.json — no code
// changes required, the landing page renders however many exist.

export interface ArticleLink {
  url: string;
  /** Button text on the article page. Defaults to "Read Full Article" if omitted. */
  label?: string;
}

export interface Article {
  /** Unique slug — used as the permalink segment: /articles/{id}/ */
  id: string;
  title: string;
  /** Short teaser shown on the card. */
  excerpt: string;
  /** Full body shown on the article's own page. Paragraphs separated by a blank line. */
  content: string;
  /** ISO date string, e.g. "2026-06-15". */
  date?: string;
  /** Cover image. Falls back to a placeholder icon when omitted. */
  image?: string;
  /** Optional outbound link — rendered as a CTA (and on the image) on the article page. */
  link?: ArticleLink;
}

export interface Category {
  /** Unique slug for the category, e.g. "systems", "growth". */
  id: string;
  /** Display name, e.g. "Systems", "Growth". */
  name: string;
  /** Optional one-line blurb shown under the category heading. */
  description?: string;
  articles: Article[];
}

export interface ArticlesFeed {
  categories: Category[];
}

/** An Article joined with its parent category's id/name — used on the article's own page. */
export interface ArticleWithCategory extends Article {
  categoryId: string;
  categoryName: string;
}
