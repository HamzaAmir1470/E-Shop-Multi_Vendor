import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Layout/Header";
import { useSelector } from "react-redux";
import { format } from "timeago.js";
import { resolveAssetUrl, server } from "../server";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import {
    AiOutlineArrowRight,
    AiOutlineSend,
    AiOutlinePaperClip,
    AiOutlineCheckCircle,
    AiOutlineClockCircle,
    AiOutlineArrowLeft,
    AiOutlineMore,
} from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { BiSmile, BiImageAdd } from "react-icons/bi";
import { IoMdAttach } from "react-icons/io";
import io from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:4000/";

const UserInbox = () => {
    const { user, loading } = useSelector((state) => state.user);
    const [conversations, setConversations] = useState([]);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [currentChat, setCurrentChat] = useState();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [userData, setUserData] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activeStatus, setActiveStatus] = useState(false);
    const [open, setOpen] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [socket, setSocket] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(ENDPOINT, { transports: ["websocket"] });
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle back button on mobile
    useEffect(() => {
        if (open && isMobile) {
            const handleBackButton = (e) => {
                setOpen(false);
                navigate('/inbox');
            };
            window.addEventListener('popstate', handleBackButton);
            return () => window.removeEventListener('popstate', handleBackButton);
        }
    }, [open, isMobile, navigate]);

    useEffect(() => {
        if (!socket) return;

        socket.on("getMessage", (data) => {
            setArrivalMessage({
                sender: data.senderId,
                text: data.text,
                images: data.images,
                createdAt: Date.now(),
            });
        });

        socket.on("typing", ({ senderId, isTyping }) => {
            if (currentChat?.members.includes(senderId)) {
                setIsTyping(isTyping);
            }
        });

        return () => {
            socket.off("getMessage");
            socket.off("typing");
        };
    }, [socket, currentChat]);

    useEffect(() => {
        if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
            setMessages((prev) => [...prev, arrivalMessage]);
        }
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        const getConversation = async () => {
            if (!user?._id) return;
            try {
                const response = await axios.get(
                    `${server}/conversation/get-all-conversation-user/${user?._id}`,
                    {
                        withCredentials: true,
                    }
                );
                setConversations(response.data.conversations);
            } catch (error) {
                console.log(error);
            }
        };
        getConversation();
    }, [user?._id]);

    useEffect(() => {
        if (user && socket) {
            const sellerId = user?._id;
            socket.emit("addUser", sellerId);
            socket.on("getUsers", (data) => {
                setOnlineUsers(data);
            });
        }

        return () => {
            if (socket) {
                socket.off("getUsers");
            }
        };
    }, [user, socket]);

    const onlineCheck = (chat) => {
        const chatMembers = chat.members.find((member) => member !== user?._id);
        const online = onlineUsers.find((user) => user.userId === chatMembers);
        return online ? true : false;
    };

    useEffect(() => {
        if (!currentChat?._id) return;

        const getMessage = async () => {
            setIsLoadingMessages(true);
            try {
                const response = await axios.get(
                    `${server}/message/get-all-messages/${currentChat?._id}`
                );
                setMessages(response.data.messages);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoadingMessages(false);
            }
        };
        getMessage();
    }, [currentChat?._id]);

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!typing && socket && currentChat) {
            setTyping(true);
            socket.emit("typing", {
                senderId: user._id,
                receiverId: currentChat?.members.find((member) => member !== user._id),
                isTyping: true,
            });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
            if (socket && currentChat) {
                socket.emit("typing", {
                    senderId: user._id,
                    receiverId: currentChat?.members.find((member) => member !== user._id),
                    isTyping: false,
                });
            }
        }, 1000);
    };

    const updateLastMessage = async (lastMessageText) => {
        if (!currentChat) return;

        if (socket) {
            socket.emit("updateLastMessage", {
                lastMessage: lastMessageText,
                lastMessageId: user._id,
            });
        }

        await axios
            .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
                lastMessage: lastMessageText,
                lastMessageId: user._id,
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const sendMessageHandler = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !currentChat) return;

        const messageData = {
            sender: user._id,
            text: newMessage,
            conversationId: currentChat._id,
        };

        const receiverId = currentChat.members.find((member) => member !== user._id);

        // Optimistic update
        const tempMessage = {
            _id: Date.now(),
            ...messageData,
            isTemp: true
        };
        setMessages([...messages, tempMessage]);

        if (socket) {
            socket.emit("sendMessage", {
                senderId: user._id,
                receiverId,
                text: newMessage,
            });
        }

        try {
            const res = await axios.post(`${server}/message/create-new-message`, messageData);
            setMessages(prev => prev.map(msg =>
                msg._id === tempMessage._id ? res.data.message : msg
            ));
            await updateLastMessage(newMessage);
            setNewMessage("");
        } catch (error) {
            console.log(error);
            setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
            alert('Failed to send message. Please try again.');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentChat) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        await imageSendingHandler(file);
        e.target.value = '';
    };

    const imageSendingHandler = async (file) => {
        const formData = new FormData();
        formData.append("images", file);
        formData.append("sender", user._id);
        formData.append("text", newMessage || "");
        formData.append("conversationId", currentChat._id);

        const receiverId = currentChat.members.find((member) => member !== user._id);

        // Create object URL for preview
        const previewUrl = URL.createObjectURL(file);

        // Optimistic update with local preview
        const tempMessage = {
            _id: Date.now(),
            sender: user._id,
            text: newMessage || "",
            images: previewUrl,
            conversationId: currentChat._id,
            createdAt: Date.now(),
            isTemp: true,
            isImagePreview: true
        };

        setMessages([...messages, tempMessage]);
        setNewMessage("");

        if (socket) {
            socket.emit("sendMessage", {
                senderId: user._id,
                receiverId,
                images: file,
            });
        }

        try {
            const res = await axios.post(`${server}/message/create-new-message`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            URL.revokeObjectURL(previewUrl);
            setMessages(prev => prev.map(msg =>
                msg._id === tempMessage._id ? res.data.message : msg
            ));
            await updateLastMessage("📷 Photo");
        } catch (error) {
            console.log(error);
            URL.revokeObjectURL(previewUrl);
            setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
            alert('Failed to send image. Please try again.');
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleCloseChat = () => {
        setOpen(false);
        setCurrentChat(null);
        setMessages([]);
        navigate('/inbox');
    };

    // Handle URL params for opening specific chat
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const chatId = queryParams.get('chat');
        if (chatId && conversations.length > 0) {
            const chat = conversations.find(c => c._id === chatId);
            if (chat) {
                setCurrentChat(chat);
                setOpen(true);
            }
        }
    }, [location.search, conversations]);

    return (
        <div className="w-full min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            {!open ? (
                <>
                    <Header />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        <div className="text-center mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Messages
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 mt-2">Connect with sellers and manage your conversations</p>
                        </div>

                        {/* Conversations List */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="divide-y divide-gray-100">
                                {conversations && conversations.length > 0 ? (
                                    conversations.map((item, index) => (
                                        <MessageList
                                            data={item}
                                            key={index}
                                            index={index}
                                            setOpen={setOpen}
                                            setCurrentChat={setCurrentChat}
                                            me={user?._id}
                                            setUserData={setUserData}
                                            userData={userData}
                                            online={onlineCheck(item)}
                                            setActiveStatus={setActiveStatus}
                                            loading={loading}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12 sm:py-16">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AiOutlineClockCircle className="text-3xl sm:text-4xl text-gray-400" />
                                        </div>
                                        <p className="text-gray-500">No messages yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Start a conversation with a seller</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <UserInboxs
                    setOpen={handleCloseChat}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    sendMessageHandler={sendMessageHandler}
                    messages={messages}
                    sellerId={user._id}
                    userData={userData}
                    activeStatus={activeStatus}
                    scrollRef={scrollRef}
                    handleImageUpload={handleImageUpload}
                    handleTyping={handleTyping}
                    isTyping={isTyping}
                    isMobile={isMobile}
                    isLoadingMessages={isLoadingMessages}
                />
            )}
        </div>
    );
};

const MessageList = ({
    data,
    index,
    setOpen,
    setCurrentChat,
    me,
    setUserData,
    userData,
    online,
    setActiveStatus,
    loading,
}) => {
    const [active, setActive] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const otherId = data.members.find((id) => id !== me);

    const handleClick = () => {
        setActive(true);
        setOpen(true);
        setCurrentChat(data);
        setUserData(user);
        setActiveStatus(online);
        navigate(`/inbox?chat=${data._id}`);
    };

    useEffect(() => {
        setActiveStatus(online);

        const fetchUser = async () => {
            try {
                const res = await axios.get(`${server}/shop/get-shop-info/${otherId}`);
                setUser(res.data.shop);
            } catch (err) {
                console.log(err);
            }
        };

        fetchUser();
    }, [otherId, online, setActiveStatus]);

    const isLastMessageFromMe = data.lastMessageId === me;

    return (
        <div
            className={`w-full flex items-center p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 ${active ? "bg-blue-50/50 border-l-4 border-blue-500" : "bg-transparent"
                }`}
            onClick={handleClick}
        >
            {/* Avatar Section */}
            <div className="relative shrink-0">
                <img
                    src={resolveAssetUrl(user?.avatar) || "https://ui-avatars.com/api/?background=3B82F6&color=fff&bold=true&name=" + (user?.name || "User")}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-md"
                    alt={user?.name}
                />
                <div
                    className={`absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white ${online ? "bg-green-500 animate-pulse" : "bg-gray-400"
                        }`}
                />
            </div>

            {/* Conversation Info */}
            <div className="flex-1 ml-3 sm:ml-4 min-w-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                        {user?.name || "Loading..."}
                    </h2>
                    {data.updatedAt && (
                        <span className="text-[10px] sm:text-xs text-gray-400 ml-2 shrink-0">
                            {format(data.updatedAt)}
                        </span>
                    )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5 flex items-center gap-1">
                    {isLastMessageFromMe && (
                        <span className="inline-flex items-center text-gray-400 mr-1">
                            <AiOutlineCheckCircle size={12} />
                            <span className="ml-0.5">You:</span>
                        </span>
                    )}
                    <span>{data.lastMessage || "Start a conversation"}</span>
                </p>
            </div>
        </div>
    );
};

const UserInboxs = ({
    setOpen,
    newMessage,
    setNewMessage,
    sendMessageHandler,
    messages,
    sellerId,
    userData,
    activeStatus,
    scrollRef,
    handleImageUpload,
    handleTyping,
    isTyping,
    isMobile,
    isLoadingMessages,
}) => {
    const [showOptions, setShowOptions] = useState(false);
    const fileInputRef = useRef(null);

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    // Helper function to get image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        if (imagePath.startsWith('blob:')) return imagePath;

        if (imagePath.startsWith('http')) return imagePath;

        return resolveAssetUrl(imagePath);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setOpen()}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200"
                        aria-label="Go back"
                    >
                        <AiOutlineArrowLeft size={isMobile ? 18 : 20} className="text-gray-600" />
                    </button>

                    <img
                        src={resolveAssetUrl(userData?.avatar) || "https://ui-avatars.com/api/?background=3B82F6&color=fff&bold=true&name=" + (userData?.name || "User")}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm"
                        alt={userData?.name}
                    />
                    <div>
                        <h2 className="font-semibold text-sm sm:text-base text-gray-800">
                            {userData?.name || "Seller"}
                        </h2>
                        <div className="flex items-center gap-1 text-xs">
                            <div
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${activeStatus ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                    }`}
                            />
                            <span className="text-gray-500 text-[10px] sm:text-xs">
                                {activeStatus ? "Active now" : "Offline"}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200"
                >
                    <AiOutlineMore size={isMobile ? 18 : 20} className="text-gray-600" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-gray-500">Loading messages...</div>
                    </div>
                ) : (
                    messages?.map((item, index) => {
                        const isOwnMessage = item.sender === sellerId;
                        const imageUrl = item.images ? getImageUrl(item.images) : null;

                        return (
                            <div
                                key={item._id || index}
                                ref={index === messages.length - 1 ? scrollRef : null}
                                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-fade-in`}
                            >
                                {!isOwnMessage && (
                                    <img
                                        src={resolveAssetUrl(userData?.avatar) || "https://ui-avatars.com/api/?background=3B82F6&color=fff&bold=true&name=" + (userData?.name || "User")}
                                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover mr-1.5 sm:mr-2 self-end mb-1"
                                        alt="avatar"
                                    />
                                )}
                                <div className={`max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                                    {item.text && item.text.trim() !== "" && (
                                        <div
                                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl ${isOwnMessage
                                                ? "bg-blue-600 text-white rounded-br-sm"
                                                : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                                                }`}
                                        >
                                            <p className="text-sm sm:text-base wrap-break-word">{item.text}</p>
                                        </div>
                                    )}
                                    {imageUrl && (
                                        <div className="mt-2">
                                            <img
                                                src={imageUrl}
                                                alt="Shared image"
                                                className="max-w-64 sm:max-w-72 max-h-64 sm:max-h-72 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => {
                                                    if (!item.isTemp) {
                                                        window.open(imageUrl, '_blank');
                                                    }
                                                }}
                                                onError={(e) => {
                                                    console.error('Image failed to load:', imageUrl);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <p
                                        className={`text-[8px] sm:text-[10px] text-gray-400 mt-1 ${isOwnMessage ? "text-right" : "text-left"
                                            }`}
                                    >
                                        {format(item.createdAt)}
                                        {item.isTemp && " (Sending...)"}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-gray-200 px-3 py-2 sm:px-4 sm:py-2 rounded-2xl rounded-bl-sm">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessageHandler} className="bg-white border-t border-gray-200 p-2 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={triggerImageUpload}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200"
                    >
                        <BiImageAdd size={isMobile ? 20 : 22} className="text-gray-500" />
                    </button>
                    <input
                        type="file"
                        id="image"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            placeholder="Type your message..."
                            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-1.5 sm:p-2.5 rounded-full transition-all ${newMessage.trim()
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md active:bg-blue-800"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <AiOutlineSend size={isMobile ? 18 : 20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

// Add CSS animations
const styles = `
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out;
}

@keyframes bounce {
    0%, 60%, 100% {
        transform: translateY(0);
    }
    30% {
        transform: translateY(-10px);
    }
}

.animate-bounce {
    animation: bounce 1.4s infinite ease-in-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

export default UserInbox;