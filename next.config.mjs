/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Transpile packages that need it
  transpilePackages: ['lucide-react'],
};

export default nextConfig;
