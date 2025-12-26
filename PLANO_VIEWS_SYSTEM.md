# Plano de Ação: Sistema de Visualizações

## 📊 Resumo Executivo

Implementação de sistema profissional de contagem de visualizações baseado em melhores práticas de mercado (YouTube, Medium, Dev.to), focado em:
- **Dados Precisos**: Métricas confiáveis para negociações comerciais
- **Auditabilidade**: Logs completos para validação externa
- **Prevenção de Fraude**: Proteção contra inflação artificial
- **Analytics**: Dados ricos para análise de engajamento

## 🎯 Decisões de Design

### 1. Intervalo Mínimo: 30 minutos
**Justificativa**: Padrão de mercado (YouTube, Medium). Evita inflação por refresh acidental, permite visualizações legítimas em momentos diferentes.

### 2. Identificação Híbrida
- **Usuários Autenticados**: `user_id` do Supabase Auth
- **Usuários Não Autenticados**: `session_id` (UUID v4 em cookie)
- **Benefício**: Cobre todos os casos sem forçar login

### 3. Armazenamento: Tabela de Logs + Contadores Agregados
- **Tabela `views`**: Logs completos para auditoria e analytics
- **`views_count`**: Contador agregado para queries rápidas
- **Benefício**: Performance + Auditabilidade

### 4. Metadados Capturados
- IP address (para detecção de padrões suspeitos)
- User agent (navegador/dispositivo)
- Referrer (de onde veio, opcional)
- **Benefício**: Prevenção básica de fraude e analytics

## 📋 Fases de Implementação

### **FASE 1: Banco de Dados** ⏱️ ~30min

#### 1.1. Migration: Tabela `views`
- Criar tabela com estrutura completa
- Índices otimizados para performance
- Constraints para integridade

#### 1.2. Migration: Função `register_view()`
- Validação de intervalo mínimo (30min)
- Registro de visualização
- Atualização de contador agregado
- Retorno de status

#### 1.3. Migration: Índices e Otimizações
- Índices para queries de validação
- Índices para analytics
- Otimização de performance

**Arquivos:**
- `supabase/migrations/007_add_views_system.sql`

---

### **FASE 2: API e Utilitários** ⏱️ ~45min

#### 2.1. API Route: `/api/views/register`
- Endpoint POST para registrar visualizações
- Validação no servidor
- Captura de metadados (IP, user_agent, referrer)
- Integração com função PostgreSQL

#### 2.2. Utilitário: Gerenciamento de Session ID
- Função para gerar/recuperar `session_id`
- Armazenamento em cookie (persistente)
- Compatível com SSR do Next.js

**Arquivos:**
- `src/app/api/views/register/route.ts`
- `src/lib/utils/session.ts`

---

### **FASE 3: Serviços e Hooks** ⏱️ ~30min

#### 3.1. Hook: `useViewTracking`
- Hook React para rastrear visualizações
- Gerencia `session_id` no cliente
- Chama API de registro
- Tratamento de erros

#### 3.2. Atualização de Serviços
- Refatorar `TemplateService.incrementViews()`
- Refatorar `TierListService.incrementViews()`
- Manter compatibilidade com código existente

**Arquivos:**
- `src/hooks/useViewTracking.ts`
- `src/services/template.service.ts` (atualizar)
- `src/services/tierList.service.ts` (atualizar)

---

### **FASE 4: Integração Frontend** ⏱️ ~20min

#### 4.1. Atualização de Páginas
- `/templates/[id]`: Integrar `useViewTracking`
- `/tier-lists/[id]`: Integrar `useViewTracking`
- Remover chamadas antigas de `incrementViews()`

**Arquivos:**
- `src/app/(public)/templates/[id]/page.tsx` (atualizar)
- `src/app/(public)/tier-lists/[id]/page.tsx` (atualizar)

---

### **FASE 5: Testes e Validação** ⏱️ ~20min

#### 5.1. Testes Manuais
- ✅ Visualização única conta
- ✅ Refresh dentro de 30min não conta
- ✅ Visualização após 30min conta novamente
- ✅ Usuários autenticados funcionam
- ✅ Usuários não autenticados funcionam

#### 5.2. Validação de Dados
- Verificar logs na tabela `views`
- Verificar atualização de `views_count`
- Validar metadados capturados

---

## 🔍 Detalhamento Técnico

### Estrutura da Tabela `views`

```sql
CREATE TABLE views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('template', 'tier_list')),
  content_id UUID NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT views_user_or_session CHECK (
    (user_id IS NOT NULL) OR (session_id IS NOT NULL)
  )
);
```

### Função `register_view()`

