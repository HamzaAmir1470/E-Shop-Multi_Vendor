import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from '../../styles/styles'
import { AiOutlineShoppingCart, AiOutlineHeart, AiFillHeart, AiOutlineMessage } from 'react-icons/ai'
import { backend_url } from '../../server.js'
import { server } from '../../server.js'
import { getAllProductsShop } from '../../redux/actions/product.js'
import { useDispatch, useSelector } from 'react-redux'
import { addToWishlist, removeFromWishlist } from '../../redux/actions/wishlist.js'
import { addToCart } from '../../redux/actions/cart.js'
import { toast } from 'react-toastify'
import axios from 'axios'

const getUserAvatarUrl = (user) => {
    const avatarValue = user?.avatar

    if (!avatarValue) {
        return `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user?.name || 'User')}`
    }

    if (typeof avatarValue === 'string') {
        return avatarValue.startsWith('http') ? avatarValue : `${backend_url}${avatarValue}`
    }

    if (typeof avatarValue === 'object' && avatarValue.url) {
        return avatarValue.url.startsWith('http') ? avatarValue.url : `${backend_url}${avatarValue.url}`
    }

    return `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user?.name || 'User')}`
}

const ReviewsModal = ({ reviews, onClose }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        const t = setTimeout(() => setVisible(true), 10)
        return () => {
            clearTimeout(t)
            document.body.style.overflow = 'unset'
        }
    }, [])

    const handleClose = () => {
        setVisible(false)
        setTimeout(() => onClose && onClose(), 220)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm transition-opacity duration-300" onClick={handleClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl transform transition-all duration-200 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/40">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <h3 className="text-xl font-semibold text-gray-800">All Reviews ({reviews.length})</h3>
                        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="overflow-y-auto mt-4 space-y-4 max-h-[calc(80vh-80px)]">
                        {reviews.map((review, index) => (
                            <div key={review._id || index} className="flex items-start p-4 bg-gray-50 rounded-xl">
                                {/* 🛠️ Fix 1: Reviewer Avatar resolution */}
                                <img
                                    src={getUserAvatarUrl(review?.user || review)}
                                    alt={review.user?.name || review.name}
                                    className='w-12 h-12 rounded-full object-cover mr-4'
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(review.user?.name || review.name || 'User')}` }}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h5 className='font-semibold text-gray-800'>{review.user?.name || review.name}</h5>
                                        {review.createdAt && <span className='text-xs text-gray-400'>{new Date(review.createdAt).toLocaleDateString()}</span>}
                                    </div>
                                    {(review.rating || review.ratings) && (
                                        <div className='flex items-center mb-2'>
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < (review.rating || review.ratings) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    )}
                                    <p className='text-gray-600 leading-relaxed'>{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const ProductDetails = ({ data }) => {
    const { wishlist } = useSelector((state) => state.wishlist)
    const { products } = useSelector((state) => state.product)
    const { cart } = useSelector((state) => state.cart)
    const { user, isAuthenticated } = useSelector((state) => state.user)
    const [count, setCount] = useState(1)
    const [click, setClick] = useState(false)
    const [select, setSelect] = useState(0)
    const [shopInfo, setShopInfo] = useState(null)

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const shopId = data?.shopId || data?.shop?._id
console.log(data)
    useEffect(() => {
        if (shopId) {
            dispatch(getAllProductsShop(shopId))
        }
    }, [dispatch, shopId])

    useEffect(() => {
        if (!shopId) {
            setShopInfo(null)
            return
        }

        let cancelled = false
        const loadShopInfo = async () => {
            try {
                const res = await axios.get(`${server}/shop/get-shop-info/${shopId}`)
                if (!cancelled) {
                    setShopInfo(res.data.shop || null)
                }
            } catch (error) {
                if (!cancelled) {
                    setShopInfo(data?.shop || null)
                }
            }
        }
        loadShopInfo()
        return () => { cancelled = true }
    }, [data?.shop, shopId])

    const shop = shopInfo || data?.shop

    useEffect(() => {
        if (wishlist && wishlist.find((i) => i._id === data?._id)) {
            setClick(true)
        } else {
            setClick(false)
        }
    }, [wishlist, data?._id])

    const avgRating = data?.reviews && data.reviews.length > 0
        ? (data.reviews.reduce((acc, r) => acc + (r.rating || r.ratings || 0), 0) / data.reviews.length).toFixed(1)
        : null

    const handleAddToCart = (e, id) => {
        e?.stopPropagation()
        const isItemExist = cart?.find((item) => item._id === id)
        if (isItemExist) {
            toast.error('Item already in cart!')
            return
        }
        if (data.stock < count) {
            toast.error(`Only ${data.stock} items available!`)
            return
        }
        const cartData = { ...data, qty: count }
        dispatch(addToCart(cartData))
        toast.success(`Added ${count} item(s) to cart!`)
    }

    const toggleWishlistHandler = (e, data) => {
        e?.stopPropagation()
        if (click) {
            setClick(false)
            dispatch(removeFromWishlist(data))
            toast.success('Item removed from wishlist!')
        } else {
            setClick(true)
            dispatch(addToWishlist(data))
            toast.success('Item added to wishlist!')
        }
    }

    const decrease = (e) => { e?.stopPropagation(); setCount((prev) => (prev > 1 ? prev - 1 : 1)) }
    const increase = (e) => { e?.stopPropagation(); setCount((prev) => prev + 1) }

    const handleMessageSubmit = async (e) => {
        e?.stopPropagation()
        if (isAuthenticated) {
            const groupTitle = data._id + user._id;
            const userId = user._id;
            const sellerId = data.shop._id;

            await axios.post(`${server}/conversation/create-new-conversation`, {
                groupTitle, userId, sellerId
            }, { withCredentials: true }).then((res) => {
                if (res.data.success) {
                    navigate(`/conversation/${res.data?.conversation._id}`)
                }
            }).catch((error) => {
                toast.error(error.response?.data?.message || 'Failed to create conversation')
            })
        } else {
            navigate('/login')
        }
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-500">Loading product details...</p>
            </div>
        )
    }

    // Determine the current primary image source URL
    const activeImageObject = data.images?.[select] || data.images?.[0];
    const mainImageUrl = activeImageObject?.url || (typeof activeImageObject === 'string' ? `${backend_url}${activeImageObject}` : '');

    // Determine shop avatar image source URL 
    const shopAvatarUrl = data.shop?.avatar?.url || (typeof data.shop?.avatar === 'string' ? `${backend_url}${data.shop.avatar}` : '');
    
    return (
        <div className="bg-white">
            {data && (
                <div className={`${styles.section} w-full py-8`}>
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="w-full lg:mt-0 sm:mt-15 flex flex-col items-center">
                            <div className="relative w-full max-w-[480px] group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200/50 via-purple-200/50 to-pink-200/50 animate-pulse" />
                                    <div className="relative z-10 bg-white/30 backdrop-blur-md rounded-xl p-4 shadow-2xl">
                                        {/* 🛠️ Fix 2: Main Featured Display Image */}
                                        <img
                                            src={mainImageUrl}
                                            alt={data.name}
                                            className="w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/30 rounded-full blur-3xl" />
                                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl" />
                                </div>
                            </div>

                            {data.images && data.images.length > 0 && (
                                <div className="mt-6 ml-25 grid grid-cols-4 sm:grid-cols-6 gap-3">
                                    {data.images.map((img, i) => {
                                        // 🛠️ Fix 3: Lower Thumbnails Loop Resolution
                                        const thumbnailUrl = img?.url || (typeof img === 'string' ? `${backend_url}${img}` : '');
                                        return (
                                            <div key={i} className={`cursor-pointer p-1 rounded-lg border transition-all duration-300 transform ${select === i ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105' : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'}`} onClick={(e) => { e.stopPropagation(); setSelect(i) }}>
                                                <img src={thumbnailUrl} className="h-20 w-20 object-cover rounded-md" alt={`${data.name} thumbnail ${i + 1}`} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{data.name}</h1>

                            <div className="mt-3 flex items-baseline gap-4">
                                <p className="text-2xl md:text-3xl font-bold text-gray-900">${data.discountPrice || data.originalPrice || '0'}</p>
                                {data.originalPrice && data.discountPrice && <span className="text-sm text-gray-400 line-through">${data.originalPrice}</span>}
                                {avgRating && <span className="ml-auto text-sm text-gray-600">{avgRating} • {data.reviews?.length || 0} reviews</span>}
                            </div>

                            <p className="text-gray-600 leading-relaxed text-justify mt-4">{data.description || 'No description available.'}</p>

                            <div className="flex items-center gap-4 mt-4">
                                <button onClick={decrease} className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">−</button>
                                <span className="text-lg font-semibold">{count}</span>
                                <button onClick={increase} className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">+</button>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-4">
                                <button onClick={(e) => handleAddToCart(e, data._id)} className="flex items-center bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-xl shadow-md hover:from-green-700 transition-colors"><AiOutlineShoppingCart className="mr-2 text-xl" />Add to Cart</button>
                                <button onClick={(e) => toggleWishlistHandler(e, data)} className={`flex items-center px-5 py-3 rounded-xl shadow-sm transition-colors border ${click ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-200 hover:shadow-md'}`}>{click ? <AiFillHeart className="mr-2 text-white text-xl" /> : <AiOutlineHeart className="mr-2 text-gray-700 text-xl" />}{click ? 'Wishlisted' : 'Add to Wishlist'}</button>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-4">
                                <span className="px-3 py-1 bg-gray-100 text-sm rounded-full text-gray-700">{data.category || 'General'}</span>
                                <span className={`px-3 py-1 text-sm rounded-full ${data.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{data.stock > 0 ? `${data.stock} in stock` : 'Out of stock'}</span>
                                {data.sold && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full">{data.sold} sold</span>}
                            </div>

                            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 rounded-lg ${styles.card}`}>
                                <Link to={`/shop/preview/${shop?._id}`} onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                        {/* 🛠️ Fix 4: Seller Card Avatar */}
                                        <img src={shopAvatarUrl} className="w-14 h-14 rounded-full object-cover" alt={shop?.name} />
                                        <div>
                                            <h3 className={`${styles.shop_name} text-xl font-semibold`}>{shop?.name}</h3>
                                            <h5 className="text-sm text-gray-600">({avgRating || '0'}/5) Ratings</h5>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-3">
                                    <button onClick={handleMessageSubmit} className="flex items-center bg-gray border border-black-200 text-indigo-600 px-4 py-2 rounded-lg hover:shadow-md transition-shadow font-medium">Message Seller <AiOutlineMessage className="ml-2 text-lg" /></button>
                                    <Link to={`/shop/preview/${shop?._id}`} className="inline-block"><button className={`${styles.button} rounded-lg h-[42px] px-4 text-white`}>Visit Shop</button></Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ProductDetailsInfo data={data} products={products} shop={shop} />
                </div>
            )}
        </div>
    )
}

