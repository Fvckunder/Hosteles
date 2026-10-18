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

        // GET: api/Rooms. Lists every active room with its type, beds and amenities.
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
                    BedCount = room.Beds.Count(bed => bed.Active),
                    Active = room.Active,
                    AmenityIds = room.Amenities.Select(a => a.AmenityId).ToList(),
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
                    BedCount = r.Beds.Count(bed => bed.Active),
                    Active = r.Active,
                    AmenityIds = r.Amenities.Select(a => a.AmenityId).ToList(),
                    Amenities = r.Amenities.Select(a => a.AmenityName).ToList()
                })
                .SingleOrDefaultAsync();

            if (room == null)
                return NotFound();

            return Ok(room);
        }

        [HttpGet("Lookups")]
        public async Task<ActionResult<RoomCatalogResponseDTO>> ObtenerCatalogos()
        {
            var response = new RoomCatalogResponseDTO
            {
                RoomTypes = await _context.RoomTypes
                    .OrderBy(type => type.TypeName)
                    .Select(type => new RoomTypeOptionDTO
                    {
                        RoomTypeId = type.RoomTypeId,
                        TypeName = type.TypeName
                    })
                    .ToListAsync(),
                Amenities = await _context.Amenities
                    .Where(amenity => amenity.Active)
                    .OrderBy(amenity => amenity.AmenityName)
                    .Select(amenity => new AmenityOptionDTO
                    {
                        AmenityId = amenity.AmenityId,
                        AmenityName = amenity.AmenityName
                    })
                    .ToListAsync()
            };

            return Ok(response);
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

            var amenities = await GetActiveAmenities(dto.AmenityIds);
            if (amenities == null)
                return BadRequest("Una o más comodidades no existen o están inactivas.");

            var availableBedStatus = await _context.BedStatuses
                .SingleOrDefaultAsync(status => status.StatusName == "Available");
            if (availableBedStatus == null)
            {
                _logger.LogError("Available bed status is missing from the catalog.");
                return Problem("No se pudo completar el alta de la habitación.");
            }

            var room = new Room
            {
                RoomNumber = roomNumber,
                RoomTypeId = dto.RoomTypeId,
                Floor = dto.Floor,
                PricePerNight = dto.PricePerNight,
                Active = true,
                Amenities = amenities,
                Beds = Enumerable.Range(1, dto.BedCount)
                    .Select(number => new Bed
                    {
                        BedNumber = checked((short)number),
                        BedStatusId = availableBedStatus.BedStatusId,
                        Active = true
                    })
                    .ToList()
            };

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
                BedCount = dto.BedCount,
                Active = room.Active,
                AmenityIds = room.Amenities.Select(a => a.AmenityId).ToList(),
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
                .Include(r => r.Beds)
                    .ThenInclude(bed => bed.Reservations)
                        .ThenInclude(reservation => reservation.ReservationStatus)
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

            var amenities = await GetActiveAmenities(dto.AmenityIds);
            if (amenities == null)
                return BadRequest("Una o más comodidades no existen o están inactivas.");

            var activeBeds = room.Beds.Where(bed => bed.Active).ToList();
            var bedsToRemove = activeBeds.Count - dto.BedCount;
            if (bedsToRemove > 0)
            {
                var removableBeds = activeBeds
                    .Where(bed => !bed.Reservations.Any(reservation =>
                        reservation.ReservationStatus.StatusName is "Pending" or "Confirmed"))
                    .OrderByDescending(bed => bed.BedNumber)
                    .Take(bedsToRemove)
                    .ToList();
                if (removableBeds.Count != bedsToRemove)
                    return Conflict("No se puede reducir la capacidad porque hay camas asignadas a reservas pendientes o confirmadas.");

                foreach (var bed in removableBeds)
                    bed.Active = false;
            }
            else if (bedsToRemove < 0)
            {
                var availableBedStatus = await _context.BedStatuses
                    .SingleOrDefaultAsync(status => status.StatusName == "Available");
                if (availableBedStatus == null)
                {
                    _logger.LogError("Available bed status is missing from the catalog.");
                    return Problem("No se pudo completar la modificación de la habitación.");
                }

                var nextBedNumber = room.Beds.Count == 0 ? 1 : room.Beds.Max(bed => (int)bed.BedNumber) + 1;
                if (nextBedNumber + -bedsToRemove - 1 > short.MaxValue)
                    return Conflict("No se pueden agregar más camas: se alcanzó el máximo de numeración de la habitación.");

                for (var index = 0; index < -bedsToRemove; index++)
                {
                    room.Beds.Add(new Bed
                    {
                        BedNumber = checked((short)(nextBedNumber + index)),
                        BedStatusId = availableBedStatus.BedStatusId,
                        Active = true
                    });
                }
            }

            room.RoomNumber = roomNumber;
            room.RoomTypeId = dto.RoomTypeId;
            room.Floor = dto.Floor;
            room.PricePerNight = dto.PricePerNight;
            room.Active = dto.Active;
            room.Amenities.Clear();
            foreach (var amenity in amenities)
                room.Amenities.Add(amenity);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<List<Amenity>?> GetActiveAmenities(List<int> amenityIds)
        {
            var ids = amenityIds.Distinct().ToArray();
            var amenities = await _context.Amenities
                .Where(amenity => ids.Contains(amenity.AmenityId) && amenity.Active)
                .ToListAsync();
            return amenities.Count == ids.Length ? amenities : null;
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