# Arquitectura inicial de Link Cordoba Hostel

El proyecto combina las páginas HTML de `frontend/`, los estilos compartidos en `frontend/css/styles.css`, los scripts del navegador en `frontend/js/`, una API ASP.NET Core en `APIHostel/` y SQL Server. Ya están conectados el inicio de sesión por roles, el registro de huéspedes y empleados, el catálogo de países y el portal privado de huéspedes. Las operaciones de reservas y el inventario del panel de personal todavía son demostrativos y no están conectados a la API.

## Mapa de pantallas

| Archivo | Responsabilidad | Próximo destino en .NET |
| --- | --- | --- |
| `frontend/index.html` | Landing pública del hostel | `Views/Home/Index.cshtml` o `Pages/Index.cshtml` |
| `frontend/login.html` | Acceso de huéspedes | `Views/Account/Login.cshtml` |
| `frontend/employee-login.html` | Acceso separado para empleados | `Views/Staff/Login.cshtml` |
| `frontend/employee-dashboard.html` | Inicio del área privada | `Views/Staff/Dashboard.cshtml` |
| `frontend/employee-reservation-new.html` | Alta manual de reserva | `Views/Staff/Reservations/Create.cshtml` |
| `frontend/employee-reservation-calendar.html` | Calendario mensual de reservas | `Views/Staff/Reservations/Calendar.cshtml` |
| `frontend/employee-rooms.html` | Edición e inventario de habitaciones | `Views/Staff/Rooms/Index.cshtml` |
| `frontend/css/styles.css` | Estilos compartidos | `wwwroot/css/site.css` |
| `frontend/js/language.js` | Cambio de idioma del prototipo | Servicio de localización de ASP.NET Core |

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

Ya implementado:

- `frontend/login.html` y `frontend/employee-login.html` usan `POST /api/Auth/Login`, que comprueba la cuenta y su rol y devuelve un JWT.
- `frontend/guest-register.html` consulta `GET /api/Auth/Countries` y crea la cuenta mediante `POST /api/Auth/RegisterGuest`.
- El panel consulta `GET /api/Auth/Me`; un administrador puede crear cuentas de personal con `POST /api/Auth/RegisterEmployee`.
- El portal de huéspedes consulta `GET /api/GuestPortal`. La cancelación de reservas futuras permitidas usa `POST /api/GuestPortal/Reservations/{id}/Cancel`.

Pendiente:

- Recuperación y cambio de contraseña, y persistencia de sesión mediante la opción “Recordarme”.
- Definir y documentar la creación segura de la primera cuenta administradora.
- No enviar credenciales mediante enlaces ni parámetros en la URL.

### Dashboard

La identidad y el rol de la persona que inició sesión se cargan desde `GET /api/Auth/Me`. Las métricas operativas siguen siendo estáticas y deben conectarse:

- `dashboard-statistics`: ocupación, llegadas, salidas e ingresos.
- `daily-summary`: resumen y alertas del día.
- `reservation-schedule`: agenda de reservas, huéspedes y estados.
- `room-availability`: camas ocupadas, disponibles, en limpieza y próxima disponibilidad.
- `reservation-count`: contador de reservas pendientes.
- `notifications`: notificaciones del usuario.
- `dashboard-date`: fecha del servidor o de la zona horaria del hostel.

### Operaciones de negocio

- Crear, editar, cancelar y consultar reservas.
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

## Próximas prioridades

1. Definir y documentar el alta segura de la primera cuenta administradora.
2. Implementar endpoints y pantallas para crear, consultar y actualizar reservas, y asignar camas con disponibilidad real.
3. Conectar el inventario de habitaciones, camas, limpieza y mantenimiento a SQL Server.
4. Reemplazar las estadísticas estáticas del dashboard por consultas reales.
5. Completar los módulos de huéspedes, equipo, informes y configuración, así como la gestión de contraseñas y la opción “Recordarme”.
6. Endurecer la configuración para producción y migrar las traducciones a recursos `.resx` o al sistema de localización de ASP.NET Core.

## Convención para continuar el frontend

- Mantener un componente o sección por responsabilidad.
- Usar `data-backend="nombre-del-recurso"` en cualquier dato que después venga de una API o consulta.
- Usar `data-module="nombre-del-modulo"` para los enlaces del área de empleados.
- No incluir contraseñas, tokens ni datos sensibles en HTML, enlaces o `localStorage`.
- Mantener el HTML semántico y los comentarios orientados a integración, no comentarios que repitan lo que el código ya dice.
