# Análise: Sistema de Visualizações - Práticas de Mercado

## 📊 Análise de Práticas do Mercado

### Como Plataformas Profissionais Contam Visualizações

#### 1. **YouTube / Medium / Dev.to**
- **Identificação Híbrida**: Usuários autenticados por `user_id`, não autenticados por `session_id` (cookie)
- **Intervalo Mínimo**: 30 minutos entre visualizações do mesmo usuário/sessão
- **Armazenamento**: Tabela de logs detalhada para auditoria e analytics
- **Prevenção de Fraude**: Filtragem de IPs internos, detecção de bots, rate limiting

#### 2. **Plataformas de Analytics (Google Analytics, Mixpanel)**
- **Unique Views**: Contagem baseada em identificador único (user_id ou session_id)
- **Time Window**: Janela de tempo para considerar visualização única (padrão: 30min-1h)
- **Session Tracking**: Rastreamento de sessões para distinguir visitas recorrentes
- **Audit Trail**: Logs completos para validação e compliance

#### 3. **Redes Sociais (Twitter, Instagram)**
- **Engagement Metrics**: Visualizações únicas separadas de visualizações totais
- **Time-based Deduplication**: Evita contagem duplicada em janelas de tempo
- **User Agent Tracking**: Identificação adicional por dispositivo/navegador

## 🎯 Proposta de Implementação - Padrão de Mercado

### Objetivos
1. **Dados Precisos**: Métricas confiáveis para negociações comerciais
2. **Auditabilidade**: Logs completos para validação externa
3. **Prevenção de Fraude**: Proteção contra inflação artificial
4. **Performance**: Sistema escalável sem impacto na experiência do usuário
5. **Analytics**: Dados ricos para análise de engajamento

### Arquitetura Proposta

#### 1. **Tabela de Visualizações (views)**
Armazena cada visualização com dados completos para auditoria:

```sql
CREATE TABLE views (
  id UUID PRIMARY KEY,
  -- Identificação do usuário (híbrida)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- Para usuários não autenticados
  
  -- Conteúdo visualizado
  content_type TEXT NOT NULL CHECK (content_type IN ('template', 'tier_list')),
  content_id UUID NOT NULL,
  
  -- Metadados para auditoria e prevenção de fraude
  ip_address INET, -- Para detecção de padrões suspeitos
  user_agent TEXT, -- Navegador/dispositivo
  referrer TEXT, -- De onde veio (opcional)
  
  -- Timestamps
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para performance
  CONSTRAINT views_user_or_session CHECK (
    (user_id IS NOT NULL) OR (session_id IS NOT NULL)
  )
);
```

**Benefícios:**
- ✅ Auditável: Cada visualização pode ser verificada
- ✅ Analytics: Permite análises detalhadas (unique views, views por período, etc.)
- ✅ Prevenção de Fraude: IP e user_agent ajudam a detectar bots
- ✅ Compliance: Dados completos para relatórios comerciais

#### 2. **Intervalo Mínimo de Tempo**
- **Padrão de Mercado**: 30 minutos
- **Justificativa**: 
  - Evita inflação por refresh acidental
  - Permite visualizações legítimas do mesmo usuário em momentos diferentes
  - Alinhado com práticas de YouTube, Medium, etc.

#### 3. **Identificação de Usuários**

**Usuários Autenticados:**
- Usar `user_id` do Supabase Auth
- Mais preciso e confiável
- Permite analytics por usuário

**Usuários Não Autenticados:**
- Usar `session_id` (gerado no cliente, armazenado em cookie)
- UUID v4 único por sessão do navegador
- Persiste enquanto o navegador não limpar cookies

**Vantagens da Abordagem Híbrida:**
- ✅ Cobre todos os casos (autenticados e não autenticados)
- ✅ Não força login para visualizar conteúdo
- ✅ Dados mais precisos para usuários autenticados

#### 4. **Função PostgreSQL para Registro**

Função otimizada que:
1. Verifica se já existe visualização recente (últimos 30min)
2. Se não existir, registra nova visualização
3. Incrementa contador agregado (`views_count`)
4. Retorna se foi contabilizada ou não

