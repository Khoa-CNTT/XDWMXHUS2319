using System.Linq;

public class MessageProcessingService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(5);
    private readonly int _maxMessagesPerBatch = 50;

    public MessageProcessingService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var redisService = scope.ServiceProvider.GetRequiredService<IRedisService>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var signalRService = scope.ServiceProvider.GetRequiredService<ISignalRNotificationService>(); // Thay INotificationService

                var conversationIds = await redisService.GetSetAsync("active_conversations");
                if (!conversationIds.Any())
                {
                    await Task.Delay(_checkInterval, stoppingToken);
                    continue;
                }

                var conversations = await unitOfWork.ConversationRepository
                    .GetManyAsync(c => conversationIds.Contains(c.Id.ToString()));

                foreach (var conversation in conversations)
                {
                    string queueKey = $"message_queue:{conversation.Id}";
                    var messageEvents = await redisService.GetListAsync<MessageEvent>(queueKey);
                    if (messageEvents == null || !messageEvents.Any())
                    {
                        await redisService.RemoveFromSetAsync("active_conversations", conversation.Id.ToString());
                        await redisService.RemoveDataAsync(queueKey);
                        continue;
                    }

                    var messagesToProcess = messageEvents.Take(_maxMessagesPerBatch).ToList();
                    var messagesToAdd = new List<Message>();
                    var processedMessageIds = new HashSet<string>();

                    foreach (var messageEvent in messagesToProcess)
                    {
                        var existingMessage = await unitOfWork.MessageRepository.GetByIdAsync(messageEvent.Id);
                        if (existingMessage != null)
                        {
                            processedMessageIds.Add(messageEvent.Id.ToString());
                            continue;
                        }

                        string processedKey = $"processed_messages:{conversation.Id}";
                        if (await redisService.IsMemberOfSetAsync(processedKey, messageEvent.Id.ToString()))
                        {
                            processedMessageIds.Add(messageEvent.Id.ToString());
                            continue;
                        }

                        var message = new Message(
                            messageEvent.ConversationId,
                            messageEvent.SenderId,
                            messageEvent.Content
                        );
                        messagesToAdd.Add(message);

                        processedMessageIds.Add(messageEvent.Id.ToString());
                        await redisService.AddToSetAsync(processedKey, messageEvent.Id.ToString(), TimeSpan.FromMinutes(30));
                    }

                    if (messagesToAdd.Any())
                    {
                        await unitOfWork.MessageRepository.AddRangeAsync(messagesToAdd);
                        await unitOfWork.SaveChangesAsync();
                    }

                    var updatedMessages = messageEvents.Where(m => !processedMessageIds.Contains(m.Id.ToString())).ToList();
                    if (updatedMessages.Any())
                    {
                        await redisService.SaveDataAsync(queueKey, updatedMessages, TimeSpan.FromMinutes(30));
                    }
                    else
                    {
                        await redisService.RemoveDataAsync(queueKey);
                        await redisService.RemoveFromSetAsync("active_conversations", conversation.Id.ToString());
                    }
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi xử lý tin nhắn từ Redis: {ex.Message}");
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }
    }
}