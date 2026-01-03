# Configuração do Webhook Stripe no WSL2 (Windows)

Guia específico para configurar o Stripe CLI e webhooks no Windows usando WSL2.

## 🚀 Instalação do Stripe CLI no WSL2

### Método 1: Via Repositório APT (Recomendado)

```bash
# 1. Adicionar chave GPG do Stripe
curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg

# 2. Adicionar repositório do Stripe
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list

# 3. Atualizar lista de pacotes
sudo apt update

# 4. Instalar Stripe CLI
sudo apt install stripe

# 5. Verificar instalação
stripe --version
```

### Método 2: Download Manual (Se método 1 não funcionar)

```bash
# 1. Ir para o diretório temporário
cd /tmp

# 2. Baixar a versão mais recente (substitua X.X.X pela versão atual)
# Ver versões em: https://github.com/stripe/stripe-cli/releases
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_X.X.X_linux_x86_64.tar.gz

# 3. Extrair
tar -xzf stripe_*_linux_x86_64.tar.gz

# 4. Mover para um diretório no PATH
sudo mv stripe /usr/local/bin/

# 5. Tornar executável
sudo chmod +x /usr/local/bin/stripe

# 6. Verificar instalação
stripe --version
```

## 🔐 Autenticação

```bash
# Autenticar no Stripe
stripe login
```

Isso abrirá seu navegador para autorizar. Se o navegador não abrir automaticamente:
1. Copie a URL que aparece no terminal
2. Cole no navegador (no Windows)
3. Autorize o acesso

## 🔄 Forwarding de Webhooks (Desenvolvimento)

### Passo 1: Iniciar sua aplicação Next.js

No terminal WSL2:
```bash
cd /home/michael/devTestes/tiermaker
npm run dev
```

### Passo 2: Em outro terminal WSL2, iniciar o Stripe CLI

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

Você verá algo como:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

### Passo 3: Copiar o Webhook Secret

Copie o `whsec_xxxxxxxxxxxxx` que aparece e adicione ao seu `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Passo 4: Reiniciar a aplicação (se necessário)

Se você adicionou a variável de ambiente, pode precisar reiniciar o servidor Next.js:
```bash
# Ctrl+C para parar
npm run dev
```

## 🐛 Troubleshooting Específico para WSL2

### Problema: "command not found: stripe"

**Solução:**
- Verifique se o Stripe CLI está instalado: `which stripe`
- Se não encontrar, verifique se `/usr/local/bin` está no PATH: `echo $PATH`
- Tente reinstalar usando o Método 2 (download manual)

### Problema: Navegador não abre ao executar `stripe login`

**Solução:**
1. Copie a URL que aparece no terminal
2. Cole no navegador do Windows
3. Autorize o acesso
4. Volte ao terminal e pressione Enter

### Problema: Webhook não está sendo recebido

**Verificações:**

1. **Certifique-se de que ambos os processos estão rodando:**
   ```bash
   # Terminal 1: Next.js
   npm run dev
   
   # Terminal 2: Stripe CLI
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

2. **Verifique se a porta 3000 está acessível:**
   ```bash
   curl http://localhost:3000
   ```

3. **Verifique os logs do Stripe CLI:**
   - O Stripe CLI mostrará os eventos recebidos
   - Verifique se há erros de conexão

4. **Verifique se a URL está correta:**
   - Deve ser: `localhost:3000/api/stripe/webhooks`
   - Não use `127.0.0.1` (pode causar problemas no WSL2)

### Problema: Erro de permissão ao instalar

**Solução:**
```bash
# Se precisar de sudo, certifique-se de ter permissões
sudo apt update
sudo apt install stripe
```

### Problema: Versão desatualizada do Stripe CLI

**Solução:**
```bash
# Atualizar via APT
sudo apt update
sudo apt upgrade stripe

# Ou reinstalar usando Método 2 com a versão mais recente
```

## ✅ Checklist para WSL2

- [ ] Stripe CLI instalado (`stripe --version` funciona)
- [ ] Autenticado no Stripe (`stripe login` completo)
- [ ] Aplicação Next.js rodando (`npm run dev`)
- [ ] Stripe CLI forwarding ativo (`stripe listen --forward-to localhost:3000/api/stripe/webhooks`)
- [ ] Webhook secret copiado do terminal do Stripe CLI
- [ ] Variável `STRIPE_WEBHOOK_SECRET` no `.env.local`
- [ ] Aplicação reiniciada (se necessário)
- [ ] Webhook testado (fazer uma compra de teste)

## 📝 Comandos Úteis

```bash
# Verificar versão do Stripe CLI
stripe --version

# Ver status da autenticação
stripe config --list

# Testar webhook localmente
stripe trigger checkout.session.completed

# Ver logs do Stripe CLI
# (os logs aparecem automaticamente no terminal onde está rodando)

# Parar o forwarding
# Ctrl+C no terminal onde está rodando o `stripe listen`
```

## 🎯 Fluxo Completo de Desenvolvimento

1. **Terminal 1 - Next.js:**
   ```bash
   cd /home/michael/devTestes/tiermaker
   npm run dev
   ```

2. **Terminal 2 - Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

3. **Copiar webhook secret** do Terminal 2 e adicionar ao `.env.local`

4. **Testar:**
   - Fazer uma compra de teste
   - Ver logs no Terminal 2 (Stripe CLI)
   - Ver logs no Terminal 1 (Next.js)
   - Verificar banco de dados

---

**Data de Criação:** 2025-01-XX
**Ambiente:** Windows + WSL2