const ProductDetailsInfo = ({ data, products, shop }) => {
    const [active, setActive] = useState(2)
    const [showFull, setShowFull] = useState(false)
    const [showAllReviews, setShowAllReviews] = useState(false)

    const reviews = data?.reviews || []
    const hasMoreThanTwo = reviews.length > 2
    const displayedReviews = hasMoreThanTwo ? reviews.slice(0, 2) : reviews
    const avgRating = data?.reviews && data.reviews.length > 0 ? (data.reviews.reduce((acc, r) => acc + (r.rating || r.ratings || 0), 0) / data.reviews.length).toFixed(1) : null

    // Determine shop avatar image source URL for the tab section
    const shopAvatarUrl = shop?.avatar?.url || (typeof shop?.avatar === 'string' ? `${backend_url}${shop.avatar}` : '');

    return (
        <div className="bg-[#f5f6fb] px-3 800px:px-10 py-2 rounded mx-15 mt-10">
            <div className="w-full flex justify-between border-b pt-10 pb-2">
                <div className="relative">
                    <h5 className={"text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"} onClick={(e) => { e.stopPropagation(); setActive(1) }}>Product Details</h5>
                    {active === 1 ? <div className={`${styles.active_indicator}`} /> : null}
                </div>
                <div className="relative">
                    <h5 className={"text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"} onClick={(e) => { e.stopPropagation(); setActive(2) }}>Product Reviews</h5>
                    {active === 2 ? <div className={`${styles.active_indicator}`} /> : null}
                </div>
                <div className="relative">
                    <h5 className={"text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"} onClick={(e) => { e.stopPropagation(); setActive(3) }}>Seller Information</h5>
                    {active === 3 ? <div className={`${styles.active_indicator}`} /> : null}
                </div>
            </div>

            {active === 1 && (
                <div className="py-2 pb-10">
                    <p className={`text-[18px] leading-8 whitespace-pre-line overflow-hidden ${showFull ? 'line-clamp-none' : 'line-clamp-3'} transition-all duration-300`}>{data.description || 'No description available.'}</p>
                    {data.description && data.description.length > 200 && (
                        <button onClick={(e) => { e.stopPropagation(); setShowFull(!showFull) }} className="mt-2 text-blue-600 font-medium hover:underline">{showFull ? 'Show less' : 'Read more'}</button>
                    )}
                </div>
            )}

            {active === 2 && (
                <div className='w-full justify-center min-h-[40vh] flex items-center'>
                    {reviews && reviews.length > 0 ? (
                        <div className='w-full max-w-4xl mx-auto'>
                            <div className='mb-6 pb-2 border-b border-gray-200'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-4'>
                                        <div className='flex items-center gap-1'>
                                            <span className='text-2xl font-bold text-gray-900'>{avgRating || '—'}</span>
                                            <div className='flex items-center'>
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`w-4 h-4 ${i < Math.round(avgRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='text-sm text-gray-500'>Based on {data.reviews?.length || 0} reviews</div>
                                    </div>
                                    <div><button onClick={() => setShowAllReviews(true)} className='text-sm text-indigo-600 hover:underline'>See all reviews</button></div>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                {displayedReviews.map((review, index) => (
                                    <div key={review._id || index} className='w-full flex items-start p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100'>
                                        {/* 🛠Header Fix 5: Review Tab User Avatar layout */}
                                        <img
                                            src={getUserAvatarUrl(review?.user || review)}
                                            alt={review.user?.name || review.name}
                                            className='w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-gray-100'
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(review.user?.name || review.name || 'User')}` }}
                                        />
                                        <div className='flex-1'>
                                            <div className='flex items-center justify-between mb-1'>
                                                <h5 className='font-semibold text-gray-800'>{review.user?.name || review.name}</h5>
                                                {review.createdAt && <span className='text-xs text-gray-400'>{new Date(review.createdAt).toLocaleDateString()}</span>}
                                            </div>
                                            {(review.rating || review.ratings) && (
                                                <div className='flex items-center mb-2'>
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-4 h-4 ${i < (review.rating || review.ratings) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    ))}
                                                </div>
                                            )}
                                            <p className='text-gray-600 leading-relaxed'>{review.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {hasMoreThanTwo && (
                                <div className='mt-6 text-center'>
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllReviews(true) }} type="button" className='px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium'>View All {reviews.length} Reviews</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='text-center py-12 px-4'>
                            <div className='mb-4'>
                                <svg className='w-16 h-16 mx-auto text-gray-300' fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                            </div>
                            <p className="text-gray-500 text-lg">No Reviews Yet!</p>
                            <p className="text-gray-400 text-sm mt-2">Be the first to share your experience</p>
                        </div>
                    )}
                </div>
            )}

            {active === 3 && (
                <div className="w-full p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Link to={`/shop/preview/${shop?._id}`} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                {/* 🛠️ Fix 6: Seller Tab Information Block Avatar */}
                                <img src={shopAvatarUrl} className="w-14 h-14 rounded-full object-cover" alt={shop?.name}  />
                                <div>
                                    <h3 className={`${styles.shop_name} text-xl font-semibold`}>{shop?.name}</h3>
                                    <h5 className="text-sm text-gray-600">({avgRating || '0'}/5) Ratings</h5>
                                </div>
                            </div>
                        </Link>

                        <p className="text-gray-700 leading-relaxed">{shop?.description || 'Discover the perfect blend of quality and style with our premium product. Carefully crafted to meet your everyday needs, it delivers exceptional performance while maintaining a sleek, modern design.'}</p>
                    </div>

                    <div className="flex flex-col justify-start items-start lg:items-end space-y-4">
                        <div className="space-y-3 text-gray-800 w-full lg:w-auto">
                            <h5 className="font-bold">Joined on: <span className="font-medium text-gray-700">{shop?.createdAt ? shop.createdAt.slice(0, 10) : 'N/A'}</span></h5>
                            <h5 className="font-semibold">Total Products: <span className="font-medium">{products?.length || 0}</span></h5>
                            <h5 className="font-semibold">Total Reviews: <span className="font-medium">{reviews?.length || 0}</span></h5>
                        </div>
                        <div className='pr-10'>
                            <Link to={`/shop/preview/${shop?._id}`} onClick={(e) => e.stopPropagation()}>
                                <button className={`${styles.button} rounded-lg h-[42px] px-5`}><span className="text-white font-medium">Visit Shop</span></button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {showAllReviews && <ReviewsModal reviews={reviews} onClose={() => setShowAllReviews(false)} />}
        </div>
    )
}

export default ProductDetails