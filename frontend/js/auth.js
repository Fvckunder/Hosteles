(() => {
  // Keep this URL aligned with the HTTP profile in APIHostel/Properties/launchSettings.json.
  const loginEndpoint = 'http://localhost:5159/api/Auth/Login';

  document.querySelectorAll('form[data-auth-role]').forEach((form) => {
    const feedback = form.querySelector('.auth-feedback');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      feedback.hidden = true;
      submitButton.disabled = true;
      sessionStorage.removeItem('hostel-access-token');

      const email = form.elements.namedItem('email').value.trim();
      const password = form.elements.namedItem('password').value;
      const language = document.documentElement.lang;
      const isSpanish = language === 'es';

      try {
        const response = await fetch(loginEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const responseText = await response.text();
        let result = {};

        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch {
          result = { message: responseText };
        }

        if (!response.ok) {
          // Development API exceptions can include stack traces; show a safe message for 5xx responses.
          const message = response.status >= 500
            ? (isSpanish
              ? 'El servidor no pudo completar el acceso. Comprueba la conexión con la base de datos.'
              : 'The server could not complete sign-in. Check the database connection.')
            : (result.message || result.title || (isSpanish
              ? 'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.'
              : 'Sign-in failed. Check your details and try again.'));
          throw new Error(message);
        }

        const roleName = result.roleName || result.RoleName;
        const expectedRole = form.dataset.authRole;
        // Match the account type to the form; this is a UI check, not server-side authorization.
        const roleMatches = expectedRole === 'staff'
          ? ['Admin', 'Receptionist'].includes(roleName)
          : roleName === expectedRole;

        if (!roleMatches) {
          throw new Error(isSpanish
            ? 'Esta cuenta no tiene permiso para acceder desde aquí.'
            : 'This account does not have permission to sign in here.');
        }

        const accessToken = result.accessToken || result.AccessToken;
        if (!accessToken) {
          throw new Error(isSpanish
            ? 'La respuesta del servidor no incluyó una sesión válida.'
            : 'The server response did not include a valid session.');
        }
        sessionStorage.setItem('hostel-access-token', accessToken);

        if (expectedRole === 'staff') {
          window.location.assign('employee-dashboard.html');
          return;
        }

        window.location.assign('guest-portal.html');
      } catch (error) {
        const message = error instanceof TypeError
          ? (isSpanish
            ? 'No se pudo conectar con el servidor. Comprueba que la API esté en ejecución.'
            : 'Could not reach the server. Check that the API is running.')
          : error.message;
        showFeedback(message || (isSpanish
          ? 'No se pudo conectar con el servidor. Comprueba que la API esté en ejecución.'
          : 'Could not reach the server. Check that the API is running.'), 'error');
      } finally {
        submitButton.disabled = false;
      }
    });

    function showFeedback(message, state) {
      feedback.textContent = message;
      feedback.dataset.state = state;
      feedback.hidden = false;
    }
  });
})();