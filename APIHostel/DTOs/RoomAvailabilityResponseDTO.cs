namespace APIHostel.DTOs
{
    public class RoomAvailabilityResponseDTO
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string RoomTypeName { get; set; } = string.Empty;
        public decimal PricePerNight { get; set; }
        public int AvailableBedCount { get; set; }
    }
}
