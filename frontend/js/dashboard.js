(() => {
  const apiUsersBaseUrl = 'http://localhost:5159/api/Users';
  const apiAuthBaseUrl = 'http://localhost:5159/api/Auth';
  const tokenKey = 'hostel-access-token';
  const accessToken = sessionStorage.getItem(tokenKey);
  const employeeDialog = document.querySelector('[data-employee-dialog]');
  const registrationForm = document.querySelector('[data-employee-registration]');
  const guestRegistrationForm = document.querySelector('[data-guest-registration]');
  const logoutLink = document.querySelector('.logout-link');
  const userViews = document.querySelectorAll('[data-user-view]');
  const moduleLinks = document.querySelectorAll('[data-user-module]');
  const users = [];

  if (!accessToken) {
    window.location.replace('employee-login.html');
    return;
  }

  document.querySelector('[data-close-employee-dialog]').addEventListener('click', () => employeeDialog.close());
  employeeDialog.addEventListener('close', () => {
    document.querySelectorAll('.dashboard-nav-link').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === 'employee-dashboard.html');
    });
  });
  logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    sessionStorage.removeItem(tokenKey);
    window.location.replace('employee-login.html');
  });

  moduleLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openManagementView(link.dataset.userModule);
    });
  });
  registrationForm.addEventListener('submit', (event) => createUser(event, registrationForm, 'team'));
  guestRegistrationForm.addEventListener('submit', (event) => createUser(event, guestRegistrationForm, 'guests'));
  document.querySelectorAll('[data-user-sort]').forEach((select) => {
    select.addEventListener('change', () => renderUsersTable(select.dataset.userSort));
  });

  initializeDashboard();

  async function initializeDashboard() {
    try {
      const response = await fetch(`${apiAuthBaseUrl}/Me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.status === 401 || response.status === 403) {
        leaveDashboard();
        return;
      }
      if (!response.ok) throw new Error(await readErrorMessage(response, isSpanish()));

      const user = await response.json();
      const fullName = `${user.firstName} ${user.lastName}`;
      document.querySelector('.dashboard-header h1').textContent = isSpanish()
        ? `Buenos días, ${user.firstName}.`
        : `Good morning, ${user.firstName}.`;
      document.querySelector('.profile-mini strong').textContent = fullName;
      document.querySelector('.profile-mini small').textContent = translateRole(user.roleName);
      document.querySelector('.profile-avatar').textContent =
        `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();

      const isAdministrator = user.roleName === 'Admin';
      moduleLinks.forEach((link) => {
        link.hidden = !isAdministrator;
      });
      if (isAdministrator) {
        const results = await Promise.allSettled([loadUsers(), loadGuestCountries()]);
        if (results[0].status === 'rejected') {
          showUserLoadError(results[0].reason);
        }
        if (results[1].status === 'rejected') {
          const feedback = guestRegistrationForm.querySelector('.auth-feedback');
          feedback.textContent = results[1].reason.message;
          feedback.dataset.state = 'error';
          feedback.hidden = false;
        }
      }
    } catch (error) {
      document.querySelector('.dashboard-header h1').textContent = isSpanish()
        ? 'No se pudo validar tu sesión.'
        : 'Could not validate your session.';
      moduleLinks.forEach((link) => {
        link.hidden = true;
      });
      console.error(error);
    }
  }

  async function openManagementView(viewName) {
    if (viewName !== 'team' && viewName !== 'guests') return;
    userViews.forEach((view) => {
      view.hidden = view.dataset.userView !== viewName;
    });
    document.querySelectorAll('.dashboard-nav-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.userModule === viewName);
    });
    employeeDialog.setAttribute('aria-labelledby', viewName === 'team'
      ? 'employee-register-title'
      : 'guest-management-title');
    employeeDialog.showModal();
    try {
      await loadUsers();
      renderUsersTable(viewName);
    } catch (error) {
      showUserLoadError(error);
    }
  }

  async function loadUsers() {
    const response = await fetch(apiUsersBaseUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (response.status === 401 || response.status === 403) {
      leaveDashboard();
      return;
    }
    if (!response.ok) throw new Error(await readErrorMessage(response, isSpanish()));

    users.splice(0, users.length, ...(await response.json()));
  }

  async function loadGuestCountries() {
    const countrySelect = guestRegistrationForm.elements.namedItem('countryId');
    const response = await fetch(`${apiAuthBaseUrl}/Countries`);
    if (!response.ok) throw new Error(await readErrorMessage(response, isSpanish()));

    const countries = await response.json();
    countrySelect.replaceChildren(new Option(
      isSpanish() ? 'Selecciona un país' : 'Select a country',
      ''
    ));
    countries.forEach((country) => {
      countrySelect.add(new Option(country.countryName, country.countryId));
    });
  }

  function renderUsersTable(viewName) {
    const roleNames = viewName === 'team' ? ['Admin', 'Receptionist'] : ['Guest'];
    const tableBody = document.querySelector(`[data-user-table-body="${viewName}"]`);
    const sortOrder = document.querySelector(`[data-user-sort="${viewName}"]`).value;
    const filteredUsers = users
      .filter((user) => roleNames.includes(user.roleName))
      .sort((leftUser, rightUser) => {
        const left = `${leftUser.firstName} ${leftUser.lastName}`.toLocaleLowerCase();
        const right = `${rightUser.firstName} ${rightUser.lastName}`.toLocaleLowerCase();
        return sortOrder === 'name-desc' ? right.localeCompare(left) : left.localeCompare(right);
      });

    tableBody.innerHTML = filteredUsers.map((user) => `
      <tr class="user-management-row">
        <td><strong>${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</strong></td>
        ${viewName === 'team' ? `<td>${escapeHtml(translateRole(user.roleName))}</td>` : ''}
        <td>${escapeHtml(user.email)}</td>
        <td>
          <button type="button" data-edit-user="${user.userId}">${isSpanish() ? 'Editar' : 'Edit'}</button>
          <button type="button" class="danger" data-delete-user="${user.userId}">${isSpanish() ? 'Eliminar' : 'Delete'}</button>
        </td>
      </tr>
    `).join('');

    tableBody.querySelectorAll('[data-edit-user]').forEach((button) => {
      button.addEventListener('click', () => editUser(Number(button.dataset.editUser)));
    });
    tableBody.querySelectorAll('[data-delete-user]').forEach((button) => {
      button.addEventListener('click', () => deleteUser(Number(button.dataset.deleteUser)));
    });
  }

  function showUserLoadError(error) {
    document.querySelectorAll('[data-user-table-body]').forEach((tableBody) => {
      tableBody.innerHTML = `<tr><td colspan="4">${escapeHtml(error.message || (isSpanish()
        ? 'No se pudieron cargar las cuentas.'
        : 'Could not load the accounts.'))}</td></tr>`;
    });
  }

  async function createUser(event, form, viewName) {
    event.preventDefault();
    const feedback = form.querySelector('.auth-feedback');
    const submitButton = form.querySelector('button[type="submit"]');
    feedback.hidden = true;
    submitButton.disabled = true;

    const userPayload = {
      firstName: form.elements.namedItem('firstName').value.trim(),
      lastName: form.elements.namedItem('lastName').value.trim(),
      email: form.elements.namedItem('email').value.trim(),
      password: form.elements.namedItem('password').value,
      roleName: viewName === 'team' ? form.elements.namedItem('roleName').value : 'Guest'
    };

    if (viewName === 'guests') {
      const documentNumber = form.elements.namedItem('documentNumber').value.trim();
      const documentType = form.elements.namedItem('documentType').value;
      userPayload.countryId = Number(form.elements.namedItem('countryId').value);
      userPayload.dni = documentType === 'dni' ? documentNumber : null;
      userPayload.passport = documentType === 'passport' ? documentNumber : null;
      userPayload.phone = form.elements.namedItem('phone').value.trim() || null;
    }

    try {
      const response = await fetch(apiUsersBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(userPayload)
      });
      if (response.status === 401 || response.status === 403) {
        leaveDashboard();
        return;
      }
      if (!response.ok) throw new Error(await readErrorMessage(response, isSpanish()));

      form.reset();
      feedback.textContent = isSpanish() ? 'Cuenta creada.' : 'Account created.';
      feedback.dataset.state = 'success';
      feedback.hidden = false;
      await loadUsers();
      renderUsersTable(viewName);
    } catch (error) {
      feedback.textContent = error instanceof TypeError
        ? (isSpanish() ? 'No se pudo conectar con el servidor.' : 'Could not reach the server.')
        : error.message;
      feedback.dataset.state = 'error';
      feedback.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  }

  async function editUser(userId) {
    try {
      const response = await fetch(`${apiUsersBaseUrl}/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.status === 401 || response.status === 403) {
        leaveDashboard();
        return;
      }
      if (!response.ok) throw new Error(await readErrorMessage(response, isSpanish()));

      const user = await response.json();
      const firstName = window.prompt(isSpanish() ? 'Nombre' : 'First name', user.firstName);
      if (firstName === null) return;
      const lastName = window.prompt(isSpanish() ? 'Apellido' : 'Last name', user.lastName);
      if (lastName === null) return;
      const email = window.prompt(isSpanish() ? 'Correo electrónico' : 'Email', user.email);
      if (email === null) return;
      const password = window.prompt(
        isSpanish() ? 'Nueva contraseña (vacío para conservar la actual)' : 'New password (leave empty to keep current password)',
        ''
      );
      if (password === null) return;
      const roleName = user.roleName === 'Guest'
        ? 'Guest'
        : window.prompt(isSpanish() ? 'Rol (Admin o Receptionist)' : 'Role (Admin or Receptionist)', user.roleName);
      if (roleName === null) return;

      const updateResponse = await fetch(`${apiUsersBaseUrl}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          roleName,
          password: password.trim() || null,
          active: true
        })
      });
      if (updateResponse.status === 401 || updateResponse.status === 403) {
        leaveDashboard();
        return;
      }
      if (!updateResponse.ok) throw new Error(await readErrorMessage(updateResponse, isSpanish()));

      await loadUsers();
      renderUsersTable(user.roleName === 'Guest' ? 'guests' : 'team');
    } catch (error) {
      window.alert(error.message || (isSpanish() ? 'No se pudo actualizar el usuario.' : 'Could not update the user.'));
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm(isSpanish() ? '¿Eliminar esta cuenta?' : 'Delete this account?')) return;

    try {
      const response = await fetch(`${apiUsersBaseUrl}/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.status === 401 || response.status === 403) {
        leaveDashboard();
        return;
      }
      if (!response.ok) throw new Error(await readErrorMessage(response, isSpanish()));

      await loadUsers();
      const activeView = Array.from(userViews).find((view) => !view.hidden);
      if (activeView) renderUsersTable(activeView.dataset.userView);
    } catch (error) {
      window.alert(error.message || (isSpanish() ? 'No se pudo eliminar el usuario.' : 'Could not delete the user.'));
    }
  }

  async function readErrorMessage(response, spanish) {
    const responseText = await response.text();
    try {
      const body = JSON.parse(responseText);
      return body.message || body.title || (typeof body === 'string' ? body : null)
        || (spanish ? 'No se pudo completar la operación.' : 'Could not complete the request.');
    } catch {
      return responseText || (spanish ? 'No se pudo completar la operación.' : 'Could not complete the request.');
    }
  }

  function translateRole(roleName) {
    if (!isSpanish()) return roleName;
    return roleName === 'Admin' ? 'Administración'
      : roleName === 'Receptionist' ? 'Empleado'
        : roleName === 'Guest' ? 'Huésped' : roleName;
  }

  function isSpanish() {
    return document.documentElement.lang === 'es';
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function leaveDashboard() {
    sessionStorage.removeItem(tokenKey);
    window.location.replace('employee-login.html');
  }
})();
