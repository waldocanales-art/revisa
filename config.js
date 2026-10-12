/**
 * Auditor UA — public GitHub Pages frontend configuration.
 * n8n is the public API proxy; API credentials remain on the server.
 * Do not point the static frontend directly at the protected Render endpoints.
 */
(function () {
  "use strict";

  const API_BASE = "https://autonoma-del-peru.app.n8n.cloud/webhook/auditor-ua-api";
  const ENDPOINTS = new Set(["audit", "audit-batch", "report", "paraphrase"]);

  window.AUDITOR_UA_CONFIG = {
    appName: "Auditor UA",
    institution: "Universidad Autónoma del Perú",
    apiBase: API_BASE,
    version: "1.0.1"
  };

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (resource, options) {
    let sourceUrl;

    if (typeof resource === "string") {
      sourceUrl = resource;
    } else if (typeof URL !== "undefined" && resource instanceof URL) {
      sourceUrl = resource.toString();
    } else if (resource && typeof resource.url === "string") {
      sourceUrl = resource.url;
    }

    if (!sourceUrl) {
      return originalFetch(resource, options);
    }

    let destination = null;
    try {
      const parsed = new URL(sourceUrl, window.location.href);
      // Match the COMPLETE endpoint name, not the "audit" prefix of "audit-batch".
      const route = parsed.pathname.match(/\/api\/(audit-batch|audit|report|paraphrase)\/?$/i);
      if (route && ENDPOINTS.has(route[1].toLowerCase())) {
        destination = API_BASE + "/" + route[1].toLowerCase() + parsed.search;
      }
    } catch (error) {
      // Unknown/non-URL requests retain the browser's native fetch behavior.
      return originalFetch(resource, options);
    }

    if (!destination) {
      return originalFetch(resource, options);
    }

    // Preserve POST body, headers and credentials when the caller provides a Request.
    const forwardedResource =
      typeof Request !== "undefined" && resource instanceof Request
        ? new Request(destination, resource)
        : destination;

    const response = await originalFetch(forwardedResource, options);
    const contentType = (response.headers.get("content-type") || "").toLowerCase();

    if (!(contentType.includes("application/json") || contentType.includes("+json"))) {
      const snippet = (await response.clone().text()).slice(0, 150);
      throw new Error(
        "La API de Auditor UA no devolvió JSON. HTTP " +
        response.status + ". Respuesta: " + snippet
      );
    }

    return response;
  };
})();
