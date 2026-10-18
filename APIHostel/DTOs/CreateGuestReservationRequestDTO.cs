using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    public class CreateGuestReservationRequestDTO
    {
        [Range(1, int.MaxValue)]
        public int RoomId { get; set; }

        [Range(1, short.MaxValue)]
        public int BedCount { get; set; }

        public DateOnly CheckIn { get; set; }
        public DateOnly CheckOut { get; set; }
    }
}
