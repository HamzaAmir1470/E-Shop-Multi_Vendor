import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersShop } from "../../redux/actions/order";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/actions/user";
import { AiOutlineDelete, AiOutlinePlus, AiOutlineBank, AiOutlineDollar, AiOutlineSafety } from "react-icons/ai";
import { FaMoneyBillWave, FaUniversity } from "react-icons/fa";

const WithdrawMoney = () => {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const { seller } = useSelector((state) => state.seller);
    const [paymentMethod, setPaymentMethod] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [bankInfo, setBankInfo] = useState({
        bankName: "",
        bankCountry: "",
        bankSwiftCode: "",
        bankAccountNumber: "",
        bankHolderName: "",
        bankAddress: "",
    });

    useEffect(() => {
        if (seller?._id) {
            dispatch(getAllOrdersShop(seller._id));
        }
    }, [dispatch, seller]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const withdrawMethod = {
            bankName: bankInfo.bankName,
            bankCountry: bankInfo.bankCountry,
            bankSwiftCode: bankInfo.bankSwiftCode,
            bankAccountNumber: bankInfo.bankAccountNumber,
            bankHolderName: bankInfo.bankHolderName,
            bankAddress: bankInfo.bankAddress,
        };

        try {
            await axios.put(
                `${server}/shop/update-payment-methods`,
                { withdrawMethod },
                { withCredentials: true }
            );
            toast.success("Withdraw method added successfully!");
            dispatch(loadSeller());
            setPaymentMethod(false);
            setBankInfo({
                bankName: "",
                bankCountry: "",
                bankSwiftCode: "",
                bankAccountNumber: "",
                bankHolderName: "",
                bankAddress: "",
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add withdraw method");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHandler = async () => {
        if (!window.confirm("Are you sure you want to delete this withdraw method?")) return;

        try {
            await axios.delete(`${server}/shop/delete-withdraw-method`, {
                withCredentials: true,
            });
            toast.success("Withdraw method deleted successfully!");
            dispatch(loadSeller());
        } catch (error) {
            toast.error("Failed to delete withdraw method");
        }
    };

    const withdrawHandler = async () => {
        if (withdrawAmount < 50) {
            toast.error("Minimum withdrawal amount is $50");
            return;
        }

        if (withdrawAmount > seller?.availableBalance) {
            toast.error("Insufficient balance for this withdrawal");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(
                `${server}/withdraw/create-withdraw-request`,
                {
                    seller,
                    amount: withdrawAmount
                },
                { withCredentials: true }
            );
            toast.success("Withdrawal request submitted successfully!");
            setOpen(false);
            setWithdrawAmount(50);
            dispatch(loadSeller());
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit withdrawal request");
        } finally {
            setIsLoading(false);
        }
    };

    const availableBalance = seller?.availableBalance || 0;
    const maskedAccountNumber = seller?.withdrawMethod?.bankAccountNumber
        ? "*".repeat(Math.max(0, seller.withdrawMethod.bankAccountNumber.length - 4)) +
        seller.withdrawMethod.bankAccountNumber.slice(-4)
        : "";

    return (
        <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 sm:ml-0 lg:ml-45">
            {/* Content container with responsive padding that respects sidebar */}
            <div className="p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Withdraw Money</h1>
                        <p className="text-gray-500 mt-1 md:mt-2">Manage your withdrawals and payment methods</p>
                    </div>

                    {/* Main Balance Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-5 md:p-8 mb-5 md:mb-6 transform transition-all hover:scale-[1.01]">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-white text-center sm:text-left">
                                <p className="text-sm font-medium opacity-90 mb-1">Available Balance</p>
                                <h2 className="text-3xl md:text-5xl font-bold">
                                    ${availableBalance.toLocaleString()}
                                </h2>
                                <p className="text-xs md:text-sm opacity-80 mt-2">
                                    Minimum withdrawal: $50
                                </p>
                            </div>
                            <button
                                className={`px-6 md:px-8 py-2 md:py-3 bg-white text-blue-600 rounded-xl font-semibold 
                                           hover:shadow-lg transform transition-all duration-200 
                                           hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
                                           ${availableBalance < 50 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => availableBalance >= 50 ? setOpen(true) : toast.error("Insufficient balance to withdraw")}
                                disabled={availableBalance < 50}
                            >
                                <div className="flex items-center gap-2">
                                    <FaMoneyBillWave className="text-lg md:text-xl" />
                                    <span>Withdraw Now</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats - 3 Column Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                                    <AiOutlineDollar className="text-green-600 text-xl md:text-2xl" />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Total Balance</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-800">${availableBalance.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                                    <AiOutlineBank className="text-blue-600 text-xl md:text-2xl" />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Payment Method</p>
                                    <p className={`text-xl md:text-2xl font-bold ${seller?.withdrawMethod ? 'text-green-600' : 'text-orange-600'}`}>
                                        {seller?.withdrawMethod ? "Active" : "Not Set"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
                                    <AiOutlineSafety className="text-purple-600 text-xl md:text-2xl" />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Secure Transfer</p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-800">SSL Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Information Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Withdrawal Information</h3>
                        <div className="space-y-2 md:space-y-3 text-gray-600">
                            <div className="flex items-start gap-2 md:gap-3">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 rounded-full mt-1.5 md:mt-2"></div>
                                <p className="text-xs md:text-sm">Withdrawals are processed within 2-3 business days</p>
                            </div>
                            <div className="flex items-start gap-2 md:gap-3">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 rounded-full mt-1.5 md:mt-2"></div>
                                <p className="text-xs md:text-sm">Minimum withdrawal amount is $50</p>
                            </div>
                            <div className="flex items-start gap-2 md:gap-3">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 rounded-full mt-1.5 md:mt-2"></div>
                                <p className="text-xs md:text-sm">A valid bank account is required for withdrawals</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdrawal Modal */}
            {open && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-blur bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={() => {
                        setOpen(false);
                        setPaymentMethod(false);
                    }} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                            <div className="flex justify-between items-center p-4 md:p-6 border-b">
                                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    {paymentMethod ? "Add Withdrawal Method" : "Withdraw Funds"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        setPaymentMethod(false);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <RxCross1 size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {paymentMethod ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Bank Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={bankInfo.bankName}
                                                onChange={(e) =>
                                                    setBankInfo({ ...bankInfo, bankName: e.target.value })
                                                }
                                                placeholder="Enter your bank name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Bank Country <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={bankInfo.bankCountry}
                                                onChange={(e) =>
                                                    setBankInfo({ ...bankInfo, bankCountry: e.target.value })
                                                }
                                                placeholder="Enter bank country"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Swift Code <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={bankInfo.bankSwiftCode}
                                                    onChange={(e) =>
                                                        setBankInfo({ ...bankInfo, bankSwiftCode: e.target.value })
                                                    }
                                                    placeholder="Enter SWIFT code"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Account Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={bankInfo.bankAccountNumber}
                                                    onChange={(e) =>
                                                        setBankInfo({ ...bankInfo, bankAccountNumber: e.target.value })
                                                    }
                                                    placeholder="Enter account number"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Account Holder Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={bankInfo.bankHolderName}
                                                onChange={(e) =>
                                                    setBankInfo({ ...bankInfo, bankHolderName: e.target.value })
                                                }
                                                placeholder="Enter account holder name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Bank Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={bankInfo.bankAddress}
                                                onChange={(e) =>
                                                    setBankInfo({ ...bankInfo, bankAddress: e.target.value })
                                                }
                                                placeholder="Enter bank address"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod(false)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                                            >
                                                {isLoading ? "Adding..." : "Add Method"}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        {seller?.withdrawMethod ? (
                                            <>
                                                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 md:p-5 border border-green-100">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaUniversity className="text-blue-600 text-xl md:text-2xl" />
                                                            <h4 className="font-semibold text-gray-800">Active Withdrawal Method</h4>
                                                        </div>
                                                        <button
                                                            onClick={deleteHandler}
                                                            className="p-2 hover:bg-red-100 rounded-full transition-colors group"
                                                        >
                                                            <AiOutlineDelete className="text-red-500 text-lg md:text-xl group-hover:scale-110 transition" />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-2">
                                                            <span className="text-gray-600 text-sm">Bank:</span>
                                                            <span className="font-medium text-sm">{seller.withdrawMethod.bankName}</span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-2">
                                                            <span className="text-gray-600 text-sm">Account:</span>
                                                            <span className="font-mono font-medium text-sm">{maskedAccountNumber}</span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-2">
                                                            <span className="text-gray-600 text-sm">Holder:</span>
                                                            <span className="font-medium text-sm">{seller.withdrawMethod.bankHolderName}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="bg-gray-50 rounded-xl p-4 md:p-5">
                                                        <h4 className="font-semibold text-gray-800 mb-3">Request Withdrawal</h4>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Amount to Withdraw
                                                                </label>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                                        $
                                                                    </span>
                                                                    <input
                                                                        type="number"
                                                                        value={withdrawAmount}
                                                                        min={50}
                                                                        max={availableBalance}
                                                                        onChange={(e) => setWithdrawAmount(e.target.value || "")}
                                                                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                                        placeholder="Enter amount"
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between mt-2">
                                                                    <span className="text-xs md:text-sm text-gray-500">Minimum: $50</span>
                                                                    <span className="text-xs md:text-sm text-gray-500">Maximum: ${availableBalance}</span>
                                                                </div>
                                                            </div>
                                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                                <p className="text-xs md:text-sm text-yellow-800">
                                                                    ⚠️ Withdrawals typically take 2-3 business days to process
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => setOpen(false)}
                                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={withdrawHandler}
                                                            disabled={isLoading || withdrawAmount < 50 || withdrawAmount > availableBalance}
                                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isLoading ? "Processing..." : "Confirm Withdrawal"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8 md:py-12">
                                                <div className="mb-4">
                                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                        <AiOutlineBank className="text-3xl md:text-4xl text-gray-400" />
                                                    </div>
                                                </div>
                                                <h4 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">No Withdrawal Method Set</h4>
                                                <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">Please add a bank account to start withdrawing funds</p>
                                                <button
                                                    onClick={() => setPaymentMethod(true)}
                                                    className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition text-sm md:text-base"
                                                >
                                                    <AiOutlinePlus className="text-lg md:text-xl" />
                                                    Add Withdrawal Method
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
};

export default WithdrawMoney;