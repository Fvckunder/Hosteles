(() => {
  const apiBaseUrl = 'http://localhost:5159/api';
  const tokenKey = 'hostel-access-token';
  const token = sessionStorage.getItem(tokenKey);
  const list = document.querySelector('[data-request-list]');
  const feedback = document.querySelector('[data-request-feedback]');

  if (!token) {
    window.location.replace('employee-login.html');
    return;
  }

  document.querySelector('.logout-link').addEventListener('click', (event) => {
    event.preventDefault();
    leaveDashboard();
  });
  initialize();

  async function initialize() {
    try {
      const user = await request(`${apiBaseUrl}/Auth/Me`);
      if (!['Admin', 'Receptionist'].includes(user.roleName)) {
        leaveDashboard();
        return;
      }
      document.querySelector('[data-employee-name]').textContent = `${user.firstName} ${user.lastName}`;
      document.querySelector('[data-employee-role]').textContent = user.roleName === 'Admin'
        ? (isSpanish() ? 'Administración' : 'Administrator')
        : (isSpanish() ? 'Recepción' : 'Receptionist');
      document.querySelector('[data-employee-avatar]').textContent =
        `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();
      await loadRequests();
    } catch (error) {
      renderError(error.message);
    }
  }

  async function loadRequests() {
    hideFeedback();
    list.replaceChildren(message(isSpanish() ? 'Cargando solicitudes...' : 'Loading requests...', 'guest-portal-loading'));
    try {
      const requests = await request(`${apiBaseUrl}/Reservations`);
      document.querySelector('[data-request-count]').textContent = isSpanish()
        ? `${requests.length} pendientes`
        : `${requests.length} pending`;
      if (requests.length === 0) {
        list.replaceChildren(message(isSpanish()
          ? 'No hay solicitudes pendientes para revisar.'
          : 'There are no pending requests to review.', 'guest-portal-empty'));
        return;
      }
      list.replaceChildren(...requests.map(createRequestCard));
    } catch (error) {
      renderError(error.message);
    }
  }

  function createRequestCard(reservation) {
    const article = document.createElement('article');
    article.className = 'reservation-request-card module-panel';
    const header = document.createElement('div');
    header.className = 'reservation-request-heading';
    const title = document.createElement('h3');
    title.textContent = `${isSpanish() ? 'Solicitud' : 'Request'} #${reservation.reservationId} · ${reservation.guestName}`;
    const status = document.createElement('span');
    status.className = 'guest-stay-status status-pending';
    status.textContent = isSpanish() ? 'Pendiente' : reservation.status;
    header.append(title, status);

    const guest = document.createElement('p');
    guest.className = 'reservation-request-email';
    guest.textContent = reservation.guestEmail;

    const details = document.createElement('div');
    details.className = 'guest-stay-details';
    details.append(
      detail(isSpanish() ? 'Entrada' : 'Check-in', formatDate(reservation.checkIn)),
      detail(isSpanish() ? 'Salida' : 'Check-out', formatDate(reservation.checkOut)),
      detail(isSpanish() ? 'Camas' : 'Beds', String(reservation.bedCount)),
      detail(isSpanish() ? 'Habitación' : 'Room', reservation.roomNumbers.join(', ')),
      detail(isSpanish() ? 'Total estimado' : 'Estimated total', formatPrice(reservation.total))
    );

    const actions = document.createElement('div');
    actions.className = 'reservation-request-actions';
    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = 'button button-primary';
    confirm.textContent = isSpanish() ? 'Confirmar' : 'Confirm';
    confirm.addEventListener('click', () => decide(reservation.reservationId, 'Confirmed', confirm, reject));
    const reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'module-delete-button';
    reject.textContent = isSpanish() ? 'Rechazar' : 'Reject';
    reject.addEventListener('click', () => decide(reservation.reservationId, 'Cancelled', confirm, reject));
    actions.append(confirm, reject);
    article.append(header, guest, details, actions);
    return article;
  }

  function detail(label, value) {
    const item = document.createElement('div');
    item.className = 'guest-stay-detail';
    const caption = document.createElement('span');
    caption.textContent = label;
    const content = document.createElement('strong');
    content.textContent = value || '—';
    item.append(caption, content);
    return item;
  }

  async function decide(reservationId, decision, confirmButton, rejectButton) {
    if (decision === 'Cancelled' && !window.confirm(isSpanish()
      ? '¿Rechazar esta solicitud?'
      : 'Reject this reservation request?')) return;

    confirmButton.disabled = true;
    rejectButton.disabled = true;
    try {
      await request(`${apiBaseUrl}/Reservations/${reservationId}/Decision`, {
        method: 'POST',
        body: JSON.stringify({ decision })
      });
      await loadRequests();
      showFeedback(decision === 'Confirmed'
        ? (isSpanish() ? 'Reserva confirmada.' : 'Reservation confirmed.')
        : (isSpanish() ? 'Solicitud rechazada.' : 'Request rejected.'), 'success');
    } catch (error) {
      showFeedback(error.message);
      confirmButton.disabled = false;
      rejectButton.disabled = false;
    }
  }

  async function request(url, options = {}) {
    const headers = { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401 || response.status === 403) {
      leaveDashboard();
      throw new Error('Unauthorized');
    }
    const body = await response.text();
    if (!response.ok) throw new Error(readError(body) || (isSpanish()
      ? 'No se pudo completar la operación.'
      : 'Could not complete the operation.'));
    return body ? JSON.parse(body) : null;
  }

  function renderError(error) {
    list.replaceChildren(message(error, 'guest-portal-empty'));
  }

  function message(text, className) {
    const element = document.createElement('p');
    element.className = className;
    element.textContent = text;
    return element;
  }

  function readError(body) {
    if (!body) return '';
    try {
      const parsed = JSON.parse(body);
      return parsed.message || parsed.title || body;
    } catch {
      return body;
    }
  }

  function showFeedback(text, state = 'error') {
    feedback.textContent = text;
    feedback.dataset.state = state;
    feedback.hidden = false;
  }

  function hideFeedback() {
    feedback.hidden = true;
  }

  function formatDate(value) {
    return new Intl.DateTimeFormat(isSpanish() ? 'es-AR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(`${value}T00:00:00`));
  }

  function formatPrice(value) {
    if (value == null) return '—';
    return new Intl.NumberFormat(isSpanish() ? 'es-AR' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  function isSpanish() {
    return document.documentElement.lang === 'es';
  }

  function leaveDashboard() {
    sessionStorage.removeItem(tokenKey);
    window.location.replace('employee-login.html');
  }
})();
