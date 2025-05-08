using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;
using System.Threading;
using Application.Interface.ChatAI;
using Microsoft.Extensions.Logging;

public class AIHub : Hub
{
    private readonly IChatStreamingService _chatStreamingService;
    private readonly ILogger<AIHub> _logger;
    private readonly IUserContextService _userContextService;

    public AIHub(IChatStreamingService chatStreamingService, ILogger<AIHub> logger, IUserContextService userContextService)
    {
        _chatStreamingService = chatStreamingService ?? throw new ArgumentNullException(nameof(chatStreamingService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _userContextService = userContextService;
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

    public async Task StreamQuery(string query, string conversationId, string streamId)
    {
        var userId = _userContextService.UserId().ToString();

        try
        {
            _logger.LogInformation("Streaming query: {Query}, UserId: {UserId}, ConversationId: {ConversationId}, StreamId: {StreamId}", query, userId, conversationId, streamId);

            var accessToken = Context.User?.FindFirst("access_token")?.Value
                ?? Context.GetHttpContext()?.Request.Query["access_token"].ToString();
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogWarning("Access token not found");
                throw new UnauthorizedAccessException("Access token not found in request");
            }

            await foreach (var (type, content) in _chatStreamingService.StreamQueryAsync(query, userId, conversationId, accessToken, streamId, Context.ConnectionAborted))
            {
                if (type == "chunk" && !string.IsNullOrEmpty(content.ToString()))
                {
                    _logger.LogDebug("Sending chunk: {Chunk}, StreamId: {StreamId}", content, streamId);
                    await Clients.Caller.SendAsync("ReceiveChunk", content, streamId);
                }
                else if (type == "complete")
                {
                    _logger.LogInformation("Sending complete data, StreamId: {StreamId}", streamId);
                    await Clients.Caller.SendAsync("ReceiveComplete", content, streamId);
                }
                else if (type == "final")
                {
                    _logger.LogInformation("Streaming completed for query: {Query}, StreamId: {StreamId}", query, streamId);
                    // Gửi nội dung cuối cùng như một chunk để FE tích lũy
                    //if (!string.IsNullOrEmpty(content.ToString()))
                    //{
                    //    await Clients.Caller.SendAsync("ReceiveChunk", content, streamId);
                    //}
                    await Clients.Caller.SendAsync("StreamCompleted", streamId);
                }
            }
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Unauthorized: {Message}", ex.Message);
            await Clients.Caller.SendAsync("ReceiveError", $"Unauthorized: {ex.Message}");
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Streaming canceled for query: {Query}, StreamId: {StreamId}", query, streamId);
            await Clients.Caller.SendAsync("ReceiveError", "Request canceled.");
            await Clients.Caller.SendAsync("StreamCompleted", streamId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error streaming query: {Query}, StreamId: {StreamId}", query, streamId);
            await Clients.Caller.SendAsync("ReceiveError", $"Streaming error: {ex.Message}");
        }
    }
}