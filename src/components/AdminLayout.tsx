
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {profile?.first_name 
                  ? `${profile.first_name} ${profile.last_name || ''}` 
                  : 'Usuário'}
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {profile?.role || 'subscriber'}
              </span>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Sair
            </Button>
          </div>
        </header>
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
