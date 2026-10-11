using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class VReservationTotal
{
    public int ReservationId { get; set; }

    public int? Nights { get; set; }

    public decimal? Total { get; set; }
}
