# TierMaker - Plataforma de Tier Lists

Uma plataforma web completa para criar, classificar e compartilhar tier lists, similar ao TierMaker.com.

## 🚀 Stack Tecnológica

- **Next.js 14+** (App Router) - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Supabase** - Banco de dados e autenticação
- **AWS S3** - Armazenamento de imagens
- **@dnd-kit** - Drag and drop
- **Zustand** - Gerenciamento de estado
- **React Hook Form + Zod** - Formulários e validação

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase
- Conta na AWS com S3 configurado

## 🛠 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd tiermaker
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
```env
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

4. Configure o Supabase:
   - Crie um novo projeto no Supabase
   - Execute as migrations em `supabase/migrations/`:
     - `001_initial_schema.sql` - Cria todas as tabelas
     - `002_rls_policies.sql` - Configura Row Level Security

5. Configure o AWS S3:
   - Crie um bucket S3
   - Configure CORS para permitir uploads do seu domínio
   - Configure políticas de acesso

6. Execute o projeto:
```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📁 Estrutura do Projeto

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
│   ├── ui/                # Componentes shadcn/ui
│   ├── templates/         # Componentes de templates
│   ├── editor/            # Componentes do editor
│   ├── tier-lists/        # Componentes de tier lists
│   └── layout/            # Header, Footer
│
├── lib/
│   ├── supabase/          # Cliente Supabase
│   ├── aws/               # Configuração S3
│   ├── utils/             # Utilitários
│   └── constants/        # Constantes
│
├── hooks/                 # Custom React Hooks
├── services/              # Lógica de negócio (SOLID)
├── types/                 # TypeScript types
└── store/                 # Estado global (Zustand)
```

## 🎯 Funcionalidades Implementadas

### ✅ Fase 1: MVP
- [x] Setup do projeto (Next.js, Tailwind, shadcn)
- [x] Configuração Supabase (DB + Auth)
- [x] Configuração AWS S3
- [x] Autenticação básica (Login/Registro)
- [x] CRUD de templates
- [x] Editor básico de tier list (drag-and-drop)
- [x] Visualização de tier list
- [x] Salvar tier list

### 🚧 Em Desenvolvimento
- [ ] Compartilhamento (links públicos)
- [ ] Download como imagem
- [ ] Busca e navegação de templates
- [ ] Perfil de usuário
- [ ] Histórico de tier lists
- [ ] Sistema de likes/votos
- [ ] Comentários
- [ ] Rankings e categorias

## 🗄 Modelo de Dados

### Tabelas Principais

- **templates** - Templates de tier lists
- **template_items** - Itens de cada template
- **tier_lists** - Tier lists criadas pelos usuários
- **tier_list_items** - Itens organizados em tiers
- **tier_list_tiers** - Definição dos tiers
- **likes** - Likes em templates e tier lists
- **comments** - Comentários em tier lists

Veja `supabase/migrations/001_initial_schema.sql` para o schema completo.

## 🔐 Segurança

- Row Level Security (RLS) configurado no Supabase
- Validação de uploads de imagens
- Autenticação via Supabase Auth
- Presigned URLs para uploads seguros no S3

## 📝 Padrões de Código

- **SOLID**: Princípios aplicados em serviços e componentes
- **Clean Code**: Código limpo e manutenível
- **TypeScript**: Tipagem forte
- **Componentes pequenos**: Reutilizáveis e focados

## 🧪 Testes

(Em desenvolvimento)

## 📚 Documentação Adicional

- [PLANEJAMENTO.md](./PLANEJAMENTO.md) - Planejamento completo do projeto
- [PROMPT_MELHORADO.md](./PROMPT_MELHORADO.md) - Prompt para desenvolvimento

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

# tiermaker
