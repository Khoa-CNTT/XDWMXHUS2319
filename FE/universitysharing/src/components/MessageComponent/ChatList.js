// import React from "react";
// import "../../styles/MessageView/ChatList.scss";
// import "../../styles/MoblieReponsive/MessageViewMobile/MessageViewMobile.scss";
// import avatartDefault from "../../assets/AvatarDefaultFill.png";
// import { FiSearch } from "react-icons/fi";

// const ChatList = ({
//   onSelectChat,
//   selectFriend,
//   friend,
//   inboxRead = [],
//   countInbox = {},
// }) => {
//   return (
//     <div className="chat-list">
//       <div className="chat-list__header">
//         <h2>Tin nhắn</h2>
//         <div className="chat-list__search">
//           <input type="text" placeholder="Tìm kiếm bạn bè" />
//           <div className="icon-search">
//             <FiSearch className="search-icon" />
//           </div>
//         </div>
//       </div>

//       <div className="chat-list__items">
//         {inboxRead.map((chat, index) => {
//           const friendId = chat.user?.id;
//           const fullName = chat.user?.fullName;
//           const avatar = chat.user?.profilePicture
//             ? `${process.env.REACT_APP_BASE_URL}${chat.user.profilePicture}`
//             : avatartDefault;
//           const lastMessage = chat.lastMessage;
//           const lastMessageDate = new Date(chat.lastMessageDate);
//           const time = lastMessageDate.toLocaleTimeString("vi-VN", {
//             hour: "2-digit",
//             minute: "2-digit",
//           });

//           const unreadCount = countInbox[friendId] || 0;

//           return (
//             <div
//               key={index}
//               className={`chat-list__item ${
//                 selectFriend?.friendId === friendId ? "active" : ""
//               }`}
//               onClick={() =>
//                 onSelectChat({
//                   friendId: friendId,
//                   fullName: fullName,
//                   pictureProfile: avatar,
//                   conversationId: chat.conversationId,
//                 })
//               }
//             >
//               <img
//                 src={avatar || avatartDefault}
//                 alt={fullName}
//                 className="chat-list__avatar"
//               />
//               <div className="inbox">
//                 <span className="chat-list__name">{fullName}</span>
//                 <div className="action-last-mess">
//                   <span className="last-mess">{lastMessage}</span>
//                   <span className="time-mess">{time}</span>
//                   {unreadCount > 0 && (
//                     <div className="notify-inbox">{unreadCount}</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
// export default ChatList;

import React from "react";
import "../../styles/MessageView/ChatList.scss";
import "../../styles/MoblieReponsive/MessageViewMobile/MessageViewMobile.scss";
import avatartDefault from "../../assets/AvatarDefaultFill.png";
import { FiSearch } from "react-icons/fi";

const ChatList = ({
  onSelectChat,
  selectFriend,
  friend = [],
  inboxRead = [],
  countInbox = {},
}) => {
  // Sử dụng inboxRead nếu có, nếu không dùng friend
  const chatList = inboxRead.length > 0 ? inboxRead : friend;

  return (
    <div className="chat-list">
      <div className="chat-list__header">
        <h2>Tin nhắn</h2>
        <div className="chat-list__search">
          <input type="text" placeholder="Tìm kiếm bạn bè" />
          <div className="icon-search">
            <FiSearch className="search-icon" />
          </div>
        </div>
      </div>

      <div className="chat-list__items">
        {chatList.map((chat, index) => {
          const friendId = chat.user?.id;
          const fullName = chat.user?.fullName;
          const avatar = chat.user?.profilePicture
            ? `${process.env.REACT_APP_BASE_URL}${chat.user.profilePicture}`
            : avatartDefault;
          const lastMessage = chat.lastMessage || "";
          const lastMessageDate = chat.lastMessageDate
            ? new Date(chat.lastMessageDate)
            : null;
          const time = lastMessageDate
            ? lastMessageDate.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          const unreadCount = countInbox[friendId] || 0;

          return (
            <div
              key={index}
              className={`chat-list__item ${
                selectFriend?.friendId === friendId ? "active" : ""
              }`}
              onClick={() =>
                onSelectChat({
                  friendId: friendId,
                  fullName: fullName,
                  pictureProfile: avatar,
                  conversationId: chat.conversationId,
                })
              }
            >
              <img
                src={avatar || avatartDefault}
                alt={fullName}
                className="chat-list__avatar"
              />
              <div className="inbox">
                <span className="chat-list__name">{fullName}</span>
                {inboxRead.length > 0 && (
                  <div className="action-last-mess">
                    <span className="last-mess">{lastMessage}</span>
                    <span className="time-mess">{time}</span>
                    {unreadCount > 0 && (
                      <div className="notify-inbox">{unreadCount}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
