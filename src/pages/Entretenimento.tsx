import Layout from "@/components/Layout";
import NewsCard from "@/components/NewsCard";

const Entretenimento = () => {
  const featuredNews = {
    title: "Adele Anuncia Nova Turnê Mundial com Datas no Brasil",
    excerpt: "A cantora britânica anunciou oficialmente sua nova turnê mundial que passará por 20 países, incluindo três apresentações no Brasil. Os fãs já podem se preparar para os shows que acontecerão nos principais estádios das capitais brasileiras no próximo ano.",
    category: "Entretenimento",
    timeAgo: "há 6 horas",
    views: "385",
    image: "/placeholder.svg"
  };

  const recentNews = [
    {
      title: "Novo Filme de Ação Lidera Bilheterias em Estreia",
      excerpt: "O aguardado filme de ação 'Operação Tempestade' superou todas as expectativas e dominou as bilheterias no fim de semana de estreia, arrecadando mais de R$ 15 milhões somente no Brasil.",
      category: "Entretenimento",
      timeAgo: "há 2 dias",
      views: "142"
    },
    {
      title: "Streaming Anuncia Série Brasileira com Elenco de Peso",
      excerpt: "Uma das maiores plataformas de streaming do mundo anunciou hoje a produção de uma nova série original brasileira que contará com um elenco de renomados atores nacionais e direção premiada.",
      category: "Entretenimento",
      timeAgo: "há 1 dia",
      views: "98"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-heading-1 font-bold text-foreground mb-2">Entretenimento</h1>
          <p className="text-muted-foreground">As últimas novidades do mundo do entretenimento, celebridades e cultura pop</p>
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

export default Entretenimento;