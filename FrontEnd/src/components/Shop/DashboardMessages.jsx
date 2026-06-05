import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { server } from '../../server'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import styles from '../../styles/styles'
import { TfiGallery } from "react-icons/tfi";

const DashboardMessages = () => {
    const { seller } = useSelector((state) => state.seller);
    const [conversations, setConversations] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    useEffect(() => {
        axios.get(`${server}/conversation/get-all-conversation-seller/${seller._id}`, { withCredentials: true })
            .then((res) => {
                setConversations(res.data.conversations);
            }).catch((error) => {
                console.log(error);
            })
    }, [seller._id])

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
                            <MessageList data={item} key={index} index={index} setOpen={setOpen} />
                        ))
                    }
                </>
            )}
            {
                open && (
                    <SellerInbox setOpen={setOpen} />
                )
            }
        </div>
    )
}
export default DashboardMessages;

const MessageList = ({ data, index, setOpen }) => {
    const navigate = useNavigate();
    const [active, setActive] = React.useState(false);
    const handleClick = (id) => {
        navigate(`?${id}`);
        setOpen(true);
    }
    return (
        <div className={`w-full flex p-1 px-3 ${active ? 'bg-[#154b0a0c]' : 'bg-transparent'} cursor-pointer`} onClick={(e) => setActive(index) || handleClick(data._id)}>
            <div className="relative">
                <img
                    src="http://localhost:8000//Profile%20%20pic-1780396120221-530810327.png"
                    alt=""
                    className="w-[50px] h-[50px] rounded-full"
                />
                <div className="w-3 h-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white">
                </div>
            </div>
            <div className="pl-3">
                <h1 className=" text-[18px] font-poppins">Sultan</h1>
                <p className=" text-[16px] text-[#000c]">You: Yeah I am Good!</p>
            </div>
        </div>
    )
}

const SellerInbox = ({ setOpen }) => {
    return (
        <div className="w-full min-h-full flex flex-col justify-between ">
            {/* message Header */}
            <div className="w-full flex p-3 items-center justify-between bg-slate-200">
                <div className="flex">
                    <img src="http://localhost:8000//Profile%20%20pic-1780396120221-530810327.png" alt="" className="w-[60px] h-[60px] rounded-full " />
                    <div className="pl-3">
                        <h1 className="text-[18px] font-poppins font-[600]">Sultan</h1>
                        <p className="text-[14px] text-[#000c]">Active Now</p>
                    </div>
                </div>
                <AiOutlineArrowRight size={20} onClick={(e) => setOpen(false)} className="cursor-pointer" />
            </div>

            {/* messages */}
            <div className="px-3 h-[65vh] py-3 overflow-y-scroll">
                <div className="flex w-full my-2">
                    <img src="http://localhost:8000//Profile%20%20pic-1780396120221-530810327.png" alt="" className="w-[40px] h-[40px] rounded-full  mr-3" />
                    <div className="w-max p-2 rounded bg-[#38c776] text-[#fff] h-min">
                        <p className="text-[16px] ">Hi Seller!</p>
                    </div>
                </div>
                
                <div className="flex w-full justify-end my-2">

                    <div className="w-max p-2 rounded bg-[#38c776] text-[#fff] h-min">
                        <p className="text-[16px] ">Hello Dear!</p>
                    </div>
                </div>

            </div>


            {/* Send Message */}
            <form aria-required={true} className="p-3 relative w-full flex justify-between items-center">
                <div className="w-[3%]">
                    <TfiGallery size={20} />
                </div>
                <div className="w-[97%]">
                    <input type="text" required placeholder='Enter your message ...' className={`${styles.input}`} />
                    <input type="submit" value="Send" className="hidden" id="send" />
                    <label htmlFor="send">
                        <AiOutlineSend size={20} className="absolute right-4 top-6 cursor-pointer" />
                    </label>
                </div>
            </form>
        </div>

    )
}