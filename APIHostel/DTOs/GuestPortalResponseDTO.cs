namespace APIHostel.DTOs
{
    /// <summary>
    /// Guest-facing profile and stay data. The controller builds this from the authenticated
    /// guest relationship so one account can never request another guest's reservations.
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

    /// <summary>Only the reservation details needed for a guest to review their stays.</summary>
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