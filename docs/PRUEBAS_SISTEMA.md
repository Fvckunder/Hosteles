# Pruebas del sistema

## 1. Niveles de prueba

El sistema se verificará mediante pruebas unitarias, de integración, de sistema, de aceptación, de seguridad y de regresión.

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

| ID | Caso de prueba | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| UT-01 | Validar campos obligatorios del login | Correo o contraseña vacíos | Se informa el campo faltante | Pendiente |
| UT-02 | Ingresar con credenciales válidas | Usuario y contraseña correctos | Se genera un token JWT | Pendiente |
| UT-03 | Ingresar con credenciales incorrectas | Contraseña inválida | Se rechaza el acceso | Pendiente |
| UT-04 | Validar formato del correo | `usuario-invalido` | Se rechaza el formato | Pendiente |
| UT-05 | Registrar huésped válido | Datos personales completos | Se crea la cuenta | Pendiente |
| UT-06 | Registrar datos duplicados | Email o documento existente | Se rechaza el registro | Pendiente |
| UT-07 | Buscar habitación existente | Número `101` | Se devuelven sus datos | Pendiente |
| UT-08 | Consultar camas disponibles | Habitación con camas libres | Solo se muestran camas disponibles | Pendiente |
| UT-09 | Usar cama en mantenimiento | Cama con estado `Maintenance` | La operación es rechazada | Pendiente |

## 4. Lote de pruebas de integración

| ID | Caso de prueba | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| IT-01 | Ejecutar login | `POST /api/Auth/Login` con credenciales válidas | La API valida el usuario y devuelve JWT | Pendiente |
| IT-02 | Consultar países | `GET /api/Auth/Countries` | Se devuelve la información de SQL Server | Pendiente |
| IT-03 | Registrar huésped | `POST /api/Auth/RegisterGuest` con datos válidos | Se guardan el usuario y su perfil | Pendiente |
| IT-04 | Consultar usuario autenticado | `GET /api/Auth/Me` con JWT válido | Se devuelven los datos del usuario | Pendiente |
| IT-05 | Registrar empleado | `POST /api/Auth/RegisterEmployee` como administrador | Se crea el empleado con su rol | Pendiente |
| IT-06 | Consultar portal del huésped | `GET /api/GuestPortal` con JWT de huésped | Se devuelve el perfil y sus reservas | Pendiente |
| IT-07 | Consultar endpoint protegido sin token | Petición sin encabezado Authorization | Se devuelve HTTP 401 | Pendiente |
| IT-08 | Ejecutar scripts de base de datos | `DBHostel.sql` y script de datos | Se crea y carga correctamente la base | Pendiente |
| IT-09 | Repetir carga de datos | Ejecutar dos veces el script de prueba | No se duplican los registros | Pendiente |
| IT-10 | Probar frontend sin API | Detener el backend y abrir el portal | Se muestra un mensaje de conexión | Pendiente |

## 5. Lote de pruebas de sistema

| ID | Módulo | Caso de prueba | Entrada o procedimiento | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|---|
| ST-01 | Acceso | Login de administrador | Ingresar como `admin@hostel.com` | Se muestra el panel administrativo | Pendiente |
| ST-02 | Acceso | Login de recepción | Ingresar como `recepcion@hostel.com` | Se muestra el panel de recepción | Pendiente |
| ST-03 | Acceso | Login inválido | Usar credenciales incorrectas | Se rechaza el acceso | Pendiente |
| ST-04 | Acceso | Acceso sin sesión | Abrir una pantalla protegida | Se redirige al login | Pendiente |
| ST-05 | Roles | Acceso de huésped a administración | Intentar abrir una función administrativa | Se deniega el acceso | Pendiente |
| ST-06 | Registro | Registrar huésped válido | Completar todos los campos requeridos | Se crea la cuenta | Pendiente |
| ST-07 | Registro | Registro incompleto | Dejar campos obligatorios vacíos | Se muestran mensajes de validación | Pendiente |
| ST-08 | Registro | Email o documento duplicado | Utilizar datos ya registrados | Se rechaza el registro | Pendiente |
| ST-09 | Registro | Protección de contraseña | Registrar una contraseña | Se almacena mediante hash | Pendiente |
| ST-10 | Reservas | Crear reserva | Seleccionar fechas y cama disponible | Se crea una reserva `Pending` | Pendiente |
| ST-11 | Reservas | Confirmar reserva | Cambiar una reserva pendiente | El estado pasa a `Confirmed` | Pendiente |
| ST-12 | Reservas | Cancelar reserva | Cancelar una reserva permitida | El estado pasa a `Cancelled` | Pendiente |
| ST-13 | Reservas | Completar reserva | Registrar la salida del huésped | El estado pasa a `Completed` | Pendiente |
| ST-14 | Reservas | Reservar cama no disponible | Seleccionar cama ocupada o fuera de servicio | El sistema impide la reserva | Pendiente |
| ST-15 | Reservas | Fechas inválidas | Usar salida anterior a la entrada | Se rechaza la reserva | Pendiente |
| ST-16 | Reservas | Reservas superpuestas | Reservar la misma cama y fechas | Se impide la duplicación | Pendiente |
| ST-17 | Habitaciones | Consultar inventario | Abrir el módulo de habitaciones | Se muestran habitaciones y camas | Pendiente |
| ST-18 | Habitaciones | Crear habitación | Cargar número, tipo, piso y precio | Se guarda la habitación | Pendiente |
| ST-19 | Habitaciones | Número duplicado | Crear otra habitación `101` | Se rechaza el duplicado | Pendiente |
| ST-20 | Habitaciones | Cambiar estado de cama | Marcar una cama como mantenimiento | Deja de estar disponible | Pendiente |
| ST-21 | Portal | Consultar perfil | Ingresar como huésped | Se muestran sus datos personales | Pendiente |
| ST-22 | Portal | Consultar reservas | Ingresar con reservas registradas | Se muestran próximas y anteriores | Pendiente |
| ST-23 | Portal | Huésped sin reservas | Ingresar con una cuenta sin reservas | Se muestra un mensaje informativo | Pendiente |
| ST-24 | Portal | Consultar datos ajenos | Intentar modificar el identificador | No se permite acceder a otro huésped | Pendiente |
| ST-25 | Sesión | Cerrar sesión | Presionar el botón de salida | Se elimina el token y se vuelve al login | Pendiente |

