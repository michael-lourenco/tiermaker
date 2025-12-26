# 📤 Plano de Implementação - Sistema de Compartilhamento

## 📋 Análise do Sistema Atual

### Itens Identificados para Compartilhamento

1. **Templates** (`/templates/[id]`)
   - Template individual com itens e categorias
   - Possui cover image, nome, descrição
   - Link para criar tier list a partir do template

2. **Tier Lists** (`/tier-lists/[id]`)
   - Tier list salva e pública
   - Possui título, tiers organizados, itens
   - Visualização completa da classificação

3. **Categorias** (`/categories` e `/templates?category_id=...`)
   - Página de categorias completa
   - Templates filtrados por categoria
   - Lista de templates da categoria

4. **Editor/Criar Tier List** (`/editor/[templateId]`)
   - Link para criar tier list a partir de um template
   - Pode ser compartilhado antes mesmo de criar

5. **Página Inicial** (`/`)
   - Templates populares
   - Landing page da plataforma

6. **Lista de Templates** (`/templates`)
   - Página com todos os templates públicos
   - Pode ter filtros aplicados

---

## 🎯 Estratégia de Compartilhamento por Tipo

### 1. Templates (`/templates/[id]`)

**Formato de URL:**
```
https://tiermaker-seven.vercel.app/templates/[id]
```

**Conteúdo para Compartilhamento:**
- **Título:** Nome do template
- **Descrição:** Descrição do template ou "Crie sua tier list com [nome do template]"
- **Imagem:** Cover image do template (se disponível) ou primeira imagem dos itens
- **Texto:** "Crie sua tier list com [nome do template]! [X] itens disponíveis."

**Plataformas:**
- Twitter/X: "🎯 Crie sua tier list com [nome]! [link]"
- Facebook: Título + descrição + imagem
- WhatsApp: "🎯 Crie sua tier list com [nome]! [link]"
- Email: Assunto: "Crie sua tier list com [nome]" + corpo com descrição
- LinkedIn: Título profissional + descrição
- Reddit: Título + descrição + link
- Copiar link: URL completa

**Meta Tags Open Graph:**
```html
og:title: [Nome do Template]
og:description: [Descrição ou texto padrão]
og:image: [Cover image ou primeira imagem]
og:type: website
og:url: [URL completa]
```

---

### 2. Tier Lists (`/tier-lists/[id]`)

**Formato de URL:**
```
https://tiermaker-seven.vercel.app/tier-lists/[id]
```

**Conteúdo para Compartilhamento:**
- **Título:** Título da tier list
- **Descrição:** "Veja minha tier list de [template relacionado]" ou descrição customizada
- **Imagem:** Screenshot da tier list completa (gerar via html2canvas)
- **Texto:** "Confira minha tier list de [título]! [link]"

**Plataformas:**
- Twitter/X: "📊 Minha tier list de [título]! [link]"
- Facebook: Título + imagem gerada + link
- WhatsApp: "📊 Confira minha tier list! [link]"
- Email: Assunto: "Minha tier list: [título]" + corpo com imagem
- LinkedIn: Título + descrição profissional
- Reddit: Título + imagem + link
- Copiar link: URL completa
- Download imagem: PNG/JPG da tier list

**Meta Tags Open Graph:**
```html
og:title: [Título da Tier List]
og:description: [Descrição ou "Tier list criada em [data]"]
og:image: [Screenshot da tier list - 1200x630px]
og:type: website
og:url: [URL completa]
```

**Funcionalidade Especial:**
- Gerar screenshot automático da tier list para compartilhamento
- Usar `html2canvas` (já está no package.json)

---

### 3. Categorias (`/categories` e `/templates?category_id=...`)

**Formato de URL:**
```
https://tiermaker-seven.vercel.app/categories
https://tiermaker-seven.vercel.app/templates?category_id=[id]
```

**Conteúdo para Compartilhamento:**
- **Título:** Nome da categoria ou "Categorias de Templates"
- **Descrição:** "[X] templates disponíveis na categoria [nome]"
- **Imagem:** Logo da plataforma ou imagem representativa da categoria
- **Texto:** "Explore [X] templates na categoria [nome]! [link]"

