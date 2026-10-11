using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class VRoomCapacity
{
    public int RoomId { get; set; }

    public string RoomNumber { get; set; } = null!;

    public int? Capacity { get; set; }
}
