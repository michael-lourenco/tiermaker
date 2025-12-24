# Troubleshooting - Resolução de Problemas

## ❌ Erro: "Could not find the table 'public.templates' in the schema cache"

### Problema
O Supabase não consegue encontrar as tabelas porque as migrations ainda não foram executadas.

### Solução Rápida

1. **Acesse o Supabase Dashboard**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Execute o Script Completo**
   - Abra o arquivo `supabase/setup_complete.sql` no seu editor
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em **Run** (ou pressione Ctrl+Enter / Cmd+Enter)

4. **Verifique se Funcionou**
   - Vá para **Table Editor** no menu lateral
   - Você deve ver 7 tabelas:
     - `templates`
     - `template_items`
     - `tier_lists`
     - `tier_list_items`
     - `tier_list_tiers`
     - `likes`
     - `comments`

5. **Reinicie o Servidor Next.js**
   ```bash
   # Pare o servidor (Ctrl+C) e inicie novamente
   npm run dev
   ```

### Verificação Rápida

Execute esta query no SQL Editor para verificar se as tabelas existem:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Você deve ver todas as 7 tabelas listadas acima.

## ❌ Outros Erros Comuns

### Erro: "permission denied"
- **Causa**: Você não tem permissões de administrador
- **Solução**: Certifique-se de estar logado como administrador do projeto

### Erro: "relation already exists"
- **Causa**: Algumas tabelas já foram criadas anteriormente
- **Solução**: 
  - Opção 1: Ignore o erro (as tabelas já existem)
  - Opção 2: Drop as tabelas e execute novamente (CUIDADO: apaga dados!)

### Erro: "extension uuid-ossp does not exist"
- **Causa**: Extensão não habilitada (raro no Supabase)
- **Solução**: Remova a linha `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` do script

### Erro: Variáveis de ambiente não configuradas
- **Causa**: Arquivo `.env.local` não existe ou está incompleto
- **Solução**: 
  ```bash
  cp .env.example .env.local
  # Edite .env.local com suas credenciais do Supabase
  ```

### Erro: CORS Policy - "Access-Control-Allow-Origin header is not present"
- **Causa**: O bucket S3 não está configurado para aceitar requisições do seu domínio
- **Solução**: 
  1. Acesse o AWS Console → S3 → Seu bucket
  2. Vá em **Permissions** → **Cross-origin resource sharing (CORS)**
  3. Adicione a configuração CORS (veja `supabase/AWS_S3_CORS_SETUP.md` para detalhes)
  4. Adicione `http://localhost:3000` aos AllowedOrigins para desenvolvimento
  5. Salve e aguarde alguns segundos para propagar
  6. Recarregue a página e tente novamente

## ✅ Checklist de Setup

Antes de executar o projeto, verifique:

- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Projeto Supabase criado
- [ ] Migrations executadas (tabelas criadas)
- [ ] RLS habilitado (verificar em Authentication > Policies)
- [ ] Servidor Next.js rodando (`npm run dev`)

## 📚 Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Setup](./supabase/SETUP.md)
- [README Principal](./README.md)

