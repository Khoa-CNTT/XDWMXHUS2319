using Application.Model.Events;
using Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.BackgroundServices
{
    public class UpdateLocationProcessor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        public UpdateLocationProcessor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _serviceProvider.CreateScope();
                var redisService = scope.ServiceProvider.GetRequiredService<ICacheService>();
                var updateLocationRepository = scope.ServiceProvider.GetRequiredService<ILocationUpdateRepository>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                var updateLocationEvents = await redisService.GetAsync<List<LocationUpdate>>("update_location_events");

              

                if (updateLocationEvents?.Any() == true)
                {
                    await unitOfWork.BeginTransactionAsync(); // 🛠 Bắt đầu transaction

                    try
                    {
                        var updateEntities = updateLocationEvents.Select(e => new LocationUpdate(e.RideId,e.UserId,e.Latitude,e.Longitude,e.IsDriver)).ToList();
                        // Chỉ cập nhật StartTime nếu nó chưa được set trước đó
                        var ride = await unitOfWork.RideRepository.GetByIdAsync(updateEntities.First().RideId);
                        if (ride == null)
                        {
                            throw new Exception("Ride not found");
                        }
                        await updateLocationRepository.AddRangeAsync(updateEntities);
                        await unitOfWork.SaveChangesAsync();
                        await unitOfWork.CommitTransactionAsync(); // ✅ Commit transaction
                        await redisService.RemoveAsync("update_location_events");
                    }
                    catch (Exception)
                    {
                        await unitOfWork.RollbackTransactionAsync(); // ❌ Rollback nếu có lỗi
                        throw;
                    }
                }
                await Task.Delay(60000, stoppingToken); // Chạy lại sau 60 giây
            }
        }
    }
}
