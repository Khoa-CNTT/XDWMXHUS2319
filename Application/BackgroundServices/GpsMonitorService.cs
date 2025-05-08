using Application.Interface.Hubs;
using Application.Services;
using Domain.Interface;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using static Domain.Common.Enums;

namespace Application.BackgroundServices
{
    public class GpsMonitorService : BackgroundService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public GpsMonitorService(IServiceScopeFactory serviceScopeFactory)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }



        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceScopeFactory.CreateScope())
                {
                    var rideRepository = scope.ServiceProvider.GetRequiredService<IRideRepository>();
                    var locationUpdateRepo = scope.ServiceProvider.GetRequiredService<ILocationUpdateRepository>();
                    var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                    var _unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    var activeRides = await rideRepository.GetActiveRidesAsync();
                    DateTime currentUtc = DateTime.UtcNow;

                    foreach (var ride in activeRides)
                    {
                        DateTime? lastDriverUpdate = await locationUpdateRepo.GetTimestampByRideIdAsync(ride.Id);
                        DateTime? lastPassengerUpdate = await locationUpdateRepo.GetPassengerLocationTimestampAsync(ride.PassengerId);

                        bool isSafetyTrackingEnabled = ride.IsSafetyTrackingEnabled; // Kiểm tra chế độ an toàn

                        if (lastDriverUpdate != null && (currentUtc - lastDriverUpdate) >= TimeSpan.FromMinutes(3))
                        {
                            if (currentUtc - lastDriverUpdate < TimeSpan.FromMinutes(5))
                            {
                                // Cảnh báo trong app trước
                                await notificationService.SendInAppNotificationAsync(ride.DriverId, "GPS có thể bị tắt! Hãy kiểm tra lại.");
                            }
                            else
                            {
                                // Cảnh báo mạnh hơn qua email/SMS
                                await notificationService.SendAlertAsync(ride.DriverId, "GPS đã bị tắt hơn 5 phút! Hãy bật lại ngay.");
                            }
                        }
                            // (1) Tài xế tắt GPS hơn 30 phút
                            if (lastDriverUpdate != null && (currentUtc - lastDriverUpdate) > TimeSpan.FromMinutes(30))
                            {
                            await notificationService.SendAlertAsync(ride.PassengerId, "🚨 Cảnh giác! Tài xế của bạn đã tắt GPS hơn 30 phút.");

                            try
                            {
                                var report = new RideReport(ride.Id, ride.PassengerId,AlertTypeEnums.DriverGPSOff, "🚨 Tài xế đã tắt GPS hơn 30 phút.");
                                await _unitOfWork.RideReportRepository.AddAsync(report);
                                await _unitOfWork.SaveChangesAsync();
                            }
                            catch (Exception ex)
                            {
                                throw new Exception("Lỗi khi lưu báo cáo DriverGPSOff: " + ex.Message);
                            }
                        }

                        // (2) Chuyến đi kéo dài bất thường
                        if ((currentUtc - ride.StartTime) > TimeSpan.FromMinutes(ride.EstimatedDuration + 120))
                        {
                            await notificationService.SendAlertAsync(ride.PassengerId, "⚠️ Chuyến đi kéo dài bất thường! Hãy kiểm tra tình trạng an toàn của bạn.");

                            await _unitOfWork.BeginTransactionAsync();
                            try
                            {
                                var report = new RideReport(ride.Id, ride.PassengerId, AlertTypeEnums.TripDelayed, "⚠️ Chuyến đi kéo dài bất thường.");
                                await _unitOfWork.RideReportRepository.AddAsync(report);
                                await _unitOfWork.SaveChangesAsync();
                                await _unitOfWork.CommitTransactionAsync();
                            }
                            catch (Exception ex)
                            {
                                await _unitOfWork.RollbackTransactionAsync();
                                throw new Exception("Lỗi khi lưu báo cáo TripDelayed: " + ex.Message);
                            }

                            // (2.1) Nếu khách hàng không phản hồi trong 10 phút, gửi lại cảnh báo
                            _ = Task.Delay(TimeSpan.FromMinutes(10)).ContinueWith(async _ =>
                            {
                                var lastResponse = await locationUpdateRepo.GetPassengerLocationTimestampAsync(ride.PassengerId);
                                if (lastResponse == null)
                                {
                                    await notificationService.SendAlertAsync(ride.PassengerId, "⚠️ Bạn vẫn chưa phản hồi! Hãy kiểm tra tình trạng an toàn ngay.");
                                }
                            });
                        }

                        // (3) Kiểm tra phản hồi sau khi chuyến đi kết thúc (chỉ khi bật chế độ an toàn)
                        if (isSafetyTrackingEnabled && ride.Status == StatusRideEnum.Completed && lastPassengerUpdate == null && (currentUtc - ride.EndTime) > TimeSpan.FromHours(3) )
                        {
                            await notificationService.SendAlertAsync(ride.PassengerId, "🚨 Bạn có an toàn không? Chuyến đi đã kết thúc hơn 2 giờ trước mà bạn chưa phản hồi.");

                            await _unitOfWork.BeginTransactionAsync();
                            try
                            {
                                var report = new RideReport(ride.Id, ride.PassengerId, AlertTypeEnums.NoResponse, "🚨 Hành khách chưa phản hồi sau khi chuyến đi kết thúc.");
                                await _unitOfWork.RideReportRepository.AddAsync(report);
                                await _unitOfWork.SaveChangesAsync();
                                await _unitOfWork.CommitTransactionAsync();
                            }
                            catch (Exception ex)
                            {
                                await _unitOfWork.RollbackTransactionAsync();
                                throw new Exception("Lỗi khi lưu báo cáo NoResponse: " + ex.Message);
                            }

                            // (3.1) Nếu khách hàng không phản hồi trong 24h, gửi cảnh báo đến số điện thoại khẩn cấp
                            //_ = Task.Delay(TimeSpan.FromHours(24)).ContinueWith(async _ =>
                            //{
                            //    var lastResponse = await locationUpdateRepo.GetPassengerLocationTimestampAsync(ride.PassengerId);
                            //    if (lastResponse == null)
                            //    {
                            //        var emergencyContact = await _userRepository.GetEmergencyContactAsync(ride.PassengerId);
                            //        if (!string.IsNullOrEmpty(emergencyContact))
                            //        {
                            //            await notificationService.SendSmsAsync(emergencyContact, "🚨 Cảnh báo! Hành khách chưa phản hồi trong 24 giờ sau khi chuyến đi kết thúc. Vui lòng kiểm tra.");
                            //        }
                            //    }
                            //});
                        }


                    }
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }



    }
}
