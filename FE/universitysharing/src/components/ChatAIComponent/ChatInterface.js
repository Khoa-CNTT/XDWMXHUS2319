import 'highlight.js/styles/atom-one-light.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Menu, Mic, Plus, Send, StopCircle } from 'react-feather';
import ReactMarkdown from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { useSignalR } from '../../Service/SignalRProvider';
import { useAuth } from '../../contexts/AuthContext';
import { confirmAction, fetchChatHistory, sendQuery, stopAction } from '../../stores/action/chatAIAction';
import './ChatInterface.scss';
import ConfirmationModal from './ConfirmationModal';
// Danh sách tin nhắn thành công ngẫu nhiên cho từng endpoint
const successMessages = {
  '/api/Post/create': [
    'Xong rồi, mình đã đăng cho bạn một bài post 😄',
    'Ok hết rồi nhaaaaa, bài đăng của bạn đã lên sóng 🎉',
    'Đã đăng bài cho bạn, tha hồ nhận like nè 😉',
    'Bài post của bạn đã được đăng thành công, tuyệt vời! 🌟',
  ],
  '/api/Post/update-post': [
    'Bài post của bạn đã được cập nhật, nhìn xịn hơn rồi nè 😎',
    'Ok, bài đăng đã được chỉnh sửa xong xuôi! 🎉',
    'Cập nhật bài post thành công, bạn pro ghê! 😄',
    'Bài đăng đã được làm mới, quá chất luôn! 🌟',
  ],
  '/api/Post/delete': [
    'Bài đăng đã bị xóa, gọn gàng rồi nha 🗑️',
    'Xóa xong bài post rồi, nhẹ cả người ha! 😌',
    'Ok, bài đăng đã biến mất không dấu vết! 🕵️',
    'Bài post đã được gỡ, bạn toàn quyền kiểm soát! 🚮',
  ],
  '/api/Comment/CommentPost': [
    'Bình luận của bạn đã được gửi, hot hòn họt luôn! 🔥',
    'Xong, mình đã thêm bình luận cho bạn nè 😎',
    'Bình luận đã được đăng, mọi người sắp đọc rồi nha! 😄',
    'Ok, bình luận của bạn đã lên bài! 🎊',
  ],
  '/api/Comment/UpdateComment': [
    'Bình luận của bạn đã được sửa, giờ ổn áp rồi nha! 😊',
    'Xong, mình đã cập nhật bình luận cho bạn! 🎊',
    'Ok, bình luận đã được chỉnh sửa, chuẩn luôn! 👍',
    'Cập nhật bình luận thành công, bạn đỉnh quá! 😄',
  ],
  '/api/Comment/DeleteComment': [
    'Bình luận đã bị xóa, gọn như chưa từng có mặt 😶',
    'Xong, mình đã dọn dẹp bình luận cho bạn rồi nha! 🧹',
    'Bình luận biến mất rồi, sạch sẽ quá trời! 🚫',
    'Ok, đã gỡ bình luận ra khỏi bài rồi nè! 📤',
  ],
  '/api/UserProfile/upProfile': [
    'Thông tin cá nhân đã được cập nhật, nhìn cool hơn rồi! 😎',
    'Xong, hồ sơ của bạn đã được làm mới! 🌟',
    'Ok, thông tin đã được chỉnh sửa, tuyệt vời! 🎉',
    'Cập nhật hồ sơ thành công, bạn nổi bật hơn rồi nha! 😄',
  ],
  '/api/Like/like': [
    'Thả tim thành công, + 1 like! ❤️',
    'Xong, mình đã like bài đăng cho bạn nè 😄',
    'Like đã được gửi, bài đăng thêm hot rồi! 🔥',
    'Ok, đã thả like cho bạn, tuyệt lắm! 🌟',
  ],
  '/api/Like/unlike': [
    'Trừ 1 like haha 😢',
    'Xong, đã hủy thả tim, chắc bạn đổi ý nhỉ? 🤔',
    'Ok, đã gỡ like khỏi bài post, gọn gàng ha! 👍',
    'Không còn like nữa, người đăng bài chắn bùn lắm he! 💔',
  ],
  '/api/CommentLike/like': [
    'Like bình luận xong, bạn đúng là fan số 1! 😍',
    'Xong, mình đã thả tim cho bình luận nè 😊',
    'Bình luận đã được like, chuẩn gu luôn! 👍',
    'Ok, đã like bình luận cho bạn! 🎉',
  ],
  '/api/FriendShip/send-friend-request': [
    'Lời mời kết bạn đã gửi, chờ hồi âm nha! 😄',
    'Xong, mình đã gửi yêu cầu kết bạn cho bạn! 🌟',
    'Yêu cầu kết bạn đã được gửi, bạn sắp có bạn mới! 😎',
    'Ok, lời mời kết bạn đã bay đi rồi! 🚀',
  ],
  '/api/Share/SharePost': [
    'Bài đăng đã được chia sẻ, lan tỏa ngay thôi! 📢',
    'Xong, mình đã share bài đăng cho bạn nè 😄',
    'Ok, bài đăng đã được chia sẻ, hot lắm nha! 🔥',
    'Đã chia sẻ bài đăng, bạn đúng là trendsetter! 🌟',
  ],
  'default': [
    'Hành động đã hoàn tất, bạn đỉnh thật! 😄',
    'Xong xuôi hết rồi, mình làm tốt chứ? 😎',
    'Ok, mọi thứ đã được xử lý ngon lành! 🎉',
    'Đã xong, bạn muốn mình làm gì tiếp nào? 😉',
  ],
};

