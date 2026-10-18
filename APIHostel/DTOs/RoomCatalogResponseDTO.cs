namespace APIHostel.DTOs
{
    public class RoomCatalogResponseDTO
    {
        public List<RoomTypeOptionDTO> RoomTypes { get; set; } = new();
        public List<AmenityOptionDTO> Amenities { get; set; } = new();
    }

    public class RoomTypeOptionDTO
    {
        public int RoomTypeId { get; set; }
        public string TypeName { get; set; } = string.Empty;
    }

    public class AmenityOptionDTO
    {
        public int AmenityId { get; set; }
        public string AmenityName { get; set; } = string.Empty;
    }
}
