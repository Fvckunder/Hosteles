namespace APIHostel.DTOs
{
    // Input model for editing an existing employee account. Password is intentionally
    // excluded: rotating credentials is a separate, explicit operation.
    public class UpdateUserRequestDTO
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public bool Active { get; set; }
    }
}