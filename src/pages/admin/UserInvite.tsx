import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

const inviteFormSchema = z.object({
  email: z.string().email("Email inválido"),
  first_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  last_name: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  role: z.enum(["subscriber", "author", "editor", "admin"]),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

export default function UserInvite() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      role: "subscriber",
      password: "",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    try {
      setLoading(true);

      // Create user with admin API
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
      });

      if (authError) throw authError;

      if (authUser.user) {
        // Update profile with role
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
          })
          .eq("id", authUser.user.id);

        if (profileError) throw profileError;

        toast({
          title: "Usuário criado com sucesso!",
          description: `${data.first_name} foi adicionado como ${data.role}.`,
        });

        navigate("/admin/users");
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Convidar Usuário">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">Adicionar Novo Usuário</h2>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o sobrenome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="usuario@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Temporária</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Senha para o usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role do Usuário</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="subscriber">Assinante</SelectItem>
                        <SelectItem value="author">Autor</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/users")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}