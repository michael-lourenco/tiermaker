# Implementação da Página /tierlists

## Objetivo
Criar uma página pública onde usuários possam visualizar e interagir com tier lists criadas por outros usuários, com sistema de cache otimizado para performance.

## Data de Implementação
05/01/2026

## Fases Implementadas

### Fase 1: Estrutura de Cache no Banco de Dados

#### Arquivo: `supabase/migrations/013_add_tier_lists_cache.sql`

**Descrição:**
Migration completa para criar sistema de cache diário de tier lists públicas.

**Estrutura da Tabela `tier_lists_cache`:**
- `id`: UUID primário
- `tier_list_id`: Referência à tier list original
- `template_id`, `template_name`: Informações do template
- `category_id`, `category_name`, `category_slug`: Informações da categoria
- `user_id`, `user_email`: Informações do criador
- `title`: Título da tier list
- `views_count`, `likes_count`: Estatísticas
- `created_at`: Data de criação original
- `tier_list_data`: JSONB com estrutura completa (tiers + items)
- `cached_at`: Data/hora do cache
- `cache_date`: Coluna gerada (DATE) para indexação eficiente

**Funções PostgreSQL:**
1. `generate_tier_lists_cache()`: Gera cache para o dia atual
2. `tier_lists_cache_exists()`: Verifica se cache existe para hoje
3. `ensure_tier_lists_cache()`: Garante que cache existe (gera se necessário)
4. `clean_old_tier_lists_cache()`: Remove cache antigo (>7 dias)

**Triggers:**
- `tier_lists_cache_update_trigger`: Atualiza cache quando tier list é modificada (views, likes, title)
- `tier_lists_cache_delete_trigger`: Remove do cache quando tier list é deletada
- `tier_lists_cache_private_trigger`: Remove do cache quando tier list vira privada

**Índices:**
- Índices otimizados para queries por data, template, categoria, usuário, views, likes, created_at
- Índice GIN para busca full-text em título (português)
- Índice parcial para cache do dia atual (query mais comum)

**RLS:**
- Política de leitura pública (qualquer um pode ler o cache)

### Fase 2: Service para Gerenciar Cache

#### Arquivo: `src/services/tierListCache.service.ts`

**Classe: `TierListCacheService`**

**Métodos Principais:**
- `cacheExistsForToday()`: Verifica se cache existe
- `ensureCache()`: Garante que cache existe
- `generateCache()`: Gera cache manualmente
- `cleanOldCache()`: Limpa cache antigo
- `getCachedTierLists(query)`: Busca tier lists com filtros, ordenação e paginação
- `getAvailableTemplates()`: Lista templates únicos no cache (para filtros)
- `getAvailableCategories()`: Lista categorias únicas no cache (para filtros)

**Funcionalidades:**
- Suporte a filtros: template_id, category_id, user_id, search (busca por título), period (today/week/month/all)
- Suporte a ordenação: recent, views, likes
- Paginação: limit e offset
- Retorna tier lists com dados completos (tiers + items) e informações adicionais (template_name, category_name, etc.)

### Fase 3: API Routes

#### Arquivo: `src/app/api/tierlists/route.ts`

**Endpoint: GET /api/tierlists**

**Query Parameters:**
- `template_id`: Filtrar por template
- `category_id`: Filtrar por categoria
- `user_id`: Filtrar por criador
- `search`: Busca por título
- `period`: today, week, month, all
- `sort`: recent, views, likes
- `limit`: Quantidade por página (padrão: 20)
- `offset`: Offset para paginação (padrão: 0)

**Resposta:**
```json
{
  "data": TierListWithData[],
  "total": number,
  "limit": number,
  "offset": number
}
```

#### Arquivo: `src/app/api/tierlists/[id]/like/route.ts`

**Endpoints:**
- `POST /api/tierlists/[id]/like`: Toggle like/unlike
- `GET /api/tierlists/[id]/like`: Verifica se usuário curtiu

**Funcionalidades:**
- Autenticação obrigatória para POST
- Atualiza `likes_count` na tabela `tier_lists`
- Cria/remove registro na tabela `likes`
- Retorna `{ liked: boolean }`

### Fase 4: Componentes de UI

#### Arquivo: `src/components/tier-lists/TierListCard.tsx`

**Componente: `TierListCard`**

**Funcionalidades:**
- Exibe thumbnail da tier list usando `TierListThumbnail`
- Badges dinâmicos: "Recém Criada" (últimas 24h), "Popular" (views > 100 ou likes > 10), categoria
- Estatísticas: views e likes com ícones
- Botão de like interativo (vermelho quando curtido)
- Informações: título, template, data de criação
- Ações: Ver, Compartilhar, Criar a partir do template
- Hover effects e transições suaves

**Props:**
- `tierList`: TierListWithData com informações adicionais (template_name, category_name, etc.)
- `onLike`: Callback quando like é alterado

#### Arquivo: `src/components/tier-lists/TierListsPageClient.tsx`

**Componente: `TierListsPageClient`**

**Funcionalidades:**
- Grid responsivo de cards (1 coluna mobile, 2 tablet, 3 desktop)
- Busca por título com debounce (500ms)
- Filtros: Template, Categoria, Período, Ordenação
- Scroll infinito usando Intersection Observer
- Loading states
- Contador de resultados
- Botão "Limpar Filtros"
- Ad spaces integrados (a cada 6 cards e no final)

**Estado:**
- `tierLists`: Lista de tier lists
- `total`: Total de resultados
- `loading`: Estado de carregamento
- `hasMore`: Se há mais resultados para carregar
- Filtros: search, templateFilter, categoryFilter, periodFilter, sort

**Hooks:**
- `useEffect` para reload quando filtros mudam
- `useCallback` para loadMore
- `useRef` para Intersection Observer target

#### Arquivo: `src/app/tierlists/page.tsx`

**Server Component: `TierListsPage`**

**Funcionalidades:**
- Garante que cache existe antes de renderizar
- Busca tier lists iniciais (20 primeiras, ordenadas por recent)
- Busca templates e categorias disponíveis para filtros
- Renderiza `TierListsPageClient` com dados iniciais
- Tratamento de erros com fallback

### Fase 5: Sistema de Likes

**Implementado em:**
- `src/app/api/tierlists/[id]/like/route.ts` (API)
- `src/components/tier-lists/TierListCard.tsx` (UI)

**Funcionalidades:**
- Toggle like/unlike
- Atualização em tempo real do contador
- Estado visual (coração preenchido quando curtido)
- Redirecionamento para login se não autenticado
- Sincronização com backend

### Fase 6: Funcionalidades Extras

**Badges Dinâmicos:**
- "Recém Criada": Tier lists criadas nas últimas 24 horas
- "Popular": Tier lists com >100 views ou >10 likes
- Badge de categoria (se disponível)

**Botão "Criar a partir do template":**
- Link para `/editor/[templateId]`
- Permite criar nova tier list baseada no template usado

**Link para perfil do criador:**
- Preparado para implementação futura (user_email disponível no cache)

**Preview ao hover:**
- Thumbnail visual da tier list no card
- Overlay com informações

## Otimizações de Performance

1. **Cache Diário:**
   - Cache gerado uma vez por dia
   - Verificação automática se cache existe antes de gerar
   - Limpeza automática de cache antigo (>7 dias)

2. **Índices Otimizados:**
   - Índices específicos para queries mais comuns
   - Índice parcial para cache do dia atual
   - Índice GIN para busca full-text

3. **Dados Pré-computados:**
   - Estrutura completa (tiers + items) armazenada como JSONB
   - Evita múltiplos joins a cada requisição
   - Informações adicionais (template_name, category_name) já incluídas

4. **Paginação e Scroll Infinito:**
   - Carrega 20 tier lists por vez
   - Scroll infinito para melhor UX
   - Intersection Observer para detecção eficiente

5. **Debounce na Busca:**
   - 500ms de delay para evitar requisições excessivas

## Arquivos Criados/Modificados

### Novos Arquivos:
1. `supabase/migrations/013_add_tier_lists_cache.sql`
2. `src/services/tierListCache.service.ts`
3. `src/app/api/tierlists/route.ts`
4. `src/app/api/tierlists/[id]/like/route.ts`
5. `src/components/tier-lists/TierListCard.tsx`
6. `src/components/tier-lists/TierListsPageClient.tsx`
7. `src/app/tierlists/page.tsx`

### Arquivos Modificados:
1. `src/types/tierList.types.ts` - Adicionados tipos para cache

## Próximos Passos (Opcional)

1. **Link para perfil do criador:**
   - Implementar página de perfil público
   - Adicionar link no card quando user_email disponível

2. **Comentários:**
   - Sistema de comentários nas tier lists (se necessário no futuro)

3. **Estatísticas agregadas:**
   - Total de tier lists públicas
   - Estatísticas gerais da comunidade

4. **Cache automático:**
   - Job agendado para gerar cache automaticamente (cron job ou Supabase Edge Function)

5. **Melhorias de UX:**
   - Skeleton loaders durante carregamento
   - Animações de transição
   - Toast notifications para ações (like, etc.)

## Notas Técnicas

- O cache é gerado usando `service_role` client para bypass RLS
- Cache é atualizado automaticamente via triggers quando tier lists são modificadas
- Sistema suporta múltiplos filtros simultâneos
- Busca usa `ilike` para case-insensitive matching
- Ordenação suporta múltiplos critérios (recent, views, likes)
- Ad spaces integrados seguindo padrão do sistema

## Testes Recomendados

1. Testar geração de cache
2. Testar filtros individuais e combinados
3. Testar busca por título
4. Testar ordenação
5. Testar scroll infinito
6. Testar sistema de likes
7. Testar responsividade (mobile/tablet/desktop)
8. Testar performance com grande volume de dados
