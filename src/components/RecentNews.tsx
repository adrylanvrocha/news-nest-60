import { Button } from "@/components/ui/button";
import NewsCard from "@/components/NewsCard";

interface NewsItem {
  title: string;
  excerpt: string;
  category: string;
  timeAgo: string;
  views: string;
  image?: string;
  slug?: string;
}

interface RecentNewsProps {
  title: string;
  viewAllHref: string;
  news: NewsItem[];
}

const RecentNews = ({ title, viewAllHref, news }: RecentNewsProps) => {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-heading-2 font-bold text-foreground">{title}</h2>
        <Button variant="outline" asChild>
          <a href={viewAllHref}>Ver tudo</a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item, index) => (
          <NewsCard
            key={index}
            title={item.title}
            excerpt={item.excerpt}
            category={item.category}
            timeAgo={item.timeAgo}
            views={item.views}
            image={item.image}
            slug={item.slug}
          />
        ))}
      </div>
    </section>
  );
};

export default RecentNews;