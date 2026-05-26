import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { AiOutlineArrowRight, AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersShop } from "../../redux/actions/order.js";

const getOrderGroupKey = (order) => order?.paymentInfo?.id || order?._id;

const groupOrdersByCheckout = (orders = []) => {
    const groupedOrders = new Map();

    orders.forEach((order) => {
        const groupKey = getOrderGroupKey(order);

        if (!groupedOrders.has(groupKey)) {
            groupedOrders.set(groupKey, {
                representative: order,
                orders: [order],
            });
            return;
        }

        groupedOrders.get(groupKey).orders.push(order);
    });

    return Array.from(groupedOrders.values());
};

const AllOrders = () => {
    const { orders, isLoading } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);

    const dispatch = useDispatch();

    useEffect(() => {
        if (seller?._id) {
            dispatch(getAllOrdersShop(seller._id));
        }
    }, [dispatch, seller]);

    const columns = [
        { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },
        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            cellClassName: (params) => {
                return params.value === "Delivered" ? "greenColor" : "redColor";
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
        },
        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 150,
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <Link to={`/order/${params.row.id}`}>
                    <Button variant="outlined" size="small">
                        <AiOutlineArrowRight size={20} className="mr-1" />
                        View
                    </Button>
                </Link>
            ),
        },
    ];

    const getOrderSubtotal = (order) =>
        (order.cart || []).reduce((total, item) => {
            const quantity = Number(item.qty || 1);
            const unitPrice = Number(item.discountPrice || item.price || 0);
            const itemDiscount = Number(item.itemDiscount || 0);

            return total + Math.max(quantity * unitPrice - itemDiscount, 0);
        }, 0);

    const rows = (orders || []).map((order) => ({
        id: order._id,
        itemsQty: order.cart?.length || 0,
        total: `US$ ${(getOrderSubtotal(order) * 1.1).toFixed(2)}`,
        status: order.orderStatus || order.Status,
    }));


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
                                All Orders
                            </h1>
                            <p className="text-sm text-gray-500">
                                Manage your store products
                            </p>
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

export default AllOrders;