import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../../../redux/actions/product";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard.jsx";

const FeaturedProduct = () => {
    const dispatch = useDispatch();
    const { products } = useSelector((state) => state.product);

    useEffect(() => {
        dispatch(getAllProducts());
    }, [dispatch]);

    return (
        <div>
            <div className={`${styles.section} mt-10`}>
                <div className={`${styles.heading}`}>
                    <h1>Featured Products</h1>
                </div>

                <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 border-0">
                    {products?.map((i, index) => (
                        <ProductCard key={index} data={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturedProduct;
