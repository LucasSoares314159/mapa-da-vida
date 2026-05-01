/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@xyflow/react', '@xyflow/system', '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-label', '@radix-ui/react-slot'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
