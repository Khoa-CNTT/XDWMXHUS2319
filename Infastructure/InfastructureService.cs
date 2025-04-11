
namespace Infrastructure
{
    public static class InfastructureService
    {
        public static IServiceCollection AddInfastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Đăng ký DbContext với SQL Server
            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
            });
            // Đăng ký Redis ConnectionMultiplexer
            services.AddSingleton<IConnectionMultiplexer>(
                ConnectionMultiplexer.Connect(configuration.GetConnectionString("Redis") ?? "")
            );
            // Đăng ký User Secrets
            services.Configure<GeminiModel>(configuration.GetSection("GoogleGeminiApi"));
            services.Configure<GeminiModel2>(configuration.GetSection("GoogleGeminiApi2"));
            services.Configure<MapsKeyModel>(configuration.GetSection("GoogleMaps"));

           
            var geminiModel = configuration.GetSection("GoogleGeminiApi").Get<GeminiModel>();

            if (geminiModel == null || string.IsNullOrWhiteSpace(geminiModel.ApiKey))
            {
                throw new Exception("⚠️ Jwt:Key không được để trống! Kiểm tra user-secrets hoặc appsettings.json.");
            }



            // Đăng ký Cache Service
            services.AddScoped<ICacheService, RedisCacheService>();


            
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IEmailTokenRepository, EmailTokenRepository>();
            services.AddScoped<IPostRepository, PostRepository>();
            services.AddScoped<ILikeRepository, LikeRepository>();
            services.AddScoped<IRefreshtokenRepository, RefreshtokenRepository>();
            services.AddScoped<IRidePostRepository, RidePostRepository>();
            services.AddScoped<IRideRepository, RideRepository>();
            services.AddScoped<ILocationUpdateRepository, LocationUpdateRepository>();
            services.AddScoped<IReportRepository, ReportRepository>();
            services.AddScoped<IRideReportRepository, RideReportRepository>();
            services.AddScoped<IUserContextService, UserContextService>();
            services.AddScoped<IRatingRepository, RatingRepository>();
            services.AddScoped<IConversationRepository, ConversationRepository>();
            services.AddScoped<IMessageRepository, MessageRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();

            services.AddScoped<IShareRepository, ShareRepository>();
            services.AddScoped<ICommentRepository, CommentRepository>();
            services.AddScoped<ICommentLikeRepository, CommentLikeRepository>();
            services.AddScoped<IFriendshipRepository, FriendshipRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            //đăng kí cho search AI
            services.AddScoped<IDataAIService, DataAIService>();
            services.AddScoped<IApiPythonService, ApiPythonService>();
            //services.AddScoped<ISearchAIService, ApiPythonService2>();
            //đăng kí chat
            services.AddScoped<IChatService, ChatService>();


            // ✅ Đăng ký HttpClient
            services.AddHttpClient();

            // ✅ Đăng ký GeminiService
            services.AddScoped<IGeminiService, GeminiService>();
            services.AddScoped<IGeminiService2, GeminiService2>();
            // Đăng ký Google Maps và HERE Maps nhưng chưa chọn
            services.AddScoped<GoogleMapsService>();
            services.AddScoped<HereMapService>();
            // Đăng ký Factory
            services.AddScoped<MapServiceFactory>();
            // Đăng ký IMapService thông qua Factory
            services.AddScoped<IMapService>(sp => sp.GetRequiredService<MapServiceFactory>().Create());


            services.AddScoped<IUnitOfWork, UnitOfWork>(); // Đăng ký trước UserService
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IEmailService, EmailService>();

            //đăng kí hub
            services.AddScoped<ISignalRNotificationService, SignalRNotificationService>(); // Dùng SignalR để gửi thông báo
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(LikeEventHandler).Assembly));


            return services;
        }
    }
}

