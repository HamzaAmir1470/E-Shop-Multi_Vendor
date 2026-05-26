import React, { useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader.jsx'
import DashboardSidebar from '../../components/Shop/Layout/DashboardSidebar.jsx'
import Loader from '../../components/Layout/Loader'
import { getAllOrdersShop } from '../../redux/actions/order'

const ShopRefundsPage = () => {
    const { seller } = useSelector((state) => state.seller);
    const { orders, isLoading } = useSelector((state) => state.order);
    const dispatch = useDispatch();

    useEffect(() => {
        if (seller?._id) {
            dispatch(getAllOrdersShop(seller._id));
        }
    }, [dispatch, seller]);

    const columns = [
        { field: 'orderId', headerName: 'Order ID', minWidth: 150, flex: 0.8 },
        { field: 'product', headerName: 'Product', minWidth: 180, flex: 1 },
        {
            field: 'delivery',
            headerName: 'Delivery',
            type: 'number',
            minWidth: 120,
            flex: 0.7,
        },
        {
            field: 'status',
            headerName: 'Status',
            minWidth: 140,
            flex: 0.7,
            cellClassName: (params) => (params.value === 'Delivered' ? 'greenColor' : 'redColor'),
        },
        {
            field: 'itemsQty',
            headerName: 'Qty',
            type: 'number',
            minWidth: 100,
            flex: 0.6,
        },
        {
            field: 'refundAmount',
            headerName: 'Refund Amount',
            type: 'number',
            minWidth: 150,
            flex: 0.8,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 150,
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <Link to={`/order/${params.row.orderId}`}>
                    <Button variant="outlined" size="small">
                        View
                    </Button>
                </Link>
            ),
        },
    ];

    const rows = (orders || []).flatMap((order) =>
        (order.cart || [])
            .filter((item) => item?.isRefundRequested || item?.refundStatus === 'Processing Refund' || item?.refundStatus === 'Refund Requested')
            .map((item) => {
                const quantity = item.qty || 1;
                const productId = item.product || item._id;
                const itemSubtotal = Math.max((Number(item.discountPrice || item.price || 0) * quantity) - Number(item.itemDiscount || 0), 0);
                const delivery = itemSubtotal * 0.1;

                return {
                    id: `${order._id}-${productId}`,
                    orderId: order._id,
                    product: item.name,
                    itemsQty: quantity,
                    delivery: `US$ ${delivery.toFixed(2)}`,
                    refundAmount: `US$ ${(itemSubtotal + delivery).toFixed(2)}`,
                    status: item.refundStatus || 'Refund Requested',
                };
            })
    );

    return (
        <div>
            <DashboardHeader />
            <div className="flex justify-between w-full">
                <div className="w-82.5">
                    <DashboardSidebar active={10} />
                </div>
                <div className="w-full p-6">
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
                            <p className="mt-2 text-gray-600">
                                Each refunded item appears as its own row.
                            </p>
                            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    autoHeight
                                    pageSizeOptions={[5, 10, 20]}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { pageSize: 10, page: 0 },
                                        },
                                    }}
                                    disableRowSelectionOnClick
                                    checkboxSelection={false}
                                    sx={{ border: 'none' }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShopRefundsPage