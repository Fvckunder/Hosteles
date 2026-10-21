(() => {
  // Mantener esta URL alineada con el perfil HTTP de APIHostel/Properties/launchSettings.json.
  const apiBaseUrl = 'http://localhost:5159/api/Auth';

  initializeInitialAdministrator();

  document.querySelectorAll('form[data-auth-role]').forEach((form) => {
    const feedback = form.querySelector('.auth-feedback');
    const submitButton = form.querySelector('button[type="submit"]');
    const resetLink = document.querySelector('[data-reset-password]');
    const resetDialog = resetLink ? createPasswordResetDialog() : null;

    if (resetLink && resetDialog) {
      resetLink.addEventListener('click', (event) => {
        event.preventDefault();
        resetDialog.querySelector('#password-reset-email').value = form.elements.namedItem('email').value.trim();
        resetDialog.querySelectorAll('[data-reset-step]').forEach((step) => {
          step.hidden = step.dataset.resetStep !== 'email';
        });
        resetDialog.querySelectorAll('[data-reset-feedback]').forEach((message) => {
          message.hidden = true;
          message.textContent = '';
        });
        resetDialog.showModal();
        resetDialog.querySelector('#password-reset-email').focus();
      });
    }

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
        const response = await fetch(`${apiBaseUrl}/Login`, {
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

        if (typeof result === 'string') {
          result = { message: result };
        }

        if (!response.ok) {
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
        // Comprueba que el tipo de cuenta coincida con el formulario; esto es una validación de interfaz, no una autorización del servidor.
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

    if (resetDialog) {
      resetDialog.querySelectorAll('form[data-reset-step]').forEach((resetForm) => {
        resetForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const isSpanish = document.documentElement.lang === 'es';
          const step = resetForm.dataset.resetStep;
          const message = resetForm.querySelector('[data-reset-feedback]');
          const button = resetForm.querySelector('button[type="submit"]');
          const email = resetDialog.querySelector('#password-reset-email').value.trim();
          message.hidden = true;
          button.disabled = true;

          try {
            if (step === 'email') {
              const response = await fetch(`${apiBaseUrl}/PasswordReset/CheckEmail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              });
              await readResponse(response, isSpanish);
              showResetStep('code');
            } else if (step === 'code') {
              const code = resetForm.elements.namedItem('code').value.trim();
              if (!/^\d{4}$/.test(code)) {
                throw new Error(isSpanish ? 'El código debe tener 4 dígitos.' : 'The code must contain 4 digits.');
              }
              showResetStep('password');
            } else {
              const newPassword = resetForm.elements.namedItem('newPassword').value;
              const confirmPassword = resetForm.elements.namedItem('confirmPassword').value;
              if (newPassword !== confirmPassword) {
                throw new Error(isSpanish ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
              }

              const response = await fetch(`${apiBaseUrl}/PasswordReset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email,
                  code: resetDialog.querySelector('[name="code"]').value.trim(),
                  newPassword
                })
              });
              await readResponse(response, isSpanish);
              showResetStep('success');
            }
          } catch (error) {
            const errorMessage = error instanceof TypeError
              ? (isSpanish
                ? 'No se pudo conectar con el servidor. Comprueba que la API esté en ejecución.'
                : 'Could not reach the server. Check that the API is running.')
              : error.message;
            message.textContent = errorMessage || (isSpanish
              ? 'No se pudo restablecer la contraseña.'
              : 'Could not reset the password.');
            message.dataset.state = 'error';
            message.hidden = false;
          } finally {
            button.disabled = false;
          }
        });
      });

      resetDialog.querySelector('[data-reset-close]').addEventListener('click', () => resetDialog.close());
      resetDialog.querySelector('[data-reset-success-close]').addEventListener('click', () => resetDialog.close());

      const updateResetLanguage = (language) => {
        const spanish = language === 'es';
        const copy = spanish
          ? {
            title: 'Restablecer contraseña',
            close: 'Cerrar',
            emailLabel: 'Correo electrónico',
            emailPlaceholder: 'tu@correo.com',
            emailSubmit: 'Continuar',
            codeInstruction: 'Ingresa el codigo que te mandamos a tu mail',
            codeLabel: 'Código de 4 dígitos',
            codePlaceholder: '1234',
            codeSubmit: 'Verificar código',
            passwordLabel: 'Nueva contraseña',
            passwordPlaceholder: 'Mínimo 8 caracteres',
            confirmLabel: 'Confirma la nueva contraseña',
            confirmPlaceholder: 'Repite la contraseña',
            passwordSubmit: 'Cambiar contraseña',
            success: 'Tu contraseña se actualizó correctamente.',
            successClose: 'Cerrar'
          }
          : {
            title: 'Reset password',
            close: 'Close',
            emailLabel: 'Email address',
            emailPlaceholder: 'you@example.com',
            emailSubmit: 'Continue',
            codeInstruction: 'Enter the code we sent to your email',
            codeLabel: '4-digit code',
            codePlaceholder: '1234',
            codeSubmit: 'Verify code',
            passwordLabel: 'New password',
            passwordPlaceholder: 'At least 8 characters',
            confirmLabel: 'Confirm new password',
            confirmPlaceholder: 'Repeat your password',
            passwordSubmit: 'Change password',
            success: 'Your password was updated successfully.',
            successClose: 'Close'
          };

        resetDialog.querySelector('[data-reset-title]').textContent = copy.title;
        resetDialog.querySelector('[data-reset-close]').setAttribute('aria-label', copy.close);
        resetDialog.querySelector('[data-reset-email-label]').textContent = copy.emailLabel;
        resetDialog.querySelector('#password-reset-email').placeholder = copy.emailPlaceholder;
        resetDialog.querySelector('[data-reset-email-submit]').textContent = copy.emailSubmit;
        resetDialog.querySelector('[data-reset-code-instruction]').textContent = copy.codeInstruction;
        resetDialog.querySelector('[data-reset-code-label]').textContent = copy.codeLabel;
        resetDialog.querySelector('#password-reset-code').placeholder = copy.codePlaceholder;
        resetDialog.querySelector('[data-reset-code-submit]').textContent = copy.codeSubmit;
        resetDialog.querySelector('[data-reset-password-label]').textContent = copy.passwordLabel;
        resetDialog.querySelector('#password-reset-new-password').placeholder = copy.passwordPlaceholder;
        resetDialog.querySelector('[data-reset-confirm-label]').textContent = copy.confirmLabel;
        resetDialog.querySelector('#password-reset-confirm-password').placeholder = copy.confirmPlaceholder;
        resetDialog.querySelector('[data-reset-password-submit]').textContent = copy.passwordSubmit;
        resetDialog.querySelector('[data-reset-success]').textContent = copy.success;
        resetDialog.querySelector('[data-reset-success-close]').textContent = copy.successClose;
      };

      function showResetStep(stepName) {
        resetDialog.querySelectorAll('[data-reset-step]').forEach((step) => {
          step.hidden = step.dataset.resetStep !== stepName;
        });
        if (stepName === 'code') {
          resetDialog.querySelector('#password-reset-code').focus();
        } else if (stepName === 'password') {
          resetDialog.querySelector('#password-reset-new-password').focus();
        } else if (stepName === 'success') {
          resetDialog.querySelector('[data-reset-success-close]').focus();
        }
      }

      updateResetLanguage(localStorage.getItem('hostel-language') || document.documentElement.lang);
      window.addEventListener('hostel-language-change', () => {
        updateResetLanguage(document.documentElement.lang);
      });
    }
  });

  function initializeInitialAdministrator() {
    const button = document.querySelector('[data-open-initial-admin]');
    const dialog = document.querySelector('[data-initial-admin-dialog]');
    const form = document.querySelector('[data-initial-admin-registration]');
    const status = document.querySelector('[data-admin-status]');
    if (!button || !dialog || !form || !status) return;

    let requestSequence = 0;
    let administratorExists = true;
    const isSpanish = () => document.documentElement.lang === 'es';

    button.addEventListener('click', () => {
      if (administratorExists) {
        refreshAdministratorStatus();
        return;
      }
      dialog.showModal();
    });
    dialog.querySelector('[data-close-initial-admin]').addEventListener('click', () => dialog.close());
    form.addEventListener('submit', registerInitialAdministrator);
    window.addEventListener('focus', refreshAdministratorStatus);
    refreshAdministratorStatus();

    async function refreshAdministratorStatus() {
      const currentRequest = ++requestSequence;
      try {
        const response = await fetch(`${apiBaseUrl}/HasAdministrator`);
        if (!response.ok) throw new Error(await readInitialAdminError(response));
        const result = await response.json();
        if (typeof result.exists !== 'boolean') throw new Error('Invalid administrator status response.');
        if (currentRequest !== requestSequence) return;

        administratorExists = result.exists;
        button.hidden = administratorExists;
        status.hidden = true;
        status.textContent = '';
      } catch (error) {
        if (currentRequest !== requestSequence) return;
        button.hidden = true;
        status.textContent = error instanceof TypeError
          ? (isSpanish()
            ? 'No se pudo verificar si existe una cuenta administradora. Comprueba que la API esté en ejecución.'
            : 'Could not verify whether an administrator account exists. Check that the API is running.')
          : error.message;
        status.dataset.state = 'error';
        status.hidden = false;
      }
    }

    async function registerInitialAdministrator(event) {
      event.preventDefault();
      const feedback = form.querySelector('.auth-feedback');
      const submitButton = form.querySelector('button[type="submit"]');
      const spanish = isSpanish();
      feedback.hidden = true;
      submitButton.disabled = true;

      try {
        const response = await fetch(`${apiBaseUrl}/RegisterInitialAdministrator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.elements.namedItem('firstName').value.trim(),
            lastName: form.elements.namedItem('lastName').value.trim(),
            email: form.elements.namedItem('email').value.trim(),
            password: form.elements.namedItem('password').value
          })
        });
        if (!response.ok) throw new Error(await readInitialAdminError(response));

        requestSequence++;
        administratorExists = true;
        button.hidden = true;
        form.reset();
        dialog.close();
        status.textContent = spanish
          ? 'Cuenta administradora creada. Ya puedes iniciar sesión.'
          : 'Administrator account created. You can now sign in.';
        status.dataset.state = 'success';
        status.hidden = false;
      } catch (error) {
        feedback.textContent = error instanceof TypeError
          ? (spanish ? 'No se pudo conectar con el servidor.' : 'Could not reach the server.')
          : error.message;
        feedback.dataset.state = 'error';
        feedback.hidden = false;
        await refreshAdministratorStatus();
      } finally {
        submitButton.disabled = false;
      }
    }

    async function readInitialAdminError(response) {
      const responseText = await response.text();
      try {
        const body = JSON.parse(responseText);
        return body.message || body.title || (typeof body === 'string' ? body : null)
          || (isSpanish() ? 'No se pudo completar el alta.' : 'Could not create the account.');
      } catch {
        return responseText || (isSpanish() ? 'No se pudo completar el alta.' : 'Could not create the account.');
      }
    }
  }

  function createPasswordResetDialog() {
    const dialog = document.createElement('dialog');
    dialog.className = 'password-reset-dialog';
    dialog.setAttribute('aria-labelledby', 'password-reset-title');
    dialog.innerHTML = `
      <button class="dialog-close" type="button" data-reset-close aria-label="Close">&times;</button>
      <h2 id="password-reset-title" data-reset-title>Reset password</h2>
      <form data-reset-step="email">
        <label for="password-reset-email" data-reset-email-label>Email address</label>
        <input id="password-reset-email" name="email" type="email" autocomplete="email" required>
        <p class="auth-feedback" data-reset-feedback role="status" aria-live="polite" hidden></p>
        <button class="button button-primary password-reset-submit" type="submit" data-reset-email-submit>Continue</button>
      </form>
      <form data-reset-step="code" hidden>
        <p class="password-reset-instruction" data-reset-code-instruction>Enter the code we sent to your email</p>
        <label for="password-reset-code" data-reset-code-label>4-digit code</label>
        <input id="password-reset-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{4}" maxlength="4" required>
        <p class="auth-feedback" data-reset-feedback role="status" aria-live="polite" hidden></p>
        <button class="button button-primary password-reset-submit" type="submit" data-reset-code-submit>Verify code</button>
      </form>
      <form data-reset-step="password" hidden>
        <label for="password-reset-new-password" data-reset-password-label>New password</label>
        <input id="password-reset-new-password" name="newPassword" type="password" autocomplete="new-password" minlength="8" maxlength="100" required>
        <label for="password-reset-confirm-password" data-reset-confirm-label>Confirm new password</label>
        <input id="password-reset-confirm-password" name="confirmPassword" type="password" autocomplete="new-password" minlength="8" maxlength="100" required>
        <p class="auth-feedback" data-reset-feedback role="status" aria-live="polite" hidden></p>
        <button class="button button-primary password-reset-submit" type="submit" data-reset-password-submit>Change password</button>
      </form>
      <section data-reset-step="success" hidden>
        <p data-reset-success>Your password was updated successfully.</p>
        <button class="button button-primary password-reset-submit" type="button" data-reset-success-close>Close</button>
      </section>`;
    document.body.append(dialog);
    return dialog;
  }

  async function readResponse(response, isSpanish) {
    const responseText = await response.text();
    let result = {};

    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = { message: responseText };
    }

    if (!response.ok) {
      const message = response.status >= 500
        ? (isSpanish
          ? 'El servidor no pudo completar la operación. Comprueba la conexión con la base de datos.'
          : 'The server could not complete the request. Check the database connection.')
        : (result.message || result.title || (isSpanish
          ? 'No se pudo restablecer la contraseña.'
          : 'Could not reset the password.'));
      throw new Error(message);
    }
  }
})();