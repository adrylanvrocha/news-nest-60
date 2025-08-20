'use client';

import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Article } from "@/lib/types";

interface UseArticlesOptions {
  status?: 'published' | 'draft' | 'archived';
  categoryId?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export const useArticles = (options: UseArticlesOptions = {}) => {
  const supabase = createBrowserSupabaseClient();
  
  return useQuery({
    queryKey: ['articles', options],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (
            first_name,
            last_name
          ),
          categories (
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options.featured !== undefined) {
        query = query.eq('is_featured', options.featured);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Article[];
    },
  });
};

export const useFeaturedArticle = () => {
  const supabase = createBrowserSupabaseClient();
  
  return useQuery({
    queryKey: ['featured-article'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (
            first_name,
            last_name
          ),
          categories (
            name,
            slug
          )
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Article | null;
    },
  });
};