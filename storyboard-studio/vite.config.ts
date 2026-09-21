import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Rutas relativas: así el build funciona igual en la raíz de un dominio
  // (usuario.github.io) o bajo un subdirectorio de repositorio
  // (usuario.github.io/nombre-repo/), sin tener que hardcodear el nombre.
  base: './',
});
