import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Importing Tailwind CSS plugin


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()
, tailwindcss()], // Adding Tailwind CSS plugin to Vite configuration
})
