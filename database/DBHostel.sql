/* =====================================================================
   HOSTEL BOOKING SYSTEM (POR CAMA)
   Modelo normalizado en 3FN
   Convencion: tablas EN_PLURAL_MAYUSCULAS, campos snake_case en minusculas
   ===================================================================== */

IF DB_ID(N'HOTEL_BOOKINGS') IS NULL
    CREATE DATABASE HOTEL_BOOKINGS;
GO

USE HOTEL_BOOKINGS;
GO

/* ---------------------------------------------------------------------
   1. SEGURIDAD: roles y usuarios del sistema
   --------------------------------------------------------------------- */
CREATE TABLE dbo.ROLES (
    role_id   INT IDENTITY(1,1) NOT NULL,
    role_name NVARCHAR(50)      NOT NULL,
    CONSTRAINT PK_ROLES           PRIMARY KEY (role_id),
    CONSTRAINT UQ_ROLES_ROLE_NAME UNIQUE (role_name)
);
GO

CREATE TABLE dbo.USERS (
    user_id       INT IDENTITY(1,1) NOT NULL,
    role_id       INT               NOT NULL,
    first_name    NVARCHAR(100)     NOT NULL,
    last_name     NVARCHAR(100)     NOT NULL,
    email         NVARCHAR(255)     NOT NULL,
    password_hash VARCHAR(255)      NOT NULL,   -- guardar siempre el hash, nunca la contrasena
    active        BIT               NOT NULL CONSTRAINT DF_USERS_ACTIVE DEFAULT (1),
    CONSTRAINT PK_USERS       PRIMARY KEY (user_id),
    CONSTRAINT UQ_USERS_EMAIL UNIQUE (email),
    CONSTRAINT FK_USERS_ROLES FOREIGN KEY (role_id) REFERENCES dbo.ROLES (role_id)
);
GO

/* ---------------------------------------------------------------------
   2. HUESPEDES
   --------------------------------------------------------------------- */
CREATE TABLE dbo.COUNTRIES (
    country_id   INT IDENTITY(1,1) NOT NULL,
    country_name NVARCHAR(100)     NOT NULL,
    CONSTRAINT PK_COUNTRIES              PRIMARY KEY (country_id),
    CONSTRAINT UQ_COUNTRIES_COUNTRY_NAME UNIQUE (country_name)
);
GO

CREATE TABLE dbo.GUESTS (
    guest_id   INT IDENTITY(1,1) NOT NULL,
    user_id    INT               NULL,   -- cuenta opcional para iniciar sesion y reservar online
    first_name NVARCHAR(100)     NOT NULL,
    last_name  NVARCHAR(100)     NOT NULL,
    dni        NVARCHAR(20)      NULL,
    passport   NVARCHAR(20)      NULL,   -- texto: los pasaportes pueden tener letras y ceros a la izquierda
    email      NVARCHAR(255)     NULL,
    phone      NVARCHAR(30)      NULL,
    active     BIT               NOT NULL CONSTRAINT DF_GUESTS_ACTIVE DEFAULT (1),
    country_id INT               NOT NULL,
    CONSTRAINT PK_GUESTS           PRIMARY KEY (guest_id),
    CONSTRAINT FK_GUESTS_COUNTRIES FOREIGN KEY (country_id) REFERENCES dbo.COUNTRIES (country_id),
    CONSTRAINT FK_GUESTS_USERS     FOREIGN KEY (user_id)    REFERENCES dbo.USERS (user_id),
    -- dni y passport admiten nulos, pero al menos uno debe estar cargado
    CONSTRAINT CK_GUESTS_DOCUMENT  CHECK (dni IS NOT NULL OR passport IS NOT NULL)
);
GO

-- UNIQUE que permite varios NULL (un UNIQUE normal solo admite un NULL en SQL Server)
CREATE UNIQUE INDEX UX_GUESTS_DNI      ON dbo.GUESTS (dni)      WHERE dni      IS NOT NULL;
CREATE UNIQUE INDEX UX_GUESTS_PASSPORT ON dbo.GUESTS (passport) WHERE passport IS NOT NULL;
-- un usuario corresponde como maximo a un huesped (y varios huespedes pueden no tener cuenta)
CREATE UNIQUE INDEX UX_GUESTS_USER_ID  ON dbo.GUESTS (user_id)  WHERE user_id  IS NOT NULL;
GO

/* ---------------------------------------------------------------------
   3. HABITACIONES, CAMAS Y SERVICIOS
   --------------------------------------------------------------------- */
CREATE TABLE dbo.ROOM_TYPES (
    room_type_id INT IDENTITY(1,1) NOT NULL,
    type_name    NVARCHAR(50)      NOT NULL,
    [description] NVARCHAR(255)    NULL,
    CONSTRAINT PK_ROOM_TYPES           PRIMARY KEY (room_type_id),
    CONSTRAINT UQ_ROOM_TYPES_TYPE_NAME UNIQUE (type_name)
);
GO

CREATE TABLE dbo.ROOMS (
    room_id         INT IDENTITY(1,1) NOT NULL,
    room_number     NVARCHAR(10)      NOT NULL,
    room_type_id    INT               NOT NULL,
    [floor]         SMALLINT          NOT NULL,
    price_per_night DECIMAL(10,2)     NOT NULL,
    active          BIT               NOT NULL CONSTRAINT DF_ROOMS_ACTIVE DEFAULT (1),
    CONSTRAINT PK_ROOMS             PRIMARY KEY (room_id),
    CONSTRAINT UQ_ROOMS_ROOM_NUMBER UNIQUE (room_number),
    CONSTRAINT FK_ROOMS_ROOM_TYPES  FOREIGN KEY (room_type_id) REFERENCES dbo.ROOM_TYPES (room_type_id),
    CONSTRAINT CK_ROOMS_PRICE       CHECK (price_per_night > 0)
);
GO

CREATE TABLE dbo.BED_STATUSES (
    bed_status_id INT IDENTITY(1,1) NOT NULL,
    status_name   NVARCHAR(50)      NOT NULL,
    CONSTRAINT PK_BED_STATUSES             PRIMARY KEY (bed_status_id),
    CONSTRAINT UQ_BED_STATUSES_STATUS_NAME UNIQUE (status_name)
);
GO

CREATE TABLE dbo.BEDS (
    bed_id        INT IDENTITY(1,1) NOT NULL,
    room_id       INT               NOT NULL,
    bed_number    SMALLINT          NOT NULL,
    bed_status_id INT               NOT NULL,
    active        BIT               NOT NULL CONSTRAINT DF_BEDS_ACTIVE DEFAULT (1),
    CONSTRAINT PK_BEDS              PRIMARY KEY (bed_id),
    CONSTRAINT UQ_BEDS_ROOM_NUMBER  UNIQUE (room_id, bed_number),
    CONSTRAINT FK_BEDS_ROOMS        FOREIGN KEY (room_id)       REFERENCES dbo.ROOMS (room_id),
    CONSTRAINT FK_BEDS_BED_STATUSES FOREIGN KEY (bed_status_id) REFERENCES dbo.BED_STATUSES (bed_status_id)
);
GO

CREATE TABLE dbo.AMENITIES (
    amenity_id   INT IDENTITY(1,1) NOT NULL,
    amenity_name NVARCHAR(100)     NOT NULL,
    active       BIT               NOT NULL CONSTRAINT DF_AMENITIES_ACTIVE DEFAULT (1),
    CONSTRAINT PK_AMENITIES              PRIMARY KEY (amenity_id),
    CONSTRAINT UQ_AMENITIES_AMENITY_NAME UNIQUE (amenity_name)
);
GO

CREATE TABLE dbo.ROOM_AMENITIES (
    room_id    INT NOT NULL,
    amenity_id INT NOT NULL,
    CONSTRAINT PK_ROOM_AMENITIES           PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT FK_ROOM_AMENITIES_ROOMS     FOREIGN KEY (room_id)    REFERENCES dbo.ROOMS (room_id) ON DELETE CASCADE,
    CONSTRAINT FK_ROOM_AMENITIES_AMENITIES FOREIGN KEY (amenity_id) REFERENCES dbo.AMENITIES (amenity_id)
);
GO

/* ---------------------------------------------------------------------
   4. RESERVAS
   --------------------------------------------------------------------- */
CREATE TABLE dbo.RESERVATION_STATUSES (
    reservation_status_id INT IDENTITY(1,1) NOT NULL,
    status_name           NVARCHAR(50)      NOT NULL,
    CONSTRAINT PK_RESERVATION_STATUSES             PRIMARY KEY (reservation_status_id),
    CONSTRAINT UQ_RESERVATION_STATUSES_STATUS_NAME UNIQUE (status_name)
);
GO

CREATE TABLE dbo.RESERVATIONS (
    reservation_id        INT IDENTITY(1,1) NOT NULL,
    guest_id              INT               NOT NULL,
    check_in              DATE              NOT NULL,
    check_out             DATE              NOT NULL,
    reserved_at           DATETIME2(0)      NOT NULL CONSTRAINT DF_RESERVATIONS_RESERVED_AT DEFAULT (SYSDATETIME()),
    reservation_status_id INT               NOT NULL,
    CONSTRAINT PK_RESERVATIONS                   PRIMARY KEY (reservation_id),
    CONSTRAINT FK_RESERVATIONS_GUESTS            FOREIGN KEY (guest_id) REFERENCES dbo.GUESTS (guest_id),
    CONSTRAINT FK_RESERVATIONS_RESERVATION_STATUSES
        FOREIGN KEY (reservation_status_id) REFERENCES dbo.RESERVATION_STATUSES (reservation_status_id),
    CONSTRAINT CK_RESERVATIONS_DATES             CHECK (check_out > check_in)
);
GO

CREATE TABLE dbo.RESERVATION_BEDS (
    reservation_id INT NOT NULL,
    bed_id         INT NOT NULL,
    CONSTRAINT PK_RESERVATION_BEDS              PRIMARY KEY (reservation_id, bed_id),
    CONSTRAINT FK_RESERVATION_BEDS_RESERVATIONS FOREIGN KEY (reservation_id) REFERENCES dbo.RESERVATIONS (reservation_id) ON DELETE CASCADE,
    CONSTRAINT FK_RESERVATION_BEDS_BEDS         FOREIGN KEY (bed_id)         REFERENCES dbo.BEDS (bed_id)
);
GO

/* Indices para las FK mas consultadas */
CREATE INDEX IX_USERS_ROLE_ID                  ON dbo.USERS (role_id);
CREATE INDEX IX_GUESTS_COUNTRY_ID              ON dbo.GUESTS (country_id);
CREATE INDEX IX_ROOMS_ROOM_TYPE_ID             ON dbo.ROOMS (room_type_id);
CREATE INDEX IX_BEDS_BED_STATUS_ID             ON dbo.BEDS (bed_status_id);
CREATE INDEX IX_RESERVATIONS_GUEST_ID          ON dbo.RESERVATIONS (guest_id);
CREATE INDEX IX_RESERVATIONS_DATES             ON dbo.RESERVATIONS (check_in, check_out);
CREATE INDEX IX_RESERVATION_BEDS_BED_ID        ON dbo.RESERVATION_BEDS (bed_id);
CREATE INDEX IX_ROOM_AMENITIES_AMENITY_ID      ON dbo.ROOM_AMENITIES (amenity_id);
GO

/* ---------------------------------------------------------------------
   5. REGLA DE NEGOCIO: una cama no puede reservarse dos veces en
      fechas que se superponen (se ignoran las reservas canceladas)
   --------------------------------------------------------------------- */
CREATE OR ALTER TRIGGER dbo.TR_RESERVATION_BEDS_NO_OVERLAP
ON dbo.RESERVATION_BEDS
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN dbo.RESERVATIONS         rn ON rn.reservation_id = i.reservation_id
        JOIN dbo.RESERVATION_STATUSES sn ON sn.reservation_status_id = rn.reservation_status_id
        JOIN dbo.RESERVATION_BEDS     rb ON rb.bed_id = i.bed_id AND rb.reservation_id <> i.reservation_id
        JOIN dbo.RESERVATIONS         ro ON ro.reservation_id = rb.reservation_id
        JOIN dbo.RESERVATION_STATUSES so ON so.reservation_status_id = ro.reservation_status_id
        WHERE sn.status_name <> N'Cancelled'
          AND so.status_name <> N'Cancelled'
          AND rn.check_in < ro.check_out
          AND ro.check_in < rn.check_out
    )
    BEGIN
        RAISERROR (N'The bed is already reserved for those dates.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

/* ---------------------------------------------------------------------
   6. VISTAS PARA LOS ATRIBUTOS DERIVADOS (se eliminaron de las tablas)
   --------------------------------------------------------------------- */
-- Capacidad de cada habitacion = cantidad de camas
CREATE OR ALTER VIEW dbo.V_ROOM_CAPACITIES
AS
SELECT r.room_id, r.room_number, COUNT(b.bed_id) AS capacity
FROM dbo.ROOMS r
LEFT JOIN dbo.BEDS b ON b.room_id = r.room_id
GROUP BY r.room_id, r.room_number;
GO

-- Total de la reserva = noches x precio por noche de cada habitacion distinta reservada
-- (supuesto: si se reservan varias camas de una misma habitacion, la habitacion se cobra una vez)
CREATE OR ALTER VIEW dbo.V_RESERVATION_TOTALS
AS
SELECT r.reservation_id,
       DATEDIFF(DAY, r.check_in, r.check_out)                         AS nights,
       SUM(rm.price_per_night) * DATEDIFF(DAY, r.check_in, r.check_out) AS total
FROM dbo.RESERVATIONS r
JOIN (SELECT DISTINCT rb.reservation_id, b.room_id
      FROM dbo.RESERVATION_BEDS rb
      JOIN dbo.BEDS b ON b.bed_id = rb.bed_id) x ON x.reservation_id = r.reservation_id
JOIN dbo.ROOMS rm ON rm.room_id = x.room_id
GROUP BY r.reservation_id, r.check_in, r.check_out;
GO

/* ---------------------------------------------------------------------
   7. DATOS INICIALES DE CATALOGOS
   --------------------------------------------------------------------- */
INSERT INTO dbo.ROLES (role_name) VALUES (N'Admin'), (N'Receptionist'), (N'Guest');

INSERT INTO dbo.RESERVATION_STATUSES (status_name)
VALUES (N'Pending'), (N'Confirmed'), (N'Cancelled'), (N'Completed');

INSERT INTO dbo.BED_STATUSES (status_name)
VALUES (N'Available'), (N'Maintenance'), (N'Out of service');

INSERT INTO dbo.COUNTRIES (country_name)
VALUES (N'Argentina'), (N'Brazil'), (N'Chile'), (N'Paraguay'), (N'Uruguay');
GO
