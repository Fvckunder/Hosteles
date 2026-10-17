namespace APIHostel.DTOs
{
    // Input model for editing an existing room. Includes the amenities list so the
    // admin can add or remove them; the room type can be changed but the room number
    // must remain unique across the property.
    public class UpdateRoomRequestDTO
    {
        public string RoomNumber { get; set; } = string.Empty;
        public int RoomTypeId { get; set; }
        public short Floor { get; set; }
        public decimal PricePerNight { get; set; }
        public bool Active { get; set; }
        public List<int> AmenityIds { get; set; } = new List<int>();
    }
}