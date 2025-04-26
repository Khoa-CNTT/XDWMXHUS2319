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
                    var postRepository = scope.ServiceProvider.GetRequiredService<IPostRepository>();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                string redisKey = "like_events";
                var likeEvents = await redisService.GetAsync<List<Like>>(redisKey);
                
                if (likeEvents?.Any() == true)
                {
                    await unitOfWork.BeginTransactionAsync(); // 🛠 Bắt đầu transaction

                    try
                    {
                        foreach (var likeEvent in likeEvents)
                        {
                            var existingLike = await likeRepository.GetLikeByPostIdAsync(likeEvent.PostId, likeEvent.UserId);

                            if (existingLike == null)
                            {
                                // 🔹 Chưa like -> Thêm mới với trạng thái mặc định là true
                                existingLike = new Like(likeEvent.UserId, likeEvent.PostId);
                                await likeRepository.AddAsync(existingLike);
                            }
                            else
                            {
                                // 🔹 Toggle trạng thái like
                                existingLike.ToggleLike();
                                await likeRepository.UpdateAsync(existingLike);
                            }
                        }

                        // 📌 Lưu vào database
                        await unitOfWork.SaveChangesAsync();
                        await unitOfWork.CommitTransactionAsync();

                        // ✅ Xóa dữ liệu đã xử lý khỏi Redis
                        await redisService.RemoveAsync(redisKey);
                    }
                    catch (Exception)
                    {
                        await unitOfWork.RollbackTransactionAsync(); // ❌ Rollback nếu lỗi
                        throw;
                    }
                }

                await Task.Delay(5000, stoppingToken); // Chạy lại sau 5 giây
            }
        }



    }
}
