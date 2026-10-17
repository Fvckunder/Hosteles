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
    [Authorize(Roles = "Admin,Receptionist")]
    public class RoomsController : ControllerBase
    {
        private readonly HostelDbContext _context;
        private readonly ILogger<RoomsController> _logger;

        public RoomsController(HostelDbContext context, ILogger<RoomsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Rooms. Lists every active room with its type and amenities. The
        // dashboard uses this to render the inventory table; deactivated rooms are
        // intentionally excluded so historic references stay untouched.
        [HttpGet]
        public async Task<ActionResult<List<RoomResponseDTO>>> ObtenerTodos()
        {
            var rooms = await _context.Rooms
                .Include(room => room.RoomType)
                .Include(room => room.Amenities)
                .Where(room => room.Active)
                .OrderBy(room => room.Floor)
                .ThenBy(room => room.RoomNumber)
                .Select(room => new RoomResponseDTO
                {
                    RoomId = room.RoomId,
                    RoomNumber = room.RoomNumber,
                    RoomTypeId = room.RoomTypeId,
                    RoomTypeName = room.RoomType.TypeName,
                    Floor = room.Floor,
                    PricePerNight = room.PricePerNight,
                    Active = room.Active,
                    Amenities = room.Amenities.Select(a => a.AmenityName).ToList()
                })
                .ToListAsync();

            return Ok(rooms);
        }

        // GET: api/Rooms/5. Returns a single active room. Used by the edit dialog
        // to prefill the form before the admin submits changes.
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomResponseDTO>> ObtenerPorId(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Amenities)
                .Where(r => r.RoomId == id && r.Active)
                .Select(r => new RoomResponseDTO
                {
                    RoomId = r.RoomId,
                    RoomNumber = r.RoomNumber,
                    RoomTypeId = r.RoomTypeId,
                    RoomTypeName = r.RoomType.TypeName,
                    Floor = r.Floor,
                    PricePerNight = r.PricePerNight,
                    Active = r.Active,
                    Amenities = r.Amenities.Select(a => a.AmenityName).ToList()
                })
                .SingleOrDefaultAsync();

            if (room == null)
                return NotFound();

            return Ok(room);
        }

        // POST: api/Rooms. Creates a new room. The room number is pre-checked for
        // uniqueness; the room type must exist in the catalog; the price must be > 0.
        [HttpPost]
        public async Task<ActionResult<RoomResponseDTO>> Crear(CreateRoomRequestDTO dto)
        {
            var roomNumber = dto.RoomNumber.Trim();

            if (string.IsNullOrWhiteSpace(roomNumber))
                return BadRequest("El número de habitación es obligatorio.");

            if (dto.PricePerNight <= 0)
                return BadRequest("El precio por noche debe ser mayor que cero.");

            if (await _context.Rooms.AnyAsync(r => r.RoomNumber == roomNumber))
                return Conflict("Ya existe una habitación con ese número.");

            var roomType = await _context.RoomTypes
                .SingleOrDefaultAsync(rt => rt.RoomTypeId == dto.RoomTypeId);
            if (roomType == null)
                return BadRequest("El tipo de habitación no existe.");

            var room = new Room
            {
                RoomNumber = roomNumber,
                RoomTypeId = dto.RoomTypeId,
                Floor = dto.Floor,
                PricePerNight = dto.PricePerNight,
                Active = true
            };

            // Attach the selected amenities so EF links them through ROOM_AMENITIES.
            if (dto.AmenityIds.Any())
            {
                var amenities = await _context.Amenities
                    .Where(a => dto.AmenityIds.Contains(a.AmenityId) && a.Active)
                    .ToListAsync();
                room.Amenities = amenities;
            }

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            var response = new RoomResponseDTO
            {
                RoomId = room.RoomId,
                RoomNumber = room.RoomNumber,
                RoomTypeId = room.RoomTypeId,
                RoomTypeName = roomType.TypeName,
                Floor = room.Floor,
                PricePerNight = room.PricePerNight,
                Active = room.Active,
                Amenities = room.Amenities.Select(a => a.AmenityName).ToList()
            };

            return StatusCode(StatusCodes.Status201Created, response);
        }

        // PUT: api/Rooms/5. Updates an existing room. The room number uniqueness
        // check excludes the current record; amenities are replaced with the new list.
        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, UpdateRoomRequestDTO dto)
        {
            var room = await _context.Rooms
                .Include(r => r.Amenities)
                .SingleOrDefaultAsync(r => r.RoomId == id);
            if (room == null)
                return NotFound();

            var roomNumber = dto.RoomNumber.Trim();

            if (string.IsNullOrWhiteSpace(roomNumber))
                return BadRequest("El número de habitación es obligatorio.");

            if (dto.PricePerNight <= 0)
                return BadRequest("El precio por noche debe ser mayor que cero.");

            if (await _context.Rooms.AnyAsync(r => r.RoomNumber == roomNumber && r.RoomId != id))
                return Conflict("El número de habitación ya está en uso por otra habitación.");

            var roomType = await _context.RoomTypes
                .SingleOrDefaultAsync(rt => rt.RoomTypeId == dto.RoomTypeId);
            if (roomType == null)
                return BadRequest("El tipo de habitación no existe.");

            room.RoomNumber = roomNumber;
            room.RoomTypeId = dto.RoomTypeId;
            room.Floor = dto.Floor;
            room.PricePerNight = dto.PricePerNight;
            room.Active = dto.Active;

            // Replace amenities: clear the current collection and assign the new one.
            room.Amenities.Clear();
            if (dto.AmenityIds.Any())
            {
                var amenities = await _context.Amenities
                    .Where(a => dto.AmenityIds.Contains(a.AmenityId) && a.Active)
                    .ToListAsync();
                foreach (var amenity in amenities)
                    room.Amenities.Add(amenity);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Rooms/5. Logical delete: the room is marked inactive so
        // reservations and audit trails that reference it remain intact.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var room = await _context.Rooms
                .SingleOrDefaultAsync(r => r.RoomId == id);
            if (room == null)
                return NotFound();

            room.Active = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}