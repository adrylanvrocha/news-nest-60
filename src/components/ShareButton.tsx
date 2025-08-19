import { Share2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  slug: string;
  url?: string;
}

const ShareButton = ({ title, slug, url }: ShareButtonProps) => {
  const { toast } = useToast();
  
  // Use the share-preview function URL for social media sharing
  const shareUrl = url || `https://ghtdsyjuatsfombkrusu.supabase.co/functions/v1/share-preview/${slug}`;
  const appUrl = `https://5cd3520e-06ae-454f-9bae-4ece3e396bdc.sandbox.lovable.dev/artigos/${slug}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      toast({
        title: "Link copiado!",
        description: "O link do artigo foi copiado para a área de transferência."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link."
      });
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${title}\n\nLeia mais:`);
    const whatsappUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(title);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;
    window.open(telegramUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${title}\n\nLeia mais:`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleWhatsAppShare}>
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTelegramShare}>
          <span className="w-4 h-4 mr-2 text-center">✈</span>
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare}>
          <span className="w-4 h-4 mr-2 text-center">f</span>
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare}>
          <span className="w-4 h-4 mr-2 text-center">𝕏</span>
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLinkedInShare}>
          <span className="w-4 h-4 mr-2 text-center">in</span>
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="w-4 h-4 mr-2" />
          Copiar link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;