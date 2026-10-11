using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class Reservation
{
    public int ReservationId { get; set; }

    public int GuestId { get; set; }

    public DateOnly CheckIn { get; set; }

    public DateOnly CheckOut { get; set; }

    public DateTime ReservedAt { get; set; }

    public int ReservationStatusId { get; set; }

    public virtual Guest Guest { get; set; } = null!;

    public virtual ReservationStatus ReservationStatus { get; set; } = null!;

    public virtual ICollection<Bed> Beds { get; set; } = new List<Bed>();
}
