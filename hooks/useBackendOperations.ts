'use client';

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export interface ArticleOperationData {
  title?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  featuredImageUrl?: string;
}

export interface AnalyticsData {
  timeSpent?: number;
  scrollDepth?: number;
  source?: string;
}

export const useBackendOperations = () => {
  const supabase = createBrowserSupabaseClient();
  
  // Article operations through backend
  const articleOperations = {
    async create(data: ArticleOperationData) {
      const { data: result, error } = await supabase.functions.invoke('article-operations', {
        body: {
          action: 'create',
          data
        }
      });

      if (error) throw error;
      return result;
    },

    async publish(articleId: string) {
      const { data: result, error } = await supabase.functions.invoke('article-operations', {
        body: {
          action: 'publish',
          articleId
        }
      });

      if (error) throw error;
      return result;
    },

    async feature(articleId: string) {
      const { data: result, error } = await supabase.functions.invoke('article-operations', {
        body: {
          action: 'feature',
          articleId
        }
      });

      if (error) throw error;
      return result;
    },

    async delete(articleId: string) {
      const { data: result, error } = await supabase.functions.invoke('article-operations', {
        body: {
          action: 'delete',
          articleId
        }
      });

      if (error) throw error;
      return result;
    }
  };

  // Analytics operations through backend
  const analytics = {
    async trackView(contentType: 'article' | 'podcast', contentId: string) {
      const { data: result, error } = await supabase.functions.invoke('content-analytics', {
        body: {
          action: 'view',
          contentType,
          contentId
        }
      });

      if (error) throw error;
      return result;
    },

    async trackEngagement(
      contentType: 'article' | 'podcast', 
      contentId: string, 
      data: AnalyticsData
    ) {
      const { data: result, error } = await supabase.functions.invoke('content-analytics', {
        body: {
          action: 'engagement',
          contentType,
          contentId,
          data
        }
      });

      if (error) throw error;
      return result;
    },

    async getReport() {
      const { data: result, error } = await supabase.functions.invoke('content-analytics', {
        body: {
          action: 'report'
        }
      });

      if (error) throw error;
      return result;
    }
  };

  // User management operations through backend
  const userManagement = {
    async promoteUser(userId: string, role: 'admin' | 'editor' | 'subscriber') {
      const { data: result, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'promote',
          userId,
          role
        }
      });

      if (error) throw error;
      return result;
    },

    async banUser(userId: string) {
      const { data: result, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'ban',
          userId
        }
      });

      if (error) throw error;
      return result;
    },

    async getUserStats() {
      const { data: result, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'get_stats'
        }
      });

      if (error) throw error;
      return result;
    }
  };

  return {
    articleOperations,
    analytics,
    userManagement
  };
};