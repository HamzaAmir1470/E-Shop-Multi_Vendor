import React from 'react'
import Footer from '../../components/Layout/Footer';
import ShopSettings from '../../components/Shop/ShopSettings.jsx';
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader.jsx';

const ShopSettingsPage = () => {
    return (
        <div>
            <DashboardHeader />
            <ShopSettings />
            <Footer />
        </div>
    )
}

export default ShopSettingsPage;