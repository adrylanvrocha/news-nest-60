const SUPABASE_URL = 'https://ghtdsyjuatsfombkrusu.supabase.co';

export const normalizeImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  // If it's already an absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a Supabase storage path, prefix with the Supabase URL
  if (url.startsWith('/storage/v1/object/public/')) {
    return `${SUPABASE_URL}${url}`;
  }
  
  // If it's just a relative path, assume it's a Supabase storage path
  if (url.startsWith('/') || url.startsWith('storage/')) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${SUPABASE_URL}${cleanUrl}`;
  }
  
  return url;
};

export const normalizeOgImage = (url: string | null | undefined): string | undefined => {
  const normalizedUrl = normalizeImageUrl(url);
  if (!normalizedUrl) return undefined;
  
  // Add resize parameters for Open Graph images
  if (normalizedUrl.includes('supabase.co')) {
    return `${normalizedUrl}?width=1200&height=630&resize=cover&quality=85&format=jpeg`;
  }
  
  return normalizedUrl;
};