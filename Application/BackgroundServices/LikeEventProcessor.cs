using Application.Interface;
using Application.Model.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.BackgroundServices
{
    public class LikeEventProcessor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public LikeEventProcessor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _serviceProvider.CreateScope();
                var redisService = scope.ServiceProvider.GetRequiredService<ICacheService>();
                var likeRepository = scope.ServiceProvider.GetRequiredService<ILikeRepository>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                var likeEvents = await redisService.GetAsync<List<LikeEvent>>("like_events");

                if (likeEvents?.Any() == true)
                {
                    await unitOfWork.BeginTransactionAsync(); // 🛠 Bắt đầu transaction

                    try
                    {
                        var likeEntities = likeEvents.Select(e => new Like(e.UserId, e.PostId)).ToList();
                        await likeRepository.AddRangeAsync(likeEntities);
                        await unitOfWork.SaveChangesAsync();
                        await unitOfWork.CommitTransactionAsync(); // ✅ Commit transaction
                        await redisService.RemoveAsync("like_events");
                    }
                    catch (Exception)
                    {
                        await unitOfWork.RollbackTransactionAsync(); // ❌ Rollback nếu có lỗi
                        throw;
                    }
                }
                await Task.Delay(5000, stoppingToken); // Chạy lại sau 1 giây
            }
        }


    }
}
