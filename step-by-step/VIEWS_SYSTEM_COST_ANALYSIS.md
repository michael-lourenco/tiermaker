# Análise de Custos: Sistema de Visualizações

## 📊 Resumo Executivo

Análise de custos mensais da implementação do sistema de visualizações, considerando apenas serviços (sem desenvolvimento). Foco no **Supabase** como serviço principal.

**Custo Base (Free Tier)**: **$0/mês** (até limites do plano gratuito)
**Custo Estimado (Pro Plan)**: **$25/mês** (plano base) + custos adicionais por uso

---

## 🎯 Cenários de Volume

### Cenário 1: Pequeno (Startup/Projeto Inicial)
- **Visualizações/mês**: 10.000
- **Visualizações únicas/mês**: ~7.000 (70% unique)
- **Templates ativos**: 50
- **Tier lists ativas**: 200

### Cenário 2: Médio (Crescimento)
- **Visualizações/mês**: 100.000
- **Visualizações únicas/mês**: ~70.000 (70% unique)
- **Templates ativos**: 500
- **Tier lists ativas**: 2.000

### Cenário 3: Grande (Estabelecido)
- **Visualizações/mês**: 1.000.000
- **Visualizações únicas/mês**: ~700.000 (70% unique)
- **Templates ativos**: 5.000
- **Tier lists ativas**: 20.000

### Cenário 4: Muito Grande (Alto Tráfego)
- **Visualizações/mês**: 10.000.000
- **Visualizações únicas/mês**: ~7.000.000 (70% unique)
- **Templates ativos**: 50.000
- **Tier lists ativas**: 200.000

---

## 💰 Estrutura de Custos do Supabase

### Plano Free (Gratuito)
- **Database Size**: 500 MB
- **Database Egress**: 5 GB/mês
- **API Requests**: 50.000/mês
- **Storage**: 1 GB
- **Bandwidth**: 5 GB/mês

### Plano Pro ($25/mês base)
- **Database Size**: 8 GB incluídos, depois $0.125/GB
- **Database Egress**: 50 GB incluídos, depois $0.09/GB
- **API Requests**: 500.000 incluídos, depois $2.50 por 100k
- **Storage**: 100 GB incluídos, depois $0.021/GB
- **Bandwidth**: 200 GB incluídos, depois $0.09/GB

### Plano Team ($599/mês base)
- **Database Size**: 50 GB incluídos, depois $0.125/GB
- **Database Egress**: 250 GB incluídos, depois $0.09/GB
- **API Requests**: 5.000.000 incluídos, depois $2.50 por 100k
- **Storage**: 500 GB incluídos, depois $0.021/GB
- **Bandwidth**: 1 TB incluídos, depois $0.09/GB

---

## 📈 Cálculo de Custos por Componente

### 1. Armazenamento de Dados (Tabela `views`)

**Tamanho por registro:**
- `id` (UUID): 16 bytes
- `user_id` (UUID, nullable): 16 bytes (média: 8 bytes se 50% null)
- `session_id` (TEXT, média 36 chars): ~36 bytes
- `content_type` (TEXT): ~10 bytes
- `content_id` (UUID): 16 bytes
- `ip_address` (INET): ~15 bytes
- `user_agent` (TEXT, média 100 chars): ~100 bytes
- `referrer` (TEXT, nullable, média 50 chars): ~25 bytes
- `viewed_at` (TIMESTAMP): 8 bytes
- **Overhead PostgreSQL**: ~24 bytes
- **Total por registro**: ~254 bytes (~0.25 KB)

**Cálculo por cenário:**

| Cenário | Visualizações/mês | Armazenamento/mês | Armazenamento/ano |
|---------|-------------------|-------------------|-------------------|
| Pequeno | 10.000 | 2.5 MB | 30 MB |
| Médio | 100.000 | 25 MB | 300 MB |
| Grande | 1.000.000 | 250 MB | 3 GB |
| Muito Grande | 10.000.000 | 2.5 GB | 30 GB |

