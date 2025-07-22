import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NewsletterSignup = () => {
  return (
    <section className="bg-muted py-12 rounded-lg">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✉</span>
            </div>
          </div>
          <h2 className="text-heading-2 font-bold mb-4">Newsletter Frances News</h2>
          <p className="text-muted-foreground mb-6">
            Receba as principais notícias diretamente no seu email.
            <br />
            Sem spam, apenas conteúdo relevante.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              placeholder="Seu melhor email"
              className="bg-white"
            />
            <Button className="bg-primary hover:bg-primary-hover whitespace-nowrap">
              Inscrever-se
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Ao se inscrever, você concorda com nossa política de privacidade.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;