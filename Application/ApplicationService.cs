using Application.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System.Text;
using Application.CQRS.Commands.Users;
using Application.BackgroundServices;
using Application.Provider;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Domain.Common;
using Application.Interface.Hubs;
using Application.Interface.SearchAI;



namespace Application
{
    public static class ApplicationService
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Đăng ký MediatR
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(typeof(RegisterUserCommand).Assembly));

            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ILikeService, LikeService>();
            services.AddScoped<ISearchService, SearchService>();
            services.AddScoped<IShareService, ShareService>();
            services.AddScoped<ICommentLikeService, CommentLikeService>();

            //services.AddScoped<IPostService, PostService>();
            //services.AddHostedService<LikeEventProcessor>();

            services.AddScoped<MLService>();
            services.AddScoped<IRidePostService, RidePostService>();
            services.AddScoped<IRedisService, RedisService>();
            services.AddScoped<IPostService, PostService>();

            services.AddScoped<ITrustScoreService, TrustScoreService>();

            services.AddScoped<ICommentService, CommentService>();


            // Đăng ký File Service để lưu ảnh và video
            services.AddScoped<IFileService, FileService>();

            //background services
            //nếu ko làm việc liên quan đến like và LocationUpdate thì comment lại
            //services.AddHostedService<LikeEventProcessor>();
            //services.AddHostedService<UpdateLocationProcessor>();
            //services.AddHostedService<GpsMonitorService>();
            //services.AddHostedService<LikeCommentEventProcessor>();
            //services.AddHostedService<TrustScoreBackgroundService>();
            //đăng kí hub
            services.AddScoped<INotificationService, NotificationService>();
            // Đăng ký Auth Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IJwtProvider, JwtProvider>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            /*     services.AddScoped<MLService>();*/
            //đăn kí các service của search AI
            // services.AddScoped<IDocumentEmbeddingService,EmbeddingService>();
            services.AddScoped<ISearchAIService, SearchAIService>();




            // ✅ Đăng ký JwtSettings vào DI container
            services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

            var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>();
            if (jwtSettings == null || string.IsNullOrWhiteSpace(jwtSettings.Key))
            {
                throw new Exception("⚠️ Jwt:Key không được để trống! Kiểm tra user-secrets hoặc appsettings.json.");
            }

            var key = Encoding.UTF8.GetBytes(jwtSettings.Key);

            // ✅ Cấu hình Authentication & JWT
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings.Issuer,
                        ValidAudience = jwtSettings.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(key)
                    };
                    // ✅ Cho phép nhận JWT từ Query String nếu dùng WebSocket
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;

                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });
            // 🔹 Cấu hình Authorization
            services.AddAuthorization(options =>
            {
                options.AddPolicy(nameof(Enums.RoleEnum.User), policy 
                    => policy.RequireRole(Enums.RoleEnum.User.ToString()));
                options.AddPolicy(nameof(Enums.RoleEnum.Admin), policy
                    => policy.RequireRole(Enums.RoleEnum.Admin.ToString()));
            });
            return services;
        }
    }

}
