# Auditor UA — GitHub Pages

Paquete listo para publicar la interfaz **Auditor UA — Res. 088 · Res. 018 · Res. 023 · APA 7** con GitHub Pages.

## Publicación

1. Cree un repositorio en GitHub, por ejemplo `auditor-ua`.
2. Suba **el contenido de esta carpeta** a la rama `main` (incluida la carpeta `.github`).
3. En GitHub vaya a **Settings → Pages**.
4. En **Build and deployment → Source**, seleccione **GitHub Actions**.
5. Abra la pestaña **Actions** y espere a que termine `Deploy Auditor UA to GitHub Pages`.
6. GitHub mostrará la URL publicada, normalmente:
   `https://USUARIO.github.io/auditor-ua/`

## Backend/API

La interfaz consume estas rutas:

- `POST /api/audit`
- `POST /api/report`
- `POST /api/audit-batch`
- `POST /api/paraphrase`

Edite `config.js` si la API está en otro dominio:

```js
window.__AUDITOR_API_BASE__ = "https://SU-BACKEND";
```

No incluya `/api` al final si su servidor ya expone las rutas anteriores como `/api/...`.

### Importante

GitHub Pages aloja únicamente archivos estáticos. El servidor de auditoría debe estar desplegado aparte (por ejemplo, Render) y permitir solicitudes CORS desde el dominio de GitHub Pages.