```sql
CREATE OR REPLACE FUNCTION register_view(
  p_user_id UUID,
  p_session_id TEXT,
  p_content_type TEXT,
  p_content_id UUID,
  p_ip_address INET,
  p_user_agent TEXT,
  p_referrer TEXT
) RETURNS TEXT AS $$
DECLARE
  v_last_view TIMESTAMP WITH TIME ZONE;
  v_min_interval INTERVAL := '30 minutes';
BEGIN
  -- Verificar última visualização
  IF p_user_id IS NOT NULL THEN
    SELECT MAX(viewed_at) INTO v_last_view
    FROM views
    WHERE user_id = p_user_id
      AND content_type = p_content_type
      AND content_id = p_content_id;
  ELSE
    SELECT MAX(viewed_at) INTO v_last_view
    FROM views
    WHERE session_id = p_session_id
      AND content_type = p_content_type
      AND content_id = p_content_id;
  END IF;

  -- Se não há visualização anterior ou passou o intervalo mínimo
  IF v_last_view IS NULL OR (NOW() - v_last_view) >= v_min_interval THEN
    -- Registrar visualização
    INSERT INTO views (
      user_id, session_id, content_type, content_id,
      ip_address, user_agent, referrer
    ) VALUES (
      p_user_id, p_session_id, p_content_type, p_content_id,
      p_ip_address, p_user_agent, p_referrer
    );

    -- Atualizar contador agregado
    IF p_content_type = 'template' THEN
      UPDATE templates SET views_count = views_count + 1 WHERE id = p_content_id;
    ELSIF p_content_type = 'tier_list' THEN
      UPDATE tier_lists SET views_count = views_count + 1 WHERE id = p_content_id;
    END IF;

    RETURN 'counted';
  ELSE
    RETURN 'ignored';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### API Route

```typescript
// POST /api/views/register
{
  content_type: 'template' | 'tier_list',
  content_id: string,
  session_id: string
}
```

### Hook `useViewTracking`

```typescript
useViewTracking(contentType: 'template' | 'tier_list', contentId: string)
```

- Gera/recupera `session_id` do cookie
- Chama API no mount do componente
- Trata erros silenciosamente (não quebra UX)

---

## ✅ Checklist de Implementação

### Fase 1: Banco de Dados
- [ ] Migration: Tabela `views`
- [ ] Migration: Função `register_view()`
- [ ] Migration: Índices otimizados
- [ ] Teste: Função funciona corretamente

### Fase 2: API e Utilitários
- [ ] API Route: `/api/views/register`
- [ ] Utilitário: Gerenciamento de `session_id`
- [ ] Teste: API funciona corretamente

### Fase 3: Serviços e Hooks
- [ ] Hook: `useViewTracking`
- [ ] Service: Atualizar `TemplateService`
- [ ] Service: Atualizar `TierListService`
- [ ] Teste: Hook funciona corretamente

### Fase 4: Integração Frontend
- [ ] Page: Atualizar `/templates/[id]`
- [ ] Page: Atualizar `/tier-lists/[id]`
- [ ] Teste: Visualizações são registradas

### Fase 5: Validação
- [ ] Teste: Visualização única conta
- [ ] Teste: Refresh não conta (30min)
- [ ] Teste: Após 30min conta novamente
- [ ] Teste: Usuários autenticados
- [ ] Teste: Usuários não autenticados
- [ ] Validação: Dados no banco

---

## 🚀 Próximos Passos Após Implementação

1. **Dashboard de Analytics** (Futuro)
   - Visualizações por período
   - Top conteúdos mais visualizados
   - Taxa de retorno

2. **Cache Redis** (Futuro, se necessário)
   - Para sites de muito alto tráfego
   - Reduz carga no banco

3. **Detecção Avançada de Bots** (Futuro)
   - Análise de padrões
   - Machine learning

4. **Export de Dados** (Futuro)
   - Relatórios para negociações comerciais
   - CSV/JSON export

---

## 📊 Métricas Esperadas

### Antes (Sistema Atual)
- ❌ Refresh conta como nova visualização
- ❌ Sem auditoria
- ❌ Dados não confiáveis

### Depois (Sistema Novo)
- ✅ Refresh ignorado (30min)
- ✅ Logs completos auditáveis
- ✅ Dados confiáveis para negociações
- ✅ Analytics rico disponível

---

## ⚠️ Considerações

1. **Performance**: Sistema otimizado com índices, mas monitorar em produção
2. **Escalabilidade**: Preparado para crescimento, cache Redis pode ser adicionado depois
3. **Privacidade**: IP e user_agent são capturados (considerar LGPD/GDPR no futuro)
4. **Compatibilidade**: Mantém `views_count` para compatibilidade com código existente

---

## 🎯 Aprovação

Este plano está pronto para implementação. Após sua aprovação, seguirei as fases em ordem, documentando cada etapa no arquivo `step-by-step/VIEWS_SYSTEM_IMPLEMENTATION.md`.

**Tempo Estimado Total**: ~2h30min
**Complexidade**: Média
**Impacto**: Alto (dados precisos para negociações comerciais)

