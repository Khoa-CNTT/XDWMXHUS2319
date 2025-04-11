import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  const dispatch = useDispatch();
  const { friends } = useSelector((state) => state.friends);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const processedMessageIds = useRef(new Set()); // Theo dõi ID tin nhắn đã xử lý

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const initialLoad = useRef(true);
  const typingTimeoutRef = useRef(null);

  const activeFriend = friends.find((friend) => friend.friendId === friendId);
  const token = localStorage.getItem("token");
  const userId = token
    ? jwtDecode(token)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
    : null;

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior = "smooth") => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, []);

  // Check if near bottom
  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || !nextCursor || !conversationId) return;

    try {
      const container = messagesContainerRef.current;
      const prevScrollHeight = container.scrollHeight;

      const data = await dispatch(getMessages(conversationId, nextCursor));
      if (data.messages.length === 0) {
        setHasMore(false);
        return;
      }

      setMessages((prev) => {
        const newMessages = data.messages
          .reverse()
          .filter((msg) => !processedMessageIds.current.has(msg.id));
        newMessages.forEach((msg) => processedMessageIds.current.add(msg.id));
        return [...newMessages, ...prev];
      });

      setNextCursor(data.nextCursor || null);

      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight - prevScrollHeight;
      });
    } catch (error) {
      console.error("Error loading more messages:", error);
    }
  }, [conversationId, nextCursor, hasMore, dispatch]);

  // Initialize chat and SignalR
  useEffect(() => {
    if (!token || !userId) {
      console.error("No token or userId available");
      return;
    }

    const initializeChat = async () => {
      try {
        const conversation = await dispatch(getConversation(friendId));
        setConversationId(conversation.id);

        const history = await dispatch(getMessages(conversation.id));
        const initialMessages = history.messages || [];
        initialMessages.forEach((msg) => processedMessageIds.current.add(msg.id));
        setMessages(initialMessages);
        setNextCursor(history.nextCursor || null);
        setHasMore(!!history.nextCursor);

        setTimeout(() => {
          scrollToBottom("auto");
          initialLoad.current = false;
        }, 100);

        await signalRService.startConnection(token);
        await signalRService.joinConversation(conversation.id.toString());

        // Handle incoming messages
        signalRService.onReceiveMessage((message) => {
          if (processedMessageIds.current.has(message.id)) {
            console.log(`Bỏ qua tin nhắn lặp: ${message.id}`);
            return;
          }

          processedMessageIds.current.add(message.id);
          setMessages((prev) => [...prev, message]);

          
        });

        // Handle message delivered
        signalRService.onMessageDelivered((messageId) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, status: "Delivered", deliveredAt: new Date() } : msg
            )
          );
        });

        // Handle message seen
        signalRService.onMessageSeen((messageId) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, status: "Seen", seenAt: new Date() } : msg
            )
          );
        });

        // Handle typing indicator (nếu BE hỗ trợ)
        signalRService.onUserTyping((typingUserId) => {
          if (typingUserId === friendId) {
            setIsFriendTyping(true);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsFriendTyping(false), 2000);
          }
        });
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();

    return () => {
      if (conversationId) {
        signalRService.leaveConversation(conversationId.toString());
        signalRService.off("ReceiveMessage");
        signalRService.off("MessageDelivered");
        signalRService.off("MessageSeen");
        signalRService.off("UserTyping");
      }
    };
  }, [friendId, token, userId, dispatch, scrollToBottom]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!initialLoad.current && isNearBottom) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsNearBottom(checkIfNearBottom());
      const container = messagesContainerRef.current;
      if (container?.scrollTop === 0 && hasMore) {
        loadMoreMessages();
      }
    };

    const container = messagesContainerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadMoreMessages]);

  // Mark unseen messages as seen
  useEffect(() => {
    const markUnseenMessages = async () => {
      const unseenMessages = messages.filter(
        (msg) => msg.status !== "Seen" && msg.senderId !== userId
      );
      for (const msg of unseenMessages) {
        try {
          await dispatch(markMessageAsSeen(msg.id.toString(), conversationId));
          await signalRService.markMessageAsSeen(conversationId.toString(), msg.id.toString());
        } catch (error) {
          console.error("Error marking message as seen:", error);
        }
      }
    };
  
    if (conversationId && messages.length > 0) {
      markUnseenMessages();
    }
  }, [messages, conversationId, userId, dispatch]);

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageDto = { user2Id: friendId, content: newMessage };
    try {
      const sentMessage = await dispatch(sendMessage(messageDto));
      if (!processedMessageIds.current.has(sentMessage.id)) {
        processedMessageIds.current.add(sentMessage.id);
        setMessages((prev) => [...prev, sentMessage]);
      }
      setConversationId(sentMessage.conversationId);
      await signalRService.sendMessage(sentMessage.conversationId.toString(), sentMessage);
      setNewMessage("");
      setIsUserTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Typing handlers
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const isTyping = e.target.value.trim() && isInputFocused;
    setIsUserTyping(isTyping);

    if (conversationId && isTyping) {
      signalRService.sendTyping(conversationId.toString());
    }
  };

  const getMessageStatus = (message) => {
    if (message.senderId !== userId) return null;
    switch (message.status) {
      case "Sent":
        return <span className="status sent">✓</span>;
      case "Delivered":
        return <span className="status delivered">✓✓</span>;
      case "Seen":
        return <span className="status seen">Đã xem</span>;
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
            {messages.map((message) => (
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
                  {getMessageStatus(message)}
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
            <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
          </div>

          <form className="message-input" onSubmit={handleSendMessage}>
            <div className="input-tools">
              <button type="button" className="tool-btn"><FaPaperclip /></button>
              <button type="button" className="tool-btn"><FaSmile /></button>
            </div>
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => {
                setIsInputFocused(false);
                setIsUserTyping(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
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