/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/trilha',
        destination: '/trilha/index.html',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/trilha-da-produtividade',
        destination: '/trilha',
        permanent: true,
      },
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@xyflow/react', '@xyflow/system', '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-label', '@radix-ui/react-slot'],
    serverComponentsExternalPackages: ['nodemailer'],
  },
  compiler: {
    // Mantem alertas operacionais nos Runtime Logs da Vercel. Logs de debug e
    // informacao continuam removidos do bundle de producao.
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
}

export default nextConfig
