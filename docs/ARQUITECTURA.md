# Arquitectura inicial de Link Cordoba Hostel

Este proyecto es un prototipo estático. Las páginas HTML están en `frontend/`, los estilos compartidos en `frontend/css/styles.css` y los scripts del navegador en `frontend/js/`. La autenticación, los datos y las reglas de negocio todavía no están implementados.

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

- `frontend/login.html`: enviar correo y contraseña al endpoint de huéspedes.
- `frontend/employee-login.html`: enviar credenciales al endpoint `/account/staff/login`.
- Recordar sesión, cierre de sesión, recuperación de contraseña y autorización por rol.
- No enviar credenciales mediante enlaces ni parámetros en la URL. El enlace actual de acceso del personal es solo una demostración visual.

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
