import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { AiOutlineArrowRight, AiOutlineCamera, AiOutlineDelete } from "react-icons/ai";
import { MdTrackChanges } from "react-icons/md";
import styles from "../../styles/styles";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { deleteUserAddress, updateUserInformation } from "../../redux/actions/user";
import { toast } from "react-toastify";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import { RxCross1 } from "react-icons/rx";
import { updateUserAddress } from "../../redux/actions/user";
import { getAllOrdersUser } from "../../redux/actions/order";

const ProfileContent = ({ active }) => {
    const { user, error } = useSelector((state) => state.user);
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
    const [password, setPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch({ type: "clearErrors" });
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = {
            name,
            email,
            phoneNumber,
            password: password || undefined,
        };
        dispatch(updateUserInformation(form));
    };

    const handleImage = async (e) => {
        const file = e.target.files[0];
        setAvatar(file);
        const formData = new FormData();
        formData.append("file", file);
        await axios.put(`${server}/user/update-avatar`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        }).then((res) => {
            window.location.reload();
            toast.success("Avatar updated successfully!");
        }).catch((err) => {
            toast.error("Failed to update avatar");
        });
    }

    const avatarSrc = user?.avatar?.url
        ? `${backend_url}${user.avatar.url.startsWith('/') ? '' : '/'}${user.avatar.url}`
        : "/default-avatar.png";

    return (
        <div className="w-full px-5 pt-10 md:pt-0 md:pl-10">
            {/* Profile Page */}
            {active === 1 && (
                <>
                    <div className="flex justify-center w-full mb-8">
                        <div className="relative">
                            <img
                                src={avatarSrc}
                                alt="Profile"
                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#3ad132]"
                            />
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#e3e9ee] rounded-full flex items-center justify-center cursor-pointer absolute bottom-2 right-2 shadow-md hover:bg-gray-200 transition-colors">
                                <input type="file" id="image" className="hidden"
                                    onChange={handleImage} />
                                <label htmlFor="image">
                                    <AiOutlineCamera size={18} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="w-full px-4 sm:px-6 md:px-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block pb-2 text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className={`${styles.input} w-full !py-3`}
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block pb-2 text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className={`${styles.input} w-full !py-3`}
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block pb-2 text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className={`${styles.input} w-full !py-3`}
                                        required
                                        value={phoneNumber ? `0${phoneNumber}` : ''}
                                        onChange={(e) => {

                                            const inputValue = e.target.value.replace(/\D/g, '');

                                            // Ensure it starts with 0 and format it
                                            if (inputValue.length > 0) {
                                                // Remove leading zeros (except the first one) to prevent multiple zeros
                                                const cleaned = inputValue.replace(/^0+/, '0');

                                                if (cleaned.length > 4) {
                                                    const formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 11)}`;
                                                    setPhoneNumber(formatted.replace(/-/g, '')); // Store without hyphen
                                                } else {
                                                    setPhoneNumber(cleaned);
                                                }
                                            } else {
                                                setPhoneNumber('');
                                            }
                                        }}
                                        placeholder="0300-0000000"
                                    />
                                </div>
                                <div>
                                    <label className="block pb-2 text-sm font-medium text-gray-700">
                                        Enter your password
                                    </label>
                                    <input
                                        type="password"
                                        className={`${styles.input} w-full !py-3`}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>



                            <button
                                type="submit"
                                className="w-full md:w-[250px] h-12 mt-6 bg-[#3a24db] text-white font-medium rounded-md cursor-pointer hover:bg-[#2a1bb0] transition-colors duration-200"
                            >
                                Update Profile
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* Order */}
            {active === 2 && (
                <div className="w-full">
                    <AllOrders />
                </div>
            )}

            {/* Refunds */}
            {active === 3 && (
                <div className="w-full">
                    <AllRefundOrders />
                </div>
            )}

            {/* Track Orders */}
            {active === 5 && (
                <div className="w-full">
                    <TrackOrder />
                </div>
            )}

            {/* Payment Methods */}
            {active === 6 && (
                <div className="w-full">
                    <ChangePassword />
                </div>
            )}

            {/* User Address */}
            {active === 7 && (
                <div className="w-full">
                    <Address />
                </div>
            )}
        </div>
    );
};

const AllOrders = () => {
    const { user } = useSelector((state) => state.user);
    const { orders } = useSelector((state) => state.order);
    const dispatch = useDispatch();
    useEffect(() => {
        if (user?._id) {
            dispatch(getAllOrdersUser(user._id));
        }
    }, [dispatch, user]);

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
                <Link to={`/user/order/${params.row.id}`}>
                    <Button variant="outlined" size="small">
                        <AiOutlineArrowRight size={20} className="mr-1" />
                        View
                    </Button>
                </Link>
            ),
        },
    ]; 
    
    const rows = orders?.map((item) => ({
        id: item._id,
        itemsQty: item.cart.length,
        total: `US$ ${item.totalPrice}`,
        status: item.orderStatus || item.Status,
    })) || [];

    return (
        <div className="w-full px-2 md:px-8 pt-4">
            <h2 className="text-2xl font-bold mb-6">All Orders</h2>
            <div className="bg-white rounded-lg shadow">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                    autoHeight
                    className="border-0"
                />
            </div>
        </div>
    );
};

const AllRefundOrders = () => {
    const orders = [
        {
            _id: "00s9f0sdg0s8fg908ds09g8s09df8g09d8",
            orderItems: [
                {
                    name: "Iphone 14 pro Max",
                },
            ],
            totalPrice: 120,
            orderStatus: "Processing",
        },
    ];

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
                <Link to={`/user/order/${params.row.id}`}>
                    <Button variant="outlined" size="small">
                        <AiOutlineArrowRight size={20} className="mr-1" />
                        View
                    </Button>
                </Link>
            ),
        },
    ];

    const rows = orders.map((item) => ({
        id: item._id,
        itemsQty: item.orderItems.length,
        total: `US$ ${item.totalPrice}`,
        status: item.orderStatus,
    }));

    return (
        <div className="w-full px-5 md:px-8 pt-4">
            <h2 className="text-2xl font-bold mb-6">Refund Orders</h2>
            <div className="bg-white rounded-lg shadow">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    autoHeight
                    disableSelectionOnClick
                    className="border-0"
                />
            </div>
        </div>
    );
};

const TrackOrder = () => {
    const orders = [
        {
            _id: "00s9f0sdg0s8fg908ds09g8s09df8g09d8",
            orderItems: [
                {
                    name: "Iphone 14 pro Max",
                },
            ],
            totalPrice: 120,
            orderStatus: "Processing",
        },
    ];

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
            headerName: "Track",
            minWidth: 150,
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <Link to={`/user/track/order/${params.row.id}`}>
                    <Button variant="outlined" size="small">
                        <MdTrackChanges size={20} className="mr-1" />
                        Track
                    </Button>
                </Link>
            ),
        },
    ];

    const rows = orders.map((item) => ({
        id: item._id,
        itemsQty: item.orderItems.length,
        total: `US$ ${item.totalPrice}`,
        status: item.orderStatus,
    }));

    return (
        <div className="w-full px-5 md:px-8 pt-4">
            <h2 className="text-2xl font-bold mb-6">Track Orders</h2>
            <div className="bg-white rounded-lg shadow">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    disableSelectionOnClick
                    autoHeight
                    className="border-0"
                />
            </div>
        </div>
    );
};

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));


        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            await axios.put(`${server}/user/update-user-password`, {
                oldPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, { withCredentials: true })
                .then((res) => {
                    setMessage({
                        type: 'success',
                        text: 'Password changed successfully!'
                    });
                    setFormData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    });
                })
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to change password. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full px-5  md:px-8 pt-4 ">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 ">
                <h2 className="text-2xl font-bold text-gray-800 mb-4  sm:mb-0 ">
                    Change Password
                </h2>
            </div>

            {/* Message Display */}
            {message.text && (
                <div className={`mb-4 p-3 rounded-lg ${message.type === 'success'
                    ? 'bg-green-100 text-green-700 border border-green-400'
                    : 'bg-red-100 text-red-700 border border-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="max-w-full bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('current')}
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                                {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                        )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Password Requirements Hint */}
                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                        <p className="font-medium mb-1">Password requirements:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                                At least 8 characters long
                            </li>
                            <li className={/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-600' : ''}>
                                Contains at least one lowercase letter
                            </li>
                            <li className={/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-600' : ''}>
                                Contains at least one uppercase letter
                            </li>
                            <li className={/(?=.*\d)/.test(formData.newPassword) ? 'text-green-600' : ''}>
                                Contains at least one number
                            </li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Changing Password...
                                </span>
                            ) : (
                                'Change Password'
                            )}
                        </button>
                    </div>
                </form>

                {/* Additional Info */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                    <p>For security reasons, you'll be logged out from all devices after changing your password.</p>
                </div>
            </div>
        </div>
    );
};

const Address = () => {
    const { user, error } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [addressType, setAddressType] = useState("");
    const [availableCities, setAvailableCities] = useState([]);

    const addressTypeData = [
        { name: "Default" },
        { name: "Home" },
        { name: "Office" }
    ];

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch({ type: "clearErrors" });
        }
    }, [error, dispatch]);

    // Update cities when country changes
    useEffect(() => {
        if (country) {
            const cities = City.getCitiesOfCountry(country) || [];
            setAvailableCities(cities);
            setCity(""); // Reset city when country changes
        } else {
            setAvailableCities([]);
            setCity("");
        }
    }, [country]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!addressType || !country || !city || !address1 || !zipCode) {
            toast.error("Please fill all required fields!");
            return;
        }

        const addressData = {
            country: Country.getCountryByCode(country)?.name || country,
            city,
            address1,
            address2,
            zipCode,
            addressType
        };

        dispatch(updateUserAddress(addressData));
        toast.success("Address added successfully!");

        // Reset form
        setOpen(false);
        setCountry("");
        setCity("");
        setAddress1("");
        setAddress2("");
        setZipCode("");
        setAddressType("");
    };

    const handleDeleteAddress = (addressId) => {
        dispatch(deleteUserAddress(addressId));
        toast.success('Address deleted successfully!');
    };

    return (
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-4 pb-8 bg-gray-50 min-h-screen">
            {/* Add Address Modal */}
            {open && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl relative overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">Add New Address</h2>
                            <RxCross1
                                size={24}
                                className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
                                onClick={() => setOpen(false)}
                            />
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Address Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={addressType}
                                    onChange={(e) => setAddressType(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                >
                                    <option value="">Select address type</option>
                                    {addressTypeData.map((type, index) => (
                                        <option key={index} value={type.name}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                >
                                    <option value="">Choose your Country</option>
                                    {Country.getAllCountries().map((item) => (
                                        <option key={item.isoCode} value={item.isoCode}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                    disabled={!country}
                                >
                                    <option value="">Choose your City</option>
                                    {availableCities.map((item) => (
                                        <option key={item.name} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Address Line 1 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Line 1 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={address1}
                                    onChange={(e) => setAddress1(e.target.value)}
                                    placeholder="Street address, P.O. box"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>

                            {/* Address Line 2 (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Line 2 <span className="text-gray-400">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={address2}
                                    onChange={(e) => setAddress2(e.target.value)}
                                    placeholder="Apartment, suite, unit, etc."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            {/* Zip Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Zip Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    placeholder="Enter zip code"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>

                            {/* Form Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Add Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
                        My Addresses
                    </h2>
                    <button
                        onClick={() => setOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <span>+</span> Add New Address
                    </button>
                </div>

                {/* Address Cards */}
                {user?.addresses && user.addresses.length > 0 ? (
                    <div className="space-y-4">
                        {user.addresses.map((addr, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`bg-${addr.addressType === "Default" ? "blue" :
                                                addr.addressType === "Home" ? "green" : "purple"
                                                }-100 text-${addr.addressType === "Default" ? "blue" :
                                                    addr.addressType === "Home" ? "green" : "purple"
                                                }-800 text-xs font-semibold px-3 py-1 rounded-full`}>
                                                {addr.addressType?.toUpperCase() || "ADDRESS"}
                                            </span>
                                            {/* <h5 className="font-semibold text-gray-800">
                                                {addr.addressType || "Address"} {index + 1}
                                            </h5> */}
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            {addr.address1}
                                            {addr.address2 && `, ${addr.address2}`}<br />
                                            {addr.city}, {addr.country} - {addr.zipCode}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {user.phoneNumber && (
                                            <p className="text-gray-800 font-medium text-sm whitespace-nowrap">
                                                {user.phoneNumber}
                                            </p>
                                        )}
                                        <button
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                            onClick={() => handleDeleteAddress(addr._id)}
                                        >
                                            <AiOutlineDelete size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
                        <p className="text-gray-500 mb-4">Get started by adding a new address.</p>
                        {/* <button
                            onClick={() => setOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <span className="mr-2">+</span> Add New Address
                        </button> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileContent;