using System;
using System.Collections.Generic;

namespace APIHostel.Models;

public partial class User
{
    public int UserId { get; set; }

    public int RoleId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public bool Active { get; set; }

    public virtual Guest? Guest { get; set; }

    public virtual Role Role { get; set; } = null!;
}
