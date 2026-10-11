using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class Bed
{
    public int BedId { get; set; }

    public int RoomId { get; set; }

    public short BedNumber { get; set; }

    public int BedStatusId { get; set; }

    public bool Active { get; set; }

    public virtual BedStatus BedStatus { get; set; } = null!;

    public virtual Room Room { get; set; } = null!;

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
