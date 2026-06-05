import React from 'react'

const DashboardMessages = () => {
    return (
        <div className="w-[90%] bg-white lg:ml-50 mt-5 mr-5 md-5 h-[95vh] overflow-y-scroll rounded">
            <h2 className="text-center text-[30px] py-3 font-poppins">
                All Messages
            </h2>

            {/* All Message List */}
            <MessageList />

        </div>
    )
}

const MessageList = () => {
    return (
        <div className="w-full flex p-1 px-3 bg-[#154b0a0c] cursor-pointer">
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
export default DashboardMessages