import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getAllOrdersUser } from '../../redux/actions/order';
import { FiClock, FiMapPin, FiPackage, FiTruck } from 'react-icons/fi';
import { BsCheckCircleFill, BsCreditCard2Front } from 'react-icons/bs';

const TrackOrder = () => {
    const { orders, isLoading } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { id } = useParams();
    const userId = user?._id;

    useEffect(() => {
        if (userId) {
            dispatch(getAllOrdersUser(userId));
        }
    }, [dispatch, userId]);

    const data = orders && orders.find((item) => item._id === id);

    const orderStatus = useMemo(() => {
        if (!data) return '';
        return data?.Status || data?.status || data?.orderStatus || 'Processing';
    }, [data]);

    const normalizedStatus = useMemo(() => orderStatus.toLowerCase(), [orderStatus]);

    // Correct order flow: Processing -> Received -> Transferred to delivery partner -> Shipping -> On the way -> Delivered
    const steps = useMemo(() => ([
        {
            key: 'processing',
            label: 'Processing',
            icon: <FiPackage size={18} />,
            matches: ['processing', 'pending', 'order placed']
        },
        {
            key: 'received',
            label: 'Received',
            icon: <FiPackage size={18} />,
            matches: ['received', 'order received']
        },
        {
            key: 'transferred_to_delivery_partner',
            label: 'Transferred to delivery partner',
            icon: <FiTruck size={18} />,
            matches: ['transferred to delivery partner', 'with delivery partner', 'handover']
        },
        {
            key: 'shipping',
            label: 'Shipping',
            icon: <FiTruck size={18} />,
            matches: ['shipping', 'shipped', 'in transit']
        },
        {
            key: 'on_the_way',
            label: 'On the way',
            icon: <FiMapPin size={18} />,
            matches: ['on the way', 'out for delivery', 'near destination']
        },
        {
            key: 'delivered',
            label: 'Delivered',
            icon: <BsCheckCircleFill size={18} />,
            matches: ['delivered']
        }
    ]), []);

    const activeStep = useMemo(() => {
        if (!normalizedStatus) return 0;
        const index = steps.findIndex((step) => step.matches.some((value) => value === normalizedStatus));
        if (index !== -1) return index;
        if (normalizedStatus.includes('refund') || normalizedStatus.includes('cancel')) return 0;
        return 1;
    }, [normalizedStatus, steps]);

    const totalSteps = steps.length - 1;
    const progressPercent = Math.max(0, Math.min(100, Math.round((activeStep / totalSteps) * 100)));

    const getStatusTone = () => {
        if (normalizedStatus.includes('delivered')) {
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }
        if (normalizedStatus.includes('refund') || normalizedStatus.includes('cancel')) {
            return 'bg-rose-100 text-rose-700 border-rose-200';
        }
        return 'bg-sky-100 text-sky-700 border-sky-200';
    };

    const getStatusMessage = () => {
        if (normalizedStatus.includes('delivered')) {
            return 'Your order has been delivered successfully.';
        }
        if (normalizedStatus.includes('refund')) {
            return 'Refund request is in progress. Our team is reviewing your request.';
        }
        if (normalizedStatus.includes('cancel')) {
            return 'This order has been cancelled. Contact support if this is unexpected.';
        }
        return 'Your order is moving through fulfillment. You will get updates as it advances.';
    };

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const itemsCount = data?.cart?.reduce((sum, item) => sum + Number(item?.qty || 1), 0) || 0;
    const calculatedSubtotal = data?.cart?.reduce((sum, item) => {
        const quantity = Number(item?.qty || 1);
        const unitPrice = Number(item?.discountPrice || item?.price || 0);
        return sum + (quantity * unitPrice);
    }, 0) || 0;
    const orderTotal = Number(data?.totalPrice || calculatedSubtotal || 0);

    const createdAtText = data?.createdAt
        ? new Date(data.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'Not available';

    if (!userId || isLoading) {
        return (
            <div className='w-full min-h-[70vh] px-4 md:px-8 py-10'>
                <div className='max-w-5xl mx-auto animate-pulse space-y-4'>
                    <div className='h-24 rounded-2xl bg-slate-200' />
                    <div className='h-52 rounded-2xl bg-slate-200' />
                    <div className='h-40 rounded-2xl bg-slate-200' />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className='w-full min-h-[70vh] px-4 md:px-8 py-10'>
                <div className='max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center'>
                    <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 text-slate-500 mb-4'>
                        <FiPackage size={26} />
                    </div>
                    <h1 className='text-2xl font-semibold text-slate-800'>Order not found</h1>
                    <p className='mt-2 text-slate-500'>We could not find this order in your account. Please go back and choose a valid tracking link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full min-h-[70vh] px-4 md:px-8 py-8 bg-linear-to-br from-slate-50 via-cyan-50 to-blue-50'>
            <div className='max-w-6xl mx-auto space-y-6'>
                <section className='relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_50%)]' />
                    <div className='relative p-6 md:p-8'>
                        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                            <div>
                                <p className='text-xs md:text-sm uppercase tracking-[0.25em] text-slate-500'>Order Tracking</p>
                                <h1 className='text-2xl md:text-3xl font-bold text-slate-900 mt-1'>Order #{String(data?._id || '').slice(-8).toUpperCase()}</h1>
                                <p className='text-slate-600 mt-2 flex items-center gap-2'>
                                    <FiClock size={16} /> Placed on {createdAtText}
                                </p>
                            </div>
                            <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold ${getStatusTone()}`}>
                                {orderStatus}
                            </div>
                        </div>

                        <p className='text-slate-600 mt-4'>{getStatusMessage()}</p>

                        <div className='mt-6'>
                            <div className='w-full h-2.5 rounded-full bg-slate-200 overflow-hidden'>
                                <div
                                    className='h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-600 transition-all duration-700 ease-out'
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className='mt-4 grid grid-cols-2 sm:grid-cols-6 gap-3'>
                                {steps.map((step, index) => {
                                    const isDone = index <= activeStep;
                                    return (
                                        <div
                                            key={step.key}
                                            className={`rounded-2xl border p-3 transition-all ${isDone
                                                ? 'border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-500'
                                                }`}
                                        >
                                            <div className='flex items-center gap-2 text-sm font-medium'>
                                                {step.icon}
                                                <span>{step.label}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    <div className='lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6'>
                        <h2 className='text-lg font-semibold text-slate-800 mb-4'>Items in this order</h2>
                        <div className='space-y-3'>
                            {(data?.cart || []).map((item, index) => {
                                const quantity = Number(item?.qty || 1);
                                const unitPrice = Number(item?.discountPrice || item?.price || 0);
                                const lineTotal = quantity * unitPrice;

                                return (
                                    <div
                                        key={`${item?._id || item?.product || 'item'}-${index}`}
                                        className='rounded-2xl border border-slate-200 p-4 hover:border-cyan-200 hover:bg-cyan-50/40 transition-colors'
                                    >
                                        <div className='flex items-start justify-between gap-4'>
                                            <div>
                                                <p className='text-slate-900 font-medium'>{item?.name || 'Product item'}</p>
                                                <p className='text-sm text-slate-500 mt-1'>Qty: {quantity}</p>
                                            </div>
                                            <p className='text-slate-900 font-semibold'>{currencyFormatter.format(lineTotal)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className='space-y-6'>
                        <div className='bg-white rounded-3xl border border-slate-200 shadow-sm p-6'>
                            <h2 className='text-lg font-semibold text-slate-800 mb-4'>Order Summary</h2>
                            <div className='space-y-3 text-sm'>
                                <div className='flex items-center justify-between text-slate-600'>
                                    <span>Items</span>
                                    <span>{itemsCount}</span>
                                </div>
                                <div className='flex items-center justify-between text-slate-600'>
                                    <span>Subtotal</span>
                                    <span>{currencyFormatter.format(calculatedSubtotal)}</span>
                                </div>
                                <div className='border-t border-slate-200 pt-3 flex items-center justify-between text-slate-900 font-semibold'>
                                    <span>Total</span>
                                    <span>{currencyFormatter.format(orderTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white rounded-3xl border border-slate-200 shadow-sm p-6'>
                            <h2 className='text-lg font-semibold text-slate-800 mb-4'>Shipping & Payment</h2>
                            <div className='space-y-3 text-sm'>
                                <p className='text-slate-700 flex items-start gap-2'>
                                    <FiMapPin className='mt-0.5 text-slate-500' />
                                    <span>
                                        {data?.shippingAddress?.address1 || data?.shippingAddress?.address || 'Address not available'}
                                        {data?.shippingAddress?.city ? `, ${data.shippingAddress.city}` : ''}
                                        {data?.shippingAddress?.zipCode ? ` ${data.shippingAddress.zipCode}` : ''}
                                    </span>
                                </p>
                                <p className='text-slate-700 flex items-center gap-2'>
                                    <BsCreditCard2Front className='text-slate-500' />
                                    <span>Payment: {data?.paymentInfo?.type || 'Online payment'}</span>
                                </p>
                                <p className='text-slate-700 flex items-center gap-2'>
                                    <BsCheckCircleFill className='text-slate-500' />
                                    <span>Payment status: {data?.paymentInfo?.status || 'pending'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default TrackOrder;