## 6. Lote de pruebas de aceptación

| ID | Perfil | Criterio de aceptación | Entrada o procedimiento | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|---|
| AT-01 | Administrador | Gestionar empleados | Crear y consultar usuarios | Puede administrar empleados | Pendiente |
| AT-02 | Administrador | Gestionar habitaciones y camas | Crear o modificar inventario | Los cambios se guardan correctamente | Pendiente |
| AT-03 | Administrador | Consultar información operativa | Abrir reservas e informes | Se muestra la información disponible | Pendiente |
| AT-04 | Recepcionista | Iniciar sesión | Usar credenciales de recepción | Accede a su panel | Pendiente |
| AT-05 | Recepcionista | Gestionar reservas | Crear, modificar o cancelar una reserva | La operación se completa correctamente | Pendiente |
| AT-06 | Recepcionista | Consultar huéspedes | Buscar un huésped registrado | Se muestran sus datos autorizados | Pendiente |
| AT-07 | Recepcionista | Restringir funciones administrativas | Intentar administrar empleados | Se deniega la operación | Pendiente |
| AT-08 | Huésped | Registrarse e iniciar sesión | Completar el registro y acceder | Ingresa al portal | Pendiente |
| AT-09 | Huésped | Consultar reservas | Abrir el portal | Visualiza sus reservas | Pendiente |
| AT-10 | Huésped | Cancelar reserva permitida | Cancelar una reserva futura | La reserva se cancela | Pendiente |
| AT-11 | Huésped | Proteger información | Intentar consultar otro usuario | El acceso es rechazado | Pendiente |

## 7. Lote de pruebas de seguridad

| ID | Caso de prueba | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| SEC-01 | Acceso sin JWT | Petición a endpoint protegido sin token | Se devuelve HTTP 401 | Pendiente |
| SEC-02 | JWT inválido o vencido | Token incorrecto o expirado | Se deniega el acceso | Pendiente |
| SEC-03 | Rol insuficiente | JWT de huésped en función administrativa | Se devuelve HTTP 403 | Pendiente |
| SEC-04 | Inyección SQL | Código SQL en campos del formulario | No se ejecuta como SQL | Pendiente |
| SEC-05 | Acceso a datos ajenos | Solicitar información de otro huésped | La información permanece protegida | Pendiente |
| SEC-06 | Modificar rol en el navegador | Alterar datos del frontend | El backend conserva los permisos reales | Pendiente |
| SEC-07 | Email duplicado | Registrar un correo existente | La operación es rechazada | Pendiente |

## 8. Lote de pruebas de regresión

| ID | Funcionalidad | Entrada o procedimiento | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| REG-01 | Autenticación | Login correcto e incorrecto | Se mantienen las validaciones | Pendiente |
| REG-02 | Registro | Registrar un huésped | La cuenta se crea correctamente | Pendiente |
| REG-03 | Países | Consultar la lista de países | Se muestran los países disponibles | Pendiente |
| REG-04 | Usuario autenticado | Consultar `/api/Auth/Me` | Se devuelve el usuario correcto | Pendiente |
| REG-05 | Portal | Abrir el portal del huésped | Se cargan perfil y reservas | Pendiente |
| REG-06 | Cierre de sesión | Eliminar la sesión | Se borra el token | Pendiente |
| REG-07 | Habitaciones | Consultar habitaciones y camas | Se muestra el inventario correcto | Pendiente |
| REG-08 | Reservas | Crear y cancelar una reserva | Se actualizan los estados | Pendiente |
| REG-09 | Permisos | Probar roles de administrador y recepción | Se respetan las restricciones | Pendiente |
| REG-10 | Integración | Verificar frontend, API y base de datos | La comunicación continúa funcionando | Pendiente |

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
