import React from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";

const Hero = () => {
  return (
    <div
      className={`relative h-130 min-h-[70vh] 800px:min-h-[80vh] w-full bg-no-repeat ${styles.normalFlex}`}
      style={{
        backgroundImage:
          "url(https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className={`${styles.section} w-[90%] 800px:w-[60%]`}>
        <h1 className="text-[35px] leading-[1.2] 800px:text-60px text-[#3d3a3a] font-600px capitalize">
          Best Collection for <br /> Home Decoration
        </h1>
        <p className="mt-5 text-gray-800 sm:text-[16px] lg:text-[18px] leading-relaxed max-w-lg">
          Discover our exclusive collection of modern home decor, where style meets
          comfort. Elevate your space with vibrant, high-quality designs that
          reflect your personality and bring warmth to every corner of your home.
        </p>

        <Link to="/products" className="inline-block">
          <div className={`${styles.button} mt-5`}>
            <span className="text-white font-[Poppins] text-[18px]">
              Shop Now
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
