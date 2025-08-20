import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Página não encontrada</h2>
          <p className="text-muted-foreground mb-8">
            Desculpe, não conseguimos encontrar a página que você está procurando.
          </p>
          <Button asChild>
            <Link href="/">
              Voltar para o início
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}