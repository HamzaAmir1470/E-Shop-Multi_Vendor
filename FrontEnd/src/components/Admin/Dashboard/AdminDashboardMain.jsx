import React, { useEffect, useState, useMemo, useCallback } from "react";
import { AiOutlineArrowRight, AiOutlineMoneyCollect } from "react-icons/ai";
import { Link } from "react-router-dom";
import { MdBorderClear } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersAdmin } from "../../../redux/actions/order";
import { getAllProductsShop } from "../../../redux/actions/product";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { FiPackage } from "react-icons/fi";
import { TbCurrencyDollar } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import axios from "axios";
import { server } from "../../../server";
import Loader from "../../Layout/Loader.jsx";
import { getAllSellers } from "../../../redux/actions/sellers.js";

// Constants
const STATUS_STYLES = {
    "Delivered": "bg-green-100 text-green-800",
    "Processing": "bg-blue-100 text-blue-800",
    "Shipped": "bg-purple-100 text-purple-800",
    "Cancelled": "bg-red-100 text-red-800",
    "Pending": "bg-yellow-100 text-yellow-800",
    "Refunded": "bg-orange-100 text-orange-800"
};

const SERVICE_CHARGE_RATE = 0.1;

// Utility functions
const normalizeStatus = (status) => {
    if (!status) return '';
    const words = status.split(/\s+/);
    const deduped = words.filter((w, i) => i === 0 || w !== words[i - 1]);
    return deduped.join(' ');
};

const isRefundSuccess = (order) => {
    const status = (order?.Status || order?.status || "").toString().toLowerCase();
    const paymentStatus = (order?.paymentInfo?.status || "").toString().toLowerCase();
    const anyItemRefunded = Array.isArray(order?.cart) && order.cart.some(it =>
        (it?.refundStatus || "").toString().toLowerCase().includes('success')
    );
    return paymentStatus === 'refunded' ||
        (/refund/.test(status) && /success/.test(status)) ||
        anyItemRefunded;
};

const isDeliveredOrder = (order) => {
    const status = (order?.Status || order?.status || "").toString().toLowerCase();
    return status === 'delivered' || isRefundSuccess(order);
};

