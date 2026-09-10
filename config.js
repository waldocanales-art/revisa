/**
 * ============================================================
 * AUDITOR UA — CONFIGURACIÓN DE CONEXIÓN
 * Universidad Autónoma del Perú
 * ============================================================
 *
 * Este archivo se carga ANTES de la aplicación principal.
 *
 * La aplicación compilada actualmente contiene:
 *     port/5000
 *
 * Este archivo intercepta esas llamadas y las redirige
 * al backend que definamos en API_BASE.
 * ============================================================
 */

(function () {
  "use strict";

  /**
   * ==========================================================
   * 1. BACKEND
   * ==========================================================
   *
   * PRIMERA ETAPA:
   * Dejamos vacío mientras comprobamos GitHub Pages.
   *
   * MÁS ADELANTE:
   * Ejemplo:
   *
   * const API_BASE = "https://ua-auditor-018.onrender.com";
   *
   * IMPORTANTE:
   * El backend tendrá que disponer de las rutas que utiliza
   * esta aplicación:
   *
   * /api/audit
   * /api/report
   * /api/audit-batch
   * /api/paraphrase
   */

  const API_BASE = "";

  /**
   * ==========================================================
   * 2. CONFIGURACIÓN GLOBAL
   * ==========================================================
   */

  window.AUDITOR_UA_CONFIG = {
    appName: "Auditor UA",
    institution: "Universidad Autónoma del Perú",

    apiBase: API_BASE,

    version: "1.0.0",

    normas: {
      res018: true,
      res088: true,
      res023: true,
      apa7: true
    },

    endpoints: {
      audit: "/api/audit",
      report: "/api/report",
      batch: "/api/audit-batch",
      paraphrase: "/api/paraphrase"
    }
  };

  /**
   * Mantener también esta variable por compatibilidad futura.
   */
  window.__AUDITOR_API_BASE__ = API_BASE;

  /**
   * ==========================================================
   * 3. INTERCEPTOR FETCH
   * ==========================================================
   *
   * El JavaScript compilado actualmente intenta llamar:
   *
   * port/5000/api/...
   *
   * Aquí reemplazamos automáticamente "port/5000"
   * por la dirección real del backend.
   */

  const originalFetch = window.fetch.bind(window);

  window.fetch = function (resource, options) {

    let url = resource;

    /**
     * Cuando fetch recibe un Request.
     */
    if (resource instanceof Request) {
      url = resource.url;
    }

    /**
     * Cuando fetch recibe una cadena.
     */
    if (typeof url === "string") {

      /**
       * Caso:
       * port/5000/api/audit
       */
      if (url.startsWith("port/5000")) {

        const path = url.substring("port/5000".length);

        /**
         * Si ya tenemos backend configurado.
         */
        if (API_BASE) {

          const backend =
            API_BASE.endsWith("/")
              ? API_BASE.slice(0, -1)
              : API_BASE;

          const apiPath =
            path.startsWith("/")
              ? path
              : "/" + path;

          url = backend + apiPath;

        } else {

          /**
           * Mientras todavía no conectamos Render,
           * eliminamos "port/5000".
           *
           * Esto permite que la interfaz cargue sin utilizar
           * esa dirección inválida.
           */
          url = path.startsWith("/")
            ? path
            : "/" + path;
        }
      }
    }

    /**
     * Reconstruir Request cuando corresponda.
     */
    if (resource instanceof Request) {

      const newRequest = new Request(url, resource);

      return originalFetch(newRequest, options);
    }

    return originalFetch(url, options);
  };

  /**
   * ==========================================================
   * 4. INFORMACIÓN EN CONSOLA
   * ==========================================================
   */

  console.log(
    "%cAUDITOR UA",
    "font-size:18px;font-weight:bold;color:#087f5b;"
  );

  console.log(
    "Universidad Autónoma del Perú"
  );

  console.log(
    "Configuración cargada correctamente."
  );

  if (API_BASE) {
    console.log(
      "Backend conectado:",
      API_BASE
    );
  } else {
    console.log(
      "Backend todavía no configurado. Modo interfaz."
    );
  }

})();
