import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatHistory, fetchConversations } from '../../stores/action/chatAIAction';
import './ConversationList.scss';

const ConversationList = ({ setConversationId, isOpen, onNewChat }) => {
  const dispatch = useDispatch();
  const { conversations, nextCursor, isLoading, error } = useSelector(
    (state) => state.chatAI
  );
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchConversations({ lastConversationId: null }))
      .finally(() => {
        setInitialLoading(false);
      });
  }, [dispatch]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoading) {
      dispatch(fetchConversations({ lastConversationId: nextCursor }));
    }
  };

  const handleConversationClick = (conversationId) => {
    console.log('[ConversationList] Clicking conversation:', conversationId);
    setConversationId(conversationId);
    dispatch(fetchChatHistory({ conversationId, lastMessageId: null }))
      .then((action) => {
        console.log('[ConversationList] fetchChatHistory response:', action.payload);
      })
      .catch((error) => {
        console.error('[ConversationList] Error fetching chat history:', error);
      });
  };

  return (
    <div className={`conversation-list ${isOpen ? 'open' : ''}`}>
      <div className="conversation-header">
        <h3>Lịch sử trò chuyện</h3>
        <button onClick={onNewChat} className="new-chat-btn">
          + Mới
        </button>
      </div>
      
      <div className="conversation-scroll">
        {initialLoading ? (
          <div className="loading-conversations">
            <div className="loading-spinner"></div>
            <span>Đang tải...</span>
          </div>
        ) : conversations.length > 0 ? (
          <ul>
            {conversations.map((conversation) => (
              <li
                key={conversation.conversationId}
                onClick={() => handleConversationClick(conversation.conversationId)}
                className="conversation-item"
              >
                <div className="conversation-title">
                  {conversation.title || 'Cuộc trò chuyện mới'}
                </div>
                <div className="conversation-preview">
                  {conversation.preview || '...'}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-conversations">
            Chưa có cuộc trò chuyện nào
          </div>
        )}
        
        {nextCursor && (
          <button 
            onClick={handleLoadMore} 
            disabled={isLoading}
            className="load-more-btn"
          >
            {isLoading ? 'Đang tải...' : 'Tải thêm'}
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ConversationList;