using Application.DTOs.Message;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class ChatHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public async Task JoinConversation(string conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
        }

        public async Task LeaveConversation(string conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
        }

        public async Task SendMessageToConversation(string conversationId, MessageDto message)
        {
            await Clients.Group(conversationId).SendAsync("ReceiveMessage", message);
        }

        public async Task MarkMessageAsSeen(string conversationId, Guid messageId)
        {
            await Clients.Group(conversationId).SendAsync("MessageSeen", messageId);
        }
    }
}
