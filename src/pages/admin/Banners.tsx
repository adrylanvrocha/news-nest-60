import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Eye, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const bannerSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  image_url: z.string().url("URL da imagem inválida").optional().or(z.literal("")),
  link_url: z.string().url("URL do link inválida").optional().or(z.literal("")),
  position: z.enum(["TOP", "SIDEBAR", "BETWEEN_ARTICLES", "FOOTER"]),
  is_active: z.boolean(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface Banner {
  id: string;
  title: string;
  image_url?: string;
  link_url?: string;
  position: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  click_count: number;
  impression_count: number;
  created_at: string;
  updated_at: string;
}

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      position: "TOP",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (error: any) {
      console.error("Error fetching banners:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar banners",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BannerFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const bannerData = {
        title: data.title,
        image_url: data.image_url || null,
        link_url: data.link_url || null,
        position: data.position,
        is_active: data.is_active,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        created_by: user.id,
      };

      let result;
      if (editingBanner) {
        result = await supabase
          .from("banners")
          .update(bannerData)
          .eq("id", editingBanner.id);
      } else {
        result = await supabase
          .from("banners")
          .insert(bannerData);
      }

      if (result.error) throw result.error;

      toast({
        title: editingBanner ? "Banner atualizado" : "Banner criado",
        description: `O banner "${data.title}" foi ${editingBanner ? "atualizado" : "criado"} com sucesso.`,
      });

      setDialogOpen(false);
      setEditingBanner(null);
      reset();
      fetchBanners();
    } catch (error: any) {
      console.error("Error saving banner:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao salvar banner",
        description: error.message,
      });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setValue("title", banner.title);
    setValue("image_url", banner.image_url || "");
    setValue("link_url", banner.link_url || "");
    setValue("position", banner.position as any);
    setValue("is_active", banner.is_active);
    setValue("start_date", banner.start_date ? banner.start_date.split('T')[0] : "");
    setValue("end_date", banner.end_date ? banner.end_date.split('T')[0] : "");
    setDialogOpen(true);
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;

    try {
      const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", bannerId);

      if (error) throw error;

      toast({
        title: "Banner excluído",
        description: "O banner foi excluído com sucesso.",
      });

      fetchBanners();
    } catch (error: any) {
      console.error("Error deleting banner:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir banner",
        description: error.message,
      });
    }
  };

  const getPositionLabel = (position: string) => {
    const positions = {
      TOP: "Topo",
      SIDEBAR: "Lateral",
      BETWEEN_ARTICLES: "Entre Artigos",
      FOOTER: "Rodapé",
    };
    return positions[position as keyof typeof positions] || position;
  };

  const getStatusBadge = (banner: Banner) => {
    if (!banner.is_active) {
      return <Badge variant="secondary">Inativo</Badge>;
    }
    
    const now = new Date();
    const startDate = banner.start_date ? new Date(banner.start_date) : null;
    const endDate = banner.end_date ? new Date(banner.end_date) : null;
    
    if (startDate && startDate > now) {
      return <Badge variant="outline">Agendado</Badge>;
    }
    
    if (endDate && endDate < now) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    return <Badge variant="default">Ativo</Badge>;
  };

  return (
    <AdminLayout title="Gerenciar Banners">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Banners Publicitários</h2>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingBanner(null);
                reset();
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingBanner ? "Editar Banner" : "Novo Banner"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Título do banner"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input
                    id="image_url"
                    {...register("image_url")}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  {errors.image_url && (
                    <p className="text-sm text-destructive">{errors.image_url.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="link_url">URL do Link</Label>
                  <Input
                    id="link_url"
                    {...register("link_url")}
                    placeholder="https://exemplo.com"
                  />
                  {errors.link_url && (
                    <p className="text-sm text-destructive">{errors.link_url.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="position">Posição</Label>
                  <Select 
                    onValueChange={(value) => setValue("position", value as any)}
                    defaultValue={watch("position")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOP">Topo</SelectItem>
                      <SelectItem value="SIDEBAR">Lateral</SelectItem>
                      <SelectItem value="BETWEEN_ARTICLES">Entre Artigos</SelectItem>
                      <SelectItem value="FOOTER">Rodapé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={watch("is_active")}
                    onCheckedChange={(checked) => setValue("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Banner ativo</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Data de Início</Label>
                    <Input
                      id="start_date"
                      type="date"
                      {...register("start_date")}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_date">Data de Fim</Label>
                    <Input
                      id="end_date"
                      type="date"
                      {...register("end_date")}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Salvando..." : editingBanner ? "Atualizar" : "Criar"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{banners.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold">
                    {banners.filter(b => b.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Banners Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Banners</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead>Impressões</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      {Array.from({ length: 6 }).map((_, cellIndex) => (
                        <TableCell key={`loading-cell-${cellIndex}`}>
                          <div className="h-5 bg-muted rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : banners.length > 0 ? (
                  banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{banner.title}</p>
                          {banner.image_url && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {banner.image_url}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPositionLabel(banner.position)}</TableCell>
                      <TableCell>{getStatusBadge(banner)}</TableCell>
                      <TableCell>{banner.click_count}</TableCell>
                      <TableCell>{banner.impression_count}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(banner.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum banner encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}