using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    /// <summary>
    /// Admin-only employee signup data. The controller limits RoleName to employee roles,
    /// so this contract cannot be used to create guest accounts.
    /// </summary>
    public class EmployeeRegistrationRequestDTO
    {
        [Required, StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(100)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string RoleName { get; set; } = string.Empty;
    }
}