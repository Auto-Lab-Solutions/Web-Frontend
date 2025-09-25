import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Define environment-specific AWS regions
  const awsRegions = {
    development: 'us-east-1',
    production: 'ap-southeast-2'
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __AWS_REGION__: JSON.stringify(awsRegions[mode] || 'us-east-1'),
      __ENVIRONMENT__: JSON.stringify(mode || 'development')
    },
    build: {
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false
    }
  }
})