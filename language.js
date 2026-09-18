(() => {
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
          '.password-label a': ['Forgot password?', '¿Olvidaste tu contraseña?'],
          '.remember span': ['Keep me signed in', 'Mantener la sesión iniciada'],
          '.login-form button': ['Log in <span aria-hidden="true">→</span>', 'Iniciar sesión <span aria-hidden="true">→</span>'],
          '.signup-prompt': ['New to Link Cordoba Hostel? <a href="#">Create an account</a>', '¿Nuevo en Link Cordoba Hostel? <a href="#">Crea una cuenta</a>'],
          '.staff-access': ['Are you a team member? Staff login <span aria-hidden="true">↗</span>', '¿Eres parte del equipo? Acceso del personal <span aria-hidden="true">↗</span>'],
          '.back-link': ['<span aria-hidden="true">←</span> Back to home', '<span aria-hidden="true">←</span> Volver al inicio'],
          '.aside-quote p': ['The best journeys<br>bring us home.', 'Los mejores viajes<br>nos llevan a casa.'],
          '.aside-quote small': ['— Link Cordoba Hostel guestbook', '— Libro de visitas de Link Cordoba Hostel']
        },
        employeeLogin: {
          '.dashboard-kicker': ['Team workspace', 'Espacio del equipo'],
          '.employee-login-heading h1': ['Welcome back.', 'Bienvenido de nuevo.'],
          '.employee-login-heading > p:last-child': ["Sign in to manage the hostel, your team and today's operations.", 'Inicia sesión para gestionar el hostel, tu equipo y las operaciones de hoy.'],
          'label[for="employee-email"]': ['Work email', 'Correo laboral'],
          'label[for="employee-password"]': ['Password', 'Contraseña'],
          '#employee-email': ['name@linkcordoba.com', 'nombre@linkcordoba.com'],
          '#employee-password': ['Enter your password', 'Introduce tu contraseña'],
          '.employee-remember span': ['Remember me', 'Recordarme'],
          '.employee-form-options > a': ['Forgot password?', '¿Olvidaste tu contraseña?'],
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
          '.dashboard-nav-link': ['<span class="nav-icon">▦</span> Overview', '<span class="nav-icon">▦</span> Resumen', '<span class="nav-icon">□</span> Reservations <span class="nav-count">12</span>', '<span class="nav-icon">□</span> Reservas <span class="nav-count">12</span>', '<span class="nav-icon">○</span> Guests', '<span class="nav-icon">○</span> Huéspedes', '<span class="nav-icon">◇</span> Rooms &amp; beds', '<span class="nav-icon">◇</span> Habitaciones y camas', '<span class="nav-icon">△</span> Team', '<span class="nav-icon">△</span> Equipo', '<span class="nav-icon">≡</span> Reports', '<span class="nav-icon">≡</span> Informes', '<span class="nav-icon">⚙</span> Settings', '<span class="nav-icon">⚙</span> Ajustes'],
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

  const pageName = document.body.classList.contains('login-page') ? 'login' : document.body.classList.contains('employee-login-page') ? 'employeeLogin' : document.body.classList.contains('dashboard-page') ? 'dashboard' : 'index';
  const languageKey = 'hostel-language';
  const toggle = document.querySelector('[data-language-toggle]');
  const getLanguage = () => localStorage.getItem(languageKey) || 'en';

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
      employeeLogin: ['Staff login | Link Cordoba Hostel', 'Acceso del personal | Link Cordoba Hostel'],
      dashboard: ['Dashboard | Link Cordoba Hostel', 'Panel | Link Cordoba Hostel']
    };
    if (language === 'es') {
      Object.entries(translations.es.common).forEach(([english, spanish]) => {
        document.querySelectorAll('a, span').forEach((element) => {
          if (element.innerHTML.trim() === english) element.innerHTML = spanish;
        });
      });
      if (page) Object.entries(page).forEach(([selector, values]) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          const pairIndex = index * 2;
          if (values[pairIndex + 1]) {
            element.innerHTML = values[pairIndex + 1];
            if (element.matches('input')) element.placeholder = values[pairIndex + 1];
          } else if (values[1]) {
            element.innerHTML = values[1];
            if (element.matches('input')) element.placeholder = values[1];
          }
        });
      });
      document.title = titles[pageName][1];
    } else {
      document.title = titles[pageName][0];
      window.location.reload();
      return;
    }
    updateToggle(language);
  }

  if (toggle) toggle.addEventListener('click', () => {
    const nextLanguage = getLanguage() === 'en' ? 'es' : 'en';
    localStorage.setItem(languageKey, nextLanguage);
    translate(nextLanguage);
  });

  if (getLanguage() === 'es') translate('es');
  else updateToggle('en');
})();
