namespace APIHostel.DTOs
{
    using System.ComponentModel.DataAnnotations;

    public class CreateRoomRequestDTO
    {
        [Required, StringLength(10)]
        public string RoomNumber { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int RoomTypeId { get; set; }

        [Range(0, short.MaxValue)]
        public short Floor { get; set; }

        [Range(typeof(decimal), "0.01", "99999999.99")]
        public decimal PricePerNight { get; set; }

        [Range(1, short.MaxValue)]
        public int BedCount { get; set; }

        [Required]
        public List<int> AmenityIds { get; set; } = new List<int>();
    }
}