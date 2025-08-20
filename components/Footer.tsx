import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Footer = () => {
  const categories = [
    "Política",
    "Mundo", 
    "Cultura",
    "Entretenimento",
    "Podcasts"
  ];

  const institutional = [
    "Sobre Nós",
    "Contato",
    "Privacidade",
    "Termos de Uso"
  ];

  return (
    <footer className="bg-footer-bg text-white">
      {/* Newsletter Section */}
      <div className="bg-newsletter py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-white rounded-lg p-6 text-foreground">
            <div className="flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-primary rounded mr-2 flex items-center justify-center">
                <span className="text-white text-sm">✉</span>
              </div>
              <h3 className="font-semibold">Newsletter Frances News</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Receba as principais notícias diretamente no seu email. Sem spam, apenas conteúdo relevante.
            </p>
            <div className="space-y-3">
              <Input 
                placeholder="Seu melhor email"
                className="bg-muted border-border"
              />
              <Button className="w-full bg-primary hover:bg-primary-hover">
                Inscrever-se
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Ao se inscrever, você concorda com nossa política de privacidade.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold">Frances News</span>
            </div>
            <p className="text-gray-300 text-sm">
              Portal de notícias com cobertura completa dos principais acontecimentos do Brasil e do mundo. Informação confiável e atualizada 24 horas por dia.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categorias</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <Link 
                    href={`/${category.toLowerCase()}`}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="font-semibold mb-4">Institucional</h4>
            <ul className="space-y-2">
              {institutional.map((item) => (
                <li key={item}>
                  <a 
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-400 text-sm">
            © 2024 Frances News. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;