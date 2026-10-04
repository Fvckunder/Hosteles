using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    /// <summary>
    /// Public guest signup data. The API always assigns the Guest role and requires a country
    /// plus at least one identity document to satisfy the database constraints.
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