import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, IconButton, Tooltip } from '@mui/material';
import { AiOutlineDelete, AiOutlineEye } from 'react-icons/ai';
import { DataGrid } from '@mui/x-data-grid';
import { getAllSellers } from '../../../redux/actions/sellers.js';
import Loader from '../../Layout/Loader.jsx';
import axios from 'axios';
import { server } from '../../../server.js';
import { toast } from 'react-toastify';

const AdminAllSellers = ({ isMobile }) => {
    const dispatch = useDispatch();
    const { sellers, isLoading } = useSelector((state) => state.seller);
    const [open, setOpen] = useState(false);
    const [selectedSellerId, setSelectedSellerId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        dispatch(getAllSellers());
    }, [dispatch]);

    const handleDeleteUser = useCallback(async (sellerId) => {
        if (!sellerId) return;

        setIsDeleting(true);
        try {
            const { data } = await axios.delete(
                `${server}/shop/admin-delete-seller/${sellerId}`,
                { withCredentials: true }
            );
            toast.success(data.message);
            dispatch(getAllSellers());
            setOpen(false);
            setSelectedSellerId(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete seller');
        } finally {
            setIsDeleting(false);
        }
    }, [dispatch]);

    const handleOpenModal = useCallback((sellerId) => {
        setSelectedSellerId(sellerId);
        setOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setOpen(false);
        setSelectedSellerId(null);
    }, []);

    const sellerList = useMemo(() =>
        sellers?.map((seller) => ({
            id: seller._id,
            name: seller.name,
            email: seller.email,
            address: seller.address,
            joinedAt: seller.createdAt,
            shopDescription: seller.description,
            shopPhone: seller.phoneNumber,
        })) || [],
        [sellers]
    );

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }, []);

    const columns = useMemo(() => {
        const baseColumns = [
            {
                field: "id",
                headerName: "Seller ID",
                minWidth: isMobile ? 120 : 200,
                flex: 0.8,
                renderCell: (params) => (
                    <span className="text-xs md:text-sm font-mono text-gray-600">
                        {isMobile ? `#${params.value.slice(-6)}` : `#${params.value.slice(-8)}`}
                    </span>
                )
            },
            {
                field: "name",
                headerName: "Seller Name",
                minWidth: isMobile ? 120 : 180,
                flex: 1,
                renderCell: (params) => (
                    <span className="font-medium text-gray-900">{params.value}</span>
                ),
            },
            {
                field: "email",
                headerName: "Email",
                minWidth: isMobile ? 150 : 220,
                flex: 1.2,
            },
            {
                field: "address",
                headerName: "Shop Address",
                minWidth: isMobile ? 150 : 200,
                flex: 1,
                renderCell: (params) => (
                    <span className="text-sm text-gray-600">
                        {params.value || 'No address provided'}
                    </span>
                ),
            },
            {
                field: "joinedAt",
                headerName: "Joined Date",
                minWidth: isMobile ? 120 : 150,
                flex: 0.8,
                renderCell: (params) => (
                    <span className="text-sm text-gray-500">
                        {formatDate(params.value)}
                    </span>
                ),
            },
            {
                field: "preview",
                headerName: "Preview",
                minWidth: isMobile ? 60 : 80,
                flex: 0.5,
                sortable: false,
                align: "center",
                renderCell: (params) => (
                    <Tooltip title="View Shop">
                        <Link to={`/shop/preview/${params.id}`} target="_blank" rel="noopener noreferrer">
                            <IconButton size="small" color="primary">
                                <AiOutlineEye size={isMobile ? 18 : 20} />
                            </IconButton>
                        </Link>
                    </Tooltip>
                ),
            },
            {
                field: "actions",
                headerName: "Delete",
                minWidth: isMobile ? 60 : 80,
                flex: 0.5,
                sortable: false,
                align: "center",
                renderCell: (params) => (
                    <Tooltip title="Delete Seller">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenModal(params.id)}
                        >
                            <AiOutlineDelete size={isMobile ? 18 : 20} />
                        </IconButton>
                    </Tooltip>
                ),
            },
        ];

        return baseColumns;
    }, [isMobile, formatDate, handleOpenModal]);

    if (isLoading) {
        return <Loader />;
    }

    if (!sellers || sellers.length === 0) {
        return (
            <div className="w-full mt-5 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <h3 className="text-xl md:text-2xl font-Poppins font-semibold pb-4">
                        All Sellers
                    </h3>
                    <div className="w-full min-h-[45vh] bg-white rounded-lg shadow-sm flex items-center justify-center">
                        <p className="text-gray-500 text-lg">No sellers found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mt-5 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center pb-4">
                    <h3 className="text-xl md:text-2xl font-Poppins font-semibold">
                        All Sellers
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Total: {sellerList.length}
                    </span>
                </div>

                <div className="w-full min-h-[45vh] bg-white rounded-lg shadow-sm overflow-hidden">
                    <DataGrid
                        rows={sellerList}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 10, page: 0 },
                            },
                        }}
                        pageSizeOptions={[5, 10, 25, 50]}
                        disableRowSelectionOnClick
                        autoHeight
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                                '&:focus': {
                                    outline: 'none',
                                },
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#fafafa',
                                borderBottom: '2px solid #e0e0e0',
                                fontWeight: 600,
                                fontSize: isMobile ? '0.875rem' : '0.9rem',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f5f5f5',
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid #e0e0e0',
                            },
                        }}
                    />
                </div>

                {open && (
                    <div
                        className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4 animate-fadeIn"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) handleCloseModal();
                        }}
                    >
                        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl animate-slideUp">
                            {/* Header */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                                    Confirm Delete
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Warning Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-center mb-6">
                                    Are you sure you want to delete this seller?
                                    <span className="block text-sm text-red-500 mt-1">This action cannot be undone.</span>
                                </p>

                                {/* Buttons */}
                                <div className="flex flex-col-reverse sm:flex-row gap-3">
                                    <button
                                        onClick={handleCloseModal}
                                        disabled={isDeleting}
                                        className="w-full sm:flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(selectedSellerId)}
                                        disabled={isDeleting}
                                        className="w-full sm:flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete Seller'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAllSellers;