
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  FileText, 
  Headphones, 
  Tag, 
  MessageSquare, 
  Users, 
  Image, 
  Mail, 
  BarChart, 
  Settings
} from "lucide-react";

const AdminSidebar = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const isEditor = profile?.role === "editor" || isAdmin;
  const isAuthor = profile?.role === "author" || isEditor;

  return (
    <nav className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold">Frances News</h2>
        <p className="text-xs text-muted-foreground">Painel Administrativo</p>
      </div>
      
      <div className="flex-1 py-4 overflow-auto">
        <div className="px-4 mb-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">GERAL</p>
          <ul className="space-y-1">
            <NavItem to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" exact />
          </ul>
        </div>
        
        {isAuthor && (
          <div className="px-4 mb-2 mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">CONTEÚDO</p>
            <ul className="space-y-1">
              <NavItem to="/admin/articles" icon={<FileText size={18} />} label="Artigos" />
              <NavItem to="/admin/podcasts" icon={<Headphones size={18} />} label="Podcasts" />
              {isEditor && (
                <NavItem to="/admin/categories" icon={<Tag size={18} />} label="Categorias" />
              )}
              <NavItem to="/admin/comments" icon={<MessageSquare size={18} />} label="Comentários" />
              <NavItem to="/admin/media" icon={<Image size={18} />} label="Mídia" />
            </ul>
          </div>
        )}
        
        {isEditor && (
          <div className="px-4 mb-2 mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">MARKETING</p>
            <ul className="space-y-1">
              <NavItem to="/admin/newsletters" icon={<Mail size={18} />} label="Newsletter" />
              {isAdmin && (
                <NavItem to="/admin/banners" icon={<Image size={18} />} label="Banners" />
              )}
            </ul>
          </div>
        )}
        
        {isAdmin && (
          <>
            <div className="px-4 mb-2 mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">ANÁLISES</p>
              <ul className="space-y-1">
                <NavItem to="/admin/analytics" icon={<BarChart size={18} />} label="Estatísticas" />
              </ul>
            </div>
            
            <div className="px-4 mb-2 mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">ADMINISTRAÇÃO</p>
              <ul className="space-y-1">
                <NavItem to="/admin/users" icon={<Users size={18} />} label="Usuários" />
                <NavItem to="/admin/settings" icon={<Settings size={18} />} label="Configurações" />
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}

const NavItem = ({ to, icon, label, exact }: NavItemProps) => {
  return (
    <li>
      <NavLink 
        to={to} 
        end={exact}
        className={({ isActive }) => 
          `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
            isActive 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'text-foreground hover:bg-muted transition-colors'
          }`
        }
      >
        {icon}
        {label}
      </NavLink>
    </li>
  );
};

export default AdminSidebar;
