# Imagens locais: ENOTFOUND em tiermaker-app.s3.amazonaws.com

## Contexto

Erro observado no terminal (Node/Next):

- `TypeError: fetch failed` com `getaddrinfo ENOTFOUND tiermaker-app.s3.amazonaws.com`
- Às vezes `TimeoutError` no cliente (imagens que não carregam a tempo)

## Causa

1. URLs públicas do S3 vêm de `AWS_S3_BUCKET_NAME` / `getBucketUrl()` em `src/lib/aws/s3.ts`.
2. Componentes usam `next/image` com `remotePatterns` para `*.s3.amazonaws.com` (`next.config.js`).
3. Com otimização ligada, o Next solicita a imagem pelo endpoint `/_next/image`, e **o servidor Node** faz `fetch` para o S3.
4. Em **WSL2**, resolução DNS do Linux costuma falhar ou ser lenta para hosts da AWS, gerando `ENOTFOUND`, enquanto o **navegador no Windows** pode resolver normalmente.

## Alteração feita

Arquivo: `next.config.js`

- Em `NODE_ENV === 'development'`, `images.unoptimized` fica `true` por padrão.
- Assim o `<Image>` aponta para a URL HTTPS do S3 **direto no browser**, sem passar pelo fetch de otimização no servidor WSL.
- Override: definir `NEXT_IMAGE_UNOPTIMIZED=0` no `.env` para voltar a usar o otimizador em dev (útil se o DNS do ambiente estiver correto).

## Alternativas operacionais (sem mudar código)

- Corrigir DNS no WSL (`/etc/resolv.conf`, usar DNS 8.8.8.8 / 1.1.1.1, ou `generateResolvConf = false` no `.wslconfig`).
- Garantir rede/VPN que permita resolver `*.amazonaws.com`.

## Arquivos relacionados

| Arquivo | Função |
|---------|--------|
| `next.config.js` | `images.unoptimized` em dev + `remotePatterns` S3/Supabase |
| `src/lib/aws/s3.ts` | Montagem da URL pública do bucket (`getBucketUrl`, `publicUrlForS3Key`) |
