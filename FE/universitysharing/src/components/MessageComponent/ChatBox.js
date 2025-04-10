import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  FaTimes,
  FaEllipsisV,
  FaVideo,
  FaPhone,
  FaSearch,
  FaPaperclip,
  FaSmile,
  FaMicrophone,
} from "react-icons/fa";
import "../../styles/MessageView/ChatBox.scss";
import avatarDefaut from "../../assets/AvatarDefault.png";
import signalRService from "../../Service/signalRService";
import {
  getConversation,
  getMessages,
  sendMessage,
  markMessageAsSeen,
} from "../../stores/action/messageAction";
import { jwtDecode } from "jwt-decode";

const ChatBox = ({ friendId, onClose }) => {
  const { friends } = useSelector((state) => state.friends);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const activeFriend = friends.find((friend) => friend.friendId === friendId);
  const token = localStorage.getItem("token");
  const userId = token
    ? jwtDecode(token)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
    : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMoreMessages = async () => {
    if (!hasMore || !conversationId) return;
    try {
      const data = await getMessages(conversationId, nextCursor);
      if (data.messages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => {
          const newMessages = data.messages.reverse().filter(
            (msg) => !prev.some((existing) => existing.id === msg.id)
          );
          return [...newMessages, ...prev];
        });
        setNextCursor(data.nextCursor);
      }
    } catch (error) {
      console.error("Lỗi khi tải thêm tin nhắn:", error);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      console.error("Không có token hoặc userId");
      return;
    }

    const initializeChat = async () => {
      try {
        const conversation = await getConversation(friendId);
        setConversationId(conversation.id);

        const history = await getMessages(conversation.id);
        setMessages(history.messages.reverse() || []);
        setNextCursor(history.nextCursor);
        setHasMore(history.messages.length > 0);
        scrollToBottom();

        await signalRService.startConnection(token);
        await signalRService.joinConversation(conversation.id.toString());

        signalRService.onReceiveMessage((message) => {
          console.log("Received message:", message);
          setMessages((prev) => {
            // Chỉ thêm nếu tin nhắn chưa tồn tại và không phải do mình gửi
            if (!prev.some((msg) => msg.id === message.id) && message.senderId !== userId) {
              return [...prev, message];
            }
            return prev;
          });
          if (message.senderId !== userId) {
            scrollToBottom();
            console.log(`Thông báo: Bạn có tin nhắn mới từ ${activeFriend?.fullNameFriend}: ${message.content}`);
          }
        });

        signalRService.onMessageDelivered((messageId) => {
          console.log("Message delivered:", messageId);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, status: "Delivered", deliveredAt: new Date() } : msg
            )
          );
        });

        signalRService.onMessageSeen((messageId) => {
          setTimeout(() => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === messageId ? { ...msg, status: "Seen", seenAt: new Date() } : msg
              )
            );
          }, 1000); // 1 second delay
        });
      } catch (error) {
        console.error("Lỗi khi khởi tạo chat:", error);
      }
    };

    initializeChat();

    return () => {
      if (conversationId) signalRService.leaveConversation(conversationId.toString());
    };
  }, [friendId, token, userId, activeFriend]);

  useEffect(() => {
    const markUnseenMessages = async () => {
      // Find the last unseen message from this friend
      const lastUnseenMessage = messages
        .filter(msg => msg.senderId === friendId && msg.status !== "Seen")
        .pop();
  
      if (lastUnseenMessage && conversationId) {
        try {
          await markMessageAsSeen(lastUnseenMessage.id, conversationId);
          await signalRService.markMessageAsSeen(conversationId.toString(), lastUnseenMessage.id);
        } catch (error) {
          console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
        }
      }
    };
  
    if (conversationId && messages.length > 0) {
      markUnseenMessages();
    }
  }, [messages, conversationId, friendId]);

  useEffect(() => {
    const handleScroll = () => {
      const container = messagesContainerRef.current;
      if (container && container.scrollTop === 0 && hasMore) {
        loadMoreMessages();
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [hasMore, conversationId, nextCursor]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const messageDto = {
      user2Id: friendId,
      content: newMessage,
    };

    try {
      const sentMessage = await sendMessage(messageDto);
      setMessages((prev) => {
        if (!prev.some((msg) => msg.id === sentMessage.id)) {
          return [...prev, sentMessage];
        }
        return prev;
      });
      setConversationId(sentMessage.conversationId);
      await signalRService.sendMessage(sentMessage.conversationId.toString(), sentMessage);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
      setIsUserTyping(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value && isInputFocused) {
      setIsUserTyping(true);
    } else {
      setIsUserTyping(false);
    }
  };

  const handleFocus = () => {
    setIsInputFocused(true);
    if (newMessage.trim()) setIsUserTyping(true);
  };

  const handleBlur = () => {
    setIsInputFocused(false);
    setIsUserTyping(false);
  };

  const getMessageStatus = (message, index) => {
    if (message.senderId !== userId) return null;
    
    // Only show status on the last message you sent
    const isLastMessage = index === messages.length - 1 || 
      messages[index + 1]?.senderId !== userId;
  
    if (!isLastMessage) return null;
  
    switch (message.status) {
      case "Sent":
        return <span className="status sent">✓<span className="seen-text">Đã gửi</span></span>;
      case "Delivered":
        return <span className="status delivered">✓✓<span className="seen-text">Đã nhận</span></span>;
      case "Seen":
        return <span className="status seen">✓✓ <span className="seen-text">Đã xem</span></span>;
      default:
        return null;
    }
  };

  return (
    <div className={`chat-box ${isMinimized ? "minimized" : ""}`}>
      <div className="chat-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="user-info">
          <img src={avatarDefaut} alt={activeFriend?.fullNameFriend} />
          <span>{activeFriend?.fullNameFriend}</span>
          <span className="status-dot online"></span>
        </div>
        <div className="header-actions">
          <button className="action-btn"><FaVideo /></button>
          <button className="action-btn"><FaPhone /></button>
          <button className="action-btn"><FaSearch /></button>
          <button className="action-btn"><FaEllipsisV /></button>
          <button
            className="action-btn close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chat-messages" ref={messagesContainerRef}>
          {messages.map((message, index) => (
              <div
                key={message.id}
                className={`message ${message.senderId === userId ? "me" : "them"}`}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {new Date(message.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {getMessageStatus(message, index)}
                </div>
              </div>
            ))}
            {isFriendTyping && (
              <div className="message them typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            {isUserTyping && (
              <div className="message me typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-input" onSubmit={handleSendMessage}>
            <div className="input-tools">
              <button type="button" className="tool-btn"><FaPaperclip /></button>
              <button type="button" className="tool-btn"><FaSmile /></button>
            </div>
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyPress}
              placeholder="~/Type a message..."
              rows="1"
            />
            <button
              type="submit"
              className={`send-btn ${newMessage.trim() ? "active" : ""}`}
              disabled={!newMessage.trim()}
            >
              {newMessage.trim() ? (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"
                  />
                </svg>
              ) : (
                <FaMicrophone />
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;