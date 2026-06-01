import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import styles from "../../styles/styles";
import axios from "axios";
import { loadSeller } from "../../redux/actions/user";
import { toast } from "react-toastify";

const ShopSettings = () => {
    const { seller } = useSelector((state) => state.seller);
    const [avatar, setAvatar] = useState();
    const [name, setName] = useState(seller && seller.name);
    const [description, setDescription] = useState(
        seller && seller.description ? seller.description : ""
    );
    const [address, setAddress] = useState(seller && seller.address);
    const [phoneNumber, setPhoneNumber] = useState(seller && seller.phoneNumber);
    const [zipCode, setZipcode] = useState(seller && seller.zipCode);

    const dispatch = useDispatch();

    const handleImage = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        setAvatar(file);

        const formData = new FormData();
        formData.append("image", e.target.files[0]);
        try {
            const { data } = await axios.post(
                `${server}/shop/upload-shop-image`,
                formData,
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error uploading shop image:", error);
        }
    };

    const updateHandler = async (e) => {
        e.preventDefault();

        await axios
            .put(
                `${server}/shop/update-seller-info`,
                {
                    name,
                    address,
                    zipCode,
                    phoneNumber,
                    description,
                },
                { withCredentials: true }
            )
            .then((res) => {
                toast.success("Shop info updated succesfully!");
                dispatch(loadSeller());
            })
            .catch((error) => {
                toast.error(error.response.data.message);
            });
    };
        console.log("Seller data in ShopSettings:", seller);
    return (
        <div className="w-full min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

                {/* Header */}
                <div className="bg-[#7288AE] border-b-4 border-blue-600 px-8 py-6 " >
                    <h1 className="text-2xl font-bold text-blue-700">
                        Shop Settings
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Manage your shop information and profile.
                    </p>
                </div>

                <div className="p-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative">
                            <img
                                // src={seller?.avatar ? `${backend_url}${seller.avatar}` : ""}
                                src={avatar ? URL.createObjectURL(avatar) : seller?.avatar ? `${backend_url}${seller.avatar}` : ""}
                                
                                alt={seller?.name ? `${seller.name} avatar` : "Shop avatar"}
                                className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-xl transform hover:scale-105 transition-transform duration-300"
                            />

                            <label
                                htmlFor="image"
                                className="absolute bottom-3 right-3 w-11 h-11 bg-indigo-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
                            >
                                <span className="sr-only">Change shop avatar</span>
                                <AiOutlineCamera size={18} />
                            </label>

                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImage}
                            />
                        </div>

                        <h2 className="mt-4 text-xl font-semibold text-gray-800">
                            {seller?.name}
                        </h2>

                        <p className="text-gray-500 text-sm">
                            Update your shop information
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={updateHandler}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shop Name */}
                            <div>
                                <label htmlFor="shop-name" className="block mb-2 text-sm font-medium text-gray-700">
                                    Shop Name
                                </label>
                                <input
                                    id="shop-name"
                                    type="text"
                                    value={name}
                                    placeholder="Enter shop name"
                                    onChange={(e) => setName(e.target.value)}
                                    className={`${styles.input} !w-full`}
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label htmlFor="shop-phone" className="block mb-2 text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <input
                                    id="shop-phone"
                                    type="tel"
                                    value={phoneNumber}
                                    placeholder="Enter phone number"
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className={`${styles.input} !w-full`}
                                    required
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="shop-address" className="block mb-2 text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <input
                                    id="shop-address"
                                    type="text"
                                    value={address}
                                    placeholder="Enter address"
                                    onChange={(e) => setAddress(e.target.value)}
                                    className={`${styles.input} !w-full`}
                                    required
                                />
                            </div>

                            {/* Zip Code */}
                            <div>
                                <label htmlFor="shop-zip" className="block mb-2 text-sm font-medium text-gray-700">
                                    Zip Code
                                </label>
                                <input
                                    id="shop-zip"
                                    type="text"
                                    value={zipCode}
                                    placeholder="Enter zip code"
                                    onChange={(e) => setZipcode(e.target.value)}
                                    className={`${styles.input} !w-full`}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label htmlFor="shop-desc" className="block mb-2 text-sm font-medium text-gray-700">
                                    Shop Description
                                </label>

                                <textarea
                                    id="shop-desc"
                                    rows={5}
                                    value={description}
                                    placeholder="Tell customers about your shop..."
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`${styles.input} h-32 resize-none`}
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                className="w-max block mx-auto md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 "
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShopSettings;