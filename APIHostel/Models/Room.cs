using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class Room
{
    public int RoomId { get; set; }

    public string RoomNumber { get; set; } = null!;

    public int RoomTypeId { get; set; }

    public short Floor { get; set; }

    public decimal PricePerNight { get; set; }

    public bool Active { get; set; }

    public virtual ICollection<Bed> Beds { get; set; } = new List<Bed>();

    public virtual RoomType RoomType { get; set; } = null!;

    public virtual ICollection<Amenity> Amenities { get; set; } = new List<Amenity>();
}
