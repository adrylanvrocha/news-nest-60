'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Users, Eye, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const data = [
  { name: 'Jan', articles: 4, views: 2400 },
  { name: 'Fev', articles: 3, views: 1398 },
  { name: 'Mar', articles: 6, views: 9800 },
  { name: 'Abr', articles: 8, views: 3908 },
  { name: 'Mai', articles: 5, views: 4800 },
  { name: 'Jun', articles: 7, views: 3800 },
];

export default function AdminDashboard() {
  const supabase = createBrowserSupabaseClient();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [articlesResult, podcastsResult, usersResult] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact' }),
        supabase.from('podcasts').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
      ]);

      return {
        articles: articlesResult.count || 0,
        podcasts: podcastsResult.count || 0,
        users: usersResult.count || 0,
      };
    },
  });

  const { data: recentArticles } = useQuery({
    queryKey: ['recent-articles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('articles')
        .select(`
          *,
          profiles:author_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu portal de notícias
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/articles/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Artigo
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Artigos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.articles || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visualizações
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,391</div>
            <p className="text-xs text-muted-foreground">
              +8% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Crescimento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              +4% desde o mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Mensais</CardTitle>
            <CardDescription>
              Artigos publicados e visualizações por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="articles" fill="hsl(var(--primary))" />
                <Bar dataKey="views" fill="hsl(var(--muted))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artigos Recentes</CardTitle>
            <CardDescription>
              Os 5 artigos mais recentemente criados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles?.map((article) => (
                <div key={article.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{article.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Por {article.profiles?.first_name} {article.profiles?.last_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!recentArticles || recentArticles.length === 0) && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum artigo encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}