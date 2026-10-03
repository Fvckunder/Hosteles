# Arquitectura inicial de Link Cordoba Hostel

Este proyecto es un prototipo estático. Los archivos HTML muestran las pantallas y `styles.css` concentra la presentación. La autenticación, los datos y las reglas de negocio todavía no están implementados.

## Mapa de pantallas

| Archivo | Responsabilidad | Próximo destino en .NET |
| --- | --- | --- |
| `index.html` | Landing pública del hostel | `Views/Home/Index.cshtml` o `Pages/Index.cshtml` |
| `login.html` | Acceso de huéspedes | `Views/Account/Login.cshtml` |
| `guest-reservation.html` | Solicitud de reserva de huéspedes | `Views/Reservations/Request.cshtml` |
| `employee-login.html` | Acceso separado para empleados | `Views/Staff/Login.cshtml` |
| `employee-dashboard.html` | Inicio del área privada | `Views/Staff/Dashboard.cshtml` |
| `employee-reservation-new.html` | Alta manual de reserva | `Views/Staff/Reservations/Create.cshtml` |
| `employee-reservation-calendar.html` | Calendario mensual de reservas | `Views/Staff/Reservations/Calendar.cshtml` |
| `employee-rooms.html` | Edición e inventario de habitaciones | `Views/Staff/Rooms/Index.cshtml` |
| `styles.css` | Estilos compartidos | `wwwroot/css/site.css` |
| `language.js` | Cambio de idioma del prototipo | Servicio de localización de ASP.NET Core |

## Dónde deben ir los módulos

El dashboard ya contiene los puntos de navegación. Cada módulo debería convertirse en una vista o área protegida, no en más contenido dentro de `employee-dashboard.html`.

- **Reservas**: `Areas/Staff/Pages/Reservations/` o `Views/Staff/Reservations/`
- **Huéspedes**: `Areas/Staff/Pages/Guests/` o `Views/Staff/Guests/`
- **Habitaciones y camas**: `Areas/Staff/Pages/Rooms/` o `Views/Staff/Rooms/`
- **Equipo**: `Areas/Staff/Pages/Team/` o `Views/Staff/Team/`
- **Informes**: `Areas/Staff/Pages/Reports/` o `Views/Staff/Reports/`
- **Configuración**: `Areas/Staff/Pages/Settings/` o `Views/Staff/Settings/`

Los atributos `data-module` de la navegación identifican cada módulo. Los `href="#..."` son anclas temporales del prototipo y deberán sustituirse por rutas reales.

El prototipo separa el alta manual y el calendario mensual de reservas en pantallas distintas, y ofrece una vista de edición e inventario de habitaciones. Sus formularios y datos son demostrativos: todavía no guardan cambios ni consultan disponibilidad real.

## Componentes que deben conectarse al backend

### Autenticación

- `employee-login.html`: envía `{ email, password }` a `POST /api/Auth/Login` y solo navega al dashboard si la API responde correctamente.
- `login.html`: el contrato actual no define autenticación de huéspedes; el endpoint de login opera sobre `USERS`, que representa al personal.
- El alta del diálogo de `login.html` crea un perfil con `POST /api/Guests`; no crea credenciales ni habilita el inicio de sesión. El teléfono se envía en formato internacional E.164 y el país como `countryCode` ISO-3166-1 alpha-2.
- El esquema define `country_id` como clave foránea numérica de `COUNTRIES`, no como código telefónico. El backend debe aceptar `countryCode` y resolverlo al `country_id`, o publicar un catálogo que permita al cliente enviar la FK real.
- La API debe publicarse bajo el mismo origen o configurarse en `<meta name="api-base-url">` de las páginas de acceso. En despliegue entre orígenes, habilitar CORS y cookies con credenciales según la estrategia de sesión.
- El contrato de login descrito no incluye token ni define cookies/sesión. Antes de proteger el dashboard, acordar con el backend cómo persistir y validar la autenticación.
- Recuperación de contraseña, alta de países, sesión persistente y autorización por rol requieren endpoints/contratos adicionales.
- No enviar credenciales mediante enlaces ni parámetros en la URL.

### Dashboard

Los elementos marcados con `data-backend` son datos dinámicos:

- `dashboard-statistics`: ocupación, llegadas, salidas e ingresos.
- `daily-summary`: resumen y alertas del día.
- `reservation-schedule`: agenda de reservas, huéspedes y estados.
- `room-availability`: camas ocupadas, disponibles, en limpieza y próxima disponibilidad.
- `reservation-count`: contador de reservas pendientes.
- `notifications`: notificaciones del usuario.
- `dashboard-date`: fecha del servidor o de la zona horaria del hostel.

### Operaciones de negocio

- Crear, editar, cancelar y consultar reservas.
- Recibir solicitudes de reserva con datos de contacto, documento, residencia, fechas, huéspedes, vehículo y necesidades de llegada.
- Registrar check-in y check-out.
- Asignar habitaciones y camas.
- Actualizar estados de limpieza y mantenimiento.
- Gestionar huéspedes y sus datos de contacto.
- Gestionar empleados, roles y permisos.
- Generar informes de ocupación, ingresos y actividad.

## Recomendación de backend

Para el proyecto .NET, una estructura inicial razonable sería:

```text
Hostel/
├── Areas/
│   └── Staff/
│       ├── Controllers/ o Pages/
│       ├── Views/
│       └── Models/
├── Controllers/
│   ├── AccountController.cs
│   └── HomeController.cs
├── Data/
│   ├── HostelDbContext.cs
│   └── Migrations/
├── Models/
│   ├── Guest.cs
│   ├── Employee.cs
│   ├── Reservation.cs
│   ├── Room.cs
│   └── Bed.cs
├── Services/
│   ├── DashboardService.cs
│   ├── ReservationService.cs
│   └── RoomService.cs
└── wwwroot/
    ├── css/site.css
    └── js/language.js
```

## Prioridad de implementación

1. Crear la base de datos y las entidades `Employee`, `Guest`, `Reservation`, `Room` y `Bed`.
2. Implementar autenticación y autorización separando huéspedes y empleados.
3. Conectar reservas, habitaciones y huéspedes.
4. Reemplazar las estadísticas estáticas del dashboard por consultas reales.
5. Añadir roles: administrador, recepción y limpieza.
6. Migrar las traducciones a recursos `.resx` o al sistema de localización de ASP.NET Core.

## Convención para continuar el frontend

- Mantener un componente o sección por responsabilidad.
- Usar `data-backend="nombre-del-recurso"` en cualquier dato que después venga de una API o consulta.
- Usar `data-module="nombre-del-modulo"` para los enlaces del área de empleados.
- No incluir contraseñas, tokens ni datos sensibles en HTML, enlaces o `localStorage`.
- Mantener el HTML semántico y los comentarios orientados a integración, no comentarios que repitan lo que el código ya dice.
