import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { backend_url, server } from '../../server'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import styles from '../../styles/styles'
import { TfiGallery } from "react-icons/tfi";
import { format } from 'timeago.js';
import socketIo from 'socket.io-client';
const ENDPOINT = "http://localhost:4000/";
const socketId = socketIo(ENDPOINT, { transports: ['websocket'] });

const DashboardMessages = () => {
    const { seller } = useSelector((state) => state.seller);
    const [conversations, setConversations] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [arrivalMessage, setArrivalMessage] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [currentChat, setCurrentChat] = React.useState(null);
    const [userData, setUserData] = React.useState(null);
    const [newMessage, setNewMessage] = React.useState("");
    const [onlineUsers, setOnlineUsers] = React.useState([]);
    const [activeStatus, setActiveStatus] = React.useState(false);

    useEffect(() => {
        socketId.on("getMessage", (data) => {
            setArrivalMessage({
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now(),
            });
        });
    }, []);

    useEffect(() => {
        arrivalMessage && currentChat?.members.includes(arrivalMessage.sender) && setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        axios.get(`${server}/conversation/get-all-conversation-seller/${seller._id}`, { withCredentials: true })
            .then((res) => {
                setConversations(res.data.conversations);
            }).catch((error) => {
                console.log(error);
            })
    }, [seller._id])

    useEffect(() => {
        if (seller) {
            const userId = seller._id;
            socketId.emit("addUser", userId);
            socketId.on("getUsers", (users) => {
                setOnlineUsers(users);
            });
        }
    }, [seller])

    const onlineCheck = (chat) => {
        const chatMembers = chat.members.find((member) => member !== seller._id);
        const online = onlineUsers.find((user) => user.userId === chatMembers);
        return online ? true : false;
    }

    // get messages
    useEffect(() => {
        if (!currentChat?._id) return;

        const getMessage = async () => {
            try {
                const res = await axios.get(
                    `${server}/message/get-all-messages/${currentChat._id}`
                );

                setMessages(res.data.messages);
            } catch (error) {
                console.log(error);
            }
        };

        getMessage();
    }, [currentChat]);

    // create new message

    const sendMessageHandler = (e) => {
        e.preventDefault();
        const message = {
            sender: seller._id,
            text: newMessage,
            conversationId: currentChat?._id,
            createdAt: Date.now(),
        };
        const receiverId = currentChat?.members.find((member) => member !== seller._id);
        socketId.emit("sendMessage", {
            senderId: seller._id,
            receiverId,
            text: newMessage,
        });
        try {
            if (newMessage !== "") {
                axios.post(`${server}/message/create-new-message`, message)
                    .then((res) => {
                        setMessages([...messages, res.data.message]);
                        updateLastMessage();
                        setNewMessage("");
                    }).catch((error) => {
                        console.log(error);
                    })
            }
        } catch (error) {
            console.log(error);
        }
    }

    const updateLastMessage = async () => {
        socketId.emit("updateLastMessage", {
            lastMessageId: seller._id,
            lastMessage: newMessage,
        });

        await axios.put(`${server}/conversation/update-last-message/${currentChat?._id}`, {
            lastMessage: newMessage,
            lastMessageId: seller._id,
        }).then((res) => {
            console.log(res.data.conversation);
            setNewMessage("");
        }).catch((error) => {
            console.log(error);
        })
    }

    return (
        <div className="w-[90%] bg-white lg:ml-50 mt-5 mr-5 md-5 h-[95vh] overflow-y-scroll rounded">


            {/* All Message List */}
            {!open && (
                <>
                    <h1 className="text-center text-[30px] py-3 font-poppins">
                        All Messages
                    </h1>
                    {
                        conversations && conversations.map((item, index) => (
                            <MessageList
                                data={item}
                                key={index}
                                index={index}
                                setOpen={setOpen}
                                setCurrentChat={setCurrentChat}
                                me={seller._id}
                                userData={userData}
                                setUserData={setUserData}
                                online={onlineCheck(item)}
                                setActiveStatus={setActiveStatus}
                            />
                        ))
                    }
                </>
            )}
            {
                open && (
                    <SellerInbox
                        setOpen={setOpen}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        sendMessageHandler={sendMessageHandler}
                        messages={messages}
                        sellerId={seller._id}
                        userData={userData}
                        activeStatus={activeStatus}
                    />
                )
            }
        </div>
    )
}
export default DashboardMessages;

