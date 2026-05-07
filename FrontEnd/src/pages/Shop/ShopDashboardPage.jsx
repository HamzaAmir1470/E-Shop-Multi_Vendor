import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader.jsx'
import DashboardSidebar from '../../components/Shop/Layout/DashboardSidebar.jsx'

const ShopDashboardPage = () => {
    return (
        <div>
            <DashboardHeader />
            <div className="flex items-center justify-between w-full">
                <div className="w-[330px]">
                    <DashboardSidebar active={ 1} />
                </div>
            </div>
        </div>
    )
}

export default ShopDashboardPage;