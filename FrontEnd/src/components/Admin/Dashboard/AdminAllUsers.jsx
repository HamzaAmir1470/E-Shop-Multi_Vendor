import React, { useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { AiOutlineArrowRight, AiOutlineDelete } from 'react-icons/ai';
import { DataGrid } from '@mui/x-data-grid';
import { getAllUsers } from '../../../redux/actions/user.js';
import Loader from '../../Layout/Loader.jsx';

// Constants
const STATUS_STYLES = {
    "Delivered": "bg-green-100 text-green-800",
    "Processing": "bg-blue-100 text-blue-800",
    "Shipped": "bg-purple-100 text-purple-800",
    "Cancelled": "bg-red-100 text-red-800",
    "Pending": "bg-yellow-100 text-yellow-800",
    "Refunded": "bg-orange-100 text-orange-800"
};

const AdminAllUsers = ({ isMobile }) => {
    const dispatch = useDispatch();
    const { user, users, Usersloading } = useSelector((state) => state.user);

    useEffect(() => {
        if (user?.role === 'admin') {
            dispatch(getAllUsers());
        }
    }, [dispatch, user?.role]);

    const handleDeleteUser = (userId) => {
        // Implement delete user functionality here
        console.log(`Delete user with ID: ${userId}`);
    }

    const userList = useMemo(() =>
        users?.map((user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            joinedAt: user.createdAt,
        })) || [],
        [users]
    );

    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString();
    }, []);

    const columns = useMemo(() => {
        const baseColumns = [
            {
                field: "id",
                headerName: "User ID",
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
                headerName: "Name",
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
                field: "role",
                headerName: "User Role",
                minWidth: isMobile ? 120 : 180,
                flex: 0.8,
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
                field: "actions",
                flex: 0.5,
                minWidth: isMobile ? 80 : 100,
                headerName: "Delete User",
                sortable: false,
                renderCell: (params) => (
                    <>
                        <Button onClick={() => handleDeleteUser(params.id)}>
                            <AiOutlineDelete size={20} />
                        </Button>
                    </>
                ),
            },
        ];

        return baseColumns;
    }, [isMobile, formatDate]);

    if (Usersloading) return <Loader />;

    return (
        <div className="w-full px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <h3 className="text-xl md:text-2xl font-Poppins font-semibold pb-4">
                    All Users
                </h3>
                <div className="w-full min-h-[45vh] bg-white rounded-lg shadow-sm overflow-hidden">
                    <DataGrid
                        rows={userList}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        disableRowSelectionOnClick
                        autoHeight
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f0f0f0',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#fafafa',
                                borderBottom: '2px solid #e0e0e0',
                                fontWeight: 600,
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminAllUsers;