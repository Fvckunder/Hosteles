namespace APIHostel.DTOs
{
    public class LoginResponseDTO
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string RoleName { get; set; }
        public int? GuestId { get; set; }   // Solo si el rol es "Guest"
        public string AccessToken { get; set; } = string.Empty; // Short-lived bearer token used by protected dashboard endpoints.
    }
}