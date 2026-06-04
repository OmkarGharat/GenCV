/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: ['avatars.githubusercontent.com']
  },
  // Prevent Webpack from bundling Node-native packages.
  // puppeteer-core and @sparticuz/chromium must run as-is in Node — bundling
  // them breaks binary resolution and causes ENOENT errors.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
}

module.exports = nextConfig