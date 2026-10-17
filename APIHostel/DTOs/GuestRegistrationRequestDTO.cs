using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    /// <summary>
    /// Datos del registro público de huéspedes. La API siempre asigna el rol Guest y requiere
    /// un país y al menos un documento de identidad para cumplir las restricciones de la base
    /// de datos.
    /// </summary>
    public class GuestRegistrationRequestDTO
    {
        [Required, StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(100)]
        public string Password { get; set; } = string.Empty;

        [Required, Range(1, int.MaxValue)]
        public int CountryId { get; set; }

        [StringLength(20)]
        public string? Dni { get; set; }

        [StringLength(20)]
        public string? Passport { get; set; }

        [StringLength(30)]
        public string? Phone { get; set; }
    }
}