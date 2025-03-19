using Application.Interface.Hubs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;


namespace Application.BackgroundServices
{
    public class GpsMonitorService : BackgroundService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly ILogger<GpsMonitorService> _logger;

        public GpsMonitorService(IServiceScopeFactory serviceScopeFactory, ILogger<GpsMonitorService> logger)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _logger = logger;
        }



        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
         {
             while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        var rideRepository = scope.ServiceProvider.GetRequiredService<IRideRepository>();
                        var locationUpdateRepo = scope.ServiceProvider.GetRequiredService<ILocationUpdateRepository>();
                        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                        var activeRides = await rideRepository.GetActiveRidesAsync();
                        DateTime currentUtc = DateTime.UtcNow;

                        foreach (var ride in activeRides)
                        {
                            DateTime? lastUpdate = await locationUpdateRepo.GetTimestampByRideIdAsync(ride.Id);
                            if (lastUpdate == null) continue;

                            TimeSpan timeSinceLastUpdate = currentUtc - lastUpdate.Value;

                            if (timeSinceLastUpdate >= TimeSpan.FromMinutes(3))
                            {
                                _logger.LogWarning($"[CẢNH BÁO] Ride {ride.Id} mất GPS ({timeSinceLastUpdate.TotalMinutes} phút)");

                                if (timeSinceLastUpdate < TimeSpan.FromMinutes(5))
                                {
                                    await notificationService.SendInAppNotificationAsync(ride.DriverId, "GPS có thể bị tắt! Hãy kiểm tra lại.");
                                }
                                else
                                {
                                    await notificationService.SendAlertAsync(ride.DriverId, "GPS đã bị tắt hơn 5 phút! Hãy bật lại ngay.");
                                }
                            }
                        }
                    }

                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi chạy GPS Monitor Service");
                }
            }
        }


    }
}
