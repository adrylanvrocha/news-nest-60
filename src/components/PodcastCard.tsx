import { Play, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PodcastCardProps {
  title: string;
  description: string;
  duration: string;
  timeAgo: string;
  image?: string;
  category?: string;
}

const PodcastCard = ({ 
  title, 
  description, 
  duration, 
  timeAgo, 
  image,
  category = "Podcast"
}: PodcastCardProps) => {
  return (
    <article className="group bg-card rounded-lg shadow-news-sm hover:shadow-news-md transition-all duration-normal border border-border overflow-hidden">
      <div className="flex">
        {/* Play Button & Image */}
        <div className="relative w-32 h-32 bg-muted flex-shrink-0 flex items-center justify-center">
          {image ? (
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-news-podcasts to-news-podcasts/80 flex items-center justify-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
          )}
          <Button 
            size="sm" 
            className="absolute inset-0 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-4 h-4 mr-1" />
            Reproduzir
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className="bg-news-podcasts text-white text-xs"
            >
              {category}
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-muted-foreground text-body-small mb-3 line-clamp-2">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {duration}
              </span>
              <span>{timeAgo}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PodcastCard;