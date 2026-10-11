using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class Guest
{
    public int GuestId { get; set; }

    public int? UserId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string? Dni { get; set; }

    public string? Passport { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public bool Active { get; set; }

    public int CountryId { get; set; }

    public virtual Country Country { get; set; } = null!;

    public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

    public virtual User? User { get; set; }
}
