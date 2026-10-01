/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { markdownPostsPlugin } from './plugins/vite-plugin-markdown-posts'

export default defineConfig({
  // 独自ドメイン（techblog.kkito.stream）の直下で配信するため '/'。
  // GitHub Pagesの既定URL（<user>.github.io/<repo>/）で配信する場合は '/<repo>/' にする
  base: '/',
  plugins: [markdownPostsPlugin(), react(), tailwindcss()],
  // vite-react-ssg固有のオプション（REQ-012: /posts/<slug>/ 形式で出力）
  ssgOptions: {
    dirStyle: 'nested',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
