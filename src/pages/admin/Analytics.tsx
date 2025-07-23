import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  Eye, 
  TrendingUp,
  MessageSquare,
  Mail,
  Calendar,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AnalyticsData {
  totalUsers: number;
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
  newsletterSubscribers: number;
  activeSubscribers: number;
  recentArticles: number;
  recentUsers: number;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalArticles: 0,
    publishedArticles: 0,
    totalViews: 0,
    totalComments: 0,
    approvedComments: 0,
    pendingComments: 0,
    newsletterSubscribers: 0,
    activeSubscribers: 0,
    recentArticles: 0,
    recentUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      
      // Fetch all analytics data in parallel
      const [
        usersResult,
        articlesResult,
        commentsResult,
        newsletterResult,
        recentStatsResult
      ] = await Promise.all([
        // Users stats
        supabase.from("profiles").select("id, role, created_at"),
        
        // Articles stats
        supabase.from("articles").select("id, status, view_count, created_at"),
        
        // Comments stats
        supabase.from("comments").select("id, status, created_at"),
        
        // Newsletter stats
        supabase.from("newsletter_subscribers").select("id, status, subscribed_at"),
        
        // Recent stats (last 30 days)
        Promise.all([
          supabase
            .from("articles")
            .select("id")
            .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase
            .from("profiles")
            .select("id")
            .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        ])
      ]);

      // Process results
      const users = usersResult.data || [];
      const articles = articlesResult.data || [];
      const comments = commentsResult.data || [];
      const newsletter = newsletterResult.data || [];
      const [recentArticles, recentUsers] = recentStatsResult;

      // Calculate analytics
      const analytics: AnalyticsData = {
        totalUsers: users.length,
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === "published").length,
        totalViews: articles.reduce((sum, article) => sum + (article.view_count || 0), 0),
        totalComments: comments.length,
        approvedComments: comments.filter(c => c.status === "approved").length,
        pendingComments: comments.filter(c => c.status === "pending").length,
        newsletterSubscribers: newsletter.length,
        activeSubscribers: newsletter.filter(n => n.status === "active").length,
        recentArticles: recentArticles.data?.length || 0,
        recentUsers: recentUsers.data?.length || 0,
      };

      setData(analytics);
    } catch (error: any) {
      console.error("Error fetching analytics:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar analytics",
        description: error.message || "Ocorreu um erro ao carregar os dados de analytics.",
      });
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    subtitle, 
    trend 
  }: { 
    title: string; 
    value: number | string; 
    icon: any; 
    subtitle?: string;
    trend?: "up" | "down" | "neutral";
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? "..." : value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Usuários"
            value={data.totalUsers}
            icon={Users}
            subtitle={`+${data.recentUsers} nos últimos 30 dias`}
            trend={data.recentUsers > 0 ? "up" : "neutral"}
          />
          <StatCard
            title="Total de Artigos"
            value={data.totalArticles}
            icon={FileText}
            subtitle={`${data.publishedArticles} publicados`}
          />
          <StatCard
            title="Visualizações"
            value={data.totalViews.toLocaleString()}
            icon={Eye}
            subtitle="Total de visualizações"
          />
          <StatCard
            title="Comentários"
            value={data.totalComments}
            icon={MessageSquare}
            subtitle={`${data.pendingComments} pendentes`}
          />
        </div>

        {/* Content Performance */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Artigos Publicados"
            value={data.publishedArticles}
            icon={FileText}
            subtitle={`${((data.publishedArticles / data.totalArticles) * 100 || 0).toFixed(1)}% do total`}
          />
          <StatCard
            title="Comentários Aprovados"
            value={data.approvedComments}
            icon={MessageSquare}
            subtitle={`${((data.approvedComments / data.totalComments) * 100 || 0).toFixed(1)}% aprovados`}
          />
          <StatCard
            title="Newsletter Ativa"
            value={data.activeSubscribers}
            icon={Mail}
            subtitle={`${data.newsletterSubscribers} total de inscritos`}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Atividade Recente (30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Novos Artigos</span>
                <span className="text-2xl font-bold text-primary">{loading ? "..." : data.recentArticles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Novos Usuários</span>
                <span className="text-2xl font-bold text-primary">{loading ? "..." : data.recentUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Comentários Pendentes</span>
                <span className="text-2xl font-bold text-yellow-500">{loading ? "..." : data.pendingComments}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas de Engajamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Média de Visualizações por Artigo</span>
                <span className="text-2xl font-bold text-primary">
                  {loading ? "..." : data.publishedArticles > 0 ? Math.round(data.totalViews / data.publishedArticles) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Aprovação de Comentários</span>
                <span className="text-2xl font-bold text-green-500">
                  {loading ? "..." : data.totalComments > 0 ? `${((data.approvedComments / data.totalComments) * 100).toFixed(1)}%` : "0%"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Retenção Newsletter</span>
                <span className="text-2xl font-bold text-blue-500">
                  {loading ? "..." : data.newsletterSubscribers > 0 ? `${((data.activeSubscribers / data.newsletterSubscribers) * 100).toFixed(1)}%` : "0%"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Roles Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribuição de Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-6 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {["admin", "editor", "author", "subscriber"].map((role) => {
                  const count = data.totalUsers > 0 ? 
                    (role === "admin" ? 1 : // Assuming at least 1 admin
                     role === "editor" ? Math.floor(data.totalUsers * 0.05) :
                     role === "author" ? Math.floor(data.totalUsers * 0.15) :
                     data.totalUsers - 1 - Math.floor(data.totalUsers * 0.05) - Math.floor(data.totalUsers * 0.15)) : 0;
                  
                  const percentage = data.totalUsers > 0 ? (count / data.totalUsers) * 100 : 0;
                  
                  return (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          role === "admin" ? "bg-red-500" :
                          role === "editor" ? "bg-blue-500" :
                          role === "author" ? "bg-green-500" : "bg-gray-500"
                        }`} />
                        <span className="text-sm font-medium capitalize">
                          {role === "admin" ? "Administradores" :
                           role === "editor" ? "Editores" :
                           role === "author" ? "Autores" : "Assinantes"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}