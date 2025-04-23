import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
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
import avatarDefault from "../../assets/AvatarDefault.png";
import { useSignalR } from "../../Service/SignalRProvider";
import { useAuth } from "../../contexts/AuthContext";
import {
  getConversation,
  getMessages,
  sendMessage, 
} from "../../stores/action/messageAction";
import { NotificationContext } from "../../contexts/NotificationContext";

const ChatBox = ({ friendId, onClose }) => {
  console.log("ChatBox render", { friendId });
  const dispatch = useDispatch();
  const { friends } = useSelector((state) => state.friends);
  const { signalRService, isConnected } = useSignalR();
  const { token, userId } = useAuth();
  const { resetTitle } = React.useContext(NotificationContext);
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
  const processedMessageIds = useRef(new Set());
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const initialLoad = useRef(true);
  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(0);
  const hasMarkedSeen = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const activeFriend = friends.find((friend) => friend.friendId === friendId);
  const [isSending, setIsSending] = useState(false);
  const TYPING_INTERVAL = 5000; // 5 giây

  /**
   * Hàm scrollToBottom: Cuộn khung tin nhắn xuống cuối.
   * - Mục đích: Đảm bảo người dùng luôn thấy tin nhắn mới nhất.
   * - Được gọi:
   *   - Trong useEffect khi tin nhắn mới được nhận và isNearBottom = true.
   *   - Trong initializeChat sau khi tải lịch sử tin nhắn.
   *   - Trong onReceiveMessage nếu isNearBottom = true.
   * @param {string} behavior - Hành vi cuộn ("smooth" hoặc "auto").
   */
  const scrollToBottom = useCallback((behavior = "smooth") => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, []);

  /**
   * Hàm checkIfNearBottom: Kiểm tra xem người dùng có đang ở gần cuối khung tin nhắn không.
   * - Mục đích: Quyết định xem có nên tự động cuộn xuống khi có tin nhắn mới.
   * - Được gọi:
   *   - Trong useEffect xử lý sự kiện cuộn (handleScroll).
   *   - Trong loadMoreMessages để duy trì vị trí cuộn.
   * @returns {boolean} - True nếu gần cuối, false nếu không.
   */
  const checkIfNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  /**
   * Hàm loadMoreMessages: Tải thêm tin nhắn cũ khi người dùng cuộn lên đầu.
   * - Mục đích: Lấy thêm lịch sử tin nhắn từ server và thêm vào danh sách.
   * - Được gọi:
   *   - Trong useEffect xử lý sự kiện cuộn khi scrollTop = 0 và hasMore = true.
   */
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || !nextCursor || !conversationId) return;

    try {
      const container = messagesContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      const data = await dispatch(
        getMessages(conversationId, nextCursor, 20, token)
      );
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
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch (error) {
      console.error("[ChatBox] Lỗi khi tải thêm tin nhắn:", {
        message: error.message,
        stack: error.stack,
      });
      toast.error("Không thể tải thêm tin nhắn");
    }
  }, [conversationId, nextCursor, hasMore, dispatch, token]);

  /**
   * Hàm markConversationAsSeen: Đánh dấu cuộc trò chuyện là đã xem.
   * - Mục đích: Gửi tín hiệu qua SignalR để đánh dấu tất cả tin nhắn là "Seen".
   * - Được gọi:
   *   - Trong useEffect khi có conversationId, messages và isConnected.
   *   - Trong handleSendMessage khi textarea được focus và chưa đánh dấu.
   */
  const markConversationAsSeen = useCallback(
    async (status) => {
      if (!conversationId || hasMarkedSeen.current || !isConnected) return;

      // 👇 Tìm tin nhắn cuối cùng mà BẠN nhận được từ người gửi (userId)
      const lastMessageFromUser = messages
        .filter((msg) => msg.senderId === friendId) // => đây là người gửi
        .slice(-1)[0];

      if (!lastMessageFromUser) return;
      if (lastMessageFromUser.status === "Seen") return;
      try {
        // Gửi ID của tin nhắn cuối cùng từ người gửi
        await signalRService.markMessagesAsSeen(
          lastMessageFromUser.id.toString(),
          status
        );
        hasMarkedSeen.current = true;
        console.log(
          "[ChatBox] Đã đánh dấu tin nhắn cuối cùng là Seen:",
          lastMessageFromUser.id
        );
        //resetTitle();
      } catch (error) {
        console.error("[ChatBox] Lỗi đánh dấu đã xem:", error);
        toast.error("Không thể đánh dấu tin nhắn đã xem");
      }
    },
    [conversationId, friendId, messages, isConnected, signalRService]
  );

  /**
   * Hàm handleSendMessage: Xử lý việc gửi tin nhắn mới.
   * - Mục đích: Gửi tin nhắn qua API và cập nhật UI khi cần.
   * - Được gọi:
   *   - Trong sự kiện onSubmit của form message-input.
   *   - Trong sự kiện onKeyDown của textarea khi nhấn Enter (không có Shift).
   * @param {Event} e - Sự kiện form.
   */
  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      const contentToSend = newMessage.trim();

      if (!contentToSend || !isConnected || isSending) {
        if (!isConnected) {
          console.warn(
            "[ChatBox] Không thể gửi tin nhắn: SignalR chưa kết nối"
          );
          toast.error("Không thể gửi tin nhắn: Chưa kết nối");
        }
        if (isSending) {
          console.warn("[ChatBox] Đang gửi tin nhắn, vui lòng chờ");
        }
        return;
      }

      const messageDto = {
        user2Id: friendId,
        content: contentToSend,
        conversationId,
      };

      setIsSending(true);

      try {
        console.log("[ChatBox] Gửi tin nhắn qua API:", messageDto);
        const sentMessage = await dispatch(sendMessage(messageDto, token));

        if (!sentMessage?.id) {
          throw new Error("Không nhận được tin nhắn từ server");
        }

        if (!conversationId && sentMessage.conversationId) {
          setConversationId(sentMessage.conversationId);
          console.log(
            "[ChatBox] Cập nhật conversationId:",
            sentMessage.conversationId
          );
          await signalRService.joinConversation(
            sentMessage.conversationId.toString()
          );
        }

        setNewMessage("");
        setIsUserTyping(false);
      } catch (error) {
        console.error("[ChatBox] Lỗi gửi tin nhắn:", {
          message: error.message,
          stack: error.stack,
        });
        toast.error(
          `Không thể gửi tin nhắn: ${error.message || "Lỗi không xác định"}`
        );
      } finally {
        setIsSending(false);
      }
    },
    [
      newMessage,
      friendId,
      conversationId,
      isConnected,
      isSending,
      dispatch,
      token,
      signalRService,
    ]
  );

  /**
   * Hàm handleTyping: Xử lý sự kiện người dùng nhập tin nhắn.
   * - Mục đích: Cập nhật trạng thái typing và gửi tín hiệu typing qua SignalR.
   * - Được gọi:
   *   - Trong sự kiện onChange của textarea.
   * @param {Event} e - Sự kiện input.
   */
  const handleTyping = useCallback(
    (e) => {
      setNewMessage(e.target.value);
      const isTyping = e.target.value.trim() && isInputFocused;
      setIsUserTyping(isTyping);

      const now = Date.now();

      if (
        conversationId &&
        isTyping &&
        isConnected &&
        now - lastTypingTimeRef.current > TYPING_INTERVAL
      ) {
        lastTypingTimeRef.current = now;
        signalRService
          .sendTyping(conversationId.toString(), friendId)
          .catch((err) =>
            console.error("[ChatBox] Lỗi gửi trạng thái typing:", err.message)
          );
      }
    },
    [conversationId, friendId, isInputFocused, isConnected, signalRService]
  );

  /**
   * Hàm getMessageStatus: Lấy trạng thái hiển thị của tin nhắn (Sending, Sent, Delivered, Seen).
   * - Mục đích: Hiển thị trạng thái của tin nhắn do người dùng gửi.
   * - Được gọi:
   *   - Trong phần render của danh sách tin nhắn (messages.map).
   * @param {Object} message - Tin nhắn cần kiểm tra.
   * @param {Array} messages - Danh sách tất cả tin nhắn.
   * @returns {JSX.Element|null} - Component trạng thái hoặc null.
   */
  useEffect(() => {
    signalRService.onMarkAsSeen(({ lastSeenMessageId, seenAt, status }) => {
      console.log(
        "Đã nhận MarkMessagesAsSeen:",
        lastSeenMessageId,
        seenAt,
        status
      );

      // Cập nhật status của message tương ứng trong danh sách messages
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === lastSeenMessageId ? { ...msg, status, seenAt } : msg
        )
      );
    });
//   }, []);

  }, [signalRService]);
  

  const getMessageStatus = useCallback(
    (message, messages) => {
      if (message.senderId !== userId) return null;

      const lastUserMessage = messages
        .filter((msg) => msg.senderId === userId)
        .slice(-1)[0];

      if (lastUserMessage && message.id === lastUserMessage.id) {
        console.log(
          `[ChatBox] Message ${message.id} status: ${message.status}`
        );
        switch (message.status) {
          case "Sending":
            return <span className="status sending">Đang gửi...</span>;
          case "Sent":
            return <span className="status sent">Đã gửi</span>;
          case "Delivered":
            return <span className="status delivered">Đã nhận</span>;
          case "Seen":
            return <span className="status seen">Đã xem</span>;
          case "Failed":
            return <span className="status failed">Thất bại</span>;
          default:
            return <span className="status unknown">Đang gửi...</span>;
        }
      }
      return null;
    },
    [userId]
  );

  // Effect khởi tạo cuộc trò chuyện
  useEffect(() => {
    if (!token || !userId || !friendId) {
      console.error("[ChatBox] Thiếu token, userId hoặc friendId:", {
        token: !!token,
        userId,
        friendId,
      });
      toast.error("Không thể tải cuộc trò chuyện: Thiếu thông tin");
      return;
    }

    let isMounted = true;
    let retryTimeout = null;

    /**
     * Hàm initializeChat: Khởi tạo cuộc trò chuyện, tải lịch sử tin nhắn và thiết lập SignalR.
     * - Mục đích: Thiết lập toàn bộ trạng thái ban đầu cho chat (conversation, messages, SignalR listeners).
     * - Được gọi:
     *   - Trong useEffect khi isConnected = true hoặc khi retry.
     */
    const initializeChat = async () => {
      try {
        console.log("[ChatBox] Khởi tạo chat với friendId:", friendId, {
          isConnected,
          retryCount: retryCountRef.current,
        });

        const conversation = await dispatch(getConversation(friendId, token));
        if (!isMounted) return;
        if (!conversation?.id) {
          throw new Error("Không lấy được conversation ID");
        }
        setConversationId(conversation.id);
        console.log("[ChatBox] ConversationId:", conversation.id);

        const history = await dispatch(
          getMessages(conversation.id, null, 20, token)
        );
        if (!isMounted) return;
        console.log("[ChatBox] Dữ liệu tin nhắn từ API:", history.messages);
        const initialMessages = history.messages || [];
        initialMessages.forEach((msg) =>
          processedMessageIds.current.add(msg.id)
        );
        setMessages(initialMessages);
        setNextCursor(history.nextCursor || null);
        setHasMore(!!history.nextCursor);

        setTimeout(() => {
          if (isMounted) {
            scrollToBottom("auto");
            initialLoad.current = false;
          }
        }, 100);

        if (!isConnected) {
          throw new Error("SignalR chưa kết nối");
        }
        await signalRService.joinConversation(conversation.id.toString());
        console.log(
          "[ChatBox] Tham gia conversation thành công:",
          conversation.id
        );

        signalRService.onReceiveMessage((message) => {
          console.log("[ChatBox] Nhận tin nhắn mới:", message);
          if (message.conversationId !== conversation.id.toString()) {
            return;
          }
          if (processedMessageIds.current.has(message.id)) {
            console.log(`[ChatBox] Bỏ qua tin nhắn lặp: ${message.id}`);
            return;
          }
          if (message.senderId === friendId) {
            setIsFriendTyping(false);
            clearTimeout(typingTimeoutRef.current);
          }
          processedMessageIds.current.add(message.id);
          setMessages((prev) => [...prev, message]);
          if (isNearBottom) scrollToBottom();
        });
        signalRService.onUserTyping((typingUserId) => {
          if (typingUserId === friendId.toString()) {
            setIsFriendTyping(true);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              if (isMounted) setIsFriendTyping(false);
            }, 5000);
          }
        });
        retryCountRef.current = 0;
      } catch (error) {
        console.error("[ChatBox] Lỗi khởi tạo chat:", {
          message: error.message,
          stack: error.stack,
          conversationId,
          isConnected,
        });
        if (retryCountRef.current < maxRetries && isMounted) {
          retryCountRef.current += 1;
          console.warn(
            `[ChatBox] Thử lại khởi tạo chat lần ${retryCountRef.current}/${maxRetries} sau 5s...`
          );
          retryTimeout = setTimeout(initializeChat, 5000);
        } else {
          toast.error(`Không thể tải cuộc trò chuyện: ${error.message}`);
        }
      }
    };

    if (isConnected) {
      initializeChat();
    } else {
      console.warn("[ChatBox] SignalR chưa kết nối, chờ kết nối...");
      retryTimeout = setTimeout(() => {
        if (isMounted && isConnected) {
          console.log("[ChatBox] SignalR đã kết nối, thử khởi tạo lại...");
          initializeChat();
        }
      }, 5000);
    }

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (conversationId) {
        signalRService
          .leaveConversation(conversationId.toString())
          .catch((err) =>
            console.error("[ChatBox] Lỗi rời conversation:", err.message)
          );
        signalRService.off("ReceiveMessage", signalRService.chatConnection);
        signalRService.off("MessagesDelivered", signalRService.chatConnection);
        signalRService.off("UserTyping", signalRService.chatConnection);
        signalRService.off(
          "ReceiveMessageNotification",
          signalRService.notificationConnection
        );
        hasMarkedSeen.current = false;
        console.log(
          "[ChatBox] Cleanup hoàn tất cho conversation:",
          conversationId
        );
      }
    };
  }, [
    friendId,
    token,
    userId,
    isConnected,
    dispatch,
    signalRService,
    scrollToBottom,
    conversationId,
    isNearBottom,
    resetTitle,
  ]);

  // Effect cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (!initialLoad.current && isNearBottom) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, isNearBottom]);

  // Effect xử lý sự kiện cuộn
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
  }, [hasMore, loadMoreMessages, checkIfNearBottom]);

  // Effect đánh dấu đã xem
  // useEffect(() => {
  //   console.log("Effect đánh dấu đã xem");

  //   if (conversationId && isConnected && !isMinimized) {
  //     markConversationAsSeen(1);
  //   }
  // }, [conversationId, messages, markConversationAsSeen, isConnected, isMinimized]);

  return (
    <div className={`chat-box ${isMinimized ? "minimized" : ""}`}>
      <div className="chat-header" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="user-info">
          <img
            src={activeFriend?.avatarFriend || avatarDefault}
            alt={activeFriend?.fullNameFriend}
          />
          <span>{activeFriend?.fullNameFriend}</span>
          <span className="status-dot online"></span>
        </div>
        <div className="header-actions">
          <button className="action-btn">
            <FaVideo />
          </button>
          <button className="action-btn">
            <FaPhone />
          </button>
          <button className="action-btn">
            <FaSearch />
          </button>
          <button className="action-btn">
            <FaEllipsisV />
          </button>
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
                key={`${message.id}-${message.status}`}
                className={`message ${
                  message.senderId === userId ? "me" : "them"
                }`}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {new Date(message.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {getMessageStatus(message, messages)}
                </div>
              </div>
            ))}
            {isFriendTyping && (
              <div className="message them typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            {isUserTyping && (
              <div className="message me typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div
              ref={messagesEndRef}
              style={{ float: "left", clear: "both" }}
            />
          </div>

          <form className="message-input" onSubmit={handleSendMessage}>
            <div className="input-tools">
              <button type="button" className="tool-btn">
                <FaPaperclip />
              </button>
              <button type="button" className="tool-btn">
                <FaSmile />
              </button>
            </div>
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onFocus={() => {
                setIsInputFocused(true);
                if (conversationId) {
                  markConversationAsSeen(2);
                }
              }}
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
