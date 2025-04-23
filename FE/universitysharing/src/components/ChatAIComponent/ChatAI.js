import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSignalR } from '../../Service/SignalRProvider';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchChatHistory,
  sendQuery,
  createNewConversation,
  connectSignalR,
  clearConversation
} from '../../stores/action/ChatAI';
import ConversationList from '../../components/ChatAIComponent/ConversationList';
import MessageBubble from '../../components/ChatAIComponent/MessageBubble';
import { Menu, ArrowLeft } from 'react-feather';

const ChatAI = () => {
  const dispatch = useDispatch();
  const { userId } = useAuth();
  const { signalRService, isConnected } = useSignalR();
  const { currentConversation, status, error } = useSelector(state => state.chatAI);
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    console.log('[ChatAI] Trạng thái input:', {
      status,
      isConnected,
      userId,
      disabled: status === 'loading' || status === 'streaming' || !isConnected || !userId
    });
  }, [status, isConnected, userId]);
  useEffect(() => {
    console.log('[ChatAI] Kiểm tra SignalR:', {
      userId: !!userId,
      isConnected,
      signalRService: !!signalRService,
      aiConnection: !!signalRService?.aiConnection,
      conversationId: currentConversation.conversationId
    });
    
    if (!userId || !isConnected || !signalRService || !signalRService.aiConnection) {
      console.warn('[ChatAI] SignalR không sẵn sàng, bỏ qua connectSignalR');
      return;
    }
  
    if (currentConversation.conversationId) {
      console.log('[ChatAI] Tham gia SignalR cho hội thoại:', currentConversation.conversationId);
      dispatch(connectSignalR({ 
        conversationId: currentConversation.conversationId, 
        action: 'join',
        signalRService // Truyền signalRService trực tiếp
      }))
        .catch(err => console.error('[ChatAI] Lỗi tham gia SignalR:', err.message));
    }
  
    return () => {
      if (currentConversation.conversationId) {
        console.log('[ChatAI] Rời SignalR cho hội thoại:', currentConversation.conversationId);
        dispatch(connectSignalR({ 
          conversationId: currentConversation.conversationId, 
          action: 'leave',
          signalRService // Truyền signalRService trực tiếp
        }))
          .catch(err => console.error('[ChatAI] Lỗi rời SignalR:', err.message));
      }
    };
  }, [currentConversation.conversationId, isConnected, signalRService, userId, dispatch]);

  const handleSendQuery = (e) => {
    if (e.key !== 'Enter' && e.type !== 'click') return;
    if (!query.trim() || !userId || !isConnected) return;

    dispatch(sendQuery({ query, userId, conversationId: currentConversation.conversationId }));
    setQuery('');
  };

  const handleCreateConversation = () => {
    if (!userId) {
      console.error('[handleCreateConversation] Thiếu userId');
      return;
    }
    dispatch(clearConversation()); // Reset trạng thái trước khi tạo mới
    dispatch(createNewConversation({ userId }))
      .catch(err => console.error('[handleCreateConversation] Lỗi:', err.message));
  };

  const handleSelectConversation = (conversationId) => {
    if (!userId || conversationId === currentConversation.conversationId) return;
    dispatch(clearConversation()); // Reset trạng thái
    dispatch(fetchChatHistory({ userId, conversationId, pageSize: 10 }))
      .catch(err => console.error('[handleSelectConversation] Lỗi:', err.message));
  };

  return (
    <div className="chat-container">
      <button
        className="conversation-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ArrowLeft size={20} /> : <Menu size={20} />}
      </button>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ConversationList
          userId={userId}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
        />
      </div>

      <div className="chat-main">
        {currentConversation.conversationId ? (
          <>
            <div className="messages">
              {currentConversation.messages.length === 0 ? (
                <div className="welcome">
                  <h2>Chào mừng bạn đến với trò chuyện AI</h2>
                  <p>Bắt đầu trò chuyện bằng cách nhập câu hỏi vào ô bên dưới</p>
                </div>
              ) : (
                currentConversation.messages.map(message => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              {status === 'streaming' && <div className="streaming">Đang trả lời...</div>}
            </div>
            <div className="input-area">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleSendQuery}
                placeholder="Nhập câu hỏi..."
                disabled={status === 'loading' || status === 'streaming' || !isConnected || !userId}
              />
              <button
                onClick={handleSendQuery}
                disabled={status === 'loading' || status === 'streaming' || !query.trim() || !isConnected || !userId}
              >
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div className="messages">
            <div className="welcome">
              <h2>Chào mừng bạn đến với trò chuyện AI</h2>
              <p>Vui lòng chọn một hội thoại hoặc tạo mới để bắt đầu</p>
            </div>
          </div>
        )}
        {status === 'loading' && <div className="loading">Đang tải...</div>}
        {error && <div className="error">Lỗi: {error.message || 'Có lỗi xảy ra'}</div>}
      </div>
    </div>
  );
};

export default ChatAI;