// Hàm tiền xử lý markdown
const preprocessMarkdown = (text) => {
  return text.replace(/^\*(\S)/gm, '* $1').replace(/^\*\*(\S)/gm, '** $1');
};

// Sửa hàm convertLinksToMarkdown
const convertLinksToMarkdown = (text) => {
  return text.replace(/\((\bhttps?:\/\/\S+?)\)/g, (match, url) => {
    const displayText = url.length > 30 ? url.substring(0, 27) + '...' : url;
    return `[${displayText}](${url})`;
  });
};

const ChatInterface = ({ conversationId, setConversationId, toggleSidebar, onNewChat }) => {
  const dispatch = useDispatch();
  const { userId } = useAuth();
  const { signalRService, isConnected } = useSignalR();
  const { currentConversation, isLoading, error, chatHistory, currentConversationId } = useSelector((state) => state.chatAI);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chunkBufferRef = useRef('');
  const pendingChunksRef = useRef({});
  const processedChunks = useRef(new Set());
  const pendingMessageRef = useRef(null); // Lưu tin nhắn AI tạm thời
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const queryAtMicStartRef = useRef('');
  const startSilenceTimer = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (speechRecognitionRef.current && isListening) { // Kiểm tra isListening để tránh gọi stop không cần thiết
        console.log('[SpeechRecognition] Silence timeout (3s). Stopping recognition.');
        speechRecognitionRef.current.stop(); // Sẽ trigger onend, và onend sẽ set isListening = false
      }
    }, 3000); // 3 giây
  }, [isListening]);
  useEffect(() => {
    console.log('[SpeechRecognition] useEffect setup running...');
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  
    let recognitionInstance = null; // ✅ Đưa ra ngoài để dùng được trong cleanup
  
    if (SpeechRecognitionAPI) {
      console.log('[SpeechRecognition] Web Speech API is available.');
      recognitionInstance = new SpeechRecognitionAPI();
      speechRecognitionRef.current = recognitionInstance;
  
      recognitionInstance.continuous = true;
      recognitionInstance.lang = 'vi-VN';
      recognitionInstance.interimResults = true;
  
      recognitionInstance.onstart = () => {
        console.log('[SpeechRecognition] onstart: Recognition service has started.');
        startSilenceTimer();
      };
  
      recognitionInstance.onresult = (event) => {
        console.log('[SpeechRecognition] onresult event triggered.');
        startSilenceTimer();
  
        let interim_transcript = '';
        let final_transcript = queryAtMicStartRef.current;
  
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript_segment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final_transcript += transcript_segment;
            queryAtMicStartRef.current = final_transcript;
          } else {
            interim_transcript += transcript_segment;
          }
        }
  
        setQuery(final_transcript + interim_transcript);
        console.log(`[SpeechRecognition] Interim/Final. Query set to: "${final_transcript + interim_transcript}"`);
      };
  
      recognitionInstance.onerror = (event) => {
        console.error('[SpeechRecognition] onerror event:', event.error);
        clearTimeout(silenceTimerRef.current);
        let errorMessage = `Lỗi nhận dạng giọng nói: ${event.error}`;
        if (event.error === 'no-speech') {
           errorMessage = 'Không nhận diện được giọng nói ban đầu.';
        } else if (event.error === 'audio-capture') {
           errorMessage = 'Lỗi micro. Vui lòng kiểm tra micro của bạn.';
        } else if (event.error === 'not-allowed') {
           errorMessage = 'Bạn đã không cấp quyền sử dụng micro.';
        }
        if (event.error !== 'no-speech') {
           alert(errorMessage);
        }
      };
  
      recognitionInstance.onend = () => {
        console.log('[SpeechRecognition] onend: Recognition service disconnected.');
        clearTimeout(silenceTimerRef.current);
        setIsListening(false);
        queryAtMicStartRef.current = "";
      };
    } else {
      console.warn('[SpeechRecognition] Trình duyệt này không hỗ trợ Web Speech API.');
      alert('Trình duyệt của bạn không hỗ trợ tính năng nhận dạng giọng nói.');
    }
  
    return () => {
      console.log('[SpeechRecognition] useEffect cleanup: Stopping recognition.');
      clearTimeout(silenceTimerRef.current);
      if (recognitionInstance) {
        recognitionInstance.onstart = null;
        recognitionInstance.onresult = null;
        recognitionInstance.onerror = null;
        recognitionInstance.onend = null;
        recognitionInstance.stop();
      }
    };
  }, []);
  

  const handleToggleListening = () => {
    if (!speechRecognitionRef.current) {
      alert('Tính năng nhận dạng giọng nói chưa sẵn sàng.');
      return;
    }
  
    if (isListening) {
      console.log('[SpeechControls] User stopping listening.');
      clearTimeout(silenceTimerRef.current);
      try {
        speechRecognitionRef.current.stop(); // sẽ gọi onend
      } catch (e) {
        console.error('[SpeechControls] Error stopping mic:', e);
      }
    } else {
      console.log('[SpeechControls] User starting listening.');
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log('[SpeechControls] Microphone permission granted.');
          queryAtMicStartRef.current = query;
          try {
            speechRecognitionRef.current.start();
            setIsListening(true); // ✅ Cho nút chuyển ngay
          } catch (e) {
            console.error('[SpeechControls] Error calling .start():', e);
            setIsListening(false);
            alert('Không thể bật mic. Có thể trình duyệt đang ghi âm hoặc chưa hỗ trợ.');
          }
        })
        .catch(err => {
          console.error('[SpeechControls] Cannot access microphone:', err);
          alert('Không thể truy cập micro. Vui lòng kiểm tra quyền truy cập.');
          setIsListening(false);
        });
    }
  };
  
  useEffect(() => {
    const hasModal = messages.some((msg) => msg.isConfirmationModal);
    setIsModalOpen(hasModal);
  }, [messages]);
  // Đồng bộ messages với chatHistory từ Redux
  useEffect(() => {
    console.log('[useEffect] Triggered. conversationId:', conversationId, 'currentConversationId:', currentConversationId, 'chatHistory:', chatHistory, 'isWaitingResponse:', isWaitingResponse);
  
    if (conversationId && chatHistory && chatHistory.length > 0 && !isWaitingResponse) {
      console.log('[useEffect] Syncing chatHistory with messages for conversationId:', conversationId);
  
      setMessages((prevMessages) => {
        console.log('[useEffect] Previous messages:', prevMessages);
  
        // Lọc tin nhắn thuộc conversationId hiện tại hoặc tin nhắn tạm thời
        const updatedMessages = prevMessages.filter((msg) => {
          const isCurrentConversation = msg.conversationId === conversationId;
          // Giữ tin nhắn tạm thời ngay cả khi currentStreamId là null
          const isTempMessage = msg.tempConversationId && (msg.tempConversationId === currentStreamId || currentStreamId === null);
          const shouldKeep = isCurrentConversation || isTempMessage || msg.id.startsWith('confirmation-');
          console.log('[useEffect] Keeping message:', msg, 'Keep:', shouldKeep);
          return shouldKeep;
        });
  
        const existingMessageIds = new Set(updatedMessages.map((msg) => msg.id));
  
        const filteredHistory = chatHistory
          .filter((history) => {
            const shouldInclude = (
              !history.isConfirmationModal &&
              !existingMessageIds.has(`user-${history.id}`) &&
              !existingMessageIds.has(`ai-${history.id}`) &&
              !existingMessageIds.has(`ai-confirm-${history.id}`)
            );
            console.log('[useEffect] Filtering history item:', history, 'Include:', shouldInclude);
            return shouldInclude;
          })
          .map((history) => [
            {
              id: `user-${history.id}`,
              content: history.query,
              isUser: true,
              isStreaming: false,
              showDots: false,
              timestamp: history.timestamp,
              conversationId, // Gắn conversationId
            },
            {
              id: `ai-${history.id}`,
              content: history.answer,
              isUser: false,
              isStreaming: false,
              showDots: false,
              timestamp: history.timestamp,
              conversationId, // Gắn conversationId
            },
          ])
          .flat();
  
        console.log('[useEffect] Filtered history:', filteredHistory);
  
        // Kết hợp và sắp xếp theo timestamp
        return [...updatedMessages, ...filteredHistory].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
    } else if (!conversationId && !isWaitingResponse) {
      console.log('[useEffect] Resetting messages for new conversation');
      setMessages([]);
    } else {
      console.log('[useEffect] Keeping current messages, no sync needed');
    }
  }, [conversationId, chatHistory, currentConversationId, isWaitingResponse, currentStreamId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset messages only when starting a new conversation
  useEffect(() => {
    if (!conversationId && !isWaitingResponse && !currentStreamId) {
      console.log('[ChatInterface] Resetting state for new conversation');
      inputRef.current?.focus();
      setMessages([]);
      setCurrentStreamId(null);
      chunkBufferRef.current = '';
      pendingChunksRef.current = {};
      pendingMessageRef.current = null;
    }
  }, [conversationId, isWaitingResponse, currentStreamId]);

  // Setup SignalR listeners
  useEffect(() => {
    if (!isConnected || !signalRService) {
      console.log('[ChatInterface] SignalR not connected, skipping listener setup');
      return;
    }

    console.log('[ChatInterface] Setting up SignalR listeners');
    const handleChunk = (chunk, streamId) => {
      console.log('[handleChunk] Received chunk:', chunk, 'StreamId:', streamId);
    
      const chunkKey = `${streamId}-${chunk}`;
      if (processedChunks.current.has(chunkKey)) {
        console.log(`[handleChunk] Skipping duplicate chunk for streamId: ${streamId}`);
        return;
      }
      processedChunks.current.add(chunkKey);
    
      const aiMessageId = `ai-${streamId}`;
      const hasMatchingMessage = messages.some((msg) => msg.id === aiMessageId) || pendingMessageRef.current?.id === aiMessageId;
    
      if (!hasMatchingMessage) {
        console.log(`[handleChunk] No matching AI message for streamId: ${streamId}, storing chunk`);
        pendingChunksRef.current[streamId] = (pendingChunksRef.current[streamId] || '') + chunk;
        return;
      }
    
      if (chunk && typeof chunk === 'string') {
        chunkBufferRef.current += chunk;
        console.log('[handleChunk] Current chunk buffer:', chunkBufferRef.current);
      } else {
        console.warn('[handleChunk] Received empty or invalid chunk:', chunk);
        return;
      }
    
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) => {
          if (msg.id === aiMessageId) {
            return {
              ...msg,
              content: chunkBufferRef.current,
              showDots: true,
              timestamp: new Date().toISOString(),
            };
          }
          return msg;
        });
    
        if (!prev.some((msg) => msg.id === aiMessageId) && pendingMessageRef.current?.id === aiMessageId) {
          return [
            ...updatedMessages,
            {
              ...pendingMessageRef.current,
              content: chunkBufferRef.current,
              showDots: true,
              timestamp: new Date().toISOString(),
            },
          ];
        }
        console.log('[handleChunk] Updated messages:', updatedMessages);
        return updatedMessages;
      });
    };
    const handleComplete = (content, streamId) => {
      console.log('[ChatInterface] Received complete data:', JSON.stringify(content, null, 2), 'StreamId:', streamId);
      if (content && content.results && Array.isArray(content.results) && content.results.length > 0) {
        const finalContent = chunkBufferRef.current.trim() || 'Không nhận được phản hồi từ AI.';
        setMessages((prev) => {
          const aiMessageId = `ai-${streamId}`;
          const updatedMessages = prev.map((msg) => {
            if (msg.id === aiMessageId) {
              return {
                ...msg,
                content: finalContent,
                isStreaming: false,
                showDots: false,
                timestamp: new Date().toISOString(),
                conversationId: conversationId || msg.conversationId, // Gắn conversationId
              };
            }
            return msg;
          });
          // Chỉ thêm modal nếu chưa tồn tại
          if (!updatedMessages.some((msg) => msg.id === `confirmation-${streamId}`)) {
            return [
              ...updatedMessages,
              {
                id: `confirmation-${streamId}`,
                isUser: false,
                isStreaming: false,
                showDots: false,
                isConfirmationModal: true,
                results: content.results,
                streamId,
                chatHistoryId: content.chatHistoryId,
                timestamp: new Date().toISOString(),
                conversationId, // Gắn conversationId
              },
            ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          }
          return updatedMessages;
        });
    
        // Reset trạng thái
        setIsWaitingResponse(false);
        if (conversationId && !chatHistory.some((history) => history.id === streamId)) {
          dispatch(fetchChatHistory({ conversationId, lastMessageId: null }));
        }
        setCurrentStreamId(null);
        chunkBufferRef.current = '';
        processedChunks.current.clear();
        pendingMessageRef.current = null;
      } else {
        console.warn('[ChatInterface] Invalid or empty complete data:', JSON.stringify(content, null, 2));
        setMessages((prev) => {
          const updatedMessages = prev.filter((msg) => msg.id !== `ai-${streamId}`);
          return [
            ...updatedMessages,
            {
              id: `error-${Date.now()}`,
              content: 'Dữ liệu xác nhận không hợp lệ. Vui lòng thử lại.',
              isUser: false,
              isStreaming: false,
              showDots: false,
              isError: true,
              timestamp: new Date().toISOString(),
              conversationId, // Gắn conversationId
            },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
        setIsWaitingResponse(false);
        setCurrentStreamId(null);
        chunkBufferRef.current = '';
        processedChunks.current.clear();
        pendingMessageRef.current = null;
      }
    };
    const handleStreamCompleted = (streamId) => {
      console.log('[handleStreamCompleted] Stream completed:', streamId);
    
      if (pendingChunksRef.current[streamId]) {
        chunkBufferRef.current = pendingChunksRef.current[streamId];
        delete pendingChunksRef.current[streamId];
      }
    
      const finalContent = chunkBufferRef.current.trim() || 'Không nhận được phản hồi từ AI.';
      setMessages((prev) => {
        const aiMessageId = `ai-${streamId}`;
        const updatedMessages = prev.map((msg) => {
          if (msg.id === aiMessageId) {
            return {
              ...msg,
              content: finalContent,
              isStreaming: false,
              showDots: false,
              timestamp: new Date().toISOString(),
              conversationId: conversationId || msg.conversationId, // Gắn conversationId
            };
          }
          return msg;
        });
    
        if (!prev.some((msg) => msg.id === aiMessageId) && pendingMessageRef.current?.id === aiMessageId) {
          return [
            ...updatedMessages,
            {
              ...pendingMessageRef.current,
              content: finalContent,
              isStreaming: false,
              showDots: false,
              timestamp: new Date().toISOString(),
              conversationId, // Gắn conversationId
            },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        console.log('[handleStreamCompleted] Updated messages:', updatedMessages);
        return updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
    
      setIsWaitingResponse(false);
      if (conversationId) {
        dispatch(fetchChatHistory({ conversationId, lastMessageId: null }));
      }
      // Trì hoãn đặt currentStreamId để useEffect xử lý tin nhắn tạm thời
      setTimeout(() => {
        setCurrentStreamId(null);
        chunkBufferRef.current = '';
        processedChunks.current.clear();
        pendingMessageRef.current = null;
      }, 0);
    };

    signalRService.onReceiveChunk(handleChunk);
    signalRService.onReceiveComplete(handleComplete);
    signalRService.onStreamCompleted(handleStreamCompleted);

    return () => {
      console.log('[ChatInterface] Cleaning up SignalR listeners');
      signalRService.off('ReceiveChunk', handleChunk);
      signalRService.off('ReceiveComplete', handleComplete);
      signalRService.off('StreamCompleted', handleStreamCompleted);
    };

  }, [isConnected, signalRService, dispatch]);

  const handleSendQuery = useCallback(() => {
    if (!query.trim() || isWaitingResponse) return;
  
    const userQuery = query.trim();
    const newStreamId = Date.now().toString();
    const userMessageId = `user-${newStreamId}`;
    const aiMessageId = `ai-${newStreamId}`;
    const now = new Date().toISOString();
  
    console.log('[handleSendQuery] Sending query:', userQuery, 'StreamId:', newStreamId);
  
    if (!conversationId) {
      setMessages([]);
      chunkBufferRef.current = '';
      pendingChunksRef.current = {};
      pendingMessageRef.current = null;
    }
  
    pendingMessageRef.current = {
      id: aiMessageId,
      content: '',
      isUser: false,
      isStreaming: true,
      showDots: true,
      timestamp: now,
      tempConversationId: newStreamId, // Gắn tempConversationId
    };
  
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        content: userQuery,
        isUser: true,
        isStreaming: false,
        showDots: false,
        timestamp: now,
        tempConversationId: newStreamId, // Gắn tempConversationId
      },
      pendingMessageRef.current,
    ];
    setMessages([...newMessages]);
    console.log('[handleSendQuery] Updated messages:', newMessages);
  
    setIsWaitingResponse(true);
    setQuery('');
    setCurrentStreamId(newStreamId);
    chunkBufferRef.current = '';
    processedChunks.current.clear();
  
    dispatch(sendQuery({ query: userQuery, conversationId: conversationId || null }))
      .then((action) => {
        const newConversationId = action.payload?.conversationId;
        const queryToSend = action.payload?.query;
        console.log('[handleSendQuery] sendQuery response:', action.payload);
  
        const streamConversationId = conversationId || newConversationId;
        if (streamConversationId && queryToSend && signalRService && isConnected) {
          console.log('[handleSendQuery] Starting stream with query:', queryToSend, 'streamId:', newStreamId);
          signalRService.sendStreamQuery(queryToSend, streamConversationId, newStreamId);
        } else {
          throw new Error('Cannot start stream: Missing required parameters');
        }
  
        if (!conversationId && newConversationId) {
          console.log('[handleSendQuery] New conversation created with ID:', newConversationId);
          setConversationId(newConversationId);
          // Cập nhật tempConversationId thành conversationId
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempConversationId === newStreamId
                ? { ...msg, conversationId: newConversationId, tempConversationId: undefined }
                : msg
            )
          );
          dispatch(fetchChatHistory({ conversationId: newConversationId, lastMessageId: null }));
        }
      })
      .catch((err) => {
        console.error('[handleSendQuery] Error sending message:', err);
        setIsWaitingResponse(false);
        setCurrentStreamId(null);
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== aiMessageId),
          {
            id: `error-${Date.now()}`,
            content: 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.',
            isUser: false,
            isStreaming: false,
            showDots: false,
            isError: true,
            timestamp: new Date().toISOString(),
          },
        ]);
        chunkBufferRef.current = '';
        processedChunks.current.clear();
        pendingMessageRef.current = null;
      });
  }, [query, isWaitingResponse, dispatch, conversationId, signalRService, setConversationId, isConnected, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  const handleNewChat = useCallback(() => {
    console.log('[ChatInterface] Starting new chat');
    setMessages([]);
    setCurrentStreamId(null);
    chunkBufferRef.current = '';
    pendingChunksRef.current = {};
    pendingMessageRef.current = null;
    setConversationId(null);
    setIsWaitingResponse(false); // Đặt lại trạng thái chờ
    onNewChat();
  }, [onNewChat, setConversationId]);
  const handleModalConfirm = useCallback(
    async (endpoint, params, redis_key, streamId) => {
      console.log('[ChatInterface] Confirming action:', { endpoint, params, redis_key, streamId, conversationId });
      if (!endpoint || !params || !redis_key || !streamId) {
        console.error('[ChatInterface] Invalid confirm action parameters:', { endpoint, params, redis_key, streamId });
        setMessages((prev) => {
          const updatedMessages = prev.filter((msg) => !msg.isConfirmationModal);
          return [
            ...updatedMessages,
            {
              id: `error-${Date.now()}`,
              content: 'Thông tin xác nhận không hợp lệ. Vui lòng thử lại.',
              isUser: false,
              isStreaming: false,
              showDots: false,
              isError: true,
              timestamp: new Date().toISOString(),
              conversationId, // Gắn conversationId
            },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
        setIsModalOpen(false);
        setIsWaitingResponse(false);
        return;
      }
  
      try {
        const confirmationMessage = messages.find((msg) => msg.id === `confirmation-${streamId}`);
        const chatHistoryId = confirmationMessage?.chatHistoryId;
        const endpointKey = endpoint.replace('https://localhost:7053', '');
        const messagesForEndpoint = successMessages[endpointKey] || successMessages['default'];
        const successMessage = messagesForEndpoint[Math.floor(Math.random() * messagesForEndpoint.length)];
  
        const result = await dispatch(
          confirmAction({ endpoint, params, redis_key, conversationId, chatHistoryId, successMessage })
        ).unwrap();
        console.log('[ChatInterface] Action confirmed successfully:', result);
  
        setMessages((prev) => {
          const updatedMessages = prev.filter((msg) => msg.id !== `confirmation-${streamId}` && !msg.isConfirmationModal);
          return [
            ...updatedMessages,
            {
              id: `ai-confirm-${chatHistoryId || Date.now()}`,
              content: successMessage,
              isUser: false,
              isStreaming: false,
              showDots: false,
              timestamp: new Date().toISOString(),
              conversationId, // Gắn conversationId
            },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
  
        if (conversationId) {
          dispatch(fetchChatHistory({ conversationId, lastMessageId: null }));
        }
        setIsModalOpen(false);
        setIsWaitingResponse(false);
      } catch (error) {
        console.error('[ChatInterface] Error confirming action:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi xác nhận hành động. Vui lòng thử lại.';
        
        setMessages((prev) => {
          const updatedMessages = prev.filter((msg) => !msg.isConfirmationModal);
          return [
            ...updatedMessages,
            {
              id: `error-${Date.now()}`,
              content: errorMessage,
              isUser: false,
              isStreaming: false,
              showDots: false,
              isError: true,
              timestamp: new Date().toISOString(),
              conversationId, // Gắn conversationId
            },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
        setIsModalOpen(false);
        setIsWaitingResponse(false);
      }
    },
    [dispatch, conversationId, messages]
  );



  const handleModalEdit = useCallback((modalStreamId) => { // Chấp nhận modalStreamId làm tham số
    console.log('[ChatInterface] Entering edit mode for modal with streamId:', modalStreamId);
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === `confirmation-${modalStreamId}` // Sử dụng modalStreamId được truyền vào
          ? { ...msg, isEditing: true }
          : msg
      )
    );
  }, []);



  const handleModalCancel = useCallback((streamId) => {
    console.log('[ChatInterface] Cancelling modal action', { streamId });
  
    const confirmationMessage = messages.find(
      (msg) => msg.id === `confirmation-${streamId}` && msg.isConfirmationModal
    );
    console.log('[handleModalCancel] Confirmation message:', confirmationMessage);
    console.log('[handleModalCancel] Results:', confirmationMessage?.results);
  
    const redis_key = confirmationMessage?.results?.[0]?.redis_key;
    const validConversationId = conversationId || confirmationMessage?.conversationId;
  
    if (validConversationId && redis_key) {
      dispatch(stopAction({ conversationId: validConversationId, redis_key }))
        .unwrap()
        .then(() => {
          console.log('[ChatInterface] Stop action successful');
          setMessages((prev) => {
            const updatedMessages = prev.filter((msg) => !msg.isConfirmationModal);
            console.log('[ChatInterface] Messages after cancelling modal:', updatedMessages);
            return [
              ...updatedMessages,
              {
                id: `cancel-${Date.now()}`,
                content: 'Hành động đã được hủy.',
                isUser: false,
                isStreaming: false,
                showDots: false,
                timestamp: new Date().toISOString(),
              },
            ];
          });
          setIsWaitingResponse(false);
        })
        .catch((error) => {
          console.error('[ChatInterface] Error stopping action:', error);
          setMessages((prev) => {
            const updatedMessages = prev.filter((msg) => !msg.isConfirmationModal);
            console.log('[ChatInterface] Messages after cancelling modal:', updatedMessages);
            return [
              ...updatedMessages,
              {
                id: `error-${Date.now()}`,
                content: 'Lỗi khi hủy hành động. Vui lòng thử lại.',
                isUser: false,
                isStreaming: false,
                showDots: false,
                isError: true,
                timestamp: new Date().toISOString(),
              },
            ];
          });
          setIsWaitingResponse(false);
        });
    } else {
      console.warn('[ChatInterface] Không tìm thấy redis_key hoặc conversationId:', {
        redis_key,
        conversationId: validConversationId,
        results: confirmationMessage?.results?.[0],
      });
      setMessages((prev) => {
        const updatedMessages = prev.filter((msg) => !msg.isConfirmationModal);
        console.log('[ChatInterface] Messages after cancelling modal:', updatedMessages);
        return [
          ...updatedMessages,
          {
            id: `cancel-${Date.now()}`,
            content: 'Hành động đã được hủy.',
            isUser: false,
            isStreaming: false,
            showDots: false,
            timestamp: new Date().toISOString(),
          },
        ];
      });
      setIsWaitingResponse(false);
    }
  }, [dispatch, conversationId, messages]);
  
  const renderMessage = useCallback(
    (message, index) => {
      console.log('[ChatInterface] Rendering message:', message);
  
      if (message.isConfirmationModal) {
        const modifiedMessage = {
          ...message,
          isStreaming: false,
          showDots: false,
        };
  
        return (
          <div
            key={`${modifiedMessage.id}-${index}`}
            className="message-bubble ai-message confirmation-message"
            data-testid={`message-${modifiedMessage.id}`}
          >
            <ConfirmationModal
              results={modifiedMessage.results}
              streamId={modifiedMessage.streamId} 
              onConfirm={(endpoint, params, redis_key) => handleModalConfirm(endpoint, params, redis_key, modifiedMessage.streamId)}
              onEdit={handleModalEdit}
              onCancel={() => handleModalCancel(modifiedMessage.streamId)}
              conversationId={conversationId}
              isEditing={modifiedMessage.isEditing || false}
            />
            <div className="message-timestamp">
              {new Date(modifiedMessage.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        );
      }
  
      return (
        <div
          key={`${message.id}-${index}`}
          className={`message-bubble ${message.isUser ? 'user-message' : `ai-message ${message.isStreaming ? 'streaming' : ''}`}`}
          data-testid={`message-${message.id}`}
        >
          <div className="message-content">
            {message.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}>
                {convertLinksToMarkdown(message.content)}
              </ReactMarkdown>
            ) : (
              <span>{message.isStreaming ? '' : 'Không có nội dung trả lời.'}</span>
            )}
            {message.isStreaming && message.showDots && (
              <span className="streaming-dots" data-testid="streaming-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            )}
          </div>
          <div className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      );
    },
    [handleModalConfirm, handleModalEdit, handleModalCancel, conversationId]
  );
  

  const renderedMessages = useMemo(() => {
    return messages.map((message, index) => renderMessage(message, index));
  }, [messages, renderMessage]);

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <button onClick={toggleSidebar} className="menu-button">
          <Menu size={20} />
        </button>
        <h2 className="chat-title">
          {conversationId ? currentConversation?.title || 'Cuộc trò chuyện' : 'Chat AI'}
        </h2>
        <button onClick={handleNewChat} className="new-chat-button">
          <Plus size={20} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.length > 0 ? (
          <>{renderedMessages}</>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h3>Chào mừng đến với Chat AI</h3>
              <p>Hãy bắt đầu cuộc trò chuyện mới hoặc chọn từ lịch sử</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input">
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            rows={1}
            disabled={isWaitingResponse || isModalOpen || isListening} // Disable khi đang nghe
          />
          {/* Nút Microphone */}
        {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
          <button
            onClick={handleToggleListening}
            className={`mic-button ${isListening ? 'listening' : ''}`} // Thêm class 'listening' để có thể style khác biệt
            title={isListening ? "Dừng ghi âm" : "Ghi âm giọng nói"}
            disabled={isWaitingResponse || isModalOpen} // isModalOpen và isWaitingResponse là ví dụ
          >
            {isListening ? <StopCircle size={18} color="red" /> : <Mic size={18} />}
          </button>
        )}
          <button
            onClick={handleSendQuery}
            disabled={!query.trim() || isWaitingResponse || isListening} // Disable khi đang nghe
            className="send-button"
          >
            {isWaitingResponse ? <div className="spinner" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    
    </div>
  );
};

export default ChatInterface;