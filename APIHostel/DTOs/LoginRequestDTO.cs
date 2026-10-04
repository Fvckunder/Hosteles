using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    /// <summary>Credentials accepted by the shared guest and employee login endpoint.</summary>
    public class LoginRequestDTO
    {
        [Required, EmailAddress, StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}