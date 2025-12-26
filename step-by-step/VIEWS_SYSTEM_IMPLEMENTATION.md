# Implementação: Sistema de Visualizações - Step by Step

## ✅ Status: Implementação Completa

Sistema profissional de contagem de visualizações implementado com sucesso, seguindo as melhores práticas de mercado.

---

## 📋 Resumo da Implementação

### O que foi implementado:

1. ✅ **Tabela `views`** no banco de dados (logs completos auditáveis)
2. ✅ **Função PostgreSQL `register_view()`** (validação de intervalo de 30 minutos)
3. ✅ **API Route `/api/views/register`** (validação no servidor)
4. ✅ **Utilitário de Session ID** (gerenciamento de sessões)
5. ✅ **Hook `useViewTracking`** (integração React)
6. ✅ **Integração nas páginas** (templates e tier lists)
7. ✅ **Atualização de serviços** (compatibilidade mantida)

---

## 🔧 Arquivos Criados/Modificados

### Novos Arquivos

1. **`supabase/migrations/007_add_views_system.sql`**
   - Tabela `views` com estrutura completa
   - Função `register_view()` com validação de intervalo
   - Índices otimizados para performance
   - Comentários e documentação

2. **`src/lib/utils/session.ts`**
   - Gerenciamento de `session_id` (UUID v4)
   - Armazenamento em cookie (persistente)
   - Funções: `generateSessionId()`, `getOrCreateSessionId()`, `setSessionIdCookie()`, `clearSessionId()`

3. **`src/app/api/views/register/route.ts`**
   - API route POST para registrar visualizações
   - Validação no servidor
   - Captura de metadados (IP, user_agent, referrer)
   - Integração com função PostgreSQL

4. **`src/hooks/useViewTracking.ts`**
   - Hook React para rastrear visualizações
   - Registro automático no mount
   - Tratamento de erros silencioso

5. **`src/components/tier-lists/TierListPageClient.tsx`**
   - Componente cliente para página de tier list
   - Integração com `useViewTracking`

### Arquivos Modificados

1. **`src/services/template.service.ts`**
   - Método `incrementViews()` marcado como `@deprecated`
   - Documentação atualizada

2. **`src/services/tierList.service.ts`**
   - Método `incrementViews()` marcado como `@deprecated`
   - Documentação atualizada

3. **`src/app/(public)/templates/[id]/page.tsx`**
   - Removida chamada antiga de `incrementViews()`
   - Comentário explicando novo sistema

4. **`src/components/templates/TemplatePageClient.tsx`**
   - Adicionado `useViewTracking('template', template.id)`

5. **`src/app/(public)/tier-lists/[id]/page.tsx`**
   - Removida chamada antiga de `incrementViews()`
   - Usa novo componente `TierListPageClient`

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `views`

```sql
CREATE TABLE views (
  id UUID PRIMARY KEY,
  user_id UUID (nullable, para usuários autenticados),
  session_id TEXT (nullable, para usuários não autenticados),
  content_type TEXT ('template' | 'tier_list'),
  content_id UUID,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE
);
```

### Função `register_view()`

- **Parâmetros**: `user_id`, `session_id`, `content_type`, `content_id`, `ip_address`, `user_agent`, `referrer`
- **Retorno**: `'counted'` (contabilizada), `'ignored'` (ignorada dentro de 30min), `'error: ...'` (erro)
- **Lógica**:
  1. Valida parâmetros
  2. Verifica última visualização (por `user_id` ou `session_id`)
  3. Se passou 30 minutos ou não há visualização anterior:
     - Insere registro em `views`
     - Incrementa `views_count` na tabela correspondente
     - Retorna `'counted'`
  4. Caso contrário, retorna `'ignored'`

### Índices Criados

1. `idx_views_user_recent`: Para validação rápida por usuário autenticado
2. `idx_views_session_recent`: Para validação rápida por sessão
3. `idx_views_content_analytics`: Para analytics por conteúdo
4. `idx_views_temporal`: Para analytics temporal

---

## 🔄 Fluxo de Dados

### 1. Usuário Acessa Página

```
Usuário → /templates/[id] ou /tier-lists/[id]
```

### 2. Componente Cliente é Montado

```
TemplatePageClient ou TierListPageClient
  ↓
useViewTracking('template' | 'tier_list', contentId)
```

### 3. Hook Registra Visualização

```
useViewTracking
  ↓
getOrCreateSessionId() (obtém/cria session_id do cookie)
  ↓
POST /api/views/register
  {
    content_type: 'template' | 'tier_list',
    content_id: UUID,
    session_id: UUID v4
  }
```

### 4. API Route Processa

```
POST /api/views/register
  ↓
Extrai user_id (se autenticado)
  ↓
Captura metadados (IP, user_agent, referrer)
  ↓
Chama supabase.rpc('register_view', {...})
```

### 5. Função PostgreSQL Valida e Registra

