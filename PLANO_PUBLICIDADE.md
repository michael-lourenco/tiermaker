# Plano de Implementação - Sistema de Publicidade

## Objetivo
Implementar um sistema flexível de espaços de publicidade que permite:
- Publicidades manuais (imagens/links customizados)
- Publicidades do Google AdSense
- Gerenciamento administrativo
- Mínimo impacto na experiência do usuário

---

## 1. Estrutura de Banco de Dados

### Tabela: `ad_spaces`
```sql
CREATE TABLE ad_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,                    -- Nome identificador do espaço (ex: "header-top", "sidebar-right")
  position TEXT NOT NULL,                        -- Posição no site (header, sidebar, content, footer, etc)
  device_type TEXT NOT NULL DEFAULT 'all',      -- all, desktop, mobile
  ad_type TEXT NOT NULL,                        -- 'manual' ou 'google'
  
  -- Para publicidades manuais
  manual_image_url TEXT,                         -- URL da imagem
  manual_link_url TEXT,                          -- URL de destino
  manual_alt_text TEXT,                          -- Texto alternativo
  
  -- Para publicidades do Google
  google_ad_client TEXT,                         -- ca-pub-xxxxx
  google_ad_slot TEXT,                           -- Slot ID do AdSense
  google_ad_format TEXT,                         -- auto, rectangle, horizontal, vertical
  
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,                   -- Ordem de prioridade
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ad_spaces_position ON ad_spaces(position, device_type, is_active);
CREATE INDEX idx_ad_spaces_active ON ad_spaces(is_active) WHERE is_active = true;
```

### Posições Sugeridas:
- `header-top`: Banner no topo (abaixo do header)
- `sidebar-left`: Sidebar esquerda (desktop)
- `sidebar-right`: Sidebar direita (desktop)
- `content-top`: Antes do conteúdo principal
- `content-middle`: No meio do conteúdo (entre seções)
- `content-bottom`: Após o conteúdo principal
- `footer-top`: Antes do footer
- `in-feed`: Entre cards em listas (templates, tier lists)
- `sticky-sidebar`: Sidebar fixa (desktop)

---

## 2. Estrutura de Arquivos

```
src/
├── services/
│   └── adSpace.service.ts          # Serviço para gerenciar espaços de publicidade
├── types/
│   └── adSpace.types.ts            # Tipos TypeScript
├── components/
│   ├── ads/
│   │   ├── AdSpace.tsx             # Componente principal que renderiza o espaço
│   │   ├── ManualAd.tsx            # Componente para publicidade manual
│   │   ├── GoogleAd.tsx            # Componente para Google AdSense
│   │   └── AdPlaceholder.tsx       # Placeholder quando não há publicidade
│   └── admin/
│       └── AdSpacesManagement.tsx  # Interface de gerenciamento
├── app/
│   └── admin/
│       └── ads/
│           └── page.tsx            # Página de administração
└── lib/
    └── ads/
        └── positions.ts            # Configurações de posições
```

---

## 3. Componentes React

### 3.1. AdSpace.tsx (Componente Principal)
```typescript
// Componente que busca e renderiza o espaço de publicidade
// - Busca o espaço por position e device_type
// - Renderiza ManualAd ou GoogleAd baseado no tipo
// - Fallback para AdPlaceholder se não houver publicidade ativa
```

### 3.2. ManualAd.tsx
```typescript
// Renderiza publicidade manual
// - Imagem clicável
// - Link externo
// - Tracking de cliques (opcional)
```

### 3.3. GoogleAd.tsx
```typescript
// Renderiza Google AdSense
// - Carrega script do AdSense
// - Renderiza o ad unit
// - Responsivo
```

### 3.4. AdPlaceholder.tsx
```typescript
// Placeholder discreto quando não há publicidade
// - Pode ser vazio ou mostrar espaço reservado
```

---

## 4. Posicionamento Estratégico

### 4.1. Homepage (`/`)
- **content-top**: Após hero section, antes de "Categorias Populares"
- **content-middle**: Entre "Categorias Populares" e "Templates Populares"
- **sidebar-right**: Sidebar fixa (apenas desktop)

### 4.2. Páginas de Listagem (`/templates`, `/categories`)
- **content-top**: Após título da página
- **in-feed**: A cada 6-8 cards
- **sidebar-right**: Sidebar fixa (apenas desktop)

