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
  Trash, 
  Search,
  Mail,
  UserX,
  Users,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  subscribed_at: string;
  unsubscribed_at: string | null;
};

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      
      if (error) throw error;
      
      setSubscribers((data || []) as NewsletterSubscriber[]);
    } catch (error: any) {
      console.error("Error fetching subscribers:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar assinantes",
        description: error.message || "Ocorreu um erro ao carregar os assinantes.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleUnsubscribe = async (subscriberId: string) => {
    if (!window.confirm("Tem certeza que deseja cancelar a inscrição deste usuário?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ 
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString()
        })
        .eq("id", subscriberId);
        
      if (error) throw error;
      
      toast({
        title: "Inscrição cancelada",
        description: "A inscrição foi cancelada com sucesso.",
      });
      
      setSubscribers(subscribers.map(sub => 
        sub.id === subscriberId 
          ? { ...sub, status: "unsubscribed" as const, unsubscribed_at: new Date().toISOString() }
          : sub
      ));
    } catch (error: any) {
      console.error("Error unsubscribing user:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao cancelar inscrição",
        description: error.message || "Ocorreu um erro ao cancelar a inscrição.",
      });
    }
  };

  const handleResubscribe = async (subscriberId: string) => {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ 
          status: "active",
          unsubscribed_at: null
        })
        .eq("id", subscriberId);
        
      if (error) throw error;
      
      toast({
        title: "Inscrição reativada",
        description: "A inscrição foi reativada com sucesso.",
      });
      
      setSubscribers(subscribers.map(sub => 
        sub.id === subscriberId 
          ? { ...sub, status: "active" as const, unsubscribed_at: null }
          : sub
      ));
    } catch (error: any) {
      console.error("Error resubscribing user:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao reativar inscrição",
        description: error.message || "Ocorreu um erro ao reativar a inscrição.",
      });
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este assinante permanentemente?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", subscriberId);
        
      if (error) throw error;
      
      toast({
        title: "Assinante excluído",
        description: "O assinante foi excluído com sucesso.",
      });
      
      setSubscribers(subscribers.filter(sub => sub.id !== subscriberId));
    } catch (error: any) {
      console.error("Error deleting subscriber:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir assinante",
        description: error.message || "Ocorreu um erro ao excluir o assinante.",
      });
    }
  };

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(sub => sub.status === "active");
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Status,Data de Inscrição\n"
      + activeSubscribers.map(sub => 
          `${sub.email},${sub.status},${formatDate(sub.subscribed_at)}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Lista exportada",
      description: "A lista de assinantes foi exportada com sucesso.",
    });
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

  const getStatusBadge = (status: "active" | "unsubscribed") => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case "unsubscribed":
        return <Badge variant="secondary">Cancelado</Badge>;
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || subscriber.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscribers.filter(sub => sub.status === "active").length;
  const unsubscribedCount = subscribers.filter(sub => sub.status === "unsubscribed").length;

  return (
    <AdminLayout title="Newsletter">
      <div className="space-y-6">
        {/* Header with search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "unsubscribed")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="unsubscribed">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportSubscribers}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Assinantes</p>
                <p className="text-2xl font-bold">{subscribers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assinantes Ativos</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelamentos</p>
                <p className="text-2xl font-bold">{unsubscribedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-card rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Inscrição</TableHead>
                <TableHead>Data de Cancelamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    {Array.from({ length: 5 }).map((_, cellIndex) => (
                      <TableCell key={`loading-cell-${cellIndex}`}>
                        <div className="h-5 bg-muted rounded animate-pulse w-full max-w-[150px]"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(subscriber.subscribed_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subscriber.unsubscribed_at ? formatDate(subscriber.unsubscribed_at) : "—"}
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
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {subscriber.status === "active" ? (
                            <DropdownMenuItem onClick={() => handleUnsubscribe(subscriber.id)}>
                              <UserX className="mr-2 h-4 w-4" />
                              Cancelar Inscrição
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleResubscribe(subscriber.id)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Reativar Inscrição
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum assinante encontrado.
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