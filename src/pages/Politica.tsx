import Layout from "@/components/Layout";
import NewsCard from "@/components/NewsCard";

const Politica = () => {
  const featuredNews = {
    title: "Nova Lei de Transparência Aprovada no Congresso",
    excerpt: "Congresso aprova nova legislação O Congresso Nacional aprovou hoje uma nova lei que aumenta a transparência nos gastos públicos. A medida, que foi...",
    category: "Política",
    timeAgo: "há 2 horas",
    views: "156",
    image: "/placeholder.svg"
  };

  const recentNews = [
    {
      title: "Mercado Financeiro Reage a Novas Medidas Econômicas",
      excerpt: "Bolsa sobe após anúncio do governo O mercado financeiro reagiu positivamente às novas medidas econômicas anunciadas pelo governo. A Bolsa de Valor...",
      category: "Política", 
      timeAgo: "há 12 horas",
      views: "178"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-heading-1 font-bold text-foreground mb-2">Política</h1>
          <p className="text-muted-foreground">Últimas notícias sobre política</p>
        </div>

        {/* Banner Space */}
        <div className="bg-muted py-12 rounded-lg mb-8 text-center text-muted-foreground">
          Espaço para Banner BETWEEN_ARTICLES
        </div>

        {/* Featured Article */}
        <div className="mb-8">
          <NewsCard
            title={featuredNews.title}
            excerpt={featuredNews.excerpt}
            category={featuredNews.category}
            timeAgo={featuredNews.timeAgo}
            views={featuredNews.views}
            image={featuredNews.image}
            featured={true}
          />
        </div>

        {/* Recent News */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentNews.map((article, index) => (
            <NewsCard
              key={index}
              title={article.title}
              excerpt={article.excerpt}
              category={article.category}
              timeAgo={article.timeAgo}
              views={article.views}
            />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground">Não há mais conteúdo para carregar</p>
        </div>
      </div>
    </Layout>
  );
};

export default Politica;