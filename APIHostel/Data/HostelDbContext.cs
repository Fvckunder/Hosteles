using System;
using System.Collections.Generic;
using APIHostel.Models;
using Microsoft.EntityFrameworkCore;

namespace APIHostel.Data;

public partial class HostelDbContext : DbContext
{
    public HostelDbContext(DbContextOptions<HostelDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Amenity> Amenities { get; set; }

    public virtual DbSet<Bed> Beds { get; set; }

    public virtual DbSet<BedStatus> BedStatuses { get; set; }

    public virtual DbSet<Country> Countries { get; set; }

    public virtual DbSet<Guest> Guests { get; set; }

    public virtual DbSet<Reservation> Reservations { get; set; }

    public virtual DbSet<ReservationStatus> ReservationStatuses { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Room> Rooms { get; set; }

    public virtual DbSet<RoomType> RoomTypes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<VReservationTotal> VReservationTotals { get; set; }

    public virtual DbSet<VRoomCapacity> VRoomCapacities { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Amenity>(entity =>
        {
            entity.ToTable("AMENITIES");

            entity.HasIndex(e => e.AmenityName, "UQ_AMENITIES_AMENITY_NAME").IsUnique();

            entity.Property(e => e.AmenityId).HasColumnName("amenity_id");
            entity.Property(e => e.Active)
                .HasDefaultValue(true)
                .HasColumnName("active");
            entity.Property(e => e.AmenityName)
                .HasMaxLength(100)
                .HasColumnName("amenity_name");
        });

        modelBuilder.Entity<Bed>(entity =>
        {
            entity.ToTable("BEDS");

            entity.HasIndex(e => e.BedStatusId, "IX_BEDS_BED_STATUS_ID");

            entity.HasIndex(e => new { e.RoomId, e.BedNumber }, "UQ_BEDS_ROOM_NUMBER").IsUnique();

            entity.Property(e => e.BedId).HasColumnName("bed_id");
            entity.Property(e => e.Active)
                .HasDefaultValue(true)
                .HasColumnName("active");
            entity.Property(e => e.BedNumber).HasColumnName("bed_number");
            entity.Property(e => e.BedStatusId).HasColumnName("bed_status_id");
            entity.Property(e => e.RoomId).HasColumnName("room_id");

            entity.HasOne(d => d.BedStatus).WithMany(p => p.Beds)
                .HasForeignKey(d => d.BedStatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BEDS_BED_STATUSES");

            entity.HasOne(d => d.Room).WithMany(p => p.Beds)
                .HasForeignKey(d => d.RoomId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BEDS_ROOMS");
        });

        modelBuilder.Entity<BedStatus>(entity =>
        {
            entity.ToTable("BED_STATUSES");

            entity.HasIndex(e => e.StatusName, "UQ_BED_STATUSES_STATUS_NAME").IsUnique();

            entity.Property(e => e.BedStatusId).HasColumnName("bed_status_id");
            entity.Property(e => e.StatusName)
                .HasMaxLength(50)
                .HasColumnName("status_name");
        });

        modelBuilder.Entity<Country>(entity =>
        {
            entity.ToTable("COUNTRIES");

            entity.HasIndex(e => e.CountryName, "UQ_COUNTRIES_COUNTRY_NAME").IsUnique();

            entity.Property(e => e.CountryId).HasColumnName("country_id");
            entity.Property(e => e.CountryName)
                .HasMaxLength(100)
                .HasColumnName("country_name");
        });

        modelBuilder.Entity<Guest>(entity =>
        {
            entity.ToTable("GUESTS");

            entity.HasIndex(e => e.CountryId, "IX_GUESTS_COUNTRY_ID");

            entity.HasIndex(e => e.Dni, "UX_GUESTS_DNI")
                .IsUnique()
                .HasFilter("([dni] IS NOT NULL)");

            entity.HasIndex(e => e.Passport, "UX_GUESTS_PASSPORT")
                .IsUnique()
                .HasFilter("([passport] IS NOT NULL)");

            entity.HasIndex(e => e.UserId, "UX_GUESTS_USER_ID")
                .IsUnique()
                .HasFilter("([user_id] IS NOT NULL)");

            entity.Property(e => e.GuestId).HasColumnName("guest_id");
            entity.Property(e => e.Active)
                .HasDefaultValue(true)
                .HasColumnName("active");
            entity.Property(e => e.CountryId).HasColumnName("country_id");
            entity.Property(e => e.Dni)
                .HasMaxLength(20)
                .HasColumnName("dni");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .HasColumnName("first_name");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .HasColumnName("last_name");
            entity.Property(e => e.Passport)
                .HasMaxLength(20)
                .HasColumnName("passport");
            entity.Property(e => e.Phone)
                .HasMaxLength(30)
                .HasColumnName("phone");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Country).WithMany(p => p.Guests)
                .HasForeignKey(d => d.CountryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_GUESTS_COUNTRIES");

            entity.HasOne(d => d.User).WithOne(p => p.Guest)
                .HasForeignKey<Guest>(d => d.UserId)
                .HasConstraintName("FK_GUESTS_USERS");
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.ToTable("RESERVATIONS");

            entity.HasIndex(e => new { e.CheckIn, e.CheckOut }, "IX_RESERVATIONS_DATES");

            entity.HasIndex(e => e.GuestId, "IX_RESERVATIONS_GUEST_ID");

            entity.Property(e => e.ReservationId).HasColumnName("reservation_id");
            entity.Property(e => e.CheckIn).HasColumnName("check_in");
            entity.Property(e => e.CheckOut).HasColumnName("check_out");
            entity.Property(e => e.GuestId).HasColumnName("guest_id");
            entity.Property(e => e.ReservationStatusId).HasColumnName("reservation_status_id");
            entity.Property(e => e.ReservedAt)
                .HasPrecision(0)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("reserved_at");

            entity.HasOne(d => d.Guest).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.GuestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RESERVATIONS_GUESTS");

            entity.HasOne(d => d.ReservationStatus).WithMany(p => p.Reservations)
                .HasForeignKey(d => d.ReservationStatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RESERVATIONS_RESERVATION_STATUSES");

            entity.HasMany(d => d.Beds).WithMany(p => p.Reservations)
                .UsingEntity<Dictionary<string, object>>(
                    "ReservationBed",
                    r => r.HasOne<Bed>().WithMany()
                        .HasForeignKey("BedId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_RESERVATION_BEDS_BEDS"),
                    l => l.HasOne<Reservation>().WithMany()
                        .HasForeignKey("ReservationId")
                        .HasConstraintName("FK_RESERVATION_BEDS_RESERVATIONS"),
                    j =>
                    {
                        j.HasKey("ReservationId", "BedId");
                        j.ToTable("RESERVATION_BEDS", tb => tb.HasTrigger("TR_RESERVATION_BEDS_NO_OVERLAP"));
                        j.HasIndex(new[] { "BedId" }, "IX_RESERVATION_BEDS_BED_ID");
                        j.IndexerProperty<int>("ReservationId").HasColumnName("reservation_id");
                        j.IndexerProperty<int>("BedId").HasColumnName("bed_id");
                    });
        });

        modelBuilder.Entity<ReservationStatus>(entity =>
        {
            entity.ToTable("RESERVATION_STATUSES");

            entity.HasIndex(e => e.StatusName, "UQ_RESERVATION_STATUSES_STATUS_NAME").IsUnique();

            entity.Property(e => e.ReservationStatusId).HasColumnName("reservation_status_id");
            entity.Property(e => e.StatusName)
                .HasMaxLength(50)
                .HasColumnName("status_name");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("ROLES");

            entity.HasIndex(e => e.RoleName, "UQ_ROLES_ROLE_NAME").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .HasColumnName("role_name");
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.ToTable("ROOMS");

            entity.HasIndex(e => e.RoomTypeId, "IX_ROOMS_ROOM_TYPE_ID");

            entity.HasIndex(e => e.RoomNumber, "UQ_ROOMS_ROOM_NUMBER").IsUnique();

            entity.Property(e => e.RoomId).HasColumnName("room_id");
            entity.Property(e => e.Active)
                .HasDefaultValue(true)
                .HasColumnName("active");
            entity.Property(e => e.Floor).HasColumnName("floor");
            entity.Property(e => e.PricePerNight)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price_per_night");
            entity.Property(e => e.RoomNumber)
                .HasMaxLength(10)
                .HasColumnName("room_number");
            entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");

            entity.HasOne(d => d.RoomType).WithMany(p => p.Rooms)
                .HasForeignKey(d => d.RoomTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ROOMS_ROOM_TYPES");

            entity.HasMany(d => d.Amenities).WithMany(p => p.Rooms)
                .UsingEntity<Dictionary<string, object>>(
                    "RoomAmenity",
                    r => r.HasOne<Amenity>().WithMany()
                        .HasForeignKey("AmenityId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_ROOM_AMENITIES_AMENITIES"),
                    l => l.HasOne<Room>().WithMany()
                        .HasForeignKey("RoomId")
                        .HasConstraintName("FK_ROOM_AMENITIES_ROOMS"),
                    j =>
                    {
                        j.HasKey("RoomId", "AmenityId");
                        j.ToTable("ROOM_AMENITIES");
                        j.HasIndex(new[] { "AmenityId" }, "IX_ROOM_AMENITIES_AMENITY_ID");
                        j.IndexerProperty<int>("RoomId").HasColumnName("room_id");
                        j.IndexerProperty<int>("AmenityId").HasColumnName("amenity_id");
                    });
        });

        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.ToTable("ROOM_TYPES");

            entity.HasIndex(e => e.TypeName, "UQ_ROOM_TYPES_TYPE_NAME").IsUnique();

            entity.Property(e => e.RoomTypeId).HasColumnName("room_type_id");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.TypeName)
                .HasMaxLength(50)
                .HasColumnName("type_name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("USERS");

            entity.HasIndex(e => e.RoleId, "IX_USERS_ROLE_ID");

            entity.HasIndex(e => e.Email, "UQ_USERS_EMAIL").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Active)
                .HasDefaultValue(true)
                .HasColumnName("active");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .HasColumnName("first_name");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .HasColumnName("last_name");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("password_hash");
            entity.Property(e => e.RoleId).HasColumnName("role_id");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_USERS_ROLES");
        });

        modelBuilder.Entity<VReservationTotal>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("V_RESERVATION_TOTALS");

            entity.Property(e => e.Nights).HasColumnName("nights");
            entity.Property(e => e.ReservationId).HasColumnName("reservation_id");
            entity.Property(e => e.Total)
                .HasColumnType("decimal(38, 2)")
                .HasColumnName("total");
        });

        modelBuilder.Entity<VRoomCapacity>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("V_ROOM_CAPACITIES");

            entity.Property(e => e.Capacity).HasColumnName("capacity");
            entity.Property(e => e.RoomId).HasColumnName("room_id");
            entity.Property(e => e.RoomNumber)
                .HasMaxLength(10)
                .HasColumnName("room_number");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
