(() => {
  const themeKey = 'hostel-theme';
  const savedTheme = localStorage.getItem(themeKey);
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = initialTheme;

  const languageButton = document.querySelector('[data-language-toggle]');
  const controlGroup = document.createElement('div');
  controlGroup.className = 'theme-language-controls';
  const themeDock = document.createElement('div');
  themeDock.className = 'theme-dock';
  themeDock.innerHTML = '<button class="theme-switch" type="button" role="switch" data-theme-toggle><span class="theme-switch-sun" aria-hidden="true">☼</span><span class="theme-switch-moon" aria-hidden="true">⏾</span><span class="theme-switch-thumb" aria-hidden="true"></span></button>';
  if (languageButton) {
    languageButton.parentNode.insertBefore(controlGroup, languageButton);
    controlGroup.append(themeDock, languageButton);
    if (languageButton.classList.contains('employee-language-toggle')) controlGroup.classList.add('employee-language-controls');
  } else {
    document.body.append(controlGroup);
    controlGroup.append(themeDock);
  }

  const themeToggle = themeDock.querySelector('[data-theme-toggle]');
  function updateTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute('aria-checked', String(theme === 'dark'));
    const label = theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro';
    const englishLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    themeToggle.setAttribute('aria-label', document.documentElement.lang === 'es' ? label : englishLabel);
    themeToggle.title = themeToggle.getAttribute('aria-label');
  }
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(themeKey, nextTheme);
    updateTheme(nextTheme);
  });

  // Traducciones temporales del cliente. Después mover estas cadenas a recursos .resx de ASP.NET Core.
  const translations = {
    es: {
      common: {
        'Link Cordoba Hostel': 'Link Cordoba Hostel',
        'Member login <span aria-hidden="true">↗</span>': 'Acceso de huésped <span aria-hidden="true">↗</span>',
        'Our story': 'Nuestra historia',
        'The spaces': 'Los espacios',
        'Contact': 'Contacto',
        'Back to home': 'Volver al inicio',
        'Back to public site': 'Volver al sitio público',
        'Staff access ↗': 'Acceso del personal ↗',
        'Staff access <span aria-hidden="true">↗</span>': 'Acceso del personal <span aria-hidden="true">↗</span>',
        'Staff login <span aria-hidden="true">↗</span>': 'Acceso del personal <span aria-hidden="true">↗</span>'
      },
      pages: {
        index: {
          '.eyebrow': ['A hostel with a point of view', 'Un hostel con personalidad', 'More than a bed', 'Mucho más que una cama', 'Find your rhythm', 'Encuentra tu ritmo'],
          '.hero h1': ['Sleep well.<br><em>Live more.</em>', 'Duerme bien.<br><em>Vive más.</em>'],
          '.hero-text': ['A warm, creative home base for curious travellers. Come for the city, stay for the people you meet along the way.', 'Un hogar cálido y creativo para viajeros curiosos. Ven por la ciudad y quédate por las personas que conocerás.'],
          '.hero-actions .button': ['Explore the house <span aria-hidden="true">↓</span>', 'Explora el hostel <span aria-hidden="true">↓</span>'],
          '.hero-actions .text-link': ['Already a guest? Sign in <span aria-hidden="true">→</span>', '¿Ya eres huésped? Inicia sesión <span aria-hidden="true">→</span>'],
          '.hero-note': ['Your place<br>in the city <span>✳</span>', 'Tu lugar<br>en la ciudad <span>✳</span>'],
          '.intro-grid h2': ['Make yourself<br><em>at home.</em>', 'Siéntete<br><em>como en casa.</em>'],
          '.intro-grid > div > p': ['Casa Cervantes is for slow breakfasts, spontaneous plans and stories that run late into the night. Our doors are open to independent travellers who want a little more from their stay.', 'Link Cordoba es para desayunos tranquilos, planes espontáneos e historias que se alargan hasta la noche. Nuestras puertas están abiertas a viajeros independientes que buscan algo más.'],
          '.section-heading h2': ['Good spaces<br><em>for good days.</em>', 'Buenos espacios<br><em>para buenos días.</em>'],
          '.section-heading > p': ['From quiet corners to shared tables, every room is designed to help you settle in.', 'Desde rincones tranquilos hasta mesas compartidas, cada espacio está pensado para que te sientas en casa.'],
          '.space-card-copy h3': ['Shared rooms', 'Habitaciones compartidas', 'The rooftop', 'La terraza', 'Shared kitchen', 'Cocina compartida'],
          '.space-card-copy p': ['Bright, comfortable and made for meeting people.', 'Luminosas, cómodas y pensadas para conocer gente.', 'Morning coffee, evening colour and city views.', 'Café por la mañana, color al atardecer y vistas de la ciudad.', 'Cook together, trade recipes, stay a while.', 'Cocinen juntos, compartan recetas y quédense un rato.'],
          '.footer-brand + p': ['Stay curious, wherever you go.', 'Mantén la curiosidad, estés donde estés.'],
          '.footer-label': ['Find us', 'Encuéntranos', 'Say hello', 'Saluda', 'Follow along', 'Síguenos'],
          '.footer-bottom': ['<span>© 2026 Casa Cervantes</span><span>Made for the curious</span>', '<span>© 2026 Link Cordoba Hostel</span><span>Hecho para curiosos</span>']
        },
        login: {
          '.eyebrow': ['Welcome back', 'Bienvenido de nuevo'],
          '.login-intro h1': ['Your next story<br><em>starts here.</em>', 'Tu próxima historia<br><em>empieza aquí.</em>'],
          '.login-intro > p:last-child': ['Log in to manage your booking, see your stay details and keep in touch with the Link community.', 'Inicia sesión para gestionar tu reserva, consultar tu estancia y mantenerte en contacto con la comunidad Link.'],
          'label[for="email"]': ['Email address', 'Correo electrónico'],
          'label[for="password"]': ['Password', 'Contraseña'],
          '#password': ['Enter your password', 'Introduce tu contraseña'],
          '.login-form button': ['Log in <span aria-hidden="true">→</span>', 'Iniciar sesión <span aria-hidden="true">→</span>'],
          '.login-reservation-link': ['Make a reservation <span aria-hidden="true">→</span>', 'Hacer una reserva <span aria-hidden="true">→</span>'],
          '.signup-prompt': ['Need a guest profile? <a href="#signup-dialog" data-open-signup>Register your details</a>', '¿Necesitas un perfil de huésped? <a href="#signup-dialog" data-open-signup>Registra tus datos</a>'],
          '.signup-dialog .eyebrow': ['Guest registration', 'Registro de huéspedes'],
          '.signup-dialog h2': ['Register your guest profile', 'Registra tu perfil de huésped'],
          '.signup-description': ['Register your guest details. Guest sign-in is not available yet.', 'Registra tus datos de huésped. El acceso de huéspedes todavía no está disponible.'],
          'label[for="signup-first-name"]': ['First name', 'Nombre'],
          'label[for="signup-last-name"]': ['Last name', 'Apellido'],
          'label[for="signup-document-type"]': ['Document type', 'Tipo de documento'],
          '#signup-document-type option': ['DNI', 'DNI', 'Passport', 'Pasaporte'],
          '[data-document-number-label]': ['DNI number', 'Número de DNI'],
          'label[for="signup-email"]': ['Email address', 'Correo electrónico'],
          'label[for="signup-phone"]': ['Phone number', 'Teléfono'],
          '#signup-phone-country': ['Phone country code', 'Código telefónico del país'],
          '.signup-cancel': ['Cancel', 'Cancelar'],
          '.signup-actions .button': ['Register profile <span aria-hidden="true">→</span>', 'Registrar perfil <span aria-hidden="true">→</span>'],
          '.staff-access': ['Are you a team member? Staff login <span aria-hidden="true">↗</span>', '¿Eres parte del equipo? Acceso del personal <span aria-hidden="true">↗</span>'],
          '.back-link': ['<span aria-hidden="true">←</span> Back to home', '<span aria-hidden="true">←</span> Volver al inicio'],
          '.aside-quote p': ['The best journeys<br>bring us home.', 'Los mejores viajes<br>nos llevan a casa.'],
          '.aside-quote small': ['— Link Cordoba Hostel guestbook', '— Libro de visitas de Link Cordoba Hostel']
        },
        guestReservation: {
          '.guest-reservation-header .back-link': ['<span aria-hidden="true">←</span> Back to login', '<span aria-hidden="true">←</span> Volver al acceso'],
          '.guest-reservation-intro .eyebrow': ['Guest services', 'Atención a huéspedes'],
          '.guest-reservation-intro h1': ['Plan your <em>stay.</em>', 'Planifica tu <em>estancia.</em>'],
          '.guest-reservation-intro > p:last-child': ['Share a few details so our team can check your request and prepare for your arrival.', 'Déjanos algunos datos para revisar tu solicitud y preparar tu llegada.'],
          '.guest-reservation-form > .module-fieldset > legend': ['Guest details', 'Datos del huésped', 'Stay details', 'Datos de la estancia', 'Vehicle and requests', 'Vehículo y solicitudes'],
          'label[for="first-name"] span': ['First name', 'Nombre'],
          'label[for="last-name"] span': ['Last name', 'Apellido'],
          'label[for="document-type"] span': ['Document type', 'Tipo de documento'],
          '#document-type option': ['Select document type', 'Selecciona un documento', 'National ID (DNI)', 'DNI', 'Foreigner ID (NIE)', 'NIE', 'Passport', 'Pasaporte'],
          'label[for="document-number"] span': ['Document number', 'Número de documento'],
          'label[for="phone"] span': ['Phone number', 'Teléfono'],
          'label[for="guest-email"] span': ['Email address', 'Correo electrónico'],
          'label[for="residence-city"] span': ['City of residence', 'Ciudad de residencia'],
          'label[for="residence-country"] span': ['Country of residence', 'País de residencia'],
          'label[for="check-in"] span': ['Check-in', 'Llegada'],
          'label[for="check-out"] span': ['Check-out', 'Salida'],
          'label[for="guest-count"] span': ['Number of guests', 'Cantidad de huéspedes'],
          'label[for="room-preference"] span': ['Room preference', 'Preferencia de habitación'],
          '#room-preference option': ['No preference', 'Sin preferencia', 'Private room', 'Habitación privada', 'Shared room', 'Habitación compartida'],
          'label[for="arrival-time"] span': ['Estimated arrival time', 'Hora estimada de llegada'],
          '.vehicle-choice legend': ['Will you arrive by vehicle?', '¿Llegarás en vehículo?'],
          '.vehicle-option span': ['Yes', 'Sí', 'No', 'No'],
          'label[for="vehicle-plate"] span': ['License plate', 'Matrícula'],
          'label[for="special-requests"] span': ['Special requests or accessibility needs', 'Solicitudes o necesidades de accesibilidad'],
          '.privacy-consent span': ['I agree to the use of these details to manage my reservation request.', 'Acepto que estos datos se utilicen para gestionar mi solicitud de reserva.'],
          '.guest-reservation-submit': ['Send reservation request <span aria-hidden="true">→</span>', 'Enviar solicitud de reserva <span aria-hidden="true">→</span>'],
          '.guest-reservation-cancel': ['Cancel <span aria-hidden="true">←</span>', 'Cancelar <span aria-hidden="true">←</span>'],
          '.guest-reservation-form .module-form-note': ['Your request is not confirmed until the team contacts you.', 'La solicitud no se confirma hasta que el equipo contacte contigo.'],
          '#residence-country': ['e.g. Spain', 'Ej.: España'],
          '#vehicle-plate': ['Vehicle registration', 'Matrícula del vehículo'],
          '#special-requests': ['Arrival notes, accessibility needs or other details', 'Notas de llegada, accesibilidad u otros detalles']
        },
        employeeLogin: {
          '.dashboard-kicker': ['Team workspace', 'Espacio del equipo'],
          '.employee-login-heading h1': ['Welcome back.', 'Bienvenido de nuevo.'],
          '.employee-login-heading > p:last-child': ["Sign in to manage the hostel, your team and today's operations.", 'Inicia sesión para gestionar el hostel, tu equipo y las operaciones de hoy.'],
          'label[for="employee-email"]': ['Work email', 'Correo laboral'],
          'label[for="employee-password"]': ['Password', 'Contraseña'],
          '#employee-email': ['name@linkcordoba.com', 'nombre@linkcordoba.com'],
          '#employee-password': ['Enter your password', 'Introduce tu contraseña'],
          '.employee-button': ['Sign in <span aria-hidden="true">→</span>', 'Entrar <span aria-hidden="true">→</span>'],
          '.employee-back': ['<span aria-hidden="true">←</span> Back to public site', '<span aria-hidden="true">←</span> Volver al sitio público'],
          '.employee-aside-top': ['<span class="aside-status-dot"></span> Operations dashboard', '<span class="aside-status-dot"></span> Panel de operaciones'],
          '.employee-aside-message p': ['Everything<br>in one place.', 'Todo<br>en un solo lugar.'],
          '.employee-aside-message small': ['Rooms · Guests · Team · Reports', 'Habitaciones · Huéspedes · Equipo · Informes'],
          '.employee-aside-footer': ['<span>LC / 01</span><span>Staff only</span>', '<span>LC / 01</span><span>Solo personal</span>']
        },
        dashboard: {
          '.dashboard-kicker': ['Saturday, September 5, 2026', 'Sábado, 5 de septiembre de 2026', 'Overview', 'Resumen', 'Live schedule', 'Agenda en vivo', 'Rooms & beds', 'Habitaciones y camas'],
          '.dashboard-header h1': ['Good morning, María.', 'Buenos días, María.'],
          '.dashboard-help': ['Help centre', 'Centro de ayuda'],
          '.dashboard-nav-label': ['Workspace', 'Espacio de trabajo', 'Management', 'Gestión'],
          '.dashboard-nav-link': ['<span class="nav-icon">▦</span> Overview', '<span class="nav-icon">▦</span> Resumen', '<span class="nav-icon">＋</span> New reservation', '<span class="nav-icon">＋</span> Nueva reserva', '<span class="nav-icon">▦</span> Booking calendar <span class="nav-count" data-backend="reservation-count">12</span>', '<span class="nav-icon">▦</span> Calendario de reservas <span class="nav-count" data-backend="reservation-count">12</span>', '<span class="nav-icon">○</span> Guests', '<span class="nav-icon">○</span> Huéspedes', '<span class="nav-icon">◇</span> Rooms &amp; beds', '<span class="nav-icon">◇</span> Habitaciones y camas', '<span class="nav-icon">△</span> Team', '<span class="nav-icon">△</span> Equipo', '<span class="nav-icon">≡</span> Reports', '<span class="nav-icon">≡</span> Informes', '<span class="nav-icon">⚙</span> Settings', '<span class="nav-icon">⚙</span> Ajustes'],
          '.profile-mini strong': ['María Gómez', 'María Gómez'],
          '.profile-mini small': ['Administrator', 'Administradora'],
          '.dashboard-alert strong': ["Today's focus", 'Prioridad de hoy'],
          '.dashboard-alert p': ['High turnover day. 18 check-ins and 14 check-outs are expected.', 'Día de alta rotación. Se esperan 18 entradas y 14 salidas.'],
          '.dashboard-alert > a': ['View schedule <span aria-hidden="true">→</span>', 'Ver agenda <span aria-hidden="true">→</span>'],
          '.date-filter': ['Today <span aria-hidden="true">⌄</span>', 'Hoy <span aria-hidden="true">⌄</span>'],
          '.stat-card-top > span:first-child': ['Occupancy', 'Ocupación', 'Arrivals today', 'Llegadas hoy', 'Departures today', 'Salidas hoy', 'Revenue this month', 'Ingresos del mes'],
          '.stat-card:nth-child(1) > p': ['<span class="trend-up">↑ 6.4%</span> vs last week', '<span class="trend-up">↑ 6,4%</span> vs semana pasada'],
          '.stat-card:nth-child(2) > p': ['<span class="stat-neutral">8 direct</span> · 10 online', '<span class="stat-neutral">8 directas</span> · 10 online'],
          '.stat-card:nth-child(2) small': ['68% checked in', '68% registradas'],
          '.stat-card:nth-child(3) > p': ['<span class="trend-up">9 completed</span> · 5 remaining', '<span class="trend-up">9 completadas</span> · 5 restantes'],
          '.stat-card:nth-child(3) small': ['Ready for housekeeping', 'Listas para limpieza'],
          '.stat-card:nth-child(4) > p': ['<span class="trend-up">↑ 12.8%</span> vs August', '<span class="trend-up">↑ 12,8%</span> vs agosto'],
          '.panel-heading a': ['See all <span aria-hidden="true">→</span>', 'Ver todo <span aria-hidden="true">→</span>', 'Manage <span aria-hidden="true">→</span>', 'Gestionar <span aria-hidden="true">→</span>'],
          '.schedule-row strong': ['Early check-out', 'Salida anticipada', 'Group arrival', 'Llegada de grupo', 'Room inspection', 'Inspección de habitaciones', 'Late arrival', 'Llegada tarde'],
          '.schedule-row p': ['Room 204 · James Wilson', 'Habitación 204 · James Wilson', '8 guests · Booking #LC-4821', '8 huéspedes · Reserva #LC-4821', 'Rooms 101–108 · Housekeeping', 'Habitaciones 101–108 · Limpieza', 'Maria Rossi · Room 306', 'Maria Rossi · Habitación 306'],
          '.schedule-tag': ['Done', 'Hecho', 'Upcoming', 'Próximo', 'Upcoming', 'Próximo', 'Note', 'Nota'],
          '.occupancy-legend p': ['<span class="legend-dot legend-occupied"></span>Occupied <strong>48</strong>', '<span class="legend-dot legend-occupied"></span>Ocupadas <strong>48</strong>', '<span class="legend-dot legend-available"></span>Available <strong>10</strong>', '<span class="legend-dot legend-available"></span>Disponibles <strong>10</strong>', '<span class="legend-dot legend-cleaning"></span>Cleaning <strong>4</strong>', '<span class="legend-dot legend-cleaning"></span>En limpieza <strong>4</strong>'],
          '.occupancy-footer': ['<span>Next availability</span><strong>Room 207 · 2 beds</strong>', '<span>Próxima disponibilidad</span><strong>Habitación 207 · 2 camas</strong>'],
          '.logout-link': ['Sign out <span aria-hidden="true">↗</span>', 'Cerrar sesión <span aria-hidden="true">↗</span>']
        }
      }
    }
  };

  const pageName = document.body.dataset.page || (document.body.classList.contains('login-page') ? 'login' : document.body.classList.contains('employee-login-page') ? 'employeeLogin' : document.body.classList.contains('dashboard-page') ? 'dashboard' : 'index');
  const languageKey = 'hostel-language';
  const toggle = document.querySelector('[data-language-toggle]');
  const getLanguage = () => localStorage.getItem(languageKey) || 'es';
  const currentLanguage = getLanguage();
  document.documentElement.lang = currentLanguage;
  updateTheme(initialTheme);

  // El botón muestra el idioma que se activará en el siguiente clic.
  function updateToggle(language) {
    if (!toggle) return;
    toggle.textContent = language === 'en' ? 'ES' : 'EN';
    toggle.setAttribute('aria-label', language === 'en' ? 'Cambiar a español' : 'Switch to English');
    toggle.title = toggle.getAttribute('aria-label');
  }

  function translate(language) {
    const page = translations.es.pages[pageName];
    document.documentElement.lang = language;
    const titles = {
      index: ['Link Cordoba Hostel | Stay curious', 'Link Cordoba Hostel | Vive con curiosidad'],
      login: ['Member login | Link Cordoba Hostel', 'Acceso de huésped | Link Cordoba Hostel'],
      guestReservation: ['Request a reservation | Link Cordoba Hostel', 'Solicitar una reserva | Link Cordoba Hostel'],
      employeeLogin: ['Staff login | Link Cordoba Hostel', 'Acceso del personal | Link Cordoba Hostel'],
      dashboard: ['Dashboard | Link Cordoba Hostel', 'Panel | Link Cordoba Hostel'],
      newReservation: ['New reservation | Link Cordoba Hostel', 'Nueva reserva | Link Cordoba Hostel'],
      reservationCalendar: ['Booking calendar | Link Cordoba Hostel', 'Calendario de reservas | Link Cordoba Hostel'],
      rooms: ['Rooms & beds | Link Cordoba Hostel', 'Habitaciones y camas | Link Cordoba Hostel']
    };

    Object.entries(translations.es.common).forEach(([english, spanish]) => {
      document.querySelectorAll('a, span, button, p, h1, h2, h3, label, small, strong, div').forEach((element) => {
        const currentText = element.innerHTML.trim();
        if (currentText === english || currentText === spanish) {
          element.innerHTML = language === 'es' ? spanish : english;
        }
      });
    });

    if (page) {
      Object.entries(page).forEach(([selector, values]) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          const pairIndex = index * 2;
          const englishValue = values[pairIndex] || values[0];
          const spanishValue = values[pairIndex + 1] || values[1];
          const target = language === 'es' ? spanishValue : englishValue;
          if (element.matches('input, textarea')) {
            element.placeholder = target;
          } else {
            element.innerHTML = target;
          }
        });
      });
    }
    if (pageName === 'login') {
      document.querySelector('.signup-close')?.setAttribute('aria-label', language === 'es' ? 'Cerrar' : 'Close');
    }

    if (document.body.dataset.page || document.body.classList.contains('dashboard-page')) {
      const moduleTranslations = {
        'Workspace': { en: 'Workspace', es: 'Espacio de trabajo' },
        'Management': { en: 'Management', es: 'Gestión' },
        'Overview': { en: 'Overview', es: 'Resumen' },
        'At a glance': { en: 'At a glance', es: 'Resumen general' },
        'New reservation': { en: 'New reservation', es: 'Nueva reserva' },
        '＋ New reservation': { en: '＋ New reservation', es: '＋ Nueva reserva' },
        'Booking calendar': { en: 'Booking calendar', es: 'Calendario de reservas' },
        'Guests': { en: 'Guests', es: 'Huéspedes' },
        'Rooms & beds': { en: 'Rooms & beds', es: 'Habitaciones y camas' },
        'Team': { en: 'Team', es: 'Equipo' },
        'Reports': { en: 'Reports', es: 'Informes' },
        'Settings': { en: 'Settings', es: 'Ajustes' },
        'Sign out': { en: 'Sign out', es: 'Cerrar sesión' },
        'Reservations': { en: 'Reservations', es: 'Reservas' },
        'Front desk': { en: 'Front desk', es: 'Recepción' },
        'Enter booking details': { en: 'Enter booking details', es: 'Datos de la reserva' },
        'Create a walk-in or phone reservation. This form is a visual placeholder.': { en: 'Create a walk-in or phone reservation. This form is a visual placeholder.', es: 'Formulario provisional para reservas presenciales o por teléfono.' },
        'Draft': { en: 'Draft', es: 'Borrador' },
        'Guest details': { en: 'Guest details', es: 'Datos del huésped' },
        'Stay details': { en: 'Stay details', es: 'Datos de la estancia' },
        'Full name': { en: 'Full name', es: 'Nombre completo' },
        'Email address': { en: 'Email address', es: 'Correo electrónico' },
        'Phone number': { en: 'Phone number', es: 'Teléfono' },
        'Number of guests': { en: 'Number of guests', es: 'Número de huéspedes' },
        'Check-in': { en: 'Check-in', es: 'Entrada' },
        'Check-out': { en: 'Check-out', es: 'Salida' },
        'Room or bed': { en: 'Room or bed', es: 'Habitación o cama' },
        'Select availability': { en: 'Select availability', es: 'Seleccionar disponibilidad' },
        'Room 102 · 1 bed': { en: 'Room 102 · 1 bed', es: 'Habitación 102 · 1 cama' },
        'Room 204 · 2 beds': { en: 'Room 204 · 2 beds', es: 'Habitación 204 · 2 camas' },
        'Room 306 · 1 bed': { en: 'Room 306 · 1 bed', es: 'Habitación 306 · 1 cama' },
        'Booking source': { en: 'Booking source', es: 'Origen de la reserva' },
        'Walk-in': { en: 'Walk-in', es: 'Presencial' },
        'Phone': { en: 'Phone', es: 'Teléfono' },
        'Email': { en: 'Email', es: 'Correo electrónico' },
        'Other': { en: 'Other', es: 'Otro' },
        'Notes': { en: 'Notes', es: 'Notas' },
        'Requests or arrival notes': { en: 'Requests or arrival notes', es: 'Solicitudes o notas de llegada' },
        'Save reservation': { en: 'Save reservation', es: 'Guardar reserva' },
        'Cancel': { en: 'Cancel', es: 'Cancelar' },
        'Backend connection pending': { en: 'Backend connection pending', es: 'Conexión con el servidor pendiente' },
        'Availability overview': { en: 'Availability overview', es: 'Vista de disponibilidad' },
        'September 2026': { en: 'September 2026', es: 'Septiembre de 2026' },
        'Reservation calendar · all rooms': { en: 'Reservation calendar · all rooms', es: 'Calendario de reservas · todas las habitaciones' },
        'Today': { en: 'Today', es: 'Hoy' },
        "Today's activity": { en: "Today's activity", es: 'Actividad de hoy' },
        'Availability': { en: 'Availability', es: 'Disponibilidad' },
        'of 58 beds': { en: 'of 58 beds', es: 'de 58 camas' },
        'Mon': { en: 'Mon', es: 'Lun' },
        'Tue': { en: 'Tue', es: 'Mar' },
        'Wed': { en: 'Wed', es: 'Mié' },
        'Thu': { en: 'Thu', es: 'Jue' },
        'Fri': { en: 'Fri', es: 'Vie' },
        'Sat': { en: 'Sat', es: 'Sáb' },
        'Sun': { en: 'Sun', es: 'Dom' },
        'Confirmed': { en: 'Confirmed', es: 'Confirmada' },
        'Checked in': { en: 'Checked in', es: 'Registrada' },
        'Pending': { en: 'Pending', es: 'Pendiente' },
        'Online': { en: 'Online', es: 'En línea' },
        'Sample bookings · calendar data pending': { en: 'Sample bookings · calendar data pending', es: 'Reservas de ejemplo · datos pendientes' },
        'Inventory': { en: 'Inventory', es: 'Inventario' },
        'View calendar': { en: 'View calendar', es: 'Ver calendario' },
        'Property setup': { en: 'Property setup', es: 'Gestión del alojamiento' },
        'Manage rooms': { en: 'Manage rooms', es: 'Gestionar habitaciones' },
        'Edit capacity, room type and operational status.': { en: 'Edit capacity, room type and operational status.', es: 'Modifica la capacidad, el tipo de habitación y el estado operativo.' },
        '12 rooms': { en: '12 rooms', es: '12 habitaciones' },
        'Edit room': { en: 'Edit room', es: 'Editar habitación' },
        'Select room': { en: 'Select room', es: 'Seleccionar habitación' },
        'Room name or number': { en: 'Room name or number', es: 'Nombre o número' },
        'Room type': { en: 'Room type', es: 'Tipo de habitación' },
        'Shared dorm': { en: 'Shared dorm', es: 'Dormitorio compartido' },
        'Private double': { en: 'Private double', es: 'Doble privada' },
        'Private single': { en: 'Private single', es: 'Individual privada' },
        'Bed capacity': { en: 'Bed capacity', es: 'Capacidad de camas' },
        'Floor': { en: 'Floor', es: 'Planta' },
        'Nightly rate (€)': { en: 'Nightly rate (€)', es: 'Tarifa por noche (€)' },
        'Status': { en: 'Status', es: 'Estado' },
        'Available': { en: 'Available', es: 'Disponible' },
        'Maintenance': { en: 'Maintenance', es: 'Mantenimiento' },
        'Out of service': { en: 'Out of service', es: 'Fuera de servicio' },
        'Room details or maintenance notes': { en: 'Room details or maintenance notes', es: 'Detalles o notas de mantenimiento' },
        'Room 102': { en: 'Room 102', es: 'Habitación 102' },
        'Room 204': { en: 'Room 204', es: 'Habitación 204' },
        'Room 306': { en: 'Room 306', es: 'Habitación 306' },
        'Save room': { en: 'Save room', es: 'Guardar habitación' },
        'Room inventory': { en: 'Room inventory', es: 'Inventario de habitaciones' },
        'Current rooms': { en: 'Current rooms', es: 'Habitaciones actuales' },
        'Room': { en: 'Room', es: 'Habitación' },
        'Type': { en: 'Type', es: 'Tipo' },
        'Beds': { en: 'Beds', es: 'Camas' },
        'First floor': { en: 'First floor', es: 'Primera planta' },
        'Second floor': { en: 'Second floor', es: 'Segunda planta' },
        'Third floor': { en: 'Third floor', es: 'Tercera planta' },
        'Occupied': { en: 'Occupied', es: 'Ocupada' },
        'Showing sample inventory': { en: 'Showing sample inventory', es: 'Inventario de ejemplo' }
      };

      const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = textWalker.nextNode())) {
        const sourceText = (textNode.nodeValue || '').trim();
        const entry = Object.entries(moduleTranslations).find(([key, map]) => key === sourceText || map.es === sourceText || map.en === sourceText);
        if (entry) {
          const [, map] = entry;
          const targetText = language === 'es' ? map.es : map.en;
          const leadingSpace = (textNode.nodeValue || '').match(/^\s*/)[0];
          const trailingSpace = (textNode.nodeValue || '').match(/\s*$/)[0];
          textNode.nodeValue = `${leadingSpace}${targetText}${trailingSpace}`;
        }
      }

      const placeholders = {
        'Guest full name': { en: 'Guest full name', es: 'Nombre completo del huésped' },
        'guest@example.com': { en: 'guest@example.com', es: 'huesped@ejemplo.com' },
        'Requests or arrival notes': { en: 'Requests or arrival notes', es: 'Solicitudes o notas de llegada' },
        'Room details or maintenance notes': { en: 'Room details or maintenance notes', es: 'Detalles o notas de mantenimiento' },
        '+34 600 000 000': { en: '+34 600 000 000', es: '+34 600 000 000' }
      };
      document.querySelectorAll('[placeholder]').forEach((field) => {
        if (placeholders[field.placeholder]) {
          field.placeholder = placeholders[field.placeholder][language === 'es' ? 'es' : 'en'];
        }
      });
      const roomName = document.querySelector('[name="name"]');
      if (roomName && roomName.value === 'Room 102' && language === 'es') roomName.value = 'Habitación 102';
      if (roomName && roomName.value === 'Habitación 102' && language === 'en') roomName.value = 'Room 102';
    }

    document.title = titles[pageName][language === 'es' ? 1 : 0];
    updateToggle(language);
  }

  // Conserva la preferencia al navegar entre las páginas estáticas del prototipo.
  if (toggle) toggle.addEventListener('click', () => {
    const nextLanguage = getLanguage() === 'en' ? 'es' : 'en';
    localStorage.setItem(languageKey, nextLanguage);
    translate(nextLanguage);
  });

  // Si el usuario eligió inglés antes, lo respetamos; si no, arrancamos en español.
  if (currentLanguage === 'en') {
    translate('en');
  } else {
    translate('es');
  }
})();
