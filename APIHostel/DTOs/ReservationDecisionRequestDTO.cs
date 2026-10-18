using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    public class ReservationDecisionRequestDTO
    {
        [Required]
        public string Decision { get; set; } = string.Empty;
    }
}
