USE HOTEL_BOOKINGS;
GO

/* =====================================================================
   DATOS DE PRUEBA
   Carga inicial de ROOM_TYPES, AMENITIES y algunos ROOMS y USERS
   ===================================================================== */

-- =============================================
-- 1. ROOM_TYPES (Tipos de habitación)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM ROOM_TYPES WHERE type_name = 'Simple')
    INSERT INTO ROOM_TYPES (type_name, description) VALUES 
    (N'Simple', N'Habitación con 1 cama');

IF NOT EXISTS (SELECT 1 FROM ROOM_TYPES WHERE type_name = 'Doble')
    INSERT INTO ROOM_TYPES (type_name, description) VALUES 
    (N'Doble', N'Habitación con 2 camas');

IF NOT EXISTS (SELECT 1 FROM ROOM_TYPES WHERE type_name = 'Triple')
    INSERT INTO ROOM_TYPES (type_name, description) VALUES 
    (N'Triple', N'Habitación con 3 camas');

IF NOT EXISTS (SELECT 1 FROM ROOM_TYPES WHERE type_name = 'Compartida')
    INSERT INTO ROOM_TYPES (type_name, description) VALUES 
    (N'Compartida', N'Habitación compartida de 6 camas');

IF NOT EXISTS (SELECT 1 FROM ROOM_TYPES WHERE type_name = 'Suite')
    INSERT INTO ROOM_TYPES (type_name, description) VALUES 
    (N'Suite', N'Suite con baño privado y sala de estar');
GO

-- =============================================
-- 2. AMENITIES (Comodidades)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM AMENITIES WHERE amenity_name = 'WiFi')
    INSERT INTO AMENITIES (amenity_name) VALUES (N'WiFi');

IF NOT EXISTS (SELECT 1 FROM AMENITIES WHERE amenity_name = 'Desayuno')
    INSERT INTO AMENITIES (amenity_name) VALUES (N'Desayuno');

IF NOT EXISTS (SELECT 1 FROM AMENITIES WHERE amenity_name = 'Aire Acondicionado')
    INSERT INTO AMENITIES (amenity_name) VALUES (N'Aire Acondicionado');

IF NOT EXISTS (SELECT 1 FROM AMENITIES WHERE amenity_name = 'Baño Privado')
    INSERT INTO AMENITIES (amenity_name) VALUES (N'Baño Privado');

IF NOT EXISTS (SELECT 1 FROM AMENITIES WHERE amenity_name = 'Lockers')
    INSERT INTO AMENITIES (amenity_name) VALUES (N'Lockers');

IF NOT EXISTS (SELECT 1 FROM AMENITIES WHERE amenity_name = 'Agua Caliente')
    INSERT INTO AMENITIES (amenity_name) VALUES (N'Agua Caliente');

IF NOT EXISTS (SELECT 1 FROM AMENITIES WHERE amenity_name = 'TV')
    INSERT INTO AMENITIES (amenity_name) VALUES (N'TV');
GO

-- =============================================
-- 3. BED_STATUSES (Estados de cama)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM BED_STATUSES WHERE status_name = 'Available')
    INSERT INTO BED_STATUSES (status_name) VALUES (N'Available');

IF NOT EXISTS (SELECT 1 FROM BED_STATUSES WHERE status_name = 'Maintenance')
    INSERT INTO BED_STATUSES (status_name) VALUES (N'Maintenance');

IF NOT EXISTS (SELECT 1 FROM BED_STATUSES WHERE status_name = 'Out of service')
    INSERT INTO BED_STATUSES (status_name) VALUES (N'Out of service');
GO

-- =============================================
-- 4. RESERVATION_STATUSES (Estados de reserva)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM RESERVATION_STATUSES WHERE status_name = 'Pending')
    INSERT INTO RESERVATION_STATUSES (status_name) VALUES (N'Pending');

IF NOT EXISTS (SELECT 1 FROM RESERVATION_STATUSES WHERE status_name = 'Confirmed')
    INSERT INTO RESERVATION_STATUSES (status_name) VALUES (N'Confirmed');

IF NOT EXISTS (SELECT 1 FROM RESERVATION_STATUSES WHERE status_name = 'Cancelled')
    INSERT INTO RESERVATION_STATUSES (status_name) VALUES (N'Cancelled');

IF NOT EXISTS (SELECT 1 FROM RESERVATION_STATUSES WHERE status_name = 'Completed')
    INSERT INTO RESERVATION_STATUSES (status_name) VALUES (N'Completed');
GO

-- =============================================
-- 5. ROOMS (Habitaciones) - Usando los IDs de ROOM_TYPES
-- =============================================
DECLARE @SimpleId INT = (SELECT room_type_id FROM ROOM_TYPES WHERE type_name = N'Simple');
DECLARE @DobleId INT = (SELECT room_type_id FROM ROOM_TYPES WHERE type_name = N'Doble');
DECLARE @TripleId INT = (SELECT room_type_id FROM ROOM_TYPES WHERE type_name = N'Triple');
DECLARE @CompartidaId INT = (SELECT room_type_id FROM ROOM_TYPES WHERE type_name = N'Compartida');
DECLARE @SuiteId INT = (SELECT room_type_id FROM ROOM_TYPES WHERE type_name = N'Suite');

IF NOT EXISTS (SELECT 1 FROM ROOMS WHERE room_number = '101')
    INSERT INTO ROOMS (room_number, room_type_id, [floor], price_per_night, active)
    VALUES (N'101', @SimpleId, 1, 5000.00, 1);

IF NOT EXISTS (SELECT 1 FROM ROOMS WHERE room_number = '102')
    INSERT INTO ROOMS (room_number, room_type_id, [floor], price_per_night, active)
    VALUES (N'102', @DobleId, 1, 8000.00, 1);

IF NOT EXISTS (SELECT 1 FROM ROOMS WHERE room_number = '103')
    INSERT INTO ROOMS (room_number, room_type_id, [floor], price_per_night, active)
    VALUES (N'103', @TripleId, 1, 11000.00, 1);

IF NOT EXISTS (SELECT 1 FROM ROOMS WHERE room_number = '201')
    INSERT INTO ROOMS (room_number, room_type_id, [floor], price_per_night, active)
    VALUES (N'201', @CompartidaId, 2, 3500.00, 1);

IF NOT EXISTS (SELECT 1 FROM ROOMS WHERE room_number = '202')
    INSERT INTO ROOMS (room_number, room_type_id, [floor], price_per_night, active)
    VALUES (N'202', @SuiteId, 2, 15000.00, 1);
GO

-- =============================================
-- 6. ROOM_AMENITIES (Comodidades por habitación)
-- =============================================
DECLARE @WiFiId INT = (SELECT amenity_id FROM AMENITIES WHERE amenity_name = N'WiFi');
DECLARE @DesayunoId INT = (SELECT amenity_id FROM AMENITIES WHERE amenity_name = N'Desayuno');
DECLARE @AireId INT = (SELECT amenity_id FROM AMENITIES WHERE amenity_name = N'Aire Acondicionado');
DECLARE @BanoId INT = (SELECT amenity_id FROM AMENITIES WHERE amenity_name = N'Baño Privado');
DECLARE @LockersId INT = (SELECT amenity_id FROM AMENITIES WHERE amenity_name = N'Lockers');
DECLARE @AguaId INT = (SELECT amenity_id FROM AMENITIES WHERE amenity_name = N'Agua Caliente');
DECLARE @TvId INT = (SELECT amenity_id FROM AMENITIES WHERE amenity_name = N'TV');

-- Habitación 101 (Simple) → WiFi, Agua Caliente
DECLARE @Room101 INT = (SELECT room_id FROM ROOMS WHERE room_number = '101');
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room101 AND amenity_id = @WiFiId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room101, @WiFiId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room101 AND amenity_id = @AguaId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room101, @AguaId);

-- Habitación 102 (Doble) → WiFi, Desayuno, Aire, TV
DECLARE @Room102 INT = (SELECT room_id FROM ROOMS WHERE room_number = '102');
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room102 AND amenity_id = @WiFiId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room102, @WiFiId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room102 AND amenity_id = @DesayunoId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room102, @DesayunoId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room102 AND amenity_id = @AireId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room102, @AireId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room102 AND amenity_id = @TvId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room102, @TvId);

-- Habitación 201 (Compartida) → WiFi, Lockers, Agua Caliente
DECLARE @Room201 INT = (SELECT room_id FROM ROOMS WHERE room_number = '201');
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room201 AND amenity_id = @WiFiId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room201, @WiFiId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room201 AND amenity_id = @LockersId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room201, @LockersId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room201 AND amenity_id = @AguaId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room201, @AguaId);

-- Habitación 202 (Suite) → todas las comodidades
DECLARE @Room202 INT = (SELECT room_id FROM ROOMS WHERE room_number = '202');
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room202 AND amenity_id = @WiFiId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room202, @WiFiId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room202 AND amenity_id = @DesayunoId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room202, @DesayunoId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room202 AND amenity_id = @AireId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room202, @AireId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room202 AND amenity_id = @BanoId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room202, @BanoId);
IF NOT EXISTS (SELECT 1 FROM ROOM_AMENITIES WHERE room_id = @Room202 AND amenity_id = @TvId)
    INSERT INTO ROOM_AMENITIES (room_id, amenity_id) VALUES (@Room202, @TvId);
GO

-- =============================================
-- 7. BEDS (Camas) - Distribuidas por habitación
-- =============================================
DECLARE @AvailableId INT = (SELECT bed_status_id FROM BED_STATUSES WHERE status_name = N'Available');

