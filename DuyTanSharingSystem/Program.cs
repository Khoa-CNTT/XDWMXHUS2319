using Infrastructure;
using Application;
using MediatR;
using Application.Model;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Application.CQRS.Commands.Users;
using Application.Interface.Hubs;
using DuyTanSharingSystem.Service;
using DuyTanSharingSystem.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddInfastructureServices(builder.Configuration);
builder.Services.AddScoped<INotificationService, NotificationService>();


// 🔹 Đăng ký Authentication & JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
var keyString = jwtSettings["Key"];
if (string.IsNullOrWhiteSpace(keyString))
{
    throw new Exception("⚠️ Jwt:Key không được để trống! Kiểm tra user-secrets hoặc appsettings.json.");
}
var key = Encoding.UTF8.GetBytes(keyString);
builder.Services.AddLogging();
// C?u hình logging ?? xu?t log ra console
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
//add signalR
builder.Services.AddSignalR();

//cấu hình JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("SmtpSettings"));
//


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication(); // ✅ Đảm bảo đăng nhập trước khi xác thực quyền
app.UseAuthorization();
//app.UseCors(); // ✅ Đặt trước SignalR

app.MapControllers();
app.MapHub<NotificationHub>("/NotificationHub"); // Đảm bảo đường dẫn chính xác
app.Run();
