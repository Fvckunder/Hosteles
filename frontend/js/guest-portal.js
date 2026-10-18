(() => {
  const apiBaseUrl = 'http://localhost:5159/api/GuestPortal';
  const tokenKey = 'hostel-access-token';
  const accessToken = sessionStorage.getItem(tokenKey);
  const upcomingList = document.querySelector('[data-upcoming-stays]');
  const pastList = document.querySelector('[data-past-stays]');
  const feedback = document.querySelector('[data-portal-feedback]');
  const feedbackText = document.querySelector('[data-portal-feedback-text]');
  const bookingForm = document.querySelector('[data-guest-booking-form]');
  const checkInInput = document.querySelector('[data-booking-check-in]');
  const checkOutInput = document.querySelector('[data-booking-check-out]');
  const roomInput = document.querySelector('[data-available-rooms]');
  const bedCountInput = document.querySelector('[data-booking-bed-count]');
  const bookingSubmit = document.querySelector('[data-booking-submit]');
  const availabilityNote = document.querySelector('[data-availability-note]');
  const isSpanish = document.documentElement.lang === 'es';
  let availableRooms = [];
  let availabilityRequestVersion = 0;

  if (!accessToken) {
    window.location.replace('login.html');
    return;
  }

  document.querySelector('[data-guest-signout]').addEventListener('click', () => {
    sessionStorage.removeItem(tokenKey);
    window.location.replace('login.html');
  });
  document.querySelector('[data-portal-retry]').addEventListener('click', loadPortal);
  initializeBookingForm();
  loadPortal();

  function initializeBookingForm() {
    const today = new Date();
    checkInInput.min = formatInputDate(today);
    checkInInput.value = formatInputDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    checkOutInput.min = formatInputDate(tomorrow);
    checkOutInput.value = formatInputDate(tomorrow);
    checkInInput.addEventListener('change', updateBookingDates);
    checkOutInput.addEventListener('change', loadAvailability);
    roomInput.addEventListener('change', updateBedCountLimit);
    bookingForm.addEventListener('submit', submitReservation);
    loadAvailability();
  }

  function updateBookingDates() {
    if (!checkInInput.value) {
      checkOutInput.value = '';
      checkOutInput.min = checkInInput.min;
      loadAvailability();
      return;
    }

    const nextDay = new Date(`${checkInInput.value}T00:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    checkOutInput.min = formatInputDate(nextDay);
    if (!checkOutInput.value || checkOutInput.value <= checkInInput.value) {
      checkOutInput.value = formatInputDate(nextDay);
    }
    loadAvailability();
  }

  async function loadAvailability() {
    const requestVersion = ++availabilityRequestVersion;
    availableRooms = [];
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = isSpanish ? 'Selecciona una habitación' : 'Select a room';
    roomInput.replaceChildren(emptyOption);
    bookingSubmit.disabled = true;
    if (!checkInInput.value || !checkOutInput.value || checkOutInput.value <= checkInInput.value) {
      availabilityNote.textContent = isSpanish
        ? 'La salida debe ser posterior a la entrada.'
        : 'Check-out must be after check-in.';
      return;
    }

    availabilityNote.textContent = isSpanish ? 'Consultando disponibilidad...' : 'Checking availability...';
    try {
      const query = new URLSearchParams({ checkIn: checkInInput.value, checkOut: checkOutInput.value });
      const response = await fetch(`${apiBaseUrl}/Availability?${query}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem(tokenKey);
        window.location.replace('login.html');
        return;
      }
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const rooms = await response.json();
      if (requestVersion !== availabilityRequestVersion) return;
      availableRooms = rooms;
      availableRooms.forEach((room) => {
        const option = document.createElement('option');
        option.value = room.roomId;
        option.textContent = `${isSpanish ? 'Habitación' : 'Room'} ${room.roomNumber} · ${room.roomTypeName} · ${room.availableBedCount} ${isSpanish ? 'camas libres' : 'beds available'}`;
        roomInput.append(option);
      });
      availabilityNote.textContent = availableRooms.length
        ? (isSpanish ? 'La solicitud queda pendiente de confirmación del personal.' : 'Your request will be pending staff confirmation.')
        : (isSpanish ? 'No hay habitaciones disponibles para esas fechas.' : 'No rooms are available for those dates.');
      updateBedCountLimit();
    } catch (error) {
      if (requestVersion !== availabilityRequestVersion) return;
      availabilityNote.textContent = error instanceof TypeError
        ? (isSpanish ? 'No se pudo conectar con el servidor.' : 'Could not reach the server.')
        : error.message;
    }
  }

  function updateBedCountLimit() {
    const selectedRoom = availableRooms.find((room) => String(room.roomId) === roomInput.value);
    bedCountInput.max = selectedRoom ? String(selectedRoom.availableBedCount) : '1';
    if (Number(bedCountInput.value) > Number(bedCountInput.max)) {
      bedCountInput.value = bedCountInput.max;
    }
    bookingSubmit.disabled = !selectedRoom;
  }

  async function submitReservation(event) {
    event.preventDefault();
    const selectedRoom = availableRooms.find((room) => String(room.roomId) === roomInput.value);
    if (!selectedRoom) return;
    const bedCount = Number(bedCountInput.value);
    if (!Number.isInteger(bedCount) || bedCount < 1 || bedCount > selectedRoom.availableBedCount) {
      showFeedback(isSpanish
        ? 'La cantidad de camas debe estar dentro de la disponibilidad de la habitación.'
        : 'The number of beds must be within the room availability.');
      return;
    }

    bookingSubmit.disabled = true;
    try {
      const response = await fetch(`${apiBaseUrl}/Reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          roomId: selectedRoom.roomId,
          bedCount,
          checkIn: checkInInput.value,
          checkOut: checkOutInput.value
        })
      });
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem(tokenKey);
        window.location.replace('login.html');
        return;
      }
      if (!response.ok) throw new Error(await readErrorMessage(response));
      await loadPortal();
      await loadAvailability();
      showFeedback(isSpanish
        ? 'Tu solicitud se envió correctamente y está pendiente de confirmación.'
        : 'Your request was sent and is pending confirmation.', 'success');
    } catch (error) {
      showFeedback(error instanceof TypeError
        ? (isSpanish ? 'No se pudo conectar con el servidor.' : 'Could not reach the server.')
        : error.message);
    } finally {
      updateBedCountLimit();
    }
  }

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

  function formatInputDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async function readErrorMessage(response) {
    const body = await response.text();
    if (!body) return isSpanish ? 'No se pudo completar la solicitud.' : 'Could not complete the request.';
    try {
      const parsed = JSON.parse(body);
      return parsed.message || parsed.title || body;
    } catch {
      return body;
    }
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