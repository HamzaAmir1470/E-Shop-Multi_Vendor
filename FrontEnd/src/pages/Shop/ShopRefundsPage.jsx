import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader.jsx'
import DashboardSidebar from '../../components/Shop/Layout/DashboardSidebar.jsx'

const ShopRefundsPage = () => {
    return (
        <div>
            <DashboardHeader />
            <div className="flex justify-between w-full">
                <div className="w-[330px]">
                    <DashboardSidebar active={10} />
                </div>
                <div className="w-full p-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
                        <p className="mt-2 text-gray-600">
                            Refund management is available for delivered orders.
                        </p>
                        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                            Select a delivered order to review or process its refund.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopRefundsPage