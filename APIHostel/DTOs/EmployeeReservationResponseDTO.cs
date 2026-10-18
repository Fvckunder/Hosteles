namespace APIHostel.DTOs
{
    public class EmployeeReservationResponseDTO
    {
        public int ReservationId { get; set; }
        public string GuestName { get; set; } = string.Empty;
        public string GuestEmail { get; set; } = string.Empty;
        public DateOnly CheckIn { get; set; }
        public DateOnly CheckOut { get; set; }
        public int BedCount { get; set; }
        public string[] RoomNumbers { get; set; } = Array.Empty<string>();
        public decimal? Total { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
