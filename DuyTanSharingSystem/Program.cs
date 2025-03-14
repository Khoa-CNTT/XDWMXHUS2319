using Infrastructure;
using Application;
using MediatR;
using Application.Model;
using Application.Interface.Hubs;
using DuyTanSharingSystem.Service;
using DuyTanSharingSystem.Hubs;
using Domain.Common;

var builder = WebApplication.CreateBuilder(args);
// 🔹 Nạp User Secrets (nếu đang ở môi trường Development)
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}
// Add services to the container.
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddInfastructureServices(builder.Configuration);
builder.Services.AddScoped<INotificationService, NotificationService>();



builder.Services.AddLogging();
// C?u hình logging ?? xu?t log ra console
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
//add signalR
builder.Services.AddSignalR();


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
