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

export interface ArticleImage {
  /**
   * Referenced by a `[[image:ID]]` token placed on its own paragraph
   * (i.e. surrounded by blank lines) inside `content`, to control exactly
   * where that image renders in the article body.
   *
   * Any image in `images` that no token in `content` refers to is placed
   * automatically at the top of the article, in array order — so a single
   * cover-image article needs zero markup, and only articles that want
   * images interleaved with specific paragraphs need tokens at all.
   */
  id: string;
  url: string;
  alt?: string;
  /** Optional caption shown under the image on the article page. */
  caption?: string;
}

export interface Article {
  /** Unique slug — used as the permalink segment: /articles/{id}/ */
  id: string;
  title: string;
  /** Short teaser shown on the card. */
  excerpt: string;
  /**
   * Full body shown on the article's own page. Paragraphs separated by a
   * blank line. May contain `[[image:ID]]` tokens (see ArticleImage) to
   * place images at exact points in the flow.
   */
  content: string;
  /** ISO date string, e.g. "2026-06-15". */
  date?: string;
  /** Ordered list of images used by this article — see ArticleImage. */
  images?: ArticleImage[];
  /** Optional outbound link — rendered as a CTA on the article page. */
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
