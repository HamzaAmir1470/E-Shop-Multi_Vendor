import React from 'react'
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import ShopSettings from '../../components/Shop/ShopSettings.jsx';

const ShopSettingsPage = () => {
    return (
        <div>
            <Header />
            <ShopSettings />
            <Footer />
        </div>
    )
}

export default ShopSettingsPage;