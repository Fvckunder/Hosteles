using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class BedStatus
{
    public int BedStatusId { get; set; }

    public string StatusName { get; set; } = null!;

    public virtual ICollection<Bed> Beds { get; set; } = new List<Bed>();
}
