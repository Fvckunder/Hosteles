using APIHostel.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Agrega los servicios al contenedor.

builder.Services.AddControllers();
// En desarrollo se puede usar una clave de firma por proceso para no tener que incluir
// un secreto en el repositorio; al reiniciar la API, esos tokens dejan de ser válidos.
// Los demás entornos deben proporcionar un secreto estable en Authentication:SigningKey,
// de al menos 32 bytes.
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

// Durante el desarrollo, el frontend se sirve por separado y puede usar el origen opaco
// "null" si se abre como archivo local. Esta política permite sus solicitudes JSON y las
// solicitudes de comprobación previa de CORS; se registra y aplica solo en desarrollo.
// No agregues AllowCredentials aquí: la API no usa autenticación basada en cookies.
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentFrontend", policy =>
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});
// Más información sobre cómo configurar Swagger/OpenAPI: https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Contexto de la base de datos
builder.Services.AddDbContext<HostelDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("HostelConnection")));


var app = builder.Build();

// Configura la canalización de solicitudes HTTP.
if (app.Environment.IsDevelopment())
{
    // Aplica CORS antes de los endpoints de los controladores para atender las solicitudes
    // de comprobación previa del navegador sin que lleguen a la acción. Este middleware
    // no se incluye en producción.
    app.UseCors("DevelopmentFrontend");
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
