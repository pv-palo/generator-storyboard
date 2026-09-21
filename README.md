[README.md](https://github.com/user-attachments/files/32459498/README.md)
# Storyboard Studio

Aplicación web (React + TypeScript + Tailwind CSS) para gestionar guiones de storyboard y exportarlos como script ExtendScript (`.jsx`) ejecutable en Adobe Illustrator.

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador.

Para generar la build de producción:

```bash
npm run build
npm run preview
```

## Estructura del proyecto

```
src/
  types.ts                  Tipos compartidos (Frame, StoryboardConfig)
  App.tsx                   Componente raíz, estado global y persistencia
  components/
    Sidebar.tsx              Métricas del proyecto y descarga del .jsx
    ScriptParser.tsx         Editor visual de planos + importador de texto plano
  utils/
    parser.ts                Parser de guiones en texto plano
    jsxGenerator.ts           Generador del script ExtendScript para Illustrator
```

## Funcionalidad

- **Editor visual**: tarjetas por plano con número, descripción y enlace de referencia. Reordenar (subir/bajar), eliminar, añadir y limpiar todo el guión.
- **Importador de texto plano**: pega un guión (ej. `Fotograma 01: Escena en la calle... https://...`) y se convierte automáticamente en fotogramas.
- **Persistencia**: los fotogramas y la configuración del proyecto se guardan en `localStorage` del navegador.
- **Exportación a Illustrator (.jsx)**:
  - Crea una mesa de trabajo de 1920×1280 px por fotograma.
  - Distribuye las mesas en una cuadrícula de 4 a 6 columnas, adaptada al número de planos.
  - Centra la cuadrícula simétricamente respecto al origen (0, 0).
  - Respeta un límite seguro de lienzo de ±8191 pt para evitar el error 1200 "Artboard Out of Canvas" (AOoC); si el guión es demasiado extenso, ajusta las columnas automáticamente y avisa de cualquier fotograma que deba omitirse.
  - Organiza el contenido en dos capas: "Fondo Video" (fondo oscuro 16:9) e "Información de Escena" (badge de plano, descripción y enlace).
  - Envuelve las operaciones críticas en `try/catch` y recentra la vista del documento al finalizar.

## Ejecutar el script en Illustrator

1. Genera y descarga el archivo `.jsx` desde la barra lateral.
2. En Illustrator: **Archivo > Scripts > Otro Script...** y selecciona el archivo descargado.
3. El script creará las mesas de trabajo automáticamente en el documento activo (o en uno nuevo, según elijas).

## Publicar en GitHub Pages

El proyecto ya está listo para GitHub Pages: `vite.config.ts` usa rutas relativas (`base: './'`), así que el build funciona igual tanto en la raíz de un dominio (`tuusuario.github.io`) como bajo un subdirectorio de repositorio (`tuusuario.github.io/tu-repo/`), sin tocar configuración.

### Opción A — Despliegue automático con GitHub Actions (recomendado)

Ya incluye el workflow `.github/workflows/deploy.yml`, que compila y publica en cada push a `main`.

1. Sube este proyecto a un repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "Storyboard Studio"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
2. En GitHub, ve a **Settings > Pages** y en "Build and deployment" elige **Source: GitHub Actions**.
3. Al hacer push a `main`, el workflow compila la app y la publica automáticamente. La URL aparecerá en la pestaña **Actions** (y en Settings > Pages) con el formato `https://TU_USUARIO.github.io/TU_REPO/`.

### Opción B — Despliegue manual con el paquete `gh-pages`

Si prefieres no usar Actions:

```bash
npm install
npm run deploy
```

Esto compila el proyecto (`predeploy`) y publica el contenido de `dist/` en la rama `gh-pages` del repositorio (`deploy`, vía el paquete `gh-pages`). Luego, en **Settings > Pages**, elige **Source: Deploy from a branch** y selecciona la rama `gh-pages` (carpeta `/`).

### Notas

- El repositorio necesita tener configurado un `remote origin` apuntando a GitHub antes de correr `npm run deploy`.
- Si usas un dominio personalizado, añade un archivo `CNAME` dentro de `public/` con el dominio; Vite lo copiará al build automáticamente.
- El archivo `public/.nojekyll` ya está incluido para que GitHub Pages no intente procesar el sitio con Jekyll (necesario porque Vite genera una carpeta `assets/`).
