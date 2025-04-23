import React from 'react';

const MessageBubble = ({ message }) => {
  return (
    <div className={`message-bubble ${message.role === 'user' ? 'user' : 'assistant'}`}>
      <div className="message-bubble__content">
        {message.content}
        {!message.isFinal && message.role === 'assistant' && <span className="streaming">...</span>}
      </div>
      <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
    </div>
  );
};

export default MessageBubble;