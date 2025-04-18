import React from "react";
import ChatList from "../components/MessageComponent/ChatList";
import ChatHeader from "../components/MessageComponent/ChatHeader";
import MessageArea from "../components/MessageComponent/MessageArea";
import MessageInput from "../components/MessageComponent/MessageInput";
import RightSidebar from "../components/MessageComponent/RightSidebar";
import Header from "../components/HomeComponent/Header";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../stores/action/profileActions";
import "../styles/MessageView.scss";

const MessageView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;
  return (
    <div className="Container-MessageView">
      <Header className="header" usersProfile={users} />
      <div className="message-view">
        <ChatList />
        <div className="message-view__content">
          <ChatHeader />
          <MessageArea />
          <MessageInput />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
};

export default MessageView;
