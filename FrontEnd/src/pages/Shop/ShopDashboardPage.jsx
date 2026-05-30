import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader.jsx';
import DashboardSidebar from '../../components/Shop/Layout/DashboardSidebar.jsx';
import DashboardHero from '../../components/Shop/DashboardHero.jsx';
import { IoMenuOutline, IoCloseOutline } from 'react-icons/io5';

const ShopDashboardPage = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (!isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    useEffect(() => {
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />

            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    onClick={toggleMobileMenu}
                    className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 md:hidden"
                    style={{ boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)' }}
                >
                    {isMobileMenuOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
                </button>
            )}

            <div className="flex relative">
                {/* Sidebar - Desktop */}
                <div className={`
                    ${isMobile ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out' : 'relative'}
                    ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                    w-[280px] bg-white border-r border-gray-200 shadow-lg
                    ${isMobile ? 'h-full overflow-y-auto' : 'h-[calc(100vh-64px)] overflow-y-auto sticky top-16'}
                `}>
                    <div className="pt-6">
                        <DashboardSidebar active={1} toggleMobileMenu={isMobile ? toggleMobileMenu : null} />
                    </div>
                </div>

                {/* Mobile Overlay */}
                {isMobile && isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
                        onClick={toggleMobileMenu}
                    />
                )}

                {/* Main Content */}
                <div className={`
                    flex-1 transition-all duration-300
                    ${isMobile ? 'w-full' : 'ml-0'}
                    mt-16
                `}>
                    <DashboardHero isMobile={isMobile} />
                </div>
            </div>
        </div>
    );
};

export default ShopDashboardPage;