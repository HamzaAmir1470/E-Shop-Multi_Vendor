import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight, AiOutlineMoneyCollect } from "react-icons/ai";
import { Link } from "react-router-dom";
import { MdBorderClear } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersShop } from "../../redux/actions/order";
import { getAllProductsShop } from "../../redux/actions/product";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { FiPackage } from "react-icons/fi";
import { TbCurrencyDollar } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const DashboardHero = ({ isMobile }) => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.order);
    const { seller } = useSelector((state) => state.seller);
    const { products } = useSelector((state) => state.product);
    const [expandedCard, setExpandedCard] = useState(null);
    const sellerId = seller?._id;

    useEffect(() => {
        if (!sellerId) return;
        dispatch(getAllOrdersShop(sellerId));
        dispatch(getAllProductsShop(sellerId));
    }, [dispatch, sellerId]);

    // Get available balance directly from seller Redux state
    const availableBalance = seller?.availableBalance || 0;
    const totalOrders = orders?.length || 0;
    const totalProducts = products?.length || 0;

    const isRefundSuccess = (order) => {
        const status = (order?.Status || order?.status || "").toString().toLowerCase();
        const paymentStatus = (order?.paymentInfo?.status || "").toString().toLowerCase();
        const anyItemRefunded = Array.isArray(order?.cart) && order.cart.some(it =>
            (it?.refundStatus || "").toString().toLowerCase().includes('success')
        );
        return paymentStatus === 'refunded' ||
            (/refund/.test(status) && /success/.test(status)) ||
            anyItemRefunded;
    }

    const isDeliveredOrder = (order) => {
        const status = (order?.Status || order?.status || "").toString().toLowerCase();
        return status === 'delivered' || isRefundSuccess(order);
    }

    const normalizeStatus = (status) => {
        if (!status) return '';
        const words = status.split(/\s+/);
        const deduped = words.filter((w, i) => i === 0 || w !== words[i - 1]);
        return deduped.join(' ');
    }

    const deliveredOrdersList = orders?.filter(order => isDeliveredOrder(order)) || [];
    const deliveredOrders = deliveredOrdersList.length || 0;
    const pendingOrders = totalOrders - deliveredOrders;
    const completionRate = totalOrders ? (deliveredOrders / totalOrders) * 100 : 0;

    // Calculate total earnings for display purposes only
    const totalEarningsWithoutTax = deliveredOrdersList.reduce((acc, item) => {
        return acc + Number(item?.totalPrice || 0);
    }, 0);

    const serviceCharge = totalEarningsWithoutTax * 0.1;
    const projectedEarnings = Math.floor(totalEarningsWithoutTax - serviceCharge);

    // Responsive columns for DataGrid
    const getColumns = () => {
        const baseColumns = [
            {
                field: "id",
                headerName: "Order ID",
                minWidth: isMobile ? 120 : 200,
                flex: 0.8,
                renderCell: (params) => (
                    <span className="text-xs md:text-sm font-mono text-gray-600">
                        {isMobile ? `#${params.value.slice(-6)}` : `#${params.value.slice(-8)}`}
                    </span>
                )
            },
            {
                field: "status",
                headerName: "Status",
                minWidth: isMobile ? 100 : 130,
                flex: 0.6,
                renderCell: (params) => {
                    const status = params.value;
                    const statusStyles = {
                        "Delivered": "bg-green-100 text-green-800",
                        "Processing": "bg-blue-100 text-blue-800",
                        "Shipped": "bg-purple-100 text-purple-800",
                        "Cancelled": "bg-red-100 text-red-800",
                        "Pending": "bg-yellow-100 text-yellow-800",
                        "Refunded": "bg-orange-100 text-orange-800"
                    };
                    return (
                        <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}>
                            {isMobile && status === "Delivered" ? "Del" : status}
                        </span>
                    );
                },
            },
            {
                field: "itemsQty",
                headerName: "Items",
                type: "number",
                minWidth: isMobile ? 70 : 100,
                flex: 0.5,
                headerAlign: "center",
                align: "center",
            },
            {
                field: "total",
                headerName: "Total",
                type: "number",
                minWidth: isMobile ? 100 : 130,
                flex: 0.7,
                renderCell: (params) => (
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{params.value}</span>
                ),
            },
        ];

        if (!isMobile) {
            baseColumns.push({
                field: "date",
                headerName: "Date",
                minWidth: 150,
                flex: 0.7,
                renderCell: (params) => (
                    <span className="text-sm text-gray-500">{params.value}</span>
                ),
            });
        }

        baseColumns.push({
            field: "actions",
            flex: 0.5,
            minWidth: isMobile ? 80 : 100,
            headerName: "",
            sortable: false,
            renderCell: (params) => (
                <Link to={`/order/${params.id}`}>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            mb: 2,
                            textTransform: "none",
                            borderRadius: "20px",
                            border: "1.5px solid transparent",
                            background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box",
                            color: "#4a5568",
                            minWidth: isMobile ? 'auto' : '110px',
                            padding: isMobile ? '4px 12px' : '6px 20px',
                            fontSize: isMobile ? '0.7rem' : '0.875rem',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: "linear-gradient(135deg, #667eea, #764ba2) padding-box",
                                color: "white",
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            },
                            '&:active': {
                                transform: 'translateY(0px)',
                            }
                        }}
                        endIcon={!isMobile && <AiOutlineArrowRight size={14} />}
                    >
                        {isMobile ? "View" : "View Details"}
                    </Button>
                </Link>
            ),
        });

        return baseColumns;
    };

    const row = [];
    orders && orders.slice(0, isMobile ? 5 : 10).forEach((item) => {
        row.push({
            id: item._id,
            itemsQty: item.cart.reduce((acc, item) => acc + item.qty, 0),
            total: "US$ " + item.totalPrice.toFixed(2),
            status: normalizeStatus((item.Status || item.status || (item.paymentInfo?.status === 'refunded' ? 'Refunded' : ''))),
            date: new Date(item.createdAt).toLocaleDateString(),
        });
    });

    const StatCard = ({ icon: Icon, title, value, subtitle, link, linkText, color, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
        >
            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-3 md:mb-4 ${color}`}>
                            <Icon size={isMobile ? 20 : 24} className="text-white" />
                        </div>
                        <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                            {title}
                        </h3>
                        <div className="flex items-baseline flex-wrap">
                            <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
                            {subtitle && (
                                <span className="ml-2 text-xs md:text-sm text-gray-500">{subtitle}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                    <Link to={link}>
                        <span className="text-xs md:text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center">
                            {linkText}
                            <svg className="ml-1 w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </Link>
                </div>
            </div>
        </motion.div>
    );

    const MobileStatCard = ({ title, value, link, linkText, icon: Icon, color, showSubtitle }) => (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer"
            onClick={() => setExpandedCard(expandedCard === title ? null : title)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                        <p className="text-xl font-bold text-gray-900">{value}</p>
                    </div>
                </div>
                <FaChevronDown className={`transform transition-transform duration-300 ${expandedCard === title ? 'rotate-180' : ''} text-gray-400`} />
            </div>
            <AnimatePresence>
                {expandedCard === title && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Link to={link}>
                                <span className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center">
                                    {linkText}
                                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="w-full bg-gray-50 min-h-screen p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Overview</h3>
                <p className="text-sm md:text-base text-gray-500 mt-1">
                    Welcome back, {seller?.name || 'Seller'}!
                </p>
            </div>

            {/* Stats Grid - Responsive layout */}
            {!isMobile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    <StatCard
                        index={0}
                        icon={TbCurrencyDollar}
                        title="Available Balance"
                        value={`$${availableBalance.toFixed(2)}`}
                        subtitle={availableBalance > 0 ? "ready to withdraw" : ""}
                        link="/dashboard-withdraw-money"
                        linkText={availableBalance > 0 ? "Withdraw Money" : "Add Funds"}
                        color="bg-gradient-to-r from-green-400 to-green-600"
                    />
                    <StatCard
                        index={1}
                        icon={HiOutlineShoppingBag}
                        title="Total Orders"
                        value={totalOrders}
                        subtitle="all time"
                        link="/dashboard-orders"
                        linkText="View All Orders"
                        color="bg-gradient-to-r from-blue-400 to-blue-600"
                    />
                    <StatCard
                        index={2}
                        icon={FiPackage}
                        title="Total Products"
                        value={totalProducts}
                        subtitle="active listings"
                        link="/dashboard-products"
                        linkText="Manage Products"
                        color="bg-gradient-to-r from-purple-400 to-purple-600"
                    />
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                                <MdBorderClear size={isMobile ? 20 : 24} className="text-white" />
                            </div>
                        </div>
                        <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Order Status
                        </h3>
                        <div className="space-y-2 md:space-y-3 mt-2 md:mt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs md:text-sm text-gray-600">Delivered</span>
                                <span className="font-semibold text-green-600 text-sm md:text-base">{deliveredOrders}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs md:text-sm text-gray-600">Pending</span>
                                <span className="font-semibold text-orange-600 text-sm md:text-base">{pendingOrders}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <motion.div
                                    className="bg-green-500 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{completionRate.toFixed(0)}% completion rate</p>
                        </div>
                    </motion.div> */}
                </div>
            ) : (
                // Mobile Stats Cards
                <div className="space-y-3 mb-6">
                    <MobileStatCard
                        icon={TbCurrencyDollar}
                        title="Available Balance"
                        value={`$${availableBalance.toFixed(2)}`}
                        link="/dashboard-withdraw-money"
                        linkText={availableBalance > 0 ? "Withdraw Money" : "Add Funds"}
                        color="bg-gradient-to-r from-green-400 to-green-600"
                    />
                    <MobileStatCard
                        icon={HiOutlineShoppingBag}
                        title="Total Orders"
                        value={totalOrders}
                        link="/dashboard-orders"
                        linkText="View All Orders"
                        color="bg-gradient-to-r from-blue-400 to-blue-600"
                    />
                    <MobileStatCard
                        icon={FiPackage}
                        title="Total Products"
                        value={totalProducts}
                        link="/dashboard-products"
                        linkText="Manage Products"
                        color="bg-gradient-to-r from-purple-400 to-purple-600"
                    />
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                                <MdBorderClear size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                                <p className="text-lg font-bold text-gray-900">{deliveredOrders}/{totalOrders} Completed</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Delivered: {deliveredOrders}</span>
                            <span>Pending: {pendingOrders}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Orders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-2">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <Link to="/dashboard-orders">
                        <Button
                            variant="text"
                            size="small"
                            sx={{
                                textTransform: "none",
                                color: "#667eea",
                                fontWeight: 500,
                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                '&:hover': {
                                    backgroundColor: "#f7fafc"
                                }
                            }}
                        >
                            View All Orders
                            <AiOutlineArrowRight size={isMobile ? 12 : 16} className="ml-1 md:ml-2" />
                        </Button>
                    </Link>
                </div>
                <div className="w-full overflow-x-auto">
                    <div>
                        {!isMobile ? (
                            <div style={{ height: 450, width: '100%' }}>
                                <DataGrid
                                    rows={row}
                                    columns={getColumns()}
                                    pageSize={10}
                                    rowsPerPageOptions={[10, 25, 50]}
                                    disableSelectionOnClick
                                    density="standard"
                                    sx={{
                                        border: 'none',
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #f3f4f6',
                                            fontSize: '0.875rem',
                                            padding: '8px 16px',
                                        },
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f9fafb',
                                            borderBottom: '1px solid #e5e7eb',
                                            color: '#374151',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            minHeight: '56px !important',
                                        },
                                        '& .MuiDataGrid-footerContainer': {
                                            borderTop: '1px solid #e5e7eb',
                                            minHeight: '52px',
                                        },
                                        '& .MuiDataGrid-row': {
                                            minHeight: '52px !important',
                                        },
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="p-3 space-y-3">
                                {row && row.length > 0 ? (
                                    row.map((r) => (
                                        <motion.div
                                            key={r.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="bg-white border border-gray-100 rounded-lg shadow-sm p-3 flex items-center justify-between"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-gray-600">
                                                        <HiOutlineShoppingBag size={18} />
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="truncate">
                                                            <p className="text-sm font-medium text-gray-900 truncate">Order {`#${String(r.id).slice(-6)}`}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{r.date}</p>
                                                        </div>
                                                        <div className="ml-3 text-right">
                                                            <p className="text-sm font-semibold text-gray-900">{r.total}</p>
                                                            <p className="text-xs text-gray-500">{r.itemsQty} items</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center space-x-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                            r.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                                                r.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                                                    r.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>{r.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-3 flex-shrink-0">
                                                <Link to={`/order/${r.id}`} aria-label={`View order ${r.id}`}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            textTransform: 'none',
                                                            borderRadius: '8px',
                                                            borderColor: '#e2e8f0',
                                                            color: '#4a5568',
                                                            minWidth: '64px',
                                                            padding: '6px 10px',
                                                            fontSize: '0.75rem',
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-sm text-gray-500">No recent orders</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Empty state for no orders */}
            {orders && orders.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 md:py-12"
                >
                    <div className="text-gray-400 mb-4">
                        <HiOutlineShoppingBag size={isMobile ? 48 : 64} className="mx-auto" />
                    </div>
                    <p className="text-gray-500 text-sm md:text-base">No orders yet</p>
                    <p className="text-gray-400 text-xs md:text-sm mt-1">When you receive orders, they will appear here</p>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardHero;