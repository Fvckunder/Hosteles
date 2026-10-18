USE HOTEL_BOOKINGS;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    /* ROOM_TYPES: completa los tipos de prueba que todavía no existan. */
    INSERT INTO dbo.ROOM_TYPES (type_name, [description])
    SELECT seed.type_name, seed.[description]
    FROM (VALUES
        (N'Simple', N'Habitación privada para una persona.'),
        (N'Doble', N'Habitación privada con capacidad para dos personas.'),
        (N'Triple', N'Habitación con capacidad para tres personas.'),
        (N'Compartida', N'Dormitorio compartido con varias camas.'),
        (N'Suite', N'Habitación amplia con baño privado.')
    ) AS seed(type_name, [description])
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.ROOM_TYPES existing
        WHERE existing.type_name = seed.type_name
    );

    /* AMENITIES es el catálogo requerido por la tabla puente ROOM_AMENITIES. */
    INSERT INTO dbo.AMENITIES (amenity_name)
    SELECT seed.amenity_name
    FROM (VALUES
        (N'WiFi'),
        (N'Desayuno'),
        (N'Aire Acondicionado'),
        (N'Baño Privado'),
        (N'Lockers'),
        (N'Agua Caliente'),
        (N'TV')
    ) AS seed(amenity_name)
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.AMENITIES existing
        WHERE existing.amenity_name = seed.amenity_name
    );

    /* DBHostel.sql normalmente crea estos estados; se completan si faltan. */
    INSERT INTO dbo.BED_STATUSES (status_name)
    SELECT seed.status_name
    FROM (VALUES
        (N'Available'),
        (N'Maintenance'),
        (N'Out of service')
    ) AS seed(status_name)
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.BED_STATUSES existing
        WHERE existing.status_name = seed.status_name
    );

    /* Habitaciones variadas: tipos, plantas, tarifas y capacidades distintas. */
    INSERT INTO dbo.ROOMS (room_number, room_type_id, [floor], price_per_night, active)
    SELECT seed.room_number, roomType.room_type_id, seed.[floor], seed.price_per_night, 1
    FROM (VALUES
        (N'101', N'Simple',     CONVERT(SMALLINT, 1), CONVERT(DECIMAL(10,2), 18000.00)),
        (N'102', N'Doble',      CONVERT(SMALLINT, 1), CONVERT(DECIMAL(10,2), 26000.00)),
        (N'103', N'Triple',     CONVERT(SMALLINT, 1), CONVERT(DECIMAL(10,2), 33000.00)),
        (N'104', N'Compartida', CONVERT(SMALLINT, 1), CONVERT(DECIMAL(10,2), 12000.00)),
        (N'105', N'Suite',      CONVERT(SMALLINT, 1), CONVERT(DECIMAL(10,2), 42000.00)),
        (N'201', N'Doble',      CONVERT(SMALLINT, 2), CONVERT(DECIMAL(10,2), 28000.00)),
        (N'202', N'Triple',     CONVERT(SMALLINT, 2), CONVERT(DECIMAL(10,2), 35000.00)),
        (N'203', N'Compartida', CONVERT(SMALLINT, 2), CONVERT(DECIMAL(10,2), 13500.00)),
        (N'204', N'Simple',     CONVERT(SMALLINT, 2), CONVERT(DECIMAL(10,2), 19500.00)),
        (N'205', N'Suite',      CONVERT(SMALLINT, 2), CONVERT(DECIMAL(10,2), 46000.00))
    ) AS seed(room_number, type_name, [floor], price_per_night)
    INNER JOIN dbo.ROOM_TYPES roomType ON roomType.type_name = seed.type_name
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.ROOMS existing
        WHERE existing.room_number = seed.room_number
    );

    /* Asigna algunas comodidades a cada habitación. El patrón es reproducible y
       las comprobaciones permiten ejecutar este script más de una vez. */
    ;WITH RoomAmenityCandidates AS
    (
        SELECT room.room_id, amenity.amenity_id,
               ABS(CHECKSUM(CONCAT(room.room_number, N':', amenity.amenity_name)) % 10) AS sample_value
        FROM dbo.ROOMS room
        INNER JOIN (VALUES
            (N'101'), (N'102'), (N'103'), (N'104'), (N'105'),
            (N'201'), (N'202'), (N'203'), (N'204'), (N'205')
        ) AS seed(room_number) ON seed.room_number = room.room_number
        CROSS JOIN dbo.AMENITIES amenity
        WHERE amenity.amenity_name IN (
            N'WiFi', N'Desayuno', N'Aire Acondicionado', N'Baño Privado',
            N'Lockers', N'Agua Caliente', N'TV'
        )
    )
    INSERT INTO dbo.ROOM_AMENITIES (room_id, amenity_id)
    SELECT candidate.room_id, candidate.amenity_id
    FROM RoomAmenityCandidates candidate
    WHERE candidate.sample_value < 5
      AND NOT EXISTS (
          SELECT 1
          FROM dbo.ROOM_AMENITIES existing
          WHERE existing.room_id = candidate.room_id
            AND existing.amenity_id = candidate.amenity_id
      );

    /* Capacidad de camas por habitación: 1, 2, 3 o 6. La primera cama de cada
       habitación queda disponible; las siguientes tienen estados variados. */
    ;WITH RoomBedSeed AS
    (
        SELECT room.room_id, seed.bed_count
        FROM (VALUES
            (N'101', 1), (N'102', 2), (N'103', 3), (N'104', 6), (N'105', 1),
            (N'201', 2), (N'202', 3), (N'203', 6), (N'204', 1), (N'205', 1)
        ) AS seed(room_number, bed_count)
        INNER JOIN dbo.ROOMS room ON room.room_number = seed.room_number
    ),
    BedNumbers AS
    (
        SELECT roomBed.room_id, numbers.bed_number
        FROM RoomBedSeed roomBed
        CROSS JOIN (VALUES
            (CONVERT(SMALLINT, 1)), (CONVERT(SMALLINT, 2)),
            (CONVERT(SMALLINT, 3)), (CONVERT(SMALLINT, 4)),
            (CONVERT(SMALLINT, 5)), (CONVERT(SMALLINT, 6))
        ) AS numbers(bed_number)
        WHERE numbers.bed_number <= roomBed.bed_count
    )
    INSERT INTO dbo.BEDS (room_id, bed_number, bed_status_id, active)
    SELECT bed.room_id,
           bed.bed_number,
           bedStatus.bed_status_id,
           1
    FROM BedNumbers bed
    INNER JOIN dbo.ROOMS room ON room.room_id = bed.room_id
    INNER JOIN dbo.BED_STATUSES bedStatus
        ON bedStatus.status_name =
            CASE
                WHEN bed.bed_number = 1 THEN N'Available'
                WHEN ABS(CHECKSUM(CONCAT(room.room_number, N':', bed.bed_number)) % 10) < 8 THEN N'Available'
                WHEN ABS(CHECKSUM(CONCAT(room.room_number, N':', bed.bed_number)) % 10) = 8 THEN N'Maintenance'
                ELSE N'Out of service'
            END
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.BEDS existing
        WHERE existing.room_id = bed.room_id
          AND existing.bed_number = bed.bed_number
    );

    COMMIT TRANSACTION;
    PRINT N'La carga de tipos, comodidades, estados, habitaciones y camas terminó correctamente.';
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

/* Resumen de los registros cargados para verificar el resultado en SSMS. */
SELECT N'ROOM_TYPES' AS tabla, COUNT(*) AS registros FROM dbo.ROOM_TYPES
UNION ALL
SELECT N'AMENITIES', COUNT(*) FROM dbo.AMENITIES
UNION ALL
SELECT N'BED_STATUSES', COUNT(*) FROM dbo.BED_STATUSES
UNION ALL
SELECT N'ROOMS', COUNT(*) FROM dbo.ROOMS
UNION ALL
SELECT N'ROOM_AMENITIES', COUNT(*) FROM dbo.ROOM_AMENITIES
UNION ALL
SELECT N'BEDS', COUNT(*) FROM dbo.BEDS;
GO

SELECT room.room_number,
       roomType.type_name,
       room.[floor],
       room.price_per_night,
       COUNT(bed.bed_id) AS cantidad_camas,
       SUM(CASE WHEN bedStatus.status_name = N'Available' THEN 1 ELSE 0 END) AS camas_disponibles,
       SUM(CASE WHEN bedStatus.status_name = N'Maintenance' THEN 1 ELSE 0 END) AS camas_en_mantenimiento,
       SUM(CASE WHEN bedStatus.status_name = N'Out of service' THEN 1 ELSE 0 END) AS camas_fuera_de_servicio
FROM dbo.ROOMS room
INNER JOIN dbo.ROOM_TYPES roomType ON roomType.room_type_id = room.room_type_id
LEFT JOIN dbo.BEDS bed ON bed.room_id = room.room_id AND bed.active = 1
LEFT JOIN dbo.BED_STATUSES bedStatus ON bedStatus.bed_status_id = bed.bed_status_id
WHERE room.room_number IN (N'101', N'102', N'103', N'104', N'105',
                           N'201', N'202', N'203', N'204', N'205')
GROUP BY room.room_number, roomType.type_name, room.[floor], room.price_per_night
ORDER BY room.room_number;
GO
