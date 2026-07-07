import type { PageLoad } from './$types';
import type { Article, ArticlesFeed, Category } from '$lib/types/article';

// Article ids come from a JSON file that changes without a rebuild, so we
// can't enumerate them at build time — this route is served live instead
// of being prerendered like the rest of the site.
export const prerender = false;

const FEED_URL =
  'https://raw.githubusercontent.com/Mid-D-Man/vantagesolutions/main/content/articles.json';

export type ArticlePageStatus = 'success' | 'notfound' | 'error';

export interface ArticlePageData {
  status: ArticlePageStatus;
  article: Article | null;
  categoryId: string;
  categoryName: string;
}

export const load: PageLoad<ArticlePageData> = async ({ params, fetch }) => {
  try {
    const res = await fetch(FEED_URL, { cache: 'no-store' });
    if (!res.ok) {
      return { status: 'error', article: null, categoryId: '', categoryName: '' };
    }

    const data = (await res.json()) as ArticlesFeed;
    const categories: Category[] = Array.isArray(data?.categories) ? data.categories : [];

    let article: Article | null = null;
    let categoryId = '';
    let categoryName = '';

    for (const category of categories) {
      const match = (category.articles ?? []).find((a) => a.id === params.id);
      if (match) {
        article = match;
        categoryId = category.id;
        categoryName = category.name;
        break;
      }
    }

    return {
      status: article ? 'success' : 'notfound',
      article,
      categoryId,
      categoryName
    };
  } catch (err) {
    console.error('Failed to load article:', err);
    return { status: 'error', article: null, categoryId: '', categoryName: '' };
  }
};
