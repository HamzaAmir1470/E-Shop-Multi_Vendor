import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../../../redux/actions/product";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard.jsx";
import { AiOutlineShopping } from "react-icons/ai";

const FeaturedProduct = () => {
    const dispatch = useDispatch();
    const { products, isLoading } = useSelector((state) => state.product);

    useEffect(() => {
        dispatch(getAllProducts());
    }, [dispatch]);

    // Show loading state
    if (isLoading) {
        return (
            <div className={`${styles.section} mt-10`}>
                <div className={`${styles.heading}`}>
                    <h1>Featured Products</h1>
                </div>
                <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Show message when no products
    if (!products || products.length === 0) {
        return (
            <div className={`${styles.section} mt-10`}>
                <div className={`${styles.heading}`}>
                    <h1>Featured Products</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <AiOutlineShopping className="text-3xl sm:text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                        No Products Available
                    </h3>
                    <p className="text-sm text-gray-500 text-center max-w-md">
                        There are no featured products at the moment. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.section} mt-10`}>
            <div className={`${styles.heading}`}>
                <h1>Featured Products</h1>
            </div>

            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
                {products?.map((i, index) => (
                    <ProductCard key={i._id || index} data={i} />
                ))}
            </div>
        </div>
    );
};

export default FeaturedProduct;