import React, { useState } from "react";
import { useSelector } from "react-redux";
import { backend_url } from "../../server";
import { AiOutlineArrowRight, AiOutlineCamera, AiOutlineDelete } from "react-icons/ai";
import { MdTrackChanges } from "react-icons/md";
import styles from "../../styles/styles";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";


const ProfileContent = ({ active }) => {

    const { user } = useSelector((state) => state.user);
    const [name, setName] = useState(user && user.name);
    const [email, setEmail] = useState(user && user.email);
    const [phoneNumber, setPhoneNumber] = useState()
    const [zipcode, setZipCode] = useState()
    const [address1, setAddress1] = useState("")
    const [address2, setAddress2] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Updated:", form);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const avatarSrc = user?.avatar?.url
        ? `${backend_url}/${encodeURIComponent(user.avatar.url)}`
        : "/default-avatar.png";


    return (
        <div className="w-full">
            {/* Profile Page */}
            {

                active === 1 && (
                    <>
                        <div className="flex justify-center w-full">
                            <div className="relative">
                                <img
                                    src={avatarSrc}
                                    alt=""
                                    className="w-[150px] h-[150px] rounded-full object-cover border-[3px] border-[#3ad132]"
                                />
                                <div className="w-[30px] h-[30px] bg-[#e3e9ee] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[5px] right-[5px]">
                                    <AiOutlineCamera />
                                </div>
                            </div>

                        </div>
                        <br />
                        <br />
                        <div className="w-full px-5">
                            <form onSubmit={handleSubmit} aria-required={true}>
                                <div className="flex flex-col md:flex-row md:gap-4 w-full">
                                    {/* Full Name */}
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <label className="block pb-2">Full Name</label>
                                        <input
                                            type="text"
                                            className={`${styles.input} w-full`}
                                            required
                                            value={name || ""}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex-1">
                                        <label className="block pb-2">Email</label>
                                        <input
                                            type="email"
                                            className={`${styles.input} w-full`}
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row md:gap-4 w-full">
                                    {/* Phone Number */}
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <label className="block pb-2">Phone Number</label>
                                        <input
                                            type="number"
                                            className={`${styles.input} w-full`}
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex-1">
                                        <label className="block pb-2">Zip Code</label>
                                        <input
                                            type="number"
                                            className={`${styles.input} w-full`}
                                            required
                                            value={zipcode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row md:gap-4 w-full">
                                    {/* Phone Number */}
                                    <div className="flex-1 mb-4 md:mb-0">
                                        <label className="block pb-2">Address 1</label>
                                        <input
                                            type="address"
                                            className={`${styles.input} w-full`}
                                            required
                                            value={address1}
                                            onChange={(e) => setAddress1(e.target.value)}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex-1">
                                        <label className="block pb-2">Address2 </label>
                                        <input
                                            type="address"
                                            className={`${styles.input} w-full`}
                                            required
                                            value={address2}
                                            onChange={(e) => setAddress2(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <input
                                    type="submit"
                                    required
                                    value="Update"
                                    className={`w-[250px] h-40px  border border-[#3a24db] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer`}
                                />
                            </form>
                        </div>


                    </>
                )
            }
            {/* Order  */}
            {
                active === 2 && (
                    <div className="">
                        <AllOrders />
                    </div>
                )
            }
            {/* Refunds */}
            {
                active === 3 && (
                    <div>
                        <AllRefundOrders />
                    </div>
                )
            }
            {/* Track Orders */}
            {
                active === 5 && (
                    <div>
                        <TrackOrder />
                    </div>
                )
            }
            {/* Payment Methods */}
            {
                active === 6 && (
                    <div>
                        <PaymentMethod />
                    </div>
                )
            }
            {/* User Address */}
            {
                active === 7 && (
                    <div>
                        <Address />
                    </div>
                )
            }
        </div>

    );
};
const AllOrders = () => {
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
                return params.row.status === "Delivered" ? "greenColor" : "redColor";
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
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/user/order/${params.id}`}>
                            <Button>
                                <AiOutlineArrowRight size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];

    const row = [];

    orders &&
        orders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item.orderItems.length,
                total: "US$ " + item.totalPrice,
                status: item.orderStatus,
            });
        });
    return (
        <div className="pl-8 pt-1">
            <DataGrid
                rows={row}
                columns={columns}
                pageSize={10}
                disableSelectiononClick
                autoHeight
            />
        </div>
    )
}

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
                return params.row.status === "Delivered" ? "greenColor" : "redColor";
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
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/user/order/${params.id}`}>
                            <Button>
                                <AiOutlineArrowRight size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];
    const row = [];

    orders &&
        orders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item.orderItems.length,
                total: "US$ " + item.totalPrice,
                status: item.orderStatus,
            });
        });

    return (
        <div className="pl-8 pt-1">
            <DataGrid
                rows={row}
                columns={columns}
                pageSize={10}
                autoHeight
                disableSelectiononClick
            />

        </div>

    )
}

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
                return params.row.status === "Delivered" ? "greenColor" : "redColor";
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
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/user/order/${params.id}`}>
                            <Button>
                                <MdTrackChanges size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];

    const row = [];

    orders &&
        orders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item.orderItems.length,
                total: "US$ " + item.totalPrice,
                status: item.orderStatus,
            });
        });

    return (
        <div className="pl-8 pt-1">
            <DataGrid
                rows={row}
                columns={columns}
                pageSize={10}
                disableSelectiononClick
                autoHeight
            />
        </div>
    )
}
const PaymentMethod = () => {
    return (
        <div>
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-semibold text-black/75 pb-2 ml-10">
                    Payment Methods
                </h1>
                <div className={`${styles.button} !rounded-md`}>
                    <span className="text-[#fff]">
                        Add New
                    </span>
                </div>
            </div>
            <br />
            <div className="w-full bg-white h-[70px] rounded-[4px] flex items-center px-3 shadow justify-between pr-10 ml-8 ">
                <div className="flex items-center">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                        alt="Visa"
                        className="w-14"
                    />
                    <h5 className="pl-5 font-[600]">Sultan Bahoo</h5>
                </div>
                <div className="pl-8 flex items-center">
                    <h6>1234 **** **** ****</h6>
                    <h5 className="pl-6">08/2030</h5>
                </div>
                <div className="min-w-[10%] flex items-center justify-between pl-8">
                    <AiOutlineDelete
                        size={25}
                        classNama="cursor-pointer"
                    />
                </div>
            </div>

        </div>
    )
}
const Address = () => {

    return (
        <div>
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-semibold text-black/75 pb-2 ml-10">
                    My Addresses
                </h1>
                <div className={`${styles.button} !rounded-md`}>
                    <span className="text-[#fff]">
                        Add New
                    </span>
                </div>
            </div>
            <br />
            <div className="w-full bg-white h-[70px] rounded-[4px] flex items-center px-3 shadow justify-between pr-10 ml-8 ">
                <div className="flex items-center">
                    <h5 className="pl-5 font-[600]">Default</h5>
                </div>
                <div className="pl-8 flex items-center">
                    <h6>494 Erdman Passage, New Zoietown, Paraguay</h6>
                </div>
                <div className="pl-8 flex items-center">
                    <h6>(322) 438-5445</h6>
                </div>
                <div className="min-w-[10%] flex items-center justify-between pl-8">
                    <AiOutlineDelete
                        size={25}
                        classNama="cursor-pointer"
                    />
                </div>
            </div>

        </div>
    )
}

export default ProfileContent;
