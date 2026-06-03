import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle, AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { categoriesData } from '../../static/data.jsx';
import { toast } from "react-toastify";
import { createevent } from "../../redux/actions/event.js";
import { FiUpload, FiX, FiImage, FiAlertCircle } from "react-icons/fi";

const CreateEvent = () => {
    const { seller } = useSelector((state) => state.seller);
    const { success, error } = useSelector((state) => state.events);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
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
    const [isDragging, setIsDragging] = useState(false);

    const handleStartDateChange = (e) => {
        const startDate = new Date(e.target.value);
        const minEndDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        setStartDate(startDate);
        setEndDate(null);
        document.getElementById("end-date").min = minEndDate.toISOString().slice(0, 10);
    };

    const handleEndDateChange = (e) => {
        const endDate = new Date(e.target.value);
        setEndDate(endDate);
    };

    const today = new Date().toISOString().slice(0, 10);
    const minEndDate = startDate
        ? new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
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
            resetForm();
            navigate("/dashboard-events");
        }
    }, [error, success, submitted, dispatch, navigate]);

    useEffect(() => {
        // Cleanup preview URLs
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const resetForm = () => {
        setName("");
        setDescription("");
        setCategory("");
        setTags("");
        setOriginalPrice("");
        setDiscountPrice("");
        setStock("");
        setStartDate(null);
        setEndDate(null);
        setImages([]);
        setImagePreviews([]);
    };

    const validateImage = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            toast.error(`Invalid file type: ${file.name}. Please upload JPEG, PNG, GIF, or WEBP images.`);
            return false;
        }

        if (file.size > maxSize) {
            toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
            return false;
        }

        return true;
    };

    const handleImageChange = (e) => {
        e.preventDefault();
        let files = Array.from(e.target.files);

        // Filter valid images
        const validFiles = files.filter(validateImage);

        if (validFiles.length === 0) return;

        // Check total images limit (max 10)
        if (images.length + validFiles.length > 10) {
            toast.error("Maximum 10 images allowed per event");
            return;
        }

        // Create preview URLs
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));

        setImages([...images, ...validFiles]);
        setImagePreviews([...imagePreviews, ...newPreviews]);

        toast.success(`${validFiles.length} image(s) added successfully`);
    };

    const removeImage = (index) => {
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(imagePreviews[index]);

        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        setImages(newImages);
        setImagePreviews(newPreviews);
        toast.info("Image removed");
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        let files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(validateImage);

        if (validFiles.length === 0) return;

        if (images.length + validFiles.length > 10) {
            toast.error("Maximum 10 images allowed per event");
            return;
        }

        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setImages([...images, ...validFiles]);
        setImagePreviews([...imagePreviews, ...newPreviews]);
        toast.success(`${validFiles.length} image(s) added successfully`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!seller?._id) {
            toast.error("Seller not loaded. Please refresh the page.");
            return;
        }

        if (images.length === 0) {
            toast.error("Please upload at least one image");
            return;
        }

        if (!name.trim()) {
            toast.error("Please enter event name");
            return;
        }

        if (!description.trim()) {
            toast.error("Please enter event description");
            return;
        }

        if (!category) {
            toast.error("Please select a category");
            return;
        }

        if (!discountPrice || parseFloat(discountPrice) <= 0) {
            toast.error("Please enter a valid discount price");
            return;
        }

        if (originalPrice && parseFloat(originalPrice) <= parseFloat(discountPrice)) {
            toast.error("Discount price must be less than original price");
            return;
        }

        if (!stock || parseInt(stock) <= 0) {
            toast.error("Please enter valid stock quantity");
            return;
        }

        if (!startDate) {
            toast.error("Please select event start date");
            return;
        }

        if (!endDate) {
            toast.error("Please select event end date");
            return;
        }

        if (endDate <= startDate) {
            toast.error("End date must be after start date");
            return;
        }

        setSubmitted(true);

        const newForm = new FormData();
        images.forEach((image) => {
            newForm.append("images", image);
        });

        newForm.append("name", name.trim());
        newForm.append("description", description.trim());
        newForm.append("category", category);
        newForm.append("tags", tags);
        newForm.append("originalPrice", originalPrice);
        newForm.append("discountPrice", discountPrice);
        newForm.append("stock", stock);
        newForm.append("shopId", seller._id);
        newForm.append("startDate", startDate.toISOString());
        newForm.append("endDate", endDate.toISOString());

        dispatch(createevent(newForm));
    };

    // Calculate discount percentage
    const discountPercentage = originalPrice && discountPrice && originalPrice > discountPrice
        ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
        : 0;

    return (
      <div className="flex-1 min-w-0 min-h-screen bg-gray-50 px-2 md:px-4 lg:px-6 py-4">
            <div className="w-full max-w-5xl ">
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">

                    {/* Header */}
                    <div className="px-5 py-4 bg-blue-600 md:px-6 md:py-5 border-b  border-gray-200">
                        <h5 className="text-xl md:text-2xl font-semibold text-white">
                            Create New Event
                        </h5>
                        <p className="text-white text-sm mt-1">Launch your flash sale or special promotion</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 max-h-[calc(100vh-180px)] overflow-y-auto">

                        {/* Event Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Event Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-700"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Summer Mega Sale, Eid Special Discount..."
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows="4"
                                value={description}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-700 resize-none"
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your event product in detail..."
                                required
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">
                                {description.length}/500 characters
                            </p>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-700 bg-white"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {categoriesData && categoriesData.map((i) => (
                                    <option value={i.title} key={i.title}>
                                        {i.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Pricing Section */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h3 className="font-medium text-gray-800">Pricing Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Original Price
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={originalPrice}
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            onChange={(e) => setOriginalPrice(e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Discount Price <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={discountPrice}
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            onChange={(e) => setDiscountPrice(e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Discount Preview */}
                            {discountPercentage > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                                    <p className="text-sm text-green-700">
                                        🎉 Customer saves <span className="font-bold">{discountPercentage}%</span> (${(originalPrice - discountPrice).toFixed(2)} off)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Tags and Stock */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    value={tags}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="sale, discount, festival"
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Product Stock <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={stock}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="Available quantity"
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        {/* Event Dates */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h3 className="font-medium text-gray-800">Event Duration</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        onChange={handleStartDateChange}
                                        min={today}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="end-date"
                                        value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        onChange={handleEndDateChange}
                                        min={minEndDate}
                                        required
                                    />
                                </div>
                            </div>

                            {startDate && endDate && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                                    <p className="text-sm text-blue-700">
                                        📅 Event duration: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Event Images <span className="text-red-500">*</span>
                                <span className="text-xs text-gray-500 ml-2">(Max 10 images, up to 5MB each)</span>
                            </label>

                            <div
                                className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${isDragging
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="event-image-upload"
                                    className="hidden"
                                    multiple
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                />

                                {imagePreviews.length === 0 ? (
                                    <label htmlFor="event-image-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                            <FiUpload size={28} className="text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-700 mb-1">Click to upload event images</span>
                                        <span className="text-sm text-gray-500">or drag and drop</span>
                                        <span className="text-xs text-gray-400 mt-2">PNG, JPG, GIF, WEBP up to 5MB</span>
                                    </label>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-medium text-gray-700">
                                                {images.length} image(s) selected
                                            </span>
                                            <label htmlFor="event-image-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                                                <AiOutlinePlusCircle size={16} />
                                                Add More
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                                                        <img
                                                            src={preview}
                                                            alt={`Event preview ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(preview, '_blank')}
                                                                className="bg-white rounded-full p-1.5 hover:bg-gray-100 transition"
                                                                title="Preview"
                                                            >
                                                                <AiOutlineEye size={14} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition"
                                                                title="Remove"
                                                            >
                                                                <AiOutlineDelete size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 truncate text-center">
                                                        {images[index]?.name?.slice(0, 12)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {images.length === 0 && (
                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                    <FiAlertCircle size={12} />
                                    At least one image is required
                                </p>
                            )}
                        </div>

                        {/* Preview Card */}
                        {name && discountPrice && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                                <h4 className="font-medium text-gray-800 text-sm mb-2">Preview</h4>
                                <div className="flex items-center gap-3">
                                    {imagePreviews[0] && (
                                        <img src={imagePreviews[0]} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 text-sm">{name}</p>
                                        <p className="text-sm text-gray-600">${discountPrice} {originalPrice && <span className="line-through text-gray-400 ml-2 text-xs">${originalPrice}</span>}</p>
                                        <p className="text-xs text-green-600">{stock} items available</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={submitted}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitted ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating Event...
                                    </div>
                                ) : (
                                    'Create Event'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;