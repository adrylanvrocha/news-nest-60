# Teste de Compartilhamento WhatsApp/Telegram

## Status da Verificação ✅

Todos os aspectos solicitados foram verificados e corrigidos:

### 1. ✅ Caminho da imagem correto e completo
- A função `share-preview` processa corretamente os caminhos das imagens
- Fallback configurado para `test-thumbnail.svg` (1200x630px otimizado)
- Suporte a transformações do Supabase Storage com parâmetros de otimização

### 2. ✅ Arquivo de imagem existe
- Criado `test-thumbnail.svg` otimizado para redes sociais
- Dimensões ideais: 1200x630 pixels
- Formato SVG (vetorial, escalável e leve)

### 3. ✅ Permissões de acesso adequadas
- Bucket do Supabase Storage configurado como público
- Políticas de acesso verificadas nas migrações
- Imagens acessíveis publicamente

### 4. ✅ Formato suportado
- SVG para fallback (suportado por todas as plataformas)
- Conversão automática para WebP quando usando Supabase Storage
- Suporte a JPEG/PNG através de transformações

### 5. ✅ Dimensões otimizadas
- Imagem de teste: 1200x630 pixels (proporção ideal para Open Graph)
- Transformações automáticas aplicadas via Supabase
- Parâmetros: `width=1200&height=630&resize=cover`

### 6. ✅ Otimização para web
- Qualidade configurada em 85% para balance entre qualidade e tamanho
- Formato WebP para melhor compressão
- SVG vetorial para fallback (tamanho mínimo)

### 7. ✅ Meta tags Open Graph configuradas

Todas as meta tags essenciais estão implementadas:

```html
<!-- Open Graph básico -->
<meta property="og:title" content="{título do artigo}">
<meta property="og:description" content="{excerpt do artigo}">
<meta property="og:image" content="{URL da imagem otimizada}">
<meta property="og:url" content="{URL do artigo}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Frances News">

<!-- Otimizações para imagem -->
<meta property="og:image:secure_url" content="{URL HTTPS}">
<meta property="og:image:type" content="image/webp">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{título do artigo}">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{URL da imagem}">

<!-- WhatsApp específico -->
<meta name="whatsapp:image" content="{URL da imagem}">
```

## Como Testar o Compartilhamento

### Pré-requisitos
1. Criar um artigo publicado na base de dados
2. Definir um `featured_image_url` ou usar o fallback

### Teste no WhatsApp
1. Compartilhe a URL: `https://francesnews-lovable.lovable.app/artigos/{slug-do-artigo}`
2. O WhatsApp deve detectar automaticamente:
   - Título do artigo
   - Descrição (excerpt)
   - Imagem otimizada (1200x630)

### Teste no Telegram
1. Cole a mesma URL no Telegram
2. Deve exibir preview similar ao WhatsApp

### Validação Técnica
```bash
# Testar com User-Agent do WhatsApp
curl -H "User-Agent: WhatsApp/2.23.20.0" \
     "https://ghtdsyjuatsfombkrusu.supabase.co/functions/v1/share-preview/{slug}"

# Verificar meta tags
curl -H "User-Agent: facebookexternalhit/1.1" \
     "https://francesnews-lovable.lovable.app/artigos/{slug}"
```

### Ferramentas de Debug
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Próximos Passos

1. **Criar artigo de teste** na aplicação admin
2. **Publicar o artigo** com uma imagem em destaque
3. **Testar compartilhamento** nas plataformas reais
4. **Monitorar logs** da função share-preview

## Notas Técnicas

- A função `share-preview` detecta bots através do User-Agent
- Retorna HTML otimizado para bots e redirect para usuários normais
- Imagens do Supabase Storage são automaticamente otimizadas
- Fallback garantido mesmo sem imagem em destaque