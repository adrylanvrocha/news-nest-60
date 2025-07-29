-- Melhorar segurança do backend

-- 1. Criar função para auditoria de acesso
CREATE OR REPLACE FUNCTION public.log_access_attempt(
  user_id UUID,
  action TEXT,
  resource TEXT,
  success BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.access_logs (user_id, action, resource, success, created_at)
  VALUES (user_id, action, resource, success, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar tabela de logs de acesso
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  success BOOLEAN DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Habilitar RLS na tabela de logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- 4. Apenas admins podem ver logs de acesso
CREATE POLICY "Only admins can view access logs" ON public.access_logs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 5. Criar função para verificar rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_identifier TEXT,
  action_type TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Melhorar política de artigos para incluir auditoria
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
CREATE POLICY "Anyone can view published articles" ON public.articles
FOR SELECT USING (
  status = 'published' AND
  (
    -- Log da visualização para auditoria
    public.log_access_attempt(auth.uid(), 'view_article', id::TEXT),
    true
  )
);

-- 7. Política mais restritiva para comentários
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments" ON public.comments
FOR INSERT WITH CHECK (
  auth.uid() = author_id AND
  public.check_rate_limit(auth.uid()::TEXT, 'create_comment', 3, 10)
);

-- 8. Função para verificar permissões administrativas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. Função para verificar permissões de editor
CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 10. Melhorar políticas usando as funções de segurança
DROP POLICY IF EXISTS "Editors can manage all articles" ON public.articles;
CREATE POLICY "Editors can manage all articles" ON public.articles
FOR ALL USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can manage categories" ON public.categories;
CREATE POLICY "Editors can manage categories" ON public.categories
FOR ALL USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can manage all banners" ON public.banners;
CREATE POLICY "Editors can manage all banners" ON public.banners
FOR ALL USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can manage all comments" ON public.comments;
CREATE POLICY "Editors can manage all comments" ON public.comments
FOR ALL USING (public.is_editor_or_admin());

DROP POLICY IF EXISTS "Editors can manage all podcasts" ON public.podcasts;
CREATE POLICY "Editors can manage all podcasts" ON public.podcasts
FOR ALL USING (public.is_editor_or_admin());

-- 11. Política de newsletter apenas para admins
DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can manage newsletter subscribers" ON public.newsletter_subscribers
FOR ALL USING (public.is_admin());

-- 12. Criar trigger para log automático de mudanças sensíveis
CREATE OR REPLACE FUNCTION public.audit_sensitive_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Aplicar triggers de auditoria
CREATE TRIGGER audit_articles_changes
  AFTER UPDATE OR DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

CREATE TRIGGER audit_users_changes
  AFTER UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_changes();

-- 14. Política de storage mais restritiva
DROP POLICY IF EXISTS "Authors can upload media" ON storage.objects;
CREATE POLICY "Authors can upload media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media' AND
  auth.uid()::TEXT = (storage.foldername(name))[1] AND
  public.check_rate_limit(auth.uid()::TEXT, 'upload_media', 10, 60)
);

DROP POLICY IF EXISTS "Authors can update own media" ON storage.objects;
CREATE POLICY "Authors can update own media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authors can delete own media" ON storage.objects;
CREATE POLICY "Authors can delete own media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media' AND
  (
    auth.uid()::TEXT = (storage.foldername(name))[1] OR
    public.is_editor_or_admin()
  )
);

-- 15. Índices para performance das consultas de segurança
CREATE INDEX IF NOT EXISTS idx_access_logs_user_time ON public.access_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_time ON public.access_logs(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);