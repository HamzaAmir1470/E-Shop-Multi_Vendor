import React from 'react'
import AdminHeader from '../../components/Admin/Layout/AdminHeader.jsx';
import AdminDashboardSideBar from '../../components/Admin/Layout/AdminSidebar.jsx';
import AdminDashboardEvents from '../../components/Admin/Dashboard/AdminDashboardEvents.jsx';

const AdminDashboardEventsPage = () => {
    return (
        <div>
            <AdminHeader />
            <div className="flex justify-between w-full">
                <div className="w-[10px] lg:w-[330px]">
                    <AdminDashboardSideBar active={5} />
                </div>
                <div className="w-[85%] md:w-[93%] lg:w-full justify-center flex">
                    <AdminDashboardEvents />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardEventsPage