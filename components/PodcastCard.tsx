import Link from "next/link";
import Image from "next/image";
import { Play, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, formatDuration } from "@/utils/dateUtils";

interface PodcastCardProps {
  id: string;
  title: string;
  description?: string;
  category?: string;
  author?: string;
  duration?: number;
  publishedAt?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  slug?: string;
}

const PodcastCard = ({
  id,
  title,
  description,
  category,
  author,
  duration,
  publishedAt,
  thumbnailUrl,
  audioUrl,
  slug
}: PodcastCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'política':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'mundo':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'cultura':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'entretenimento':
        return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (slug) {
      return (
        <Link href={`/podcasts/${slug}`} className="block group">
          {children}
        </Link>
      );
    }
    return <div className="group">{children}</div>;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardWrapper>
        <div className="relative aspect-video bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Play className="w-12 h-12 text-primary/60" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          
          {category && (
            <div className="absolute top-3 left-3">
              <Badge className={getCategoryColor(category)}>
                {category}
              </Badge>
            </div>
          )}
          
          {duration && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-black/50 text-white border-0">
                <Clock className="w-3 h-3 mr-1" />
                {formatDuration(duration)}
              </Badge>
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="lg" className="rounded-full">
              <Play className="w-5 h-5 mr-2" />
              Ouvir
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          
          {description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {publishedAt && <span>{formatTimeAgo(publishedAt)}</span>}
            {author && <span>Por {author}</span>}
          </div>
        </CardContent>
      </CardWrapper>
    </Card>
  );
};

export default PodcastCard;