```
register_view()
  ↓
Verifica última visualização (últimos 30 minutos)
  ↓
Se válida:
  - INSERT INTO views (...)
  - UPDATE templates/tier_lists SET views_count = views_count + 1
  - Retorna 'counted'
Se ignorada:
  - Retorna 'ignored'
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Intervalo Mínimo de 30 Minutos

- Validação no servidor (não pode ser burlada)
- Mesmo usuário/sessão não pode contar múltiplas visualizações em 30 minutos
- Visualizações após 30 minutos são contabilizadas normalmente

### ✅ Identificação Híbrida

- **Usuários Autenticados**: Usa `user_id` do Supabase Auth
- **Usuários Não Autenticados**: Usa `session_id` (UUID v4 em cookie)
- Cobre todos os casos sem forçar login

### ✅ Logs Completos Auditáveis

- Cada visualização registrada com:
  - `user_id` ou `session_id`
  - `content_type` e `content_id`
  - `ip_address`, `user_agent`, `referrer`
  - `viewed_at` (timestamp)
- Permite validação externa para patrocinadores

### ✅ Atualização Automática de Contadores

- `views_count` nas tabelas `templates` e `tier_lists` atualizado automaticamente
- Mantém compatibilidade com código existente
- Queries rápidas sem JOINs

### ✅ Prevenção de Fraude Básica

- Intervalo mínimo evita refresh spam
- IP tracking para detecção de padrões suspeitos
- User agent para identificação adicional

---

## 📊 Como Usar

### Para Desenvolvedores

#### Registrar Visualização em Novo Componente

```tsx
import { useViewTracking } from '@/hooks/useViewTracking'

export function MyComponent({ templateId }: { templateId: string }) {
  // Registra visualização automaticamente
  useViewTracking('template', templateId)
  
  return <div>...</div>
}
```

#### Desabilitar Rastreamento (Opcional)

```tsx
useViewTracking('template', templateId, false) // enabled = false
```

### Para Administradores

#### Ver Visualizações no Banco

```sql
-- Todas as visualizações
SELECT * FROM views ORDER BY viewed_at DESC;

-- Visualizações de um template específico
SELECT * FROM views 
WHERE content_type = 'template' 
  AND content_id = '...'
ORDER BY viewed_at DESC;

-- Visualizações únicas (últimos 30 dias)
SELECT 
  content_type,
  content_id,
  COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_views,
  COUNT(*) as total_views
FROM views
WHERE viewed_at >= NOW() - INTERVAL '30 days'
GROUP BY content_type, content_id
ORDER BY unique_views DESC;
```

#### Exportar Dados para Relatórios

```sql
-- Exportar para CSV (via Supabase Dashboard ou psql)
COPY (
  SELECT * FROM views 
  WHERE viewed_at >= '2025-01-01'
) TO '/tmp/views_export.csv' WITH CSV HEADER;
```

---

## 🧪 Testes Recomendados

### Testes Manuais

1. **Visualização Única Conta**
   - Acesse um template/tier list
   - Verifique que `views_count` incrementou
   - Verifique registro em `views`

2. **Refresh Não Conta (30min)**
   - Acesse um template/tier list
   - Dê refresh imediatamente
   - Verifique que `views_count` não incrementou novamente
   - Verifique que retornou `'ignored'` no log

3. **Após 30 Minutos Conta Novamente**
   - Acesse um template/tier list
   - Aguarde 30 minutos (ou altere timestamp no banco para teste)
   - Acesse novamente
   - Verifique que `views_count` incrementou

4. **Usuários Autenticados**
   - Faça login
   - Acesse um template/tier list
   - Verifique que `user_id` está preenchido em `views`

5. **Usuários Não Autenticados**
   - Faça logout (ou use modo anônimo)
   - Acesse um template/tier list
   - Verifique que `session_id` está preenchido em `views`
   - Verifique que cookie foi criado

---

## ⚠️ Observações Importantes

### 1. Migration Deve Ser Executada

Execute a migration `007_add_views_system.sql` no Supabase antes de usar:

```sql
-- No SQL Editor do Supabase
-- Execute o conteúdo de supabase/migrations/007_add_views_system.sql
```

### 2. Compatibilidade Mantida

- Métodos antigos `incrementViews()` ainda funcionam (marcados como deprecated)
- Código existente não quebra
- Migração gradual possível

### 3. Performance

- Índices otimizados para queries rápidas
- Validação de intervalo usa índices (performance O(log n))
- Sistema escalável para alto volume

### 4. Privacidade

- IP e user_agent são capturados (considerar LGPD/GDPR)
- Dados ficam no seu banco (você controla)
- Session ID em cookie (persistente por 1 ano)

---

## 🚀 Próximos Passos (Opcionais)

### Melhorias Futuras

1. **Dashboard de Analytics**
   - Visualizações por período
   - Top conteúdos mais visualizados
   - Taxa de retorno

2. **Cache Redis** (para muito alto tráfego)
   - Reduz carga no banco
   - Verificação rápida de visualizações recentes

3. **Detecção Avançada de Bots**
   - Análise de padrões
   - Machine learning

4. **Export de Dados**
   - Relatórios para negociações comerciais
   - CSV/JSON export automático

---

## 📝 Checklist de Validação

Após implementação, validar:

- [ ] Migration executada com sucesso
- [ ] Tabela `views` criada
- [ ] Função `register_view()` criada
- [ ] Índices criados
- [ ] API route `/api/views/register` funciona
- [ ] Hook `useViewTracking` funciona
- [ ] Visualizações são registradas
- [ ] Intervalo de 30 minutos funciona
- [ ] Usuários autenticados funcionam
- [ ] Usuários não autenticados funcionam
- [ ] Contadores são atualizados
- [ ] Logs estão completos

---

## ✅ Conclusão

Sistema de visualizações implementado com sucesso, seguindo as melhores práticas de mercado:

- ✅ Dados precisos e auditáveis
- ✅ Prevenção de fraude básica
- ✅ Escalável e performático
- ✅ Pronto para negociações comerciais

**Status**: Pronto para produção após validação dos testes.
