import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../../stores/action/ChatAI';
import { Plus } from 'react-feather';

const ConversationList = ({ userId, onSelectConversation, onCreateConversation }) => {
  const dispatch = useDispatch();
  const { conversations, status, currentConversation } = useSelector(state => state.chatAI);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!userId || hasFetched || status === 'loading') return;
    dispatch(fetchConversations({ userId }))
      .then(() => setHasFetched(true));
  }, [userId, hasFetched, status, dispatch]);

  return (
    <div className="conversation-list">
      <div
        className="new-chat-button"
        onClick={onCreateConversation}
        disabled={status === 'loading' || !userId}
        style={{ cursor: status === 'loading' || !userId ? 'not-allowed' : 'pointer' }}
      >
        <Plus size={18} />
        <span>Cuộc trò chuyện mới</span>
      </div>

      <div className="conversation-list__items">
        {status === 'loading' && conversations.length === 0 ? (
          <div className="loading">Đang tải...</div>
        ) : conversations.length === 0 ? (
          <div className="empty">Chưa có hội thoại</div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.conversationId}
              className={`conversation-item ${conv.conversationId === currentConversation.conversationId ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv.conversationId)}
            >
              {conv.title || `Cuộc trò chuyện ${new Date(conv.createdAt).toLocaleDateString()}`}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;