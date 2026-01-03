# Instalação do Stripe CLI no WSL2 - Método Alternativo

Se o método do repositório APT não funcionou, use este método manual.

## 🔧 Método Manual (Recomendado para WSL2)

### Passo 1: Baixar o Stripe CLI

```bash
# Ir para diretório temporário
cd /tmp

# Baixar a versão mais recente
curl -L -o stripe-cli.tar.gz https://github.com/stripe/stripe-cli/releases/latest/download/stripe_1.21.9_linux_x86_64.tar.gz
```

**Nota:** Se a versão acima não funcionar, verifique a versão mais recente em:
https://github.com/stripe/stripe-cli/releases/latest

### Passo 2: Extrair

```bash
# Extrair o arquivo
tar -xzf stripe-cli.tar.gz

# Ver o conteúdo (deve ter um arquivo 'stripe')
ls -la
```

### Passo 3: Instalar

```bash
# Mover para /usr/local/bin (não precisa de sudo para mover, mas precisa para copiar)
sudo cp stripe /usr/local/bin/

# Ou mover para ~/.local/bin (não precisa de sudo)
mkdir -p ~/.local/bin
cp stripe ~/.local/bin/

# Se usar ~/.local/bin, adicionar ao PATH (adicionar ao ~/.bashrc ou ~/.zshrc)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Passo 4: Tornar Executável

```bash
# Se instalou em /usr/local/bin
sudo chmod +x /usr/local/bin/stripe

# Se instalou em ~/.local/bin
chmod +x ~/.local/bin/stripe
```

### Passo 5: Verificar

```bash
# Verificar instalação
stripe --version

# Deve mostrar algo como: stripe version 1.21.9
```

## ✅ Método Simplificado (Tudo em um comando)

Execute este comando completo:

```bash
cd /tmp && \
curl -L -o stripe.tar.gz https://github.com/stripe/stripe-cli/releases/latest/download/stripe_1.21.9_linux_x86_64.tar.gz && \
tar -xzf stripe.tar.gz && \
sudo mv stripe /usr/local/bin/stripe && \
sudo chmod +x /usr/local/bin/stripe && \
stripe --version
```

## 🔍 Verificar Versão Mais Recente

Se quiser usar a versão mais recente automaticamente:

```bash
# Obter URL da versão mais recente
LATEST_URL=$(curl -s https://api.github.com/repos/stripe/stripe-cli/releases/latest | grep "browser_download_url.*linux_x86_64.tar.gz" | cut -d '"' -f 4)

# Baixar e instalar
cd /tmp && \
curl -L -o stripe.tar.gz "$LATEST_URL" && \
tar -xzf stripe.tar.gz && \
sudo mv stripe /usr/local/bin/stripe && \
sudo chmod +x /usr/local/bin/stripe && \
stripe --version
```

## 🐛 Se Ainda Não Funcionar

### Opção 1: Instalar em Diretório Local (Sem sudo)

```bash
# Criar diretório local
mkdir -p ~/bin

# Baixar e extrair
cd ~/bin
curl -L -o stripe.tar.gz https://github.com/stripe/stripe-cli/releases/latest/download/stripe_1.21.9_linux_x86_64.tar.gz
tar -xzf stripe.tar.gz
chmod +x stripe

# Adicionar ao PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verificar
stripe --version
```

### Opção 2: Usar via npx (Temporário, não recomendado para produção)

```bash
# Não precisa instalar, mas é mais lento
npx stripe-cli --version
npx stripe-cli login
npx stripe-cli listen --forward-to localhost:3000/api/stripe/webhooks
```

## ✅ Após Instalar com Sucesso

1. **Autenticar:**
   ```bash
   stripe login
   ```

2. **Usar o webhook forwarding:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

---

**Dica:** Se você estiver usando zsh em vez de bash, substitua `~/.bashrc` por `~/.zshrc` nos comandos acima.
