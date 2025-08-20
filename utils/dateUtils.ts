import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatTimeAgo = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Data não disponível';
  
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data inválida';
  }
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Data não disponível';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data inválida';
  }
};

export const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};