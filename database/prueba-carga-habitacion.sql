USE HOTEL_BOOKINGS;
GO

/* =====================================================================
   CARGA DE DATOS: TIPOS DE HABITACIÓN
   ===================================================================== */
-- Se verifica si ya existen datos para no duplicar en caso de ejecutar el script más de una vez
IF NOT EXISTS (SELECT 1 FROM dbo.ROOM_TYPES)
BEGIN
    INSERT INTO dbo.ROOM_TYPES (type_name, [description])
    VALUES 
        (N'Dormitorio Femenino', N'Habitación compartida exclusiva para mujeres, baño compartido.'),
        (N'Dormitorio Mixto', N'Habitación compartida para hombres y mujeres, baño compartido.'),
        (N'Privada Doble', N'Habitación privada con una cama matrimonial y baño en suite.'),
        (N'Privada Simple', N'Habitación privada individual con baño compartido.');
    
    PRINT 'Tipos de habitación cargados exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla ROOM_TYPES ya contiene datos. Omitiendo carga.';
END
GO

/* =====================================================================
   CARGA DE DATOS: HABITACIONES (ROOMS)
   ===================================================================== */
IF NOT EXISTS (SELECT 1 FROM dbo.ROOMS)
BEGIN
    -- Declaramos variables para capturar los IDs de los tipos de habitación,
    -- ya que son autoincrementales (IDENTITY) y no sabemos exactamente qué número tendrán.
    DECLARE @IdFem INT = (SELECT room_type_id FROM dbo.ROOM_TYPES WHERE type_name = N'Dormitorio Femenino');
    DECLARE @IdMix INT = (SELECT room_type_id FROM dbo.ROOM_TYPES WHERE type_name = N'Dormitorio Mixto');
    DECLARE @IdDoble INT = (SELECT room_type_id FROM dbo.ROOM_TYPES WHERE type_name = N'Privada Doble');
    DECLARE @IdSimple INT = (SELECT room_type_id FROM dbo.ROOM_TYPES WHERE type_name = N'Privada Simple');

    -- Insertamos las habitaciones asociándolas a su tipo correspondiente
    INSERT INTO dbo.ROOMS (room_number, room_type_id, [floor], price_per_night)
    VALUES 
        (N'101', @IdDoble, 1, 25000.00), -- Privada Matrimonial en PB
        (N'102', @IdSimple, 1, 15000.00), -- Privada Simple en PB
        (N'201', @IdMix, 2, 8000.00),     -- Dormitorio Mixto en piso 1
        (N'202', @IdFem, 2, 9000.00),     -- Dormitorio Femenino en piso 1
        (N'301', @IdMix, 3, 7500.00);     -- Dormitorio Mixto en piso 2

    PRINT 'Habitaciones cargadas exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla ROOMS ya contiene datos. Omitiendo carga.';
END
GO