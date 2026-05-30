import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersShop } from "../../redux/actions/order.js";

// We intentionally do NOT group orders here. Instead we render each refund request
// as its own row (per cart item) so shop owners can act on individual items.

const AllRefundOrders = () => {
    const { orders, isLoading } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);

    const dispatch = useDispatch();

    const refreshOrders = async () => {
        if (!seller?._id) return;
        await dispatch(getAllOrdersShop(seller._id));
        setLastSyncedAt(new Date());
    };

    useEffect(() => {
        refreshOrders();

        const intervalId = window.setInterval(refreshOrders, 10000);
        const handleFocus = () => refreshOrders();
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refreshOrders();
            }
        };

        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [seller?._id]);

    const refundItems = useMemo(() => {
        return (orders || []).flatMap((order) => {
            return (order.cart || [])
                .map((item) => {
                    const needsRefund = item?.isRefundRequested || (item?.refundStatus && item?.refundStatus !== "");
                    if (!needsRefund) return null;

                    const quantity = Number(item?.qty || 1);
                    const unitPrice = Number(item?.discountPrice || item?.price || 0);
                    const itemDiscount = Number(item?.itemDiscount || 0);
                    const subtotal = Math.max(quantity * unitPrice - itemDiscount, 0);
                    const delivery = subtotal * 0.1;

                    return {
                        id: `${order._id}-${item._id || item.product}`,
                        orderId: order._id,
                        productId: item._id || item.product,
                        product: item.name || item.title || 'Product',
                        qty: quantity,
                        refundAmount: (subtotal + delivery).toFixed(2),
                        // Prefer the order-level status because it reflects the latest seller action.
                        status: order.Status || order.orderStatus || order.status || item.refundStatus || 'Refund Requested',
                        rawOrder: order,
                        rawItem: item,
                    };
                })
                .filter(Boolean);
        });
    }, [orders]);

    // const refundItems = orders && orders.filter((item) => { return item.status === "Processing Refund"; });

    const columns = [
        { field: 'id', headerName: 'Item Key', minWidth: 200, flex: 0.9 },
        { field: 'orderId', headerName: 'Order ID', minWidth: 150, flex: 0.8 },
        { field: 'product', headerName: 'Product', minWidth: 220, flex: 1.4 },
        { field: 'qty', headerName: 'Qty', minWidth: 80, flex: 0.4 },
        { field: 'refundAmount', headerName: 'Refund Amount', minWidth: 140, flex: 0.6 },
        {
            field: 'status',
            headerName: 'Status',
            minWidth: 160,
            flex: 0.8,
            renderCell: (params) => (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${String(params.value).toLowerCase().includes('success') || String(params.value).toLowerCase().includes('delivered')
                        ? 'bg-emerald-100 text-emerald-700'
                        : String(params.value).toLowerCase().includes('reject') || String(params.value).toLowerCase().includes('cancel')
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {params.value}
                </span>
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 180,
            flex: 0.9,
            sortable: false,
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <Link to={`/order/${params.row.orderId}`}>
                        <Button variant="outlined" size="small">
                            <AiOutlineEye size={18} className="mr-1" />
                            View
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];



    const rows = (refundItems || []).map((it) => ({
        id: it.id,
        orderId: it.orderId,
        product: it.product,
        qty: it.qty,
        refundAmount: `US$ ${Number(it.refundAmount).toFixed(2)}`,
        status: it.status,
        rawOrder: it.rawOrder,
        rawItem: it.rawItem,
    }));

    const lastSyncedLabel = lastSyncedAt
        ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Live refresh active';


    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="w-full px-4 sm:px-6 md:px-8 py-6 mt-6 bg-gray-50 min-h-screen">

                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">


                        {/* Page Title */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-800">
                                All Refund Orders
                            </h1>
                            <p className="text-sm text-gray-500">
                                Manage refund requests and reflect seller status updates in near real time.
                            </p>
                            <p className="mt-2 text-xs text-gray-400">Last synced: {lastSyncedLabel}</p>
                        </div>

                        {/* Table Wrapper */}
                        <div className="rounded-lg overflow-hidden border border-gray-200">

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
                                sx={{
                                    border: "none",

                                    "& .MuiDataGrid-columnHeaders": {
                                        backgroundColor: "#f9fafb",
                                        fontWeight: 600,
                                        fontSize: "14px",
                                    },

                                    "& .MuiDataGrid-row": {
                                        backgroundColor: "#ffffff",
                                    },

                                    "& .MuiDataGrid-row:hover": {
                                        backgroundColor: "#f3f4f6",
                                    },

                                    "& .MuiDataGrid-cell": {
                                        borderBottom: "1px solid #f1f1f1",
                                    },

                                    "& .MuiDataGrid-columnHeaderCheckbox": {
                                        display: "none",
                                    },

                                    "& .MuiDataGrid-cellCheckbox": {
                                        display: "none",
                                    },
                                }}
                            />

                        </div>

                    </div>
                </div>
            )}
        </>
    );

};

export default AllRefundOrders;