using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    public class PasswordResetRequestDTO
    {
        [Required, EmailAddress, StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, RegularExpression(@"^\d{4}$")]
        public string Code { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(100)]
        public string NewPassword { get; set; } = string.Empty;
    }
}
