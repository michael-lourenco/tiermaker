# Prompt Melhorado para Cursor IDE

## 🎯 Objetivo
Criar uma plataforma web completa similar ao TierMaker.com usando Next.js, Tailwind CSS, shadcn/ui, Supabase e AWS S3, seguindo princípios SOLID e Clean Code.

---

## 📋 Especificação do Produto

### Descrição
Plataforma para criação, classificação e compartilhamento de **tier lists** (listas de ranking visual). Usuários podem:
- Criar templates personalizados com imagens
- Organizar itens em tiers (S, A, B, C, D, F) via drag-and-drop
- Salvar, compartilhar e baixar tier lists
- Navegar templates da comunidade
- Interagir com tier lists públicas (likes, comentários)

### Referência
- Site de referência: https://tiermaker.com
- Funcionalidades principais: templates, editor drag-and-drop, compartilhamento, comunidade

---

## 🛠 Stack Tecnológica (Obrigatória)

### Frontend
- **Next.js 14+** (App Router)
  - Server Components e Client Components
  - API Routes
  - TypeScript obrigatório

### Estilização
- **Tailwind CSS** (utilitários)
- **shadcn/ui** (componentes padronizados)
  - Sistema de design consistente
  - Tema claro/escuro
  - Componentes acessíveis

### Backend & Database
- **Supabase**
  - PostgreSQL
  - Auth (email, Google, GitHub)
  - Row Level Security (RLS)

### Storage
- **AWS S3**
  - Upload de imagens
  - Presigned URLs
  - Política CORS configurada

### Bibliotecas Recomendadas
- **@dnd-kit** ou **react-beautiful-dnd** (drag-and-drop)
- **Zustand** (estado global)
- **React Hook Form** + **Zod** (formulários e validação)
- **html2canvas** ou **dom-to-image** (export de imagem)

---

## 🏗 Arquitetura e Padrões (Obrigatórios)

### Princípios
1. **SOLID**
   - Single Responsibility: Componentes/funções com uma única responsabilidade
   - Open/Closed: Extensível sem modificar código existente
   - Liskov Substitution: Interfaces consistentes
   - Interface Segregation: Interfaces específicas
   - Dependency Inversion: Depender de abstrações

2. **Clean Code**
   - Nomes descritivos (variáveis, funções, componentes)
   - Funções pequenas e focadas (< 50 linhas quando possível)
   - DRY (Don't Repeat Yourself)
   - Tratamento de erros consistente
   - Comentários apenas quando necessário

### Estrutura de Diretórios (Obrigatória)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (public)/          # Rotas públicas
│   ├── editor/            # Editor de tier list
│   ├── api/               # API Routes
│   └── layout.tsx
│
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── templates/         # Componentes de templates
│   ├── editor/            # Componentes do editor
│   ├── tier-lists/        # Componentes de tier lists
│   └── layout/            # Header, Footer, Navigation
│
├── lib/
│   ├── supabase/          # Cliente Supabase (client/server)
│   ├── aws/               # Configuração S3
│   ├── utils/             # Utilitários
│   └── constants/         # Constantes
│
├── hooks/                 # Custom React Hooks
├── services/              # Lógica de negócio (SOLID)
├── types/                 # TypeScript types/interfaces
└── store/                 # Estado global (Zustand)
```

**Regras:**
- Cada serviço em `services/` deve seguir Single Responsibility
- Componentes devem ser reutilizáveis e pequenos
- Types devem ser bem definidos e exportados de `types/`
- Hooks customizados para lógica reutilizável

---

## 🗄 Modelo de Dados (Supabase)

### Tabelas Principais

1. **templates**
   - id, user_id, name, description, category, tags, is_public, views_count, likes_count

2. **template_items**
   - id, template_id, name, image_url (S3), order

3. **tier_lists**
   - id, user_id (nullable para guest), template_id, title, is_public, share_token, views_count, likes_count

4. **tier_list_items**
   - id, tier_list_id, template_item_id, tier_name, order

5. **tier_list_tiers**
   - id, tier_list_id, tier_name, tier_order, color

6. **likes** (templates e tier_lists)
7. **comments** (tier_lists)

### RLS (Row Level Security)
- Templates públicos: SELECT para todos
- Templates privados: apenas dono
- Tier lists: público pode ver se is_public=true
- Criação: autenticados (templates) ou qualquer um (tier lists)

---

## 🎨 Design System

### Componentes shadcn/ui Necessários
- Button, Card, Input, Modal/Dialog, Dropdown, Tabs, Badge, Avatar, Toast, Spinner

### Responsividade
- Mobile First
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### Cores
- Configurar via Tailwind (primary, secondary, success, warning, error)
- Suporte a tema claro/escuro

---

## ✅ Requisitos Funcionais Principais

### RF01 - Autenticação
- Login/Registro via Supabase Auth
- Suporte a Google/GitHub OAuth
- Modo guest (limitado)

### RF02 - Templates
- Criar template (upload imagens, definir tiers)
- Navegar templates (categorias, busca, popular/recente)
- Visualizar template

### RF03 - Editor de Tier List
- Drag-and-drop de itens entre tiers
- Adicionar/remover tiers customizados
- Preview em tempo real
- Autosave (opcional)

### RF04 - Gerenciamento
- Salvar tier list (requer login)
- Editar/duplicar/deletar tier lists
- Histórico do usuário

### RF05 - Compartilhamento
- Link público único
- Download como imagem (PNG/JPG)
- Compartilhar em redes sociais
- Embed code

### RF06 - Comunidade
- Tier lists públicas
- Sistema de likes
- Comentários
- Rankings

---

## 🔧 Configurações Técnicas

### Variáveis de Ambiente
```env
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
AWS_S3_BUCKET_URL=
```

### AWS S3
- Upload via presigned URLs
- CORS configurado para Next.js
- Bucket separado dev/prod

---

## 📝 Instruções para Implementação

1. **Seguir estrutura de diretórios exata** especificada acima
2. **Aplicar SOLID** em todos os serviços e componentes
3. **Usar TypeScript** com tipos bem definidos
4. **Componentes pequenos e reutilizáveis**
5. **Tratamento de erros** em todas as operações assíncronas
6. **Validação de dados** com Zod
7. **RLS configurado** no Supabase
8. **Responsivo** em todos os componentes
9. **Acessibilidade** (ARIA labels, keyboard navigation)
10. **Performance**: Lazy loading, otimização de imagens

---

## 🚀 Ordem de Implementação Sugerida

1. Setup inicial (Next.js, Tailwind, shadcn, Supabase, S3)
2. Autenticação básica
3. Schema do banco de dados + migrations
4. CRUD de templates
5. Editor de tier list (drag-and-drop)
6. Salvar/editar tier lists
7. Compartilhamento e download
8. Funcionalidades de comunidade

---

## ⚠️ Pontos de Atenção

- **Performance**: Editor deve ser fluido (60fps) mesmo com muitos itens
- **Segurança**: Validar uploads, sanitizar inputs, RLS ativo
- **UX**: Feedback visual em todas as ações (loading, success, error)
- **Mobile**: Editor deve funcionar bem em touch devices
- **SEO**: Meta tags, Open Graph para tier lists públicas

---

## 📚 Referências

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)

---

**IMPORTANTE**: Ao implementar, sempre priorizar código limpo, testável e manutenível. Cada função/componente deve ter uma responsabilidade clara e ser fácil de entender e modificar.


