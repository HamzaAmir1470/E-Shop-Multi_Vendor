import React from 'react'
import AdminHeader from '../../components/Admin/Layout/AdminHeader.jsx';
import AdminDashboardSideBar from '../../components/Admin/Layout/AdminSidebar.jsx';
import AdminAllSellers from '../../components/Admin/Dashboard/AdminAllSellers.jsx';

const AdminDashboardSellersPage = () => {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    return (
        <div>
            <AdminHeader />
            <div className="flex justify-between w-full">
                <div className="w-[10px] lg:w-[330px]">
                    <AdminDashboardSideBar active={3} />
                </div>
                <div className="w-[85%] md:w-[93%] lg:w-full justify-center flex">
                    <AdminAllSellers isMobile={isMobile} />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardSellersPage