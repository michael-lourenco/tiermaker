# TierMaker - Plataforma de Tier Lists

Uma plataforma web completa para criar, classificar e compartilhar tier lists, similar ao TierMaker.com.

## ⚠️ Configuração Inicial Obrigatória

**ANTES de executar o projeto**, você DEVE configurar:

1. ✅ **Variáveis de ambiente** (`.env.local`)
2. ✅ **Supabase**: Executar migrations do banco de dados
3. ✅ **AWS S3 CORS**: Configuração OBRIGATÓRIA - sem isso, uploads NÃO funcionarão
4. ✅ **AWS S3 Bucket Policy**: Recomendado para permissões adequadas

📚 **📖 Veja [SETUP_INICIAL.md](./SETUP_INICIAL.md) para o guia completo passo a passo com todas as configurações detalhadas.**

---

## 🚀 Stack Tecnológica Tiermaker

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

⚠️ **IMPORTANTE**: Siga TODOS os passos abaixo. Sem as configurações de CORS e Bucket Policy, os uploads NÃO funcionarão!

### Setup Rápido

Para um guia passo a passo completo, veja **[SETUP_INICIAL.md](./SETUP_INICIAL.md)**.

### Resumo dos Passos

1. **Clone e instale dependências**:
```bash
git clone <repository-url>
cd tiermaker
npm install
```

2. **Configure variáveis de ambiente**:
   - Crie `.env.local` (veja `.env.example` como referência)
   - Configure Supabase e AWS S3

3. **Configure Supabase** (OBRIGATÓRIO):
   - Execute `supabase/setup_complete.sql` no SQL Editor
   - Veja `supabase/SETUP.md` para detalhes

4. **Configure AWS S3 CORS** (OBRIGATÓRIO para uploads):
   - Acesse bucket → Permissions → CORS
   - Cole configuração de `supabase/CORS_CONFIG_ONELINE.txt`
   - **NÃO inclua OPTIONS** na lista de métodos
   - Veja `supabase/AWS_S3_CORS_SETUP.md` para detalhes

5. **Configure AWS S3 Bucket Policy** (Recomendado):
   - Acesse bucket → Permissions → Bucket policy
   - Configure permissões de leitura/escrita
   - Veja `supabase/AWS_S3_BUCKET_POLICY.md` para exemplos

6. **Execute o projeto**:
```bash
npm run dev
```

Acesse `http://localhost:3000`

📚 **Para instruções detalhadas, veja [SETUP_INICIAL.md](./SETUP_INICIAL.md)**

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
