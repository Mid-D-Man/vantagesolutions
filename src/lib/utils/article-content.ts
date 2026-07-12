import type { Article, ArticleImage } from '$lib/types/article';

export type ArticleBlock = { type: 'text'; text: string } | { type: 'image'; image: ArticleImage };

// Matches a paragraph that contains *only* an image token, e.g. "[[image:kitchen-counter]]".
// The token must be on its own line/paragraph (blank lines on both sides, same as any
// other paragraph break) — it isn't parsed out of the middle of a sentence.
const IMAGE_TOKEN = /^\[\[image:([\w-]+)\]\]$/;

/**
 * Splits an article's `content` into an ordered list of text/image blocks, ready to render.
 *
 * Placement rules:
 * - To put an image at an exact point in the article, add a paragraph in `content`
 *   containing only `[[image:ID]]`, where ID matches an `id` in `article.images`.
 * - Any image in `article.images` that no token refers to is placed at the very top
 *   of the article automatically, in array order. This is the default — a simple
 *   single-image article needs no tokens in its content at all.
 * - A token referencing an id that doesn't exist in `images` is dropped silently
 *   rather than rendering broken markup.
 */
export function parseArticleBlocks(article: Pick<Article, 'content' | 'images'>): ArticleBlock[] {
  const images = article.images ?? [];
  const paragraphs = article.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const usedIds = new Set<string>();
  const blocks: ArticleBlock[] = [];

  for (const para of paragraphs) {
    const match = para.match(IMAGE_TOKEN);
    if (match) {
      const image = images.find((img) => img.id === match[1]);
      if (image) {
        blocks.push({ type: 'image', image });
        usedIds.add(image.id);
      }
      continue;
    }
    blocks.push({ type: 'text', text: para });
  }

  const unplaced = images.filter((img) => !usedIds.has(img.id));
  if (unplaced.length) {
    blocks.unshift(...unplaced.map((image): ArticleBlock => ({ type: 'image', image })));
  }

  return blocks;
}
