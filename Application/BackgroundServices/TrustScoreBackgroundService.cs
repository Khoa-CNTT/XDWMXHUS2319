using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.BackgroundServices
{
    public class TrustScoreBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TrustScoreBackgroundService> _logger;

        public TrustScoreBackgroundService(IServiceProvider serviceProvider, ILogger<TrustScoreBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Thực thi cập nhật trust score
            using (var scope = _serviceProvider.CreateScope())
            {
                var trustScoreService = scope.ServiceProvider.GetRequiredService<ITrustScoreService>();
                _logger.LogInformation("Starting trust score update...");
                await trustScoreService.UpdateTrustScoreAsync();
                _logger.LogInformation("Trust score update completed.");
            }
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.UtcNow;
                    var nextRun = GetNextSaturday9Pm(now);
                    var delay = nextRun - now;

                    if (delay.TotalMilliseconds < 0) // Nếu đã qua 21h thứ Bảy
                    {
                        nextRun = nextRun.AddDays(7); // Chuyển sang tuần sau
                        delay = nextRun - now;
                    }

                    _logger.LogInformation($"Next trust score update scheduled at {nextRun:yyyy-MM-dd HH:mm:ss} UTC");
                    await Task.Delay(delay, stoppingToken);

                    // Thực thi cập nhật trust score
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var trustScoreService = scope.ServiceProvider.GetRequiredService<ITrustScoreService>();
                        _logger.LogInformation("Starting trust score update...");
                        await trustScoreService.UpdateTrustScoreAsync();
                        _logger.LogInformation("Trust score update completed.");
                    }
                }
                catch (TaskCanceledException)
                {
                    _logger.LogInformation("TrustScoreBackgroundService was canceled.");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while updating trust scores.");
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Delay ngắn để tránh lặp lỗi liên tục
                }
            }
        }

        private DateTime GetNextSaturday9Pm(DateTime from)
        {
            // Tính số ngày đến thứ Bảy tiếp theo
            var daysUntilSaturday = ((int)DayOfWeek.Saturday - (int)from.DayOfWeek + 7) % 7;
            var nextSaturday = from.Date.AddDays(daysUntilSaturday == 0 && from.Hour >= 21 ? 7 : daysUntilSaturday);
            return nextSaturday.AddHours(21); // 21h UTC
        }
    }
}
