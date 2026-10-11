using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class Amenity
{
    public int AmenityId { get; set; }

    public string AmenityName { get; set; } = null!;

    public bool Active { get; set; }

    public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
}
