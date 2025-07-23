-- Fix search_path for security in all functions
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';