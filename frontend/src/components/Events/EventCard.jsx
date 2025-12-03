import React from "react";
import styles from "../../styles/styles";
import CountDown from "./CountDown";

const EventCard = ({ active }) => {
    return (
        <div
            className={`w-full md:mt-0 mt-20 bg-white rounded-2xl transition-all duration-300 overflow-hidden flex flex-col lg:flex-row ${active ? "mb-0" : "mb-12"
                }`}
        >
            {/* Image Section */}
            <div className="w-full lg:w-1/2 h-64 lg:h-auto">
                <img
                    src="https://m.media-amazon.com/images/I/31Vle5fVdaL.jpg"
                    alt="iPhone 14 Pro Max"
                    className="w-full h-full object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
                />
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-1/2 p-4 sm:p-6 flex flex-col justify-center gap-4">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900">
                    iPhone 14 Pro Max 8/256
                </h2>

                <p className="text-gray-600 text-sm sm:text-base lg:text-base leading-relaxed">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta dicta
                    illum laborum iure nobis facilis voluptate inventore eligendi nemo
                    eaque, reprehenderit quod alias animi iusto officia tenetur
                    necessitatibus eum dolore.
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. A velit optio
                    quis tempore nihil recusandae.
                </p>

                {/* Pricing + Timer Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="line-through text-lg sm:text-xl text-red-500 font-medium">
                                $1099
                            </span>
                            <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                $999
                            </span>
                        </div>
                        <span className="text-green-600 text-sm sm:text-base font-semibold mt-1 sm:mt-0">
                            120 Sold
                        </span>
                    </div>

                    <CountDown />
                </div>
            </div>
        </div>
    );
};

export default EventCard;