**Plataformas:**
- Twitter/X: "📁 Explore [X] templates em [categoria]! [link]"
- Facebook: Título + descrição + link
- WhatsApp: "📁 Veja templates de [categoria]! [link]"
- Email: Assunto: "Templates de [categoria]" + corpo com lista
- LinkedIn: Título profissional + descrição
- Reddit: Título + descrição + link
- Copiar link: URL completa

**Meta Tags Open Graph:**
```html
og:title: [Nome da Categoria] - Templates
og:description: [X] templates disponíveis
og:image: [Imagem da categoria ou logo]
og:type: website
og:url: [URL completa]
```

---

### 4. Editor/Criar Tier List (`/editor/[templateId]`)

**Formato de URL:**
```
https://tiermaker-seven.vercel.app/editor/[templateId]
```

**Conteúdo para Compartilhamento:**
- **Título:** "Crie sua tier list com [nome do template]"
- **Descrição:** "Comece a criar sua tier list agora mesmo!"
- **Imagem:** Cover image do template
- **Texto:** "🎨 Crie sua tier list com [nome do template]! [link]"

**Plataformas:**
- Twitter/X: "🎨 Crie sua tier list! [link]"
- Facebook: Título + descrição + imagem + link
- WhatsApp: "🎨 Crie sua tier list agora! [link]"
- Email: Assunto: "Crie sua tier list" + corpo com link
- LinkedIn: Título profissional + descrição
- Reddit: Título + descrição + link
- Copiar link: URL completa

**Meta Tags Open Graph:**
```html
og:title: Crie sua tier list com [Nome do Template]
og:description: Comece a criar sua tier list agora mesmo!
og:image: [Cover image do template]
og:type: website
og:url: [URL completa]
```

---

### 5. Página Inicial (`/`)

**Formato de URL:**
```
https://tiermaker-seven.vercel.app/
```

**Conteúdo para Compartilhamento:**
- **Título:** "SuperTierMaker - Crie e Compartilhe Tier Lists"
- **Descrição:** "Crie, classifique e compartilhe tier lists para qualquer assunto"
- **Imagem:** Logo da plataforma
- **Texto:** "🎯 Crie e compartilhe tier lists! [link]"

**Plataformas:**
- Todas as plataformas com mensagem genérica
- Copiar link: URL completa

**Meta Tags Open Graph:**
```html
og:title: SuperTierMaker - Crie e Compartilhe Tier Lists
og:description: Crie, classifique e compartilhe tier lists para qualquer assunto
og:image: [Logo da plataforma]
og:type: website
og:url: [URL completa]
```

---

## 🛠 Implementação Técnica

### Estrutura de Arquivos

```
src/
├── components/
│   └── share/
│       ├── ShareButton.tsx          # Botão principal de compartilhamento
│       ├── ShareDialog.tsx          # Modal com opções de compartilhamento
│       ├── SharePlatformButton.tsx  # Botão individual para cada plataforma
│       └── ShareImageGenerator.tsx   # Gerador de imagem para tier lists
├── lib/
│   └── share/
│       ├── share.utils.ts           # Funções utilitárias de compartilhamento
│       ├── share.types.ts           # Tipos TypeScript
│       └── platforms.ts             # Configuração de plataformas
└── hooks/
    └── useShare.ts                  # Hook para compartilhamento
```

### Dependências Necessárias

Nenhuma nova dependência necessária! Usaremos:
- `html2canvas` (já está no package.json) - para gerar screenshots
- Web Share API nativa (quando disponível)
- Clipboard API nativa (para copiar link)

### Componentes Principais

#### 1. `ShareButton.tsx`
- Botão com ícone de compartilhar
- Abre modal `ShareDialog`
- Responsivo e acessível

#### 2. `ShareDialog.tsx`
- Modal com grid de botões de plataformas
- Campo para copiar link
- Botão de download de imagem (apenas para tier lists)
- Suporte a Web Share API (mobile)

#### 3. `SharePlatformButton.tsx`
- Botão individual para cada plataforma
- Ícone da plataforma
- Abre URL de compartilhamento em nova aba

#### 4. `ShareImageGenerator.tsx`
- Usa `html2canvas` para gerar screenshot
- Otimiza imagem para compartilhamento (1200x630px)
- Cache de imagem gerada

### Funções Utilitárias

