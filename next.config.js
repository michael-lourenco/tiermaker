/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Em desenvolvimento, o otimizador do Next faz fetch das URLs remotas no processo Node.
    // No WSL2 o DNS costuma falhar para *.amazonaws.com (ENOTFOUND) mesmo com o browser OK.
    // `unoptimized` faz o <Image> usar a URL direta no cliente, evitando esse fetch no servidor.
    // Para forçar otimização em dev: NEXT_IMAGE_UNOPTIMIZED=0
    unoptimized:
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_IMAGE_UNOPTIMIZED !== '0',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.**.amazonaws.com',
      },
    ],
  },
  // Desabilitar logs de desenvolvimento (fetch, webpack, etc)
  logging: false, // Desabilitar completamente todos os logs do Next.js
  // Remover console.* em produção
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Manter apenas error e warn em produção
    } : false,
  },
  // Desabilitar logs do webpack em desenvolvimento
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Silenciar logs do webpack no browser
      config.infrastructureLogging = {
        level: 'error',
      }
    }
    return config
  },
}

module.exports = nextConfig


