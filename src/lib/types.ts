// Common types for the application
export type UserRole = 'admin' | 'editor' | 'author' | 'subscriber';

export type Article = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featured_image_url?: string;
  author_id: string;
  category_id?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  view_count: number;
  is_featured: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Podcast = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  audio_url?: string;
  thumbnail_url?: string;
  author_id: string;
  category_id?: string;
  duration?: number;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  view_count: number;
  is_featured: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  content: string;
  author_id: string;
  article_id?: string;
  podcast_id?: string;
  parent_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};