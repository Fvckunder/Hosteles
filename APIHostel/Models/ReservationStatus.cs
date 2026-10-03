using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class ReservationStatus
{
    public int ReservationStatusId { get; set; }

    public string StatusName { get; set; } = null!;

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
