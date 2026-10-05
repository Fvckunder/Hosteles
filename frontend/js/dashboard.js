(() => {
  const apiBaseUrl = 'http://localhost:5159/api/Auth';
  const tokenKey = 'hostel-access-token';
  const accessToken = sessionStorage.getItem(tokenKey);
  const employeeDialog = document.querySelector('[data-employee-dialog]');
  const registerButton = document.querySelector('[data-open-employee-registration]');
  const registrationForm = document.querySelector('[data-employee-registration]');
  const logoutLink = document.querySelector('.logout-link');

  if (!accessToken) {
    window.location.replace('employee-login.html');
    return;
  }

  initializeDashboard();

  registerButton.addEventListener('click', () => employeeDialog.showModal());
  document.querySelector('[data-close-employee-dialog]').addEventListener('click', () => employeeDialog.close());
  logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    sessionStorage.removeItem(tokenKey);
    window.location.replace('employee-login.html');
  });

  registrationForm.addEventListener('submit', registerEmployee);

  async function initializeDashboard() {
    try {
      const response = await fetch(`${apiBaseUrl}/Me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.status === 401 || response.status === 403) {
        leaveDashboard();
        return;
      }
      if (!response.ok) throw new Error('Could not load the signed-in account.');

      const user = await response.json();
      const fullName = `${user.firstName} ${user.lastName}`;
      const isSpanish = document.documentElement.lang === 'es';
      const heading = document.querySelector('.dashboard-header h1');
      const profileName = document.querySelector('.profile-mini strong');
      const profileRole = document.querySelector('.profile-mini small');
      const avatar = document.querySelector('.profile-avatar');

      heading.textContent = isSpanish ? `Buenos días, ${user.firstName}.` : `Good morning, ${user.firstName}.`;
      profileName.textContent = fullName;
      profileRole.textContent = translateRole(user.roleName, isSpanish);
      avatar.textContent = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();
      registerButton.hidden = user.roleName !== 'Admin';
    } catch {
      document.querySelector('.dashboard-header h1').textContent = document.documentElement.lang === 'es'
        ? 'No se pudo validar tu sesión.'
        : 'Could not validate your session.';
      registerButton.hidden = true;
    }
  }

  async function registerEmployee(event) {
    event.preventDefault();
    const feedback = registrationForm.querySelector('.auth-feedback');
    const submitButton = registrationForm.querySelector('button[type="submit"]');
    const isSpanish = document.documentElement.lang === 'es';
    feedback.hidden = true;
    submitButton.disabled = true;

    try {
      const response = await fetch(`${apiBaseUrl}/RegisterEmployee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          firstName: registrationForm.elements.namedItem('firstName').value.trim(),
          lastName: registrationForm.elements.namedItem('lastName').value.trim(),
          email: registrationForm.elements.namedItem('email').value.trim(),
          password: registrationForm.elements.namedItem('password').value,
          roleName: registrationForm.elements.namedItem('roleName').value
        })
      });

      if (response.status === 401 || response.status === 403) {
        leaveDashboard();
        return;
      }
      if (!response.ok) throw new Error(await readErrorMessage(response, isSpanish));

      feedback.textContent = isSpanish ? 'Cuenta de empleado creada.' : 'Employee account created.';
      feedback.dataset.state = 'success';
      feedback.hidden = false;
      registrationForm.reset();
    } catch (error) {
      feedback.textContent = error instanceof TypeError
        ? (isSpanish ? 'No se pudo conectar con el servidor.' : 'Could not reach the server.')
        : error.message;
      feedback.dataset.state = 'error';
      feedback.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  }

  async function readErrorMessage(response, isSpanish) {
    if (response.status >= 500) {
      return isSpanish ? 'El servidor no pudo crear la cuenta.' : 'The server could not create the account.';
    }
    const responseText = await response.text();
    try {
      const body = JSON.parse(responseText);
      return body.message || body.title || (typeof body === 'string' ? body : null)
        || (isSpanish ? 'No se pudo crear la cuenta. Revisa los datos.' : 'Could not create the account. Check the details.');
    } catch {
      return responseText || (isSpanish
        ? 'No se pudo crear la cuenta. Revisa los datos.'
        : 'Could not create the account. Check the details.');
    }
  }

  function translateRole(roleName, isSpanish) {
    if (!isSpanish) return roleName;
    return roleName === 'Admin' ? 'Administración' : roleName === 'Receptionist' ? 'Recepción' : roleName;
  }

  function leaveDashboard() {
    sessionStorage.removeItem(tokenKey);
    window.location.replace('employee-login.html');
  }
})();