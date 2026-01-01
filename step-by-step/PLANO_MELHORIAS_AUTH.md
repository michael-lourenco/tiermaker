# 📋 Plano de Melhorias - Páginas de Login e Registro

## 🎯 Objetivos

1. Traduzir todas as mensagens de erro (incluindo erros do Supabase)
2. Melhorar contraste de mensagens de erro no modo dark
3. Adicionar feedback de validação de email após registro
4. Integrar sistema de tradução nas páginas de autenticação
5. Melhorar validações de formulário (email, senha)

---

## 📊 FASE 1: Preparação - Tradução de Erros e i18n

### 1.1 Criar utilitário de tradução de erros do Supabase
**Arquivo:** `src/utils/authErrors.ts`

**Objetivo:** Mapear códigos/mensagens de erro do Supabase para mensagens traduzidas

**Tarefas:**
- Criar função `translateAuthError(error: AuthError | null, lang: 'pt' | 'en'): string`
- Mapear erros comuns do Supabase:
  - `Invalid login credentials` → "Credenciais inválidas"
  - `Email not confirmed` → "Email não confirmado"
  - `User already registered` → "Usuário já cadastrado"
  - `Password should be at least 6 characters` → "A senha deve ter pelo menos 6 caracteres"
  - `Invalid email` → "Email inválido"
  - `Email rate limit exceeded` → "Muitas tentativas. Tente novamente mais tarde"
  - `Email already exists` → "Este email já está cadastrado"
  - E outros erros comuns

**Códigos de erro do Supabase a mapear:**
- `invalid_credentials`
- `email_not_confirmed`
- `signup_disabled`
- `email_rate_limit_exceeded`
- `user_already_registered`
- `weak_password`
- `invalid_email`

### 1.2 Adicionar traduções ao sistema i18n
**Arquivos:** 
- `src/lib/i18n/translations/pt.json`
- `src/lib/i18n/translations/en.json`
- `src/lib/i18n/types.ts`

**Traduções necessárias:**

```json
{
  "auth": {
    "title": "Autenticação",
    "login": {
      "title": "Entrar",
      "description": "Digite suas credenciais para acessar sua conta",
      "email": "Email",
      "password": "Senha",
      "signIn": "Entrar",
      "signingIn": "Entrando...",
      "noAccount": "Não tem uma conta?",
      "signUp": "Cadastrar-se",
      "emailPlaceholder": "voce@exemplo.com"
    },
    "register": {
      "title": "Criar Conta",
      "description": "Cadastre-se para começar a criar tier lists",
      "email": "Email",
      "password": "Senha",
      "confirmPassword": "Confirmar Senha",
      "signUp": "Cadastrar",
      "creatingAccount": "Criando conta...",
      "hasAccount": "Já tem uma conta?",
      "signIn": "Entrar",
      "emailPlaceholder": "voce@exemplo.com",
      "passwordsNotMatch": "As senhas não coincidem",
      "passwordMinLength": "A senha deve ter pelo menos 6 caracteres",
      "passwordRequirements": "A senha deve conter pelo menos 6 caracteres",
      "invalidEmail": "Email inválido"
    },
    "errors": {
      "invalidCredentials": "Credenciais inválidas",
      "emailNotConfirmed": "Email não confirmado. Verifique sua caixa de entrada",
      "userAlreadyRegistered": "Este usuário já está cadastrado",
      "emailRateLimit": "Muitas tentativas. Tente novamente mais tarde",
      "invalidEmail": "Email inválido",
      "weakPassword": "A senha é muito fraca",
      "genericError": "Ocorreu um erro. Tente novamente"
    },
    "emailVerification": {
      "title": "Verifique seu Email",
      "message": "Enviamos um email de confirmação para {email}",
      "instructions": "Por favor, verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.",
      "notReceived": "Não recebeu o email?",
      "resendEmail": "Reenviar Email",
      "resending": "Reenviando...",
      "resendSuccess": "Email reenviado com sucesso!",
      "resendError": "Erro ao reenviar email. Tente novamente.",
      "backToLogin": "Voltar para Login",
      "checkSpam": "Verifique também sua pasta de spam"
    }
  }
}
```

---

## 📊 FASE 2: Integrar Sistema de Tradução

### 2.1 Atualizar página de Login
**Arquivo:** `src/app/(auth)/login/page.tsx`

**Tarefas:**
- Importar `useTranslation`
- Substituir todos os textos hardcoded por `t('auth.login.*')`
- Usar `translateAuthError` para traduzir erros
- Adicionar Label component para melhor acessibilidade

### 2.2 Atualizar página de Registro
**Arquivo:** `src/app/(auth)/register/page.tsx`

**Tarefas:**
- Importar `useTranslation`
- Substituir todos os textos hardcoded por `t('auth.register.*')`
- Usar `translateAuthError` para traduzir erros
- Adicionar Label component para melhor acessibilidade

---

## 📊 FASE 3: Melhorar Contraste e Estilo de Erros

### 3.1 Criar componente de erro reutilizável
**Arquivo:** `src/components/ui/auth-error-message.tsx` (ou adicionar ao componente existente)

