import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dafeiyu.blog',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory'
  }
});

