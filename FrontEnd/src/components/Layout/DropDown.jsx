import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";

const DropDown = ({ categoriesData, setDropDown }) => {
    const navigate = useNavigate();

    const submitHandle = (i) => {
        navigate(`/products?category=${i.title}`);
        setDropDown(false);
        // Consider if a full page reload is necessary here,
        // it often leads to a poor user experience.
        // window.location.reload(); 
    };

    return (
        <div className="pb-2 w-[270px] bg-white absolute z-30 rounded-b-md shadow-sm">
            {categoriesData &&
                categoriesData.map((i, index) => (
                    <div
                        key={index}
                        // Added flex-shrink-0 to prevent image wrapping issues if needed
                        className={`${styles.normalFlex} items-center px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-150 ease-in-out`}
                        onClick={() => submitHandle(i)}
                    >
                        <img
                            src={i.image_Url}
                            style={{
                                width: "25px",
                                height: "25px",
                                objectFit: "contain",
                                userSelect: "none",
                            }}
                            alt=""
                        />
                        {/* Reduced spacing: removed "m-3" and added "ml-3" for a smaller margin */}
                        <h3 className="ml-3 select-none text-gray-800 text-sm">{i.title}</h3>
                    </div>
                ))}
        </div>
    );
};

export default DropDown;
