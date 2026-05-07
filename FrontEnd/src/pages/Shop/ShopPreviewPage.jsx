import React, { useEffect } from "react";
import styles from "../../styles/styles";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";
import { useSelector } from "react-redux";

const ShopPreviewPage = () => {
    const { seller } = useSelector((state) => state.seller);
    useEffect(() => { 
        window.scrollTo(0, 0);
    })
    return (
        <div className="min-h-screen bg-gray-50">
            <div className={`${styles.section} py-8`}>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        Shop Preview
                    </h1>
                    <p className="text-gray-500 mt-2">
                        View shop details and available products
                    </p>
                </div>

                {/* Layout */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <aside className="lg:w-[30%] w-full">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <ShopInfo isOwner={false} />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:w-[70%] w-full">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <ShopProfileData isOwner={seller} />
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
};

export default ShopPreviewPage;
