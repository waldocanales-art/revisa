/**
 * Auditor UA - conexión segura con AutorIA Render.
 * 2026-10-12: adapta el cliente histórico a la API vigente.
 * Claves en memoria de esta pestaña exclusivamente; nunca se guardan.
 */
(function () {
  "use strict";
  const RENDER_BASE = "https://ua-auditor-018.onrender.com";
  const N8N_BASE = "https://autonoma-del-peru.app.n8n.cloud/webhook/auditor-ua-api";
  const API_ENDPOINTS = new Set(["audit-batch", "report"]);
  let privateKey = null;
  let activePrompt = null;
  window.__AUDITOR_API_BASE__ = "";
  window.AUDITOR_UA_CONFIG = {
    appName: "Auditor UA",
    institution: "Universidad Autónoma del Perú",
    version: "REVISa-V18.6-2026-10-16",
    apiBase: RENDER_BASE,
    auditEngine: "AutorIA-018-088-024-025",
    paraphraseBase: RENDER_BASE,
  };
  const rawFetch = window.fetch.bind(window);

  function accessKey() {
    if (privateKey) return Promise.resolve(privateKey);
    if (activePrompt) return activePrompt;
    activePrompt = new Promise((resolve) => {
      const shade = document.createElement("div");
      shade.setAttribute("role", "presentation");
      shade.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.52);z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px";
      const panel = document.createElement("form");
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-label", "Acceso seguro a AutorIA");
      panel.style.cssText = "width:100%;max-width:420px;padding:24px;border-radius:16px;background:#fff;color:#242424;box-shadow:0 20px 60px #0003;font-family:system-ui,Arial";
      const title = document.createElement("h2");
      title.textContent = "Acceso seguro al motor AutorIA";
      title.style.cssText = "font-weight:700;font-size:19px;margin:0 0 12px";
      const description = document.createElement("p");
      description.textContent = "Ingresa la clave API de auditoría configurada en Render. Se utiliza únicamente durante esta sesión y nunca se guarda en GitHub ni en el navegador.";
      description.style.cssText = "font-size:14px;line-height:1.55;margin:0 0 16px";
      const input = document.createElement("input");
      input.type = "password";
      input.required = true;
      input.autocomplete = "off";
      input.placeholder = "Clave API de auditoría";
      input.setAttribute("aria-label", "Clave API de auditoría");
      input.style.cssText = "width:100%;padding:12px;border:1px solid #ccc;border-radius:9px;margin-bottom:14px;box-sizing:border-box";
      const actions = document.createElement("div");
      actions.style.cssText = "display:flex;gap:12px";
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.textContent = "Cancelar";
      cancel.style.cssText = "flex:1;padding:11px;background:#eee;border:0;border-radius:8px;cursor:pointer";
      const submit = document.createElement("button");
      submit.type = "submit";
      submit.textContent = "Conectar";
      submit.style.cssText = "flex:1;padding:11px;background:#147453;color:white;border:0;border-radius:8px;cursor:pointer";
      actions.append(cancel, submit);
      panel.append(title, description, input, actions);
      shade.append(panel);
      document.body.append(shade);
      const done = (value) => {
        shade.remove();
        activePrompt = null;
        resolve(value);
      };
      cancel.addEventListener("click", () => done(null));
      panel.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const value = input.value.trim();
        input.value = "";
        if (!value) return;
        privateKey = value;
        done(value);
      });
      input.focus();
    });
    return activePrompt;
  }

  function jsonResult(data) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  function httpError(status, detail) {
    const suffix = detail ? " " + String(detail).slice(0, 240) : "";
    if (status === 401 || status === 403) {
      privateKey = null;
      return "Clave API incorrecta o sin autorización (HTTP " + status + "). Vuelve a seleccionar el archivo para introducirla de nuevo.";
    }
    if (status === 413) return "Documento demasiado grande (HTTP 413). Comprímelo con la pestaña Compresor.";
    if (status === 429) return "El motor está procesando otra auditoría. Reintenta al terminar (HTTP 429).";
    if (status === 404) return "Ruta de API no encontrada (HTTP 404). Verifica el despliegue de AutorIA.";
    if (status >= 500) return "El servidor AutorIA falló o agotó sus recursos (HTTP " + status + ")." + suffix;
    return "No se pudo completar la solicitud (HTTP " + status + ")." + suffix;
  }

  async function auditViaRender(originalForm) {
    const file = originalForm.get("file");
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".docx")) {
      return jsonResult({ ok: false, error: "Selecciona un documento Word .docx válido." });
    }
    // Límite preventivo de la interfaz, para instancia de 512 MiB.
    if (file.size > 30 * 1024 * 1024) {
      return jsonResult({ ok: false, error: "La auditoría admite archivos de hasta 30 MB. Para documentos mayores (por ejemplo el equipo 234), reduce imágenes con el Compresor y vuelve a cargar. No se eliminará contenido científico." });
    }
    const norma = String(originalForm.get("norma") || "");
    if (!["018", "088", "024", "025"].includes(norma)) {
      return jsonResult({ ok: false, error: "Seleccione una combinación normativa válida (018+023, 088+023, 018+024 o 018+025)." });
    }
    const guia = norma === "088" ? "088-2023-VRI-UA" : "018-2024-VRI-UA";
    const estilo = (norma === "024" || norma === "025" ? norma : "023") + "-2024-VRI-UA";
    const token = await accessKey();
    if (!token) return jsonResult({ ok: false, error: "Auditoría cancelada. Debes ingresar la clave API de AutorIA." });
    const payload = new FormData();
    payload.append("documento", file, file.name);
    payload.append("guia", guia);
    payload.append("guia_estilo", estilo);
    payload.append("caso", file.name);
    payload.append("enfoque", "");
    const address = RENDER_BASE + "/v1/audit/" + norma;
    let response;
    try {
      response = await rawFetch(address, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: { "X-API-Key": token },
        body: payload,
      });
    } catch (error) {
      return jsonResult({
        ok: false,
        error: "No se pudo conectar con AutorIA en Render. Comprueba el estado del servidor y la configuración CORS. " +
          (error && error.message ? error.message : "Error de red."),
      });
    }
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.toLowerCase().includes("json")) {
      return jsonResult({ ok: false, error: httpError(response.status) + " La respuesta no fue JSON." });
    }
    let data;
    try { data = await response.json(); }
    catch (_) { return jsonResult({ ok: false, error: "Render devolvió un JSON inválido." }); }
    if (!response.ok) {
      const detail = data && (data.error || data.detail || data.message);
      return jsonResult({ ok: false, error: httpError(response.status, detail) });
    }
    if (!data || data.ok !== true) {
      return jsonResult({ ok: false, error: data && data.error ? data.error : "La auditoría no terminó correctamente en Render." });
    }
    const docxUrl = data.files && data.files.corrected_docx && data.files.corrected_docx.url;
    const xlsxUrl = data.files && data.files.audit_xlsx && data.files.audit_xlsx.url;
    if (!docxUrl || !xlsxUrl) {
      return jsonResult({ ok: false, error: "La auditoría finalizó pero faltan los enlaces a los archivos corregidos." });
    }
    return jsonResult(Object.assign({}, data, {
      originalName: file.name,
      norma: norma,
      guia: guia,
      guia_estilo: estilo,
      docxUrl: docxUrl,
      xlsxUrl: xlsxUrl,
    }));
  }

  async function paraphraseViaRender(originalForm) {
    const file = originalForm.get("file");
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".docx")) {
      return jsonResult({ ok: false, error: "Selecciona un archivo Word .docx válido." });
    }
    if (file.size > 10 * 1024 * 1024) {
      return jsonResult({ ok: false, error: "El límite del parafraseador es 10 MB. Utiliza el Compresor." });
    }
    const intensidad = originalForm.get("intensidad");
    if (!["baja", "media", "alta"].includes(intensidad)) {
      return jsonResult({ ok: false, error: "La intensidad seleccionada no es válida." });
    }

    const payload = new FormData();
    payload.append("documento", file, file.name);
    payload.append("intensidad", intensidad);

    let response;
    try {
      response = await rawFetch(RENDER_BASE + "/v1/paraphrase", {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        body: payload,
      });
    } catch (error) {
      return jsonResult({
        ok: false,
        error: "No fue posible conectar el parafraseador con AutorIA Render. Verifica CORS y disponibilidad. " +
          (error && error.message ? error.message : "Error de red."),
      });
    }
    const type = (response.headers.get("Content-Type") || "").toLowerCase();
    if (!type.includes("json")) {
      return jsonResult({ ok: false, error: httpError(response.status) + " Render no devolvió JSON." });
    }
    let result;
    try { result = await response.json(); }
    catch (_) { return jsonResult({ ok: false, error: "Respuesta del motor inválida: JSON mal formado." }); }
    if (!response.ok) {
      const detail = result && (result.detail || result.error || result.message);
      return jsonResult({ ok: false, error: httpError(response.status, detail) });
    }
    if (!result || result.ok !== true) {
      return jsonResult({ ok: false, error: result && result.error ? result.error : "El motor no concluyó." });
    }
    return jsonResult(result);
  }

  async function callLegacyService(route, resource, options) {
    const target = N8N_BASE + "/" + route;
    let response;
    try { response = await rawFetch(target, options); }
    catch (error) {
      throw new Error("No se pudo conectar con n8n (" + route + "). Verifica el webhook activo, CORS y el motor vinculado. " +
        (error && error.message ? error.message : "Error de red."));
    }
    const type = (response.headers.get("Content-Type") || "").toLowerCase();
    if (!type.includes("json")) {
      throw new Error("n8n (" + route + ") devolvió HTTP " + response.status + " y un tipo " +
        (type || "desconocido") + " en vez de JSON. Verifica la ruta de producción del webhook.");
    }
    if (!response.ok) {
      const data = await response.clone().json().catch(() => ({}));
      throw new Error(httpError(response.status, data.error || data.message || data.detail));
    }
    return response;
  }

  window.fetch = async function (resource, options) {
    const address = typeof resource === "string" ? resource :
      resource instanceof URL ? resource.href : resource && resource.url;
    if (!address) return rawFetch(resource, options);
    let parsed;
    try { parsed = new URL(address, window.location.href); }
    catch (_) { return rawFetch(resource, options); }
    const match = parsed.pathname.match(/\/api\/(audit-batch|audit|paraphrase|report)\/?$/);
    if (!match) return rawFetch(resource, options);
    if (match[1] === "audit") {
      if (!options || !(options.body instanceof FormData)) {
        return jsonResult({ ok: false, error: "Solicitud de auditoría inválida (se requiere Word en FormData)." });
      }
      return auditViaRender(options.body);
    }
    if (match[1] === "paraphrase") {
      if (!options || !(options.body instanceof FormData)) {
        return jsonResult({ ok: false, error: "Solicitud de parafraseo inválida (se requiere Word en FormData)." });
      }
      return paraphraseViaRender(options.body);
    }
    if (API_ENDPOINTS.has(match[1])) {
      return callLegacyService(match[1], resource, options);
    }
    return rawFetch(resource, options);
  };
})();
