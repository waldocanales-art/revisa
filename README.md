# Auditor UA — GitHub Pages

Paquete listo para publicar la interfaz **Auditor UA — Res. 088 · Res. 018 · Res. 023 · APA 7** con GitHub Pages.

## Enrutamiento del frontend (versión 1.0.1 — corrección en revisión)

El archivo `config.js` reconoce **rutas completas**, no coincidencias por prefijo, para evitar que `/api/audit-batch` se envíe accidentalmente a `/audit`. Conserva el cuerpo, método y encabezados cuando se utiliza un objeto `Request` y los parámetros de consulta en las URLs. No modifica el dominio del webhook ni la configuración de credenciales.

**Pruebas:** `node --test tests/config-routing.test.cjs` (Node 22). Además, GitHub Actions debe ejecutar este comando al abrir un pull request.

**Límite de la corrección:** el enrutamiento correcto no garantiza que cada subruta de n8n exista o que su backend de Render esté disponible. Comprobar por separado las cuatro rutas `audit`, `audit-batch`, `report` y `paraphrase` en el sistema publicado. Las reglas 018/088 residen en AutorIA; REVISA es una interfaz de acceso y no debe declararse auditor normativo independiente solo por su diseño.

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
