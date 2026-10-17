namespace APIHostel.DTOs
{
    // Read model for the room inventory. Exposes the room type name and the
    // amenity labels so the frontend can render the list without extra lookups.
    public class RoomResponseDTO
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public short Floor { get; set; }
        public decimal PricePerNight { get; set; }
        public bool Active { get; set; }
        public List<string> Amenities { get; set; } = new List<string>();
    }
}