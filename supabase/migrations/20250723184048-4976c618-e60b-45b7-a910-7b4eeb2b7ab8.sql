-- Create a storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 
  'media', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'audio/mpeg', 'application/pdf']
);

-- Create policies for media bucket
CREATE POLICY "Media files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Authors can upload media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authors can delete their own media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media' AND auth.uid() IS NOT NULL);

-- Create banners table for ad management
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'TOP' CHECK (position IN ('TOP', 'SIDEBAR', 'BETWEEN_ARTICLES', 'FOOTER')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Create policies for banners
CREATE POLICY "Anyone can view active banners" 
ON public.banners 
FOR SELECT 
USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

CREATE POLICY "Editors can manage all banners" 
ON public.banners 
FOR ALL 
USING (EXISTS (
  SELECT 1 
  FROM profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'editor')
));

-- Add trigger for updated_at
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();