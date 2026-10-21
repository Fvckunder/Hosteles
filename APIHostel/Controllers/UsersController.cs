using APIHostel.Data;
using APIHostel.DTOs;
using APIHostel.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIHostel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly HostelDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(HostelDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Users. Lists active accounts of all roles for the admin's
        // separate team and guest management views.
        [HttpGet]
        public async Task<ActionResult<List<UserResponseDTO>>> ObtenerTodos()
        {
            var users = await _context.Users
                .Include(user => user.Role)
                .Where(user => user.Active)
                .OrderBy(user => user.LastName)
                .ThenBy(user => user.FirstName)
                .Select(user => new UserResponseDTO
                {
                    UserId = user.UserId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    RoleName = user.Role.RoleName,
                    Active = user.Active
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/Users/5. Returns one active account for the edit flow.
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDTO>> ObtenerPorId(int id)
        {
            var user = await _context.Users
                .Include(account => account.Role)
                .Where(account => account.UserId == id && account.Active)
                .Select(account => new UserResponseDTO
                {
                    UserId = account.UserId,
                    FirstName = account.FirstName,
                    LastName = account.LastName,
                    Email = account.Email,
                    RoleName = account.Role.RoleName,
                    Active = account.Active
                })
                .SingleOrDefaultAsync();

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // POST: api/Users. Provisions an employee or guest account. Passwords are
        // hashed before persistence, and guest profile data is created with its user.
        [HttpPost]
        public async Task<ActionResult<UserResponseDTO>> Crear(CreateUserRequestDTO dto)
        {
            var firstName = dto.FirstName.Trim();
            var lastName = dto.LastName.Trim();
            var email = dto.Email.Trim();

            if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
                return BadRequest("Nombre y apellido son obligatorios.");

            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("El correo electrónico es obligatorio.");

            if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8)
                return BadRequest("La contraseña debe tener al menos 8 caracteres.");

            if (await _context.Users.AnyAsync(user => user.Email == email))
                return Conflict("Ya existe una cuenta con ese correo electrónico.");

            var roleName = dto.RoleName.Trim();
            if (string.IsNullOrWhiteSpace(roleName))
                return BadRequest("El rol es obligatorio.");

            var normalizedRoleName = string.Equals(roleName, "Guest", StringComparison.OrdinalIgnoreCase)
                ? "Guest"
                : string.Equals(roleName, "Admin", StringComparison.OrdinalIgnoreCase)
                    ? "Admin"
                    : "Receptionist";

            if (!string.Equals(roleName, "Guest", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(roleName, "Admin", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(roleName, "Receptionist", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Selecciona un tipo de cuenta válido.");

            var dni = NormalizeOptional(dto.Dni);
            var passport = NormalizeOptional(dto.Passport);
            if (normalizedRoleName == "Guest")
            {
                if (dto.CountryId == null || dto.CountryId <= 0)
                    return BadRequest("Selecciona un país válido.");
                if (dni == null && passport == null)
                    return BadRequest("Debes indicar DNI o pasaporte.");
                if (dni != null && await _context.Guests.AnyAsync(guest => guest.Dni == dni))
                    return Conflict("Ya existe una cuenta con ese DNI.");
                if (passport != null && await _context.Guests.AnyAsync(guest => guest.Passport == passport))
                    return Conflict("Ya existe una cuenta con ese pasaporte.");
                if (!await _context.Countries.AnyAsync(country => country.CountryId == dto.CountryId))
                    return BadRequest("Selecciona un país válido.");
            }

            var role = await _context.Roles.SingleOrDefaultAsync(item => item.RoleName == normalizedRoleName);
            if (role == null)
            {
                _logger.LogError("Employee role {RoleName} is missing from the roles catalog.", roleName);
                return Problem("No se pudo completar el registro.");
            }

            var user = new User
            {
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RoleId = role.RoleId,
                Active = true
            };

            _context.Users.Add(user);
            if (normalizedRoleName == "Guest")
            {
                _context.Guests.Add(new Guest
                {
                    User = user,
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    Dni = dni,
                    Passport = passport,
                    Phone = NormalizeOptional(dto.Phone),
                    CountryId = dto.CountryId!.Value,
                    Active = true
                });
            }
            await _context.SaveChangesAsync();

            var response = new UserResponseDTO
            {
                UserId = user.UserId,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                RoleName = role.RoleName,
                Active = user.Active
            };

            return StatusCode(StatusCodes.Status201Created, response);
        }

        // PUT: api/Users/5. Updates an existing user's profile and role. The email
        // uniqueness check excludes the current record so an admin can save the form
        // without changing the address. Deactivation is handled by DELETE instead.
        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, UpdateUserRequestDTO dto)
        {
            var user = await _context.Users
                .Include(account => account.Role)
                .Include(account => account.Guest)
                .SingleOrDefaultAsync(account => account.UserId == id);
            if (user == null)
                return NotFound();

            var firstName = dto.FirstName.Trim();
            var lastName = dto.LastName.Trim();
            var email = dto.Email.Trim();

            if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
                return BadRequest("Nombre y apellido son obligatorios.");

            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("El correo electrónico es obligatorio.");

            if (await _context.Users.AnyAsync(account => account.Email == email && account.UserId != id))
                return Conflict("El correo electrónico ya está en uso por otra cuenta.");

            var isGuest = user.Role.RoleName == "Guest";
            var roleName = dto.RoleName.Trim();
            var normalizedRoleName = isGuest
                ? "Guest"
                : string.Equals(roleName, "Admin", StringComparison.OrdinalIgnoreCase)
                    ? "Admin"
                    : "Receptionist";
            if (isGuest && !string.Equals(roleName, "Guest", StringComparison.OrdinalIgnoreCase))
                return BadRequest("No se permite cambiar el tipo de cuenta de un huésped.");

            var role = await _context.Roles.SingleOrDefaultAsync(item => item.RoleName == normalizedRoleName);
            if (role == null)
            {
                _logger.LogError("Employee role {RoleName} is missing from the roles catalog.", normalizedRoleName);
                return Problem("No se pudo completar la actualización.");
            }

            user.FirstName = firstName;
            user.LastName = lastName;
            user.Email = email;
            user.RoleId = role.RoleId;
            user.Active = dto.Active;
            if (user.Guest != null)
            {
                user.Guest.FirstName = firstName;
                user.Guest.LastName = lastName;
                user.Guest.Email = email;
                user.Guest.Active = dto.Active;
            }

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                if (dto.Password.Length < 8)
                    return BadRequest("La contraseña debe tener al menos 8 caracteres.");

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static string? NormalizeOptional(string? value)
        {
            var normalized = value?.Trim();
            return string.IsNullOrEmpty(normalized) ? null : normalized;
        }

        // DELETE: api/Users/5. Performs a logical delete so historical references
        // (reservations, audit trails) remain intact. The account can be reactivated
        // by an admin through the PUT endpoint.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var user = await _context.Users
                .Include(account => account.Role)
                .Include(account => account.Guest)
                .SingleOrDefaultAsync(account => account.UserId == id);
            if (user == null)
                return NotFound();

            if (user.Role.RoleName == "Admin" && (await _context.Users.CountAsync(account => account.Active && account.Role.RoleName == "Admin")) <= 1)
                return Conflict("No se puede eliminar la última cuenta administradora activa.");

            user.Active = false;
            if (user.Role.RoleName == "Guest" && user.Guest != null)
                user.Guest.Active = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}