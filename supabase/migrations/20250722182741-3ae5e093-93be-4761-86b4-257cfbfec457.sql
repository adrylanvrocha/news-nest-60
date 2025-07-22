
-- Create Enums
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'author', 'subscriber');
CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.media_type AS ENUM ('image', 'video', 'audio', 'document');
CREATE TYPE public.banner_position AS ENUM ('top', 'sidebar', 'between_articles', 'footer');

-- Create Tables
-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'subscriber',
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Categories Table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Media Table
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  media_type media_type NOT NULL,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  alt_text TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Articles Table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  status post_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  featured_image UUID REFERENCES public.media(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Podcasts Table
CREATE TABLE public.podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  audio_file UUID REFERENCES public.media(id) ON DELETE SET NULL,
  duration TEXT,
  transcription TEXT,
  status post_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  cover_image UUID REFERENCES public.media(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. Tags Table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 7. Article Tags Junction Table
CREATE TABLE public.article_tags (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 8. Podcast Tags Junction Table
CREATE TABLE public.podcast_tags (
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (podcast_id, tag_id)
);

-- 9. Comments Table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CHECK (
    (article_id IS NOT NULL AND podcast_id IS NULL) OR
    (article_id IS NULL AND podcast_id IS NOT NULL)
  )
);

-- 10. Newsletters Table
CREATE TABLE public.newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_confirmed BOOLEAN DEFAULT false,
  confirmation_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 11. Banner Ads Table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
  url TEXT,
  position banner_position NOT NULL,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a function to handle new user creation and automatically create a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (new.id, '', '', 'subscriber');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Security Policies

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles Policies
-- Anyone can read published profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profiles
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins and editors can update any profile
CREATE POLICY "Admins and editors can update any profile" ON public.profiles
  FOR UPDATE USING (get_user_role() IN ('admin', 'editor'));

-- Categories Policies
-- Anyone can read categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Only admins and editors can create/update/delete categories
CREATE POLICY "Admins and editors can create categories" ON public.categories
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admins and editors can update categories" ON public.categories
  FOR UPDATE USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admins and editors can delete categories" ON public.categories
  FOR DELETE USING (get_user_role() IN ('admin', 'editor'));

-- Media Policies
-- Anyone can view media
CREATE POLICY "Media is viewable by everyone" ON public.media
  FOR SELECT USING (true);

-- Authenticated users can upload media
CREATE POLICY "Authenticated users can upload media" ON public.media
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update/delete their own media
CREATE POLICY "Users can update their own media" ON public.media
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media" ON public.media
  FOR DELETE USING (auth.uid() = user_id);

-- Admins and editors can update/delete any media
CREATE POLICY "Admins and editors can update any media" ON public.media
  FOR UPDATE USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admins and editors can delete any media" ON public.media
  FOR DELETE USING (get_user_role() IN ('admin', 'editor'));

-- Articles Policies
-- Anyone can read published articles
CREATE POLICY "Published articles are viewable by everyone" ON public.articles
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id OR get_user_role() IN ('admin', 'editor'));

-- Authors, editors, and admins can create articles
CREATE POLICY "Authors, editors, and admins can create articles" ON public.articles
  FOR INSERT WITH CHECK (get_user_role() IN ('author', 'editor', 'admin'));

-- Authors can update their own articles
CREATE POLICY "Authors can update their own articles" ON public.articles
  FOR UPDATE USING (auth.uid() = author_id);

-- Editors and admins can update any article
CREATE POLICY "Editors and admins can update any article" ON public.articles
  FOR UPDATE USING (get_user_role() IN ('editor', 'admin'));

-- Only admins can delete articles
CREATE POLICY "Only admins can delete articles" ON public.articles
  FOR DELETE USING (get_user_role() = 'admin');

-- Podcasts Policies (similar to articles)
CREATE POLICY "Published podcasts are viewable by everyone" ON public.podcasts
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id OR get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Authors, editors, and admins can create podcasts" ON public.podcasts
  FOR INSERT WITH CHECK (get_user_role() IN ('author', 'editor', 'admin'));

CREATE POLICY "Authors can update their own podcasts" ON public.podcasts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Editors and admins can update any podcast" ON public.podcasts
  FOR UPDATE USING (get_user_role() IN ('editor', 'admin'));

CREATE POLICY "Only admins can delete podcasts" ON public.podcasts
  FOR DELETE USING (get_user_role() = 'admin');

-- Tags Policies
CREATE POLICY "Tags are viewable by everyone" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Authors, editors, and admins can create tags" ON public.tags
  FOR INSERT WITH CHECK (get_user_role() IN ('author', 'editor', 'admin'));

CREATE POLICY "Editors and admins can update tags" ON public.tags
  FOR UPDATE USING (get_user_role() IN ('editor', 'admin'));

CREATE POLICY "Only admins can delete tags" ON public.tags
  FOR DELETE USING (get_user_role() = 'admin');

-- Article Tags and Podcast Tags Policies
CREATE POLICY "Article tags are viewable by everyone" ON public.article_tags
  FOR SELECT USING (true);

CREATE POLICY "Authors, editors, and admins can create article tags" ON public.article_tags
  FOR INSERT WITH CHECK (
    get_user_role() IN ('author', 'editor', 'admin') AND 
    EXISTS (SELECT 1 FROM public.articles WHERE id = article_id AND (author_id = auth.uid() OR get_user_role() IN ('editor', 'admin')))
  );

CREATE POLICY "Podcast tags are viewable by everyone" ON public.podcast_tags
  FOR SELECT USING (true);

CREATE POLICY "Authors, editors, and admins can create podcast tags" ON public.podcast_tags
  FOR INSERT WITH CHECK (
    get_user_role() IN ('author', 'editor', 'admin') AND 
    EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND (author_id = auth.uid() OR get_user_role() IN ('editor', 'admin')))
  );

