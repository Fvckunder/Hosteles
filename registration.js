(() => {
  const apiBaseUrl = 'http://localhost:5159/api/Auth';
  const form = document.querySelector('[data-guest-registration]');
  if (!form) return;

  const countrySelect = form.elements.namedItem('countryId');
  const feedback = form.querySelector('.auth-feedback');
  const submitButton = form.querySelector('button[type="submit"]');

  loadCountries();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.hidden = true;

    const isSpanish = document.documentElement.lang === 'es';
    const password = form.elements.namedItem('password').value;
    const confirmPassword = form.elements.namedItem('confirmPassword').value;
    const dni = form.elements.namedItem('dni').value.trim();
    const passport = form.elements.namedItem('passport').value.trim();

    if (password !== confirmPassword) {
      showFeedback(isSpanish ? 'Las contraseñas no coinciden.' : 'Passwords do not match.', 'error');
      return;
    }

    if (!dni && !passport) {
      showFeedback(isSpanish
        ? 'Introduce un DNI o un pasaporte.'
        : 'Enter a national ID or a passport.', 'error');
      return;
    }

    submitButton.disabled = true;
    try {
      const response = await fetch(`${apiBaseUrl}/RegisterGuest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.elements.namedItem('firstName').value.trim(),
          lastName: form.elements.namedItem('lastName').value.trim(),
          email: form.elements.namedItem('email').value.trim(),
          password,
          countryId: Number(countrySelect.value),
          dni: dni || null,
          passport: passport || null,
          phone: form.elements.namedItem('phone').value.trim() || null
        })
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, isSpanish));
      }

      showFeedback(isSpanish
        ? 'Cuenta creada. Ya puedes iniciar sesión.'
        : 'Account created. You can now sign in.', 'success');
      form.reset();
      countrySelect.value = '';
    } catch (error) {
      showFeedback(error instanceof TypeError
        ? (isSpanish
          ? 'No se pudo conectar con el servidor. Comprueba que la API esté en ejecución.'
          : 'Could not reach the server. Check that the API is running.')
        : error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  async function loadCountries() {
    const isSpanish = document.documentElement.lang === 'es';
    try {
      const response = await fetch(`${apiBaseUrl}/Countries`);
      if (!response.ok) throw new Error('Country list request failed.');
      const countries = await response.json();
      countrySelect.replaceChildren(new Option(
        isSpanish ? 'Selecciona tu país' : 'Select your country', ''));
      countries.forEach((country) => {
        countrySelect.add(new Option(country.countryName, country.countryId));
      });
    } catch {
      countrySelect.replaceChildren(new Option(
        isSpanish ? 'No se pudieron cargar los países' : 'Could not load countries', ''));
      showFeedback(isSpanish
        ? 'No se pudo cargar la lista de países. Comprueba que la API esté disponible.'
        : 'Could not load the country list. Check that the API is available.', 'error');
    }
  }

  async function readErrorMessage(response, isSpanish) {
    if (response.status >= 500) {
      return isSpanish
        ? 'El servidor no pudo completar el registro.'
        : 'The server could not complete registration.';
    }

    const responseText = await response.text();
    try {
      const body = JSON.parse(responseText);
      return body.message || body.title || (typeof body === 'string' ? body : null)
        || (isSpanish ? 'No se pudo completar el registro.' : 'Registration failed.');
    } catch {
      return responseText || (isSpanish
        ? 'No se pudo completar el registro.'
        : 'Registration failed.');
    }
  }

  function showFeedback(message, state) {
    feedback.textContent = message;
    feedback.dataset.state = state;
    feedback.hidden = false;
  }
})();