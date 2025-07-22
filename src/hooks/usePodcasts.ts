
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Podcast } from "@/lib/types";

interface UsePodcastsOptions {
  status?: 'published' | 'draft' | 'archived';
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export const usePodcasts = (options: UsePodcastsOptions = {}) => {
  return useQuery({
    queryKey: ['podcasts', options],
    queryFn: async () => {
      let query = supabase
        .from('podcasts')
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
      return data as Podcast[];
    },
  });
};
