namespace APIHostel.DTOs
{
    // Input model for creating a new room. The room number is unique across the
    // property; the room type must exist in the ROOM_TYPES catalog.
    public class CreateRoomRequestDTO
    {
        public string RoomNumber { get; set; } = string.Empty;
        public int RoomTypeId { get; set; }
        public short Floor { get; set; }
        public decimal PricePerNight { get; set; }
        public List<int> AmenityIds { get; set; } = new List<int>();
    }
}