-- Comments Policies
CREATE POLICY "Approved comments are viewable by everyone" ON public.comments
  FOR SELECT USING (is_approved OR auth.uid() = user_id OR get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Editors and admins can update any comment" ON public.comments
  FOR UPDATE USING (get_user_role() IN ('editor', 'admin'));

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Editors and admins can delete any comment" ON public.comments
  FOR DELETE USING (get_user_role() IN ('editor', 'admin'));

-- Newsletters Policies
CREATE POLICY "Newsletters are viewable by admins and editors" ON public.newsletters
  FOR SELECT USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins and editors can update newsletters" ON public.newsletters
  FOR UPDATE USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Only admins can delete newsletter subscribers" ON public.newsletters
  FOR DELETE USING (get_user_role() = 'admin');

-- Banners Policies
CREATE POLICY "Banners are viewable by everyone" ON public.banners
  FOR SELECT USING (true);

CREATE POLICY "Only admins and editors can create banners" ON public.banners
  FOR INSERT WITH CHECK (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Only admins and editors can update banners" ON public.banners
  FOR UPDATE USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Only admins can delete banners" ON public.banners
  FOR DELETE USING (get_user_role() = 'admin');

-- Create initial data - Default categories
INSERT INTO public.categories (name, slug, description, color)
VALUES 
  ('Política', 'politica', 'Notícias sobre política nacional e internacional', '#FF0000'),
  ('Mundo', 'mundo', 'Notícias internacionais', '#0000FF'),
  ('Cultura', 'cultura', 'Notícias sobre arte, literatura e cultura', '#00FF00'),
  ('Entretenimento', 'entretenimento', 'Notícias sobre celebridades, cinema e TV', '#FFFF00'),
  ('Podcasts', 'podcasts', 'Podcasts exclusivos do Frances News', '#FF00FF');

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'Media Files', true);

-- Create RLS policy to allow public access to media bucket
CREATE POLICY "Media files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Create RLS policy to allow authenticated users to upload to media bucket
CREATE POLICY "Authenticated users can upload media files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Create RLS policy to allow users to update their own files
CREATE POLICY "Users can update their own media files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.uid()::text = owner);

-- Create RLS policy to allow users to delete their own files
CREATE POLICY "Users can delete their own media files" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.uid()::text = owner);
