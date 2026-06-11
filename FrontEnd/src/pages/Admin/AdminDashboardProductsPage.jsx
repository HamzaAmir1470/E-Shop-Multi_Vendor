import React from 'react'
import AdminHeader from '../../components/Admin/Layout/AdminHeader'
import AdminDashboardSideBar from '../../components/Admin/Layout/AdminSidebar.jsx'
import AdminDashboardProducts from "../../components/Admin/Dashboard/AdminDashboardProducts.jsx"

const AdminDashboardProductsPage = () => {
    return (
        <div>
            <AdminHeader />
            <div className="flex justify-between w-full">
                <div className="w-[10px] lg:w-[330px]">
                    <AdminDashboardSideBar active={6} />
                </div>
                <div className="w-[85%] md:w-[93%] lg:w-full justify-center flex">
                    <AdminDashboardProducts/>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardProductsPage