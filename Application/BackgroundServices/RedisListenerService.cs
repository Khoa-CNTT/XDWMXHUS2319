using Application.Interface.ChatAI;
using StackExchange.Redis;
using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Application.BackgroundServices
{
    public class RedisListenerService : BackgroundService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IServiceProvider _serviceProvider;

        public RedisListenerService(IConnectionMultiplexer redis, IServiceProvider serviceProvider)
        {
            _redis = redis;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var subscriber = _redis.GetSubscriber();
            await subscriber.SubscribeAsync(RedisChannel.Literal("answer_stream"), async (channel, message) =>
            {
            try
            {
                Console.WriteLine($"Received Redis message: {message}");
                using var scope = _serviceProvider.CreateScope();
                var chatStreamService = scope.ServiceProvider.GetRequiredService<IChatStreamService>();

                var json = message.ToString();
                if (string.IsNullOrWhiteSpace(json))
                {
                    Console.WriteLine("Empty Redis message, skipping...");
                    return;
                }

                var streamData = JsonSerializer.Deserialize<StreamMessage>(json);
                if (streamData == null)
                {
                    Console.WriteLine("Failed to deserialize Redis message, skipping...");
                    return;
                }

                await chatStreamService.ProcessStreamMessageAsync(
                    Guid.Parse(streamData.cid),
                    Guid.Parse(streamData.uid),
                    streamData.data ?? string.Empty,
                    streamData.final,
                    streamData.query ?? string.Empty,
                    streamData.answer ?? string.Empty,
                    streamData.tokens
                );
                Console.WriteLine($"Processed Redis message for conversation {streamData.cid}");
            }
            catch(Exception ex)
                {
                Console.WriteLine($"Error processing Redis message: {ex.Message}");
            }
            });

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }

            await subscriber.UnsubscribeAllAsync();
        }

        private class StreamMessage
        {
            public string cid { get; set; } = string.Empty;
            public string uid { get; set; } = string.Empty;
            public string data { get; set; } = string.Empty;
            public bool final { get; set; }
            public string query { get; set; } = string.Empty;
            public string answer { get; set; } = string.Empty;
            public int tokens { get; set; }
        }
    }
}