**Custos de Armazenamento:**
- **Free Tier**: Até 500 MB (cobre até cenário Médio)
- **Pro Plan**: 8 GB incluídos (cobre até cenário Grande)
- **Pro Plan (excedente)**: $0.125/GB/mês
  - Cenário Muito Grande: (30 GB - 8 GB) × $0.125 = **$2.75/mês**

---

### 2. Operações de Banco de Dados

#### 2.1. Escritas (INSERT)

**Por visualização:**
- 1 INSERT na tabela `views`
- 1 UPDATE na tabela `templates` ou `tier_lists` (incremento de contador)
- 1 SELECT para verificar última visualização (validação de intervalo)

**Total: ~3 operações por visualização**

**Cálculo por cenário:**

| Cenário | Visualizações/mês | Operações/mês | Operações/ano |
|---------|-------------------|---------------|---------------|
| Pequeno | 10.000 | 30.000 | 360.000 |
| Médio | 100.000 | 300.000 | 3.600.000 |
| Grande | 1.000.000 | 3.000.000 | 36.000.000 |
| Muito Grande | 10.000.000 | 30.000.000 | 360.000.000 |

**Custos:**
- **Free Tier**: 50.000 API requests/mês (cobre apenas cenário Pequeno)
- **Pro Plan**: 500.000 incluídos (cobre até cenário Médio)
- **Pro Plan (excedente)**: $2.50 por 100k requests
  - Cenário Grande: (3.000.000 - 500.000) / 100.000 × $2.50 = **$62.50/mês**
  - Cenário Muito Grande: (30.000.000 - 500.000) / 100.000 × $2.50 = **$737.50/mês**

#### 2.2. Leituras (SELECT para Analytics)

**Operações típicas:**
- Consultas de analytics (opcionais, não críticas)
- Queries de validação (já incluídas nas escritas acima)

**Estimativa**: ~10% das operações totais são leituras adicionais
- **Custo adicional**: Já considerado nas operações acima

---

### 3. Bandwidth (Egress)

**Dados transferidos:**
- Respostas da API (pequenas, ~100 bytes por request)
- Queries de analytics (maiores, mas opcionais)

**Estimativa por visualização:**
- API response: ~200 bytes
- Total: ~200 bytes por visualização

**Cálculo por cenário:**

| Cenário | Visualizações/mês | Bandwidth/mês | Bandwidth/ano |
|---------|-------------------|---------------|---------------|
| Pequeno | 10.000 | 2 MB | 24 MB |
| Médio | 100.000 | 20 MB | 240 MB |
| Grande | 1.000.000 | 200 MB | 2.4 GB |
| Muito Grande | 10.000.000 | 2 GB | 24 GB |

**Custos:**
- **Free Tier**: 5 GB/mês (cobre todos os cenários)
- **Pro Plan**: 50 GB incluídos (cobre todos os cenários)
- **Pro Plan (excedente)**: $0.09/GB/mês
  - Cenário Muito Grande: (24 GB - 50 GB) = **$0/mês** (dentro do limite)

---

### 4. Índices e Performance

**Índices criados:**
- 4 índices na tabela `views`
- Tamanho estimado: ~30% do tamanho da tabela

**Impacto:**
- Aumenta armazenamento necessário
- Melhora performance (reduz custos de CPU)
- **Custo adicional**: Já considerado no armazenamento

---

## 💵 Resumo de Custos Mensais

### Cenário 1: Pequeno (10k visualizações/mês)
| Componente | Free Tier | Pro Plan |
|------------|-----------|----------|
| Armazenamento | $0 | $0 (dentro dos 8 GB) |
| Operações DB | $0 | $0 (dentro dos 500k) |
| Bandwidth | $0 | $0 (dentro dos 50 GB) |
| **Custo Base** | **$0** | **$25** |
| **Total** | **$0/mês** | **$25/mês** |

### Cenário 2: Médio (100k visualizações/mês)
| Componente | Free Tier | Pro Plan |
|------------|-----------|----------|
| Armazenamento | $0 | $0 (dentro dos 8 GB) |
| Operações DB | $0 | $0 (dentro dos 500k) |
| Bandwidth | $0 | $0 (dentro dos 50 GB) |
| **Custo Base** | **$0** | **$25** |
| **Total** | **$0/mês** | **$25/mês** |

