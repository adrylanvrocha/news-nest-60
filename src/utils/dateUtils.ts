
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatTimeAgo = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });
};

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
