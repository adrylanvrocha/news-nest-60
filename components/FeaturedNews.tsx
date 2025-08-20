'use client';

import heroImage from "@/assets/hero-news.jpg";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface FeaturedNewsProps {
  title: string;
  excerpt: string;
  category: string;
  timeAgo: string;
  views: string;
  slug?: string;
}

const FeaturedNews = ({ title, excerpt, category, timeAgo, views, slug }: FeaturedNewsProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (slug) {
      router.push(`/artigos/${slug}`);
    }
  };
  
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "política":
        return "bg-news-politics";
      case "mundo":
        return "bg-news-world";
      case "cultura":
        return "bg-news-culture";
      case "entretenimento":
        return "bg-news-entertainment";
      case "podcasts":
        return "bg-news-podcasts";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className={`relative rounded-xl overflow-hidden ${slug ? 'cursor-pointer' : ''}`} onClick={handleClick}>
      {/* Image with gradient overlay */}
      <div className="relative aspect-[2.5/1] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Featured news" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="max-w-2xl">
          <Badge 
            variant="secondary" 
            className={`${getCategoryColor(category)} text-white mb-3`}
          >
            {category}
          </Badge>
          <h1 className="text-2xl md:text-heading-1 font-bold text-white mb-3">
            {title}
          </h1>
          <p className="text-gray-200 mb-4 line-clamp-2 md:line-clamp-3">
            {excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {timeAgo}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {views} views
              </span>
            </div>
            <Button 
              variant="default"
              className="bg-primary hover:bg-primary-hover"
              onClick={slug ? handleClick : undefined}
            >
              Ler mais
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;