### Cenário 3: Grande (1M visualizações/mês)
| Componente | Free Tier | Pro Plan |
|------------|-----------|----------|
| Armazenamento | $0 | $0 (dentro dos 8 GB) |
| Operações DB | ❌ Excede | $62.50 (excedente) |
| Bandwidth | $0 | $0 (dentro dos 50 GB) |
| **Custo Base** | **N/A** | **$25** |
| **Total** | **N/A** | **$87.50/mês** |

### Cenário 4: Muito Grande (10M visualizações/mês)
| Componente | Free Tier | Pro Plan |
|------------|-----------|----------|
| Armazenamento | ❌ Excede | $2.75 (excedente) |
| Operações DB | ❌ Excede | $737.50 (excedente) |
| Bandwidth | $0 | $0 (dentro dos 50 GB) |
| **Custo Base** | **N/A** | **$25** |
| **Total** | **N/A** | **$765.25/mês** |

---

## 🎯 Recomendações por Fase

### Fase Inicial (0-100k visualizações/mês)
- **Plano**: Free Tier ou Pro Plan
- **Custo**: $0-25/mês
- **Observação**: Free Tier cobre até ~16k visualizações/mês (50k requests ÷ 3)

### Fase de Crescimento (100k-1M visualizações/mês)
- **Plano**: Pro Plan ($25/mês)
- **Custo**: $25-87.50/mês
- **Observação**: A partir de ~166k visualizações/mês, excede limite do Free Tier

### Fase Estabelecida (1M-10M visualizações/mês)
- **Plano**: Pro Plan ou Team Plan
- **Custo**: $87.50-765.25/mês (Pro) ou $599/mês (Team)
- **Observação**: Team Plan pode ser mais econômico para alto volume

### Fase de Alto Tráfego (10M+ visualizações/mês)
- **Plano**: Team Plan ou Enterprise
- **Custo**: $599+/mês
- **Observação**: Considerar cache Redis para reduzir carga no banco

---

## 💡 Otimizações para Reduzir Custos

### 1. Cache Redis (Futuro)
- **Benefício**: Reduz operações no banco
- **Custo**: ~$10-20/mês (Upstash Redis ou similar)
- **ROI**: Pode reduzir custos de operações em 50-70%

### 2. Agregação Periódica
- **Estratégia**: Manter apenas últimos 90 dias de logs detalhados
- **Benefício**: Reduz armazenamento
- **Trade-off**: Perde granularidade histórica

### 3. Batch Processing
- **Estratégia**: Agregar visualizações em lote (a cada 5-10 minutos)
- **Benefício**: Reduz número de operações
- **Trade-off**: Menos tempo real

---

## 📊 Comparação: Com vs Sem Sistema de Visualizações

### Sem Sistema (Atual)
- **Custo**: $0-25/mês (apenas plano base)
- **Limitação**: Dados não confiáveis, sem auditoria

### Com Sistema (Proposto)
- **Custo**: $0-87.50/mês (fases iniciais)
- **Benefício**: Dados precisos, auditáveis, analytics rico

**ROI**: O custo adicional é justificado pelo valor comercial dos dados precisos para negociações de patrocínio e publicidade.

---

## ⚠️ Considerações Importantes

1. **Custos Variam**: Dependem do volume real de visualizações
2. **Outros Serviços**: Não inclui custos de Next.js hosting (Vercel), AWS S3, etc.
3. **Crescimento**: Custos aumentam linearmente com volume
4. **Otimizações**: Cache e agregação podem reduzir custos significativamente

---

## 🎯 Conclusão

**Custo Estimado para Implementação:**
- **Fase Inicial (0-100k views/mês)**: **$0-25/mês**
- **Fase de Crescimento (100k-1M views/mês)**: **$25-87.50/mês**
- **Fase Estabelecida (1M-10M views/mês)**: **$87.50-765.25/mês**

**Recomendação**: Começar com Free Tier ou Pro Plan ($25/mês) e escalar conforme necessário. O custo é proporcional ao sucesso da plataforma e os dados precisos justificam o investimento para negociações comerciais.