**Vantagens:**
- ✅ Atomicidade: Operação atômica no banco
- ✅ Performance: Índices otimizados
- ✅ Consistência: Evita race conditions

#### 5. **API Route para Registro**

Endpoint que:
1. Recebe requisição do cliente
2. Extrai `user_id` (se autenticado) ou gera/usa `session_id`
3. Captura metadados (IP, user_agent, referrer)
4. Chama função PostgreSQL
5. Retorna sucesso/falha

**Segurança:**
- ✅ Validação no servidor (não confia no cliente)
- ✅ Rate limiting (prevenção de spam)
- ✅ Filtragem de IPs internos (opcional, para dev)

#### 6. **Atualização de Contadores Agregados**

- `views_count` nas tabelas `templates` e `tier_lists` é atualizado automaticamente
- Mantém compatibilidade com código existente
- Permite queries rápidas sem JOINs

**Estratégia:**
- Incremento via trigger ou função PostgreSQL
- Mantém consistência entre tabela de logs e contadores

## 📈 Métricas e Analytics

### Dados Disponíveis

1. **Visualizações Totais**: `views_count` (rápido, agregado)
2. **Visualizações Únicas**: COUNT DISTINCT de `user_id` ou `session_id`
3. **Visualizações por Período**: GROUP BY por data/hora
4. **Taxa de Retorno**: Usuários que visualizam múltiplas vezes
5. **Engagement por Conteúdo**: Top templates/tier lists mais visualizados
6. **Crescimento**: Tendência de visualizações ao longo do tempo

### Casos de Uso para Negociações

1. **Patrocínios**: "Template X teve 10.000 visualizações únicas no último mês"
2. **Publicidade**: "Plataforma tem 50.000 visualizações únicas mensais"
3. **Análise de Conteúdo**: "Templates de jogos têm 3x mais engajamento"
4. **Validação Externa**: Logs auditáveis para verificação independente

## 🔒 Prevenção de Fraude

### Medidas Implementadas

1. **Intervalo Mínimo**: Evita refresh spam
2. **Identificação Híbrida**: Dificulta criação de múltiplas contas
3. **IP Tracking**: Detecta padrões suspeitos (mesmo IP, muitas visualizações)
4. **User Agent**: Identificação adicional de dispositivo/navegador
5. **Rate Limiting**: Limite de requisições por IP/sessão

### Medidas Futuras (Opcionais)

1. **Detecção de Bots**: Análise de padrões de navegação
2. **CAPTCHA**: Para casos suspeitos
3. **Machine Learning**: Detecção de anomalias

## ⚡ Performance

### Otimizações

1. **Índices Estratégicos**: 
   - `(content_type, content_id, user_id, viewed_at)`
   - `(content_type, content_id, session_id, viewed_at)`
   - `(content_id, viewed_at)` para analytics

2. **Cache (Futuro)**: 
   - Redis para verificação rápida de visualizações recentes
   - Reduz carga no banco para sites de alto tráfego

3. **Batch Updates**: 
   - Agregação periódica de contadores (opcional, para muito alto volume)

## 📋 Comparação: Antes vs Depois

### Sistema Atual (Problemas)
- ❌ Conta refresh como nova visualização
- ❌ Sem auditoria (não pode validar números)
- ❌ Sem analytics (não sabe unique views)
- ❌ Vulnerável a inflação artificial
- ❌ Dados não confiáveis para negociações

### Sistema Proposto (Benefícios)
- ✅ Prevenção de contagem duplicada (30min)
- ✅ Logs completos auditáveis
- ✅ Analytics rico (unique views, períodos, etc.)
- ✅ Proteção básica contra fraude
- ✅ Dados confiáveis para negociações comerciais

## 🎯 Conclusão

A implementação proposta segue as melhores práticas de mercado e fornece:
1. **Dados Precisos**: Métricas confiáveis e auditáveis
2. **Escalabilidade**: Arquitetura preparada para crescimento
3. **Compliance**: Logs completos para validação externa
4. **Business Value**: Dados valiosos para negociações comerciais

Esta solução está alinhada com padrões de plataformas como YouTube, Medium, Dev.to e outras plataformas que dependem de métricas precisas para monetização.

