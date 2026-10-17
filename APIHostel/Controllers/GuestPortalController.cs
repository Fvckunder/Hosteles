using APIHostel.Data;
using APIHostel.DTOs;
using APIHostel.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace APIHostel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Guest")]
    public class GuestPortalController : ControllerBase
    {
        private readonly HostelDbContext _context;
        private readonly ILogger<GuestPortalController> _logger;

        public GuestPortalController(HostelDbContext context, ILogger<GuestPortalController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/GuestPortal. El rol y el identificador del usuario se obtienen del token
        // firmado; la relación en la base de datos limita los perfiles y las reservas devueltos
        // a los que pertenecen a ese huésped.
        [HttpGet]
        public async Task<ActionResult<GuestPortalResponseDTO>> GetPortal()
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            // Los tokens vencen después de 30 minutos; también se vuelven a comprobar en SQL
            // la actividad de la cuenta y su rol para aplicar de inmediato las desactivaciones
            // o los cambios de rol en este portal privado.
            var guest = await _context.Guests
                .Include(item => item.Country)
                .Include(item => item.User)
                .SingleOrDefaultAsync(item => item.UserId == userId
                    && item.Active
                    && item.User!.Active
                    && item.User.Role.RoleName == "Guest");
            if (guest == null)
                return NotFound("No se encontró un perfil de huésped activo para esta cuenta.");

            var reservations = await _context.Reservations
                .Where(reservation => reservation.GuestId == guest.GuestId)
                .Include(reservation => reservation.ReservationStatus)
                .Include(reservation => reservation.Beds)
                    .ThenInclude(bed => bed.Room)
                .OrderByDescending(reservation => reservation.CheckIn)
                .ToListAsync();

            var reservationIds = reservations.Select(reservation => reservation.ReservationId).ToArray();
            var totals = reservationIds.Length == 0
                ? new Dictionary<int, decimal?>()
                : await _context.VReservationTotals
                    .Where(total => reservationIds.Contains(total.ReservationId))
                    .ToDictionaryAsync(total => total.ReservationId, total => total.Total);

            var response = new GuestPortalResponseDTO
            {
                GuestId = guest.GuestId,
                FirstName = guest.FirstName,
                LastName = guest.LastName,
                Email = guest.Email ?? guest.User!.Email,
                Phone = guest.Phone,
                CountryName = guest.Country.CountryName,
                Reservations = reservations.Select(reservation => new GuestReservationDTO
                {
                    ReservationId = reservation.ReservationId,
                    CheckIn = reservation.CheckIn,
                    CheckOut = reservation.CheckOut,
                    Nights = reservation.CheckOut.DayNumber - reservation.CheckIn.DayNumber,
                    Status = reservation.ReservationStatus.StatusName,
                    RoomNumbers = reservation.Beds
                        .Select(bed => bed.Room.RoomNumber)
                        .Distinct()
                        .OrderBy(roomNumber => roomNumber)
                        .ToArray(),
                    BedCount = reservation.Beds.Count,
                    Total = totals.GetValueOrDefault(reservation.ReservationId)
                }).ToList()
            };

            return Ok(response);
        }

        // POST: api/GuestPortal/Reservations/{id}/Cancel. El huésped solo puede cancelar sus
        // propias reservas futuras en estado Pending o Confirmed; el servidor cambia el estado
        // del catálogo en vez de eliminar la reserva, para conservar el historial y las
        // referencias de la base de datos.
        [HttpPost("Reservations/{reservationId:int}/Cancel")]
        public async Task<IActionResult> CancelReservation(int reservationId)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var guestId = await _context.Guests
                .Where(guest => guest.UserId == userId
                    && guest.Active
                    && guest.User!.Active
                    && guest.User.Role.RoleName == "Guest")
                .Select(guest => (int?)guest.GuestId)
                .SingleOrDefaultAsync();
            if (guestId == null)
                return NotFound("No se encontró un perfil de huésped activo para esta cuenta.");

            var reservation = await _context.Reservations
                .Include(item => item.ReservationStatus)
                .SingleOrDefaultAsync(item => item.ReservationId == reservationId && item.GuestId == guestId);
            if (reservation == null)
                return NotFound("No se encontró esa reserva.");

            if (reservation.ReservationStatus.StatusName == "Cancelled")
                return NoContent();

            var canCancel = reservation.ReservationStatus.StatusName is "Pending" or "Confirmed";
            if (!canCancel || reservation.CheckIn <= DateOnly.FromDateTime(DateTime.UtcNow))
                return Conflict("Esta reserva ya no se puede cancelar desde el portal.");

            var cancelledStatus = await _context.ReservationStatuses
                .SingleOrDefaultAsync(status => status.StatusName == "Cancelled");
            if (cancelledStatus == null)
            {
                _logger.LogError("Cancelled reservation status is missing from the catalog.");
                return Problem("No se pudo completar la cancelación.");
            }

            reservation.ReservationStatusId = cancelledStatus.ReservationStatusId;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool TryGetUserId(out int userId)
        {
            return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
        }
    }
}