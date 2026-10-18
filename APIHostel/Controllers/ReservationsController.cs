using APIHostel.Data;
using APIHostel.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace APIHostel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Receptionist")]
    public class ReservationsController : ControllerBase
    {
        private readonly HostelDbContext _context;
        private readonly ILogger<ReservationsController> _logger;

        public ReservationsController(HostelDbContext context, ILogger<ReservationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<EmployeeReservationResponseDTO>>> GetPendingRequests()
        {
            if (!await IsActiveEmployee())
                return Forbid();

            var reservations = await _context.Reservations
                .AsNoTracking()
                .Where(reservation => reservation.ReservationStatus.StatusName == "Pending")
                .Include(reservation => reservation.Guest)
                .Include(reservation => reservation.ReservationStatus)
                .Include(reservation => reservation.Beds)
                    .ThenInclude(bed => bed.Room)
                .OrderBy(reservation => reservation.CheckIn)
                .ThenBy(reservation => reservation.ReservedAt)
                .ToListAsync();

            var reservationIds = reservations.Select(reservation => reservation.ReservationId).ToArray();
            var totals = reservationIds.Length == 0
                ? new Dictionary<int, decimal?>()
                : await _context.VReservationTotals
                    .Where(total => reservationIds.Contains(total.ReservationId))
                    .ToDictionaryAsync(total => total.ReservationId, total => total.Total);

            return Ok(reservations.Select(reservation => new EmployeeReservationResponseDTO
            {
                ReservationId = reservation.ReservationId,
                GuestName = $"{reservation.Guest.FirstName} {reservation.Guest.LastName}",
                GuestEmail = reservation.Guest.Email ?? string.Empty,
                CheckIn = reservation.CheckIn,
                CheckOut = reservation.CheckOut,
                BedCount = reservation.Beds.Count,
                RoomNumbers = reservation.Beds
                    .Select(bed => bed.Room.RoomNumber)
                    .Distinct()
                    .OrderBy(number => number)
                    .ToArray(),
                Total = totals.GetValueOrDefault(reservation.ReservationId),
                Status = reservation.ReservationStatus.StatusName
            }).ToList());
        }

        [HttpPost("{reservationId:int}/Decision")]
        public async Task<IActionResult> Decide(int reservationId, ReservationDecisionRequestDTO dto)
        {
            if (!await IsActiveEmployee())
                return Forbid();

            var decision = dto.Decision.Trim();
            var statusName = decision.Equals("Confirmed", StringComparison.OrdinalIgnoreCase)
                ? "Confirmed"
                : decision.Equals("Cancelled", StringComparison.OrdinalIgnoreCase)
                    ? "Cancelled"
                    : null;
            if (statusName == null)
                return BadRequest("La decisión debe ser Confirmed o Cancelled.");

            var targetStatus = await _context.ReservationStatuses
                .SingleOrDefaultAsync(status => status.StatusName == statusName);
            if (targetStatus == null)
            {
                _logger.LogError("Reservation status {StatusName} is missing from the catalog.", statusName);
                return Problem("No se pudo actualizar la solicitud de reserva.");
            }

            var updated = await _context.Reservations
                .Where(reservation => reservation.ReservationId == reservationId
                    && reservation.ReservationStatus.StatusName == "Pending")
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(reservation => reservation.ReservationStatusId, targetStatus.ReservationStatusId));
            if (updated == 1)
                return NoContent();

            return await _context.Reservations.AnyAsync(reservation => reservation.ReservationId == reservationId)
                ? Conflict("La solicitud ya fue gestionada.")
                : NotFound("No se encontró la solicitud de reserva.");
        }

        private async Task<bool> IsActiveEmployee()
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                return false;

            return await _context.Users.AnyAsync(user => user.UserId == userId
                && user.Active
                && (user.Role.RoleName == "Admin" || user.Role.RoleName == "Receptionist"));
        }
    }
}
