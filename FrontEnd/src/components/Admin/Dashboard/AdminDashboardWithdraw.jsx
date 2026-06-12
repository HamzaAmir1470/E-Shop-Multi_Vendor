import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../../server";
import { Link } from "react-router-dom";
import { BsPencil, BsCheckCircle, BsClock, BsXCircle, BsCashStack } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { AiOutlineReload, AiOutlineEye, AiOutlineDownload } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import styles from "../../../styles/styles";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "timeago.js";

const AllWithdraw = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [open, setOpen] = useState(false);
    const [withdrawData, setWithdrawData] = useState(null);
    const [withdrawStatus, setWithdrawStatus] = useState("Succeed");
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch withdraw requests
    const fetchWithdraws = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${server}/withdraw/get-all-withdraw-request`, {
                withCredentials: true,
            });
            setData(response.data.withdraws);
            setFilteredData(response.data.withdraws);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch withdraw requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdraws();
    }, []);

    // Filter and search
    useEffect(() => {
        let filtered = [...data];

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        // Search by shop name or ID
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.seller?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item._id?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredData(filtered);
    }, [statusFilter, searchTerm, data]);

    const handleUpdateStatus = async () => {
        if (!withdrawData) return;

        setLoading(true);
        try {
            const response = await axios.put(
                `${server}/withdraw/update-withdraw-request/${withdrawData.id}`,
                {
                    sellerId: withdrawData.shopId,
                    status: withdrawStatus,
                },
                { withCredentials: true }
            );

            toast.success(`Withdraw request ${withdrawStatus.toLowerCase()} successfully!`);
            await fetchWithdraws();
            setOpen(false);
            setWithdrawData(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update withdraw request");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "succeed":
            case "success":
                return "bg-green-100 text-green-800";
            case "processing":
                return "bg-yellow-100 text-yellow-800";
            case "failed":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "succeed":
            case "success":
                return <BsCheckCircle className="text-green-600" size={16} />;
            case "processing":
                return <BsClock className="text-yellow-600" size={16} />;
            case "failed":
                return <BsXCircle className="text-red-600" size={16} />;
            default:
                return <BsClock className="text-gray-600" size={16} />;
        }
    };

    const columns = [
        {
            field: "id",
            headerName: "Withdraw ID",
            minWidth: 200,
            flex: 0.8,
            renderCell: (params) => (
                <div className="flex items-center gap-2 mt-4">
                    <span className="font-mono text-sm text-gray-600">
                        {params.value?.slice(-8)}
                    </span>
                    <button
                        onClick={() => navigator.clipboard.writeText(params.value)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy full ID"
                    >
                        <AiOutlineEye size={14} />
                    </button>
                </div>
            ),
        },
        {
            field: "name",
            headerName: "Shop Name",
            minWidth: 200,
            flex: 1.2,
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {params.value?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{params.value}</span>
                </div>
            ),
        },
        {
            field: "shopId",
            headerName: "Shop ID",
            minWidth: 200,
            flex: 0.9,
            renderCell: (params) => (
                <span className="font-mono text-sm text-gray-500">
                    {params.value?.slice(-8)}
                </span>
            ),
        },
        {
            field: "amount",
            headerName: "Amount",
            minWidth: 120,
            flex: 0.6,
            renderCell: (params) => (
                <div className="flex items-center gap-1 font-bold text-green-600">
                    <BsCashStack size={14} />
                    <span>{params.value}</span>
                </div>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
            flex: 0.6,
            renderCell: (params) => (
                <div className={`flex items-center gap-2 mt-4 rounded-full ${getStatusColor(params.value)} w-fit`}>
                    {getStatusIcon(params.value)}
                    <span className="text-sm font-medium">{params.value}</span>
                </div>
            ),
        },
        {
            field: "createdAt",
            headerName: "Request Date",
            minWidth: 150,
            flex: 0.7,
            renderCell: (params) => (
                <div className="text-sm text-gray-600 mt-4">
                    {params.value}
                </div>
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 130,
            flex: 0.6,
            sortable: false,
            renderCell: (params) => (
                <button
                    disabled={params.row.status !== "Processing"}
                    onClick={() => {
                        setWithdrawData(params.row);
                        setOpen(true);
                    }}
                    className={`flex items-center gap-2 mt-4 rounded-lg transition-all duration-200 ${params.row.status === "Processing"
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                            : "bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    <BsPencil size={16} />
                    <span className="text-sm font-medium">Update</span>
                </button>
            ),
        },
    ];

    const rows = filteredData.map((item) => ({
        id: item._id,
        shopId: item.seller?._id || "N/A",
        name: item.seller?.name || "Unknown Shop",
        amount: `$${item.amount?.toLocaleString() || 0}`,
        status: item.status || "Processing",
        createdAt: item.createdAt ? item.createdAt.slice(0, 10) : "N/A",
        createdAtRaw: item.createdAt,
    }));

    const stats = {
        total: data.length,
        processing: data.filter(d => d.status === "Processing").length,
        succeed: data.filter(d => d.status === "Succeed").length,
        failed: data.filter(d => d.status === "Failed").length,
        totalAmount: data.reduce((sum, d) => sum + (d.amount || 0), 0),
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Withdrawal Requests
                    </h1>
                    <p className="text-gray-500 mt-2">Manage and process seller withdrawal requests</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <BsCashStack className="text-blue-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Processing</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
                            </div>
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <BsClock className="text-yellow-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.succeed}</p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <BsCheckCircle className="text-green-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                            </div>
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <BsXCircle className="text-red-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-2xl font-bold text-purple-600">${stats.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <BsCashStack className="text-purple-600" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${statusFilter === "all"
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter("Processing")}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${statusFilter === "Processing"
                                        ? "bg-yellow-500 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                Processing
                            </button>
                            <button
                                onClick={() => setStatusFilter("Succeed")}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${statusFilter === "Succeed"
                                        ? "bg-green-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                Succeed
                            </button>
                            <button
                                onClick={() => setStatusFilter("Failed")}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${statusFilter === "Failed"
                                        ? "bg-red-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                Failed
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by shop or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                                <FiFilter className="absolute left-3 top-3 text-gray-400" size={16} />
                            </div>

                            <button
                                onClick={fetchWithdraws}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <AiOutlineReload className={loading ? "animate-spin" : ""} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 25, 50]}
                        disableSelectionOnClick
                        autoHeight
                        loading={loading}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8fafc',
                                color: '#1e293b',
                                fontWeight: 600,
                                borderBottom: '2px solid #e2e8f0',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f8fafc',
                            },
                        }}
                    />
                </div>

                {/* Update Status Modal */}
                {open && withdrawData && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
                            <div className="flex justify-between items-center p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-800">Update Withdrawal Status</h2>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <RxCross1 size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shop Name:</span>
                                        <span className="font-medium">{withdrawData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount:</span>
                                        <span className="font-bold text-green-600">{withdrawData.amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current Status:</span>
                                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(withdrawData.status)}`}>
                                            {withdrawData.status}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Update Status To:
                                    </label>
                                    <select
                                        value={withdrawStatus}
                                        onChange={(e) => setWithdrawStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Succeed">Succeed</option>
                                        <option value="Processing">Processing</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    disabled={loading}
                                    className={`flex-1 px-4 py-2 rounded-lg text-white transition-all ${loading
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 shadow-md"
                                        }`}
                                >
                                    {loading ? "Updating..." : "Update Status"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add custom animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AllWithdraw;