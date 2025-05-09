import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatLayout from "../components/ChatAIComponent/ChatLayout";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import { userProfile } from "../stores/action/profileActions";
import "../styles/ChatAI/ChatBotAIView.scss";

const ChatBotAIView = () => {
  const dispatch = useDispatch();
  const usersState = useSelector((state) => state.users) || {};
  const { users } = usersState;

  React.useEffect(() => {
    dispatch(userProfile());
  }, [dispatch]);

  return (
    <div className="chatbot-ai-view">
      <div className="chatbot-main-content">
      <LeftSidebar usersProfile={users} />
        <div className="chat-ai-container">
          <ChatLayout />
        </div>
      </div>
    </div>
  );
};

export default ChatBotAIView;