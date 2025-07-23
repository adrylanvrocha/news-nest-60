import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Eye, 
  Trash, 
  Search,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Comment } from "@/lib/types";

type CommentWithRelations = Comment & {
  profiles?: { first_name: string | null; last_name: string | null } | null;
  articles?: { title: string; slug: string } | null;
  podcasts?: { title: string; slug: string } | null;
};

type CommentStatus = "pending" | "approved" | "rejected";

export default function Comments() {
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommentStatus | "all">("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:author_id (first_name, last_name),
          articles:article_id (title, slug),
          podcasts:podcast_id (title, slug)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setComments(data as CommentWithRelations[]);
    } catch (error: any) {
      console.error("Error fetching comments:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar comentários",
        description: error.message || "Ocorreu um erro ao carregar os comentários.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (commentId: string, newStatus: CommentStatus) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ status: newStatus })
        .eq("id", commentId);
      
      if (error) throw error;
      
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, status: newStatus } : comment
      ));
      
      const statusMap = {
        approved: "aprovado",
        rejected: "rejeitado",
        pending: "pendente"
      };
      
      toast({
        title: "Status atualizado",
        description: `Comentário ${statusMap[newStatus]} com sucesso.`,
      });
    } catch (error: any) {
      console.error("Error updating comment status:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro ao atualizar o status do comentário.",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este comentário?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
        
      if (error) throw error;
      
      toast({
        title: "Comentário excluído",
        description: "O comentário foi excluído com sucesso.",
      });
      
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error: any) {
      console.error("Error deleting comment:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir comentário",
        description: error.message || "Ocorreu um erro ao excluir o comentário.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: CommentStatus) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-500">Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeitado</Badge>;
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getStatusIcon = (status: CommentStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comment.profiles?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (comment.profiles?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getAuthorName = (comment: CommentWithRelations) => {
    if (comment.profiles?.first_name || comment.profiles?.last_name) {
      return `${comment.profiles.first_name || ""} ${comment.profiles.last_name || ""}`.trim();
    }
    return "Usuário anônimo";
  };

  const getContentSource = (comment: CommentWithRelations) => {
    if (comment.articles) {
      return { type: "Artigo", title: comment.articles.title, slug: comment.articles.slug };
    }
    if (comment.podcasts) {
      return { type: "Podcast", title: comment.podcasts.title, slug: comment.podcasts.slug };
    }
    return { type: "Desconhecido", title: "—", slug: "" };
  };

  return (
    <AdminLayout title="Gerenciar Comentários">
      <div className="space-y-6">
        {/* Header with search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar comentários..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CommentStatus | "all")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { status: "pending", label: "Pendentes", count: comments.filter(c => c.status === "pending").length },
            { status: "approved", label: "Aprovados", count: comments.filter(c => c.status === "approved").length },
            { status: "rejected", label: "Rejeitados", count: comments.filter(c => c.status === "rejected").length },
          ].map((stat) => (
            <div key={stat.status} className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(stat.status as CommentStatus)}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comments Table */}
        <div className="bg-card rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Comentário</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    {Array.from({ length: 6 }).map((_, cellIndex) => (
                      <TableCell key={`loading-cell-${cellIndex}`}>
                        <div className="h-5 bg-muted rounded animate-pulse w-full max-w-[150px]"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredComments.length > 0 ? (
                filteredComments.map((comment) => {
                  const source = getContentSource(comment);
                  return (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-3">{comment.content}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{getAuthorName(comment)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{source.type}</p>
                          <p className="text-sm text-muted-foreground">{source.title}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(comment.status as CommentStatus)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(comment.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Moderar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(comment.id, "approved")}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Aprovar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(comment.id, "rejected")}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              Rejeitar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(comment.id, "pending")}>
                              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                              Marcar como Pendente
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum comentário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}