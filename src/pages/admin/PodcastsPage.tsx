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
  ArrowUpDown,
  Play
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Podcast } from "@/lib/types";

type PodcastWithRelations = Podcast & {
  categories?: { name: string } | null;
  profiles?: { first_name: string | null; last_name: string | null } | null;
};

type SortField = "title" | "created_at" | "published_at" | "status";
type SortDirection = "asc" | "desc";

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<PodcastWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPodcasts();
  }, [sortField, sortDirection]);

  async function fetchPodcasts() {
    try {
      setLoading(true);
      
      let query = supabase
        .from("podcasts")
        .select(`
          *,
          categories:category_id (name),
          profiles:author_id (first_name, last_name)
        `)
        .order(sortField, { ascending: sortDirection === "asc" });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setPodcasts(data as PodcastWithRelations[]);
    } catch (error: any) {
      console.error("Error fetching podcasts:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar podcasts",
        description: error.message || "Ocorreu um erro ao carregar os podcasts.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredPodcasts = podcasts.filter(podcast => 
    podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    podcast.slug.toLowerCase().includes(searchQuery.toLowerCase())
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

  const formatDuration = (duration: number | null) => {
    if (!duration) return "—";
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  const handleDeletePodcast = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este podcast?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("podcasts")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Podcast excluído",
        description: "O podcast foi excluído com sucesso.",
      });
      
      setPodcasts(podcasts.filter(podcast => podcast.id !== id));
    } catch (error: any) {
      console.error("Error deleting podcast:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir podcast",
        description: error.message || "Ocorreu um erro ao excluir o podcast.",
      });
    }
  };

  return (
    <AdminLayout title="Gerenciar Podcasts">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar podcasts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={() => navigate("/admin/podcasts/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Podcast
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
              <TableHead>Duração</TableHead>
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
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {Array.from({ length: 8 }).map((_, cellIndex) => (
                    <TableCell key={`loading-cell-${cellIndex}`}>
                      <div className="h-5 bg-muted rounded animate-pulse w-full max-w-[150px]"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredPodcasts.length > 0 ? (
              filteredPodcasts.map((podcast) => (
                <TableRow key={podcast.id}>
                  <TableCell className="font-medium">{podcast.title}</TableCell>
                  <TableCell>{podcast.categories?.name || "—"}</TableCell>
                  <TableCell>
                    {podcast.profiles ? (
                      `${podcast.profiles.first_name || ""} ${podcast.profiles.last_name || ""}`.trim() || "—"
                    ) : "—"}
                  </TableCell>
                  <TableCell>{formatDuration(podcast.duration)}</TableCell>
                  <TableCell>{getStatusBadge(podcast.status as 'draft' | 'published' | 'archived')}</TableCell>
                  <TableCell>{formatDate(podcast.published_at)}</TableCell>
                  <TableCell>{formatDate(podcast.created_at)}</TableCell>
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
                        <DropdownMenuItem onClick={() => navigate(`/podcast/${podcast.slug}`)}>
                          <Play className="mr-2 h-4 w-4" />
                          Ouvir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/podcasts/${podcast.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeletePodcast(podcast.id)}
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
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhum podcast encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}