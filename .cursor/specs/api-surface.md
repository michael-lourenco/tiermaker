# Spec: Superfície de API

Todas as rotas em `src/app/api/**`. Mutações sensíveis **não** devem ir direto do browser ao Supabase quando houver regra de negócio crítica (upload, create/clone template, Stripe).

| Método | Rota | Auth | Papel |
|--------|------|------|-------|
| GET/POST | `/api/auth/callback` | OAuth callback | Sessão Supabase (`?next=` opcional) |
| POST | `/api/auth/resend-confirmation` | Não | Reenvia confirmação via Resend + `generateLink` |
| POST | `/api/auth/forgot-password` | Não | Email de recovery via Resend |
| POST | `/api/auth/check-email` | Não | Verifica se email já está cadastrado |
| GET | `/api/templates` | Não | Listagem pública (search, category, sort, paginação) |
| POST | `/api/templates/create` | Sim | Cria template |
| POST | `/api/templates/clone` | Sim | Clone + cópia S3 |
| POST | `/api/templates/fork-for-ranking` | Sim | Fork no save do editor (não-owner + imagens novas); retorna `itemIdMap` |
| POST | `/api/templates/append-items` | Sim | Anexa itens a template próprio (owner) |
| GET/POST | `/api/tierlists` | Conforme handler | Listagem/criação |
| POST | `/api/tierlists/[id]/like` | Sim | Like |
| PATCH | `/api/tierlists/[id]/public` | Sim | Público/privado |
| POST | `/api/upload` | Sim | Upload S3 |
| POST | `/api/upload/delete` | Sim | Delete objeto |
| POST | `/api/delete-images` | Sim | Limpeza imagens |
| POST | `/api/views/register` | Flexível | Contagem de views |
| POST | `/api/language` | Cookie | Preferência de idioma |
| POST | `/api/stripe/create-donation-checkout` | Opcional (email se logado) | Checkout doação |
| POST | `/api/stripe/webhooks` | Assinatura Stripe | Eventos doação |

## Convenções de handler
1. Validar sessão quando a operação for do usuário.
2. Validar body (campos obrigatórios) → `400`.
3. Usar service role **somente** server-side e só quando RLS impedir a operação legítima.
4. Respostas JSON: `{ error }` ou payload tipado; status HTTP corretos.
5. Não reintroduzir `limitReached` / checks de plano.
