namespace APIHostel.DTOs
{
    // Input model for editing an existing user account. Password is optional and is
    // hashed only when the admin supplies a new one explicitly.
    public class UpdateUserRequestDTO
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string? Password { get; set; }
        public bool Active { get; set; }
    }
}