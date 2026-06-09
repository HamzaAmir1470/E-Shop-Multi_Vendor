import React from 'react'
import AdminHeader from '../../components/Admin/Layout/AdminHeader.jsx';
import AdminDashboardSideBar from '../../components/Admin/Layout/AdminSidebar.jsx';
import AdminDashboardMain from "../../components/Admin/Dashboard/AdminDashboardMain.jsx";

const AdminDashboardPage = () => {
    return (
        <div>
            <AdminHeader />
            <div className="flex justify-between w-full">
                <div className="w-[10px] lg:w-[330px]">
                    <AdminDashboardSideBar active={1} />
                </div>
                <div className="w-[85%] md:w-[93%] lg:w-full justify-center flex">
                    <AdminDashboardMain />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardPage;