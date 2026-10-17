namespace APIHostel.DTOs
{
    /// <summary>
    /// Datos del perfil y de las estancias visibles para el huésped. El controlador los obtiene
    /// de la relación con el huésped autenticado, de modo que una cuenta nunca pueda solicitar
    /// las reservas de otro huésped.
    /// </summary>
    public class GuestPortalResponseDTO
    {
        public int GuestId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string CountryName { get; set; } = string.Empty;
        public List<GuestReservationDTO> Reservations { get; set; } = new();
    }

    /// <summary>Solo los datos de la reserva que necesita el huésped para consultar sus estancias.</summary>
    public class GuestReservationDTO
    {
        public int ReservationId { get; set; }
        public DateOnly CheckIn { get; set; }
        public DateOnly CheckOut { get; set; }
        public int Nights { get; set; }
        public string Status { get; set; } = string.Empty;
        public string[] RoomNumbers { get; set; } = Array.Empty<string>();
        public int BedCount { get; set; }
        public decimal? Total { get; set; }
    }
}