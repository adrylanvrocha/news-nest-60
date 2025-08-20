-- Create function to increment article view count
CREATE OR REPLACE FUNCTION public.increment_view_count(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.articles 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = article_id;
END;
$function$;

-- Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO authenticated;