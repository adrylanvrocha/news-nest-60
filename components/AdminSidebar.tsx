import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Image, 
  MessageSquare,
  Headphones,
  FolderOpen,
  Mail,
  PlusCircle,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createBrowserSupabaseClient();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: BarChart3,
    },
    {
      title: "Artigos",
      href: "/admin/articles",
      icon: FileText,
    },
    {
      title: "Novo Artigo",
      href: "/admin/articles/new",
      icon: PlusCircle,
    },
    {
      title: "Podcasts",
      href: "/admin/podcasts",
      icon: Headphones,
    },
    {
      title: "Categorias",
      href: "/admin/categories",
      icon: FolderOpen,
    },
    {
      title: "Comentários",
      href: "/admin/comments",
      icon: MessageSquare,
    },
    {
      title: "Banners",
      href: "/admin/banners",
      icon: Image,
    },
    {
      title: "Usuários",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Newsletter",
      href: "/admin/newsletter",
      icon: Mail,
    },
    {
      title: "Mídia",
      href: "/admin/media",
      icon: Image,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Configurações",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">F</span>
          </div>
          <span className="text-xl font-bold text-foreground">Frances News</span>
        </Link>
      </div>

      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="mt-8 pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;