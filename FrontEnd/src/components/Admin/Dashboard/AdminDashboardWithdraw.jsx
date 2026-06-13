import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../../server";
import { BsPencil, BsCheckCircle, BsClock, BsXCircle, BsCashStack } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { AiOutlineReload, AiOutlineEye } from "react-icons/ai";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";

const AllWithdraw = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [withdrawData, setWithdrawData] = useState(null);
    const [withdrawStatus, setWithdrawStatus] = useState("Succeed");
    const [loading, setLoading] = useState(false);

    // Fetch withdraw requests
    const fetchWithdraws = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${server}/withdraw/get-all-withdraw-request`, {
                withCredentials: true,
            });
            setData(response.data.withdraws);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch withdraw requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdraws();
    }, []);

    const handleUpdateStatus = async () => {
        if (!withdrawData) return;

        setLoading(true);
        try {
            await axios.put(
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
            minWidth: 100,
            flex: 0.8,
            renderCell: (params) => (
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-600">
                        {params.value?.slice(-8)}
                    </span>
                </div>
            ),
        },
        {
            field: "name",
            headerName: "Shop Name",
            minWidth: 150,
            flex: 1.2,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <div className="w-full h-full flex items-center justify-center gap-2">
                    <span className="font-medium text-center">{params.value}</span>
                </div>
            ),
        },
        {
            field: "shopId",
            headerName: "Shop ID",
            minWidth: 200,
            flex: 0.9,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="font-mono text-sm text-gray-500">
                        {params.value?.slice(-8)}
                    </span>
                </div>
            ),
        },
        {
            field: "amount",
            headerName: "Amount",
            minWidth: 120,
            flex: 0.6,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="flex items-center gap-1 font-bold text-green-600">
                        <BsCashStack size={14} />
                        <span>{params.value}</span>
                    </div>
                </div>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
            flex: 0.6,
            renderCell: (params) => (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${getStatusColor(params.value)}`}>
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
                <div className="text-sm text-gray-600">
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${params.row.status === "Processing"
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

    const rows = data.map((item) => ({
        id: item._id,
        shopId: item.seller?._id || "N/A",
        name: item.seller?.name || "Unknown Shop",
        amount: `$${item.amount?.toLocaleString() || 0}`,
        status: item.status || "Processing",
        createdAt: item.createdAt ? item.createdAt.slice(0, 10) : "N/A",
    }));

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Withdrawal Requests
                        </h1>
                        <p className="text-gray-500 mt-2">Manage and process seller withdrawal requests</p>
                    </div>

                    <button
                        onClick={fetchWithdraws}
                        disabled={loading}
                        className="px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm border border-gray-200"
                    >
                        <AiOutlineReload className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
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
                                padding: '16px 8px',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8fafc',
                                color: '#1e293b',
                                fontWeight: 600,
                                borderBottom: '2px solid #e2e8f0',
                                fontSize: '0.9rem',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f8fafc',
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid #e2e8f0',
                                padding: '16px',
                            },
                            '& .MuiTablePagination-root': {
                                color: '#475569',
                            },
                        }}
                    />
                </div>

                {/* Update Status Modal */}
                {open && withdrawData && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
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
        </div>
    );
};

export default AllWithdraw;