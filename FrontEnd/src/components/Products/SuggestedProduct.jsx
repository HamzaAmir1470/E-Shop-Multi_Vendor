import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCard";

const SuggestedProduct = ({ data }) => {

    const { products } = useSelector((state) => state.product);
    const [productData, setProductData] = useState(null);

    useEffect(() => {
        const currentCategory = data?.category?.trim().toLowerCase();
        const currentId = data?._id;

        const relatedByCategory = products.filter((item) => {
            const itemCategory = item?.category?.trim().toLowerCase();
            return item?._id !== currentId && itemCategory && itemCategory === currentCategory;
        });

        if (relatedByCategory.length > 0) {
            setProductData(relatedByCategory);
            return;
        }

        const fallbackProducts = products.filter((item) => item?._id !== currentId);
        setProductData(fallbackProducts);
    }, [products, data]);

    return (
        <div>
            {data && productData?.length ? (
                <div className={`p-4 ${styles.section}`}>
                    <h2
                        className={`${styles.heading} text-[25px] font-[500] border-b mb-5`}
                    >
                        Related Product
                    </h2>

                    <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
                        {productData.map((item, index) => (
                            <ProductCard data={item} key={item?._id || index} />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default SuggestedProduct;