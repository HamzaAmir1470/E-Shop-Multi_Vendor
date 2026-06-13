import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader.jsx';
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar.jsx';
import DashboardHero from '../../components/Shop/DashboardHero.jsx';
import { IoMenuOutline, IoCloseOutline } from 'react-icons/io5';

const ShopDashboardPage = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
         <div>
            <DashboardHeader />
            <div className="flex justify-between w-full">
                <div className="w-[330px]">
                    <DashboardSideBar active={1} />
                </div>
                <div className="w-full justify-center flex">
                    <DashboardHero isMobile={isMobile} />
                </div>
            </div>
        </div>
    );
};

export default ShopDashboardPage;