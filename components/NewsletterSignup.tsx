'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createBrowserSupabaseClient();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Por favor, insira seu email para se inscrever."
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('subscribe_to_newsletter', {
        p_email: email.trim()
      });

      if (error) throw error;

      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito com sucesso na nossa newsletter."
      });
      
      setEmail("");
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        variant: "destructive",
        title: "Erro na inscrição",
        description: error.message || "Houve um erro ao processar sua inscrição. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Seu melhor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white"
              disabled={isLoading}
              required
            />
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary-hover whitespace-nowrap"
              disabled={isLoading}
            >
              {isLoading ? "Inscrevendo..." : "Inscrever-se"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            Ao se inscrever, você concorda com nossa política de privacidade.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;