
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Headphones, 
  MessageSquare, 
  Users,
  TrendingUp,
  Calendar
} from "lucide-react";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    articles: 0,
    podcasts: 0,
    comments: 0,
    users: 0,
    views: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get article count
        const { count: articlesCount, error: articlesError } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true });
          
        if (articlesError) throw articlesError;
        
        // Get podcast count
        const { count: podcastsCount, error: podcastsError } = await supabase
          .from('podcasts')
          .select('*', { count: 'exact', head: true });
          
        if (podcastsError) throw podcastsError;
        
        // Get comments count
        const { count: commentsCount, error: commentsError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true });
          
        if (commentsError) throw commentsError;
        
        // Get users count (admins only)
        let usersCount = 0;
        if (profile?.role === 'admin') {
          const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
            
          if (error) throw error;
          usersCount = count || 0;
        }
        
        // Calculate total views
        const { data: articlesData, error: viewsError } = await supabase
          .from('articles')
          .select('view_count');
          
        if (viewsError) throw viewsError;
        
        const { data: podcastsData, error: podcastViewsError } = await supabase
          .from('podcasts')
          .select('view_count');
          
        if (podcastViewsError) throw podcastViewsError;
        
        const totalViews = 
          (articlesData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0) +
          (podcastsData?.reduce((sum, podcast) => sum + (podcast.view_count || 0), 0) || 0);
        
        setStats({
          articles: articlesCount || 0,
          podcasts: podcastsCount || 0,
          comments: commentsCount || 0,
          users: usersCount,
          views: totalViews
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [profile?.role]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo(a), {profile?.first_name || 'Usuário'}</h2>
        <p className="text-muted-foreground">
          Hoje é {formatDate(new Date())}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Artigos" 
          value={loading ? '-' : stats.articles.toString()} 
          icon={<FileText className="h-6 w-6 text-blue-500" />} 
          loading={loading}
        />
        <StatCard 
          title="Podcasts" 
          value={loading ? '-' : stats.podcasts.toString()} 
          icon={<Headphones className="h-6 w-6 text-purple-500" />} 
          loading={loading}
        />
        <StatCard 
          title="Comentários" 
          value={loading ? '-' : stats.comments.toString()} 
          icon={<MessageSquare className="h-6 w-6 text-green-500" />} 
          loading={loading}
        />
        {profile?.role === 'admin' && (
          <StatCard 
            title="Usuários" 
            value={loading ? '-' : stats.users.toString()} 
            icon={<Users className="h-6 w-6 text-amber-500" />} 
            loading={loading}
          />
        )}
        <StatCard 
          title="Visualizações" 
          value={loading ? '-' : stats.views.toString()} 
          icon={<TrendingUp className="h-6 w-6 text-red-500" />} 
          loading={loading}
        />
      </div>
      
      {/* Add a recent content section here later */}
    </AdminLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function StatCard({ title, value, icon, loading = false }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  );
}
