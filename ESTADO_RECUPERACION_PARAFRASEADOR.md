# Diagnóstico y recuperación del parafraseador (12-10-2026)

## Qué se recuperó
- Código de interfaz publicado en septiembre de 2026.
- Carga de archivos Word `.docx`.
- Intensidades baja/media/alta.
- La interfaz envía un `POST` `multipart/form-data`, con campos `file` e `intensidad`, a `/api/paraphrase`.

## Qué se corrigió en esta rama
- Enrutamiento uniforme de `/api/audit`, `/api/audit-batch`, `/api/report` y `/api/paraphrase`.
- Mensajes legibles para errores HTTP 401, 403, 404, 413 y 5xx.
- Mensajes para HTML inesperado y fallos de CORS o red.
- Se conserva sin cambios el JavaScript y CSS de septiembre; la rama histórica `rescate-parafraseador-2026-09` sigue intacta.

## Bloqueo pendiente: backend
**Este repositorio sólo contiene el frontend.** La URL configurada es:

`https://autonoma-del-peru.app.n8n.cloud/webhook/auditor-ua-api/paraphrase`

En n8n debe existir un webhook de producción `POST` coincidente, con el workflow activo y respuesta **JSON**. No basta con ver el formulario publicado en GitHub Pages.

El motor `ua-auditor-018` que se revisó no publica un endpoint de parafraseo en su `app.py`. Eso no descarta que exista otro servicio en n8n/Render, pero impide asegurar que el procesamiento esté operativo.

### Contrato que espera el frontend

**Solicitud**: POST `multipart/form-data` con `file` (Word `.docx`) y `intensidad` (`baja`, `media`, `alta`).

**Respuesta**: JSON que contenga, al menos, `ok: true`, `resumen` y las URL/archivos de salida usados por la interfaz. El contrato exacto de descarga debe verificarse antes de activar el flujo.

### Si la página no abre
GitHub Pages debe estar habilitado en **Settings → Pages**, con:
- Source: **Deploy from a branch**
- Branch: **reparacion-parafraseador-2026-10-12**
- Folder: **/(root)**

URL esperada: `https://waldocanales-art.github.io/revisa/`.

**Advertencia**: Cambiar la rama en Pages cambia qué versión se muestra en esa URL. El repositorio `main` no se modifica.

### Si carga la página pero el parafraseo falla
1. Abrir n8n y localizar el webhook de `auditor-ua-api/paraphrase`.
2. Verificar que sea `POST` y esté activo.
3. Verificar cabeceras CORS, tamaño máximo del archivo, motor conectado y respuesta JSON.
4. Ejecutar prueba con un archivo de ejemplo sin datos sensibles y revisar el historial de ejecución de n8n.

**Estado:** Corrección de mensajes y rutas realizada; publicación y procesamiento de documentos no verificados de extremo a extremo.
