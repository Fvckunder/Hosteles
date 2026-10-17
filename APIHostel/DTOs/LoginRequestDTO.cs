using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    /// <summary>Credenciales aceptadas por el endpoint de acceso compartido para huéspedes y empleados.</summary>
    public class LoginRequestDTO
    {
        [Required, EmailAddress, StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}