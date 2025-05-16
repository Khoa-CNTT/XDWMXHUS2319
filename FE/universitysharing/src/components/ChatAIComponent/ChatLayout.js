import React, { useState } from "react";
import ChatInterface from "./ChatInterface";
import "./ChatLayout.scss";
import ConversationList from "./ConversationList";

const ChatLayout = () => {
  const [conversationId, setConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNewChat = () => {
    setConversationId(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="chat-layout">
      <ChatInterface
        conversationId={conversationId}
        setConversationId={setConversationId}
        toggleSidebar={toggleSidebar}
        onNewChat={handleNewChat}
      />
      <ConversationList
        setConversationId={setConversationId}
        isOpen={sidebarOpen}
        onNewChat={handleNewChat}
      />
    </div>
  );
};

export default ChatLayout;
