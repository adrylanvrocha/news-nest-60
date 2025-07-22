
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash, 
  Search,
  ArrowUpDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  categories: { name: string } | null;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

type SortField = "title" | "created_at" | "published_at" | "status";
type SortDirection = "asc" | "desc";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, [sortField, sortDirection]);

  async function fetchArticles() {
    try {
      setLoading(true);
      
      let query = supabase
        .from("articles")
        .select(`
          *,
          categories:category_id (name),
          profiles:author_id (first_name, last_name)
        `)
        .order(sortField, { ascending: sortDirection === "asc" });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setArticles(data as Article[]);
    } catch (error: any) {
      console.error("Error fetching articles:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar artigos",
        description: error.message || "Ocorreu um erro ao carregar os artigos. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to desc
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (status: "draft" | "published" | "archived") => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="bg-green-500">Publicado</Badge>;
      case "draft":
        return <Badge variant="outline">Rascunho</Badge>;
      case "archived":
        return <Badge variant="secondary">Arquivado</Badge>;
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este artigo?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Artigo excluído",
        description: "O artigo foi excluído com sucesso.",
      });
      
      // Remove from local state
      setArticles(articles.filter(article => article.id !== id));
    } catch (error: any) {
      console.error("Error deleting article:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir artigo",
        description: error.message || "Ocorreu um erro ao excluir o artigo. Tente novamente.",
      });
    }
  };

  return (
    <AdminLayout title="Gerenciar Artigos">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar artigos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={() => navigate("/admin/articles/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Artigo
        </Button>
      </div>
      
      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <button 
                  className="flex items-center hover:text-primary transition-colors"
                  onClick={() => handleSort("title")}
                >
                  Título
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-primary transition-colors"
                  onClick={() => handleSort("status")}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-primary transition-colors"
                  onClick={() => handleSort("published_at")}
                >
                  Publicado em
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button 
                  className="flex items-center hover:text-primary transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  Criado em
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {Array.from({ length: 7 }).map((_, cellIndex) => (
                    <TableCell key={`loading-cell-${cellIndex}`}>
                      <div className="h-5 bg-muted rounded animate-pulse w-full max-w-[150px]"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredArticles.length > 0 ? (
              // Actual data
              filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.categories?.name || "—"}</TableCell>
                  <TableCell>
                    {article.profiles ? (
                      `${article.profiles.first_name || ""} ${article.profiles.last_name || ""}`.trim() || "—"
                    ) : "—"}
                  </TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell>{formatDate(article.published_at)}</TableCell>
                  <TableCell>{formatDate(article.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/article/${article.slug}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/articles/${article.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // No results
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum artigo encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
