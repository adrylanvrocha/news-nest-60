import Layout from "@/components/Layout";
import FeaturedNews from "@/components/FeaturedNews";
import NewsCard from "@/components/NewsCard";
import CategorySection from "@/components/CategorySection";
import PodcastCard from "@/components/PodcastCard";
import NewsletterSignup from "@/components/NewsletterSignup";

const Index = () => {
  // Featured news data
  const featuredNews = {
    title: "Nova Lei de Transparência Aprovada no Congresso Nacional",
    excerpt: "Congresso aprova nova legislação que aumenta a transparência nos gastos públicos. A medida, que foi proposta há mais de um ano, recebeu apoio de diversos setores da sociedade e promete trazer mais clareza sobre como os recursos públicos são utilizados em todas as esferas do governo.",
    category: "Política",
    timeAgo: "há 2 horas",
    views: "156"
  };

  // Latest news data
  const latestNews = [
    {
      title: "Mercado Financeiro Reage a Novas Medidas Econômicas",
      excerpt: "Bolsa sobe após anúncio do governo O mercado financeiro reagiu positivamente às novas medidas econômicas anunciadas pelo governo. A Bolsa de Valores registrou alta significativa após o pacote de incentivos ser divulgado.",
      category: "Política",
      timeAgo: "há 12 horas",
      views: "178",
      image: "/placeholder.svg"
    },
    {
      title: "Cúpula do G20 Discute Mudanças Climáticas",
      excerpt: "Líderes mundiais se reúnem A cúpula do G20 iniciou hoje com foco nas mudanças climáticas e cooperação internacional. Representantes de 20 países estão debatendo ações conjuntas para enfrentar a crise climática global.",
      category: "Mundo",
      timeAgo: "há 4 horas",
      views: "90",
      image: "/placeholder.svg"
    },
    {
      title: "Museu Nacional Reabre com Nova Exposição",
      excerpt: "Após anos de restauração, o Museu Nacional reabre suas portas com uma exposição inédita que celebra a diversidade cultural brasileira e apresenta artefatos históricos nunca antes exibidos ao público.",
      category: "Cultura",
      timeAgo: "há 1 dia",
      views: "120"
    },
    {
      title: "Conflito no Oriente Médio Preocupa Comunidade Internacional",
      excerpt: "ONU convoca reunião de emergência A escalada do conflito no Oriente Médio levou a ONU a convocar uma reunião de emergência do Conselho de Segurança para discutir medidas de contenção e auxílio humanitário às regiões afetadas.",
      category: "Mundo",
      timeAgo: "há 18 horas",
      views: "267"
    },
    {
      title: "Novo Festival de Cinema Anuncia Programação",
      excerpt: "O Festival Internacional de Cinema de São Paulo divulgou hoje a programação completa de sua primeira edição, que contará com mais de 100 filmes de 30 países e homenagens a grandes nomes do cinema nacional e internacional.",
      category: "Cultura",
      timeAgo: "há 6 horas",
      views: "85"
    },
    {
      title: "Avanços na Inteligência Artificial Preocupam Especialistas",
      excerpt: "Pesquisadores alertam para riscos O rápido desenvolvimento da inteligência artificial tem gerado preocupação entre especialistas da área de tecnologia e ética. Em conferência internacional, cientistas propuseram novas diretrizes para regular o setor.",
      category: "Tecnologia",
      timeAgo: "há 3 dias",
      views: "320"
    }
  ];

  // Politics section data
  const politicsNews = [
    {
      title: "Nova Lei de Transparência Aprovada no Congresso",
      excerpt: "Congresso aprova nova legislação O Congresso Nacional aprovou hoje uma nova lei que aumenta a transparência nos gastos públicos. A medida, que foi proposta há mais de um ano, recebeu apoio de diversos setores.",
      category: "Política",
      timeAgo: "há 2 horas",
      views: "156",
      image: "/placeholder.svg"
    },
    {
      title: "Mercado Financeiro Reage a Novas Medidas Econômicas",
      excerpt: "Bolsa sobe após anúncio do governo O mercado financeiro reagiu positivamente às novas medidas econômicas anunciadas pelo governo.",
      category: "Política",
      timeAgo: "há 12 horas",
      views: "178"
    },
    {
      title: "Ministro de Segurança se Reúne com Governadores",
      excerpt: "Encontro discute medidas para redução da criminalidade em todo o país. Representantes dos 27 estados participaram da reunião que definiu novas diretrizes.",
      category: "Política",
      timeAgo: "há 1 dia",
      views: "134"
    }
  ];

  // World section data
  const worldNews = [
    {
      title: "Cúpula do G20 Discute Mudanças Climáticas",
      excerpt: "Líderes mundiais se reúnem A cúpula do G20 iniciou hoje com foco nas mudanças climáticas e cooperação internacional. Representantes de 20 países estão presentes no evento.",
      category: "Mundo",
      timeAgo: "há 4 horas",
      views: "90",
      image: "/placeholder.svg"
    },
    {
      title: "Conflito no Oriente Médio Preocupa Comunidade Internacional",
      excerpt: "ONU convoca reunião de emergência A escalada do conflito no Oriente Médio levou a ONU a convocar uma reunião de emergência do Conselho de Segurança.",
      category: "Mundo",
      timeAgo: "há 18 horas",
      views: "267"
    },
    {
      title: "Eleições nos EUA: Os Cenários Possíveis",
      excerpt: "Analistas políticos discutem as implicações dos diferentes resultados eleitorais para a política internacional e as relações com o Brasil.",
      category: "Mundo",
      timeAgo: "há 2 dias",
      views: "198"
    }
  ];

  // Featured podcasts data
  const featuredPodcasts = [
    {
      title: "Frances News Daily - Edição Matinal",
      description: "Resumo das principais notícias do dia com análise dos nossos editores. Episódio de 15 minutos com os destaques da política, economia e mundo.",
      duration: "15:00",
      timeAgo: "há 1 dia"
    },
    {
      title: "Mundo em Perspectiva",
      description: "Análise semanal dos principais acontecimentos internacionais com nossos correspondentes ao redor do mundo.",
      duration: "25:00",
      timeAgo: "há 3 dias"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-8">
          <FeaturedNews {...featuredNews} />
        </section>

        {/* Latest News */}
        <section className="py-8">
          <h2 className="text-heading-2 font-bold text-foreground mb-6">Últimas Notícias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.slice(0, 6).map((news, index) => (
              <NewsCard
                key={index}
                title={news.title}
                excerpt={news.excerpt}
                category={news.category}
                timeAgo={news.timeAgo}
                views={news.views}
                image={news.image}
              />
            ))}
          </div>
        </section>

        {/* Banner */}
        <div className="bg-muted py-12 rounded-lg my-8 text-center text-muted-foreground">
          Espaço para Banner BETWEEN_ARTICLES
        </div>

        {/* Politics Section */}
        <CategorySection
          title="Política"
          category="Política"
          viewAllHref="/politica"
          news={politicsNews}
        />

        {/* World Section */}
        <CategorySection
          title="Mundo"
          category="Mundo"
          viewAllHref="/mundo"
          news={worldNews}
        />

        {/* Newsletter Section */}
        <div className="my-12">
          <NewsletterSignup />
        </div>

        {/* Podcasts Section */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading-2 font-bold text-foreground border-l-4 pl-4 border-news-podcasts">
              Podcasts
            </h2>
            <a 
              href="/podcasts"
              className="text-primary hover:text-primary-hover font-medium"
            >
              Ver todos
            </a>
          </div>
          <div className="space-y-6">
            {featuredPodcasts.map((podcast, index) => (
              <PodcastCard
                key={index}
                title={podcast.title}
                description={podcast.description}
                duration={podcast.duration}
                timeAgo={podcast.timeAgo}
              />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;