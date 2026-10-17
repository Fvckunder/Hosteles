using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    public class PasswordResetEmailRequestDTO
    {
        [Required, EmailAddress, StringLength(255)]
        public string Email { get; set; } = string.Empty;
    }
}
