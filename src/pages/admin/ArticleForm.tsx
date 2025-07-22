
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Article, Category } from "@/lib/types";
import { ArrowLeft, Save, Eye, Trash2, Tag, X } from "lucide-react";

const articleFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category_id: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]),
  featured_image_url: z.string().url().optional().or(z.literal("")),
  is_featured: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleFormSchema>;

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const isEdit = Boolean(id);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category_id: "",
      status: "draft",
      featured_image_url: "",
      is_featured: false,
    },
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit && id) {
      fetchArticle(id);
    }
  }, [id, isEdit]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setCategories(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar categorias",
        description: error.message,
      });
    }
  }

  async function fetchArticle(articleId: string) {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();
      
      if (error) throw error;
      
      form.reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        content: data.content || "",
        category_id: data.category_id || "",
        status: data.status as "draft" | "published" | "archived",
        featured_image_url: data.featured_image_url || "",
        is_featured: data.is_featured,
      });
      
      setTags(data.tags || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar artigo",
        description: error.message,
      });
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(title: string) {
    form.setValue("title", title);
    if (!isEdit) {
      form.setValue("slug", generateSlug(title));
    }
  }

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }

  async function onSubmit(data: ArticleFormData) {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não encontrado",
      });
      return;
    }

    try {
      setLoading(true);

      const articleData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category_id: data.category_id || null,
        status: data.status,
        featured_image_url: data.featured_image_url || null,
        is_featured: data.is_featured,
        author_id: user.id,
        tags,
        published_at: data.status === "published" ? new Date().toISOString() : null,
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", id);

        if (error) throw error;
        
        toast({
          title: "Artigo atualizado",
          description: "O artigo foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("articles")
          .insert(articleData);

        if (error) throw error;
        
        toast({
          title: "Artigo criado",
          description: "O artigo foi criado com sucesso.",
        });
      }

      navigate("/admin/articles");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar artigo",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm("Tem certeza que deseja excluir este artigo?")) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Artigo excluído",
        description: "O artigo foi excluído com sucesso.",
      });

      navigate("/admin/articles");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir artigo",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title={isEdit ? "Editar Artigo" : "Novo Artigo"}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/articles")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            {isEdit && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                size="sm"
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="Digite o título do artigo..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="artigo-url-amigavel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumo</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Resumo do artigo para exibição em listas..."
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Escreva o conteúdo do artigo..."
                          className="min-h-[300px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium mb-4">Configurações</h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Rascunho</SelectItem>
                              <SelectItem value="published">Publicado</SelectItem>
                              <SelectItem value="archived">Arquivado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Nenhuma categoria</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-input"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Artigo em destaque
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium mb-4">Imagem em Destaque</h3>
                  <FormField
                    control={form.control}
                    name="featured_image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="URL da imagem..."
                            type="url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium mb-4">Tags</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Nova tag..."
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        size="sm"
                        variant="outline"
                      >
                        <Tag size={14} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-destructive"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={loading} className="w-full">
                    <Save size={16} className="mr-2" />
                    {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar"} Artigo
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
