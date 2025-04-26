using Application.Interface.ChatAI;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class AIHub : Hub
    {
        private readonly IChatStreamingService _chatStreamingService;
        private readonly ILogger<AIHub> _logger;

        public AIHub(IChatStreamingService chatStreamingService, ILogger<AIHub> logger)
        {
            _chatStreamingService = chatStreamingService ?? throw new ArgumentNullException(nameof(chatStreamingService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task JoinConversation(string conversationId)
        {
            if (string.IsNullOrWhiteSpace(conversationId))
            {
                _logger.LogWarning("Invalid conversationId: {ConversationId}", conversationId);
                await Clients.Caller.SendAsync("ReceiveError", "Invalid conversation ID.");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
            _logger.LogInformation("Client {ConnectionId} joined conversation {ConversationId}", Context.ConnectionId, conversationId);
        }

        public async Task LeaveConversation(string conversationId)
        {
            if (string.IsNullOrWhiteSpace(conversationId))
            {
                _logger.LogWarning("Invalid conversationId: {ConversationId}", conversationId);
                await Clients.Caller.SendAsync("ReceiveError", "Invalid conversation ID.");
                return;
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
            _logger.LogInformation("Client {ConnectionId} left conversation {ConversationId}", Context.ConnectionId, conversationId);
        }

        public async Task StreamQuery(string query, string userId, string conversationId)
        {
            if (string.IsNullOrWhiteSpace(query) || string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(conversationId))
            {
                _logger.LogWarning("Invalid input: Query={Query}, UserId={UserId}, ConversationId={ConversationId}", query, userId, conversationId);
                await Clients.Caller.SendAsync("ReceiveError", "Query, UserId, or ConversationId cannot be empty.");
                return;
            }

            try
            {
                _logger.LogInformation("Streaming query: {Query}, UserId: {UserId}, ConversationId: {ConversationId}", query, userId, conversationId);

                // Retrieve access token
                var accessToken = Context.User?.FindFirst("access_token")?.Value
                    ?? Context.GetHttpContext()?.Request.Query["access_token"].ToString();
                if (string.IsNullOrWhiteSpace(accessToken))
                {
                    _logger.LogWarning("Access token not found");
                    throw new UnauthorizedAccessException("Access token not found in request");
                }

                // Stream response
                await foreach (var chunk in _chatStreamingService.StreamQueryAsync(query, userId, conversationId, accessToken, Context.ConnectionAborted))
                {
                    if (!string.IsNullOrEmpty(chunk))
                    {
                        _logger.LogDebug("Sending chunk: {Chunk}", chunk);
                        await Clients.Caller.SendAsync("ReceiveChunk", chunk);
                    }
                }

                _logger.LogInformation("Streaming completed for query: {Query}", query);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Unauthorized: {Message}", ex.Message);
                await Clients.Caller.SendAsync("ReceiveError", $"Unauthorized: {ex.Message}");
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Streaming canceled for query: {Query}", query);
                await Clients.Caller.SendAsync("ReceiveError", "Request canceled.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error streaming query: {Query}", query);
                await Clients.Caller.SendAsync("ReceiveError", $"Streaming error: {ex.Message}");
            }
        }
    }
}