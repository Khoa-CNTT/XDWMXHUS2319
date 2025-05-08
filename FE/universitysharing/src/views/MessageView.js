import React, { useState, useEffect, useRef, useContext } from "react";
import { fetchFriends } from "../stores/action/friendAction";
import ChatList from "../components/MessageComponent/ChatList";
import ChatHeader from "../components/MessageComponent/ChatHeader";
import MessageArea from "../components/MessageComponent/MessageArea";
import MessageInput from "../components/MessageComponent/MessageInput";
import RightSidebar from "../components/MessageComponent/RightSidebar";
import Header from "../components/HomeComponent/Header";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import "../styles/MessageView.scss";
import { RiArrowRightDoubleFill } from "react-icons/ri";
import {
  resetMessages,
  setSelectFriend,
} from "../stores/reducers/messengerReducer";

import {
  getMessagess,
  getConversationss,
  getInbox,
} from "../stores/action/messageAction";

import {
  useChatHandle,
  useMessageReceiver,
  useMessageReceiverData,
} from "../utils/MesengerHandle";
import { useSignalR } from "../Service/SignalRProvider";

const MessageView = () => {
  const dispatch = useDispatch();
  useMessageReceiver(); // Kích hoạt nhận tin nhắn qua SignalR
  useMessageReceiverData();

  //thêm các yếu tố để viết được hàm nhắn tin
  const {
    handleJoin,
    handleLeaveChat,
    handleSendMessage,
    markConversationAsSeen,
  } = useChatHandle();
  const { isConnected } = useSignalR(); // ✅ Lấy trạng thái kết nối SignalR
  const [newMessage, setNewMessage] = useState(""); // nội dung tin nhắn
  const [isSending, setIsSending] = useState(false); // trạng thái đang gửi
  const [isUserTyping, setIsUserTyping] = useState(false); // gõ phím
  //Kiểm tra thử trạng thái kết nối
  useEffect(() => {
    // console.error("[SignalR] Trạng thái kết nối ✅ :", isConnected);
  }, [isConnected]);

  //Gọi user lại nếu load lại trang
  useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);

  //Lấy user và friend các kiểu
  const usersState = useSelector((state) => state.users) || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // trạng thái rightsidebar
  const [isChatSelected, setIsChatSelected] = useState(false); // Thêm state này
  const friendsState = useSelector((state) => state.friends || {});
  const friend = friendsState.friends || [];
  useEffect(() => {
    // Gọi fetchFriends để lấy danh sách bạn bè
    dispatch(fetchFriends());
  }, [dispatch]);

  //lấy thêm tin nhắn
  const topRef = useRef(null); //xác định điểm đầu để lướt lên kích hoạt load thêm tin nhắn
  const observer = useRef(null);
  const scrollContainerRef = useRef(null);

  const messengerState = useSelector((state) => state.messenges || {});
  const messenges = messengerState.messages || [];
  const selectFriend = messengerState.selectFriend || [];

  const [selectedFriend, setSelectedFriend] = useState(null); //Chọn bạn lưu ở dạng state component

  //load cuối tin nhắn (hiện không sài)
  const bottomRef = useRef(null); // Ref đến phần tử cuối cùng
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messenges]);

  //Chọn user để tham gia vào cuộc nhắn tin
  const handleSelectChat = async (friendData) => {
    const token = localStorage.getItem("token");

    try {
      // Nếu đang có cuộc trò chuyện, rời khỏi trước
      if (messengerState.conversationId) {
        await handleLeaveChat(messengerState.conversationId);
      }

      // Lấy dữ liệu cuộc trò chuyện mới
      const conversationData = await dispatch(
        getConversationss({ friendId: friendData.friendId, token })
      ).unwrap();

      const conversationId = conversationData.id;

      // 👉 Xoá tin nhắn cũ trước khi load mới
      dispatch(resetMessages());

      setSelectedFriend(friendData); // Lưu bạn đang chọn
      dispatch(setSelectFriend(friendData));
      setIsChatSelected(true); // Chuyển qua khung chat

      // Tham gia cuộc trò chuyện mới qua SignalR
      await handleJoin(conversationId);

      // Gọi API để lấy tin nhắn
      const messages = await dispatch(
        getMessagess({
          conversationId,
          token,
          nextCursor: null,
          pageSize: 20,
        })
      );
      console.error("Messenger có gì ", messages);

      // 👉 Gọi markConversationAsSeen sau khi mọi thứ đã được cập nhật
      await markConversationAsSeen({
        conversationId: conversationId, // Dùng trực tiếp conversationId mới
        friendId: friendData.friendId, // Dùng trực tiếp friendId mới
        messages: messages.payload.data || [], // ✅ Lấy đúng mảng tin nhắn
        status: 2,
      });
    } catch (err) {
      console.error("Lỗi chọn bạn để chat:", err);
    }
  };

  //lướt lên trên để load thêm tin nhắn
  useEffect(() => {
    // console.error("Nét cơ so>>>", messengerState.nextCursor);
    if (!topRef.current || !messengerState.nextCursor) return;

    // Huỷ observer cũ nếu có
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && messengerState.nextCursor) {
          console.log("Đã scroll lên đầu, đang load thêm tin nhắn...");
          const token = localStorage.getItem("token");
          dispatch(
            getMessagess({
              conversationId: messengerState.conversationId,
              token,
              nextCursor: messengerState.nextCursor,
              pageSize: 20,
              append: true,
            })
          );
        }
      },
      {
        root: document.querySelector(".message-area"), // phải đúng class scroll container
        threshold: 1.0,
      }
    );

    observer.current.observe(topRef.current);

    return () => observer.current?.disconnect();
  }, [messengerState.nextCursor, messengerState.conversationId]);

  //Lấy inbox tin nhắn
  const inboxRead = messengerState.inboxRead || [];
  const countInbox = messengerState.unReadInbox || [];

  // console.error("inbox >>>", inboxRead);
  // console.error("inbox >>>", countInbox);

  useEffect(() => {
    const token = localStorage.getItem("token"); // hoặc lấy từ state
    dispatch(getInbox({ pageSize: 20, token }));
  }, [dispatch]);

  const { users } = usersState;
  return (
    <div className="Container-MessageView">
      <Header className="header" usersProfile={users} />
      <div className="message-view">
        <div
          className={`chat-list-wrapper ${
            isChatSelected ? "hide-on-mobile" : ""
          }`}
        >
          <ChatList
            onSelectChat={handleSelectChat}
            friend={friend}
            selectFriend={selectFriend}
            inboxRead={inboxRead}
            countInbox={countInbox}
          />
        </div>
        <div
          className={`message-view__content-wrapper ${
            isChatSelected ? "" : "hide-on-mobile"
          }`}
        >
          <ChatHeader
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            goBack={() => setIsChatSelected(false)}
            selectedFriend={selectFriend}
          />
          <MessageArea
            messagers={messenges}
            refScroll={bottomRef}
            topRef={topRef}
            scrollContainerRef={scrollContainerRef}
          />
          {/* <MessageInput /> */}

          <MessageInput
            message={newMessage}
            setMessage={setNewMessage}
            onSendMessage={() =>
              handleSendMessage({
                friendId: selectFriend?.friendId,
                content: newMessage,
                conversationId: messengerState.conversationId,
                token: localStorage.getItem("token"),
                isSending,
                setIsSending,
                setNewMessage,
                setIsUserTyping,
                // setConversationId: (friendId, token) => {
                //   console.error("Id token vào >>", friendId, token);
                //   dispatch(getConversationss(friendId, token)); // nếu dùng redux
                // },
              })
            }
            isSending={isSending}
            isUserTyping={isUserTyping}
            setIsUserTyping={setIsUserTyping}
          />
        </div>
        <RightSidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          selectedFriend={selectFriend}
        />
      </div>
    </div>
  );
};

export default MessageView;

//Hàm chọn bạn bè để chat kiểu chưa có kết nối signalR
// const handleSelectChat = (friendData) => {
//   const token = localStorage.getItem("token");
//   dispatch(getConversationss({ friendId: friendData.friendId, token }))
//     .unwrap()
//     .then((conversationData) => {
//       const conversationId = conversationData.id;

//       // 👉 Xoá tin nhắn cũ trước khi load mới
//       dispatch(resetMessages());

//       setSelectedFriend(friendData); // Lưu bạn đang chọn
//       dispatch(setSelectFriend(friendData));
//       setIsChatSelected(true); // Chuyển qua khung chat
//       return dispatch(
//         getMessagess({
//           conversationId,
//           token,
//           nextCursor: null,
//           pageSize: 20,
//         })
//       );
//     })
//     .catch((err) => {
//       console.error("Lỗi lấy tin nhắn:", err);
//     });
// };
