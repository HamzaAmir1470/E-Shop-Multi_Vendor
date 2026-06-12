import React, { useMemo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Layout/Header";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import styles from "../styles/styles";
import Footer from "../components/Layout/Footer";
import { getAllProducts } from "../redux/actions/product";
import { AiOutlineShopping, AiOutlineReload, AiOutlineFire } from "react-icons/ai";

export default function BestSellingPage() {
    const dispatch = useDispatch();
    const { products, isLoading } = useSelector((state) => state.product);
    const [sortedProducts, setSortedProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Fetch products if not already loaded
        if (!products || products.length === 0) {
            dispatch(getAllProducts());
        }
    }, [dispatch, products]);

    // Sort products by total_sell
    useEffect(() => {
        if (products && products.length > 0) {
            try {
                const sorted = [...products].sort((a, b) =>
                    (b.sold_out || b.total_sell || 0) - (a.sold_out || a.total_sell || 0)
                );
                setSortedProducts(sorted);
                setError(null);
            } catch (err) {
                setError("Error sorting products");
                console.error(err);
            }
        } else if (products && products.length === 0) {
            setSortedProducts([]);
        }
    }, [products]);

    const handleRefresh = async () => {
        try {
            await dispatch(getAllProducts());
        } catch (err) {
            setError("Failed to refresh products");
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header activeHeading={2} />
                <div className="py-10">
                    <div className={`${styles.section}`}>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Best Selling Products
                            </h1>
                            <p className="text-gray-500 mt-2">Loading the hottest items...</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mb-12 animate-fadeIn">
                            {[...Array(10)].map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                                    <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="mt-2 h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header activeHeading={2} />
                <div className="py-10">
                    <div className={`${styles.section}`}>
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AiOutlineShopping className="text-3xl sm:text-4xl text-red-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                                Error Loading Products
                            </h3>
                            <p className="text-sm text-gray-500 text-center max-w-md mb-6">
                                {error}
                            </p>
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <AiOutlineReload className="text-lg" />
                                <span>Try Again</span>
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // No products state
    if (!sortedProducts || sortedProducts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header activeHeading={2} />
                <div className="py-10">
                    <div className={`${styles.section}`}>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Best Selling Products
                            </h1>
                        </div>
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <AiOutlineShopping className="text-3xl sm:text-4xl text-gray-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                                No Products Available
                            </h3>
                            <p className="text-sm text-gray-500 text-center max-w-md">
                                There are no products available at the moment. Please check back later!
                            </p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header activeHeading={2} />

            <div className="py-10">
                <div className={`${styles.section}`}>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mb-12 animate-fadeIn">
                        {sortedProducts.map((item, index) => (
                            <ProductCard key={item._id || item.id || index} data={item} />
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}