// Components
const StatCard = ({ icon: Icon, title, value, subtitle, link, linkText, color, index, isMobile }) => (
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

const MobileStatCard = ({ title, value, link, linkText, icon: Icon, color, isExpanded, onToggle }) => (
    <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer"
        onClick={onToggle}
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
            <FaChevronDown className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-gray-400`} />
        </div>
        <AnimatePresence>
            {isExpanded && (
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

const OrderStatusCard = ({ deliveredOrders, pendingOrders, completionRate }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-lg transition-all duration-300"
    >
        <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                <MdBorderClear size={24} className="text-white" />
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
    </motion.div>
);

const AdminDashboardMain = ({ isMobile }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const { sellers } = useSelector((state) => state.seller);
    const { adminOrders, adminOrderLoading, isLoading } = useSelector((state) => state.order);
    const [seller, setSeller] = useState(null);
    const products = useSelector((state) => state.product.product);
    const [expandedCard, setExpandedCard] = useState(null);
    const [orders, setOrders] = useState([]);

    // Fetch data
    useEffect(() => {
        if (user && user.role === 'admin') {
            dispatch(getAllOrdersAdmin());
            dispatch(getAllProductsShop());
            dispatch(getAllSellers());

            axios.get(`${server}/order/admin-all-orders`, { withCredentials: true })
                .then(res => setOrders(res.data.orders))
                .catch(err => console.error("Failed to fetch orders:", err));
            axios.get(`${server}/shop/admin-all-sellers`, { withCredentials: true })
                .then(res => setSeller(res.data.sellers))
                .catch(err => console.error("Failed to fetch sellers:", err));
        }
    }, [dispatch, user]);

    const adminEarnings = adminOrders && adminOrders.reduce((acc, order) => { 
        return acc + order.totalPrice * SERVICE_CHARGE_RATE;
    }, 0);

    // Computed values
    const totalOrders = orders?.length || 0;
    const totalProducts = products?.length || 0;
    const totalSellers = sellers?.length || 0;
    const totalEarnings = adminEarnings || 0;

    const deliveredOrdersList = useMemo(
        () => orders?.filter(order => isDeliveredOrder(order)) || [],
        [orders]
    );

    const deliveredOrders = deliveredOrdersList.length;
    const pendingOrders = totalOrders - deliveredOrders;
    const completionRate = totalOrders ? (deliveredOrders / totalOrders) * 100 : 0;

    const totalEarningsWithoutTax = useMemo(
        () => deliveredOrdersList.reduce((acc, item) => acc + Number(item?.totalPrice || 0), 0),
        [deliveredOrdersList]
    );

    const projectedEarnings = Math.floor(totalEarningsWithoutTax * (1 - SERVICE_CHARGE_RATE));

    // Data grid rows
    const rows = useMemo(() =>
        orders?.map((item) => ({
            id: item._id,
            itemsQty: item.cart.reduce((acc, item) => acc + item.qty, 0),
            total: `US$ ${item.totalPrice.toFixed(2)}`,
            status: normalizeStatus(item.Status || item.status || (item.paymentInfo?.status === 'refunded' ? 'Refunded' : '')),
            date: new Date(item.createdAt).toLocaleDateString(),
        })) || [],
        [orders]
    );

    // Table columns configuration
    const getColumns = useCallback(() => {
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
                renderCell: (params) => (
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[params.value] || "bg-gray-100 text-gray-800"}`}>
                        {isMobile && params.value === "Delivered" ? "Del" : params.value}
                    </span>
                ),
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
                        }}
                        endIcon={!isMobile && <AiOutlineArrowRight size={14} />}
                    >
                        {isMobile ? "View" : "View Details"}
                    </Button>
                </Link>
            ),
        });

        return baseColumns;
    }, [isMobile]);

    const toggleExpandedCard = useCallback((title) => {
        setExpandedCard(prev => prev === title ? null : title);
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="w-full bg-gray-50 min-h-screen p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">Overview</h3>
                <p className="text-sm md:text-base text-gray-500 mt-1">
                    Welcome back, {user?.name || 'Admin'}!
                </p>
            </div>

            {/* Stats Grid */}
            {!isMobile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    <StatCard
                        index={0}
                        icon={TbCurrencyDollar}
                        title="Total Earnings"
                        value={`$${totalEarnings.toFixed(2)}`}
                        subtitle={totalEarnings > 0 ? "ready to withdraw" : ""}
                        link="/admin-withdraw-money"
                        linkText={totalEarnings > 0 ? "Withdraw Money" : "Add Funds"}
                        color="bg-gradient-to-r from-green-400 to-green-600"
                        isMobile={isMobile}
                    />
                    <StatCard
                        index={1}
                        icon={HiOutlineShoppingBag}
                        title="Total Orders"
                        value={totalOrders}
                        subtitle="all time"
                        link="/admin-orders"
                        linkText="View All Orders"
                        color="bg-gradient-to-r from-blue-400 to-blue-600"
                        isMobile={isMobile}
                    />
                    <StatCard
                        index={2}
                        icon={FiPackage}
                        title="Total Sellers"
                        value={totalSellers}
                        subtitle="active sellers"
                        link="/admin-sellers"
                        linkText="Manage Sellers"
                        color="bg-gradient-to-r from-purple-400 to-purple-600"
                        isMobile={isMobile}
                    />
                    <OrderStatusCard
                        deliveredOrders={deliveredOrders}
                        pendingOrders={pendingOrders}
                        completionRate={completionRate}
                    />
                </div>
            ) : (
                <div className="space-y-3 mb-6">
                    <MobileStatCard
                        icon={TbCurrencyDollar}
                        title="Total Earnings"
                        value={`$${totalEarnings.toFixed(2)}`}
                        link="/admin-withdraw-money"
                        linkText={totalEarnings > 0 ? "Withdraw Money" : "Add Funds"}
                        color="bg-gradient-to-r from-green-400 to-green-600"
                        isExpanded={expandedCard === "Total Earnings"}
                        onToggle={() => toggleExpandedCard("Total Earnings")}
                    />
                    <MobileStatCard
                        icon={HiOutlineShoppingBag}
                        title="Total Orders"
                        value={totalOrders}
                        link="/admin-orders"
                        linkText="View All Orders"
                        color="bg-gradient-to-r from-blue-400 to-blue-600"
                        isExpanded={expandedCard === "Total Orders"}
                        onToggle={() => toggleExpandedCard("Total Orders")}
                    />
                    <MobileStatCard
                        icon={FiPackage}
                        title="Total Sellers"
                        value={totalSellers}
                        link="/admin-sellers"
                        linkText="Manage Sellers"
                        color="bg-gradient-to-r from-purple-400 to-purple-600"
                        isExpanded={expandedCard === "Total Sellers"}
                        onToggle={() => toggleExpandedCard("Total Sellers")}
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
                                '&:hover': { backgroundColor: "#f7fafc" }
                            }}
                        >
                            View All Orders
                            <AiOutlineArrowRight size={isMobile ? 12 : 16} className="ml-1 md:ml-2" />
                        </Button>
                    </Link>
                </div>

                <div className="w-full overflow-x-auto">
                    {orders.length === 0 ? (
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
                    ) : !isMobile ? (
                        <div style={{ height: 'auto', width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={getColumns()}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 4, page: 0 } },
                                }}
                                pageSizeOptions={[4, 10, 25, 50]}
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
                                        minHeight: '48px !important',
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderTop: '1px solid #e5e7eb',
                                        minHeight: '48px',
                                    },
                                    '& .MuiDataGrid-row': {
                                        minHeight: '48px !important',
                                    },
                                }}
                            />
                        </div>
                    ) : (
                        <div className="p-3 space-y-3">
                            {rows.map((row) => (
                                <motion.div
                                    key={row.id}
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
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        Order #{String(row.id).slice(-6)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{row.date}</p>
                                                </div>
                                                <div className="ml-3 text-right">
                                                    <p className="text-sm font-semibold text-gray-900">{row.total}</p>
                                                    <p className="text-xs text-gray-500">{row.itemsQty} items</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center space-x-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[row.status] || "bg-gray-100 text-gray-800"}`}>
                                                    {row.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-3 flex-shrink-0">
                                        <Link to={`/order/${row.id}`} aria-label={`View order ${row.id}`}>
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardMain;