import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Search, UserCog, Shield, Eye, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Profile, UserRole } from "@/lib/types";

type UserWithEmail = Profile & {
  email?: string;
};

export default function Users() {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      console.log("Fetching users...");
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (profilesError) {
        console.error("Profiles error:", profilesError);
        throw profilesError;
      }

      console.log("Profiles fetched:", profiles);

      // Try to get auth users for email data (admin only)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser?.id)
        .single();

      let usersWithEmail = profiles || [];

      // Use Edge Function to get user emails if admin
      if (currentProfile?.role === 'admin') {
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('get-user-emails', {
            body: { userIds: profiles?.map(p => p.id) || [] }
          });
          
          if (!emailError && emailData?.success) {
            usersWithEmail = profiles?.map(profile => {
              const emailInfo = emailData.emails?.find((e: any) => e.user_id === profile.id);
              return {
                ...profile,
                email: emailInfo?.email || `user-${profile.id.slice(0, 8)}@example.com`
              };
            }) || [];
          } else {
            // Fallback: use profiles without email
            usersWithEmail = profiles?.map(profile => ({
              ...profile,
              email: `user-${profile.id.slice(0, 8)}@example.com`
            })) || [];
          }
        } catch (error) {
          console.log("Email fetch failed, using profiles only");
          usersWithEmail = profiles?.map(profile => ({
            ...profile,
            email: `user-${profile.id.slice(0, 8)}@example.com`
          })) || [];
        }
      } else {
        // Non-admin users don't see emails
        usersWithEmail = profiles || [];
      }
      
      setUsers(usersWithEmail);
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message || "Ocorreu um erro ao carregar os usuários.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (updatingUserId) return; // Prevent concurrent updates
    
    try {
      setUpdatingUserId(userId);
      
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: "Role atualizado",
        description: `O usuário foi promovido para ${newRole} com sucesso.`,
      });
    } catch (error: any) {
      console.error("Error updating user role:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar role",
        description: error.message || "Ocorreu um erro ao atualizar o role do usuário.",
      });
    } finally {
      setUpdatingUserId(null);
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

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      admin: { label: "Administrador", className: "bg-red-500" },
      editor: { label: "Editor", className: "bg-blue-500" },
      author: { label: "Autor", className: "bg-green-500" },
      subscriber: { label: "Assinante", className: "bg-gray-500" },
    };
    
    const config = roleConfig[role];
    return (
      <Badge variant="default" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "editor":
        return <UserCog className="h-4 w-4 text-blue-500" />;
      case "author":
        return <Eye className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.first_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getUserDisplayName = (user: UserWithEmail) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    if (user.email) {
      return user.email;
    }
    return `Usuário ${user.id.slice(0, 8)}`;
  };

  return (
    <AdminLayout title="Gerenciar Usuários">
      <div className="space-y-6">
        {/* Header with search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar usuários..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os roles</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="editor">Editores</SelectItem>
                <SelectItem value="author">Autores</SelectItem>
                <SelectItem value="subscriber">Assinantes</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => window.location.href = '/admin/users/invite'}>
              Convidar Usuário
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { role: "admin", label: "Administradores", count: users.filter(u => u.role === "admin").length },
            { role: "editor", label: "Editores", count: users.filter(u => u.role === "editor").length },
            { role: "author", label: "Autores", count: users.filter(u => u.role === "author").length },
            { role: "subscriber", label: "Assinantes", count: users.filter(u => u.role === "subscriber").length },
          ].map((stat) => (
            <div key={stat.role} className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2">
                {getRoleIcon(stat.role as UserRole)}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Role Atual</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Última Atualização</TableHead>
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
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {getUserDisplayName(user).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{getUserDisplayName(user)}</p>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground">{user.bio}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={updatingUserId === user.id}
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            Alterar Role
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Alterar Role do Usuário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Selecione o novo role para <strong>{getUserDisplayName(user)}</strong>.
                              Esta ação alterará as permissões do usuário no sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-2">Role atual: {getRoleBadge(user.role)}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {(["subscriber", "author", "editor", "admin"] as UserRole[]).map((role) => (
                                <AlertDialogAction
                                  key={role}
                                  onClick={() => handleRoleChange(user.id, role)}
                                  className={`justify-start ${user.role === role ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={user.role === role}
                                >
                                  <div className="flex items-center gap-2">
                                    {getRoleIcon(role)}
                                    {role === "admin" ? "Administrador" :
                                     role === "editor" ? "Editor" :
                                     role === "author" ? "Autor" : "Assinante"}
                                  </div>
                                </AlertDialogAction>
                              ))}
                            </div>
                          </div>
                          
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum usuário encontrado.
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