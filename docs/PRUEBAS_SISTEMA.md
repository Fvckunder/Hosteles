# Pruebas del sistema

## 1. Niveles de prueba

El sistema se verificará mediante los siguientes niveles:

- **Pruebas unitarias:** validan funciones y componentes aislados.
- **Pruebas de integración:** comprueban la comunicación entre frontend, API y SQL Server.
- **Pruebas de sistema:** validan los procesos completos desde la perspectiva del usuario.
- **Pruebas de aceptación:** verifican que el sistema cumpla las necesidades de administradores, recepcionistas y huéspedes.
- **Pruebas de seguridad:** controlan autenticación, autorización y protección de datos.
- **Pruebas de regresión:** garantizan que los cambios no afecten las funciones existentes.

## 2. Datos de prueba

### Usuarios

| Usuario | Rol | Uso |
|---|---|---|
| `admin@hostel.com` | Administrador | Validar permisos completos |
| `recepcion@hostel.com` | Recepción | Gestionar huéspedes y reservas |
| `carlos@hostel.com` | Recepción | Verificar otro usuario del mismo rol |
| Nuevo huésped | Huésped | Probar registro y portal |
| Usuario inexistente | Sin rol | Validar errores de acceso |

### Datos del sistema

- Tipos de habitación: Simple, Doble, Triple, Compartida y Suite.
- Estados de reserva: Pending, Confirmed, Cancelled y Completed.
- Estados de cama: Available, Maintenance y Out of service.
- Habitaciones de referencia: 101, 102, 201 y 202.

Los datos iniciales se encuentran en `database/TestRoomTypesAmenitiesRoomsUsers.sql`.

## 3. Lote de pruebas unitarias

| ID | Prueba | Resultado esperado |
|---|---|---|
| UT-01 | Validar campos obligatorios del login | Se informa el error correspondiente |
| UT-02 | Ingresar con credenciales válidas | Se genera un token JWT |
| UT-03 | Ingresar con credenciales incorrectas | Se rechaza el acceso |
| UT-04 | Validar el formato del correo | Se aceptan únicamente correos válidos |
| UT-05 | Registrar un huésped con datos válidos | Se crea la cuenta |
| UT-06 | Registrar un correo o documento duplicado | Se rechaza el registro |
| UT-07 | Buscar una habitación existente | Se devuelven sus datos |
| UT-08 | Consultar camas disponibles | Solo se muestran camas disponibles |
| UT-09 | Intentar utilizar una cama en mantenimiento | La operación es rechazada |

## 4. Lote de pruebas de integración

| ID | Prueba | Resultado esperado |
|---|---|---|
| IT-01 | `POST /api/Auth/Login` | Valida el usuario y devuelve JWT |
| IT-02 | `GET /api/Auth/Countries` | Devuelve los países de SQL Server |
| IT-03 | `POST /api/Auth/RegisterGuest` | Guarda el usuario y perfil del huésped |
| IT-04 | `GET /api/Auth/Me` | Devuelve los datos del usuario autenticado |
| IT-05 | `POST /api/Auth/RegisterEmployee` | Crea empleados solo para administradores |
| IT-06 | `GET /api/GuestPortal` | Devuelve perfil y reservas del huésped |
| IT-07 | Consultar un endpoint sin token | Devuelve HTTP 401 |
| IT-08 | Ejecutar los scripts de base de datos | Crea y carga correctamente la información |
| IT-09 | Ejecutar dos veces el script de prueba | No duplica los registros |
| IT-10 | Detener la API y cargar el frontend | Se muestra un mensaje de conexión |

## 5. Lote de pruebas de sistema

### Acceso y roles

- El administrador puede acceder al panel administrativo.
- El personal de recepción puede gestionar huéspedes y reservas.
- Un usuario sin credenciales válidas no puede iniciar sesión.
- Un usuario sin sesión es redirigido a la pantalla de login.
- Un huésped no puede acceder a funciones administrativas.

### Registro de huéspedes

- Se permite registrar un huésped con datos válidos.
- Se rechazan campos obligatorios vacíos.
- Se rechazan emails y documentos duplicados.
- Las contraseñas se almacenan protegidas mediante hash.

### Gestión de reservas

- Se puede crear una reserva con fechas y camas disponibles.
- Una reserva nueva queda en estado `Pending`.
- Se puede confirmar, cancelar y completar una reserva.
- No se permite reservar una cama ocupada, en mantenimiento o fuera de servicio.
- No se aceptan fechas inválidas ni reservas superpuestas.
- El huésped puede cancelar reservas futuras cuando las reglas lo permiten.

### Habitaciones y camas

- Se pueden consultar habitaciones y camas.
- Se pueden crear y modificar habitaciones.
- No se permiten números de habitación duplicados.
- Una habitación o cama desactivada no debe aparecer como disponible.
- Las amenities asociadas deben visualizarse correctamente.

### Portal del huésped

- El huésped puede consultar sus datos personales.
- Puede visualizar próximas estadías y reservas anteriores.
- Si no tiene reservas, se muestra un mensaje informativo.
- No puede consultar información de otros huéspedes.
- El cierre de sesión elimina el token almacenado.

## 6. Lote de pruebas de aceptación

### Administrador

- Puede gestionar empleados, habitaciones, camas, reservas e informes.
- Puede modificar estados y consultar la información operativa.

### Recepcionista

- Puede iniciar sesión.
- Puede consultar disponibilidad.
- Puede registrar, modificar y cancelar reservas.
- Puede consultar los datos de los huéspedes.
- No puede realizar funciones exclusivas del administrador.

### Huésped

- Puede registrarse e iniciar sesión.
- Puede consultar sus reservas.
- Puede cancelar una reserva permitida.
- No puede acceder a información de otros usuarios.

## 7. Lote de pruebas de seguridad

| ID | Prueba | Resultado esperado |
|---|---|---|
| SEC-01 | Acceder sin JWT | HTTP 401 |
| SEC-02 | Utilizar un JWT inválido o vencido | Acceso denegado |
| SEC-03 | Usar un JWT de huésped en una función administrativa | HTTP 403 |
| SEC-04 | Introducir código SQL en formularios | No se ejecuta como SQL |
| SEC-05 | Consultar datos de otro huésped | La información permanece protegida |
| SEC-06 | Modificar el rol desde el navegador | El backend mantiene los permisos reales |
| SEC-07 | Registrar un email duplicado | La operación es rechazada |

## 8. Lote de pruebas de regresión

Después de cada modificación se deben repetir, como mínimo, las siguientes pruebas:

1. Inicio de sesión correcto e incorrecto.
2. Registro de huésped.
3. Consulta de países.
4. Consulta del usuario autenticado.
5. Acceso al portal del huésped.
6. Cierre de sesión.
7. Consulta de habitaciones y camas.
8. Creación y cancelación de reservas.
9. Validación de permisos de administrador y recepción.
10. Verificación de la comunicación entre frontend, API y base de datos.

## 9. Criterios de aprobación

El sistema se considerará aprobado cuando:

- Las pruebas críticas de autenticación sean satisfactorias.
- Se respeten los permisos de cada rol.
- No se permitan reservas superpuestas o de camas no disponibles.
- Los datos se guarden correctamente en SQL Server.
- Se validen duplicados y campos obligatorios.
- El huésped solo pueda consultar su propia información.
- Los errores se informen claramente.
- Las pruebas de regresión principales no presenten fallas.

## 10. Observación sobre el estado actual

Las funciones de autenticación, registro, consulta del usuario, portal del huésped y carga de datos de habitaciones pueden probarse con la implementación actual.

Las funciones de disponibilidad real, reservas completas, check-in, check-out, informes y mantenimiento deben considerarse pendientes hasta que sus endpoints y pantallas estén completamente implementados.
