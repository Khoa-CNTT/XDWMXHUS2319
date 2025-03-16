using Application.Interface;
using Application.Interface.ContextSerivce;
using Application.Model;
using Application.Services;
using Infrastructure.Data.Repositories;
using Infrastructure.Data.UnitOfWork;
using Infrastructure.Email;
using Infrastructure.Gemini;
using Infrastructure.Redis;
using Infrastructure.Service;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            services.AddScoped<IUserContextService, UserContextService>();
            // ✅ Đăng ký HttpClient
            services.AddHttpClient();

            // ✅ Đăng ký GeminiService
            services.AddScoped<IGeminiService, GeminiService>();

            services.AddScoped<IUnitOfWork, UnitOfWork>(); // Đăng ký trước UserService
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IEmailService, EmailService>();


            return services;
        }
    }
}

