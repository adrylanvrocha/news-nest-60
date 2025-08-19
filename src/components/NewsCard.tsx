import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface NewsCardProps {
  title: string;
  excerpt: string;
  category: string;
  timeAgo: string;
  views: string;
  image?: string;
  featured?: boolean;
  variant?: "default" | "horizontal" | "small";
  slug?: string;
}

const NewsCard = ({ 
  title, 
  excerpt, 
  category, 
  timeAgo, 
  views, 
  image, 
  featured = false,
  variant = "default",
  slug
}: NewsCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (slug) {
      navigate(`/artigos/${slug}`);
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

  if (variant === "horizontal") {
    return (
      <article 
        className={`group bg-card rounded-lg shadow-news-sm hover:shadow-news-md transition-all duration-normal border border-border overflow-hidden ${slug ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        <div className="flex">
          {image && (
            <div className="w-48 h-32 bg-muted flex-shrink-0">
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className={`${getCategoryColor(category)} text-white text-xs`}
              >
                {category}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-muted-foreground text-body-small mb-3 line-clamp-2">
              {excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {views} views
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "small") {
    return (
      <article 
        className={`group bg-card rounded-lg shadow-news-sm hover:shadow-news-md transition-all duration-normal border border-border overflow-hidden ${slug ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className={`${getCategoryColor(category)} text-white text-xs`}
            >
              {category}
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-3 text-sm">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {views} views
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      className={`group bg-card rounded-lg shadow-news-sm hover:shadow-news-md transition-all duration-normal border border-border overflow-hidden ${slug ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {image && (
        <div className="aspect-video bg-muted">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge 
            variant="secondary" 
            className={`${getCategoryColor(category)} text-white text-xs`}
          >
            {category}
          </Badge>
          {featured && (
            <Badge variant="outline" className="text-xs">
              Destaque
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-muted-foreground text-body-small mb-3 line-clamp-3">
          {excerpt}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views} views
          </span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;