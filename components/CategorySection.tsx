import Link from "next/link";
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

interface CategorySectionProps {
  title: string;
  category: string;
  viewAllHref: string;
  news: NewsItem[];
}

const CategorySection = ({ title, category, viewAllHref, news }: CategorySectionProps) => {
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "política":
        return "border-news-politics";
      case "mundo":
        return "border-news-world";
      case "cultura":
        return "border-news-culture";
      case "entretenimento":
        return "border-news-entertainment";
      case "podcasts":
        return "border-news-podcasts";
      default:
        return "border-primary";
    }
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-heading-2 font-bold text-foreground border-l-4 pl-4 ${getCategoryColor(category)}`}>
          {title}
        </h2>
        <Button variant="outline" asChild>
          <Link href={viewAllHref}>Ver tudo</Link>
        </Button>
      </div>

      {news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Featured article (larger) */}
          <div className="md:col-span-7">
            <NewsCard
              title={news[0].title}
              excerpt={news[0].excerpt}
              category={news[0].category}
              timeAgo={news[0].timeAgo}
              views={news[0].views}
              image={news[0].image}
              slug={news[0].slug}
            />
          </div>

          {/* Secondary articles list */}
          <div className="md:col-span-5 space-y-4">
            {news.slice(1, 3).map((item, index) => (
              <NewsCard
                key={index}
                title={item.title}
                excerpt={item.excerpt}
                category={item.category}
                timeAgo={item.timeAgo}
                views={item.views}
                variant="horizontal"
                slug={item.slug}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorySection;