using Application.Model.Events;
using Domain.Entities;
using Domain.Interface;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.BackgroundServices
{
    public class LikeCommentEventProcessor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        public LikeCommentEventProcessor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _serviceProvider.CreateScope();
                var redisService = scope.ServiceProvider.GetRequiredService<ICacheService>();
                var likeCommentRepository = scope.ServiceProvider.GetRequiredService<ICommentLikeRepository>();
                var postRepository = scope.ServiceProvider.GetRequiredService<IPostRepository>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                string redisKey = "likeComment_events";
                var likeCommentEvents = await redisService.GetAsync<List<CommentLike>>(redisKey);

                if (likeCommentEvents?.Any() == true)
                {
                    await unitOfWork.BeginTransactionAsync(); // 🛠 Bắt đầu transaction

                    try
                    {
                        foreach (var likeCommentEvent in likeCommentEvents)
                        {
                            var existingLike = await unitOfWork.CommentLikeRepository.GetLikeAsync(likeCommentEvent.UserId, likeCommentEvent.CommentId);
                            if (existingLike != null)
                            {
                                // Nếu đã like, chuyển thành dislike
                                existingLike.SetLikeStatus(!existingLike.IsLike);
                                await unitOfWork.CommentLikeRepository.UpdateAsync(existingLike);
                            }
                            else
                            {
                                // Nếu chưa like, thì thêm like mới
                                var newLike = new CommentLike(likeCommentEvent.UserId, likeCommentEvent.CommentId);
                                await unitOfWork.CommentLikeRepository.AddAsync(newLike);
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