-- Habitación 101 (Simple): 1 cama
DECLARE @R101 INT = (SELECT room_id FROM ROOMS WHERE room_number = '101');
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R101 AND bed_number = 1)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R101, 1, @AvailableId, 1);

-- Habitación 102 (Doble): 2 camas
DECLARE @R102 INT = (SELECT room_id FROM ROOMS WHERE room_number = '102');
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R102 AND bed_number = 1)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R102, 1, @AvailableId, 1);
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R102 AND bed_number = 2)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R102, 2, @AvailableId, 1);

-- Habitación 103 (Triple): 3 camas
DECLARE @R103 INT = (SELECT room_id FROM ROOMS WHERE room_number = '103');
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R103 AND bed_number = 1)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R103, 1, @AvailableId, 1);
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R103 AND bed_number = 2)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R103, 2, @AvailableId, 1);
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R103 AND bed_number = 3)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R103, 3, @AvailableId, 1);

-- Habitación 201 (Compartida): 6 camas
DECLARE @R201 INT = (SELECT room_id FROM ROOMS WHERE room_number = '201');
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R201 AND bed_number = 1)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R201, 1, @AvailableId, 1);
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R201 AND bed_number = 2)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R201, 2, @AvailableId, 1);
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R201 AND bed_number = 3)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R201, 3, @AvailableId, 1);
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R201 AND bed_number = 4)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R201, 4, @AvailableId, 1);
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R201 AND bed_number = 5)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R201, 5, @AvailableId, 1);
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R201 AND bed_number = 6)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R201, 6, @AvailableId, 1);

-- Habitación 202 (Suite): 1 cama
DECLARE @R202 INT = (SELECT room_id FROM ROOMS WHERE room_number = '202');
IF NOT EXISTS (SELECT 1 FROM BEDS WHERE room_id = @R202 AND bed_number = 1)
    INSERT INTO BEDS (room_id, bed_number, bed_status_id, active) VALUES (@R202, 1, @AvailableId, 1);
GO

-- =============================================
-- 8. USERS (Empleados del hostel)
-- =============================================
DECLARE @AdminRoleId INT = (SELECT role_id FROM ROLES WHERE role_name = N'Admin');
DECLARE @ReceptionistRoleId INT = (SELECT role_id FROM ROLES WHERE role_name = N'Receptionist');

-- Admin (si no existe)
IF NOT EXISTS (SELECT 1 FROM USERS WHERE email = 'admin@hostel.com')
    INSERT INTO USERS (role_id, first_name, last_name, email, password_hash, active)
    VALUES (@AdminRoleId, N'Admin', N'Sistema', N'admin@hostel.com', 
            '$2a$11$grHizZesqbOTYLGsBRvkieTJAaBUbkaiAANOakAagS9jbGFpbXWcm9sZSI6IkFkbWluIi', 1);

-- Recepcionista de prueba (password: recep123)
IF NOT EXISTS (SELECT 1 FROM USERS WHERE email = 'recepcion@hostel.com')
    INSERT INTO USERS (role_id, first_name, last_name, email, password_hash, active)
    VALUES (@ReceptionistRoleId, N'María', N'Gómez', N'recepcion@hostel.com', 
            '$2a$11$grHizZesqbOTYLGsBRvkieTJAaBUbkaiAANOakAagS9jbGFpbXWcm9sZSI6IkFkbWluIi', 1);

-- Recepcionista de prueba 2 (password: carlos123)
IF NOT EXISTS (SELECT 1 FROM USERS WHERE email = 'carlos@hostel.com')
    INSERT INTO USERS (role_id, first_name, last_name, email, password_hash, active)
    VALUES (@ReceptionistRoleId, N'Carlos', N'López', N'carlos@hostel.com', 
            '$2a$11$grHizZesqbOTYLGsBRvkieTJAaBUbkaiAANOakAagS9jbGFpbXWcm9sZSI6IkFkbWluIi', 1);
GO

-- =============================================
-- VERIFICACIÓN
-- =============================================
SELECT 'ROOM_TYPES' AS Tabla, COUNT(*) AS Registros FROM ROOM_TYPES
UNION ALL
SELECT 'AMENITIES', COUNT(*) FROM AMENITIES
UNION ALL
SELECT 'ROOMS', COUNT(*) FROM ROOMS
UNION ALL
SELECT 'BEDS', COUNT(*) FROM BEDS
UNION ALL
SELECT 'ROOM_AMENITIES', COUNT(*) FROM ROOM_AMENITIES
UNION ALL
SELECT 'USERS', COUNT(*) FROM USERS
UNION ALL
SELECT 'BED_STATUSES', COUNT(*) FROM BED_STATUSES
UNION ALL
SELECT 'RESERVATION_STATUSES', COUNT(*) FROM RESERVATION_STATUSES;
GO