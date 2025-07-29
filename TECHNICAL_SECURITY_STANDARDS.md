# Padrões Técnicos de Segurança

## Resumo Executivo

Este documento estabelece os padrões mínimos de segurança que devem ser implementados em todos os sistemas de gestão de conteúdo da organização. As diretrizes aqui definidas garantem proteção contra vulnerabilidades comuns, auditoria completa de ações e controle granular de acesso.

---

## 1. Arquitetura de Segurança Obrigatória

### 1.1 Sistema de Auditoria
**Requisito Obrigatório**: Todo sistema DEVE implementar logging completo de ações.

#### Implementação Técnica:
```sql
-- Tabela de logs de acesso obrigatória
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  success BOOLEAN DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Função de logging segura
CREATE OR REPLACE FUNCTION log_access_attempt(
  user_id uuid, 
  action text, 
  resource text, 
  success boolean DEFAULT true
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO access_logs (user_id, action, resource, success, created_at)
  VALUES (user_id, action, resource, success, now());
EXCEPTION
  WHEN OTHERS THEN NULL; -- Não interromper operações principais
END;
$$;
```

**Critérios de Conformidade**:
- ✅ Logs de todas operações CRUD em dados sensíveis
- ✅ Rastreamento de IP e user agent
- ✅ Resistência a falhas (logs não podem quebrar funcionalidades)

---

### 1.2 Controle de Taxa (Rate Limiting)
**Requisito Obrigatório**: Proteção contra ataques de força bruta e spam.

#### Implementação Técnica:
```sql
CREATE OR REPLACE FUNCTION check_rate_limit(
  user_identifier text,
  action_type text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 15
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM access_logs
  WHERE 
    (user_id::TEXT = user_identifier OR ip_address::TEXT = user_identifier)
    AND action = action_type
    AND created_at > (now() - interval '1 minute' * window_minutes);
  
  RETURN attempt_count < max_attempts;
EXCEPTION
  WHEN OTHERS THEN RETURN true; -- Failsafe
END;
$$;
```

**Parâmetros Padrão**:
- Comentários: 3 tentativas por 10 minutos
- Login: 5 tentativas por 15 minutos
- Upload de arquivos: 10 tentativas por 30 minutos

---

## 2. Row-Level Security (RLS) Obrigatório

### 2.1 Funções de Segurança Padronizadas
**Requisito**: Toda aplicação DEVE implementar estas funções base.

```sql
-- Verificação de admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Verificação de editor ou admin
CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
END;
$$;
```

### 2.2 Hierarquia de Permissões Padrão
**Obrigatório**: Sistema de roles com hierarquia clara.

| Role | Nível | Permissões |
|------|-------|------------|
| `admin` | 4 | Acesso total, gerenciamento de usuários |
| `editor` | 3 | Gerencia conteúdo de todos os autores |
| `author` | 2 | Gerencia apenas próprio conteúdo |
| `subscriber` | 1 | Apenas leitura de conteúdo público |

### 2.3 Políticas RLS Obrigatórias por Tipo de Tabela

#### Tabelas de Conteúdo (artigos, posts, etc.):
```sql
-- Visualização pública apenas de conteúdo publicado
CREATE POLICY "public_published_content" ON content_table
FOR SELECT USING (status = 'published');

-- Autores gerenciam próprio conteúdo
CREATE POLICY "authors_own_content" ON content_table
FOR ALL USING (auth.uid() = author_id);

-- Editores gerenciam todo conteúdo
CREATE POLICY "editors_all_content" ON content_table
FOR ALL USING (is_editor_or_admin());
```

#### Tabelas de Comentários:
```sql
-- Rate limiting integrado
CREATE POLICY "rate_limited_comments" ON comments
FOR INSERT WITH CHECK (
  auth.uid() = author_id AND 
  check_rate_limit(auth.uid()::text, 'create_comment', 3, 10)
);
```

#### Dados Administrativos:
```sql
-- Apenas admins
CREATE POLICY "admin_only" ON admin_table
FOR ALL USING (is_admin());
```

---

## 3. Proteções Contra Vulnerabilidades Comuns

### 3.1 SQL Injection
**Obrigatório**: Todas as funções DEVEM usar `SET search_path = public`.

```sql
-- ✅ CORRETO
CREATE FUNCTION secure_function()
SECURITY DEFINER
SET search_path = public
-- ❌ INCORRETO - vulnerável a path injection
CREATE FUNCTION insecure_function()
SECURITY DEFINER
-- sem SET search_path
```

### 3.2 Privilege Escalation
**Requisitos**:
- Funções sensíveis DEVEM usar `SECURITY DEFINER`
- Verificações de permissão DEVEM ser feitas via funções, não queries diretas
- Políticas RLS DEVEM evitar referências circulares

### 3.3 Data Leakage
**Proteções Obrigatórias**:
- Logs de auditoria acessíveis apenas a admins
- Dados pessoais protegidos por RLS específico
- Soft delete para dados sensíveis (nunca DELETE físico)

---

## 4. Performance e Índices de Segurança

### 4.1 Índices Obrigatórios
```sql
-- Para rate limiting eficiente
CREATE INDEX idx_access_logs_rate_limit 
ON access_logs (user_id, action, created_at) 
WHERE created_at > (now() - interval '1 hour');

-- Para consultas de conteúdo público
CREATE INDEX idx_content_public 
ON content_table (status, published_at) 
WHERE status = 'published';

-- Para limpeza de logs
CREATE INDEX idx_access_logs_cleanup 
ON access_logs (created_at);
```

---

## 5. Controle de Storage/Arquivos

### 5.1 Políticas de Storage Obrigatórias
```sql
-- Upload autorizado
CREATE POLICY "authenticated_upload" ON storage.objects
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Estrutura por usuário
CREATE POLICY "user_folder_structure" ON storage.objects
FOR ALL USING (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Deleção apenas para editores
CREATE POLICY "editor_delete" ON storage.objects
FOR DELETE USING (is_editor_or_admin());
```

---

## 6. Monitoramento e Alertas

### 6.1 Triggers de Auditoria Obrigatórios
```sql
-- Em todas as tabelas sensíveis
CREATE TRIGGER audit_trigger
AFTER UPDATE OR DELETE ON sensitive_table
FOR EACH ROW EXECUTE FUNCTION audit_sensitive_changes();
```

### 6.2 Métricas de Segurança a Monitorar
- Tentativas de login falhadas por IP
- Acessos a dados sensíveis fora do horário comercial  
- Operações em massa (bulk operations)
- Mudanças em configurações críticas

---

## 7. Implementação e Compliance

### 7.1 Checklist de Conformidade

#### ✅ Auditoria
- [ ] Tabela `access_logs` implementada
- [ ] Função `log_access_attempt()` ativa
- [ ] Triggers de auditoria em tabelas críticas
- [ ] Retenção de logs configurada (mínimo 90 dias)

#### ✅ Controle de Acesso
- [ ] Funções `is_admin()` e `is_editor_or_admin()` implementadas
- [ ] Hierarquia de roles definida e aplicada
- [ ] RLS ativo em todas as tabelas
- [ ] Políticas testadas para cada role

#### ✅ Rate Limiting
- [ ] Função `check_rate_limit()` implementada
- [ ] Integrada em operações críticas (comentários, uploads)
- [ ] Parâmetros configurados por tipo de operação

#### ✅ Proteção de Dados
- [ ] `SET search_path = public` em todas as funções
- [ ] `SECURITY DEFINER` aplicado adequadamente
- [ ] Storage protegido por RLS
- [ ] Backup de dados de auditoria configurado

### 7.2 Processo de Revisão
1. **Code Review Obrigatório**: Todas as mudanças de segurança devem passar por revisão técnica
2. **Testes de Penetração**: Semestrais, focando em RLS e rate limiting
3. **Auditoria de Logs**: Mensal, verificando padrões anômalos
4. **Atualização de Políticas**: Trimestral, acompanhando mudanças no sistema

---

## 8. Próximos Passos para Novos Sistemas

### 8.1 Template de Implementação
1. Copie as funções base (`is_admin`, `is_editor_or_admin`, `log_access_attempt`, `check_rate_limit`)
2. Implemente a tabela `access_logs` com índices apropriados
3. Configure RLS em todas as tabelas seguindo os padrões definidos
4. Adicione triggers de auditoria em tabelas sensíveis
5. Configure storage com políticas restritivas
6. Execute checklist de conformidade completo

### 8.2 Ferramentas Recomendadas
- **Supabase Database Linter**: Para verificação automática de RLS
- **pg_stat_statements**: Para monitoramento de performance
- **Logs estruturados**: JSON format para análise automatizada

---

## Conclusão

Este documento estabelece o padrão mínimo de segurança. Sistemas que não atendam a estes requisitos NÃO devem ir para produção. A implementação completa destes padrões garante proteção contra as principais vulnerabilidades de segurança em aplicações web modernas.

**Responsabilidade**: Arquitetos de software e Tech Leads devem garantir que novos sistemas sigam 100% destas diretrizes antes da primeira release.