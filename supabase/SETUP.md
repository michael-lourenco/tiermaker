# Setup do Banco de Dados Supabase

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
1. Vá para [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto (ou crie um novo)

### 2. Execute as Migrations

#### Opção A: Via SQL Editor (Recomendado)

1. No dashboard do Supabase, vá para **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Copie e cole o conteúdo completo do arquivo `001_initial_schema.sql`
4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Aguarde a confirmação de sucesso
6. Repita o processo com o arquivo `002_rls_policies.sql`

#### Opção B: Via Supabase CLI (Avançado)

Se você tem o Supabase CLI instalado:

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref seu-project-ref

# Executar migrations
supabase db push
```

### 3. Verificar se as Tabelas Foram Criadas

1. No dashboard, vá para **Table Editor**
2. Você deve ver as seguintes tabelas:
   - `templates`
   - `template_items`
   - `tier_lists`
   - `tier_list_items`
   - `tier_list_tiers`
   - `likes`
   - `comments`

### 4. Verificar RLS (Row Level Security)

1. No dashboard, vá para **Authentication** > **Policies**
2. Verifique se as políticas foram criadas para cada tabela

## ⚠️ Troubleshooting

### Erro: "relation already exists"
- Isso significa que algumas tabelas já existem
- Você pode ignorar ou dropar as tabelas existentes primeiro

### Erro: "permission denied"
- Certifique-se de estar usando a conta de administrador do projeto
- Verifique se você tem permissões para criar tabelas

### Erro: "extension uuid-ossp does not exist"
- O Supabase já tem essa extensão habilitada por padrão
- Você pode remover a primeira linha do script se necessário

## 📝 Script Consolidado

Se preferir, você pode usar o arquivo `setup_complete.sql` que contém todas as migrations em um único script.

