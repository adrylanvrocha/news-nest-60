-- Corrigir problemas de segurança do linter

-- 1. Corrigir search_path nas funções existentes
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.log_access_attempt(
  user_id UUID,
  action TEXT,
  resource TEXT,
  success BOOLEAN DEFAULT true
)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.access_logs (user_id, action, resource, success, created_at)
  VALUES (user_id, action, resource, success, now());
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorar erros de log para não interromper operações principais
    NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_identifier TEXT,
  action_type TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Contar tentativas na janela de tempo
  SELECT COUNT(*) INTO attempt_count
  FROM public.access_logs
  WHERE 
    (user_id::TEXT = user_identifier OR ip_address::TEXT = user_identifier)
    AND action = action_type
    AND created_at > (now() - interval '1 minute' * window_minutes);
  
  RETURN attempt_count < max_attempts;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, permitir acesso para não bloquear usuários
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log mudanças em tabelas críticas
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    PERFORM public.log_access_attempt(
      auth.uid(),
      TG_OP || '_' || TG_TABLE_NAME,
      COALESCE(OLD.id::TEXT, NEW.id::TEXT)
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;