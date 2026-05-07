import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { deleteevent, getAlleventsShop } from "../../redux/actions/event";

const AllEvents = () => {
    const { events, isLoading } = useSelector((state) => state.events);
    const { seller } = useSelector((state) => state.seller);
    const dispatch = useDispatch();

    useEffect(() => {
        if (seller && seller._id) {
            dispatch(getAlleventsShop(seller._id));
        }
    }, [dispatch, seller]);

    const handleDelete = (id) => {
        if (!seller || !seller._id) return;

        if (window.confirm("Are you sure you want to delete this event?")) {
            dispatch(deleteevent(id)).then(() => {
                dispatch(getAlleventsShop(seller._id));
            });
        }
    };

    const columns = [
        { field: "id", headerName: "Event Id", minWidth: 150, flex: 0.7 },
        {
            field: "name",
            headerName: "Name",
            minWidth: 180,
            flex: 1.4,
        },
        {
            field: "price",
            headerName: "Price",
            minWidth: 100,
            flex: 0.6,
        },
        {
            field: "Stock",
            headerName: "Stock",
            type: "number",
            minWidth: 80,
            flex: 0.5,
        },
        {
            field: "sold",
            headerName: "Sold out",
            type: "number",
            minWidth: 130,
            flex: 0.6,
        },
        {
            field: "Preview",
            flex: 0.8,
            minWidth: 100,
            headerName: "",
            sortable: false,
            renderCell: (params) => {
                const d = params.row.name;
                const eventName = d.replace(/\s+/g, "-");
                return (
                    <Link to={`/event/${eventName}`}>
                        <Button>
                            <AiOutlineEye size={20} />
                        </Button>
                    </Link>
                );
            },
        },
        {
            field: "Delete",
            flex: 0.8,
            minWidth: 120,
            headerName: "",
            sortable: false,
            renderCell: (params) => {
                return (
                    <Button onClick={() => handleDelete(params.id)}>
                        <AiOutlineDelete size={20} />
                    </Button>
                );
            },
        },
    ];

    const row = [];

    if (events && Array.isArray(events) && events.length > 0) {
        events.forEach((item) => {
            row.push({
                id: item._id,
                name: item.name || "Untitled Event",
                price: item.discountPrice
                    ? "US$ " + item.discountPrice
                    : "US$ 0",
                Stock: item.stock || 0,
                sold: item.sold_out || 0,
                startDate: item.startDate,
                endDate: item.endDate,
            });
        });
    }

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="w-full px-4 sm:px-6 md:px-8 py-6 mt-6 bg-gray-50 min-h-screen">
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">

                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-800">
                                All Events
                            </h1>
                            <p className="text-sm text-gray-500">
                                Manage your shop events
                            </p>
                        </div>

                        <div className="rounded-lg overflow-hidden border border-gray-200">

                            <DataGrid
                                rows={row}
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

export default AllEvents;
