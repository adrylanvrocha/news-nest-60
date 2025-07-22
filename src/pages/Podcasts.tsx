import Layout from "@/components/Layout";
import PodcastCard from "@/components/PodcastCard";

const Podcasts = () => {
  const podcasts = [
    {
      title: "Frances News Daily - Edição Matinal",
      description: "Resumo das principais notícias do dia com análise dos nossos editores. Episódio de 15 minutos com os destaques da política, economia e mundo.",
      duration: "15:00",
      timeAgo: "há 1 dia",
      category: "Podcast"
    },
    {
      title: "Cultura em Foco - Entrevista Especial",
      description: "Entrevista exclusiva com o diretor do Festival do Cinema Brasileiro. Conversamos sobre os rumos do cinema nacional e as novidades do festival.",
      duration: "36:00",
      timeAgo: "há 2 dias",
      category: "Podcast"
    },
    {
      title: "Mundo em Perspectiva",
      description: "Análise semanal dos principais acontecimentos internacionais com nossos correspondentes ao redor do mundo.",
      duration: "45:00",
      timeAgo: "há 3 dias",
      category: "Podcast"
    },
    {
      title: "Política em Debate",
      description: "Análise semanal dos principais acontecimentos políticos com especialistas e comentaristas.",
      duration: "40:00",
      timeAgo: "há 4 dias",
      category: "Podcast"
    },
    {
      title: "Entretenimento Sem Filtro",
      description: "As últimas novidades do mundo do entretenimento, celebridades e cultura pop brasileira.",
      duration: "37:30",
      timeAgo: "há 5 dias",
      category: "Podcast"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-heading-1 font-bold text-foreground mb-2">Podcasts</h1>
          <p className="text-muted-foreground">Ouça nossos podcasts com análises e entrevistas exclusivas</p>
        </div>

        {/* Banner Space */}
        <div className="bg-muted py-12 rounded-lg mb-8 text-center text-muted-foreground">
          Espaço para Banner BETWEEN_ARTICLES
        </div>

        {/* Podcasts List */}
        <div className="space-y-6">
          {podcasts.map((podcast, index) => (
            <PodcastCard
              key={index}
              title={podcast.title}
              description={podcast.description}
              duration={podcast.duration}
              timeAgo={podcast.timeAgo}
              category={podcast.category}
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

export default Podcasts;