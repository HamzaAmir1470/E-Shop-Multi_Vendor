import React from 'react'
import AdminHeader from '../../components/Admin/Layout/AdminHeader'
import AllWithdraw from '../../components/Admin/Dashboard/AdminDashboardWithdraw.jsx'
import AdminDashboardSideBar from '../../components/Admin/Layout/AdminSidebar.jsx'
const AdminDashboardWithdrawRequestsPage = () => {
    return (
       <div>
            <AdminHeader />
            <div className="flex justify-between w-full">
                <div className="w-[10px] lg:w-[330px]">
                    <AdminDashboardSideBar active={7} />
                </div>
                <div className="w-[85%] md:w-[93%] lg:w-full justify-center flex">
                    <AllWithdraw />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardWithdrawRequestsPage