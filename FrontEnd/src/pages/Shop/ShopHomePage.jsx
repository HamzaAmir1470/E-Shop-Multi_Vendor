import React, { useEffect } from 'react'
import styles from '../../styles/styles'
import ShopInfo from "../../components/Shop/ShopInfo.jsx";
import ShopProfileData from "../../components/Shop/ShopProfileData.jsx";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ShopHomePage = () => {
  const navigate = useNavigate();
  const { isSeller, seller } = useSelector((state) => state.seller);

  useEffect(() => {
    if (isSeller && seller?._id) {
      navigate(`/shop/${seller._id}`, { replace: true });
    }
  }, [isSeller, seller, navigate]);
  return (
    <div className={`${styles.section} bg-[#f5f5f5]`}>
      <div className="w-full flex py-10 justify-between">
        <div className="w-[25%] bg-[#fff] rounded-[4px] shadow-sm overflow-y-scroll h-[90vh] sticky top-10 left-0 z-10">
          <ShopInfo isOwner={true} />
        </div>
        <div className="w-[72%] rounded-[4px]">
          <ShopProfileData isOwner={true} />
        </div>
      </div>
    </div>
  )
}

export default ShopHomePage;