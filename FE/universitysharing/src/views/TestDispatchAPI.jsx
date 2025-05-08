import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriends } from "../stores/action/friendAction";
import {
  getMessagess,
  getConversationss,
  getInbox,
} from "../stores/action/messageAction";

const TestDispatchAPI = () => {
  const dispatch = useDispatch();
  const friendsState = useSelector((state) => state.friends || {});
  const friend = friendsState.friends || [];
  useEffect(() => {
    // Gọi fetchFriends để lấy danh sách bạn bè
    dispatch(fetchFriends());
  }, [dispatch]);

  const handleGetInboxMessenger = () => {
    const token = localStorage.getItem("token"); // hoặc lấy từ state
    dispatch(getInbox({ pageSize: 20, token }));
  };

  const handleGetMessage = (friendId) => {
    const token = localStorage.getItem("token"); // hoặc lấy từ state

    dispatch(getConversationss({ friendId, token }))
      .unwrap()
      .then((conversationData) => {
        const conversationId = conversationData.id;

        return dispatch(
          getMessagess({
            conversationId,
            token,
            nextCursor: null,
            pageSize: 20,
          })
        ).unwrap();
      })
      .then((messages) => {
        console.log("Tin nhắn:", messages);
        // Xử lý hiển thị tin nhắn nếu cần
      })
      .catch((err) => {
        console.error("Lỗi khi lấy tin nhắn:", err);
      });
  };

  return (
    <>
      <div className="getMessenger">Đây là giao diện Test API </div>
      <div className="chat-list__items">
        {friend.map((chat, index) => (
          <div
            key={index}
            className={`chat-list__item ${index === 0 ? "active" : ""}`}
            // onClick={onSelectChat} // Thêm click
            onClick={() => handleGetMessage(chat.friendId)} // 👈 gọi API khi click
          >
            <img
              src={chat.pictureProfile}
              alt={chat.name}
              className="chat-list__avatar"
            />
            <span className="chat-list__name">{chat.fullName}</span>
          </div>
        ))}
      </div>
      <p
        onClick={() => {
          handleGetInboxMessenger();
        }}
      >
        Lấy inbox{" "}
      </p>
    </>
  );
};
export default TestDispatchAPI;
