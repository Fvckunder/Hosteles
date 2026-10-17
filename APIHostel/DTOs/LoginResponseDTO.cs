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
        public string AccessToken { get; set; } = string.Empty; // Token bearer de corta duración para los endpoints protegidos del panel.
    }
}