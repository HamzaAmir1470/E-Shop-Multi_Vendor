import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../Layout/Loader";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAllProductsShop } from "../../redux/actions/product";

const AllCoupons = () => {
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState("");
    const [value, setValue] = React.useState("");
    const [maxAmount, setMaxAmount] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [minAmount, setMinAmount] = React.useState("");
    const [coupouns, setCoupouns] = React.useState([]);
    const [selectedProducts, setSelectedProducts] = React.useState("");

    const { products } = useSelector((state) => state.product);
    const { seller } = useSelector((state) => state.seller);

    const dispatch = useDispatch();

    //  Extract fetchCoupons as a reusable function
    const fetchCoupons = async () => {
        if (!seller?._id) return;

        setIsLoading(true);

        try {
            const res = await axios.get(
                `${server}/coupoun/get-coupon/${seller._id}`,
                { withCredentials: true }
            );
            setCoupouns(res.data.couponCodes);
        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch coupons on load
    useEffect(() => {
        fetchCoupons();
    }, [seller?._id]);

    // Fetch products on load
    useEffect(() => {
        if (seller?._id) {
            dispatch(getAllProductsShop(seller._id));
        }
    }, [seller?._id]);

    // Delete coupon
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${server}/coupoun/delete-coupon/${id}`, {
                withCredentials: true,
            });
            toast.success("Coupon deleted successfully!");
            fetchCoupons(); // Refresh table
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    };

    // Create coupon
    // Create coupon
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                `${server}/coupoun/create-coupon-code`,
                {
                    name,
                    selectedProducts,
                    value,
                    maxAmount,
                    minAmount,
                    shop: seller._id, // <-- must match backend
                },
                { withCredentials: true }
            );

            toast.success("Coupon code created successfully!");
            setOpen(false);

            // Reset form
            setName("");
            setValue("");
            setMaxAmount("");
            setMinAmount("");
            setSelectedProducts("");

            fetchCoupons(); // <-- refresh DataGrid immediately
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    };


    const columns = [
        { field: "id", headerName: "Coupon Id", minWidth: 150, flex: 0.7 },
        { field: "name", headerName: "Name", minWidth: 180, flex: 1.4 },
        { field: "price", headerName: "Discount", minWidth: 100, flex: 0.6 },
        {
            field: "Delete",
            flex: 0.8,
            minWidth: 120,
            headerName: "",
            sortable: false,
            renderCell: (params) => (
                <Button onClick={() => handleDelete(params.id)}>
                    <AiOutlineDelete size={20} />
                </Button>
            ),
        },
    ];

    const row = coupouns.map((item) => ({
        id: item._id,
        name: item.name,
        price: item.value + "%",
    }));

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
               <div className="w-full px-4 sm:px-6 md:px-8 py-6 mt-6 bg-gray-50 min-h-screen">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">
                                    All Coupons
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Manage your coupon codes
                                </p>
                            </div>

                            <button
                                onClick={() => setOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                            >
                                Create Coupon Code
                            </button>
                        </div>

                        <div className="rounded-lg overflow-hidden border border-gray-200">
                            <DataGrid
                                rows={row}
                                columns={columns}
                                autoHeight
                                pageSizeOptions={[5, 10, 20]}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10, page: 0 } },
                                }}
                                disableRowSelectionOnClick
                                checkboxSelection={false}
                                sx={{
                                    border: "none",
                                    "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f9fafb", fontWeight: 600, fontSize: "14px" },
                                    "& .MuiDataGrid-row": { backgroundColor: "#ffffff" },
                                    "& .MuiDataGrid-row:hover": { backgroundColor: "#f3f4f6" },
                                    "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f1f1" },
                                    "& .MuiDataGrid-columnHeaderCheckbox": { display: "none" },
                                    "& .MuiDataGrid-cellCheckbox": { display: "none" },
                                }}
                            />
                        </div>
                    </div>

                    {/* Modal */}
                    {open && (
                        <div
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
                        >
                            <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto p-6">
                                <div className="flex justify-end">
                                    <RxCross1
                                        size={24}
                                        className="cursor-pointer text-gray-500 hover:text-black"
                                        onClick={() => setOpen(false)}
                                    />
                                </div>

                                <h2 className="text-2xl font-semibold text-center mb-6">
                                    Create Coupon Code
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            required
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter coupon code name"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Discount Percentage <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={value}
                                            required
                                            min="1"
                                            max="100"
                                            onChange={(e) => setValue(e.target.value)}
                                            placeholder="Enter discount value"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Minimum Amount <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={minAmount}
                                            required
                                            min="0"
                                            onChange={(e) => setMinAmount(e.target.value)}
                                            placeholder="Enter minimum amount"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Maximum Amount <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={maxAmount}
                                            required
                                            min="0"
                                            onChange={(e) => setMaxAmount(e.target.value)}
                                            placeholder="Enter maximum amount"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Selected Product
                                        </label>
                                        <select
                                            value={selectedProducts}
                                            required
                                            onChange={(e) => setSelectedProducts(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="">Choose product</option>
                                            {products &&
                                                products.map((i) => (
                                                    <option value={i._id} key={i._id}>
                                                        {i.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium transition duration-200"
                                    >
                                        Create Coupon Code
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AllCoupons;
