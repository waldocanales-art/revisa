/**
 * Auditor UA · capa de conexión para GitHub Pages
 * Rescate 11-09-2026; reparación de diagnóstico 12-10-2026
 *
 * IMPORTANTE:
 * Esta configuración NO instala el motor de parafraseo.
 * n8n debe tener una ruta POST que responda JSON en:
 *   /webhook/auditor-ua-api/paraphrase
 */
(function () {
  "use strict";

  const API_BASE =
    "https://autonoma-del-peru.app.n8n.cloud/webhook/auditor-ua-api";

  // El JS histórico genera rutas "/api/*". Se mantienen relativas:
  // esta capa las transforma antes de enviarlas al servicio.
  window.__AUDITOR_API_BASE__ = "";
  window.AUDITOR_UA_CONFIG = {
    appName: "Auditor UA",
    institution: "Universidad Autónoma del Perú",
    apiBase: API_BASE,
    version: "rescate-septiembre-2026-diagnostico-1",
    endpoints: {
      audit: API_BASE + "/audit",
      report: API_BASE + "/report",
      batch: API_BASE + "/audit-batch",
      paraphrase: API_BASE + "/paraphrase"
    }
  };

  const nativeFetch = window.fetch.bind(window);
  const paths = new Set(["audit", "audit-batch", "report", "paraphrase"]);

  function failureMessage(endpoint, status, detail) {
    const prefix = endpoint === "paraphrase" ? "Parafraseador" : "Auditor UA";
    if (status === 404) {
      return prefix + ": HTTP 404. La ruta POST /webhook/auditor-ua-api/" +
        endpoint + " no está disponible. Revisar en n8n que el workflow esté " +
        "ACTIVO y que la ruta del webhook coincida exactamente.";
    }
    if (status === 401 || status === 403) {
      return prefix + ": HTTP " + status +
        ". El servicio rechazó la autorización; revisar la seguridad en n8n.";
    }
    if (status === 413) {
      return prefix + ": HTTP 413. Documento demasiado grande para el servidor.";
    }
    if (status === 500 || status === 502 || status === 503 || status === 504) {
      return prefix + ": HTTP " + status +
        ". Fallo en el procesamiento del servidor o en su conexión con el motor.";
    }
    return prefix + ": HTTP " + status +
      (detail ? ". " + String(detail).slice(0, 250) : ". Error del servicio.");
  }

  window.fetch = async function (resource, options) {
    const urlText = typeof resource === "string"
      ? resource
      : (resource instanceof URL ? resource.href : resource && resource.url);

    if (!urlText) {
      return nativeFetch(resource, options);
    }

    let parsed;
    try {
      parsed = new URL(urlText, window.location.href);
    } catch (_) {
      return nativeFetch(resource, options);
    }

    // Coincide con las cuatro rutas exactas del bundle histórico.
    const match = parsed.pathname.match(/\/api\/(audit-batch|audit|report|paraphrase)\/?$/);
    const endpoint = match && match[1];
    if (!endpoint || !paths.has(endpoint)) {
      return nativeFetch(resource, options);
    }

    const destination = API_BASE + "/" + endpoint + parsed.search;

    let response;
    try {
      // No establecer Content-Type a mano: el navegador agrega el
      // multipart/form-data con boundary cuando se envía un archivo.
      response = await nativeFetch(destination, options);
    } catch (error) {
      throw new Error(
        "No se pudo conectar con el servicio " + endpoint +
        ". Comprobar conexión, CORS, el dominio n8n y el estado del workflow. " +
        "Detalle: " + (error && error.message ? error.message : "error de red")
      );
    }

    const type = (response.headers.get("content-type") || "").toLowerCase();
    if (!type.includes("json")) {
      throw new Error(
        failureMessage(endpoint, response.status, "") +
        " El servidor devolvió " + (type || "un tipo desconocido") +
        " en vez de JSON. No es un problema del archivo Word."
      );
    }

    if (!response.ok) {
      let payload = null;
      try { payload = await response.clone().json(); } catch (_) {}
      const detail = payload && (payload.error || payload.message || payload.detail);
      throw new Error(failureMessage(endpoint, response.status, detail));
    }

    return response;
  };

  console.info("[Auditor UA] Conexión configurada. Backend n8n:", API_BASE);
})();