**Objetivo:** Componente com melhor contraste para dark mode

**Estilo proposto:**
- Dark mode: Borda vermelha (`border-destructive`) + Background mais claro (`bg-destructive/20` ou `bg-red-950/50`)
- Light mode: Manter atual (`bg-destructive/10`)
- Texto sempre legível (`text-destructive` com contraste adequado)

**Exemplo:**
```tsx
<div className="p-3 text-sm text-destructive bg-destructive/10 dark:bg-destructive/20 dark:border dark:border-destructive/50 rounded-md">
  {message}
</div>
```

### 3.2 Atualizar páginas para usar novo componente
- Substituir divs de erro atuais pelo novo componente
- Garantir que todas as mensagens de erro usem o componente

---

## 📊 FASE 4: Melhorar Validações

### 4.1 Validação de Email
**Arquivo:** `src/utils/validation.ts` (criar novo)

**Tarefas:**
- Criar função `validateEmail(email: string): { valid: boolean; error?: string }`
- Validar formato básico de email
- Retornar mensagem traduzida

### 4.2 Validação de Senha
**Arquivo:** `src/utils/validation.ts`

**Tarefas:**
- Criar função `validatePassword(password: string): { valid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' }`
- Validar:
  - Mínimo 6 caracteres
  - Opcional: Força da senha (se quiser adicionar feedback visual)
- Retornar mensagem traduzida

### 4.3 Integrar validações nas páginas
**Arquivos:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`

**Tarefas:**
- Adicionar validação em tempo real ou no submit
- Mostrar mensagens de erro de validação antes de enviar ao Supabase
- Usar traduções para mensagens de validação

---

## 📊 FASE 5: Modal de Confirmação de Email

### 5.1 Criar componente do Modal
**Arquivo:** `src/components/auth/EmailVerificationModal.tsx`

**Funcionalidades:**
- Exibir mensagem de confirmação
- Mostrar email do usuário
- Botão para reenviar email
- Botão para voltar ao login
- Estado de loading ao reenviar
- Mensagens de sucesso/erro

### 5.2 Criar função de reenvio de email
**Arquivo:** `src/hooks/useAuth.ts` ou novo hook `src/hooks/useEmailVerification.ts`

**Tarefas:**
- Criar função `resendConfirmationEmail(email: string)`
- Usar `supabase.auth.resend({ type: 'signup', email })`
- Retornar sucesso/erro

### 5.3 Integrar modal na página de registro
**Arquivo:** `src/app/(auth)/register/page.tsx`

**Tarefas:**
- Adicionar estado para controlar modal (`showEmailModal`)
- Após registro bem-sucedido (sem erro), mostrar modal ao invés de redirecionar
- Passar email do usuário para o modal
- Modal deve ter botão para fechar e ir ao login

---

## 📋 Resumo das Alterações

### Arquivos a Criar:
1. `src/utils/authErrors.ts` - Utilitário de tradução de erros
2. `src/utils/validation.ts` - Funções de validação
3. `src/components/auth/EmailVerificationModal.tsx` - Modal de confirmação

### Arquivos a Modificar:
1. `src/lib/i18n/translations/pt.json` - Adicionar traduções de auth
2. `src/lib/i18n/translations/en.json` - Adicionar traduções de auth
3. `src/lib/i18n/types.ts` - Adicionar tipos de tradução
4. `src/app/(auth)/login/page.tsx` - Integrar traduções, melhorar erros, validações
5. `src/app/(auth)/register/page.tsx` - Integrar traduções, melhorar erros, validações, modal
6. `src/hooks/useAuth.ts` - Adicionar função de reenvio de email (ou criar novo hook)
7. `src/components/ui/auth-error-message.tsx` - Criar componente de erro (opcional)

### Ordem de Implementação:
1. ✅ FASE 1: Preparação (traduções e utilitários)
2. ✅ FASE 2: Integrar traduções
3. ✅ FASE 3: Melhorar contraste de erros
4. ✅ FASE 4: Validações melhoradas
5. ✅ FASE 5: Modal de confirmação

---

## 🎨 Detalhes de Design

### Modal de Email Verification:
- Título: "Verifique seu Email"
- Ícone: Email/Mail (lucide-react)
- Texto principal com email destacado
- Instruções claras
- Botão primário: "Reenviar Email"
- Botão secundário: "Voltar para Login"
- Aviso sobre pasta de spam

### Estilo de Erros (Dark Mode):
```css
/* Light mode (atual) */
bg-destructive/10 text-destructive

/* Dark mode (novo) */
bg-destructive/20 border border-destructive/50 text-destructive
```

---

## ✅ Critérios de Sucesso

- [ ] Todas as mensagens de erro estão traduzidas (PT/EN)
- [ ] Erros do Supabase são traduzidos corretamente
- [ ] Erros são legíveis no modo dark
- [ ] Validações de email e senha funcionam e mostram mensagens traduzidas
- [ ] Modal de confirmação aparece após registro
- [ ] Botão de reenviar email funciona
- [ ] Páginas de login/registro usam sistema de tradução
- [ ] Interface é consistente e acessível
