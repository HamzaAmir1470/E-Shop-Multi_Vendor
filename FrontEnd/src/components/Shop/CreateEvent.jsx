import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { categoriesData } from '../../static/data.jsx';
import { toast } from "react-toastify";
import { createevent } from "../../redux/actions/event.js";

const CreateEvent = () => {
    const { seller } = useSelector((state) => state.seller);
    const { success, error } = useSelector((state) => state.events);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [images, setImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [stock, setStock] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleStartDateChange = (e) => {
        const startDate = new Date(e.target.value);
        const minEndDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        setStartDate(startDate);
        setEndDate(null);
        document.getElementById("end-date").min = minEndDate.toISOString().slice(
            0,
            10
        );
    };

    const handleEndDateChange = (e) => {
        const endDate = new Date(e.target.value);
        setEndDate(endDate);
    };

    const today = new Date().toISOString().slice(0, 10);

    const minEndDate = startDate
        ? new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10)
        : "";

    useEffect(() => {
        if (error && submitted) {
            toast.error(error);
            setSubmitted(false);
        }

        if (success && submitted) {
            toast.success("Event created successfully!");
            dispatch({ type: "eventCreateReset" });
            setSubmitted(false);
            navigate("/dashboard-events");
        }
    }, [error, success, submitted, dispatch, navigate]);

    useEffect(() => {
        return () => {
            images.forEach((file) => URL.revokeObjectURL(file));
        };
    }, [images]);

    const handleImageChange = (e) => {
        e.preventDefault();
        let files = Array.from(e.target.files);
        setImages(files);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!seller?._id) {
            toast.error("Seller not loaded");
            return;
        }

        if (images.length === 0) {
            toast.error("Please upload at least one image");
            return;
        }

        setSubmitted(true);

        const newForm = new FormData();
        images.forEach((image) => {
            newForm.append("images", image);
        });

        newForm.append("name", name);
        newForm.append("description", description);
        newForm.append("category", category);
        newForm.append("tags", tags);
        newForm.append("originalPrice", originalPrice);
        newForm.append("discountPrice", discountPrice);
        newForm.append("stock", stock);
        newForm.append("shopId", seller._id);
        newForm.append("startDate", startDate?.toISOString());
        newForm.append("endDate", endDate?.toISOString());

        dispatch(createevent(newForm));
    };

    return (
        <div className="w-full h-full bg-gray-50 flex items-start justify-center overflow-y-auto px-2 py-4 md:py-6">
            <div className="w-full max-w-4xl mx-auto">
                <div className="w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] mx-auto bg-white shadow-2xl rounded-xl p-5 md:p-6 lg:p-7 border border-gray-100">

                    {/* Header with close button */}
                    <div className="flex items-center justify-between mb-4 md:mb-6 border-b pb-3 md:pb-4">
                        <h5 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                            Create New Event
                        </h5>
                        <button
                            onClick={() => navigate("/dashboard-events")}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto px-1">

                        {/* Event Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors outline-none text-gray-700"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Summer Sale, Festival Discount..."
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                cols="30"
                                rows="5"
                                name="description"
                                value={description}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors outline-none text-gray-700 resize-none"
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your event product in detail..."
                                required
                            ></textarea>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors outline-none text-gray-700 bg-white"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {categoriesData &&
                                    categoriesData.map((i) => (
                                        <option value={i.title} key={i.title}>
                                            {i.title}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Two Column Layout for Prices */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Original Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Original Price
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={originalPrice}
                                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors outline-none text-gray-700"
                                        onChange={(e) => setOriginalPrice(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            {/* Discount Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Discount Price <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        name="discountPrice"
                                        value={discountPrice}
                                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors outline-none text-gray-700"
                                        onChange={(e) => setDiscountPrice(e.target.value)}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Two Column Layout for Tags and Stock */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={tags}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors outline-none text-gray-700"
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="e.g. sale, discount, festival..."
                                />
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Stock <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={stock}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors outline-none text-gray-700"
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="Available quantity"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Two Column Layout for Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Event Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="start-date"
                                    value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors outline-none text-gray-700"
                                    onChange={handleStartDateChange}
                                    min={today}
                                    required
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Event End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="end-date"
                                    value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors outline-none text-gray-700"
                                    onChange={handleEndDateChange}
                                    min={minEndDate}
                                    required
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Images <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    id="upload"
                                    className="hidden"
                                    multiple
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />

                                {images.length === 0 ? (
                                    <label htmlFor="upload" className="flex flex-col items-center justify-center cursor-pointer py-6">
                                        <AiOutlinePlusCircle size={40} className="text-gray-400" />
                                        <span className="mt-2 text-sm text-gray-500">Click to upload event images</span>
                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</span>
                                    </label>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-600">{images.length} image(s) selected</span>
                                            <label htmlFor="upload" className="cursor-pointer text-blue-500 hover:text-blue-600 text-sm font-medium">
                                                + Add More
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {images.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Event preview ${index + 1}`}
                                                        className="h-20 sm:h-24 w-full object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 sticky bottom-0 bg-white pb-2">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-purple-300 shadow-lg hover:shadow-xl"
                            >
                                Create Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;