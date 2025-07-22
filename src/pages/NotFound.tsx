import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-8xl font-bold text-primary mb-6">404</div>
          <h1 className="text-heading-1 font-bold mb-4">Página não encontrada</h1>
          <p className="text-muted-foreground mb-8">
            A página que você está tentando acessar não existe ou foi movida para outro endereço.
          </p>
          <Button asChild className="bg-primary hover:bg-primary-hover">
            <a href="/" className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a Página Inicial
            </a>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
