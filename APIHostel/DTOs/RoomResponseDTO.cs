namespace APIHostel.DTOs
{
    public class RoomResponseDTO
    {
        public int RoomId { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public int RoomTypeId { get; set; }
        public string RoomTypeName { get; set; } = string.Empty;
        public short Floor { get; set; }
        public decimal PricePerNight { get; set; }
        public int BedCount { get; set; }
        public bool Active { get; set; }
        public List<int> AmenityIds { get; set; } = new List<int>();
        public List<string> Amenities { get; set; } = new List<string>();
    }
}