/**
 * ============================================================
 * AUDITOR UA
 * Universidad Autónoma del Perú
 *
 * Frontend: GitHub Pages
 * Backend seguro: n8n → Render AutorIA
 * ============================================================
 */

(function () {
  "use strict";

  const API_BASE =
    "https://autonoma-del-peru.app.n8n.cloud/webhook/auditor-ua-api";

  window.AUDITOR_UA_CONFIG = {
    appName: "Auditor UA",
    institution: "Universidad Autónoma del Perú",
    apiBase: API_BASE,
    version: "1.0.0"
  };

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (resource, options = {}) {

    let url =
      typeof resource === "string"
        ? resource
        : resource.url;

    /*
     * AUDITOR INDIVIDUAL
     */
    if (
      url.includes("port/5000/api/audit") ||
      url.endsWith("/api/audit")
    ) {
      url = API_BASE + "/audit";
    }

    /*
     * INFORMES
     */
    else if (
      url.includes("port/5000/api/report") ||
      url.endsWith("/api/report")
    ) {
      url = API_BASE + "/report";
    }

    /*
     * AUDITORÍA POR LOTE
     */
    else if (
      url.includes("port/5000/api/audit-batch") ||
      url.endsWith("/api/audit-batch")
    ) {
      url = API_BASE + "/audit-batch";
    }

    /*
     * PARAFRASEADOR
     */
    else if (
      url.includes("port/5000/api/paraphrase") ||
      url.endsWith("/api/paraphrase")
    ) {
      url = API_BASE + "/paraphrase";
    }

    console.log(
      "[AUDITOR UA] Solicitud:",
      url
    );

    const response = await originalFetch(
      url,
      options
    );

    /*
     * Evita nuevamente:
     * Unexpected token '<'
     */
    const contentType =
      response.headers.get("content-type") || "";

    if (
      !contentType.includes("application/json") &&
      url.includes("auditor-ua-api")
    ) {
      const text = await response.text();

      throw new Error(
        "El servidor no devolvió JSON. " +
        "HTTP " +
        response.status +
        ". Respuesta: " +
        text.substring(0, 150)
      );
    }

    return response;
  };

  console.log(
    "AUDITOR UA configurado correctamente."
  );

  console.log(
    "API:",
    API_BASE
  );

})();
