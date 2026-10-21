using APIHostel.Data;
using APIHostel.DTOs;
using APIHostel.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Data;
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

        // GET: api/Auth/HasAdministrator. El acceso de empleados muestra el formulario
        // inicial de alta solo cuando no queda ninguna cuenta administradora activa.
        [AllowAnonymous]
        [HttpGet("HasAdministrator")]
        public async Task<ActionResult> HasAdministrator()
        {
            var exists = await _context.Users
                .AnyAsync(user => user.Active && user.Role.RoleName == "Admin");

            return Ok(new { exists });
        }

        // POST: api/Auth/RegisterInitialAdministrator. El nivel Serializable evita que
        // solicitudes simultáneas creen más de una cuenta administradora inicial.
        [AllowAnonymous]
        [HttpPost("RegisterInitialAdministrator")]
        public async Task<ActionResult> RegisterInitialAdministrator(InitialAdministratorRegistrationRequestDTO dto)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            var administratorExists = await _context.Users
                .AnyAsync(user => user.Active && user.Role.RoleName == "Admin");
            if (administratorExists)
                return Conflict("Ya existe una cuenta administradora activa.");

            var email = dto.Email.Trim();
            if (await _context.Users.AnyAsync(user => user.Email == email))
                return Conflict("Ya existe una cuenta con ese correo electrónico.");

            var role = await _context.Roles.SingleOrDefaultAsync(item => item.RoleName == "Admin");
            if (role == null)
            {
                _logger.LogError("Admin role is missing from the roles catalog.");
                return Problem("No se pudo completar el registro.");
            }

            var administrator = new User
            {
                RoleId = role.RoleId,
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Active = true
            };

            _context.Users.Add(administrator);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return StatusCode(StatusCodes.Status201Created, new
            {
                userId = administrator.UserId,
                firstName = administrator.FirstName,
                lastName = administrator.LastName,
                email = administrator.Email,
                roleName = role.RoleName
            });
        }

        // POST: api/Auth/Login. Si el inicio de sesión es correcto, devuelve un token firmado
        // de corta duración para que las acciones protegidas del panel puedan verificar la
        // cuenta y el rol en cada solicitud a la API.
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
                // Un hash almacenado con formato incorrecto indica un problema de integridad
                // de datos. Regístralo para el equipo operador, pero devuelve la misma respuesta
                // genérica que para otras credenciales no válidas y nunca expongas el hash,
                // la contraseña ni los detalles de la excepción en la respuesta de acceso.
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

        // POST: api/Auth/PasswordReset/CheckEmail. Verifica que haya una cuenta activa con el correo indicado.
        [AllowAnonymous]
        [HttpPost("PasswordReset/CheckEmail")]
        public async Task<ActionResult> CheckPasswordResetEmail(PasswordResetEmailRequestDTO dto)
        {
            var email = dto.Email.Trim();
            var accountExists = await _context.Users
                .AnyAsync(user => user.Active && user.Email.ToLower() == email.ToLower());

            if (!accountExists)
                return NotFound("No hay una cuenta activa registrada con ese correo electrónico.");

            return Ok();
        }

        // POST: api/Auth/PasswordReset. El código es de prueba: se valida el formato de cuatro
        // dígitos, pero no se compara con un código enviado mientras no esté habilitado el correo.
        [AllowAnonymous]
        [HttpPost("PasswordReset")]
        public async Task<ActionResult> ResetPassword(PasswordResetRequestDTO dto)
        {
            var email = dto.Email.Trim();
            var account = await _context.Users
                .FirstOrDefaultAsync(user => user.Active && user.Email.ToLower() == email.ToLower());

            if (account == null)
                return NotFound("No hay una cuenta activa registrada con ese correo electrónico.");

            account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // GET: api/Auth/Countries. El formulario público de registro usa los identificadores
        // de la base de datos en lugar de opciones de país escritas directamente, para que los
        // valores enviados coincidan con el catálogo de claves foráneas.
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

        // POST: api/Auth/RegisterGuest. El registro público siempre asigna el rol Guest,
        // genera el hash de la contraseña y crea las filas relacionadas de USERS y GUESTS
        // en una sola operación de guardado de Entity Framework.
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

        // GET: api/Auth/Me. El panel llama a este endpoint con su token bearer para confirmar
        // que la cuenta siga activa y mostrar su identidad y rol reales, en lugar de datos de muestra.
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

        // POST: api/Auth/RegisterEmployee. La autorización de ASP.NET comprueba la declaración
        // del rol y luego este se vuelve a comprobar en SQL, para impedir que un administrador
        // desactivado o degradado siga creando cuentas hasta que venza su token. Los únicos
        // roles de empleado existentes son Admin y Receptionist.
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