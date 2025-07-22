import Layout from "@/components/Layout";
import NewsCard from "@/components/NewsCard";

const Cultura = () => {
  const featuredNews = {
    title: "Museu Nacional Reabre com Nova Exposição sobre Arte Contemporânea",
    excerpt: "Após anos de restauração, o Museu Nacional reabre suas portas com uma exposição inédita que celebra a diversidade cultural brasileira e apresenta artefatos históricos nunca antes exibidos ao público. A nova galeria recebeu investimentos significativos.",
    category: "Cultura",
    timeAgo: "há 1 dia",
    views: "120",
    image: "/placeholder.svg"
  };

  const recentNews = [
    {
      title: "Novo Festival de Cinema Anuncia Programação Completa",
      excerpt: "O Festival Internacional de Cinema de São Paulo divulgou hoje a programação completa de sua primeira edição, que contará com mais de 100 filmes de 30 países e homenagens a grandes nomes do cinema nacional.",
      category: "Cultura",
      timeAgo: "há 6 horas",
      views: "85"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-heading-1 font-bold text-foreground mb-2">Cultura</h1>
          <p className="text-muted-foreground">Acompanhe as últimas notícias sobre cultura, arte e eventos</p>
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

export default Cultura;