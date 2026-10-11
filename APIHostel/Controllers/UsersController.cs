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

        // GET: api/Users. Lists every active employee. The admin dashboard uses this
        // to render the team table; deactivated accounts are intentionally excluded.
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

        // GET: api/Users/5. Returns a single active employee. Used by the edit dialog
        // to prefill the form before the admin submits changes.
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

        // POST: api/Users. Provisions a new employee account. The password is hashed
        // with BCrypt before persistence; email uniqueness is enforced at the database
        // level and pre-checked here to return a friendly 409 instead of a 500.
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

            // Only the two employee roles can be assigned here; guests self-register.
            var roleName = string.Equals(dto.RoleName, "Admin", StringComparison.OrdinalIgnoreCase)
                ? "Admin"
                : "Receptionist";

            var role = await _context.Roles.SingleOrDefaultAsync(item => item.RoleName == roleName);
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

        // PUT: api/Users/5. Updates an existing employee's profile and role. The email
        // uniqueness check excludes the current record so an admin can save the form
        // without changing the address. Deactivation is handled by DELETE instead.
        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, UpdateUserRequestDTO dto)
        {
            var user = await _context.Users.SingleOrDefaultAsync(account => account.UserId == id);
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

            var roleName = string.Equals(dto.RoleName, "Admin", StringComparison.OrdinalIgnoreCase)
                ? "Admin"
                : "Receptionist";

            var role = await _context.Roles.SingleOrDefaultAsync(item => item.RoleName == roleName);
            if (role == null)
            {
                _logger.LogError("Employee role {RoleName} is missing from the roles catalog.", roleName);
                return Problem("No se pudo completar la actualización.");
            }

            user.FirstName = firstName;
            user.LastName = lastName;
            user.Email = email;
            user.RoleId = role.RoleId;
            user.Active = dto.Active;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Users/5. Performs a logical delete so historical references
        // (reservations, audit trails) remain intact. The account can be reactivated
        // by an admin through the PUT endpoint.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var user = await _context.Users.SingleOrDefaultAsync(account => account.UserId == id);
            if (user == null)
                return NotFound();

            user.Active = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}