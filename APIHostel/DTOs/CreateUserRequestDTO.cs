namespace APIHostel.DTOs
{
    // Input model for provisioning a new employee account. Password arrives in plain
    // text and is hashed before persistence; it is never echoed back in responses.
    public class CreateUserRequestDTO
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
    }
}