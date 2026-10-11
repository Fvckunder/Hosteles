using APIHostel.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Development can use a per-process signing key so local setup does not require committing
// a secret; restarting the API invalidates those development tokens. Other environments
// must provide a stable Authentication:SigningKey secret of at least 32 bytes.
var configuredSigningKey = builder.Configuration["Authentication:SigningKey"];
var signingKeyText = string.IsNullOrWhiteSpace(configuredSigningKey)
    ? builder.Environment.IsDevelopment()
        ? Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
        : throw new InvalidOperationException("Authentication:SigningKey must be configured outside Development.")
    : configuredSigningKey;

if (Encoding.UTF8.GetByteCount(signingKeyText) < 32)
    throw new InvalidOperationException("Authentication:SigningKey must contain at least 32 bytes.");

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKeyText));
builder.Services.AddSingleton(signingKey);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();

// The frontend is served separately during development and can use the opaque "null"
// origin when opened as a local file. This policy permits its JSON requests and CORS
// preflight checks; it is intentionally registered and applied only in Development.
// Do not add AllowCredentials here: the API does not use cookie-based authentication.
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentFrontend", policy =>
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext
builder.Services.AddDbContext<HostelDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("HostelConnection")));


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Apply CORS before controller endpoints so browser preflight requests are handled
    // without reaching the action. This middleware is omitted from production below.
    app.UseCors("DevelopmentFrontend");
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
