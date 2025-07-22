import Layout from "@/components/Layout";
import NewsCard from "@/components/NewsCard";

const Mundo = () => {
  const featuredNews = {
    title: "Cúpula do G20 Discute Mudanças Climáticas",
    excerpt: "Líderes mundiais se reúnem A cúpula do G20 iniciou hoje com foco nas mudanças climáticas e cooperação internacional. Representantes de 20 países e...",
    category: "Mundo",
    timeAgo: "há 4 horas",
    views: "90",
    image: "/placeholder.svg"
  };

  const recentNews = [
    {
      title: "Conflito no Oriente Médio Preocupa Comunidade Internacional",
      excerpt: "ONU convoca reunião de emergência A escalada do conflito no Oriente Médio levou a ONU a convocar uma reunião de emergência do Conselho de Seguranç...",
      category: "Mundo",
      timeAgo: "há 18 horas", 
      views: "267"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-heading-1 font-bold text-foreground mb-2">Mundo</h1>
          <p className="text-muted-foreground">Últimas notícias sobre mundo</p>
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

export default Mundo;