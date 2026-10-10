(() => {
  const configuredBaseUrl = document.querySelector('meta[name="api-base-url"]')?.content.trim();
  const baseUrl = (configuredBaseUrl || window.location.origin).replace(/\/$/, '');

  function getErrorMessage(payload, fallback) {
    if (!payload || typeof payload !== 'object') return fallback;
    if (typeof payload.message === 'string') return payload.message;
    if (typeof payload.detail === 'string') return payload.detail;
    if (typeof payload.title === 'string') return payload.title;
    if (payload.errors && typeof payload.errors === 'object') {
      return Object.values(payload.errors).flat().join(' ');
    }
    return fallback;
  }

  async function request(path, { method = 'GET', body } = {}) {
    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
    } catch {
      throw new Error(document.documentElement.lang === 'es'
        ? 'No se pudo contactar con el servidor. Revisa la URL de la API y CORS.'
        : 'Could not reach the server. Check the API URL and CORS settings.');
    }

    const responseText = await response.text();
    let payload = null;
    if (responseText) {
      try {
        payload = JSON.parse(responseText);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const fallback = document.documentElement.lang === 'es'
        ? `La solicitud falló (${response.status}).`
        : `The request failed (${response.status}).`;
      throw new Error(getErrorMessage(payload, fallback));
    }
    return payload;
  }

  window.hostelApi = { request };
})();