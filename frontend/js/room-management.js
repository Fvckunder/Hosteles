(() => {
  const apiBaseUrl = 'http://localhost:5159/api';
  const tokenKey = 'hostel-access-token';
  const token = sessionStorage.getItem(tokenKey);
  const form = document.querySelector('[data-room-form]');
  const roomSelect = form.elements.namedItem('roomId');
  const roomList = document.querySelector('[data-room-list]');
  const feedback = document.querySelector('[data-room-feedback]');
  const submitButton = form.querySelector('[data-room-submit]');
  const deleteButton = form.querySelector('[data-room-delete]');
  let rooms = [];
  let catalog = { roomTypes: [], amenities: [] };

  if (!token) {
    window.location.replace('employee-login.html');
    return;
  }

  document.querySelector('.logout-link').addEventListener('click', (event) => {
    event.preventDefault();
    leaveDashboard();
  });
  roomSelect.addEventListener('change', selectRoom);
  form.addEventListener('submit', saveRoom);
  deleteButton.addEventListener('click', deactivateRoom);
  form.querySelector('[data-room-reset]').addEventListener('click', resetForm);
  initialize();

  async function initialize() {
    try {
      const user = await request(`${apiBaseUrl}/Auth/Me`);
      if (!['Admin', 'Receptionist'].includes(user.roleName)) {
        leaveDashboard();
        return;
      }
      const fullName = `${user.firstName} ${user.lastName}`;
      document.querySelector('[data-employee-name]').textContent = fullName;
      document.querySelector('[data-employee-role]').textContent = translateRole(user.roleName);
      document.querySelector('[data-employee-avatar]').textContent =
        `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();
      await loadRoomsAndCatalog();
    } catch (error) {
      showFeedback(error.message);
      roomList.innerHTML = `<tr><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
    }
  }

  async function loadRoomsAndCatalog() {
    [rooms, catalog] = await Promise.all([
      request(`${apiBaseUrl}/Rooms`),
      request(`${apiBaseUrl}/Rooms/Lookups`)
    ]);
    renderLookups();
    renderRooms();
    resetForm();
  }

  function renderLookups() {
    const typeSelect = form.elements.namedItem('roomTypeId');
    typeSelect.replaceChildren();
    catalog.roomTypes.forEach((type) => {
      const option = document.createElement('option');
      option.value = type.roomTypeId;
      option.textContent = type.typeName;
      typeSelect.append(option);
    });

    const amenitiesSelect = form.elements.namedItem('amenityIds');
    amenitiesSelect.replaceChildren();
    catalog.amenities.forEach((amenity) => {
      const option = document.createElement('option');
      option.value = amenity.amenityId;
      option.textContent = amenity.amenityName;
      amenitiesSelect.append(option);
    });
  }

  function renderRooms() {
    const isSpanish = document.documentElement.lang === 'es';
    document.querySelector('[data-room-count]').textContent = isSpanish
      ? `${rooms.length} ${rooms.length === 1 ? 'habitación' : 'habitaciones'}`
      : `${rooms.length} rooms`;
    roomSelect.replaceChildren(new Option(isSpanish ? 'Crear habitación nueva' : 'Create a new room', ''));
    if (rooms.length === 0) {
      roomList.innerHTML = `<tr><td colspan="7">${isSpanish ? 'Todavía no hay habitaciones.' : 'No rooms have been added yet.'}</td></tr>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    rooms.forEach((room) => {
      const option = document.createElement('option');
      option.value = room.roomId;
      option.textContent = `${isSpanish ? 'Habitación' : 'Room'} ${room.roomNumber}`;
      roomSelect.append(option);

      const row = document.createElement('tr');
      row.append(
        cellWithDetail(room.roomNumber, `${isSpanish ? 'Planta' : 'Floor'} ${room.floor}`),
        cell(room.roomTypeName),
        cell(String(room.bedCount)),
        cell(String(room.floor)),
        cell(formatPrice(room.pricePerNight)),
        cell(room.active ? (isSpanish ? 'Activa' : 'Active') : (isSpanish ? 'Inactiva' : 'Inactive'))
      );
      const actionCell = document.createElement('td');
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'room-edit-button';
      editButton.dataset.editRoom = room.roomId;
      editButton.textContent = isSpanish ? 'Editar' : 'Edit';
      editButton.addEventListener('click', () => {
        roomSelect.value = String(room.roomId);
        selectRoom();
      });
      actionCell.append(editButton);
      row.append(actionCell);
      fragment.append(row);
    });
    roomList.replaceChildren(fragment);
  }

  function cell(value) {
    const td = document.createElement('td');
    td.textContent = value;
    return td;
  }

  function cellWithDetail(value, detail) {
    const td = document.createElement('td');
    const strong = document.createElement('strong');
    strong.textContent = value;
    const small = document.createElement('small');
    small.textContent = detail;
    td.append(strong, small);
    return td;
  }

  function selectRoom() {
    const room = rooms.find((item) => String(item.roomId) === roomSelect.value);
    if (!room) {
      resetForm();
      return;
    }

    form.elements.namedItem('roomNumber').value = room.roomNumber;
    form.elements.namedItem('roomTypeId').value = String(room.roomTypeId);
    form.elements.namedItem('bedCount').value = room.bedCount;
    form.elements.namedItem('floor').value = room.floor;
    form.elements.namedItem('pricePerNight').value = room.pricePerNight;
    form.elements.namedItem('active').value = String(room.active);
    const selectedAmenities = new Set(room.amenityIds || []);
    Array.from(form.elements.namedItem('amenityIds').options).forEach((option) => {
      option.selected = selectedAmenities.has(Number(option.value));
    });
    updateFormMode(true);
    hideFeedback();
  }

  function resetForm() {
    form.reset();
    roomSelect.value = '';
    form.elements.namedItem('bedCount').value = '1';
    form.elements.namedItem('floor').value = '0';
    if (form.elements.namedItem('roomTypeId').options.length > 0) {
      form.elements.namedItem('roomTypeId').selectedIndex = 0;
    }
    updateFormMode(false);
    hideFeedback();
  }

  function updateFormMode(editing) {
    const isSpanish = document.documentElement.lang === 'es';
    document.querySelector('[data-room-form-title]').textContent = editing
      ? (isSpanish ? 'Editar habitación' : 'Edit room')
      : (isSpanish ? 'Crear habitación' : 'Create room');
    submitButton.firstChild.textContent = editing
      ? (isSpanish ? 'Guardar cambios ' : 'Save changes ')
      : (isSpanish ? 'Crear habitación ' : 'Create room ');
    deleteButton.hidden = !editing;
  }

  async function saveRoom(event) {
    event.preventDefault();
    const roomId = roomSelect.value;
    const isSpanish = document.documentElement.lang === 'es';
    const payload = {
      roomNumber: form.elements.namedItem('roomNumber').value.trim(),
      roomTypeId: Number(form.elements.namedItem('roomTypeId').value),
      bedCount: Number(form.elements.namedItem('bedCount').value),
      floor: Number(form.elements.namedItem('floor').value),
      pricePerNight: Number(form.elements.namedItem('pricePerNight').value),
      active: form.elements.namedItem('active').value === 'true',
      amenityIds: Array.from(form.elements.namedItem('amenityIds').selectedOptions, (option) => Number(option.value))
    };
    submitButton.disabled = true;
    hideFeedback();

    try {
      await request(roomId ? `${apiBaseUrl}/Rooms/${roomId}` : `${apiBaseUrl}/Rooms`, {
        method: roomId ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      await loadRoomsAndCatalog();
      showFeedback(isSpanish ? 'La habitación se guardó correctamente.' : 'Room saved successfully.', 'success');
    } catch (error) {
      showFeedback(error.message);
    } finally {
      submitButton.disabled = false;
    }
  }

  async function deactivateRoom() {
    const roomId = roomSelect.value;
    if (!roomId) return;
    const isSpanish = document.documentElement.lang === 'es';
    if (!window.confirm(isSpanish
      ? '¿Dar de baja esta habitación? Se conservarán sus reservas anteriores.'
      : 'Deactivate this room? Its reservation history will be preserved.')) return;

    deleteButton.disabled = true;
    try {
      await request(`${apiBaseUrl}/Rooms/${roomId}`, { method: 'DELETE' });
      await loadRoomsAndCatalog();
      showFeedback(isSpanish ? 'La habitación se dio de baja.' : 'Room deactivated.', 'success');
    } catch (error) {
      showFeedback(error.message);
    } finally {
      deleteButton.disabled = false;
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
    if (!response.ok) throw new Error(readError(body) || (document.documentElement.lang === 'es'
      ? 'No se pudo completar la operación.'
      : 'Could not complete the operation.'));
    if (!body) return null;
    return JSON.parse(body);
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

  function showFeedback(message, state = 'error') {
    feedback.textContent = message;
    feedback.dataset.state = state;
    feedback.hidden = false;
  }

  function hideFeedback() {
    feedback.hidden = true;
  }

  function formatPrice(value) {
    return new Intl.NumberFormat(document.documentElement.lang === 'es' ? 'es-AR' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  function translateRole(role) {
    if (document.documentElement.lang !== 'es') return role;
    return role === 'Admin' ? 'Administración' : 'Recepción';
  }

  function escapeHtml(value) {
    const element = document.createElement('span');
    element.textContent = value;
    return element.innerHTML;
  }

  function leaveDashboard() {
    sessionStorage.removeItem(tokenKey);
    window.location.replace('employee-login.html');
  }
})();