const MessageList = ({ data, index, setOpen, setCurrentChat, me, userData, setUserData, online, setActiveStatus }) => {
    const navigate = useNavigate();
    const [active, setActive] = React.useState(false);
    const handleClick = (id) => {
        navigate(`?${id}`);
        setOpen(true);
    }

    useEffect(() => {
        setActiveStatus(online)
        const userId = data.members.find((id) => id !== me);
        const getUser = async () => {
            try {
                const res = await axios.get(`${server}/user/user-info/${userId}`);
                setUserData(res.data.user);
            } catch (error) {
                console.log(error);
            }
        };
        getUser();
    }, [data._id, me])

    return (
        <div
            className={`w-full flex p-1 px-3 ${active ? 'bg-[#154b0a0c]' : 'bg-transparent'} cursor-pointer`}
            onClick={(e) => setActive(index) || handleClick(data._id) || setCurrentChat(data)}>
            <div className="relative">
                <img
                    src={`${backend_url}${userData?.avatar?.url}`}
                    alt={userData?.name || "User Avatar"}
                    className="w-[50px] h-[50px] rounded-full object-cover border border-gray-200"
                />
                {
                    online ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white">
                        </div>
                    ) : (
                        <div className="w-3 h-3 bg-gray-500 rounded-full absolute bottom-0 right-0 border-2 border-white">
                        </div>
                    )
                }
            </div>
            <div className="pl-3">
                <h1 className=" text-[18px] font-poppins">{userData ? userData.name : "User"}</h1>
                <p className=" text-[16px] text-[#000c]">{
                    data.lastMessageId !== userData?._id ? "You: " : userData.name.split(" ")[0] + ": "
                } {data?.lastMessage}</p>
            </div>
        </div>
    )
}

const SellerInbox = ({ setOpen, newMessage, setNewMessage, sendMessageHandler, messages, sellerId, userData, activeStatus }) => {
    return (
        <div className="w-full min-h-full flex flex-col justify-between ">
            {/* message Header */}
            <div className="w-full flex p-3 items-center justify-between bg-slate-200">
                <div className="flex">
                    <img
                        src={`${backend_url}${userData?.avatar?.url}`}
                        alt={userData?.name || "User Avatar"}
                        className="w-[60px] h-[60px] rounded-full object-cover border border-gray-200"
                    />
                    <div className="pl-3">
                        <h1 className="text-[18px] font-poppins font-[600]">{userData?.name || "User"}</h1>
                        <p className="text-[14px] text-[#000c]">{activeStatus ? "Active Now" : "Offline"}</p>
                    </div>
                </div>
                <AiOutlineArrowRight size={20} onClick={(e) => setOpen(false)} className="cursor-pointer" />
            </div>

            {/* messages */}
            <div className="px-3 h-[65vh] py-3 overflow-y-scroll">
                {
                    messages && messages.map((item, index) => (
                        <div className={`flex w-full my-2 ${item?.sender === sellerId ? "justify-end" : "justify-start"}`}>
                            {
                                item.sender !== sellerId && (
                                    <img
                                        src={`${backend_url}${userData?.avatar?.url}`}
                                        alt={userData?.name || "User Avatar"}
                                        className="w-[40px] h-[40px] rounded-full  mr-3"
                                    />
                                )
                            }
                            <div className="">
                                <div className={`w-max p-2 rounded ${item?.sender === sellerId ? "bg-[#38c776] text-[#fff]" : "bg-slate-200 text-[#000c]"} h-min`}>
                                    <p className="text-[16px] ">{item?.text}</p>
                                </div>
                                <p className="text-[12px] text-[#0008] ">{format(item?.createdAt)}</p>
                            </div>
                        </div>

                    ))
                }
            </div>



            {/* Send Message */}
            <form
                aria-required={true}
                className="p-3 relative w-full flex justify-between items-center"
                onSubmit={sendMessageHandler}
            >
                <div className="w-[3%]">
                    <TfiGallery size={20} />
                </div>
                <div className="w-[97%]">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)} required
                        placeholder='Enter your message ...'
                        className={`${styles.input}`}
                    />
                    <input
                        type="submit"
                        value="Send"
                        className="hidden"
                        id="send"
                    />
                    <label htmlFor="send">
                        <AiOutlineSend size={20} className="absolute right-4 top-6 cursor-pointer" />
                    </label>
                </div>
            </form>
        </div>

    )
}