#### `share.utils.ts`
```typescript
- generateShareUrl(type, id, params?)
- generateTwitterUrl(text, url)
- generateFacebookUrl(url)
- generateWhatsAppUrl(text, url)
- generateEmailUrl(subject, body, url)
- generateLinkedInUrl(url)
- generateRedditUrl(title, url)
- copyToClipboard(text)
- generateTierListImage(tierListId)
- getShareMetadata(type, data)
```

### Hook `useShare.ts`
```typescript
- useShare(type, data)
  - shareToPlatform(platform)
  - copyLink()
  - downloadImage()
  - canUseWebShare()
  - webShare()
```

### Meta Tags Dinâmicas

Criar função para gerar meta tags dinâmicas em cada página:

```typescript
// src/lib/share/meta-tags.ts
export function generateMetadata(type, data): Metadata {
  // Retorna objeto Metadata do Next.js
}
```

Usar em:
- `src/app/(public)/templates/[id]/page.tsx`
- `src/app/(public)/tier-lists/[id]/page.tsx`
- `src/app/(public)/categories/page.tsx`
- `src/app/editor/[templateId]/page.tsx`

---

## 📱 Plataformas Suportadas

### Redes Sociais
1. **Twitter/X**
   - URL: `https://twitter.com/intent/tweet?text=...&url=...`
   - Limite: 280 caracteres

2. **Facebook**
   - URL: `https://www.facebook.com/sharer/sharer.php?u=...`
   - Usa Open Graph tags

3. **WhatsApp**
   - URL: `https://wa.me/?text=...`
   - Funciona melhor em mobile

4. **LinkedIn**
   - URL: `https://www.linkedin.com/sharing/share-offsite/?url=...`
   - Título profissional

5. **Reddit**
   - URL: `https://reddit.com/submit?title=...&url=...`
   - Título + URL

### Outros
6. **Email**
   - URL: `mailto:?subject=...&body=...`
   - Abre cliente de email

7. **Copiar Link**
   - Usa Clipboard API
   - Feedback visual (toast)

8. **Download Imagem** (apenas tier lists)
   - Gera PNG/JPG via html2canvas
   - Download direto

9. **Web Share API** (mobile)
   - API nativa do navegador
   - Fallback para modal se não disponível

---

## 🎨 Design e UX

### Botão de Compartilhamento
- Ícone: `Share2` do lucide-react
- Posição: Topo direito das páginas (próximo ao título)
- Variante: `outline` ou `ghost`
- Tamanho: `sm` ou `md`

### Modal de Compartilhamento
- Grid responsivo: 2 colunas mobile, 3-4 desktop
- Cada botão com ícone + nome da plataforma
- Campo de input para copiar link (com botão de copiar)
- Botão de fechar
- Animações suaves

### Feedback Visual
- Toast ao copiar link
- Loading ao gerar imagem
- Ícones de plataformas (usar lucide-react ou SVG customizado)

---

## 🌐 Internacionalização

### Traduções Necessárias

**`src/lib/i18n/translations/en.json` e `pt.json`:**

```json
{
  "share": {
    "title": "Share",
    "shareTo": "Share to",
    "copyLink": "Copy link",
    "linkCopied": "Link copied!",
    "downloadImage": "Download image",
    "shareOnTwitter": "Share on Twitter",
    "shareOnFacebook": "Share on Facebook",
    "shareOnWhatsApp": "Share on WhatsApp",
    "shareOnLinkedIn": "Share on LinkedIn",
    "shareOnReddit": "Share on Reddit",
    "shareViaEmail": "Share via Email",
    "webShare": "Share",
    "generatingImage": "Generating image...",
    "template": {
      "text": "Create your tier list with {name}!",
      "description": "Create your tier list with {name}! {count} items available."
    },
    "tierList": {
      "text": "Check out my tier list: {title}!",
      "description": "Tier list created on {date}"
    },
    "category": {
      "text": "Explore {count} templates in {category}!",
      "description": "{count} templates available in {category}"
    },
    "editor": {
      "text": "Create your tier list now!",
      "description": "Start creating your tier list right now!"
    }
  }
}
```

---

## 📊 Ordem de Implementação

### Fase 1: Base e Utilitários
1. ✅ Criar estrutura de diretórios
2. ✅ Criar tipos TypeScript (`share.types.ts`)
3. ✅ Criar funções utilitárias (`share.utils.ts`)
4. ✅ Criar configuração de plataformas (`platforms.ts`)
5. ✅ Criar hook `useShare.ts`

