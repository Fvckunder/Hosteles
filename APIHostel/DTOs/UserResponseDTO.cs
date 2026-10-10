namespace APIHostel.DTOs
{
    // Read model for the employee directory. Exposes the role name instead of the FK
    // so the dashboard can render permissions without a second lookup.
    public class UserResponseDTO
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public bool Active { get; set; }
    }
}