(() => {
  const apiBaseUrl = 'http://localhost:5159/api/GuestPortal';
  const tokenKey = 'hostel-access-token';
  const accessToken = sessionStorage.getItem(tokenKey);
  const upcomingList = document.querySelector('[data-upcoming-stays]');
  const pastList = document.querySelector('[data-past-stays]');
  const feedback = document.querySelector('[data-portal-feedback]');
  const feedbackText = document.querySelector('[data-portal-feedback-text]');
  const isSpanish = document.documentElement.lang === 'es';

  if (!accessToken) {
    window.location.replace('login.html');
    return;
  }

  document.querySelector('[data-guest-signout]').addEventListener('click', () => {
    sessionStorage.removeItem(tokenKey);
    window.location.replace('login.html');
  });
  document.querySelector('[data-portal-retry]').addEventListener('click', loadPortal);
  loadPortal();

  async function loadPortal() {
    hideFeedback();
    setLoading();

    try {
      const response = await fetch(apiBaseUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem(tokenKey);
        window.location.replace('login.html');
        return;
      }
      if (!response.ok) {
        throw new Error(isSpanish
          ? 'No se pudo cargar la información de tu cuenta.'
          : 'Could not load your account information.');
      }

      const portal = await response.json();
      document.querySelector('[data-guest-first-name]').textContent = portal.firstName;
      document.querySelector('[data-guest-country]').textContent = portal.countryName;
      document.querySelector('[data-guest-email]').textContent = portal.email;
      document.querySelector('[data-guest-phone]').textContent = portal.phone || (isSpanish ? 'Sin teléfono' : 'No phone provided');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = [];
      const past = [];
      portal.reservations.forEach((reservation) => {
        const checkoutDate = new Date(`${reservation.checkOut}T00:00:00`);
        if (reservation.status !== 'Cancelled'
          && reservation.status !== 'Completed'
          && checkoutDate >= today) {
          upcoming.push(reservation);
        } else {
          past.push(reservation);
        }
      });

      renderList(upcomingList, upcoming, true);
      renderList(pastList, past, false);
    } catch (error) {
      renderEmpty(upcomingList, isSpanish ? 'No se pudieron cargar tus estancias.' : 'Could not load your stays.');
      renderEmpty(pastList, isSpanish ? 'No se pudo cargar tu historial.' : 'Could not load your history.');
      showFeedback(error instanceof TypeError
        ? (isSpanish
          ? 'No se pudo conectar con el servidor. Comprueba que la API esté en ejecución.'
          : 'Could not reach the server. Check that the API is running.')
        : error.message);
    }
  }

  function renderList(container, reservations, allowCancellation) {
    if (reservations.length === 0) {
      renderEmpty(container, allowCancellation
        ? (isSpanish ? 'Todavía no tienes estancias próximas.' : 'You have no upcoming stays yet.')
        : (isSpanish ? 'Tu historial de estancias aparecerá aquí.' : 'Your stay history will appear here.'));
      return;
    }

    const fragment = document.createDocumentFragment();
    reservations.forEach((reservation) => fragment.append(createReservation(reservation, allowCancellation)));
    container.replaceChildren(fragment);
  }

  function createReservation(reservation, allowCancellation) {
    const article = document.createElement('article');
    article.className = 'guest-stay';

    const heading = document.createElement('div');
    heading.className = 'guest-stay-heading';
    const title = document.createElement('h3');
    title.textContent = isSpanish ? `Reserva #${reservation.reservationId}` : `Reservation #${reservation.reservationId}`;
    const status = document.createElement('span');
    status.className = `guest-stay-status status-${reservation.status.toLowerCase()}`;
    status.textContent = translateStatus(reservation.status);
    heading.append(title, status);

    const details = document.createElement('div');
    details.className = 'guest-stay-details';
    details.append(
      createDetail(isSpanish ? 'Entrada' : 'Check-in', formatDate(reservation.checkIn)),
      createDetail(isSpanish ? 'Salida' : 'Check-out', formatDate(reservation.checkOut)),
      createDetail(isSpanish ? 'Noches' : 'Nights', String(reservation.nights)),
      createDetail(isSpanish ? 'Camas' : 'Beds', String(reservation.bedCount))
    );

    const roomText = reservation.roomNumbers.length
      ? reservation.roomNumbers.join(', ')
      : (isSpanish ? 'Alojamiento pendiente de asignación' : 'Accommodation assignment pending');
    const roomLine = document.createElement('p');
    roomLine.className = 'guest-stay-rooms';
    roomLine.textContent = `${isSpanish ? 'Habitación' : 'Room'}: ${roomText}`;

    article.append(heading, details, roomLine);

    if (allowCancellation && canCancel(reservation)) {
      const cancelButton = document.createElement('button');
      cancelButton.className = 'guest-cancel-button';
      cancelButton.type = 'button';
      cancelButton.textContent = isSpanish ? 'Cancelar reserva' : 'Cancel reservation';
      cancelButton.addEventListener('click', () => cancelReservation(reservation.ReservationId ?? reservation.reservationId, cancelButton));
      article.append(cancelButton);
    }

    return article;
  }

  async function cancelReservation(reservationId, button) {
    const confirmation = isSpanish
      ? '¿Quieres cancelar esta reserva? Esta acción no se puede deshacer.'
      : 'Cancel this reservation? This action cannot be undone.';
    if (!window.confirm(confirmation)) return;

    button.disabled = true;
    try {
      const response = await fetch(`${apiBaseUrl}/Reservations/${reservationId}/Cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem(tokenKey);
        window.location.replace('login.html');
        return;
      }
      if (!response.ok) {
        throw new Error(isSpanish
          ? 'No se pudo cancelar la reserva.'
          : 'Could not cancel the reservation.');
      }

      await loadPortal();
      showFeedback(isSpanish ? 'Reserva cancelada.' : 'Reservation cancelled.', 'success');
    } catch (error) {
      showFeedback(error instanceof TypeError
        ? (isSpanish ? 'No se pudo conectar con el servidor.' : 'Could not reach the server.')
        : error.message);
      button.disabled = false;
    }
  }

  function canCancel(reservation) {
    const checkIn = new Date(`${reservation.checkIn}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return ['Pending', 'Confirmed'].includes(reservation.status) && checkIn > today;
  }

  function createDetail(label, value) {
    const detail = document.createElement('div');
    detail.className = 'guest-stay-detail';
    const labelElement = document.createElement('span');
    labelElement.textContent = label;
    const valueElement = document.createElement('strong');
    valueElement.textContent = value;
    detail.append(labelElement, valueElement);
    return detail;
  }

  function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat(isSpanish ? 'es-AR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  function translateStatus(status) {
    if (!isSpanish) return status;
    return ({ Pending: 'Pendiente', Confirmed: 'Confirmada', Cancelled: 'Cancelada', Completed: 'Completada' })[status] || status;
  }

  function renderEmpty(container, message) {
    const empty = document.createElement('p');
    empty.className = 'guest-portal-empty';
    empty.textContent = message;
    container.replaceChildren(empty);
  }

  function setLoading() {
    upcomingList.innerHTML = `<p class="guest-portal-loading">${isSpanish ? 'Cargando tus estancias...' : 'Loading your stays...'}</p>`;
    pastList.innerHTML = `<p class="guest-portal-loading">${isSpanish ? 'Cargando tu historial...' : 'Loading your history...'}</p>`;
  }

  function showFeedback(message, state = 'error') {
    feedbackText.textContent = message;
    feedback.dataset.state = state;
    feedback.hidden = false;
  }

  function hideFeedback() {
    feedback.hidden = true;
  }
})();