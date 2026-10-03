using APIHostel.Data;
using APIHostel.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIHostel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HostelDbContext _context;

        public AuthController(HostelDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/Login
        [HttpPost("Login")]
        public async Task<ActionResult<LoginResponseDTO>> Login(LoginRequestDTO dto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Active);

            if (user == null)
                return Unauthorized("Email o clave incorrectos.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Email o clave incorrectos.");

            int? guestId = null;
            if (user.Role.RoleName == "Guest")
            {
                var guest = await _context.Guests
                    .FirstOrDefaultAsync(g => g.UserId == user.UserId && g.Active);
                guestId = guest?.GuestId;
            }

            return Ok(new LoginResponseDTO
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                RoleName = user.Role.RoleName,
                GuestId = guestId
            });
        }
    }
}