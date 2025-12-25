# Planejamento: Plataforma TierMaker Clone

## 📋 Contexto e Objetivo

Criar uma plataforma web completa similar ao [TierMaker.com](https://tiermaker.com) que permite aos usuários criar, classificar e compartilhar tier lists (listas de ranking visual) de qualquer tema.

### Descrição do Produto

TierMaker é uma ferramenta de ranking visual onde:
- **Itens** (geralmente com imagens) são organizados em **categorias/tiers** (S, A, B, C, D, F, etc.)
- Usuários podem criar templates personalizados ou usar templates da comunidade
- Interface baseada em **drag-and-drop** para organizar itens
- Suporte a salvar, baixar e compartilhar tier lists criadas

---

## 🎯 Requisitos Funcionais

### RF01 - Autenticação e Perfil
- [ ] Login/Registro via Supabase Auth (email, Google, GitHub)
- [ ] Perfil de usuário com histórico de tier lists criadas
- [ ] Usuário pode usar a plataforma sem login (modo guest limitado)

### RF02 - Templates
- [ ] Navegação por categorias de templates (Jogos, Animes, Esportes, Comida, etc.)
- [ ] Visualização de templates populares, recentes e mais votados
- [ ] Busca de templates por nome/categoria
- [ ] Criação de template personalizado:
  - Upload de múltiplas imagens (AWS S3)
  - Definição de nomes dos tiers (padrão: S, A, B, C, D, F)
  - Nome e descrição do template
  - Categoria e tags

### RF03 - Editor de Tier List
- [ ] Interface drag-and-drop para arrastar itens entre tiers
- [ ] Visualização em grid dos itens por tier
- [ ] Adicionar/remover tiers customizados
- [ ] Reordenar tiers (arrastar tier inteiro)
- [ ] Preview em tempo real da tier list
- [ ] Salvar progresso automaticamente (autosave)

### RF04 - Gerenciamento de Tier Lists
- [ ] Salvar tier list criada (requer login)
- [ ] Editar tier list salva
- [ ] Duplicar tier list existente
- [ ] Deletar tier list
- [ ] Listar todas as tier lists do usuário

### RF05 - Compartilhamento
- [ ] Gerar link público único para cada tier list
- [ ] Compartilhar via redes sociais (Twitter, Facebook, WhatsApp)
- [ ] Download da tier list como imagem (PNG/JPG)
- [ ] Embed code para sites externos

### RF06 - Comunidade
- [ ] Visualizar tier lists públicas de outros usuários
- [ ] Sistema de votação (like/dislike) em tier lists
- [ ] Comentários em tier lists públicas
- [ ] Ranking de tier lists mais populares

---

## 🛠 Stack Tecnológica

### Frontend
- **Next.js 14+** (App Router)
  - Server Components e Client Components
  - API Routes para backend
  - SSR/SSG quando apropriado

### Estilização
- **Tailwind CSS** para utilitários
- **shadcn/ui** para componentes padronizados
  - Sistema de design consistente
  - Tema claro/escuro
  - Componentes acessíveis

### Backend & Banco de Dados
- **Supabase**
  - PostgreSQL para dados relacionais
  - Auth para autenticação
  - Row Level Security (RLS) para segurança
  - Storage para metadados (opcional)

### Armazenamento de Arquivos
- **AWS S3**
  - Bucket para imagens de templates
  - Bucket para imagens de tier lists exportadas
  - Política de acesso público/privado

### Outras Ferramentas
- **Zustand** ou **React Context** para estado global
- **React DnD** ou **@dnd-kit** para drag-and-drop
- **React Hook Form** + **Zod** para validação de formulários
- **Next-Auth** (opcional, se não usar Supabase Auth diretamente)

---

## 🏗 Arquitetura e Padrões

### Princípios de Design
- **SOLID**: Aplicar princípios em toda a arquitetura
  - Single Responsibility: Cada componente/função tem uma responsabilidade
  - Open/Closed: Extensível sem modificar código existente
  - Liskov Substitution: Interfaces consistentes
  - Interface Segregation: Interfaces específicas
  - Dependency Inversion: Depender de abstrações

- **Clean Code**:
  - Nomes descritivos e significativos
  - Funções pequenas e focadas
  - Comentários apenas quando necessário
  - Evitar duplicação (DRY)
  - Tratamento de erros consistente

### Estrutura de Diretórios

```
tiermaker/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (public)/                 # Rotas públicas
│   │   │   ├── templates/
│   │   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── tier-lists/
│   │   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx              # Home
│   │   ├── editor/
│   │   │   ├── [templateId]/
│   │   │   └── page.tsx
│   │   ├── api/                      # API Routes
│   │   │   ├── templates/
│   │   │   ├── tier-lists/
│   │   │   ├── upload/
│   │   │   └── auth/
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/                    # Componentes React
│   │   ├── ui/                       # Componentes shadcn/ui
│   │   ├── templates/
│   │   │   ├── TemplateCard.tsx
│   │   │   ├── TemplateGrid.tsx
│   │   │   └── TemplateForm.tsx
│   │   ├── editor/
│   │   │   ├── TierListEditor.tsx
│   │   │   ├── TierColumn.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   └── DragDropProvider.tsx
│   │   ├── tier-lists/
│   │   │   ├── TierListView.tsx
│   │   │   └── ShareModal.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Navigation.tsx
│   │
│   ├── lib/                          # Utilitários e configurações
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── aws/
│   │   │   └── s3.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   └── validations.ts
│   │   └── constants/
│   │       └── tiers.ts
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useTierList.ts
│   │   ├── useTemplate.ts
│   │   ├── useAuth.ts
│   │   └── useDragDrop.ts
│   │
│   ├── services/                     # Lógica de negócio
│   │   ├── template.service.ts
│   │   ├── tierList.service.ts
│   │   ├── image.service.ts
│   │   └── share.service.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── template.types.ts
│   │   ├── tierList.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   ├── store/                        # Estado global (Zustand)
│   │   ├── templateStore.ts
│   │   ├── tierListStore.ts
│   │   └── authStore.ts
│   │
│   └── styles/                       # Estilos adicionais
│       └── components.css
│
├── public/                           # Arquivos estáticos
│   ├── images/
│   └── icons/
│
├── supabase/                         # Configurações Supabase
│   ├── migrations/
│   └── seed.sql
│
├── .env.local                        # Variáveis de ambiente
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🗄 Modelo de Dados (Supabase)

### Tabela: `users` (gerenciada pelo Supabase Auth)
- `id` (uuid, PK)
- `email` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela: `templates`
- `id` (uuid, PK)
- `user_id` (uuid, FK -> users.id)
- `name` (text, not null)
- `description` (text)
- `category` (text, not null)
- `tags` (text[])
- `is_public` (boolean, default: true)
- `views_count` (integer, default: 0)
- `likes_count` (integer, default: 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela: `template_items`
- `id` (uuid, PK)
- `template_id` (uuid, FK -> templates.id)
- `name` (text, not null)
- `image_url` (text, not null) # URL S3
- `order` (integer)
- `created_at` (timestamp)

### Tabela: `tier_lists`
- `id` (uuid, PK)
- `user_id` (uuid, FK -> users.id, nullable) # nullable para guest
- `template_id` (uuid, FK -> templates.id)
- `title` (text, not null)
- `is_public` (boolean, default: false)
- `share_token` (text, unique) # Para links públicos
- `views_count` (integer, default: 0)
- `likes_count` (integer, default: 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela: `tier_list_items`
- `id` (uuid, PK)
- `tier_list_id` (uuid, FK -> tier_lists.id)
- `template_item_id` (uuid, FK -> template_items.id)
- `tier_name` (text, not null) # "S", "A", "B", etc.
- `order` (integer) # Ordem dentro do tier
- `created_at` (timestamp)

### Tabela: `tier_list_tiers`
- `id` (uuid, PK)
- `tier_list_id` (uuid, FK -> tier_lists.id)
- `tier_name` (text, not null)
- `tier_order` (integer) # Ordem dos tiers (0, 1, 2...)
- `color` (text) # Cor do tier (opcional)
- `created_at` (timestamp)

### Tabela: `likes`
- `id` (uuid, PK)
- `user_id` (uuid, FK -> users.id)
- `tier_list_id` (uuid, FK -> tier_lists.id, nullable)
- `template_id` (uuid, FK -> templates.id, nullable)
- `created_at` (timestamp)
- UNIQUE(user_id, tier_list_id)
- UNIQUE(user_id, template_id)

### Tabela: `comments`
- `id` (uuid, PK)
- `user_id` (uuid, FK -> users.id)
- `tier_list_id` (uuid, FK -> tier_lists.id)
- `content` (text, not null)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## 🔐 Segurança e Permissões (RLS)

### Políticas RLS

**templates:**
- SELECT: Público pode ver templates públicos
- INSERT: Usuários autenticados podem criar
- UPDATE: Apenas o dono pode atualizar
- DELETE: Apenas o dono pode deletar

**tier_lists:**
- SELECT: Público pode ver tier lists públicas ou próprias
- INSERT: Qualquer um pode criar (guest ou autenticado)
- UPDATE: Apenas o dono pode atualizar
- DELETE: Apenas o dono pode deletar

**template_items:**
- SELECT: Público pode ver itens de templates públicos
- INSERT: Apenas dono do template
- UPDATE: Apenas dono do template
- DELETE: Apenas dono do template

---

## 🎨 Design System (shadcn/ui + Tailwind)

### Cores Principais
- Primary: Azul/Violeta (configurável via Tailwind)
- Secondary: Cinza
- Success: Verde
- Warning: Amarelo
- Error: Vermelho

### Componentes Base Necessários
- Button
- Card
- Input
- Modal/Dialog
- Dropdown Menu
- Tabs
- Badge
- Avatar
- Toast/Notification
- Loading Spinner

### Responsividade
- Mobile First
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 📦 Integração AWS S3

### Configuração
- Bucket separado para desenvolvimento e produção
- Política CORS configurada para Next.js
- Presigned URLs para upload seguro
- CDN (CloudFront) opcional para performance

### Fluxo de Upload
1. Cliente solicita presigned URL via API
2. Upload direto do cliente para S3
3. API recebe confirmação e salva URL no banco

---

## 🚀 Fases de Desenvolvimento

### Fase 1: MVP (Mínimo Produto Viável)
- [ ] Setup do projeto (Next.js, Tailwind, shadcn)
- [ ] Configuração Supabase (DB + Auth)
- [ ] Configuração AWS S3
- [ ] Autenticação básica
- [ ] CRUD de templates
- [ ] Editor básico de tier list (drag-and-drop)
- [ ] Visualização de tier list
- [ ] Salvar tier list

### Fase 2: Funcionalidades Core
- [ ] Compartilhamento (links públicos)
- [ ] Download como imagem
- [ ] Busca e navegação de templates
- [ ] Perfil de usuário
- [ ] Histórico de tier lists

### Fase 3: Comunidade
- [ ] Sistema de likes/votos
- [ ] Comentários
- [ ] Rankings e categorias
- [ ] Tier lists públicas

### Fase 4: Melhorias e Polimento
- [ ] Autosave
- [ ] Temas customizados
- [ ] Export em diferentes formatos
- [ ] Analytics
- [ ] Performance optimization
- [ ] SEO

---

## 🧪 Testes (Recomendado)

### Tipos de Testes
- **Unit Tests**: Funções utilitárias, services
- **Integration Tests**: API routes, database operations
- **E2E Tests**: Fluxos críticos (criar template, editar tier list)

### Ferramentas
- **Vitest** para unit/integration
- **Playwright** para E2E

---

## 📝 Variáveis de Ambiente Necessárias

```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_S3_BUCKET_URL=https://your_bucket.s3.amazonaws.com
```

---

## ✅ Checklist de Implementação

### Setup Inicial
- [ ] Criar projeto Next.js com TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Instalar e configurar shadcn/ui
- [ ] Configurar Supabase (projeto + migrations)
- [ ] Configurar AWS S3 (bucket + políticas)
- [ ] Setup de variáveis de ambiente

### Desenvolvimento
- [ ] Implementar autenticação
- [ ] Criar schema do banco de dados
- [ ] Implementar serviços de upload
- [ ] Desenvolver componentes UI base
- [ ] Implementar editor de tier list
- [ ] Implementar funcionalidades de compartilhamento
- [ ] Adicionar funcionalidades de comunidade

### Deploy
- [ ] Configurar CI/CD
- [ ] Deploy em produção (Vercel/Netlify)
- [ ] Configurar domínio
- [ ] Monitoramento e analytics

---

## 📚 Recursos e Referências

- [TierMaker.com](https://tiermaker.com) - Referência de UX/UI
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

---

## 🎯 Métricas de Sucesso

- Tempo de carregamento inicial < 2s
- Editor responsivo e fluido (60fps)
- Upload de imagens < 5s para imagens < 5MB
- Suporte a 100+ itens por template
- 99.9% uptime

---

**Nota**: Este planejamento é um guia inicial e pode ser ajustado conforme o desenvolvimento avança e novas necessidades são identificadas.


