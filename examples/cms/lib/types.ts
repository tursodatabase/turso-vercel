export interface Author {
  id: number;
  slug: string;
  name: string;
  bio: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  status: "draft" | "published";
  author_id: number;
  published_at: string | null;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author_name: string;
  author_slug: string;
}

export interface PostWithDetails extends PostWithAuthor {
  categories: Category[];
}
