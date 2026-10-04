using APIHostel.Data;
using APIHostel.DTOs;
using APIHostel.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace APIHostel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HostelDbContext _context;
        private readonly ILogger<AuthController> _logger;
        private readonly SymmetricSecurityKey _signingKey;

        public AuthController(
            HostelDbContext context,
            ILogger<AuthController> logger,
            SymmetricSecurityKey signingKey)
        {
            _context = context;
            _logger = logger;
            _signingKey = signingKey;
        }

        // POST: api/Auth/Login. A successful login returns a short-lived signed token so
        // protected dashboard actions can verify the account and role on every API request.
        [HttpPost("Login")]
        public async Task<ActionResult<LoginResponseDTO>> Login(LoginRequestDTO dto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Active);

            if (user == null)
                return Unauthorized("Email o clave incorrectos.");

            bool passwordMatches;
            try
            {
                passwordMatches = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            }
            catch (BCrypt.Net.SaltParseException exception)
            {
                // A malformed stored hash is a data-integrity problem. Log it for operators,
                // but return the same generic response as other invalid credentials and never
                // expose the hash, password, or exception details through the login response.
                _logger.LogError(exception, "User {UserId} has a malformed BCrypt password hash.", user.UserId);
                return Unauthorized("Email o clave incorrectos.");
            }

            if (!passwordMatches)
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
                GuestId = guestId,
                AccessToken = CreateAccessToken(user)
            });
        }

        // GET: api/Auth/Countries. The public signup form uses database IDs instead of
        // hard-coded country options, keeping submitted values aligned with the FK catalog.
        [AllowAnonymous]
        [HttpGet("Countries")]
        public async Task<ActionResult> GetCountries()
        {
            var countries = await _context.Countries
                .OrderBy(country => country.CountryName)
                .Select(country => new { country.CountryId, country.CountryName })
                .ToListAsync();

            return Ok(countries);
        }

        // POST: api/Auth/RegisterGuest. Public registration always assigns the Guest role,
        // hashes the password, and creates the linked USERS/GUESTS rows in one EF save.
        [AllowAnonymous]
        [HttpPost("RegisterGuest")]
        public async Task<ActionResult> RegisterGuest(GuestRegistrationRequestDTO dto)
        {
            var dni = NormalizeOptional(dto.Dni);
            var passport = NormalizeOptional(dto.Passport);
            if (dni == null && passport == null)
                return BadRequest("Debes indicar DNI o pasaporte.");

            var email = dto.Email.Trim();
            if (await _context.Users.AnyAsync(user => user.Email == email))
                return Conflict("Ya existe una cuenta con ese correo electrónico.");

            if (dni != null && await _context.Guests.AnyAsync(guest => guest.Dni == dni))
                return Conflict("Ya existe una cuenta con ese DNI.");

            if (passport != null && await _context.Guests.AnyAsync(guest => guest.Passport == passport))
                return Conflict("Ya existe una cuenta con ese pasaporte.");

            var countryExists = await _context.Countries.AnyAsync(country => country.CountryId == dto.CountryId);
            if (!countryExists)
                return BadRequest("Selecciona un país válido.");

            var guestRole = await _context.Roles.SingleOrDefaultAsync(role => role.RoleName == "Guest");
            if (guestRole == null)
            {
                _logger.LogError("Guest role is missing from the roles catalog.");
                return Problem("No se pudo completar el registro.");
            }

            var user = new User
            {
                RoleId = guestRole.RoleId,
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Active = true
            };
            var guest = new Guest
            {
                User = user,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Dni = dni,
                Passport = passport,
                Email = email,
                Phone = NormalizeOptional(dto.Phone),
                CountryId = dto.CountryId,
                Active = true
            };

            _context.Users.Add(user);
            _context.Guests.Add(guest);
            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, new
            {
                userId = user.UserId,
                guestId = guest.GuestId,
                message = "La cuenta de huésped quedó creada. Ya puedes iniciar sesión."
            });
        }

        // GET: api/Auth/Me. The dashboard calls this with its bearer token to confirm the
        // account is still active and render its real identity and role instead of demo data.
        [Authorize]
        [HttpGet("Me")]
        public async Task<ActionResult> Me()
        {
            if (!TryGetAuthenticatedUserId(out var userId))
                return Unauthorized();

            var user = await _context.Users
                .Include(account => account.Role)
                .Where(account => account.UserId == userId && account.Active)
                .Select(account => new
                {
                    account.UserId,
                    account.FirstName,
                    account.LastName,
                    account.Email,
                    RoleName = account.Role.RoleName
                })
                .SingleOrDefaultAsync();

            return user == null ? Unauthorized() : Ok(user);
        }

        // POST: api/Auth/RegisterEmployee. The role claim is checked by ASP.NET authorization,
        // then rechecked against SQL so a deactivated or demoted admin cannot keep provisioning
        // accounts until their token expires. Only Admin and Receptionist employee roles exist.
        [Authorize(Roles = "Admin")]
        [HttpPost("RegisterEmployee")]
        public async Task<ActionResult> RegisterEmployee(EmployeeRegistrationRequestDTO dto)
        {
            if (!TryGetAuthenticatedUserId(out var administratorId))
                return Unauthorized();

            var administrator = await _context.Users
                .Include(account => account.Role)
                .SingleOrDefaultAsync(account => account.UserId == administratorId && account.Active);
            if (administrator?.Role.RoleName != "Admin")
                return Forbid();

            var requestedRole = dto.RoleName.Trim();
            var roleName = string.Equals(requestedRole, "Admin", StringComparison.OrdinalIgnoreCase)
                ? "Admin"
                : "Receptionist";
            if (!string.Equals(requestedRole, "Admin", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(requestedRole, "Receptionist", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Selecciona un rol de empleado válido.");

            var email = dto.Email.Trim();
            if (await _context.Users.AnyAsync(user => user.Email == email))
                return Conflict("Ya existe una cuenta con ese correo electrónico.");

            var role = await _context.Roles.SingleOrDefaultAsync(item => item.RoleName == roleName);
            if (role == null)
            {
                _logger.LogError("Employee role {RoleName} is missing from the roles catalog.", roleName);
                return Problem("No se pudo completar el registro.");
            }

            var employee = new User
            {
                RoleId = role.RoleId,
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Active = true
            };

            _context.Users.Add(employee);
            await _context.SaveChangesAsync();

            return StatusCode(StatusCodes.Status201Created, new
            {
                userId = employee.UserId,
                firstName = employee.FirstName,
                lastName = employee.LastName,
                email = employee.Email,
                roleName = role.RoleName
            });
        }

        private string CreateAccessToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Email),
                new Claim(ClaimTypes.Role, user.Role.RoleName)
            };
            var credentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private bool TryGetAuthenticatedUserId(out int userId)
        {
            return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
        }

        private static string? NormalizeOptional(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }
    }
}