### 4.3. Páginas de Detalhes (`/templates/[id]`, `/tier-lists/[id]`)
- **content-top**: Após título
- **content-middle**: No meio do conteúdo
- **sidebar-right**: Sidebar fixa (apenas desktop)

### 4.4. Editor (`/editor/[templateId]`)
- **sidebar-right**: Apenas desktop, não intrusivo

---

## 5. Responsividade

### Desktop (> 768px)
- Sidebar fixa direita (300px de largura)
- Banners horizontais (728x90, 970x250)
- Retângulos (300x250)

### Mobile (≤ 768px)
- Banners horizontais (320x50, 320x100)
- Sem sidebar
- Publicidades entre conteúdo

---

## 6. Área Administrativa

### 6.1. Lista de Espaços (`/admin/ads`)
- Tabela com todos os espaços
- Filtros por posição, tipo, status
- Ações: criar, editar, ativar/desativar, deletar

### 6.2. Formulário de Criação/Edição
- Seleção de posição
- Seleção de tipo (manual/google)
- Campos condicionais baseados no tipo
- Upload de imagem (para manual)
- Preview do espaço

---

## 7. Implementação Técnica

### 7.1. Service Layer
```typescript
class AdSpaceService {
  // Buscar espaço por posição e device type
  async getAdSpaceByPosition(position: string, deviceType: 'desktop' | 'mobile' | 'all')
  
  // CRUD completo
  async createAdSpace(input: CreateAdSpaceInput)
  async updateAdSpace(id: string, input: UpdateAdSpaceInput)
  async deleteAdSpace(id: string)
  async getAllAdSpaces()
  async getAdSpaceById(id: string)
}
```

### 7.2. RLS Policies
```sql
-- Todos podem ver espaços ativos
CREATE POLICY "Ad spaces are viewable by everyone"
  ON ad_spaces FOR SELECT
  USING (is_active = true);

-- Apenas admin pode gerenciar
CREATE POLICY "Only admins can manage ad spaces"
  ON ad_spaces FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'kontempler@gmail.com'
    )
  );
```

---

## 8. Integração com Google AdSense

### 8.1. Script do AdSense
- Adicionar no `layout.tsx` (apenas se houver espaços do Google ativos)
- Carregamento condicional

### 8.2. Componente GoogleAd
- Usa `next/script` para carregar o script
- Renderiza o ad unit com os parâmetros configurados
- Lazy loading para performance

---

## 9. Considerações de UX

### 9.1. Não Intrusivo
- Publicidades não devem bloquear conteúdo
- Sem pop-ups ou overlays
- Espaçamento adequado

### 9.2. Performance
- Lazy loading de imagens
- Scripts do AdSense carregados de forma assíncrona
- Cache de espaços de publicidade

### 9.3. Acessibilidade
- Alt text em imagens
- Indicadores visuais de publicidade
- Não interferir com navegação por teclado

---

## 10. Ordem de Implementação

1. **Fase 1: Estrutura Base**
   - Migration do banco de dados
   - Tipos TypeScript
   - Service layer básico

2. **Fase 2: Componentes**
   - AdSpace.tsx
   - ManualAd.tsx
   - GoogleAd.tsx
   - AdPlaceholder.tsx

3. **Fase 3: Integração**
   - Adicionar espaços nas páginas principais
   - Testes de responsividade

4. **Fase 4: Administração**
   - Interface de gerenciamento
   - Upload de imagens
   - CRUD completo

5. **Fase 5: Otimização**
   - Performance
   - Analytics (opcional)
   - A/B testing (opcional)

---

## 11. Exemplo de Uso

```tsx
// Em qualquer página
import { AdSpace } from '@/components/ads/AdSpace'

export default function Page() {
  return (
    <div>
      <h1>Título</h1>
      
      {/* Publicidade no topo do conteúdo */}
      <AdSpace position="content-top" />
      
      <Content />
      
      {/* Publicidade no meio */}
      <AdSpace position="content-middle" />
      
      <MoreContent />
    </div>
  )
}
```

---

## 12. Métricas e Monitoramento

- Cliques em publicidades manuais (opcional)
- Impressões (via Google AdSense)
- Taxa de cliques (CTR)
- Receita (via Google AdSense)

---

## Próximos Passos

1. Criar migration do banco de dados
2. Implementar service layer
3. Criar componentes básicos
4. Integrar nas páginas principais
5. Criar interface administrativa


