import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader';
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar';
import CreateProduct from '../../components/Shop/CreateProduct.jsx'

const ShopCreateProductPage = () => {
    return (
        <div>
            <DashboardHeader />
            <div className="flex items-center justify-between w-full">
                <div className="w-[330px]">
                    <DashboardSideBar active={4} />
                </div>
                <div className="w-full justify-center flex">
                    <CreateProduct/>
                </div>
            </div>
        </div>
    )
}

export default ShopCreateProductPage;