### Fase 2: Componentes
6. ✅ Criar `ShareButton.tsx`
7. ✅ Criar `ShareDialog.tsx`
8. ✅ Criar `SharePlatformButton.tsx`
9. ✅ Criar `ShareImageGenerator.tsx` (para tier lists)

### Fase 3: Integração - Templates
10. ✅ Adicionar meta tags dinâmicas em `/templates/[id]/page.tsx`
11. ✅ Adicionar `ShareButton` em `TemplatePageClient.tsx`
12. ✅ Testar compartilhamento de templates

### Fase 4: Integração - Tier Lists
13. ✅ Adicionar meta tags dinâmicas em `/tier-lists/[id]/page.tsx`
14. ✅ Adicionar `ShareButton` em `TierListPageClient.tsx`
15. ✅ Implementar geração de imagem para tier lists
16. ✅ Testar compartilhamento de tier lists

### Fase 5: Integração - Categorias
17. ✅ Adicionar meta tags dinâmicas em `/categories/page.tsx`
18. ✅ Adicionar `ShareButton` em `CategoriesPageClient.tsx`
19. ✅ Testar compartilhamento de categorias

### Fase 6: Integração - Editor
20. ✅ Adicionar meta tags dinâmicas em `/editor/[templateId]/page.tsx`
21. ✅ Adicionar `ShareButton` no editor (opcional)
22. ✅ Testar compartilhamento do editor

### Fase 7: Internacionalização
23. ✅ Adicionar traduções em `en.json` e `pt.json`
24. ✅ Atualizar tipos de tradução
25. ✅ Testar em ambos os idiomas

### Fase 8: Polimento e Testes
26. ✅ Testar em diferentes dispositivos (mobile, desktop)
27. ✅ Testar todas as plataformas
28. ✅ Verificar meta tags com ferramentas (Facebook Debugger, Twitter Card Validator)
29. ✅ Otimizar performance (lazy loading, cache de imagens)
30. ✅ Ajustes finais de UX

---

## 🔍 Considerações Técnicas

### Performance
- Lazy load do componente `ShareDialog` (usar `dynamic` do Next.js)
- Cache de imagens geradas (usar localStorage ou IndexedDB)
- Debounce em geração de imagem

### Acessibilidade
- ARIA labels em todos os botões
- Navegação por teclado
- Foco visual claro
- Screen reader friendly

### SEO
- Meta tags Open Graph em todas as páginas
- Twitter Cards
- Schema.org markup (opcional, futuro)

### Compatibilidade
- Web Share API com fallback
- Clipboard API com fallback (para navegadores antigos)
- html2canvas com polyfill se necessário

### Segurança
- Validar URLs antes de compartilhar
- Sanitizar textos para evitar XSS
- Validar dados antes de gerar meta tags

---

## 📈 Métricas e Analytics (Futuro)

Considerar adicionar tracking de compartilhamentos:
- Qual plataforma é mais usada
- Quantos compartilhamentos por tipo de conteúdo
- Conversão de compartilhamentos para visualizações

---

## ✅ Checklist de Implementação

- [ ] Estrutura de diretórios criada
- [ ] Tipos TypeScript definidos
- [ ] Funções utilitárias implementadas
- [ ] Hook `useShare` criado
- [ ] Componente `ShareButton` criado
- [ ] Componente `ShareDialog` criado
- [ ] Componente `SharePlatformButton` criado
- [ ] Componente `ShareImageGenerator` criado
- [ ] Meta tags dinâmicas para templates
- [ ] Meta tags dinâmicas para tier lists
- [ ] Meta tags dinâmicas para categorias
- [ ] Meta tags dinâmicas para editor
- [ ] Integração em `TemplatePageClient`
- [ ] Integração em `TierListPageClient`
- [ ] Integração em `CategoriesPageClient`
- [ ] Traduções adicionadas
- [ ] Testes em mobile
- [ ] Testes em desktop
- [ ] Validação de meta tags
- [ ] Performance otimizada
- [ ] Acessibilidade verificada

---

## 🚀 Próximos Passos

1. Revisar e aprovar este plano
2. Começar implementação pela Fase 1
3. Testar cada fase antes de prosseguir
4. Iterar baseado em feedback

---

**Data de Criação:** 2024-12-26
**Última Atualização:** 2024-12-26

