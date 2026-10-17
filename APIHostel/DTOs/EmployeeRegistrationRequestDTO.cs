using System.ComponentModel.DataAnnotations;

namespace APIHostel.DTOs
{
    /// <summary>
    /// Datos de registro de empleados exclusivos para administradores. El controlador limita
    /// RoleName a los roles de empleado, por lo que este contrato no puede usarse para crear
    /// cuentas de huéspedes.
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