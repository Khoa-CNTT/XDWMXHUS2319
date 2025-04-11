// Component cha để quản lý nhiều ChatBox
const ChatBoxManager = () => {
    const [openChats, setOpenChats] = useState([]);
    
    const handleOpenChat = (friendId) => {
        if (!openChats.includes(friendId)) {
            setOpenChats([...openChats, friendId]);
        }
    };
    
    const handleCloseChat = (friendId) => {
        setOpenChats(openChats.filter(id => id !== friendId));
    };
    
    return (
        <div className="chat-box-container">
            {openChats.map(friendId => (
                <ChatBox 
                    key={friendId} 
                    friendId={friendId} 
                    onClose={() => handleCloseChat(friendId)} 
                />
            ))}
        </div>
    );
};

export default ChatBoxManager;